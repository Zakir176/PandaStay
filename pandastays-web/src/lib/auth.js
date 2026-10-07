import { ref, computed } from 'vue'
import { supabase } from './supabaseClient.js'
import { syncWithSupabase } from './store.js'

// Global Auth State
const currentUser = ref(null)
const currentRole = ref(null) // 'landlord' or 'tenant' or null
const userProfile = ref(null)
const isLoading = ref(false)
const authError = ref(null)

// Default pre-seeded test accounts for development / testing without cloud email rate-limiting
const DEFAULT_TEST_ACCOUNTS = [
  {
    id: '11111111-0000-4000-8000-000000000001',
    email: 'landlord@pandastays.zm',
    password: 'password123',
    name: 'Mwamba Kaunda',
    phone: '+260 97 7123456',
    role: 'landlord'
  },
  {
    id: '11111111-0000-4000-8000-000000000002',
    email: 'mukuba@pandastays.zm',
    password: 'password123',
    name: 'Mwamba Kaunda',
    phone: '+260 97 7123456',
    role: 'landlord'
  },
  {
    id: '55555555-0000-4000-8000-000000000001',
    email: 'tenant@pandastays.zm',
    password: 'password123',
    name: 'John Phiri',
    phone: '+260 97 1122334',
    bed_label: 'Bed 101-A (Window)',
    role: 'tenant'
  },
  {
    id: '55555555-0000-4000-8000-000000000002',
    email: 'john.phiri@unza.zm',
    password: 'password123',
    name: 'John Phiri',
    phone: '+260 97 1122334',
    bed_label: 'Bed 101-A (Window)',
    role: 'tenant'
  }
]

const inMemoryAccounts = [...DEFAULT_TEST_ACCOUNTS]

const getLocalAccounts = () => {
  if (typeof window === 'undefined' || !window.localStorage) return inMemoryAccounts
  try {
    const stored = JSON.parse(localStorage.getItem('pandastays_local_accounts') || '[]')
    return [...inMemoryAccounts, ...stored]
  } catch {
    return inMemoryAccounts
  }
}

const saveLocalAccount = (acc) => {
  const existingIdx = inMemoryAccounts.findIndex(a => a.email.toLowerCase() === acc.email.toLowerCase())
  if (existingIdx >= 0) {
    inMemoryAccounts[existingIdx] = acc
  } else {
    inMemoryAccounts.push(acc)
  }

  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    const existing = JSON.parse(localStorage.getItem('pandastays_local_accounts') || '[]')
    const updated = existing.filter(a => a.email.toLowerCase() !== acc.email.toLowerCase())
    updated.push(acc)
    localStorage.setItem('pandastays_local_accounts', JSON.stringify(updated))
  } catch (e) {
    console.warn('Could not save local account:', e)
  }
}

const getActiveSession = () => {
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    return JSON.parse(localStorage.getItem('pandastays_active_session') || 'null')
  } catch {
    return null
  }
}

const saveActiveSession = (user, profile, role) => {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    localStorage.setItem('pandastays_active_session', JSON.stringify({ user, profile, role }))
  } catch (e) {
    console.warn('Could not save active session:', e)
  }
}

const clearActiveSession = () => {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    localStorage.removeItem('pandastays_active_session')
  } catch {}
}

let authInitPromise = null

// Initialize session and listener
export const initAuth = () => {
  if (!authInitPromise) {
    authInitPromise = (async () => {
      try {
        isLoading.value = true
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session?.user) {
          currentUser.value = session.user
          await loadProfile(session.user)
          saveActiveSession(currentUser.value, userProfile.value, currentRole.value)
        } else {
          // Check saved local session fallback
          const savedSession = getActiveSession()
          if (savedSession?.user && savedSession?.role) {
            currentUser.value = savedSession.user
            currentRole.value = savedSession.role
            userProfile.value = savedSession.profile
          } else {
            currentUser.value = null
            currentRole.value = null
            userProfile.value = null
          }
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            currentUser.value = session.user
            await loadProfile(session.user)
            saveActiveSession(currentUser.value, userProfile.value, currentRole.value)
          } else {
            const savedSession = getActiveSession()
            if (!savedSession) {
              currentUser.value = null
              currentRole.value = null
              userProfile.value = null
            }
          }
          await syncWithSupabase()
        })
      } catch (err) {
        console.warn('Auth initialization warning:', err)
        const savedSession = getActiveSession()
        if (savedSession?.user && savedSession?.role) {
          currentUser.value = savedSession.user
          currentRole.value = savedSession.role
          userProfile.value = savedSession.profile
        }
      } finally {
        isLoading.value = false
      }
    })()
  }
  return authInitPromise
}

