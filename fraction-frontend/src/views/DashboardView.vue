<template>
  <div class="min-h-screen bg-[#0F0F0F] text-white flex">

    <!-- Sidebar -->
    <aside class="w-72 bg-[#111111] border-r border-gray-800 p-6 hidden lg:flex flex-col">
      <h1 class="text-3xl font-bold text-purple-500 mb-12">
        ArtisanX
      </h1>

      <nav class="flex flex-col gap-4 text-lg">

        <!---dashboard--->
        <button
          @click="activeSection = 'dashboard'"
          :class="activeSection === 'dashboard'
            ? 'bg-purple-600'
            : 'hover:bg-[#1A1A1A]'"
          class="px-4 py-3 rounded-xl text-left font-semibold transition"
        >
          Dashboard
        </button>

        <!---store--->
        <button
          @click="activeSection = 'store'"
          :class="activeSection === 'store'
            ? 'bg-purple-600'
            : 'hover:bg-[#1A1A1A]'"
          class="px-4 py-3 rounded-xl text-left transition"
        >
          Store
        </button>

        <!---collection--->
        <button
          @click="activeSection = 'collection'"
          :class="activeSection === 'collection'
            ? 'bg-purple-600'
            : 'hover:bg-[#1A1A1A]'"
          class="px-4 py-3 rounded-xl text-left transition"
        >
          My Collection
        </button>

        <!---bids--->
        <button
          @click="activeSection = 'bids'"
          :class="activeSection === 'bids'
            ? 'bg-purple-600'
            : 'hover:bg-[#1A1A1A]'"
          class="px-4 py-3 rounded-xl text-left transition"
        >
          My Bids
        </button>

        <!---commissions--->
        <button
          @click="activeSection = 'commissions'"
          :class="activeSection === 'commissions'
            ? 'bg-purple-600'
            : 'hover:bg-[#1A1A1A]'"
          class="px-4 py-3 rounded-xl text-left transition"
        >
          Commissions
        </button>

        <!---wishlist--->
        <button
          @click="activeSection = 'wishlist'"
          :class="activeSection === 'wishlist'
            ? 'bg-purple-600'
            : 'hover:bg-[#1A1A1A]'"
          class="px-4 py-3 rounded-xl text-left transition"
        >
          Wishlist
        </button>

        <!---profile--->
        <button
          @click="activeSection = 'profile'"
          :class="activeSection === 'profile'
            ? 'bg-purple-600'
            : 'hover:bg-[#1A1A1A]'"
          class="px-4 py-3 rounded-xl text-left transition"
        >
          Profile
        </button>

        <!---settings--->
        <button
          @click="activeSection = 'settings'"
          :class="activeSection === 'settings'
            ? 'bg-purple-600'
            : 'hover:bg-[#1A1A1A]'"
          class="px-4 py-3 rounded-xl text-left transition"
        >
          Settings
        </button>

      </nav>

      <div class="mt-auto">
        <button @click="handleLogout" class="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold transition">
        Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <section v-if="activeSection === 'dashboard'">
      <main class="flex-1 p-8 overflow-y-auto">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 class="text-5xl font-bold mb-3">
              Welcome Back, {{ user?.username }}
            </h1>
          </div>

          <div class="flex items-center gap-4 bg-[#1A1A1A] border border-gray-800 p-4 rounded-2xl">
            <img
              src=""
              class="w-16 h-16 rounded-full object-cover"
            />

            <div>
              <p class="font-bold text-lg">{{ user?.username }}</p>
              <p class="text-gray-400">{{ user?.role }}</p>
            </div>
          </div>
        </div>

        <div class="bg-[#1A1A1A] border border-gray-800 rounded-3xl p-6 shadow-2xl">
          <p class="text-gray-400 mb-3">Wallet Balance</p>
          <h2 class="text-4xl font-bold text-purple-400">
            ${{user?.walletBalance}}
          </h2>
        </div>

        <div class="bg-[#1A1A1A] border border-gray-800 rounded-3xl p-6 shadow-2xl">
          <p class="text-gray-400 mb-3">Net Worth</p>
          <h2 class="text-4xl font-bold text-pink-400">
            ${{user?.netWorth}}
          </h2>
        </div>

        <div class="bg-[#1A1A1A] border border-gray-800 rounded-3xl p-6 shadow-2xl">
          <p class="text-gray-400 mb-3">Active Bids</p>
          <h2 class="text-4xl font-bold text-cyan-400">
            {{ user?.activeBids }}
          </h2>
        </div>

        <div class="bg-[#1A1A1A] border border-gray-800 rounded-3xl p-6 shadow-2xl">
          <p class="text-gray-400 mb-3">Owned Artworks</p>
          <h2 class="text-4xl font-bold text-yellow-400">
            {{ user?.ownedArtworks }}
          </h2>
        </div>
      </main>
    </section>

    <!---stores--->
    <section v-if="activeSection === 'store'" class="mb-16">
      <h2 class="text-4xl font-bold mb-10">
        Store
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <div
          v-for="artwork in artworks"
          :key="artwork._id"
          class="relative"
        >
          <ArtworkCard

            :id="artwork._id"

            :image="artwork.imageUrl"

            :title="artwork.title"
            :artist="artwork.artist"
            :price="artwork.price"
            :saleType="artwork.saleType"
          />
        </div>
      </div>
    </section>

    <!-- My Uploaded Artworks -->
    <section v-if="activeSection === 'collection'" class="mb-16">
      <div class="flex items-center justify-between mb-10">
        <h2 class="text-4xl font-bold">
          My Uploaded Artworks
        </h2>

        <button @click="showUploadModal = true" class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-2xl font-semibold">
          Upload Artwork
        </button>
      </div>

      <div v-if="artworks.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <div
          v-for="artwork in artworks"
          :key="artwork._id"
          class="relative"
        >
          <ArtworkCard

            :id="artwork._id"

            :image="artwork.imageUrl"

            :title="artwork.title"
            :artist="artwork.artist"
            :price="artwork.price"
            :saleType="artwork.saleType"
          />

          <div class="absolute top-4 right-4 flex gap-2 z-50">
            <button
              @click="handleDelete(artwork._id)"
              class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Delete
            </button>

            <button
              @click="openEditModal(artwork)"
              class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Edit
            </button>

            <button 
              @click="startAuction(artwork)" 
              class="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-xl text-sm font-semibold" 
            > 
              Start Bid 
            </button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="bg-[#1A1A1A] border border-gray-800 rounded-3xl p-10 text-center text-gray-400"
      >
        No artworks uploaded yet.
      </div>

    </section>

    <!-- Active Bids -->
    <section v-if="activeSection === 'bids'" class="mb-12">
      <h2 class="text-4xl font-bold mb-8">
        Active Bids
      </h2>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div
          v-for="artwork in artworks.filter(a => a.saleType === 'bid')"
          :key="artwork._id"
          class="relative"
        >
          <ArtworkCard

            :id="artwork._id"

            :image="artwork.imageUrl"

            :title="artwork.title"
            :artist="artwork.artist"
            :price="artwork.price"
            :saleType="artwork.saleType"
          />

          <div class="absolute top-4 right-4 flex gap-2 z-50">
            <button
              @click="handleDelete(artwork._id)"
              class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Delete
            </button>

            <button
              @click="openEditModal(artwork)"
              class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Edit Artwork Modal -->
  <div
    v-if="editingArtwork"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
  >

    <div class="bg-[#111111] p-8 rounded-3xl w-full max-w-2xl">

      <h2 class="text-3xl font-bold mb-8">
        Edit Artwork
      </h2>

      <div class="space-y-6">

        <input
          v-model="editingArtwork.title"
          placeholder="Title"
          class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3"
        />

        <textarea
          v-model="editingArtwork.description"
          placeholder="Description"
          class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3"
        />

        <input
          v-model="editingArtwork.price"
          type="number"
          placeholder="Price"
          class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3"
        />

        <select
          v-model="editingArtwork.saleType"
          class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3"
        >
          <option value="sale">Sale</option>
          <option value="bid">Bid</option>
          <option value="both">Both</option>
        </select>

        <div class="flex gap-4">

          <button @click="handleUpdate" class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl">
            Save Changes
          </button>

          <button @click="editingArtwork = null" class="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Upload Artwork Modal -->
  <div v-if="showUploadModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div class="bg-[#111111] w-full max-w-2xl p-8 rounded-3xl">
      <h2 class="text-3xl font-bold mb-8">
        Upload Artwork
      </h2>

      <div class="space-y-6">

        <input
          v-model="uploadForm.title"
          placeholder="Artwork Title"
          class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3"
        />

        <textarea
          v-model="uploadForm.description"
          placeholder="Description"
          class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3"
        />

        <input
          v-model="uploadForm.price"
          type="number"
          placeholder="Price"
          class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3"
        />

        <select
          v-model="uploadForm.category"
          class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3"
        >
          <option>Anime</option>
          <option>Fantasy</option>
          <option>Cyberpunk</option>
          <option>Nature</option>
        </select>

        <select
          v-model="uploadForm.saleType"
          class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3"
        >
          <option value="sale">Sale</option>
          <option value="bid">Bid</option>
          <option value="both">Both</option>
        </select>
        <input
          type="file"
          @change="handleFileChange"
          class="w-full"
        />
        <div class="flex gap-4">
          <button @click="handleUploadArtwork" class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl">
            Upload
          </button>

          <button @click="showUploadModal = false" class="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArtistArtworks, deleteArtwork, updateArtwork } from '../services/artworkService'
import ArtworkCard from '../components/ArtworkCard.vue'


const router = useRouter()
const user = ref(null)
const activeSection = ref('dashboard')
const artworks = ref([])
const editingArtwork = ref(null)
const showUploadModal = ref(false)
const selectedFile = ref(null)


const handleDelete = async (id) => {
  try {
    await deleteArtwork(id)
    artworks.value = artworks.value.filter(
      artwork => artwork._id !== id
    )
  } catch (error) {
    console.error(error)
  }
}

const uploadForm = ref({
  title: '',
  description: '',
  price: '',
  category: '',
  saleType: 'sale',
})

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const handleUploadArtwork = async () => {
  try {
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    formData.append('title', uploadForm.value.title)
    formData.append(
      'artist',
      user?.value.username
    )
    formData.append(
      'description',
      uploadForm.value.description
    )
    formData.append(
      'price',
      uploadForm.value.price
    )
    formData.append(
      'category',
      uploadForm.value.category
    )
    formData.append(
      'saleType',
      uploadForm.value.saleType
    )
    await fetch(
      'https://fraction-hfg4.onrender.com/api/artworks/upload',
      {
        method: 'POST',
        body: formData,
      }
    )
    artworks.value = await getArtistArtworks(
      user?.value.username
    )
    console.log(user?.value.username)
    console.log(artworks.value)

    showUploadModal.value = false
  } catch (error) {
    console.error(error)
  }
}

const startAuction = async (artwork) => {
  try {
    const updatedArtwork = {
      ...artwork,
      saleType: 'bid',
      currentBid: artwork.price,
      bidEndTime: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ),
    }
    await updateArtwork(
      artwork._id,
      updatedArtwork
    )
    artworks.value = await getArtistArtworks(
      user.value.username
    )
  } catch (error) {
    console.error(error)
  }
}

onMounted(async() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    user.value = JSON.parse(storedUser)
  } else {
    router.push('/login')
  }

  artworks.value = await getArtistArtworks(user?.value.username)

})

const openEditModal = (artwork) => {
  editingArtwork.value = { ...artwork }
}

const handleUpdate = async () => {
  try {
    const updated =
      await updateArtwork(
        editingArtwork.value._id,
        editingArtwork.value
      )
    artworks.value = artworks.value.map(
      artwork =>
        artwork._id === updated._id
          ? updated
          : artwork
    )
    editingArtwork.value = null
  } catch (error) {
    console.error(error)
  }
}

const handleLogout = () => {
  localStorage.removeItem('user')
  window.location.href = '/login'
}

</script>
