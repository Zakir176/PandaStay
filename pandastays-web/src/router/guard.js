/**
 * Pure route-guard decision logic (no Vue / Supabase imports so it is unit-testable).
 * Returns null to allow, or a vue-router location to redirect to.
 *
 * Role comes only from the database (see lib/auth.js). A null role means the
 * account has no landlord row and no tenant rows: it may not open /app or /tenant/*.
 */
export function resolveGuardRedirect({ requiresRole, isAuthenticated, currentRole, to }) {
  if (!requiresRole) {
    // Pending page is only meaningful for signed-in users without a role
    if (to?.name === 'AccountPending') {
      if (!isAuthenticated) return { path: '/', query: { auth_required: '1' } }
      if (currentRole === 'landlord') return { path: '/app' }
      if (currentRole === 'tenant') return { path: '/tenant/portal' }
    }
    return null
  }

  if (!isAuthenticated) {
    return { path: '/', query: { auth_required: '1' } }
  }

  if (!currentRole) {
    return { path: '/account-pending' }
  }

  if (requiresRole === 'landlord' && currentRole === 'tenant') {
    return { path: '/tenant/portal', query: { restricted: 'landlord_only' } }
  }

  if (requiresRole === 'tenant' && currentRole === 'landlord') {
    return { path: '/app', query: { restricted: 'tenant_only' } }
  }

  if (currentRole !== requiresRole) {
    return { path: '/account-pending' }
  }

  return null
}
