<template>
  <main class="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <section class="relative hidden overflow-hidden bg-black lg:block">
      <video autoplay muted loop playsinline class="absolute inset-0 h-full w-full object-cover">
        <source src="/src/assets/fraction-video.mp4" type="video/mp4" />
      </video>
      <div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20"></div>
      <div class="relative flex h-full items-end p-12">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Fraction</p>
          <h1 class="mt-4 max-w-xl text-5xl font-black leading-tight text-white">
            Your collection deserves a beautiful command center.
          </h1>
        </div>
      </div>
    </section>

    <section class="flex items-center justify-center px-5 py-14">
      <div class="w-full max-w-md">
        <router-link to="/" class="mb-8 inline-flex text-sm font-semibold text-neutral-400 transition hover:text-white">
          Back to home
        </router-link>

        <div class="glass-panel rounded-2xl p-8">
          <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Welcome back</p>
          <h2 class="mt-3 text-4xl font-black text-white">Login</h2>

          <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
            <input v-model="email" type="email" placeholder="Email" class="field" required />
            <input v-model="password" type="password" placeholder="Password" class="field" required />

            <p v-if="errorMessage" class="text-sm font-semibold text-rose-300">
              {{ errorMessage }}
            </p>

            <button class="premium-button w-full" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Logging in...' : 'Login' }}
            </button>

            <router-link to="/" class="secondary-button w-full">
              Continue as Guest
            </router-link>
          </form>

          <p class="mt-6 text-center text-sm text-neutral-400">
            Don't have an account?
            <router-link to="/register" class="font-semibold text-amber-200 hover:text-amber-100">
              Register here
            </router-link>
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'

import { loginUser } from '../services/userService'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const router = useRouter()

const handleLogin = async () => {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const userData = {
      email: email.value,
      password: password.value,
    }

    const response = await loginUser(userData)

    localStorage.setItem('user', JSON.stringify(response.user))
    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Invalid email or password.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
