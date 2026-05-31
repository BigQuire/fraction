<template>
  <main class="page-shell min-h-screen py-12">
    <div class="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Admin Dashboard</p>
        <h1 class="mt-3 text-5xl font-black text-white">Collectibles Platform Control</h1>
      </div>
      <button
        v-if="isAdmin"
        class="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-5 py-3 text-sm font-bold text-rose-100 transition hover:bg-rose-500/20"
        @click="handleLogout"
      >
        Logout
      </button>
    </div>

    <div v-if="!isAdmin" class="glass-panel max-w-md rounded-2xl p-6">
      <h2 class="text-2xl font-black text-white">Admin login required</h2>
      <p class="mt-3 text-neutral-400">Use the normal login page with the demo admin credentials.</p>
      <router-link to="/login" class="premium-button mt-6">Go to Login</router-link>
    </div>

    <section v-else class="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside class="glass-panel h-fit rounded-2xl p-4 lg:sticky lg:top-28">
        <nav class="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <button
            v-for="item in adminSections"
            :key="item.key"
            class="rounded-2xl px-4 py-3 text-left text-sm font-bold transition"
            :class="activeSection === item.key ? 'bg-white text-neutral-950' : 'text-neutral-300 hover:bg-white/10 hover:text-white'"
            @click="activeSection = item.key"
          >
            {{ item.label }}
          </button>
        </nav>
      </aside>

      <section class="space-y-8">
      <div v-if="activeSection === 'giveaways'" class="glass-panel rounded-2xl p-6">
        <h2 class="text-2xl font-black text-white">Create Giveaway</h2>
        <form class="mt-5 grid gap-4 md:grid-cols-2" @submit.prevent="handleCreateGiveaway">
          <input v-model="giveaway.title" class="field" placeholder="Event title" required />
          <input v-model="giveaway.prize" class="field" placeholder="Prize" required />
          <input v-model.number="giveaway.ticketCost" class="field" type="number" min="1" placeholder="1 ticket per entry" disabled />
          <input v-model="giveaway.endAt" class="field" type="datetime-local" required />
          <textarea v-model="giveaway.description" class="field md:col-span-2" placeholder="Description"></textarea>
          <button class="premium-button w-fit" type="submit">Create Giveaway</button>
        </form>

        <div class="mt-8 grid gap-4">
          <article v-for="event in giveaways" :key="event._id" class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <p class="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">{{ event.status }}</p>
                <h3 class="mt-2 text-xl font-black text-white">{{ event.title }}</h3>
                <p class="mt-2 text-neutral-400">Prize: {{ event.prize }}</p>
                <p class="mt-2 text-sm text-neutral-500">Ends: {{ formatDateTime(event.endAt) }}</p>
                <p class="mt-2 text-sm text-neutral-500">
                  {{ uniqueParticipants(event).length }} users participated / {{ event.entries?.length || 0 }} entries
                </p>
                <p v-if="event.winner" class="mt-2 text-sm font-semibold text-emerald-200">Winner: {{ event.winner }}</p>
              </div>
              <button class="secondary-button px-4 py-2" @click="handleSelectWinner(event._id)">
                Select Winner
              </button>
            </div>
            <div v-if="event.entries?.length" class="mt-4 flex flex-wrap gap-2">
              <span v-for="name in uniqueParticipants(event)" :key="name" class="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold text-neutral-300">
                {{ name }} x{{ participantEntryCount(event, name) }}
              </span>
            </div>
          </article>
        </div>
      </div>

      <div v-else-if="activeSection === 'verification'" class="glass-panel rounded-2xl p-6">
        <h2 class="text-2xl font-black text-white">Seller Verification Requests</h2>
        <div class="mt-5 grid gap-4">
          <article v-for="request in verificationRequests" :key="request._id" class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p class="font-black text-white">{{ request.username }}</p>
            <p class="mt-2 text-neutral-400">{{ request.verificationRequest?.message || 'No message provided.' }}</p>
            <div class="mt-4 flex gap-3">
              <button class="secondary-button px-4 py-2" @click="handleVerification(request.username, 'approved')">Approve</button>
              <button class="secondary-button px-4 py-2" @click="handleVerification(request.username, 'rejected')">Reject</button>
            </div>
          </article>
          <p v-if="!verificationRequests.length" class="text-neutral-400">No pending requests.</p>
        </div>
      </div>

      <div v-else-if="activeSection === 'products'" class="glass-panel rounded-2xl p-6">
        <h2 class="text-2xl font-black text-white">Product Moderation</h2>
        <div class="mt-5 grid gap-4">
          <article v-for="product in products" :key="product._id" class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p class="font-black text-white">{{ product.title }}</p>
                <p class="text-sm text-neutral-400">Seller: {{ product.owner || product.artist }} | {{ product.category }}</p>
                <p v-if="product.removedByAdmin" class="mt-2 text-sm font-semibold text-rose-300">Removed: {{ product.removalReason }}</p>
              </div>
              <button class="secondary-button px-4 py-2" :disabled="product.removedByAdmin" @click="handleRemoveProduct(product._id)">
                Remove
              </button>
            </div>
          </article>
        </div>
      </div>

      <div v-else-if="activeSection === 'shipping'" class="glass-panel rounded-2xl p-6">
        <h2 class="text-2xl font-black text-white">Shipping Requests</h2>
        <div class="mt-5 grid gap-4">
          <article v-for="request in shippingRequests" :key="request._id" class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <p class="font-black text-white">{{ request.itemName }}</p>
                <p class="mt-1 text-sm text-neutral-400">User: {{ request.username }} | {{ request.source }}</p>
                <p class="mt-3 text-sm text-neutral-300">
                  {{ request.shippingDetails?.fullName }} - {{ request.shippingDetails?.phone }}
                </p>
                <p class="mt-1 text-sm text-neutral-400">
                  {{ request.shippingDetails?.addressLine1 }},
                  {{ request.shippingDetails?.city }},
                  {{ request.shippingDetails?.state }}
                  {{ request.shippingDetails?.postalCode }},
                  {{ request.shippingDetails?.country }}
                </p>
              </div>
              <button class="secondary-button px-4 py-2" @click="handleFulfillShipping(request.username, request._id)">
                Mark Fulfilled
              </button>
            </div>
          </article>
          <p v-if="!shippingRequests.length" class="text-neutral-400">No pending shipping requests.</p>
        </div>
      </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  createAdminGiveaway,
  fulfillAdminShippingRequest,
  getAdminGiveaways,
  getAdminProducts,
  getAdminShippingRequests,
  getVerificationRequests,
  removeAdminProduct,
  reviewVerificationRequest,
  selectAdminGiveawayWinner,
} from '../services/adminService'

