<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../lib/auth'

const router = useRouter()
const { userProfile, signOut } = useAuth()

// user_metadata only picks which message is shown; it never grants access.
const isTenantHint = computed(() => userProfile.value?.pendingHint === 'tenant')

const handleSignOut = async () => {
  await signOut()
  router.push('/')
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-surface p-6">
    <section id="account-pending" class="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lg">
      <h1 class="text-2xl font-bold text-on-surface mb-3">Account pending</h1>
      <p v-if="isTenantHint" class="text-on-surface-variant mb-6">
        Your landlord hasn't added you yet. Once they add your email to a room, sign in again and your resident portal will appear.
      </p>
      <p v-else class="text-on-surface-variant mb-6">
        Setting up your landlord account… PandaStays will contact you once it is ready.
      </p>
      <p v-if="userProfile?.email" class="text-xs text-on-surface-variant mb-6">Signed in as {{ userProfile.email }}</p>
      <button id="pending-signout" class="px-5 py-2 rounded-full bg-primary text-on-primary font-semibold" @click="handleSignOut">
        Sign out
      </button>
    </section>
  </main>
</template>
