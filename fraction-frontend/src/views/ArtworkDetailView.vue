<template>
  <div v-if="artwork" class="min-h-screen px-10 py-16">

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <img :src="`https://fraction-backend.onrender.com/uploads/${artwork.imageUrl}`" class="w-full rounded-3xl"/>

      <div>
        <h1 class="text-5xl font-black mb-6">
          {{ artwork.title }}
        </h1>

        <p class="text-gray-400 mb-6 text-xl">
          By {{ artwork.artist }}
        </p>

        <p class="text-gray-300 leading-relaxed mb-10">
          {{ artwork.description }}
        </p>

        <h2 class="text-4xl font-bold text-purple-400 mb-10">
          ${{ artwork.price }}
        </h2>

        <div class="flex gap-6">

          <button class="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-2xl font-bold">
            Buy Now
          </button>

          <div
            v-if="artwork.saleType === 'bid'"
            class="mt-10"
          >
            <div class="mb-6">
              <p class="text-gray-400">
                Current Highest Bid
              </p>

              <h2 class="text-4xl font-bold text-red-400">
                ${{ artwork.currentBid }}
              </h2>

              <p class="text-gray-500 mt-2">
                Highest Bidder:
                {{ artwork.highestBidder || 'None' }}
              </p>
            </div>

            <div class="flex gap-4">

              <input
                v-model="bidAmount"
                type="number"
                placeholder="Enter bid amount"
                class="bg-[#111111] border border-gray-700 rounded-xl px-4 py-3 w-full"
              />

              <button
                @click="handleBid"
                class="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold"
              >
                Place Bid
              </button>

              <p 
              v-if="bidMessage" class="mt-4 font-semibold" :class=" bidError ? 'text-red-500' : 'text-green-500' " 
              > 
              {{ bidMessage }} 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getArtworkById, placeBid } from '../services/artworkService'


const route = useRoute()
const artwork = ref(null)
const bidAmount = ref('')
const bidMessage = ref('') 
const bidError = ref(false)

const handleBid = async () => {
  try { 
    const user = JSON.parse( localStorage.getItem('user') ) 
    const updatedArtwork = await placeBid( artwork.value._id, user.username, Number(bidAmount.value) ) 
    artwork.value = updatedArtwork 
    bidMessage.value = 'Bid placed successfully' 
    bidError.value = false 
    bidAmount.value = '' 
  } 
  catch (error) { 
    bidMessage.value = error.response?.data?.error || 'Failed to place bid' 
    bidError.value = true 
  }
}

onMounted(async () => {
  try {
    artwork.value = await getArtworkById(route.params.id)
  } catch (error) {
    console.error(error)
  }
})

</script>
