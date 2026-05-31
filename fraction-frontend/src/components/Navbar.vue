<template>
  <header class="sticky top-0 z-40 border-b border-white/10 bg-black/75 backdrop-blur-xl">
    <nav class="page-shell flex h-20 items-center justify-between">
    <router-link to="/" class="flex items-center gap-3">
      <img
        src="/src/assets/fraction-logo.png"
        alt="Fraction Logo"
        class="h-11 w-auto"
      />
      <span class="hidden text-lg font-black tracking-wide text-white sm:block">Fraction</span>
    </router-link>

    <div class="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold text-neutral-300 md:flex">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="rounded-full px-5 py-2 transition hover:text-white"
        :class="$route.path === item.to ? 'bg-white text-neutral-950' : ''"
      >
        {{ item.label }}
      </router-link>
    </div>

    <button class="secondary-button px-4 py-2 md:hidden" @click="isMenuOpen = !isMenuOpen">
      Menu
    </button>

    <div v-if="!user" class="flex items-center gap-3">
      <router-link to="/register" class="hidden text-sm font-semibold text-neutral-300 transition hover:text-white sm:block">
        Register
      </router-link>
      <router-link to="/login" class="premium-button">
          Login
      </router-link>
    </div>

    <div v-else class="flex items-center gap-3">
      <router-link to="/dashboard" class="hidden text-sm font-semibold text-neutral-300 transition hover:text-white sm:block">
        Dashboard
      </router-link>
      <router-link to="/dashboard" class="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/30 bg-amber-200/15 text-sm font-black text-amber-100">
        {{ userInitial }}
      </router-link>
    </div>
  </nav>

  <div v-if="isMenuOpen" class="border-t border-white/10 bg-black/95 px-5 py-4 md:hidden">
    <div class="grid gap-2">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="rounded-2xl px-4 py-3 text-sm font-bold text-neutral-200 hover:bg-white/10"
        @click="isMenuOpen = false"
      >
        {{ item.label }}
      </router-link>
      <router-link
        v-if="user"
        to="/dashboard"
        class="rounded-2xl px-4 py-3 text-sm font-bold text-neutral-200 hover:bg-white/10"
        @click="isMenuOpen = false"
      >
        Dashboard
      </router-link>
    </div>
  </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const $route = useRoute()
const isMenuOpen = ref(false)

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/marketplace', label: 'Marketplace' },
]

const user = computed(() => {
  return JSON.parse(
    localStorage.getItem('user')
  )
})

const userInitial = computed(() => {
  return user.value?.username?.charAt(0)?.toUpperCase() || 'U'
})
</script>