// Load profile from landlords or tenants table
const loadProfile = async (user) => {
  try {
    const role = user.user_metadata?.role || 'landlord'
    currentRole.value = role

    if (role === 'landlord') {
      const { data: landlord } = await supabase
        .from('landlords')
        .select('*')
        .eq('id', user.id)
        .single()

      if (landlord) {
        userProfile.value = { ...landlord, role: 'landlord' }
        return
      }
    } else {
      let tenant = null
      if (user.email) {
        const { data } = await supabase
          .from('tenants')
          .select('*')
          .ilike('email', user.email)
          .limit(1)
        if (data && data.length > 0) {
          tenant = data[0]
        }
      }

      if (tenant) {
        userProfile.value = { ...tenant, role: 'tenant' }
        return
      }
    }

    // Default fallback to metadata
    userProfile.value = {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email,
      phone: user.user_metadata?.phone || '+260 97 0000000',
      role: role
    }
  } catch (err) {
    console.warn('Error loading profile from DB:', err)
  }
}

export const useAuth = () => {
  const isAuthenticated = computed(() => Boolean(currentUser.value))

  // 1. Sign In with Email & Password
  const signInWithPassword = async (email, password) => {
    isLoading.value = true
    authError.value = null
    try {
      // Attempt Supabase cloud login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (!error && data?.user) {
        currentUser.value = data.user
        await loadProfile(data.user)
        saveActiveSession(currentUser.value, userProfile.value, currentRole.value)
        return { success: true, user: data.user }
      }
      throw error || new Error('Invalid login credentials')
    } catch (err) {
      // Check local registered accounts / default test accounts
      const allAccounts = getLocalAccounts()
      const match = allAccounts.find(a => 
        a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
      )
      if (match) {
        const localUser = {
          id: match.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          email: match.email,
          user_metadata: {
            name: match.name,
            phone: match.phone,
            role: match.role
          }
        }
        currentUser.value = localUser
        currentRole.value = match.role
        userProfile.value = {
          id: localUser.id,
          name: match.name,
          email: match.email,
          phone: match.phone,
          bed_label: match.bed_label || (match.role === 'tenant' ? 'Bed 101-A' : undefined),
          role: match.role
        }
        saveActiveSession(currentUser.value, userProfile.value, currentRole.value)
        return { success: true, user: localUser, isFallback: true }
      }

      authError.value = err.message || 'Invalid login credentials'
      return { success: false, error: authError.value }
    } finally {
      isLoading.value = false
    }
  }

  // 2. Sign Up with Email, Password & Role Metadata (with 429 rate-limit resilience)
  const signUp = async ({ email, password, name, phone, role = 'landlord', bedSpaceId = null }) => {
    isLoading.value = true
    authError.value = null
    try {
      let user = null
      let createdViaSupabase = false

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
              role
            }
          }
        })
        if (error) throw error
        if (data?.user) {
          user = data.user
          createdViaSupabase = true
        }
      } catch (cloudErr) {
        const isRateLimit = cloudErr.status === 429 || 
          cloudErr.code === 'over_email_send_rate_limit' || 
          cloudErr.message?.toLowerCase().includes('rate limit') ||
          cloudErr.message?.toLowerCase().includes('too many')

        if (isRateLimit) {
          console.warn('Supabase email rate limit encountered (429). Activating local authenticated session fallback.')
          user = {
            id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            email,
            user_metadata: { name, phone, role }
          }
        } else {
          throw cloudErr
        }
      }

      if (!user) {
        user = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          email,
          user_metadata: { name, phone, role }
        }
      }

      currentUser.value = user
      currentRole.value = role

      // Save to local accounts registry so user can re-login seamlessly
      saveLocalAccount({
        id: user.id,
        email,
        password,
        name,
        phone,
        role
      })

      // Attempt to link matching row in Supabase tables if reachable
      if (createdViaSupabase) {
        try {
          if (role === 'landlord') {
            await supabase.from('landlords').upsert({
              id: user.id,
              name: name,
              email: email,
              phone: phone,
              lenco_subaccount_id: `sub_${Date.now().toString().slice(-6)}`
            })
          } else {
            await supabase.from('tenants').insert({
              name: name,
              email: email,
              phone: phone || '+260 97 0000000'
            })
          }
        } catch (dbErr) {
          console.warn('Supabase table sync note:', dbErr.message)
        }
      }

      userProfile.value = { id: user.id, name, email, phone, role }
      saveActiveSession(currentUser.value, userProfile.value, currentRole.value)

      return { success: true, user, fallback: !createdViaSupabase }
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
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
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
      clearActiveSession()
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
