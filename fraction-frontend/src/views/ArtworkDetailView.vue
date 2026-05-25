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
            :src="getArtworkImageUrl(artwork.imageUrl)"
            :alt="artwork.title"
            class="aspect-square w-full object-cover"
          />
        </div>

        <div class="lg:sticky lg:top-28 lg:h-fit">
          <p class="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-amber-200">
            {{ artwork.category || 'Digital Artwork' }}
          </p>

          <h1 class="text-5xl font-black leading-tight text-white">
            {{ artwork.title }}
          </h1>

          <p class="mt-4 text-xl text-neutral-400">
            By {{ artwork.artist }}
          </p>

          <p class="mt-8 leading-8 text-neutral-300">
            {{ artwork.description || 'No description has been added for this artwork yet.' }}
          </p>

          <div class="mt-9 grid grid-cols-2 gap-4">
            <div class="glass-panel rounded-2xl p-5">
              <p class="text-sm text-neutral-500">Price</p>
              <p class="mt-2 text-3xl font-black text-amber-200">${{ artwork.price }}</p>
            </div>

            <div class="glass-panel rounded-2xl p-5">
              <p class="text-sm text-neutral-500">Status</p>
              <p class="mt-2 text-2xl font-black text-white">{{ statusLabel }}</p>
            </div>
          </div>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              v-if="artwork.saleType === 'sale' || artwork.saleType === 'both'"
              class="premium-button"
              @click="buyMessage = 'Checkout is not connected yet, but this artwork is ready for purchase flow.'"
            >
              Buy Now
            </button>
            <router-link to="/marketplace" class="secondary-button">Back to Marketplace</router-link>
          </div>

          <p v-if="buyMessage" class="mt-4 text-sm font-semibold text-amber-100">
            {{ buyMessage }}
          </p>

          <div v-if="artwork.saleType === 'bid' || artwork.saleType === 'both'" class="glass-panel mt-8 rounded-2xl p-6">
            <div class="mb-5">
              <p class="text-sm text-neutral-500">Current Highest Bid</p>
              <h2 class="mt-2 text-4xl font-black text-rose-200">
                ${{ artwork.currentBid || artwork.price }}
              </h2>
              <p class="mt-2 text-sm text-neutral-500">
                Highest Bidder: {{ artwork.highestBidder || 'None yet' }}
              </p>
            </div>

            <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="handleBid">
              <input
                v-model="bidAmount"
                type="number"
                min="0"
                placeholder="Enter bid amount"
                class="field"
              />

              <button class="premium-button shrink-0" type="submit">
                Place Bid
              </button>
            </form>

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
      <h1 class="text-4xl font-black text-white">Artwork not found</h1>
      <router-link to="/marketplace" class="premium-button mt-6">Return to Marketplace</router-link>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArtworkById, placeBid } from '../services/artworkService'
import { getArtworkImageUrl } from '../utils/artworkImage'

const route = useRoute()
const router = useRouter()
const artwork = ref(null)
const bidAmount = ref('')
const bidMessage = ref('')
const bidError = ref(false)
const buyMessage = ref('')
const isLoading = ref(true)

const statusLabel = computed(() => {
  if (artwork.value?.saleType === 'bid') return 'Live Bid'
  if (artwork.value?.saleType === 'both') return 'Sale + Bid'
  return 'On Sale'
})

const handleBid = async () => {
  const user = JSON.parse(localStorage.getItem('user'))

  if (!user) {
    router.push('/login')
    return
  }

  try {
    const updatedArtwork = await placeBid(
      artwork.value._id,
      user.username,
      Number(bidAmount.value)
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

onMounted(async () => {
  try {
    artwork.value = await getArtworkById(route.params.id)
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})
</script>
