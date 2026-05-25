<template>
  <main class="min-h-screen pb-20 pt-12">
    <section class="page-shell">
      <div class="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Marketplace</p>
          <h1 class="mt-3 text-5xl font-black text-white">Browse the collection</h1>
          <p class="mt-4 max-w-2xl text-neutral-400">
            Filter by sale type, category, and price to find digital pieces that match your collection.
          </p>
        </div>
        <div class="glass-panel rounded-2xl px-5 py-4">
          <p class="text-sm text-neutral-500">Showing</p>
          <p class="text-2xl font-black text-white">{{ filteredArtworks.length }} pieces</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside class="glass-panel h-fit rounded-2xl p-5">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-xl font-black text-white">Filters</h2>
            <button class="text-sm font-semibold text-amber-200 hover:text-amber-100" @click="resetFilters">
              Reset
            </button>
          </div>

          <div class="space-y-5">
            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-neutral-300">Search</span>
              <input v-model="searchQuery" type="text" placeholder="Artwork title" class="field" />
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-neutral-300">Sale Type</span>
              <select v-model="selectedType" class="field">
                <option value="all">All</option>
                <option value="sale">On Sale</option>
                <option value="bid">Live Bid</option>
                <option value="both">Sale + Bid</option>
              </select>
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-neutral-300">Category</span>
              <select v-model="selectedCategory" class="field">
                <option value="all">All Categories</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </label>

            <label class="block">
              <span class="mb-2 flex items-center justify-between text-sm font-semibold text-neutral-300">
                <span>Max Price</span>
                <span class="text-amber-200">{{ formatMoney(maxPrice, settings.currency) }}</span>
              </span>
              <input v-model.number="maxPrice" type="range" min="0" max="10000" step="100" class="w-full accent-amber-200" />
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-neutral-300">Sort</span>
              <select v-model="sortOption" class="field">
                <option value="default">Default</option>
                <option value="low-high">Price Low to High</option>
                <option value="high-low">Price High to Low</option>
              </select>
            </label>
          </div>
        </aside>

        <section>
          <div v-if="isLoading" class="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
            <div v-for="item in 6" :key="item" class="h-[28rem] animate-pulse rounded-2xl bg-white/5"></div>
          </div>

          <div v-else-if="filteredArtworks.length" class="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
            <ArtworkCard
              v-for="artwork in filteredArtworks"
              :key="artwork._id"
              :image="getArtworkImageUrl(artwork.imageUrl)"
              :title="artwork.title"
              :artist="artwork.artist"
              :price="displayPrice(artwork)"
              :currency="settings.currency"
              :saleType="artwork.saleType"
              :id="artwork._id"
            />
          </div>

          <div v-else class="glass-panel rounded-2xl p-12 text-center">
            <h3 class="text-2xl font-black text-white">No artworks found</h3>
            <p class="mt-3 text-neutral-400">Try widening the price range or clearing the current filters.</p>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
import ArtworkCard from '../components/ArtworkCard.vue'
import { ref, onMounted, computed } from 'vue'

import { getArtworks } from '../services/artworkService'
import { getArtworkImageUrl } from '../utils/artworkImage'
import { categories, formatMoney, getStoredSettings } from '../utils/preferences'

const artworks = ref([])
const searchQuery = ref('')
const selectedType = ref('all')
const selectedCategory = ref('all')
const sortOption = ref('default')
const maxPrice = ref(10000)
const isLoading = ref(true)
const settings = ref(getStoredSettings())

onMounted(async () => {
  try {
    artworks.value = await getArtworks()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

const displayPrice = (artwork) => artwork.currentBid || artwork.price

const resetFilters = () => {
  searchQuery.value = ''
  selectedType.value = 'all'
  selectedCategory.value = 'all'
  sortOption.value = 'default'
  maxPrice.value = 10000
}

const filteredArtworks = computed(() => {
  let filtered = [...artworks.value]

  if (searchQuery.value) {
    filtered = filtered.filter((artwork) =>
      artwork.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedType.value !== 'all') {
    filtered = filtered.filter((artwork) => artwork.saleType === selectedType.value)
  }

  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter((artwork) => artwork.category === selectedCategory.value)
  }

  filtered = filtered.filter((artwork) => Number(displayPrice(artwork)) <= Number(maxPrice.value))

  if (sortOption.value === 'low-high') {
    filtered.sort((a, b) => displayPrice(a) - displayPrice(b))
  }

  if (sortOption.value === 'high-low') {
    filtered.sort((a, b) => displayPrice(b) - displayPrice(a))
  }

  return filtered
})
</script>