const products = ref([])
const router = useRouter()
const verificationRequests = ref([])
const shippingRequests = ref([])
const giveaways = ref([])
const activeSection = ref('products')
const giveaway = ref({
  title: '',
  description: '',
  prize: '',
  ticketCost: 1,
  endAt: '',
})
const adminSections = [
  { key: 'products', label: 'Products' },
  { key: 'verification', label: 'Verification' },
  { key: 'giveaways', label: 'Giveaways' },
  { key: 'shipping', label: 'Shipping' },
]

const storedUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
})

const isAdmin = computed(() => storedUser.value?.role === 'admin' && Boolean(localStorage.getItem('admin-token')))

const loadAdminData = async () => {
  if (!isAdmin.value) return
  products.value = await getAdminProducts()
  verificationRequests.value = await getVerificationRequests()
  shippingRequests.value = await getAdminShippingRequests()
  giveaways.value = await getAdminGiveaways()
}

const handleRemoveProduct = async (id) => {
  await removeAdminProduct(id, 'Policy or authenticity concern')
  await loadAdminData()
}

const handleVerification = async (username, status) => {
  await reviewVerificationRequest(username, {
    status,
    adminNote: status === 'approved' ? 'Verified by admin' : 'More proof required',
  })
  await loadAdminData()
}

const handleCreateGiveaway = async () => {
  await createAdminGiveaway(giveaway.value)
  giveaway.value = { title: '', description: '', prize: '', ticketCost: 1, endAt: '' }
  await loadAdminData()
}

const handleFulfillShipping = async (username, shipmentId) => {
  await fulfillAdminShippingRequest(username, shipmentId)
  await loadAdminData()
}

const handleLogout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('admin-token')
  router.push('/login')
}

const uniqueParticipants = (event) => [...new Set((event.entries || []).map((entry) => entry.username))]

const participantEntryCount = (event, username) => {
  return (event.entries || []).filter((entry) => entry.username === username).length
}

const formatDateTime = (date) => {
  if (!date) return 'Not set'
  return new Date(date).toLocaleString()
}

const handleSelectWinner = async (id) => {
  await selectAdminGiveawayWinner(id)
  await loadAdminData()
}

onMounted(loadAdminData)
</script>
