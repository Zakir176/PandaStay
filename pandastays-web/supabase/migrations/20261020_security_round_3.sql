-- ==============================================================================
-- PandaStays Security Fixes — Review Round 3 Migration
-- Fixes: C1 (Tenant account takeover), C3 (Server receipt verification),
--        H1 (Payments hardening & receipt sequence), M1 (Subaccount protection)
-- ==============================================================================

-- 1. C1 Fix 2: Tenant linking confirmation gate & search_path
CREATE OR REPLACE FUNCTION public.handle_new_landlord()
RETURNS TRIGGER AS $$
BEGIN
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'landlord') = 'landlord' THEN
    INSERT INTO public.landlords (id, name, email, phone)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.link_tenant_on_confirm()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.email_confirmed_at IS NULL)
     AND (NEW.raw_user_meta_data->>'role') = 'tenant' THEN
    UPDATE public.tenants SET auth_user_id = NEW.id
    WHERE LOWER(email) = LOWER(NEW.email) AND auth_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_tenant_on_confirm();

-- 2. C3: Add verification token to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS verification_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE;

-- 3. H1: Add unique constraint on gateway_reference and receipt sequence
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_gateway_reference_key;
ALTER TABLE payments
  ADD CONSTRAINT payments_gateway_reference_key UNIQUE (gateway_reference);

CREATE SEQUENCE IF NOT EXISTS receipt_seq;

ALTER TABLE payments
  ALTER COLUMN receipt_number SET DEFAULT
    'REC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('receipt_seq')::text, 6, '0');

-- 4. M1: Revoke column-level update on lenco_subaccount_id from public/client roles
REVOKE UPDATE (lenco_subaccount_id) ON landlords FROM anon, authenticated;
