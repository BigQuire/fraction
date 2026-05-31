<template>
  <main class="min-h-screen pb-20 pt-12">
    <section class="page-shell">
      <div class="mb-10 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Giveaway</p>
          <h1 class="mt-3 text-5xl font-black text-white">Ticket Entry Events</h1>
          <p class="mt-4 max-w-2xl text-neutral-400">
            Use tickets from marketplace activity and gacha inventory sales. One ticket equals one entry.
          </p>
        </div>

        <div class="glass-panel rounded-2xl p-5">
          <p class="text-sm text-neutral-500">Available Tickets</p>
          <p class="mt-2 text-4xl font-black text-amber-200">{{ user?.tickets || 0 }}</p>
        </div>
      </div>

      <div class="grid gap-5">
        <article v-for="giveaway in giveaways" :key="giveaway._id" class="glass-panel rounded-2xl p-6">
          <div class="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
            <div>
              <p class="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">{{ giveaway.status }}</p>
              <h2 class="mt-2 text-3xl font-black text-white">{{ giveaway.title }}</h2>
              <p class="mt-3 text-neutral-400">{{ giveaway.description }}</p>
              <p class="mt-4 text-sm font-semibold text-neutral-300">Prize: {{ giveaway.prize }}</p>
              <p class="mt-2 text-sm text-neutral-500">{{ giveaway.entries?.length || 0 }} total entries</p>
            </div>

            <form class="space-y-3" @submit.prevent="joinEvent(giveaway._id)">
              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-neutral-300">Entries</span>
                <input v-model.number="entryCounts[giveaway._id]" class="field" type="number" min="1" placeholder="1" />
              </label>
              <button class="premium-button w-full" type="submit">
                Submit Entries
              </button>
            </form>
          </div>
        </article>

        <div v-if="!giveaways.length" class="glass-panel rounded-2xl p-10 text-center text-neutral-400">
          No giveaways are active yet.
        </div>
      </div>

      <p v-if="message" class="mt-5 text-sm font-semibold" :class="isError ? 'text-rose-300' : 'text-emerald-300'">
        {{ message }}
      </p>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getGiveaways, joinGiveaway } from '../services/giveawayService'
import { getUserProfile } from '../services/userService'

const router = useRouter()
const giveaways = ref([])
const user = ref(null)
const entryCounts = ref({})
const message = ref('')
const isError = ref(false)

const loadGiveaways = async () => {
  giveaways.value = await getGiveaways()
  giveaways.value.forEach((giveaway) => {
    entryCounts.value[giveaway._id] = entryCounts.value[giveaway._id] || 1
  })
}

const joinEvent = async (id) => {
  if (!user.value?.username) {
    router.push('/login')
    return
  }

  message.value = ''
  isError.value = false

  try {
    const result = await joinGiveaway(id, user.value.username, entryCounts.value[id] || 1)
    user.value = result.user
    localStorage.setItem('user', JSON.stringify(user.value))
    await loadGiveaways()
    message.value = 'Giveaway entries submitted.'
  } catch (error) {
    message.value = error.response?.data?.error || 'Could not submit giveaway entries.'
    isError.value = true
  }
}

onMounted(async () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null')

  if (storedUser?.username) {
    user.value = await getUserProfile(storedUser.username)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  await loadGiveaways()
})
</script>
