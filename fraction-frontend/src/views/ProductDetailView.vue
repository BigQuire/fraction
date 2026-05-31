<template>
  <main class="min-h-screen py-12">
    <section v-if="isLoading" class="page-shell">
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div class="aspect-square animate-pulse rounded-2xl bg-white/5"></div>
        <div class="space-y-5 pt-6">
          <div class="h-12 w-3/4 animate-pulse rounded bg-white/5"></div>
          <div class="h-6 w-1/2 animate-pulse rounded bg-white/5"></div>
          <div class="h-32 animate-pulse rounded bg-white/5"></div>
        </div>
      </div>
    </section>

    <section v-else-if="artwork" class="page-shell">
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <img
            :src="getProductImageUrl(artwork.imageUrl)"
            :alt="artwork.title"
            class="aspect-square w-full object-cover"
          />
        </div>

        <div class="lg:sticky lg:top-28 lg:h-fit">
          <p class="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-amber-200">
            {{ artwork.category || 'Collectible Product' }}
          </p>

          <h1 class="text-5xl font-black leading-tight text-white">
            {{ artwork.title }}
          </h1>

          <p class="mt-4 text-xl text-neutral-400">
            Seller: {{ artwork.owner || artwork.artist }}
            <span v-if="artwork.sellerVerified" class="ml-2 text-sm font-bold text-amber-200">Verified</span>
          </p>
          <router-link
            :to="`/seller/${artwork.owner || artwork.artist}`"
            class="mt-3 inline-flex text-sm font-bold text-amber-200 hover:text-amber-100"
          >
            View seller profile
          </router-link>

          <p class="mt-8 leading-8 text-neutral-300">
            {{ artwork.description || 'No description has been added for this product yet.' }}
          </p>

          <div class="mt-6 grid grid-cols-2 gap-3 text-sm text-neutral-400">
            <p>Condition: <span class="font-semibold text-white">{{ artwork.condition || 'Good' }}</span></p>
            <p>Sealed: <span class="font-semibold text-white">{{ artwork.sealed ? 'Yes' : 'No' }}</span></p>
            <p class="col-span-2">Authenticity: <span class="font-semibold text-white">{{ artwork.authenticityNotes || 'Seller provided listing details.' }}</span></p>
          </div>

          <div class="mt-9 grid grid-cols-2 gap-4">
            <div class="glass-panel rounded-2xl p-5">
              <p class="text-sm text-neutral-500">Price</p>
              <p class="mt-2 text-3xl font-black text-amber-200">{{ formatCredits(artwork.price) }}</p>
            </div>

            <div class="glass-panel rounded-2xl p-5">
              <p class="text-sm text-neutral-500">Status</p>
              <p class="mt-2 text-2xl font-black text-white">{{ statusLabel }}</p>
            </div>
          </div>

          <div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p class="text-sm text-neutral-500">Stock Available</p>
            <p class="mt-1 text-2xl font-black" :class="stockAvailable ? 'text-emerald-200' : 'text-rose-200'">
              {{ stockAvailable ? `${artwork.stockCount ?? 1} in stock` : 'Out of stock' }}
            </p>
          </div>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              v-if="artwork.saleType === 'sale' || artwork.saleType === 'both'"
              class="premium-button"
              :disabled="!stockAvailable"
              @click="showShippingModal = true"
            >
              {{ stockAvailable ? 'Buy Now' : 'Out of Stock' }}
            </button>
            <button class="secondary-button" @click="toggleWishlist">
              {{ isWishlisted ? 'Remove Wishlist' : 'Add Wishlist' }}
            </button>
            <button class="secondary-button" @click="showCommissionModal = true">
              Message Seller
            </button>
            <router-link to="/marketplace" class="secondary-button">Back to Marketplace</router-link>
          </div>

          <div class="glass-panel mt-8 rounded-2xl p-6">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-2xl font-black text-white">Price History</h2>
              <span class="text-sm text-neutral-500">{{ priceHistory.length }} points</span>
            </div>
            <svg v-if="priceChartPoints" viewBox="0 0 320 120" class="h-40 w-full overflow-visible">
              <polyline
                :points="priceChartPoints"
                fill="none"
                stroke="#fcd34d"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p v-else class="text-neutral-400">Price history appears after listing or sale events.</p>
          </div>

          <p
            v-if="buyMessage"
            class="mt-4 text-sm font-semibold"
            :class="buyError ? 'text-rose-300' : 'text-emerald-300'"
          >
            {{ buyMessage }}
          </p>

          <div v-if="artwork.owner" class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p class="text-sm text-neutral-500">Store Owner</p>
            <p class="mt-1 font-bold text-white">{{ artwork.owner }}</p>
          </div>

          <div v-if="artwork.saleType === 'bid' || artwork.saleType === 'both'" class="glass-panel mt-8 rounded-2xl p-6">
            <div class="mb-5">
              <p class="text-sm text-neutral-500">Current Highest Bid</p>
              <h2 class="mt-2 text-4xl font-black text-rose-200">
                {{ formatCredits(artwork.currentBid || 1) }}
              </h2>
              <p class="mt-2 text-sm text-neutral-500">
                Highest Bidder: {{ artwork.highestBidder || 'None yet' }}
              </p>
            </div>

            <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="handleBid">
              <input
                v-model="bidAmount"
                type="number"
                :min="minimumNextBid"
                placeholder="Enter bid amount in FRC"
                class="field"
              />

              <button class="premium-button shrink-0" type="submit">
                Place Bid
              </button>
            </form>

            <form class="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto]" @submit.prevent="handleAutoBid">
              <input
                v-model="autoBidMax"
                type="number"
                :min="minimumNextBid"
                :placeholder="`Maximum auto bid, min ${minimumNextBid} FRC`"
                class="field"
              />

              <button class="secondary-button shrink-0" type="submit">
                Enable Auto Bid
              </button>
            </form>

            <p class="mt-3 text-xs leading-5 text-neutral-500">
              Auto bid raises your bid by small increments until your max bid or wallet balance is reached.
            </p>

            <p
              v-if="bidMessage"
              class="mt-4 text-sm font-semibold"
              :class="bidError ? 'text-rose-300' : 'text-emerald-300'"
            >
              {{ bidMessage }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="page-shell py-20 text-center">
      <h1 class="text-4xl font-black text-white">Product not found</h1>
      <router-link to="/marketplace" class="premium-button mt-6">Return to Marketplace</router-link>
    </section>

    <div v-if="showShippingModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5">
      <div class="glass-panel w-full max-w-2xl rounded-2xl p-6">
        <div class="mb-6 flex items-center justify-between gap-4">
          <h2 class="text-3xl font-black text-white">Shipping Details</h2>
          <button class="secondary-button px-4 py-2" @click="showShippingModal = false">Close</button>
        </div>

        <form class="space-y-4" @submit.prevent="handlePurchase">
          <div class="grid gap-4 sm:grid-cols-2">
            <input v-model="shippingForm.fullName" class="field" placeholder="Full name" required />
            <input v-model="shippingForm.phone" class="field" placeholder="Phone number" required />
          </div>
          <input v-model="shippingForm.addressLine1" class="field" placeholder="Address line 1" required />
          <input v-model="shippingForm.addressLine2" class="field" placeholder="Address line 2" />
          <div class="grid gap-4 sm:grid-cols-3">
            <input v-model="shippingForm.city" class="field" placeholder="City" required />
            <input v-model="shippingForm.state" class="field" placeholder="State / region" required />
            <input v-model="shippingForm.postalCode" class="field" placeholder="Postal code" required />
          </div>
          <input v-model="shippingForm.country" class="field" placeholder="Country" required />
          <p v-if="buyMessage" class="text-sm font-semibold" :class="buyError ? 'text-rose-300' : 'text-emerald-300'">
            {{ buyMessage }}
          </p>
          <button class="premium-button" type="submit">Confirm Purchase</button>
        </form>
      </div>
    </div>

    <div v-if="showCommissionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5">
      <div class="glass-panel w-full max-w-2xl rounded-2xl p-6">
        <div class="mb-6 flex items-center justify-between gap-4">
          <h2 class="text-3xl font-black text-white">Message Seller</h2>
          <button class="secondary-button px-4 py-2" @click="showCommissionModal = false">Close</button>
        </div>

        <form class="space-y-4" @submit.prevent="handleCommission">
          <input v-model="commissionForm.title" class="field" placeholder="Message subject" required />
          <textarea v-model="commissionForm.message" class="field min-h-32" placeholder="Ask about condition, shipping, provenance, or bundles" required />
          <div class="grid gap-4 sm:grid-cols-2">
            <input v-model.number="commissionForm.budget" class="field" type="number" min="0" placeholder="Budget" />
            <input v-model="commissionForm.deadline" class="field" type="date" />
          </div>
          <p v-if="commissionMessage" class="text-sm font-semibold" :class="commissionError ? 'text-rose-300' : 'text-emerald-300'">
            {{ commissionMessage }}
          </p>
          <button class="premium-button" type="submit">Send Message</button>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductById, placeBid, purchaseProduct, setAutoBid } from '../services/productService'
