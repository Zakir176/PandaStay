<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthModal from '../components/AuthModal.vue'
import { applyTheme } from '../lib/theme'

const router = useRouter()
const isScrolled = ref(false)
const isAuthModalOpen = ref(false)
const authInitialRole = ref('landlord')

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  applyTheme('Forest')
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const openAuth = (role = 'landlord') => {
  authInitialRole.value = role
  isAuthModalOpen.value = true
}

// Early access interest submission
const earlyAccessEmail = ref('')
const earlyAccessSubmitted = ref(false)

const handleEarlyAccessSubmit = () => {
  if (earlyAccessEmail.value.trim()) {
    earlyAccessSubmitted.value = true
    setTimeout(() => {
      openAuth('landlord')
    }, 1200)
  }
}

// Six real features (verbatim descriptions from product spec)
const features = [
  {
    icon: 'dashboard',
    title: 'Property Dashboard',
    desc: 'A birds-eye view of every room, bed, and tenant. Occupancy rates, rent status, and alerts — all live.',
    badge: 'Live Operations',
    badgeClass: 'bg-primary-container text-primary'
  },
  {
    icon: 'payments',
    title: 'Mobile Money Collection',
    desc: 'Trigger MTN MoMo or Airtel Money STK push prompts directly from the app. Payments reconcile automatically.',
    badge: 'MTN & Airtel Rails',
    badgeClass: 'bg-primary-container text-primary'
  },
  {
    icon: 'receipt_long',
    title: 'Financial Ledger',
    desc: 'Full transaction history with date and method filters. Export to PDF or Excel in one click.',
    badge: 'Audit Ready',
    badgeClass: 'bg-secondary-container text-secondary'
  },
  {
    icon: 'handyman',
    title: 'Maintenance Tracking',
    desc: 'Log and resolve repair tickets with urgency priorities. Track costs and resolution timelines.',
    badge: 'Work Orders',
    badgeClass: 'bg-tertiary-container text-tertiary'
  },
  {
    icon: 'event_repeat',
    title: 'Semester & Lease Manager',
    desc: 'Manage lease renewals, vacation notices, and waitlists per academic term — stress-free.',
    badge: 'Academic Terms',
    badgeClass: 'bg-primary-container text-primary'
  },
  {
    icon: 'account_balance_wallet',
    title: 'Security Deposit Escrow',
    desc: 'Track deposits held per tenant, log damage deductions, and trigger mobile refunds instantly.',
    badge: 'Damage Escrow',
    badgeClass: 'bg-tertiary-container text-tertiary'
  }
]

// Four real steps (verbatim descriptions from product spec)
const steps = [
  {
    step: '01',
    icon: 'add_home_work',
    title: 'Add Your Property',
    desc: 'Register your hostel, rooms and beds in under 5 minutes.'
  },
  {
    step: '02',
    icon: 'person_add',
    title: 'Onboard Tenants',
    desc: 'Create tenant profiles with student IDs, room assignments and lease dates.'
  },
  {
    step: '03',
    icon: 'contactless',
    title: 'Collect Rent via MoMo',
    desc: "One tap triggers an STK push to the tenant's phone. Funds land in your account."
  },
  {
    step: '04',
    icon: 'insights',
    title: 'Track Everything',
    desc: 'Financials, maintenance, deposits and leases — all in your dashboard.'
  }
]

// Demo rooms preview consistent with Mukuba House data
const demoRooms = [
  {
    num: '101',
    type: '2-Bed Double',
    beds: [
      { slot: 'A', status: 'occupied', label: 'Occupied' },
      { slot: 'B', status: 'occupied', label: 'Occupied' }
    ]
  },
  {
    num: '102',
    type: '2-Bed Double',
    beds: [
      { slot: 'A', status: 'occupied', label: 'Occupied' },
      { slot: 'B', status: 'reserved', label: 'Reserved' }
    ]
  },
  {
    num: '103',
    type: '2-Bed Double',
    beds: [
      { slot: 'A', status: 'overdue', label: 'Overdue' },
      { slot: 'B', status: 'occupied', label: 'Occupied' }
    ]
  },
  {
    num: '104',
    type: '2-Bed Double',
    beds: [
      { slot: 'A', status: 'vacant', label: 'Vacant' },
      { slot: 'B', status: 'occupied', label: 'Occupied' }
    ]
  }
]

