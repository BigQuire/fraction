<template>
  <div @click="goToArtwork" class="bg-[#1A1A1A] rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition duration-300">
    <img
      :src="image"
      class="w-full h-64 object-cover"
    />

    <div class="p-4">
      <h2 class="text-xl font-bold">{{ title }}</h2>
        <div class="mb-4">

          <span
            v-if="saleType === 'sale'"
            class="bg-green-600 text-white px-3 py-1 rounded-full text-sm"
          >
            On Sale
          </span>

          <span
            v-else-if="saleType === 'bid'"
            class="bg-red-600 text-white px-3 py-1 rounded-full text-sm"
          >
            Live Bid
          </span>

          <span
            v-else
            class="bg-purple-600 text-white px-3 py-1 rounded-full text-sm"
          >
            Sale + Bid
          </span>

        </div>

      <p class="text-gray-400 mt-2">
        {{ artist }}
      </p>

      <div class="flex justify-between items-center mt-4">
        <span class="text-gold-400 font-bold">
          ${{ price }}
        </span>

        <router-link :to="`/artwork/${id}`" class="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700">View</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  image: String,
  title: String,
  artist: String,
  price: Number,
  saleType: String,
  id: String,
})

const goToArtwork = () => {

  router.push(`/artwork/${props.id}`)

}

</script>