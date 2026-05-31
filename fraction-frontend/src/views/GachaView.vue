<template>
  <main class="min-h-screen pb-20 pt-12">
    <section class="page-shell">
      <div class="mb-10 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Gacha</p>
          <h1 class="mt-3 text-5xl font-black text-white">Collectible Blind Box</h1>
          <p class="mt-4 max-w-2xl text-neutral-400">
            Spend Fraction Credits online blind box and draw a prize from the current prize pool.
          </p>
        </div>

        <div class="glass-panel rounded-2xl p-5">
          <p class="text-sm text-neutral-500">Wallet Balance</p>
          <p class="mt-2 text-3xl font-black text-amber-200">{{ formatCredits(user?.walletBalance || 0) }}</p>
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section class="glass-panel rounded-2xl p-6">
          <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h2 class="text-3xl font-black text-white">Premium Starter Box</h2>
              <p class="mt-2 text-neutral-400">100 FRC to play once gacha.</p>
              <p class="mt-1 text-sm font-semibold text-amber-200">
                Selected: {{ selectedDrawCount }} draw{{ selectedDrawCount > 1 ? 's' : '' }} / {{ formatCredits(totalCost) }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:flex md:flex-wrap md:justify-end">
              <button
                v-for="option in drawOptions"
                :key="option"
                class="secondary-button px-4 py-2"
                :class="selectedDrawCount === option ? 'border-amber-200/60 bg-amber-200/15 text-amber-100' : ''"
                type="button"
                @click="selectedDrawCount = option"
              >
                {{ option }} draw
              </button>
            </div>
          </div>

          <button class="premium-button mt-6 w-full" :disabled="isOpening" @click="openBox">
            {{ isOpening ? 'Opening...' : `Open ${selectedDrawCount} Blind Box${selectedDrawCount > 1 ? 'es' : ''}` }}
          </button>

          <div class="mt-8 flex min-h-72 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-6 text-center">
            <div v-if="isOpening" class="gacha-reveal">
              <div class="mx-auto h-24 w-24 rounded-3xl border border-amber-200/50 bg-amber-200/15 shadow-2xl shadow-amber-200/20"></div>
              <h3 class="mt-6 text-4xl font-black text-white">Revealing prize...</h3>
              <p class="mt-3 text-neutral-400">The blind box is opening.</p>
            </div>
            <div v-else-if="lastPrizes.length" class="w-full">
              <img
                v-if="featuredPrize.imageUrl"
                :src="featuredPrize.imageUrl"
                :alt="featuredPrize.name"
                class="mx-auto mb-5 h-32 w-32 rounded-2xl object-cover"
              />
              <p class="text-sm font-bold uppercase tracking-[0.28em]" :class="featuredPrize.color">{{ featuredPrize.rarity }}</p>
              <h3 class="mt-3 text-4xl font-black text-white">{{ featuredPrize.name }}</h3>
              <p class="mt-4 text-neutral-400">{{ featuredPrize.description }}</p>

              <div class="mt-8 grid max-h-80 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
                <article
                  v-for="(prize, index) in lastPrizes"
                  :key="`${prize.name}-${index}`"
                  class="prize-pop rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
                  :style="{ animationDelay: `${Math.min(index, 12) * 60}ms` }"
                >
                  <p class="text-xs font-bold uppercase tracking-[0.2em]" :class="prize.color">{{ prize.rarity }}</p>
                  <img
                    v-if="prize.imageUrl"
                    :src="prize.imageUrl"
                    :alt="prize.name"
                    class="mt-3 h-20 w-full rounded-xl object-cover"
                  />
                  <p class="mt-2 font-black text-white">{{ prize.name }}</p>
                </article>
              </div>
            </div>
            <div v-else>
              <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Ready</p>
              <h3 class="mt-3 text-4xl font-black text-white">Your next prize is hidden</h3>
              <p class="mt-4 text-neutral-400">Open a box to preview the future gacha flow.</p>
            </div>
          </div>

          <p v-if="message" class="mt-4 text-sm font-semibold" :class="isError ? 'text-rose-300' : 'text-emerald-300'">
            {{ message }}
          </p>
        </section>

        <aside class="glass-panel h-fit rounded-2xl p-6">
          <h2 class="text-2xl font-black text-white">Prize Pool Gallery</h2>
          <div class="mt-5 grid gap-3">
            <article v-for="prize in prizeGallery" :key="prize.name" class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <img
                v-if="prize.imageUrl"
                :src="prize.imageUrl"
                :alt="prize.name"
                class="mb-3 h-24 w-full rounded-xl object-cover"
              />
              <div class="flex items-center justify-between gap-3">
                <p class="font-black text-white">{{ prize.name }}</p>
                <p class="text-xs font-bold" :class="prize.color">{{ prize.chance }}%</p>
              </div>
              <p class="mt-1 text-sm text-neutral-500">{{ prize.rarity }}</p>
            </article>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { drawGachaPrizes, getUserProfile } from '../services/userService'
import { formatCredits } from '../utils/preferences'

const router = useRouter()
const user = ref(null)
const lastPrizes = ref([])
const message = ref('')
const isError = ref(false)
const isOpening = ref(false)
const boxCost = 100
const selectedDrawCount = ref(1)
const drawOptions = [1, 10, 50, 100]

const prizeCategories = [
  {
    rarity: 'Common',
    chance: 75,
    color: 'text-neutral-300',
    prizes: [
      {
        name: 'Giveaway Ticket',
        description: 'You get one entry per ticket for giveaway.',
        // imageUrl: '/replace-with-your-common-prize-image.png',
      },
    ],
  },
  {
    rarity: 'Rare',
    chance: 15,
    color: 'text-sky-200',
    prizes: [
      {
        name: 'No Reaction Pack',
        description: 'No Reaction Pack for collectibles.',
        // imageUrl: '/replace-with-your-rare-prize-image.png',
      },
    ],
  },
  {
    rarity: 'Epic',
    chance: 9,
    color: 'text-violet-200',
    prizes: [
      {
        name: 'Raw SIR Card A',
        description: 'SIR from No Reaction Pack.',
        // imageUrl: '/replace-with-your-first-epic-prize-image.png',
      },
      {
        name: 'Raw SIR Card B',
        description: 'Alternate SIR from No Reaction Pack.',
        // imageUrl: '/replace-with-your-second-epic-prize-image.png',
      },
      {
        name: 'Raw SIR Card C',
        description: 'Chase SIR from No Reaction Pack.',
        // imageUrl: '/replace-with-your-third-epic-prize-image.png',
      },
    ],
  },
  {
    rarity: 'Legendary',
    chance: 1,
    color: 'text-amber-200',
    prizes: [
      {
        name: 'PSA 10 Graded Card A',
        description: 'PSA 10 Graded Card from No Reaction Pack.',
        // imageUrl: '/replace-with-your-first-legendary-prize-image.png',
      },
      {
        name: 'PSA 10 Graded Card B',
        description: 'Another PSA 10 graded chase card.',
        // imageUrl: '/replace-with-your-second-legendary-prize-image.png',
      },
    ],
  },
]

const prizeGallery = computed(() => {
  return prizeCategories.flatMap((category) =>
    category.prizes.map((prize) => ({
      ...prize,
      rarity: category.rarity,
      chance: category.chance,
      color: category.color,
    }))
  )
})

const totalCost = computed(() => selectedDrawCount.value * boxCost)
const featuredPrize = computed(() => {
  const rarityScore = {
    Legendary: 4,
    Epic: 3,
    Rare: 2,
    Common: 1,
  }

  return [...lastPrizes.value].sort(
    (a, b) => (rarityScore[b.rarity] || 0) - (rarityScore[a.rarity] || 0)
  )[0]
})

const openBox = async () => {
  message.value = ''
  isError.value = false

  if (!user.value?.username) {
    router.push('/login')
    return
  }

  if (Number(user.value.walletBalance || 0) < totalCost.value) {
    message.value = 'Insufficient wallet balance for this blind box.'
    isError.value = true
    return
  }

  isOpening.value = true
  lastPrizes.value = []

  try {
    const result = await drawGachaPrizes(user.value.username, selectedDrawCount.value)
    await new Promise((resolve) => setTimeout(resolve, 900))
    user.value = result.user
    localStorage.setItem('user', JSON.stringify(result.user))
    lastPrizes.value = result.prizes
    message.value = `${result.prizes.length} prize${result.prizes.length > 1 ? 's' : ''} added to your inventory.`
  } catch (error) {
    message.value = error.response?.data?.error || 'Blind box could not be opened yet.'
    isError.value = true
  } finally {
    isOpening.value = false
  }
}

onMounted(async () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null')

  if (!storedUser?.username) return

  user.value = await getUserProfile(storedUser.username)
  localStorage.setItem('user', JSON.stringify(user.value))
})
</script>

<style scoped>
.gacha-reveal {
  animation: revealPulse 900ms ease-in-out infinite alternate;
}

.prize-pop {
  animation: prizePop 420ms ease both;
}

@keyframes revealPulse {
  from {
    opacity: 0.55;
    transform: scale(0.96) rotate(-2deg);
  }

  to {
    opacity: 1;
    transform: scale(1.04) rotate(2deg);
  }
}

@keyframes prizePop {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.94);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
