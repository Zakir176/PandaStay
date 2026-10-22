-- ==============================================================================
-- Migration: Security Round 5
-- R5-4: link_tenant_profile() must only claim UNLINKED tenant rows.
--       Previously an extra "or linked to a different user" clause let any account
--       whose JWT email matched take over rows already linked to another auth user.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.link_tenant_profile()
RETURNS void AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.jwt()->>'email' IS NOT NULL THEN
    UPDATE public.tenants
    SET auth_user_id = auth.uid()
    WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
      AND auth_user_id IS NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.link_tenant_profile() TO authenticated;
