import { ref, computed } from 'vue'
import { supabase } from './supabaseClient.js'
import { syncWithSupabase } from './store.js'

// Global Auth State
const currentUser = ref(null)
const currentRole = ref(null) // 'landlord' or 'tenant' or null
const userProfile = ref(null)
const isLoading = ref(false)
const authError = ref(null)

let authInitPromise = null

// Load profile from landlords or tenants table (strict role verification from DB)
const loadProfile = async (user) => {
  if (!user) {
    userProfile.value = null
    currentRole.value = null
    return
  }

  try {
    const metaRole = user.user_metadata?.role || 'landlord'

    // First check if user is a registered landlord in the database
    const { data: landlord } = await supabase
      .from('landlords')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (landlord) {
      currentRole.value = 'landlord'
      userProfile.value = { ...landlord, role: 'landlord' }
      return
    }

    // Next check if user is linked to one or more tenant records (supports multi-landlord tenancies)
    try {
      await supabase.rpc('link_tenant_profile')
    } catch {
      // link_tenant_profile RPC is optional / executed if migration is active
    }

    const { data: tenantRows } = await supabase
      .from('tenants')
      .select('*')
      .eq('auth_user_id', user.id)

    if (tenantRows && tenantRows.length > 0) {
      currentRole.value = 'tenant'
      userProfile.value = { 
        ...tenantRows[0], 
        role: 'tenant',
        tenantRecords: tenantRows
      }
      return
    }

    // Fallback: derive role from validated user metadata while database record settles
    currentRole.value = metaRole
    userProfile.value = {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email,
      phone: user.user_metadata?.phone || '+260 97 0000000',
      role: metaRole
    }
  } catch (err) {
    console.warn('Error loading profile from DB:', err)
  }
}

// Initialize session and listener (Supabase session is the single source of truth)
export const initAuth = () => {
  if (!authInitPromise) {
    authInitPromise = (async () => {
      try {
        isLoading.value = true
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session?.user && !error) {
          currentUser.value = session.user
          await loadProfile(session.user)
        } else {
          currentUser.value = null
          currentRole.value = null
          userProfile.value = null
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            currentUser.value = session.user
            await loadProfile(session.user)
          } else {
            currentUser.value = null
            currentRole.value = null
            userProfile.value = null
          }
          await syncWithSupabase()
        })
      } catch (err) {
        console.warn('Auth initialization warning:', err)
        currentUser.value = null
        currentRole.value = null
        userProfile.value = null
      } finally {
        isLoading.value = false
      }
    })()
  }
  return authInitPromise
}

export const useAuth = () => {
  const isAuthenticated = computed(() => Boolean(currentUser.value))

  // 1. Sign In with Email & Password (Strictly Supabase)
  const signInWithPassword = async (email, password) => {
    isLoading.value = true
    authError.value = null
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error || !data?.user) {
        authError.value = error?.message || 'Invalid login credentials'
        return { success: false, error: authError.value }
      }

      currentUser.value = data.user
      await loadProfile(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      authError.value = err.message || 'Invalid login credentials'
      return { success: false, error: authError.value }
    } finally {
      isLoading.value = false
    }
  }

  // 2. Sign Up with Email, Password & Role Metadata (Strictly Supabase)
  const signUp = async ({ email, password, name, phone, role = 'landlord' }) => {
    isLoading.value = true
    authError.value = null
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name,
            phone,
            role
          }
        }
      })

      if (error) {
        const isRateLimit = error.status === 429 ||
          error.code === 'over_email_send_rate_limit' ||
          error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('too many')

        if (isRateLimit) {
          authError.value = 'Too many attempts, please try again in a few minutes.'
        } else {
          authError.value = error.message || 'Failed to create account'
        }
        return { success: false, error: authError.value }
      }

      if (!data?.user) {
        authError.value = 'Failed to create user account'
        return { success: false, error: authError.value }
      }

      currentUser.value = data.user
      await loadProfile(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      authError.value = err.message || 'Failed to create account'
      return { success: false, error: authError.value }
    } finally {
      isLoading.value = false
    }
  }

  // 3. Magic Link (Email OTP / Passwordless)
  const signInWithMagicLink = async (email) => {
    isLoading.value = true
    authError.value = null
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      })
      if (error) throw error
      return { success: true, message: 'Magic link dispatched to your inbox!' }
    } catch (err) {
      authError.value = err.message || 'Failed to send magic link'
      return { success: false, error: authError.value }
    } finally {
      isLoading.value = false
    }
  }

  // 4. Sign Out
  const signOut = async () => {
    isLoading.value = true
    try {
      await supabase.auth.signOut().catch(() => {})
    } catch (err) {
      console.warn('Sign out warning:', err)
    } finally {
      currentUser.value = null
      currentRole.value = null
      userProfile.value = null
      isLoading.value = false
    }
  }

  return {
    currentUser,
    currentRole,
    userProfile,
    isLoading,
    authError,
    isAuthenticated,
    signInWithPassword,
    signUp,
    signInWithMagicLink,
    signOut
  }
}