import { addToWishlist, getUserProfile, removeFromWishlist } from '../services/userService'
import { createCommission } from '../services/commissionService'
import { getProductImageUrl } from '../utils/productImage'
import { formatCredits, getStoredSettings, toCredits } from '../utils/preferences'

const route = useRoute()
const router = useRouter()
const artwork = ref(null)
const bidAmount = ref('')
const bidMessage = ref('')
const bidError = ref(false)
const buyMessage = ref('')
const buyError = ref(false)
const isLoading = ref(true)
const autoBidMax = ref('')
const user = ref(null)
const settings = ref(getStoredSettings())
const isWishlisted = ref(false)
const showCommissionModal = ref(false)
const showShippingModal = ref(false)
const commissionMessage = ref('')
const commissionError = ref(false)
const commissionForm = ref({
  title: '',
  message: '',
  budget: '',
  deadline: '',
})
const shippingForm = ref({
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Malaysia',
})

const statusLabel = computed(() => {
  if (artwork.value?.saleType === 'bid') return 'Live Bid'
  if (artwork.value?.saleType === 'both') return 'Sale + Bid'
  return 'On Sale'
})

const minimumNextBid = computed(() => Number(artwork.value?.currentBid || 1) + 1)

const priceHistory = computed(() => artwork.value?.priceHistory || [])

