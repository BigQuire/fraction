<template>
  <nav class="bg-black border-b border-gray-800 px-8 py-4 flex justify-between items-center">

    <router-link to="/" class="absolute transform -translate-x-1/2">
      <img
        src="/src/assets/fraction-logo.png"
        alt="Fraction Logo"
        class="w-24 h-auto"
      />
    </router-link>

    <div class="flex gap-10 text-white text-lg font-bold">
      <router-link to="/" class="right-2">Hom</router-link>
      <router-link to="/" class="right-2">Home</router-link>
      <router-link to="/marketplace" class="left-2">Marketplace</router-link>
      <router-link to="/dashboard" class="left-2">Dashboard</router-link>
    </div>
    <div v-if="!user">
      <router-link to="/login">
        <button class="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl font-semibold transition">
          Login
        </button>
      </router-link>
    </div>
    <div v-else class="flex items-center gap-4">
      <router-link to="/dashboard">
        <img src="" alt="Profile Picture" class="w-10 h-10 rounded-full object-cover"/>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const user = computed(() => {
  return JSON.parse(
    localStorage.getItem('user')
  )
})

</script>
