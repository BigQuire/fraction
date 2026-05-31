<template>
  <main class="page-shell min-h-screen py-12">
    <section class="glass-panel rounded-2xl p-6">
      <div class="grid gap-6 md:grid-cols-[160px_1fr]">
        <div class="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <img
            v-if="seller?.profile?.avatarUrl"
            :src="seller.profile.avatarUrl"
            alt="Seller avatar"
            class="h-full w-full object-cover"
          />
          <span v-else class="text-5xl font-black text-amber-200">{{ sellerInitial }}</span>
        </div>
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Seller Profile</p>
          <h1 class="mt-3 flex flex-wrap items-center gap-3 text-5xl font-black text-white">
            {{ seller?.profile?.displayName || seller?.username || route.params.username }}
            <span
              v-if="seller?.isVerifiedSeller"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-400 text-sm font-black text-white"
              title="Verified seller"
            >
              ✓
            </span>
          </h1>
          <p class="mt-3 text-neutral-400">{{ seller?.profile?.bio || 'This seller has not added a bio yet.' }}</p>
          <div class="mt-5 grid gap-3 text-sm text-neutral-400 sm:grid-cols-3">
            <p>Location: <span class="font-semibold text-white">{{ seller?.profile?.location || 'Not set' }}</span></p>
            <p>Rating: <span class="font-semibold text-white">{{ seller?.sellerRating?.toFixed?.(1) || '0.0' }} / 5</span></p>
            <p>Reviews: <span class="font-semibold text-white">{{ seller?.reviewCount || 0 }}</span></p>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-10">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-3xl font-black text-white">Selling Products</h2>
      </div>
      <div v-if="products.length" class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        <ArtworkCard
          v-for="product in products"
          :key="product._id"
          :image="getArtworkImageUrl(product.imageUrl)"
          :title="product.title"
          :artist="product.owner || product.artist"
          :price="product.saleType === 'bid' ? product.currentBid || 1 : product.price"
          :saleType="product.saleType"
          :id="product._id"
        />
      </div>
      <div v-else class="glass-panel rounded-2xl p-10 text-center text-neutral-400">
        This seller has no active products right now.
      </div>
    </section>

    <section class="mt-10 grid gap-8 lg:grid-cols-[360px_1fr]">
      <form class="glass-panel h-fit rounded-2xl p-6 space-y-4" @submit.prevent="submitReview">
        <h2 class="text-2xl font-black text-white">Review Seller</h2>
        <input v-model="reviewer" class="field" placeholder="Your username" required />
        <select v-model.number="rating" class="field">
          <option v-for="score in [5, 4, 3, 2, 1]" :key="score" :value="score">{{ score }} stars</option>
        </select>
        <textarea v-model="comment" class="field min-h-32" placeholder="Review packaging, accuracy, communication, and service"></textarea>
        <p v-if="message" class="text-sm font-semibold" :class="hasError ? 'text-rose-300' : 'text-emerald-300'">{{ message }}</p>
        <button class="premium-button" type="submit">Submit Review</button>
      </form>

      <div class="space-y-4">
        <article v-for="review in reviews" :key="review._id" class="glass-panel rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <p class="font-black text-white">{{ review.reviewer }}</p>
            <p class="text-amber-200">{{ review.rating }} stars</p>
          </div>
          <p class="mt-3 text-neutral-300">{{ review.comment || 'No written comment.' }}</p>
        </article>
        <div v-if="!reviews.length" class="glass-panel rounded-2xl p-10 text-center text-neutral-400">
          No reviews for this seller yet.
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ArtworkCard from '../components/ArtworkCard.vue'
import { getArtworks } from '../services/artworkService'
import { getUserProfile } from '../services/userService'
import { createReview, getSellerReviews } from '../services/reviewService'
import { getArtworkImageUrl } from '../utils/artworkImage'

const route = useRoute()
const seller = ref(null)
const products = ref([])
const reviews = ref([])
const reviewer = ref(JSON.parse(localStorage.getItem('user') || 'null')?.username || '')
const rating = ref(5)
const comment = ref('')
const message = ref('')
const hasError = ref(false)

const sellerInitial = computed(() => route.params.username?.charAt(0)?.toUpperCase() || 'S')

const activeListing = (product) => {
  return ['sale', 'bid', 'both'].includes(product.saleType)
    && (product.owner || product.artist) === route.params.username
    && !(product.resaleAvailableAt && new Date(product.resaleAvailableAt) > new Date())
}

const loadSeller = async () => {
  seller.value = await getUserProfile(route.params.username)
  const allProducts = await getArtworks()
  products.value = allProducts.filter(activeListing)
  const reviewResponse = await getSellerReviews(route.params.username)
  reviews.value = reviewResponse.reviews
}

const submitReview = async () => {
  message.value = ''
  hasError.value = false

  try {
    await createReview({
      seller: route.params.username,
      reviewer: reviewer.value,
      rating: rating.value,
      comment: comment.value,
    })
    comment.value = ''
    message.value = 'Review submitted.'
    await loadSeller()
  } catch (error) {
    message.value = error.response?.data?.error || 'Could not submit review.'
    hasError.value = true
  }
}

onMounted(loadSeller)
</script>
