-- ==============================================================================
-- PandaStays Security Fixes — Review Round 4 Migration
-- Fixes: R4-1 (Table-level UPDATE revoke & column-level grants on landlords/tenants)
--        R4-4 (Add needs_review status to payment_status enum)
--        R4-7 (Harden tenants_landlord_insert policy)
--        R4-8 (Drop UNIQUE constraint on tenants.auth_user_id & multi-tenancy linking)
-- ==============================================================================

-- 1. R4-4: Add 'needs_review' to payment_status enum if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'payment_status' AND e.enumlabel = 'needs_review'
  ) THEN
    ALTER TYPE payment_status ADD VALUE 'needs_review';
  END IF;
END $$;

-- 2. R4-8: Drop UNIQUE constraint on tenants.auth_user_id
-- Allows the same student to have tenant records under multiple landlords
ALTER TABLE public.tenants
  DROP CONSTRAINT IF EXISTS tenants_auth_user_id_key;

-- 3. R4-1: Table-level REVOKE and column-level GRANT on landlords
-- A column-level REVOKE does not override table-level GRANT in Postgres.
REVOKE UPDATE ON public.landlords FROM anon, authenticated;
GRANT UPDATE (name, phone, whatsapp_reminder_days_before) ON public.landlords TO authenticated;

-- R4-1: Table-level REVOKE and column-level GRANT on tenants
-- Prevents clients from updating auth_user_id or email directly under tenants_update_own
REVOKE UPDATE ON public.tenants FROM anon, authenticated;
GRANT UPDATE (name, phone, id_number, date_of_birth, emergency_contact_name, emergency_contact_phone) ON public.tenants TO authenticated;

-- 4. R4-7: Harden tenants_landlord_insert policy
-- Restrict tenant insertion strictly to authenticated landlords
DROP POLICY IF EXISTS "tenants_landlord_insert" ON public.tenants;
CREATE POLICY "tenants_landlord_insert" ON public.tenants FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.landlords WHERE id = auth.uid()));

-- 5. R4-8: Multi-tenant trigger and profile link helper
-- Update link_tenant_on_confirm trigger function to link all matching unlinked records
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

-- Helper callable by authenticated tenant on login to link any newly added tenant records
CREATE OR REPLACE FUNCTION public.link_tenant_profile()
RETURNS void AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.jwt()->>'email' IS NOT NULL THEN
    UPDATE public.tenants
    SET auth_user_id = auth.uid()
    WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
      AND (auth_user_id IS NULL OR auth_user_id != auth.uid());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.link_tenant_profile() TO authenticated;
