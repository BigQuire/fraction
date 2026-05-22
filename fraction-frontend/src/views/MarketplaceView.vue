<template>
  <div class="px-10 py-12 min-h-screen bg-gradient-to-b from-black via-[#0F0F0F] to-black">
    <h1 class="text-5xl font-bold mb-10">Marketplace</h1>

    <div class="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10">
      <aside class="bg-white/5 backdrop-blur-xl border border-white/10">
        <h2 class="text-2xl font-bold mb-6">Filters</h2>

        <div class="space-y-4">
          <input v-model="searchQuery" type="text" placeholder="Search artworks..." class="w-full bg-[#111111] border border-gray-800 rounded-2xl px-5 py-4 mb-8"/>
          <div class="mt-6">
            <label class="block text-white mb-2 font-semibold">
              Price Range
            </label>
            <input v-model="maxPrice" type="range" min="0" max="10000" class="w-full"/>

            <p class="mt-2 text-gray-400">
              Max Price: ${{ maxPrice }}
            </p>

            <select v-model="sortOption" class="bg-[#111111] border border-gray-800 rounded-xl p-3">
              <option value="default">Default</option>
              <option value="low-high">Price Low → High</option>
              <option value="high-low">Price High → Low</option>
            </select>

          </div>
          <select v-model="selectedType" class="bg-[#111111] border border-gray-800 rounded-xl p-3">
            <option value="all">All</option>
            <option value="sale">On Sale</option>
            <option value="bid">Live Bid</option>
            <option value="both">Both</option>
          </select>

          <select v-model="selectedCategory" class="bg-[#111111] border border-gray-800 rounded-xl p-3">
            <option value="all">All Categories</option>
            <option value="Anime">Anime</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Cyberpunk">Cyberpunk</option>
            <option value="Nature">Nature</option>
          </select>

        </div>
      </aside>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-500 ">
          <ArtworkCard
            v-for="artwork in filteredArtworks"
            :key="artwork._id"

            :image="`http://localhost:5000/uploads/${artwork.imageUrl}`"

            :title="artwork.title"
            :artist="artwork.artist"
            :price="artwork.price"
            :saleType="artwork.saleType"
            :id="artwork._id"
          />
      </div>
    </div>
  </div>
</template>

<script setup>
import ArtworkCard from '../components/ArtworkCard.vue'
import {ref, onMounted, computed,} from 'vue'

import { getArtworks } from '../services/artworkService'

const artworks = ref([])
const searchQuery = ref('')
const selectedType = ref('all')
const selectedCategory = ref('all')
const sortOption = ref('default')
const maxPrice = ref(10000)

onMounted(async () => {
  try {
    artworks.value = await getArtworks()
    console.log(artworks.value)
  } catch (error) {
    console.error(error)
  }
})

const filteredArtworks = computed(() => {
  let filtered = [...artworks.value]
  // Search
  if (searchQuery.value) {
    filtered = filtered.filter(artwork =>
      artwork.title
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())
    )
  }

  // Sale Type
  if (selectedType.value !== 'all') {
    filtered = filtered.filter(
      artwork =>
        artwork.saleType === selectedType.value
    )
  }

  // Category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(
      artwork =>
        artwork.category === selectedCategory.value
    )
  }

  // Price Range
  filtered = filtered.filter(
    artwork =>
      artwork.price <= maxPrice.value
  )

  // Sorting
  if (sortOption.value === 'low-high') {
    filtered.sort((a, b) => a.price - b.price)
  }

  if (sortOption.value === 'high-low') {
    filtered.sort((a, b) => b.price - a.price)
  }
  return filtered
})
</script>