<template>
  <main class="min-h-screen pb-20 pt-12">
    <section class="page-shell">
      <div class="mb-10 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Gacha</p>
          <h1 class="mt-3 text-5xl font-black text-white">Collectible Blind Box</h1>
          <p class="mt-4 max-w-2xl text-neutral-400">
            Spend Fraction Credits for a simulated online blind box and draw a prize from the current prize pool.
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
              <p class="mt-2 text-neutral-400">One pull costs {{ formatCredits(boxCost) }}.</p>
            </div>
            <button class="premium-button" :disabled="isOpening" @click="openBox">
              {{ isOpening ? 'Opening...' : 'Open Blind Box' }}
            </button>
          </div>

          <div class="mt-8 flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-black/35 p-6 text-center">
            <div v-if="lastPrize">
              <p class="text-sm font-bold uppercase tracking-[0.28em]" :class="lastPrize.color">{{ lastPrize.rarity }}</p>
              <h3 class="mt-3 text-4xl font-black text-white">{{ lastPrize.name }}</h3>
              <p class="mt-4 text-neutral-400">{{ lastPrize.description }}</p>
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
          <h2 class="text-2xl font-black text-white">Prize Pool</h2>
          <div class="mt-5 grid gap-3">
            <article v-for="prize in prizePool" :key="prize.name" class="rounded-2xl border border-white/10 bg-white/5 p-4">
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getUserProfile, spendWalletCredits } from '../services/userService'
import { formatCredits } from '../utils/preferences'

const router = useRouter()
const user = ref(null)
const lastPrize = ref(null)
const message = ref('')
const isError = ref(false)
const isOpening = ref(false)
const boxCost = 100

const prizePool = [
  { name: 'Sealed Card Pack', rarity: 'Common', chance: 45, color: 'text-neutral-300', description: 'A starter collectible pack for your collection.' },
  { name: 'Limited Figure Voucher', rarity: 'Rare', chance: 30, color: 'text-sky-200', description: 'A rare voucher placeholder for future fulfilment.' },
  { name: 'Premium Storage Case', rarity: 'Epic', chance: 18, color: 'text-violet-200', description: 'An epic accessory prize for collectors.' },
  { name: 'Golden Collector Ticket', rarity: 'Legendary', chance: 7, color: 'text-amber-200', description: 'A top-tier prize placeholder for the detailed gacha system later.' },
]

const pickPrize = () => {
  const roll = Math.random() * 100
  let total = 0

  return prizePool.find((prize) => {
    total += prize.chance
    return roll <= total
  }) || prizePool[0]
}

const openBox = async () => {
  message.value = ''
  isError.value = false

  if (!user.value?.username) {
    router.push('/login')
    return
  }

  if (Number(user.value.walletBalance || 0) < boxCost) {
    message.value = 'Insufficient wallet balance for this blind box.'
    isError.value = true
    return
  }

  isOpening.value = true

  try {
    const updatedUser = await spendWalletCredits(user.value.username, boxCost)
    user.value = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))
    lastPrize.value = pickPrize()
    message.value = `You won ${lastPrize.value.name}.`
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
