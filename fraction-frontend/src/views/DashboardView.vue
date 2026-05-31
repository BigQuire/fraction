<template>
  <main class="min-h-screen bg-black/20">
    <div class="page-shell grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <aside class="glass-panel h-fit rounded-2xl p-4 lg:sticky lg:top-28">
        <div class="mb-6 flex items-center gap-3 px-2">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 text-lg font-black text-neutral-950">
            {{ userInitial }}
          </div>
          <div>
            <p class="font-black text-white">{{ user?.username || 'Collector' }}</p>
            <p class="text-sm capitalize text-neutral-500">{{ user?.role || 'Member' }}</p>
          </div>
        </div>

        <nav class="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <button
            v-for="item in navItems"
            :key="item.key"
            class="rounded-2xl px-4 py-3 text-left text-sm font-bold transition"
            :class="activeSection === item.key ? 'bg-white text-neutral-950' : 'text-neutral-300 hover:bg-white/10 hover:text-white'"
            @click="activeSection = item.key"
          >
            {{ item.label }}
          </button>
        </nav>

        <button class="mt-6 w-full rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100 transition hover:bg-rose-500/20" @click="handleLogout">
          Logout
        </button>
      </aside>

      <section>
        <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">{{ activeLabel }}</p>
            <h1 class="mt-3 text-4xl font-black text-white md:text-5xl">
              {{ sectionTitle }}
            </h1>
            <p
              v-if="actionMessage"
              class="mt-3 text-sm font-semibold"
              :class="actionError ? 'text-rose-300' : 'text-emerald-300'"
            >
              {{ actionMessage }}
            </p>
          </div>
          <button v-if="activeSection === 'collection'" class="premium-button w-fit" @click="showUploadModal = true">
            Upload Product
          </button>
        </div>

        <section v-if="activeSection === 'dashboard'" class="space-y-8">
          <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div v-for="stat in dashboardStats" :key="stat.label" class="glass-panel rounded-2xl p-5">
              <p class="text-sm text-neutral-500">{{ stat.label }}</p>
              <p class="mt-3 text-3xl font-black" :class="stat.color">{{ stat.value }}</p>
            </div>
          </div>

          <div class="glass-panel rounded-2xl p-6">
            <div class="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Demo Wallet</p>
                <h2 class="mt-2 text-2xl font-black text-white">Add Fraction Credits</h2>
                <p class="mt-2 text-neutral-400">
                  Use this simulated top-up to demo purchases, bids, and auto bids without a payment gateway.
                </p>
              </div>
              <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="handleAddBalance">
                <input
                  v-model.number="balanceAmount"
                  type="number"
                  min="1"
                  class="field"
                  placeholder="Amount in FRC"
                />
                <button class="premium-button shrink-0" type="submit">Add Balance</button>
              </form>
            </div>
            <p
              v-if="balanceMessage"
              class="mt-4 text-sm font-semibold"
              :class="balanceError ? 'text-rose-300' : 'text-emerald-300'"
            >
              {{ balanceMessage }}
            </p>
          </div>

          <div class="glass-panel rounded-2xl p-6">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-2xl font-black text-white">Recent Products</h2>
              <button class="text-sm font-bold text-amber-200" @click="activeSection = 'collection'">Manage</button>
            </div>
            <ArtworkGrid
              :artworks="artworks.slice(0, 3)"
              empty-title="No products yet"
              empty-text="Upload your first collectible to start building your storefront."
              @edit="openEditModal"
              @delete="handleDelete"
              @auction="startAuction"
            />
          </div>
        </section>

        <section v-else-if="activeSection === 'store'" class="space-y-6">
          <p class="text-neutral-400">Preview the collectible products currently attached to your public seller profile.</p>
          <ArtworkGrid
            :artworks="artworks"
            empty-title="Your store is empty"
            empty-text="Products you upload will appear here for collectors to browse."
          />
        </section>

        <section v-else-if="activeSection === 'collection'" class="space-y-6">
          <ArtworkGrid
            :artworks="artworks"
            empty-title="No products uploaded yet"
            empty-text="Use the upload button to add a title, category, condition, sale type, and product image."
            show-actions
            @edit="openEditModal"
            @delete="handleDelete"
            @auction="startAuction"
          />
        </section>

        <section v-else-if="activeSection === 'bids'" class="space-y-6">
          <ArtworkGrid
            :artworks="activeBidArtworks"
            empty-title="No active bids"
            empty-text="Start a bid from your collection when you are ready to auction a piece."
            show-actions
            @edit="openEditModal"
            @delete="handleDelete"
            @auction="startAuction"
          />
        </section>

        <section v-else-if="activeSection === 'profile'" class="glass-panel rounded-2xl p-6">
          <div class="grid gap-8 lg:grid-cols-[220px_1fr]">
            <div>
              <div class="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img
                  v-if="profileForm.avatarUrl"
                  :src="profileForm.avatarUrl"
                  alt="Profile avatar"
                  class="h-full w-full object-cover"
                />
                <span v-else class="text-5xl font-black text-amber-200">{{ userInitial }}</span>
              </div>
              <p class="mt-4 text-sm text-neutral-400">
                Add an avatar URL, display name, seller bio, location, and store link.
              </p>
            </div>

            <form class="space-y-4" @submit.prevent="saveProfile">
              <div class="grid gap-4 md:grid-cols-2">
                <input v-model="profileForm.displayName" class="field" placeholder="Display name" />
                <input v-model="profileForm.location" class="field" placeholder="Location" />
              </div>
              <input v-model="profileForm.avatarUrl" class="field" placeholder="Avatar image URL" />
              <input v-model="profileForm.portfolioUrl" class="field" placeholder="Portfolio URL" />
              <textarea v-model="profileForm.bio" class="field min-h-32" placeholder="Short profile bio"></textarea>

              <p v-if="profileMessage" class="text-sm font-semibold text-emerald-300">{{ profileMessage }}</p>
              <button class="premium-button" type="submit">Save Profile</button>
            </form>
          </div>

          <div class="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p class="text-sm text-neutral-500">Seller Verification</p>
                <h3 class="mt-1 text-xl font-black text-white">
                  {{ user?.isVerifiedSeller ? 'Verified Seller' : verificationStatusLabel }}
                </h3>
                <p class="mt-2 text-neutral-400">
                  Verified sellers receive stronger marketplace placement and more buyer trust.
                </p>
              </div>
              <form class="flex w-full flex-col gap-3 md:max-w-md" @submit.prevent="submitVerification">
                <textarea v-model="verificationMessage" class="field min-h-24" placeholder="Describe your collectible experience, sourcing proof, or store history"></textarea>
                <button class="secondary-button" type="submit">Submit Verification Request</button>
              </form>
            </div>
          </div>

          <div class="mt-8 grid gap-5 md:grid-cols-2">
            <div>
              <p class="text-sm text-neutral-500">Username</p>
              <p class="mt-2 text-xl font-black text-white">{{ user?.username }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-500">Role</p>
              <p class="mt-2 text-xl font-black capitalize text-white">{{ user?.role || 'Member' }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-500">Wallet Balance</p>
              <p class="mt-2 text-xl font-black text-amber-200">{{ formatCredits(user?.walletBalance || 0) }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-500">Uploaded Products</p>
              <p class="mt-2 text-xl font-black text-white">{{ artworks.length }}</p>
            </div>
          </div>
        </section>

        <section v-else-if="activeSection === 'commissions'" class="space-y-5">
          <div v-if="commissions.length" class="grid gap-4">
            <article v-for="commission in commissions" :key="commission._id" class="glass-panel rounded-2xl p-5">
              <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p class="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">{{ commission.status }}</p>
                  <h2 class="mt-2 text-2xl font-black text-white">{{ commission.title }}</h2>
                  <p class="mt-2 text-neutral-400">From {{ commission.fromUser }}</p>
                  <p class="mt-4 leading-7 text-neutral-300">{{ commission.message }}</p>
                </div>
                <div class="min-w-44 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p class="text-sm text-neutral-500">Budget</p>
                  <p class="text-xl font-black text-white">{{ formatCredits(commission.budget) }}</p>
                  <p class="mt-3 text-sm text-neutral-500">Deadline</p>
                  <p class="text-sm font-semibold text-neutral-300">{{ formatDate(commission.deadline) }}</p>
                </div>
              </div>
              <div class="mt-5 flex flex-wrap gap-3">
                <button class="secondary-button px-4 py-2" @click="changeCommissionStatus(commission._id, 'accepted')">Accept</button>
                <button class="secondary-button px-4 py-2" @click="changeCommissionStatus(commission._id, 'in-progress')">In Progress</button>
                <button class="secondary-button px-4 py-2" @click="changeCommissionStatus(commission._id, 'completed')">Complete</button>
              </div>
            </article>
          </div>

          <div v-else class="glass-panel rounded-2xl p-10 text-center">
            <h2 class="text-3xl font-black text-white">No seller messages yet</h2>
            <p class="mx-auto mt-3 max-w-xl text-neutral-400">
              Buyer messages from product pages will appear here.
            </p>
          </div>
        </section>

        <section v-else-if="activeSection === 'wishlist'" class="space-y-6">
          <div v-if="wishlistNotifications.length" class="glass-panel rounded-2xl p-5">
            <h2 class="text-2xl font-black text-white">Wishlist Notifications</h2>
            <div class="mt-4 grid gap-3">
              <p v-for="notice in wishlistNotifications" :key="notice._id" class="rounded-2xl bg-amber-200/10 p-4 text-sm font-semibold text-amber-100">
                {{ notice.title }} has {{ notice.discountPercent ? `${notice.discountPercent}% discount` : 'bid activity' }}.
              </p>
            </div>
          </div>

          <ArtworkGrid
            :artworks="wishlistArtworks"
            empty-title="Your wishlist is empty"
            empty-text="Add products from the detail page to watch sales, discounts, and bid activity."
          />
        </section>

        <section v-else-if="activeSection === 'giveaways'" class="space-y-5">
          <div class="glass-panel rounded-2xl p-5">
            <p class="text-sm text-neutral-500">Available Tickets</p>
            <p class="mt-2 text-4xl font-black text-amber-200">{{ user?.tickets || 0 }}</p>
            <p class="mt-2 text-neutral-400">Earn tickets by buying or selling collectible products.</p>
          </div>

          <article v-for="giveaway in giveaways" :key="giveaway._id" class="glass-panel rounded-2xl p-5">
            <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p class="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">{{ giveaway.status }}</p>
                <h2 class="mt-2 text-2xl font-black text-white">{{ giveaway.title }}</h2>
                <p class="mt-2 text-neutral-400">{{ giveaway.description }}</p>
                <p class="mt-3 text-sm text-neutral-500">Prize: {{ giveaway.prize }}</p>
              </div>
              <button class="premium-button" @click="joinEvent(giveaway._id)">
                Join for {{ giveaway.ticketCost }} ticket
              </button>
            </div>
          </article>

          <div v-if="!giveaways.length" class="glass-panel rounded-2xl p-10 text-center text-neutral-400">
            No giveaways are active yet.
          </div>
        </section>

        <section v-else-if="activeSection === 'settings'" class="glass-panel rounded-2xl p-6">
          <form class="space-y-6" @submit.prevent="saveSettings">
            <div class="grid gap-5 md:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-neutral-300">Theme</span>
                <select v-model="settings.theme" class="field" @change="applyTheme(settings.theme)">
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                </select>
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-neutral-300">Language</span>
                <select v-model="settings.language" class="field">
                  <option v-for="language in languages" :key="language.code" :value="language.code">
                    {{ language.label }}
                  </option>
                </select>
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-neutral-300">Region</span>
                <select v-model="settings.region" class="field">
                  <option v-for="region in regions" :key="region" :value="region">
                    {{ region }}
                  </option>
                </select>
              </label>

            </div>

            <p class="text-sm text-neutral-400">
              Fraction uses platform credits for all purchases, bids, seller messages, and demo wallet balances.
            </p>

            <p v-if="settingsMessage" class="text-sm font-semibold text-emerald-300">{{ settingsMessage }}</p>
            <button class="premium-button" type="submit">Save Settings</button>
          </form>
        </section>

        <section v-else class="glass-panel rounded-2xl p-12 text-center">
          <h2 class="text-3xl font-black text-white">{{ sectionTitle }}</h2>
          <p class="mx-auto mt-3 max-w-xl text-neutral-400">
            This section is available for the next feature expansion.
          </p>
        </section>
      </section>
    </div>

    <div v-if="editingArtwork" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5">
      <div class="glass-panel w-full max-w-2xl rounded-2xl p-6">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-3xl font-black text-white">Edit Product</h2>
          <button class="secondary-button px-4 py-2" @click="editingArtwork = null">Close</button>
        </div>

        <form class="space-y-4" @submit.prevent="handleUpdate">
          <input v-model="editingArtwork.title" placeholder="Title" class="field" required />
          <textarea v-model="editingArtwork.description" placeholder="Description" class="field min-h-28" />
          <input v-model.number="editingArtwork.price" type="number" min="0" placeholder="Price" class="field" required />
          <select v-model="editingArtwork.category" class="field">
            <option v-for="category in categories" :key="category">{{ category }}</option>
          </select>
          <select v-model="editingArtwork.condition" class="field">
            <option v-for="condition in conditions" :key="condition">{{ condition }}</option>
          </select>
          <textarea v-model="editingArtwork.authenticityNotes" placeholder="Authenticity, grading, or provenance notes" class="field min-h-24" />
          <select v-model="editingArtwork.saleType" class="field">
            <option value="sale">Sale</option>
            <option value="bid">Bid</option>
            <option value="both">Sale + Bid</option>
          </select>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button class="premium-button" type="submit">Save Changes</button>
            <button class="secondary-button" type="button" @click="editingArtwork = null">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5">
      <div class="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-3xl font-black text-white">Upload Product</h2>
          <button class="secondary-button px-4 py-2" @click="showUploadModal = false">Close</button>
        </div>

        <form class="space-y-4" @submit.prevent="handleUploadArtwork">
          <input v-model="uploadForm.title" placeholder="Product title" class="field" required />
          <textarea v-model="uploadForm.description" placeholder="Description" class="field min-h-28" />
          <input v-model.number="uploadForm.price" type="number" min="0" placeholder="Price" class="field" required />

          <div class="grid gap-4 sm:grid-cols-2">
            <select v-model="uploadForm.category" class="field">
              <option v-for="category in categories" :key="category">{{ category }}</option>
            </select>

            <select v-model="uploadForm.condition" class="field">
              <option v-for="condition in conditions" :key="condition">{{ condition }}</option>
            </select>

            <select v-model="uploadForm.saleType" class="field">
              <option value="sale">Sale</option>
              <option value="bid">Bid</option>
              <option value="both">Sale + Bid</option>
            </select>
          </div>

          <label class="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-semibold text-neutral-300">
            <input v-model="uploadForm.sealed" type="checkbox" class="accent-amber-200" />
            Sealed item
          </label>

          <textarea v-model="uploadForm.authenticityNotes" class="field min-h-24" placeholder="Authenticity, grading, provenance, or receipt notes"></textarea>

          <input type="file" accept="image/*" class="field file:mr-4 file:rounded-full file:border-0 file:bg-amber-200 file:px-4 file:py-2 file:text-sm file:font-bold file:text-neutral-950" required @change="handleFileChange" />

          <p v-if="uploadMessage" class="text-sm font-semibold" :class="uploadError ? 'text-rose-300' : 'text-emerald-300'">
            {{ uploadMessage }}
          </p>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button class="premium-button" type="submit" :disabled="isUploading">
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </button>
            <button class="secondary-button" type="button" @click="showUploadModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteArtwork, getOwnerArtworks, updateArtwork, uploadArtwork } from '../services/artworkService'
import { getArtistCommissions, updateCommissionStatus } from '../services/commissionService'
import { getGiveaways, joinGiveaway } from '../services/giveawayService'
import {
  addWalletBalance,
  getUserProfile,
  requestSellerVerification,
  updateUserProfile,
  updateUserSettings,
} from '../services/userService'
import ArtworkCard from '../components/ArtworkCard.vue'
import { getArtworkImageUrl } from '../utils/artworkImage'
import {
  applyTheme,
  categories,
  conditions,
  formatCredits,
  getStoredSettings,
  languages,
  regions,
} from '../utils/preferences'

const ArtworkGrid = defineComponent({
  props: {
    artworks: { type: Array, required: true },
    emptyTitle: { type: String, required: true },
    emptyText: { type: String, required: true },
    showActions: { type: Boolean, default: false },
  },
  emits: ['edit', 'delete', 'auction'],
  setup(props, { emit }) {
    return () => {
      if (!props.artworks.length) {
        return h('div', { class: 'glass-panel rounded-2xl p-10 text-center' }, [
          h('h3', { class: 'text-2xl font-black text-white' }, props.emptyTitle),
          h('p', { class: 'mt-3 text-neutral-400' }, props.emptyText),
        ])
      }

      return h('div', { class: 'grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3' },
        props.artworks.map((artwork) =>
          h('div', { class: 'relative', key: artwork._id }, [
            h(ArtworkCard, {
              id: artwork._id,
              image: getArtworkImageUrl(artwork.imageUrl),
              title: artwork.title,
              artist: artwork.artist,
              price: artwork.saleType === 'bid' ? artwork.currentBid || 1 : artwork.price,
              saleType: artwork.saleType,
            }),
            props.showActions
              ? h('div', { class: 'absolute right-3 top-3 z-10 flex flex-wrap gap-2' }, [
                  h('button', {
                    class: 'rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-rose-600',
                    onClick: (event) => {
                      event.stopPropagation()
                      emit('delete', artwork._id)
                    },
                  }, 'Delete'),
                  h('button', {
                    class: 'rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white hover:text-neutral-950',
                    onClick: (event) => {
                      event.stopPropagation()
                      emit('edit', artwork)
                    },
                  }, 'Edit'),
                  h('button', {
                    class: 'rounded-full bg-amber-200 px-3 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-100',
                    onClick: (event) => {
                      event.stopPropagation()
                      emit('auction', artwork)
                    },
                  }, 'Start Bid'),
                ])
              : null,
          ])
        )
      )
    }
  },
})

const router = useRouter()
const user = ref(null)
const activeSection = ref('dashboard')
const artworks = ref([])
const editingArtwork = ref(null)
const showUploadModal = ref(false)
const selectedFile = ref(null)
const uploadMessage = ref('')
const uploadError = ref(false)
const isUploading = ref(false)
const commissions = ref([])
const giveaways = ref([])
const settings = ref(getStoredSettings())
const settingsMessage = ref('')
const profileMessage = ref('')
const actionMessage = ref('')
const actionError = ref(false)
const balanceAmount = ref(1000)
const balanceMessage = ref('')
const balanceError = ref(false)
const verificationMessage = ref('')
const profileForm = ref({
  displayName: '',
  bio: '',
  avatarUrl: '',
  location: '',
  portfolioUrl: '',
})

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'store', label: 'Store' },
  { key: 'collection', label: 'Collection' },
  { key: 'bids', label: 'My Bids' },
  { key: 'commissions', label: 'Messages' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'giveaways', label: 'Giveaways' },
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' },
]

const uploadForm = ref({
  title: '',
  description: '',
  price: '',
  category: categories[0],
  condition: conditions[0],
  sealed: false,
  authenticityNotes: '',
  saleType: 'sale',
})

const activeBidArtworks = computed(() => artworks.value.filter((artwork) => artwork.saleType === 'bid' || artwork.saleType === 'both'))

const wishlistArtworks = computed(() => user.value?.wishlist || [])

const wishlistNotifications = computed(() => {
  return wishlistArtworks.value.filter(
    (artwork) => artwork.discountPercent > 0 || artwork.saleType === 'bid' || artwork.saleType === 'both'
  )
})

const userInitial = computed(() => user.value?.username?.charAt(0)?.toUpperCase() || 'U')

const activeLabel = computed(() => navItems.find((item) => item.key === activeSection.value)?.label || 'Dashboard')

const sectionTitle = computed(() => {
  const titles = {
    dashboard: `Welcome back, ${user.value?.username || 'Collector'}`,
    store: 'Your Storefront',
    collection: 'My Uploaded Products',
    bids: 'Active Bids',
    commissions: 'Seller Messages',
    wishlist: 'Wishlist',
    giveaways: 'Giveaways',
    profile: 'Profile',
    settings: 'Settings',
  }

  return titles[activeSection.value]
})

const verificationStatusLabel = computed(() => {
  const status = user.value?.verificationStatus || 'not-requested'
  if (status === 'pending') return 'Pending Review'
  if (status === 'rejected') return 'Rejected'
  return 'Not Verified'
})

const dashboardStats = computed(() => [
  { label: 'Wallet Balance', value: formatCredits(user.value?.walletBalance || 0), color: 'text-amber-200' },
  { label: 'Net Worth', value: formatCredits(user.value?.netWorth || 0), color: 'text-emerald-200' },
  { label: 'Active Bids', value: activeBidArtworks.value.length, color: 'text-rose-200' },
  { label: 'Uploaded Products', value: artworks.value.length, color: 'text-white' },
])

const refreshUser = async () => {
  if (!user.value?.username) return
  user.value = await getUserProfile(user.value.username)
  localStorage.setItem('user', JSON.stringify(user.value))
  settings.value = getStoredSettings()
  profileForm.value = {
    displayName: user.value.profile?.displayName || '',
    bio: user.value.profile?.bio || '',
    avatarUrl: user.value.profile?.avatarUrl || '',
    location: user.value.profile?.location || '',
    portfolioUrl: user.value.profile?.portfolioUrl || '',
  }
}

const refreshArtworks = async () => {
  if (!user.value?.username) return
  artworks.value = await getOwnerArtworks(user.value.username)
}

const refreshCommissions = async () => {
  if (!user.value?.username) return
  commissions.value = await getArtistCommissions(user.value.username)
}

const refreshGiveaways = async () => {
  giveaways.value = await getGiveaways()
}

const joinEvent = async (id) => {
  try {
    const result = await joinGiveaway(id, user.value.username)
    user.value = result.user
    localStorage.setItem('user', JSON.stringify(user.value))
    await refreshGiveaways()
    setActionMessage('Giveaway joined.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not join giveaway.', true)
  }
}

const handleDelete = async (id) => {
  try {
    await deleteArtwork(id)
    artworks.value = artworks.value.filter((artwork) => artwork._id !== id)
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not delete artwork.', true)
  }
}

const setActionMessage = (message, isError = false) => {
  actionMessage.value = message
  actionError.value = isError
  setTimeout(() => {
    actionMessage.value = ''
  }, 3500)
}

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const resetUploadForm = () => {
  uploadForm.value = {
    title: '',
    description: '',
    price: '',
    category: categories[0],
    condition: conditions[0],
    sealed: false,
    authenticityNotes: '',
    saleType: 'sale',
  }
  selectedFile.value = null
}

const handleUploadArtwork = async () => {
  uploadMessage.value = ''
  uploadError.value = false

  if (!selectedFile.value) {
    uploadMessage.value = 'Please choose an image file.'
    uploadError.value = true
    return
  }

  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    formData.append('title', uploadForm.value.title)
    formData.append('artist', user.value.username)
    formData.append('description', uploadForm.value.description)
    formData.append('price', uploadForm.value.price)
    formData.append('category', uploadForm.value.category)
    formData.append('condition', uploadForm.value.condition)
    formData.append('sealed', uploadForm.value.sealed)
    formData.append('authenticityNotes', uploadForm.value.authenticityNotes)
    formData.append('saleType', uploadForm.value.saleType)

    await uploadArtwork(formData)
    await refreshArtworks()
    resetUploadForm()
    showUploadModal.value = false
  } catch (error) {
    uploadMessage.value = error.response?.data?.error || 'Upload failed.'
    uploadError.value = true
  } finally {
    isUploading.value = false
  }
}

