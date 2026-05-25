<template>
  <article
    @click="goToArtwork"
    class="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/25 transition duration-300 hover:-translate-y-1 hover:border-amber-200/35 hover:bg-white/[0.07]"
  >
    <div class="relative aspect-[4/5] overflow-hidden bg-neutral-900">
      <img
        :src="image"
        :alt="title"
        class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div class="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent"></div>
      <span
        class="absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur"
        :class="badgeClass"
      >
        {{ badgeLabel }}
      </span>
    </div>

    <div class="p-5">
      <h2 class="line-clamp-1 text-xl font-black text-white">{{ title }}</h2>

      <p class="mt-2 text-sm text-neutral-400">
        {{ artist }}
      </p>

      <div class="mt-5 flex items-end justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-neutral-500">Price</p>
          <span class="text-2xl font-black text-amber-200">
          ${{ price }}
        </span>
        </div>

        <router-link
          :to="`/artwork/${id}`"
          class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white transition hover:border-amber-200/50 hover:text-amber-100"
          @click.stop
        >
          View
        </router-link>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
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

const badgeLabel = computed(() => {
  if (props.saleType === 'bid') return 'Live Bid'
  if (props.saleType === 'both') return 'Sale + Bid'
  return 'On Sale'
})

const badgeClass = computed(() => {
  if (props.saleType === 'bid') return 'border-rose-300/30 bg-rose-400/20 text-rose-100'
  if (props.saleType === 'both') return 'border-violet-300/30 bg-violet-400/20 text-violet-100'
  return 'border-emerald-300/30 bg-emerald-400/20 text-emerald-100'
})

const goToArtwork = () => {

  router.push(`/artwork/${props.id}`)

}

</script>
