<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../lib/auth'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  initialRole: {
    type: String,
    default: 'landlord' // 'landlord' or 'tenant'
  }
})

const emit = defineEmits(['close', 'authSuccess'])
const router = useRouter()
const { signInWithPassword, signUp, signInWithMagicLink, isLoading, authError, currentRole } = useAuth()

const activeRole = ref(props.initialRole || 'landlord')
const authMode = ref('signin') // 'signin' or 'signup'
const authMethod = ref('password') // 'password' or 'magiclink'

// Keep activeRole synchronized with incoming prop whenever modal opens
watch(() => props.initialRole, (newRole) => {
  if (newRole) {
    activeRole.value = newRole
  }
}, { immediate: true })

watch(() => props.isOpen, (open) => {
  if (open && props.initialRole) {
    activeRole.value = props.initialRole
  }
})

const form = ref({
  name: '',
  email: '',
  phone: '+260 97 1234567',
  password: '',
  inviteCode: ''
})

const successMessage = ref('')

const handleClose = () => {
  successMessage.value = ''
  emit('close')
}

const handleSubmit = async () => {
  successMessage.value = ''

  if (authMethod.value === 'magiclink') {
    const res = await signInWithMagicLink(form.value.email)
    if (res.success) {
      successMessage.value = res.message || 'Check your email for the magic sign-in link!'
    }
    return
  }

  if (authMode.value === 'signin') {
    const res = await signInWithPassword(form.value.email, form.value.password)
    if (res.success) {
      // Determine destination strictly by verified profile role, falling back to selected tab
      const targetRole = currentRole.value || res.user?.user_metadata?.role || activeRole.value
      successMessage.value = `Welcome back! Redirecting to ${targetRole === 'tenant' ? 'Tenant Portal' : 'Landlord Dashboard'}...`
      setTimeout(() => {
        emit('authSuccess', res.user)
        handleClose()
        if (targetRole === 'tenant') {
          router.push('/tenant/portal')
        } else {
          router.push('/app')
        }
      }, 400)
    }
  } else {
    // Sign Up
    const res = await signUp({
      email: form.value.email,
      password: form.value.password,
      name: form.value.name,
      phone: form.value.phone,
      role: activeRole.value
    })

    if (res.success) {
      const targetRole = currentRole.value || res.user?.user_metadata?.role || activeRole.value
      successMessage.value = 'Account created successfully! Proceeding to portal...'
      setTimeout(() => {
        emit('authSuccess', res.user)
        handleClose()
        if (targetRole === 'tenant') {
          router.push('/tenant/portal')
        } else {
          router.push('/app')
        }
      }, 400)
    }
  }
}


</script>