const submitVerification = async () => {
  try {
    user.value = await requestSellerVerification(user.value.username, verificationMessage.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    verificationMessage.value = ''
    setActionMessage('Verification request submitted.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not submit verification request.', true)
  }
}

const handleAddBalance = async () => {
  balanceMessage.value = ''
  balanceError.value = false

  try {
    user.value = await addWalletBalance(user.value.username, balanceAmount.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    balanceMessage.value = `${formatCredits(balanceAmount.value)} added to your wallet.`
  } catch (error) {
    balanceMessage.value = error.response?.data?.error || 'Could not add balance.'
    balanceError.value = true
  }
}

const startAuction = async (artwork) => {
  try {
    const updatedArtwork = {
      ...artwork,
      saleType: 'bid',
      currentBid: 1,
      highestBidder: '',
      bidEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }

    await updateArtwork(artwork._id, updatedArtwork)
    await refreshArtworks()
    setActionMessage('Artwork listed for bidding.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not list artwork for bidding.', true)
  }
}

const changeCommissionStatus = async (id, status) => {
  try {
    await updateCommissionStatus(id, status)
    await refreshCommissions()
    setActionMessage('Message status updated.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not update message status.', true)
  }
}

const saveSettings = async () => {
  try {
    applyTheme(settings.value.theme)
    localStorage.setItem('fraction-settings', JSON.stringify(settings.value))

    if (user.value?.username) {
      user.value = await updateUserSettings(user.value.username, settings.value)
      localStorage.setItem('user', JSON.stringify(user.value))
    }

    settingsMessage.value = 'Settings saved.'
    setTimeout(() => {
      settingsMessage.value = ''
    }, 2000)
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not save settings.', true)
  }
}

const formatDate = (date) => {
  if (!date) return 'Flexible'
  return new Date(date).toLocaleDateString()
}

const openEditModal = (artwork) => {
  editingArtwork.value = { ...artwork }
}

const handleUpdate = async () => {
  try {
    const updated = await updateArtwork(editingArtwork.value._id, editingArtwork.value)
    artworks.value = artworks.value.map((artwork) => artwork._id === updated._id ? updated : artwork)
    editingArtwork.value = null
    setActionMessage('Artwork updated.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not update artwork.', true)
  }
}

const saveProfile = async () => {
  try {
    user.value = await updateUserProfile(user.value.username, profileForm.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    profileMessage.value = 'Profile saved.'
    setTimeout(() => {
      profileMessage.value = ''
    }, 2500)
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not save profile.', true)
  }
}

const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(async () => {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    router.push('/login')
    return
  }

  user.value = JSON.parse(storedUser)
  settings.value = getStoredSettings()
  applyTheme(settings.value.theme)
  await refreshUser()
  await refreshArtworks()
  await refreshCommissions()
  await refreshGiveaways()
})
</script>
