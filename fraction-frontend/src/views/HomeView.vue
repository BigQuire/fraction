<template>
  <div>
    <section class="relative h-screen flex items-center justify-center text-center overflow-hidden">
      <video
        autoplay
        muted
        loop
        class="absolute w-full h-full object-cover"
      >
      <source src="/src/assets/fraction-hero.mp4" type="video/mp4" />
      </video>

      <div class="absolute inset-0 bg-black/60"></div>

      <div class="relative max-w-3xl px-6 py-12">
        <h1 class="text-6xl font-bold text-yellow-300 mb-6">
          Discover Rare Hand-Drawn Digital Art
        </h1>

        <p class="text-xl text-gray-300 mb-8">
          Bid, collect, and showcase
        </p>

        <router-link to="/marketplace" class="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-bold">Explore Marketplace</router-link>
      </div>
    </section>

    <section class="px-10 py-10">
      <div class="border border-gray-800 rounded-3xl p-8 bg-[#111111]">
    
        <h2 class="text-4xl font-bold mb-10">
          Featured Artworks
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ArtworkCard
            v-for="artwork in saleArtworks"
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
    </section>

    <section class="px-10 py-10">
      <div class="border border-gray-800 rounded-3xl p-8 bg-[#111111]">
    
        <h2 class="text-4xl font-bold mb-10">
          Biddings
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ArtworkCard
            v-for="artwork in bidArtworks"
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
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

import ArtworkCard from '../components/ArtworkCard.vue'
import { getArtworks } from '../services/artworkService'

const artworks = ref([])

onMounted(async () => {
  artworks.value = await getArtworks()
})

onMounted(async () => {

  try {

    artworks.value = await getArtworks()

    console.log(artworks.value)

  } catch (error) {

    console.error(error)

  }

})

const saleArtworks = computed(() => {

  return artworks.value.filter(
    artwork =>
      artwork.saleType === 'sale'
      || artwork.saleType === 'both'
  )

})

const bidArtworks = computed(() => {

  return artworks.value.filter(
    artwork =>
      artwork.saleType === 'bid'
      || artwork.saleType === 'both'
  )

})
</script>