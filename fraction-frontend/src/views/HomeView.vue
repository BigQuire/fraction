<template>
  <main>
    <section class="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <video autoplay muted loop playsinline class="absolute inset-0 h-full w-full object-cover">
        <source src="/src/assets/fraction-hero.mp4" type="video/mp4" />
      </video>
      <div class="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-[#080808]"></div>

      <div class="page-shell relative flex min-h-[calc(100vh-5rem)] items-center pb-24 pt-20">
        <div class="max-w-3xl">
          <p class="mb-5 text-sm font-bold uppercase tracking-[0.32em] text-amber-200">
            Curated digital originals
          </p>
          <h1 class="max-w-4xl text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
            Collect hand-drawn artwork with gallery-grade presentation.
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
            Discover rare digital pieces, follow live bids, and manage your own collection from one refined marketplace.
          </p>
          <div class="mt-9 flex flex-col gap-3 sm:flex-row">
            <router-link to="/marketplace" class="premium-button">Explore Marketplace</router-link>
            <router-link to="/register" class="secondary-button">Start Collecting</router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-white/10 bg-black/35 py-6">
      <div class="page-shell grid grid-cols-2 gap-4 text-center md:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label">
          <p class="text-3xl font-black text-white">{{ stat.value }}</p>
          <p class="mt-1 text-sm text-neutral-500">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <section class="page-shell py-20">
      <div class="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Now available</p>
          <h2 class="mt-3 text-4xl font-black text-white">Featured Artworks</h2>
        </div>
        <router-link to="/marketplace" class="secondary-button w-fit">View All</router-link>
      </div>

      <div v-if="saleArtworks.length" class="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
        <ArtworkCard
          v-for="artwork in saleArtworks.slice(0, 4)"
          :key="artwork._id"
          :image="getArtworkImageUrl(artwork.imageUrl)"
          :title="artwork.title"
          :artist="artwork.artist"
          :price="artwork.price"
          :saleType="artwork.saleType"
          :id="artwork._id"
        />
      </div>

      <div v-else class="glass-panel rounded-2xl p-10 text-center text-neutral-400">
        Featured artworks will appear here once artists upload pieces for sale.
      </div>
    </section>

    <section class="page-shell pb-24">
      <div class="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.28em] text-rose-200">Live activity</p>
          <h2 class="mt-3 text-4xl font-black text-white">Biddings</h2>
        </div>
      </div>

      <div v-if="bidArtworks.length" class="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
        <ArtworkCard
          v-for="artwork in bidArtworks.slice(0, 4)"
          :key="artwork._id"
          :image="getArtworkImageUrl(artwork.imageUrl)"
          :title="artwork.title"
          :artist="artwork.artist"
          :price="artwork.currentBid || artwork.price"
          :saleType="artwork.saleType"
          :id="artwork._id"
        />
      </div>

      <div v-else class="glass-panel rounded-2xl p-10 text-center text-neutral-400">
        No live bids yet. Check back after artists start auctions.
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

import ArtworkCard from '../components/ArtworkCard.vue'
import { getArtworks } from '../services/artworkService'
import { getArtworkImageUrl } from '../utils/artworkImage'

const artworks = ref([])

const stats = computed(() => [
  { value: artworks.value.length, label: 'Artworks' },
  { value: saleArtworks.value.length, label: 'For Sale' },
  { value: bidArtworks.value.length, label: 'Live Bids' },
  { value: new Set(artworks.value.map((artwork) => artwork.artist)).size, label: 'Artists' },
])

onMounted(async () => {
  try {
    artworks.value = await getArtworks()
  } catch (error) {
    console.error(error)
  }
})

const saleArtworks = computed(() => {
  return artworks.value.filter(
    (artwork) => artwork.saleType === 'sale' || artwork.saleType === 'both'
  )
})

const bidArtworks = computed(() => {
  return artworks.value.filter(
    (artwork) => artwork.saleType === 'bid' || artwork.saleType === 'both'
  )
})
</script>
