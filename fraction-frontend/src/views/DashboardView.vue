<template>
  <main class="min-h-screen bg-black/20">
    <div class="page-shell grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <aside class="glass-panel h-fit rounded-2xl p-4 lg:sticky lg:top-28">
        <div class="mb-6 flex items-center gap-3 px-2">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 text-lg font-black text-neutral-950">
            {{ userInitial }}
          </div>
          <div>
            <p class="font-black text-white">{{ user?.username || 'Collector' }}</p>
            <p class="text-sm capitalize text-neutral-500">{{ user?.role || 'Member' }}</p>
          </div>
        </div>

        <nav class="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <button
            v-for="item in navItems"
            :key="item.key"
            class="rounded-2xl px-4 py-3 text-left text-sm font-bold transition"
            :class="activeSection === item.key ? 'bg-white text-neutral-950' : 'text-neutral-300 hover:bg-white/10 hover:text-white'"
            @click="activeSection = item.key"
          >
            {{ item.label }}
          </button>
        </nav>

        <button class="mt-6 w-full rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100 transition hover:bg-rose-500/20" @click="handleLogout">
          Logout
        </button>
      </aside>

      <section>
        <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">{{ activeLabel }}</p>
            <h1 class="mt-3 text-4xl font-black text-white md:text-5xl">
              {{ sectionTitle }}
            </h1>
          </div>
          <button v-if="activeSection === 'collection'" class="premium-button w-fit" @click="showUploadModal = true">
            Upload Artwork
          </button>
        </div>

        <section v-if="activeSection === 'dashboard'" class="space-y-8">
          <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div v-for="stat in dashboardStats" :key="stat.label" class="glass-panel rounded-2xl p-5">
              <p class="text-sm text-neutral-500">{{ stat.label }}</p>
              <p class="mt-3 text-3xl font-black" :class="stat.color">{{ stat.value }}</p>
            </div>
          </div>

          <div class="glass-panel rounded-2xl p-6">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-2xl font-black text-white">Recent Uploads</h2>
              <button class="text-sm font-bold text-amber-200" @click="activeSection = 'collection'">Manage</button>
            </div>
            <ArtworkGrid
              :artworks="artworks.slice(0, 3)"
              empty-title="No uploads yet"
              empty-text="Upload your first artwork to start building your storefront."
              @edit="openEditModal"
              @delete="handleDelete"
              @auction="startAuction"
            />
          </div>
        </section>

        <section v-else-if="activeSection === 'store'" class="space-y-6">
          <p class="text-neutral-400">Preview the artworks currently attached to your public artist profile.</p>
          <ArtworkGrid
            :artworks="artworks"
            empty-title="Your store is empty"
            empty-text="Pieces you upload will appear here for collectors to browse."
          />
        </section>

        <section v-else-if="activeSection === 'collection'" class="space-y-6">
          <ArtworkGrid
            :artworks="artworks"
            empty-title="No artworks uploaded yet"
            empty-text="Use the upload button to add a title, category, sale type, and artwork image."
            show-actions
            @edit="openEditModal"
            @delete="handleDelete"
            @auction="startAuction"
          />
        </section>

        <section v-else-if="activeSection === 'bids'" class="space-y-6">
          <ArtworkGrid
            :artworks="activeBidArtworks"
            empty-title="No active bids"
            empty-text="Start a bid from your collection when you are ready to auction a piece."
            show-actions
            @edit="openEditModal"
            @delete="handleDelete"
            @auction="startAuction"
          />
        </section>

        <section v-else-if="activeSection === 'profile'" class="glass-panel rounded-2xl p-6">
          <div class="grid gap-5 md:grid-cols-2">
            <div>
              <p class="text-sm text-neutral-500">Username</p>
              <p class="mt-2 text-xl font-black text-white">{{ user?.username }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-500">Role</p>
              <p class="mt-2 text-xl font-black capitalize text-white">{{ user?.role || 'Member' }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-500">Wallet Balance</p>
              <p class="mt-2 text-xl font-black text-amber-200">${{ user?.walletBalance || 0 }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-500">Uploaded Artworks</p>
              <p class="mt-2 text-xl font-black text-white">{{ artworks.length }}</p>
            </div>
          </div>
        </section>

        <section v-else class="glass-panel rounded-2xl p-12 text-center">
          <h2 class="text-3xl font-black text-white">{{ sectionTitle }}</h2>
          <p class="mx-auto mt-3 max-w-xl text-neutral-400">
            This area is ready for the next feature. For now, your artwork management, bidding, profile, and upload flows are available from the dashboard.
          </p>
        </section>
      </section>
    </div>

    <div v-if="editingArtwork" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5">
      <div class="glass-panel w-full max-w-2xl rounded-2xl p-6">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-3xl font-black text-white">Edit Artwork</h2>
          <button class="secondary-button px-4 py-2" @click="editingArtwork = null">Close</button>
        </div>

        <form class="space-y-4" @submit.prevent="handleUpdate">
          <input v-model="editingArtwork.title" placeholder="Title" class="field" required />
          <textarea v-model="editingArtwork.description" placeholder="Description" class="field min-h-28" />
          <input v-model.number="editingArtwork.price" type="number" min="0" placeholder="Price" class="field" required />
          <select v-model="editingArtwork.category" class="field">
            <option>Anime</option>
            <option>Fantasy</option>
            <option>Cyberpunk</option>
            <option>Nature</option>
          </select>
          <select v-model="editingArtwork.saleType" class="field">
            <option value="sale">Sale</option>
            <option value="bid">Bid</option>
            <option value="both">Sale + Bid</option>
          </select>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button class="premium-button" type="submit">Save Changes</button>
            <button class="secondary-button" type="button" @click="editingArtwork = null">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5">
      <div class="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-3xl font-black text-white">Upload Artwork</h2>
          <button class="secondary-button px-4 py-2" @click="showUploadModal = false">Close</button>
        </div>

        <form class="space-y-4" @submit.prevent="handleUploadArtwork">
          <input v-model="uploadForm.title" placeholder="Artwork Title" class="field" required />
          <textarea v-model="uploadForm.description" placeholder="Description" class="field min-h-28" />
          <input v-model.number="uploadForm.price" type="number" min="0" placeholder="Price" class="field" required />

          <div class="grid gap-4 sm:grid-cols-2">
            <select v-model="uploadForm.category" class="field">
              <option>Anime</option>
              <option>Fantasy</option>
              <option>Cyberpunk</option>
              <option>Nature</option>
            </select>

            <select v-model="uploadForm.saleType" class="field">
              <option value="sale">Sale</option>
              <option value="bid">Bid</option>
              <option value="both">Sale + Bid</option>
            </select>
          </div>

          <input type="file" accept="image/*" class="field file:mr-4 file:rounded-full file:border-0 file:bg-amber-200 file:px-4 file:py-2 file:text-sm file:font-bold file:text-neutral-950" required @change="handleFileChange" />

          <p v-if="uploadMessage" class="text-sm font-semibold" :class="uploadError ? 'text-rose-300' : 'text-emerald-300'">
            {{ uploadMessage }}
          </p>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button class="premium-button" type="submit" :disabled="isUploading">
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </button>
            <button class="secondary-button" type="button" @click="showUploadModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getArtistArtworks, deleteArtwork, updateArtwork, uploadArtwork } from '../services/artworkService'
import ArtworkCard from '../components/ArtworkCard.vue'
import { getArtworkImageUrl } from '../utils/artworkImage'

const ArtworkGrid = defineComponent({
  props: {
    artworks: { type: Array, required: true },
    emptyTitle: { type: String, required: true },
    emptyText: { type: String, required: true },
    showActions: { type: Boolean, default: false },
  },
  emits: ['edit', 'delete', 'auction'],
  setup(props, { emit }) {
    return () => {
      if (!props.artworks.length) {
        return h('div', { class: 'glass-panel rounded-2xl p-10 text-center' }, [
          h('h3', { class: 'text-2xl font-black text-white' }, props.emptyTitle),
          h('p', { class: 'mt-3 text-neutral-400' }, props.emptyText),
        ])
      }

      return h('div', { class: 'grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3' },
        props.artworks.map((artwork) =>
          h('div', { class: 'relative', key: artwork._id }, [
            h(ArtworkCard, {
              id: artwork._id,
              image: getArtworkImageUrl(artwork.imageUrl),
              title: artwork.title,
              artist: artwork.artist,
              price: artwork.currentBid || artwork.price,
              saleType: artwork.saleType,
            }),
            props.showActions
              ? h('div', { class: 'absolute right-3 top-3 z-10 flex flex-wrap gap-2' }, [
                  h('button', {
                    class: 'rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-rose-600',
                    onClick: (event) => {
                      event.stopPropagation()
                      emit('delete', artwork._id)
                    },
                  }, 'Delete'),
                  h('button', {
                    class: 'rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white hover:text-neutral-950',
                    onClick: (event) => {
                      event.stopPropagation()
                      emit('edit', artwork)
                    },
                  }, 'Edit'),
                  h('button', {
                    class: 'rounded-full bg-amber-200 px-3 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-100',
                    onClick: (event) => {
                      event.stopPropagation()
                      emit('auction', artwork)
                    },
                  }, 'Start Bid'),
                ])
              : null,
          ])
        )
      )
    }
  },
})

const router = useRouter()
const user = ref(null)
const activeSection = ref('dashboard')
const artworks = ref([])
const editingArtwork = ref(null)
const showUploadModal = ref(false)
const selectedFile = ref(null)
const uploadMessage = ref('')
const uploadError = ref(false)
const isUploading = ref(false)

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'store', label: 'Store' },
  { key: 'collection', label: 'Collection' },
  { key: 'bids', label: 'My Bids' },
  { key: 'commissions', label: 'Commissions' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' },
]

const uploadForm = ref({
  title: '',
  description: '',
  price: '',
  category: 'Anime',
  saleType: 'sale',
})

const activeBidArtworks = computed(() => artworks.value.filter((artwork) => artwork.saleType === 'bid' || artwork.saleType === 'both'))

const userInitial = computed(() => user.value?.username?.charAt(0)?.toUpperCase() || 'U')

const activeLabel = computed(() => navItems.find((item) => item.key === activeSection.value)?.label || 'Dashboard')

const sectionTitle = computed(() => {
  const titles = {
    dashboard: `Welcome back, ${user.value?.username || 'Collector'}`,
    store: 'Your Storefront',
    collection: 'My Uploaded Artworks',
    bids: 'Active Bids',
    commissions: 'Commissions',
    wishlist: 'Wishlist',
    profile: 'Profile',
    settings: 'Settings',
  }

  return titles[activeSection.value]
})

const dashboardStats = computed(() => [
  { label: 'Wallet Balance', value: `$${user.value?.walletBalance || 0}`, color: 'text-amber-200' },
  { label: 'Net Worth', value: `$${user.value?.netWorth || 0}`, color: 'text-emerald-200' },
  { label: 'Active Bids', value: activeBidArtworks.value.length, color: 'text-rose-200' },
  { label: 'Uploaded Artworks', value: artworks.value.length, color: 'text-white' },
])

const refreshArtworks = async () => {
  if (!user.value?.username) return
  artworks.value = await getArtistArtworks(user.value.username)
}

const handleDelete = async (id) => {
  try {
    await deleteArtwork(id)
    artworks.value = artworks.value.filter((artwork) => artwork._id !== id)
  } catch (error) {
    console.error(error)
  }
}

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const resetUploadForm = () => {
  uploadForm.value = {
    title: '',
    description: '',
    price: '',
    category: 'Anime',
    saleType: 'sale',
  }
  selectedFile.value = null
}

const handleUploadArtwork = async () => {
  uploadMessage.value = ''
  uploadError.value = false

  if (!selectedFile.value) {
    uploadMessage.value = 'Please choose an image file.'
    uploadError.value = true
    return
  }

  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    formData.append('title', uploadForm.value.title)
    formData.append('artist', user.value.username)
    formData.append('description', uploadForm.value.description)
    formData.append('price', uploadForm.value.price)
    formData.append('category', uploadForm.value.category)
    formData.append('saleType', uploadForm.value.saleType)

    await uploadArtwork(formData)
    await refreshArtworks()
    resetUploadForm()
    showUploadModal.value = false
  } catch (error) {
    uploadMessage.value = error.response?.data?.error || 'Upload failed.'
    uploadError.value = true
  } finally {
    isUploading.value = false
  }
}

const startAuction = async (artwork) => {
  try {
    const updatedArtwork = {
      ...artwork,
      saleType: 'bid',
      currentBid: artwork.currentBid || artwork.price,
      bidEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }

    await updateArtwork(artwork._id, updatedArtwork)
    await refreshArtworks()
  } catch (error) {
    console.error(error)
  }
}

const openEditModal = (artwork) => {
  editingArtwork.value = { ...artwork }
}

const handleUpdate = async () => {
  try {
    const updated = await updateArtwork(editingArtwork.value._id, editingArtwork.value)
    artworks.value = artworks.value.map((artwork) => artwork._id === updated._id ? updated : artwork)
    editingArtwork.value = null
  } catch (error) {
    console.error(error)
  }
}

const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(async () => {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    router.push('/login')
    return
  }

  user.value = JSON.parse(storedUser)
  await refreshArtworks()
})
</script>