<template>
  <div v-if="isOpen">
    <!-- Backdrop Overlay -->
    <div 
      class="fixed inset-0 bg-inverse-surface/50 backdrop-blur-xs z-50 transition-opacity"
      @click="handleClose"
    ></div>

    <!-- Modal Dialog -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        class="card-tight w-full max-w-md bg-surface-container-lowest p-6 shadow-2xl space-y-4 border border-outline relative animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between border-b border-outline-variant pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
              PS
            </div>
            <div>
              <h3 class="font-bold text-sm text-on-surface">PandaStays Authentication</h3>
              <p class="text-[10px] text-on-surface-variant">Multi-Landlord Zambian Student Housing SaaS</p>
            </div>
          </div>
          <button @click="handleClose" class="text-on-surface-variant hover:text-on-surface">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Role Toggle Tabs -->
        <div class="grid grid-cols-2 gap-2 bg-surface-container-low p-1 rounded-sm border border-outline-variant">
          <button 
            @click="activeRole = 'landlord'"
            class="py-1.5 px-3 text-xs font-semibold rounded-[3px] transition-colors flex items-center justify-center gap-1.5"
            :class="activeRole === 'landlord' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'"
          >
            <span class="material-symbols-outlined text-[16px]">real_estate_agent</span>
            <span>Landlord</span>
          </button>
          <button 
            @click="activeRole = 'tenant'"
            class="py-1.5 px-3 text-xs font-semibold rounded-[3px] transition-colors flex items-center justify-center gap-1.5"
            :class="activeRole === 'tenant' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'"
          >
            <span class="material-symbols-outlined text-[16px]">school</span>
            <span>Student Tenant</span>
          </button>
        </div>

        <!-- Mode Toggle: Sign In vs Sign Up -->
        <div class="flex items-center justify-between text-xs border-b border-outline-variant/60 pb-2">
          <div class="flex gap-4">
            <button 
              @click="authMode = 'signin'"
              class="font-semibold transition-colors pb-1 border-b-2"
              :class="authMode === 'signin' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'"
            >
              Sign In
            </button>
            <button 
              @click="authMode = 'signup'"
              class="font-semibold transition-colors pb-1 border-b-2"
              :class="authMode === 'signup' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'"
            >
              Create Account
            </button>
          </div>

          <!-- Method Toggle: Password vs Magic Link -->
          <div class="flex items-center gap-1 text-[11px] text-on-surface-variant">
            <button 
              @click="authMethod = authMethod === 'password' ? 'magiclink' : 'password'"
              class="text-primary hover:underline font-medium"
            >
              {{ authMethod === 'password' ? 'Use Magic Link' : 'Use Password' }}
            </button>
          </div>
        </div>

        <!-- Alert Banners -->
        <div 
          v-if="authError" 
          class="p-2.5 rounded-sm bg-error-container text-error text-xs font-medium border border-error/30 flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-[16px]">error</span>
          <span>{{ authError }}</span>
        </div>

        <div 
          v-if="successMessage" 
          class="p-2.5 rounded-sm bg-primary-container text-primary text-xs font-medium border border-primary/30 flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Auth Form -->
        <form @submit.prevent="handleSubmit" class="space-y-3 text-xs">
          <!-- Name (Sign Up only) -->
          <div v-if="authMode === 'signup'">
            <label class="block font-semibold text-on-surface-variant uppercase mb-1">Full Name</label>
            <input 
              v-model="form.name"
              type="text" 
              required
              :placeholder="activeRole === 'landlord' ? 'e.g. Mwamba Kaunda' : 'e.g. John Phiri'"
              class="w-full px-3 py-2 border border-outline rounded-sm bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block font-semibold text-on-surface-variant uppercase mb-1">Email Address</label>
            <input 
              v-model="form.email"
              type="email" 
              required
              placeholder="name@example.com"
              class="w-full px-3 py-2 border border-outline rounded-sm bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono"
            />
          </div>

          <!-- Phone (Sign Up only) -->
          <div v-if="authMode === 'signup'">
            <label class="block font-semibold text-on-surface-variant uppercase mb-1">Phone Number (WhatsApp)</label>
            <input 
              v-model="form.phone"
              type="text" 
              placeholder="+260 97 1234567"
              class="w-full px-3 py-2 border border-outline rounded-sm bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono"
            />
          </div>

          <!-- Password (if password method) -->
          <div v-if="authMethod === 'password'">
            <label class="block font-semibold text-on-surface-variant uppercase mb-1">Password</label>
            <input 
              v-model="form.password"
              type="password" 
              required
              placeholder="••••••••"
              class="w-full px-3 py-2 border border-outline rounded-sm bg-surface-container-low text-on-surface focus:border-primary focus:outline-none font-data-mono"
            />
          </div>

          <!-- Tenant Bed-Space Invite Link Note (if Tenant Sign Up) -->
          <div v-if="authMode === 'signup' && activeRole === 'tenant'" class="p-2.5 rounded-sm bg-surface-container-low border border-outline-variant/60 text-[11px] text-on-surface-variant">
            <span class="font-semibold text-primary">Boarding House Allocation:</span>
            <span> You will be prompted to enter your Landlord Bed-Space code or select an available room bed upon signup.</span>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="isLoading"
            class="w-full py-2.5 bg-primary text-on-primary font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            <span v-if="isLoading" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
            <span v-if="!isLoading">
              {{ authMethod === 'magiclink' ? 'Send Magic Sign-in Link' : (authMode === 'signin' ? 'Sign In to ' + (activeRole === 'landlord' ? 'Landlord Portal' : 'Tenant Portal') : 'Create ' + (activeRole === 'landlord' ? 'Landlord' : 'Tenant') + ' Account') }}
            </span>
          </button>
        </form>


      </div>
    </div>
  </div>
</template>
