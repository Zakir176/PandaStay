import { ref, computed } from 'vue'
import { supabase } from './supabaseClient'

// Global Auth State
const currentUser = ref(null)
const currentRole = ref('landlord') // Default demo role: 'landlord' or 'tenant'
const userProfile = ref({
  name: 'Mwamba Kaunda',
  email: 'landlord@mukubahouse.zm',
  phone: '+260 97 7123456',
  role: 'landlord'
})
const isLoading = ref(false)
const authError = ref(null)

// Initialize session and listener
export const initAuth = async () => {
  try {
    isLoading.value = true
    const { data: { session }, error } = await supabase.auth.getSession()
    if (session?.user) {
      currentUser.value = session.user
      await loadProfile(session.user)
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        currentUser.value = session.user
        await loadProfile(session.user)
      } else {
        currentUser.value = null
        // fallback to default demo landlord
        if (currentRole.value === 'landlord') {
          userProfile.value = {
            name: 'Mwamba Kaunda',
            email: 'landlord@mukubahouse.zm',
            phone: '+260 97 7123456',
            role: 'landlord'
          }
        }
      }
    })
  } catch (err) {
    console.warn('Auth initialization warning:', err)
  } finally {
    isLoading.value = false
  }
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
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', user.id)
        .single()

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
  const isAuthenticated = computed(() => Boolean(currentUser.value || userProfile.value))

  // 1. Sign In with Email & Password
  const signInWithPassword = async (email, password) => {
    isLoading.value = true
    authError.value = null
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
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

  // 2. Sign Up with Email, Password & Role Metadata
  const signUp = async ({ email, password, name, phone, role = 'landlord', bedSpaceId = null }) => {
    isLoading.value = true
    authError.value = null
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

      const user = data.user
      currentUser.value = user
      currentRole.value = role

      // Create matching row in clean-slate database
      if (user) {
        if (role === 'landlord') {
          await supabase.from('landlords').insert({
            id: user.id,
            name: name,
            email: email,
            phone: phone,
            lenco_subaccount_id: `sub_${Date.now().toString().slice(-6)}`
          })
        } else {
          await supabase.from('tenants').insert({
            id: user.id,
            name: name,
            email: email,
            phone: phone
          })

          if (bedSpaceId) {
            await supabase.from('tenancies').insert({
              bed_space_id: bedSpaceId,
              tenant_id: user.id,
              rent_amount: 2500,
              billing_cycle: 'monthly',
              status: 'active'
            })
            await supabase.from('bed_spaces').update({ status: 'occupied' }).eq('id', bedSpaceId)
          }
        }
      }

      userProfile.value = { id: user?.id, name, email, phone, role }
      return { success: true, user }
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
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('Sign out warning:', err)
    } finally {
      currentUser.value = null
      currentRole.value = 'landlord'
      userProfile.value = {
        name: 'Guest User',
        email: 'guest@pandastays.zm',
        phone: '',
        role: 'guest'
      }
      isLoading.value = false
    }
  }

  // 5. Quick Demo Switch (Landlord vs Tenant)
  const switchDemoRole = (role, tenantData = null) => {
    currentRole.value = role
    if (role === 'landlord') {
      userProfile.value = {
        id: '11111111-0000-4000-8000-000000000001',
        name: 'Mwamba Kaunda',
        email: 'landlord@mukubahouse.zm',
        phone: '+260 97 7123456',
        role: 'landlord'
      }
    } else {
      userProfile.value = tenantData || {
        id: '55555555-0000-4000-8000-000000000001',
        name: 'John Phiri',
        email: 'john.phiri@unza.zm',
        phone: '+260 97 1122334',
        bed_label: 'Bed 101-A (Window)',
        role: 'tenant'
      }
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
    signOut,
    switchDemoRole
  }
}
