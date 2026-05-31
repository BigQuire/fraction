<template>
  <main class="page-shell min-h-screen py-12">
    <div class="mb-10">
      <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Seller Reviews</p>
      <h1 class="mt-3 text-5xl font-black text-white">Review Collectible Sellers</h1>
      <p class="mt-4 max-w-2xl text-neutral-400">
        Positive reviews increase a seller's visibility across marketplace recommendations.
      </p>
    </div>

    <section class="grid gap-8 lg:grid-cols-[360px_1fr]">
      <div class="glass-panel h-fit rounded-2xl p-6 space-y-4">
        <p class="text-neutral-400">
          Reviews are now attached to each seller's public profile. Enter a seller username to open their profile and review them there.
        </p>
        <input v-model="seller" class="field" placeholder="Seller username" required @change="loadReviews" />
        <router-link :to="`/seller/${seller || 'seller'}`" class="premium-button">Open Seller Profile</router-link>
      </div>

      <section class="space-y-5">
        <div class="glass-panel rounded-2xl p-6">
          <p class="text-sm text-neutral-500">Seller Score</p>
          <h2 class="mt-2 text-4xl font-black text-white">
            {{ summary.sellerRating?.toFixed?.(1) || '0.0' }} / 5
          </h2>
          <p class="mt-2 text-neutral-400">
            {{ summary.reviewCount || 0 }} reviews
            <span v-if="summary.isVerifiedSeller" class="ml-2 text-amber-200">Verified seller</span>
          </p>
        </div>

        <article v-for="review in reviews" :key="review._id" class="glass-panel rounded-2xl p-5">
          <div class="flex items-center justify-between gap-4">
            <p class="font-black text-white">{{ review.reviewer }}</p>
            <p class="text-amber-200">{{ review.rating }} stars</p>
          </div>
          <p class="mt-3 leading-7 text-neutral-300">{{ review.comment || 'No written comment.' }}</p>
        </article>

        <div v-if="!reviews.length" class="glass-panel rounded-2xl p-10 text-center text-neutral-400">
          Enter a seller username to view or create reviews.
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { getSellerReviews } from '../services/reviewService'

const seller = ref('')
const reviews = ref([])
const summary = ref({})

const loadReviews = async () => {
  if (!seller.value) return
  const response = await getSellerReviews(seller.value)
  reviews.value = response.reviews
  summary.value = response.summary
}

</script>