const stockAvailable = computed(() => Number(artwork.value?.stockCount ?? 1) > 0)

const priceChartPoints = computed(() => {
  if (priceHistory.value.length < 2) return ''
  const prices = priceHistory.value.map((point) => Number(point.price || 0))
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1

  return prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * 320
      const y = 110 - ((price - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')
})

const handleBid = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user'))

  if (!storedUser) {
    router.push('/login')
    return
  }

  try {
    const updatedArtwork = await placeBid(
      artwork.value._id,
      storedUser.username,
      toCredits(bidAmount.value)
    )
    artwork.value = updatedArtwork
    bidMessage.value = 'Bid placed successfully.'
    bidError.value = false
    bidAmount.value = ''
  } catch (error) {
    bidMessage.value = error.response?.data?.error || 'Failed to place bid.'
    bidError.value = true
  }
}

const handleAutoBid = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user'))

  if (!storedUser) {
    router.push('/login')
    return
  }

  try {
    artwork.value = await setAutoBid(
      artwork.value._id,
      storedUser.username,
      toCredits(autoBidMax.value)
    )
    bidMessage.value = 'Auto bid is active for this product.'
    bidError.value = false
    autoBidMax.value = ''
  } catch (error) {
    bidMessage.value = error.response?.data?.error || 'Failed to enable auto bid.'
    bidError.value = true
  }
}

const handlePurchase = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user'))

  if (!storedUser) {
    router.push('/login')
    return
  }

  buyMessage.value = ''
  buyError.value = false

  try {
    const result = await purchaseProduct(artwork.value._id, storedUser.username, shippingForm.value)
    artwork.value = result.artwork
    user.value = result.user
    localStorage.setItem('user', JSON.stringify(result.user))
    showShippingModal.value = false
    buyMessage.value = 'Purchased successfully. The seller now has your shipping details.'
  } catch (error) {
    buyMessage.value = error.response?.data?.error || 'Purchase failed.'
    buyError.value = true
  }
}

const toggleWishlist = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user'))

  if (!storedUser) {
    router.push('/login')
    return
  }

  try {
    const updatedUser = isWishlisted.value
      ? await removeFromWishlist(storedUser.username, artwork.value._id)
      : await addToWishlist(storedUser.username, artwork.value._id)

    user.value = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))
    isWishlisted.value = !isWishlisted.value
  } catch (error) {
    buyMessage.value = error.response?.data?.error || 'Wishlist could not be updated yet.'
  }
}

const handleCommission = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user'))

  if (!storedUser) {
    router.push('/login')
    return
  }

  try {
    await createCommission({
      artist: artwork.value.owner || artwork.value.artist,
      fromUser: storedUser.username,
      artworkId: artwork.value._id,
      title: commissionForm.value.title,
      message: commissionForm.value.message,
      budget: commissionForm.value.budget,
      deadline: commissionForm.value.deadline,
    })
    commissionMessage.value = 'Message sent to the seller.'
    commissionError.value = false
    commissionForm.value = { title: '', message: '', budget: '', deadline: '' }
  } catch (error) {
    commissionMessage.value = error.response?.data?.error || 'Seller message failed.'
    commissionError.value = true
  }
}

const formatDate = (date) => {
  if (!date) return 'Not set'
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  try {
    artwork.value = await getProductById(route.params.id)
    const storedUser = JSON.parse(localStorage.getItem('user'))

    if (storedUser?.username) {
      user.value = await getUserProfile(storedUser.username)
      localStorage.setItem('user', JSON.stringify(user.value))
      settings.value = getStoredSettings()
      isWishlisted.value = user.value.wishlist?.some((item) => item._id === artwork.value._id || item === artwork.value._id)
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})
</script>
