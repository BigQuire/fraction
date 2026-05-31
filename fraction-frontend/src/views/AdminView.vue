<template>
  <main class="page-shell min-h-screen py-12">
    <div class="mb-10">
      <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Admin</p>
      <h1 class="mt-3 text-5xl font-black text-white">Collectibles Platform Control</h1>
    </div>

    <div v-if="!isAdmin" class="glass-panel max-w-md rounded-2xl p-6">
      <h2 class="text-2xl font-black text-white">Admin login required</h2>
      <p class="mt-3 text-neutral-400">Use the normal login page with the demo admin credentials.</p>
      <router-link to="/login" class="premium-button mt-6">Go to Login</router-link>
    </div>

    <section v-else class="space-y-8">
      <div class="glass-panel rounded-2xl p-6">
        <h2 class="text-2xl font-black text-white">Create Giveaway</h2>
        <form class="mt-5 grid gap-4 md:grid-cols-2" @submit.prevent="handleCreateGiveaway">
          <input v-model="giveaway.title" class="field" placeholder="Event title" required />
          <input v-model="giveaway.prize" class="field" placeholder="Prize" required />
          <input v-model.number="giveaway.ticketCost" class="field" type="number" min="1" placeholder="Ticket cost" />
          <textarea v-model="giveaway.description" class="field md:col-span-2" placeholder="Description"></textarea>
          <button class="premium-button w-fit" type="submit">Create Giveaway</button>
        </form>
      </div>

      <div class="glass-panel rounded-2xl p-6">
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

      <div class="glass-panel rounded-2xl p-6">
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
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  createAdminGiveaway,
  getAdminProducts,
  getVerificationRequests,
  removeAdminProduct,
  reviewVerificationRequest,
} from '../services/adminService'

const products = ref([])
const verificationRequests = ref([])
const giveaway = ref({
  title: '',
  description: '',
  prize: '',
  ticketCost: 1,
})

const isAdmin = computed(() => Boolean(localStorage.getItem('admin-token')))

const loadAdminData = async () => {
  if (!isAdmin.value) return
  products.value = await getAdminProducts()
  verificationRequests.value = await getVerificationRequests()
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
  giveaway.value = { title: '', description: '', prize: '', ticketCost: 1 }
}

onMounted(loadAdminData)
</script>
