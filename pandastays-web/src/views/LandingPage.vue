<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isScrolled = ref(false)
const activeTestimonial = ref(0)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // Rotate testimonials
  setInterval(() => {
    activeTestimonial.value = (activeTestimonial.value + 1) % testimonials.length
  }, 4000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const features = [
  {
    icon: 'dashboard',
    title: 'Property Dashboard',
    desc: 'A birds-eye view of every room, bed, and tenant. Occupancy rates, rent status, and alerts — all live.',
    color: 'text-primary bg-primary/8'
  },
  {
    icon: 'payments',
    title: 'Mobile Money Collection',
    desc: 'Trigger MTN MoMo or Airtel Money STK push prompts directly from the app. Payments reconcile automatically.',
    color: 'text-primary-container bg-primary-container/10'
  },
  {
    icon: 'receipt_long',
    title: 'Financial Ledger',
    desc: 'Full transaction history with date and method filters. Export to PDF or Excel in one click.',
    color: 'text-tertiary-container bg-tertiary-container/10'
  },
  {
    icon: 'handyman',
    title: 'Maintenance Tracking',
    desc: 'Log and resolve repair tickets with urgency priorities. Track costs and resolution timelines.',
    color: 'text-primary bg-primary/8'
  },
  {
    icon: 'event_repeat',
    title: 'Semester & Lease Manager',
    desc: 'Manage lease renewals, vacation notices, and waitlists per academic term — stress-free.',
    color: 'text-primary-container bg-primary-container/10'
  },
  {
    icon: 'account_balance_wallet',
    title: 'Security Deposit Escrow',
    desc: 'Track deposits held per tenant, log damage deductions, and trigger mobile refunds instantly.',
    color: 'text-tertiary-container bg-tertiary-container/10'
  }
]

const stats = [
  { value: '500+', label: 'Properties Managed' },
  { value: 'ZMW 2M+', label: 'Rent Collected Monthly' },
  { value: '98%', label: 'Collection Rate' },
  { value: '< 2min', label: 'Average Payment Time' }
]

const testimonials = [
  {
    quote: "PandaStays eliminated my rent-chasing headaches. MoMo payments come in automatically and I see everything in one place.",
    name: "Mrs. Bwalya",
    role: "Landlord, Lusaka",
    initials: "MB"
  },
  {
    quote: "As a student, I get reminders and can pay my rent without leaving campus. The receipt comes instantly to my phone.",
    name: "Chileshe Mubanga",
    role: "Tenant, UNZA",
    initials: "CM"
  },
  {
    quote: "Tracking 30 rooms used to take me a whole afternoon. Now it's done before my morning coffee.",
    name: "Mr. Phiri",
    role: "Property Manager, Ndola",
    initials: "MP"
  }
]

const steps = [
  { step: '01', title: 'Add Your Property', desc: 'Register your hostel, rooms and beds in under 5 minutes.' },
  { step: '02', title: 'Onboard Tenants', desc: 'Create tenant profiles with student IDs, room assignments and lease dates.' },
  { step: '03', title: 'Collect Rent via MoMo', desc: "One tap triggers an STK push to the tenant's phone. Funds land in your account." },
  { step: '04', title: 'Track Everything', desc: 'Financials, maintenance, deposits and leases — all in your dashboard.' }
]
</script>

<template>
  <div class="min-h-screen bg-[#0b1c30] text-white" style="font-family: 'Inter', sans-serif;">
    <!-- ─── NAVBAR ─── -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-16"
      :class="isScrolled ? 'bg-[#0b1c30]/95 backdrop-blur-md border-b border-white/10 py-3' : 'py-5'"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-[#006c49] flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-[20px]">real_estate_agent</span>
          </div>
          <span class="text-white font-bold text-lg tracking-tight">PandaStays</span>
        </div>

        <div class="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#features" class="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" class="hover:text-white transition-colors">How It Works</a>
          <a href="#testimonials" class="hover:text-white transition-colors">Testimonials</a>
        </div>

        <div class="flex items-center gap-3">
          <router-link
            to="/"
            class="text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            Sign In
          </router-link>
          <router-link
            to="/"
            class="px-4 py-2 bg-primary hover:bg-on-primary-fixed-variant text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Get Started
          </router-link>
        </div>
      </div>
    </nav>

    <!-- ─── HERO ─── -->
    <section class="relative overflow-hidden min-h-screen flex items-center">
      <!-- Animated Background Grid -->
      <div class="absolute inset-0 opacity-[0.04]" style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 50px 50px;"></div>

      <!-- Glows -->
      <div class="absolute top-1/4 left-1/3 w-125 h-125 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-100 h-100 bg-primary-container/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="relative max-w-7xl mx-auto px-6 md:px-16 pt-28 pb-16 w-full">
        <div class="max-w-3xl">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-[#006c49]/20 border border-[#006c49]/40 rounded-full text-[#4edea3] text-xs font-bold uppercase tracking-widest mb-8">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
            Built for Zambian Landlords
          </div>

          <h1 class="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Student Housing
            <span class="text-transparent bg-clip-text" style="background-image: linear-gradient(135deg, #4edea3 0%, #10b981 50%, #006c49 100%);">
              Management
            </span>
            Made Simple
          </h1>

          <p class="text-white/60 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
            Collect rent via MTN MoMo & Airtel Money. Track occupancy, maintenance, deposits and leases — all from one powerful dashboard. No spreadsheets. No chasing tenants.
          </p>

          <div class="flex flex-wrap gap-4 mb-16">
            <router-link
              to="/"
              class="flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-on-primary-fixed-variant text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/40"
            >
              <span class="material-symbols-outlined text-[20px]">rocket_launch</span>
              Start Managing Free
            </router-link>
            <a
              href="#how-it-works"
              class="flex items-center gap-2 px-6 py-3.5 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium rounded-xl transition-all"
            >
              <span class="material-symbols-outlined text-[20px]">play_circle</span>
              See How It Works
            </a>
          </div>

          <!-- Trust Stats -->
          <div class="flex flex-wrap gap-8">
            <div v-for="stat in stats" :key="stat.label" class="flex flex-col">
              <span class="text-2xl font-bold text-white font-mono">{{ stat.value }}</span>
              <span class="text-white/40 text-xs uppercase tracking-wider">{{ stat.label }}</span>
            </div>
          </div>
        </div>

        <!-- Hero Dashboard Preview Card -->
        <div class="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block w-120 mr-8">
          <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-2xl">
            <!-- Mini header -->
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-white/40 text-[10px] uppercase tracking-wider">Property</p>
                <h3 class="text-white font-semibold text-sm">Mukuba House</h3>
              </div>
              <div class="flex items-center gap-1.5 px-3 py-1 bg-[#4edea3]/10 border border-[#4edea3]/30 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                <span class="text-[#4edea3] text-[10px] font-bold uppercase">Live</span>
              </div>
            </div>
            <!-- Stats row -->
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="bg-white/5 rounded-xl p-3">
                <p class="text-white/40 text-[9px] uppercase mb-1">Occupancy</p>
                <p class="text-white font-bold text-base font-mono">18<span class="text-white/40 text-xs">/20</span></p>
                <div class="w-full h-0.5 bg-white/10 rounded-full mt-2">
                  <div class="h-full bg-[#4edea3] rounded-full" style="width:90%"></div>
                </div>
              </div>
              <div class="bg-white/5 rounded-xl p-3">
                <p class="text-white/40 text-[9px] uppercase mb-1">Collected</p>
                <p class="text-white font-bold text-base font-mono">14.4K</p>
                <p class="text-[#4edea3] text-[9px] mt-1">↑ 12% this month</p>
              </div>
              <div class="bg-white/5 rounded-xl p-3">
                <p class="text-white/40 text-[9px] uppercase mb-1">Overdue</p>
                <p class="text-[#ef4444] font-bold text-base font-mono">3.2K</p>
                <p class="text-white/30 text-[9px] mt-1">2 tenants</p>
              </div>
            </div>
            <!-- Room grid -->
            <div class="grid grid-cols-4 gap-2">
              <div v-for="(room, i) in ['101','102','103','104']" :key="i"
                class="bg-white/5 rounded-lg p-2.5 border"
                :class="i === 2 ? 'border-error/30' : i === 1 ? 'border-tertiary-container/30' : 'border-inverse-primary/20'"
              >
                <p class="text-white/40 text-[8px] uppercase">Room</p>
                <p class="text-white font-bold text-sm font-mono">{{ room }}</p>
                <div class="mt-1.5 flex gap-1">
                  <span class="w-2 h-2 rounded-full" :class="i === 2 ? 'bg-error/60' : 'bg-inverse-primary/60'"></span>
                  <span class="w-2 h-2 rounded-full" :class="i === 2 ? 'bg-white/10' : i === 1 ? 'bg-tertiary-container/60' : 'bg-inverse-primary/60'"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FEATURES ─── -->
    <section id="features" class="py-24 px-6 md:px-16 bg-[#0f2338]">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-[#4edea3] text-xs font-bold uppercase tracking-widest mb-3">Everything You Need</p>
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">Built for how Zambia rents</h2>
          <p class="text-white/50 text-lg max-w-2xl mx-auto">Every tool a student hostel landlord needs — from MoMo collection to maintenance tracking, in one place.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="group bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all hover:bg-white/[0.07] hover:scale-[1.01]"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-5" :class="feature.color">
              <span class="material-symbols-outlined text-[24px]">{{ feature.icon }}</span>
            </div>
            <h3 class="text-white font-semibold text-lg mb-2">{{ feature.title }}</h3>
            <p class="text-white/50 text-sm leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── HOW IT WORKS ─── -->
    <section id="how-it-works" class="py-24 px-6 md:px-16 relative overflow-hidden">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="max-w-5xl mx-auto relative">
        <div class="text-center mb-16">
          <p class="text-[#4edea3] text-xs font-bold uppercase tracking-widest mb-3">Get Started in Minutes</p>
          <h2 class="text-4xl md:text-5xl font-bold text-white">How It Works</h2>
        </div>

        <div class="relative">
          <!-- Connector line -->
          <div class="absolute left-6.75 top-10 bottom-10 w-0.5 bg-linear-to-b from-primary via-primary/50 to-transparent hidden md:block"></div>

          <div class="flex flex-col gap-10">
            <div
              v-for="step in steps"
              :key="step.step"
              class="flex gap-8 items-start"
            >
              <div class="shrink-0 w-14 h-14 rounded-2xl border-2 border-primary bg-inverse-surface flex items-center justify-center z-10">
                <span class="text-[#4edea3] font-bold text-lg font-mono">{{ step.step }}</span>
              </div>
              <div class="pt-2">
                <h3 class="text-white font-semibold text-xl mb-2">{{ step.title }}</h3>
                <p class="text-white/50 text-base leading-relaxed">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── TESTIMONIALS ─── -->
    <section id="testimonials" class="py-24 px-6 md:px-16 bg-[#0f2338]">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-[#4edea3] text-xs font-bold uppercase tracking-widest mb-3">What People Say</p>
          <h2 class="text-4xl md:text-5xl font-bold text-white">Loved by landlords & tenants</h2>
        </div>

        <div class="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 md:p-12">
          <div class="transition-all duration-500">
            <p class="text-white text-xl md:text-2xl font-light leading-relaxed mb-8 italic">
              "{{ testimonials[activeTestimonial].quote }}"
            </p>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-[#006c49] flex items-center justify-center text-white font-bold">
                {{ testimonials[activeTestimonial].initials }}
              </div>
              <div>
                <p class="text-white font-semibold">{{ testimonials[activeTestimonial].name }}</p>
                <p class="text-white/50 text-sm">{{ testimonials[activeTestimonial].role }}</p>
              </div>
            </div>
          </div>

          <!-- Dots -->
          <div class="flex gap-2 mt-8 justify-center">
            <button
              v-for="(_, i) in testimonials"
              :key="i"
              @click="activeTestimonial = i"
              class="w-2 h-2 rounded-full transition-all"
              :class="activeTestimonial === i ? 'bg-[#4edea3] w-6' : 'bg-white/20'"
            ></button>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── CTA ─── -->
    <section class="py-24 px-6 md:px-16 relative overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-primary-container/10 pointer-events-none"></div>

      <div class="max-w-3xl mx-auto text-center relative">
        <div class="w-16 h-16 rounded-2xl bg-[#006c49] flex items-center justify-center mx-auto mb-8">
          <span class="material-symbols-outlined text-white text-[32px]">real_estate_agent</span>
        </div>
        <h2 class="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to modernise your hostel?
        </h2>
        <p class="text-white/50 text-lg mb-10">
          Join hundreds of Zambian landlords collecting rent faster and managing properties smarter with PandaStays.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/"
            class="flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-on-primary-fixed-variant text-white font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-primary/40 text-lg"
          >
            <span class="material-symbols-outlined">rocket_launch</span>
            Get Started — It's Free
          </router-link>
          <router-link
            to="/"
            class="flex items-center justify-center gap-2 px-8 py-4 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium rounded-xl transition-all text-lg"
          >
            View Dashboard Demo
          </router-link>
        </div>
      </div>
    </section>

    <!-- ─── FOOTER ─── -->
    <footer class="border-t border-white/10 py-10 px-6 md:px-16">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#006c49] flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-[16px]">real_estate_agent</span>
          </div>
          <span class="text-white font-semibold">PandaStays</span>
        </div>
        <p class="text-white/30 text-sm">© 2026 PandaStays. Built for Zambia.</p>
        <div class="flex gap-6 text-white/40 text-sm">
          <a href="#" class="hover:text-white transition-colors">Privacy</a>
          <a href="#" class="hover:text-white transition-colors">Terms</a>
          <a href="#" class="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>