const getBedPreviewClass = (status) => {
  if (status === 'occupied') {
    return 'bg-primary text-white border-primary'
  }
  if (status === 'reserved') {
    return 'bg-tertiary-container text-tertiary border-tertiary bg-hatch-diagonal'
  }
  if (status === 'overdue') {
    return 'bg-error-container text-error border-error'
  }
  return 'bg-surface text-on-surface-muted border-dashed border-outline'
}
</script>

<template>
  <div class="min-h-screen bg-background text-on-surface">
    <!-- ─── NAVBAR ─── -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12"
      :class="isScrolled ? 'bg-background/90 backdrop-blur-md border-b border-border-card py-3 shadow-xs' : 'bg-transparent py-5'"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Brand -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs group-hover:bg-primary-hover transition-colors">
            <span class="material-symbols-outlined text-[20px]">real_estate_agent</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-on-surface font-bold text-lg tracking-tight font-headline">PandaStays</span>
            <span class="badge-pill bg-primary-container text-primary text-[10px] hidden sm:inline-flex">Pre-Launch</span>
          </div>
        </router-link>

        <!-- Center Nav Links -->
        <div class="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface-variant">
          <a href="#features" class="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" class="hover:text-primary transition-colors">How It Works</a>
          <a href="#why-pandastays" class="hover:text-primary transition-colors">Why PandaStays</a>
        </div>

        <!-- Right Portal Actions -->
        <div class="flex items-center gap-2.5">
          <button
            @click="openAuth('landlord')"
            class="text-xs font-semibold text-on-surface-variant hover:text-on-surface px-2.5 py-1.5 transition-colors cursor-pointer hidden sm:inline-flex"
          >
            Sign In
          </button>
          <router-link
            to="/tenant/portal"
            class="btn-pill-outline text-xs"
            title="Resident Portal"
          >
            <span class="material-symbols-outlined text-[15px]">school</span>
            <span>Resident Portal</span>
          </router-link>
          <router-link
            to="/app"
            class="btn-pill-primary text-xs"
            title="Landlord Operations Portal"
          >
            <span class="material-symbols-outlined text-[15px]">real_estate_agent</span>
            <span>Landlord Portal</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- ─── HERO SECTION ─── -->
    <section class="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-background">
      <!-- Architectural Subtle Hatch Texture Background -->
      <div class="absolute inset-0 opacity-[0.03] bg-hatch-diagonal pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-6 md:px-12 relative">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Left Column: Copy & CTAs -->
          <div class="lg:col-span-7 space-y-6">
            <!-- Honest Pre-launch Badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container border border-primary/20 text-primary text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-primary-accent animate-pulse"></span>
              <span>Built for Zambian Boarding Houses & Hostels</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.1] font-headline">
              Student Housing Management <span class="text-primary">Made Simple</span>
            </h1>

            <p class="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-2xl">
              Ditch handwritten counter books and chaotic WhatsApp groups. Automate MTN MoMo & Airtel Money rent collection, track bed-level occupancy, and manage student tenancies — all from one purpose-built bento dashboard.
            </p>

            <!-- Action Pill Buttons -->
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <router-link
                to="/app"
                class="btn-pill-primary text-sm py-3 px-6 shadow-sm"
              >
                <span class="material-symbols-outlined text-[18px]">rocket_launch</span>
                <span>Launch Landlord Portal</span>
              </router-link>

              <a
                href="#how-it-works"
                class="btn-pill-outline text-sm py-3 px-6"
              >
                <span class="material-symbols-outlined text-[18px]">arrow_downward</span>
                <span>See How It Works</span>
              </a>

              <button
                @click="openAuth('landlord')"
                class="btn-pill-outline text-sm py-3 px-5 border-dashed cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">edit_calendar</span>
                <span>Join Early Access</span>
              </button>
            </div>

            <!-- Honest Pre-Launch Note -->
            <div class="pt-4 flex items-center gap-3 text-xs text-on-surface-variant border-t border-border-card max-w-xl">
              <span class="material-symbols-outlined text-primary text-[18px] shrink-0">verified</span>
              <span>Engineered specifically for local student rentals — multi-occupancy rooms, termly leases, NRC verification, and Mobile Money.</span>
            </div>
          </div>

          <!-- Right Column: Tactile Bento Dashboard Preview Widget -->
          <div class="lg:col-span-5">
            <div class="card-bento p-5 border border-border-card shadow-sm space-y-4 bg-surface">
              <!-- Widget Header -->
              <div class="flex items-center justify-between pb-3 border-b border-border-card">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted block">Demo Property</span>
                  <h3 class="font-bold text-on-surface text-base">Mukuba House</h3>
                  <p class="text-[11px] text-on-surface-variant">Northmead, Lusaka &bull; Active Term 1</p>
                </div>
                <span class="badge-pill bg-primary-container text-primary text-[10px]">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary-accent animate-pulse"></span>
                  Live Preview
                </span>
              </div>

              <!-- Mini Bento Metric Row -->
              <div class="grid grid-cols-3 gap-2.5">
                <!-- Occupancy Mini Card -->
                <div class="p-3 rounded-xl bg-surface-container border border-border-card">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-on-surface-muted block">Occupancy</span>
                  <div class="flex items-baseline gap-1 mt-1">
                    <span class="font-data-mono font-bold text-base text-on-surface">18</span>
                    <span class="text-[11px] text-on-surface-muted">/20</span>
                  </div>
                  <div class="w-full bg-border-card h-1.5 rounded-full mt-2 overflow-hidden">
                    <div class="bg-primary-accent h-full rounded-full" style="width: 90%;"></div>
                  </div>
                </div>

                <!-- Collected Mini Card -->
                <div class="p-3 rounded-xl bg-primary-container/40 border border-primary/15">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-primary block">Collected</span>
                  <div class="mt-1">
                    <span class="font-data-mono font-bold text-base text-primary">K14,400</span>
                  </div>
                  <span class="text-[10px] text-primary-accent font-semibold block mt-1">100% MoMo</span>
                </div>

                <!-- Overdue Mini Card -->
                <div class="p-3 rounded-xl bg-error-container/30 border border-error/15">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-error block">Overdue</span>
                  <div class="mt-1">
                    <span class="font-data-mono font-bold text-base text-error">K3,200</span>
                  </div>
                  <span class="text-[10px] text-on-surface-variant font-medium block mt-1">2 Pending</span>
                </div>
              </div>

              <!-- Architectural Bed Grid Preview -->
              <div class="space-y-2 pt-1">
                <div class="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span class="font-semibold text-on-surface">Bed-Space Inventory Preview</span>
                  <span class="font-data-mono text-[10px]">4 / 10 Rooms shown</span>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div
                    v-for="room in demoRooms"
                    :key="room.num"
                    class="p-2.5 rounded-xl bg-surface-container border border-border-card text-xs flex items-center justify-between"
                  >
                    <div>
                      <span class="font-bold font-data-mono text-on-surface">Room {{ room.num }}</span>
                      <p class="text-[10px] text-on-surface-variant">{{ room.type }}</p>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <div
                        v-for="(bed, bi) in room.beds"
                        :key="bi"
                        class="w-4 h-5 rounded-xs border flex items-center justify-center text-[8px] font-bold"
                        :class="getBedPreviewClass(bed.status)"
                        :title="bed.label"
                      >
                        {{ bed.slot }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Widget Footer Link to Dashboard -->
              <div class="pt-2">
                <router-link
                  to="/app"
                  class="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-dim border border-border-card transition-colors text-xs font-semibold text-primary"
                >
                  <span>Explore Full Interactive Dashboard</span>
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FEATURES SECTION (BENTO GRID) ─── -->
    <section id="features" class="py-24 px-6 md:px-12 bg-surface border-y border-border-card">
      <div class="max-w-7xl mx-auto">
        <div class="max-w-2xl mx-auto text-center mb-16">
          <span class="badge-pill bg-primary-container text-primary text-xs uppercase tracking-widest mb-3">Core Capabilities</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-on-surface font-headline tracking-tight">Built for how Zambia rents</h2>
          <p class="text-on-surface-variant text-base sm:text-lg mt-3 leading-relaxed">
            Every tool a student hostel landlord needs — from MoMo collection to maintenance tracking, in one place.
          </p>
        </div>

        <!-- Six Real Features in Bento Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="card-bento p-6 flex flex-col justify-between hover:border-primary/40 group bg-surface"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                  <span class="material-symbols-outlined text-[24px]">{{ feature.icon }}</span>
                </div>
                <span class="badge-pill text-[10px]" :class="feature.badgeClass">
                  {{ feature.badge }}
                </span>
              </div>

              <h3 class="text-lg font-bold text-on-surface font-headline mb-2">{{ feature.title }}</h3>
              <p class="text-on-surface-variant text-sm leading-relaxed">{{ feature.desc }}</p>
            </div>

            <div class="pt-5 mt-4 border-t border-border-card flex items-center justify-between text-xs text-primary font-semibold">
              <span>Purpose-built module</span>
              <span class="material-symbols-outlined text-[16px] transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── HOW IT WORKS (FOUR STEPS) ─── -->
    <section id="how-it-works" class="py-24 px-6 md:px-12 bg-background">
      <div class="max-w-7xl mx-auto">
        <div class="max-w-2xl mx-auto text-center mb-16">
          <span class="badge-pill bg-primary-container text-primary text-xs uppercase tracking-widest mb-3">Simple Workflow</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-on-surface font-headline tracking-tight">How It Works</h2>
          <p class="text-on-surface-variant text-base sm:text-lg mt-3 leading-relaxed">
            Set up your student hostel in minutes without changing your daily operations.
          </p>
        </div>

        <!-- 4 Bento Step Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="step in steps"
            :key="step.step"
            class="card-bento p-6 flex flex-col justify-between bg-surface"
          >
            <div>
              <div class="flex items-center justify-between mb-5">
                <span class="text-2xl font-bold font-data-mono text-primary">{{ step.step }}</span>
                <div class="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                  <span class="material-symbols-outlined text-[20px]">{{ step.icon }}</span>
                </div>
              </div>
              <h3 class="text-base font-bold text-on-surface font-headline mb-2">{{ step.title }}</h3>
              <p class="text-on-surface-variant text-xs leading-relaxed">{{ step.desc }}</p>
            </div>

            <div class="mt-6 pt-3 border-t border-border-card">
              <div class="w-full bg-border-card h-1 rounded-full overflow-hidden">
                <div class="bg-primary h-full" :style="{ width: `${parseInt(step.step) * 25}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── HONEST POSITIONING SECTION (REPLACES FAKE STATS & FAKE TESTIMONIALS) ─── -->
    <section id="why-pandastays" class="py-24 px-6 md:px-12 bg-surface border-t border-border-card">
      <div class="max-w-7xl mx-auto space-y-12">
        <div class="max-w-2xl mx-auto text-center">
          <span class="badge-pill bg-tertiary-container text-tertiary text-xs uppercase tracking-widest mb-3">Pre-Launch &bull; Origin Note</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-on-surface font-headline tracking-tight">The Reality of Student Housing in Zambia</h2>
          <p class="text-on-surface-variant text-base sm:text-lg mt-3 leading-relaxed">
            Why we are building PandaStays from the ground up for Zambian landlords, caretakers, and student residents.
          </p>
        </div>

        <!-- 3-Pillar Bento Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Card 1: Problem Framing -->
          <div class="card-bento p-6 flex flex-col justify-between bg-surface">
            <div class="space-y-4">
              <div class="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center">
                <span class="material-symbols-outlined text-[22px]">edit_note</span>
              </div>
              <h3 class="text-lg font-bold text-on-surface font-headline">The Paper & WhatsApp Problem</h3>
              <p class="text-sm text-on-surface-variant leading-relaxed">
                Most Zambian boarding houses still track rent on paper notebooks or cluttered WhatsApp chats. Rent lands across multiple SIM cards, receipts are scribbled on slips of paper, and knowing who paid for Bed 2-B takes hours of manual checking.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-border-card">
              <span class="badge-pill bg-surface-container text-on-surface-variant text-[11px]">
                Zero spreadsheets. Zero manual reconciliation.
              </span>
            </div>
          </div>

          <!-- Card 2: Real Conversations & Origin -->
          <div class="card-bento p-6 flex flex-col justify-between bg-surface">
            <div class="space-y-4">
              <div class="w-10 h-10 rounded-xl bg-primary-container text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-[22px]">handshake</span>
              </div>
              <h3 class="text-lg font-bold text-on-surface font-headline">Built From Real Conversations</h3>
              <p class="text-sm text-on-surface-variant leading-relaxed">
                PandaStays was born out of discussions with landlords managing hostels near UNZA, CBU, and Apex. We saw how much time was lost chasing late rent, handling deposit deductions at move-out, and coordinating maintenance repairs.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-border-card">
              <span class="badge-pill bg-primary-container text-primary text-[11px]">
                Tailored to multi-occupancy student rooms.
              </span>
            </div>
          </div>

          <!-- Card 3: Early Access & Pioneer Cohort -->
          <div class="card-bento p-6 flex flex-col justify-between bg-surface-container-low border-primary/20">
            <div class="space-y-4">
              <div class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                <span class="material-symbols-outlined text-[22px]">flag</span>
              </div>
              <h3 class="text-lg font-bold text-on-surface font-headline">Join Our Pioneer Cohort</h3>
              <p class="text-sm text-on-surface-variant leading-relaxed">
                We are onboarding our first cohort of student housing operators for the upcoming academic semester. No inflated numbers or false claims — just software built specifically for how Zambia rents.
              </p>
            </div>

            <div class="mt-6 pt-4 border-t border-border-card space-y-3">
              <div v-if="!earlyAccessSubmitted" class="space-y-2">
                <div class="flex gap-2">
                  <input
                    v-model="earlyAccessEmail"
                    type="text"
                    placeholder="Enter email or phone..."
                    class="flex-1 px-3 py-2 text-xs rounded-full border border-border-card bg-surface text-on-surface focus:outline-none focus:border-primary"
                    @keyup.enter="handleEarlyAccessSubmit"
                  />
                  <button
                    @click="handleEarlyAccessSubmit"
                    class="btn-pill-primary text-xs shrink-0 cursor-pointer"
                  >
                    Request Access
                  </button>
                </div>
                <p class="text-[10px] text-on-surface-muted">We will reach out to schedule an onboarding walkthrough.</p>
              </div>
              <div v-else class="p-2.5 rounded-xl bg-primary-container text-primary text-xs flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Thank you! We'll be in touch shortly.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FINAL CTA BAND (DARK HERO SECTION) ─── -->
    <section class="py-20 px-6 md:px-12 bg-hero-dark text-white relative overflow-hidden bg-topo-dark">
      <!-- Subtle diagonal hatch overlay -->
      <div class="absolute inset-0 bg-hatch-diagonal-dark opacity-10 pointer-events-none"></div>

      <div class="max-w-4xl mx-auto text-center relative space-y-6">
        <div class="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white">
          <span class="material-symbols-outlined text-[28px]">real_estate_agent</span>
        </div>

        <h2 class="text-3xl sm:text-5xl font-bold font-headline tracking-tight text-white leading-tight">
          Ready to modernise your hostel?
        </h2>

        <p class="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Explore the live interactive demo right now, or request early access to be among our first pilot landlords for the upcoming semester.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3 pt-4">
          <router-link
            to="/app"
            class="btn-pill-primary text-sm py-3 px-6 bg-surface text-on-surface hover:bg-surface-dim"
            style="color: var(--color-hero-dark); background-color: var(--color-surface);"
          >
            <span class="material-symbols-outlined text-[18px]">rocket_launch</span>
            <span>Launch Landlord Portal</span>
          </router-link>

          <router-link
            to="/tenant/portal"
            class="btn-pill-outline text-sm py-3 px-6 text-white border-white/30 hover:bg-white/10"
          >
            <span class="material-symbols-outlined text-[18px]">school</span>
            <span>View Resident Portal</span>
          </router-link>

          <button
            @click="openAuth('landlord')"
            class="btn-pill-outline text-sm py-3 px-5 text-white/90 border-white/20 hover:bg-white/10 cursor-pointer"
          >
            <span class="material-symbols-outlined text-[18px]">edit_calendar</span>
            <span>Join Early Access</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ─── FOOTER ─── -->
    <footer class="border-t border-border-card py-10 px-6 md:px-12 bg-background">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
            <span class="material-symbols-outlined text-[18px]">real_estate_agent</span>
          </div>
          <div>
            <span class="text-on-surface font-bold text-base tracking-tight font-headline">PandaStays</span>
            <p class="text-on-surface-variant text-xs">Built for Zambian student housing & hostels.</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-6 text-xs text-on-surface-variant font-medium">
          <a href="#features" class="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" class="hover:text-primary transition-colors">How It Works</a>
          <a href="#why-pandastays" class="hover:text-primary transition-colors">Why PandaStays</a>
          <router-link to="/tenant/portal" class="hover:text-primary transition-colors">Resident Portal</router-link>
          <router-link to="/app" class="hover:text-primary transition-colors">Landlord Portal</router-link>
        </div>

        <p class="text-on-surface-muted text-xs font-data-mono">
          &copy; 2026 PandaStays. Built for Zambia.
        </p>
      </div>
    </footer>

    <!-- ─── AUTH / ONBOARDING MODAL ─── -->
    <AuthModal
      :is-open="isAuthModalOpen"
      :initial-role="authInitialRole"
      @close="isAuthModalOpen = false"
      @auth-success="isAuthModalOpen = false"
    />
  </div>
</template>
