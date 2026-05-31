<template>
  <footer class="border-t border-white/10 bg-black/60">
    <div class="page-shell flex flex-col gap-4 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
      <p>Copyright 2026 Fraction. All rights reserved.</p>
      <div class="flex gap-5 text-neutral-400">
        <router-link to="/marketplace" class="transition hover:text-white">Marketplace</router-link>
        <router-link to="/gacha" class="transition hover:text-white">Gacha</router-link>
        <router-link to="/giveaway" class="transition hover:text-white">Giveaway</router-link>
        <router-link to="/dashboard" class="transition hover:text-white">Dashboard</router-link>
      </div>
    </div>
  </footer>
</template>
