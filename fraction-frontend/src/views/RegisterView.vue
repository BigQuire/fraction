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
            Join the marketplace built for digital art collectors.
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
          <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Create account</p>
          <h2 class="mt-3 text-4xl font-black text-white">Register</h2>

          <form class="mt-8 space-y-5" @submit.prevent="handleRegister">
            <input v-model="form.username" type="text" placeholder="Username" class="field" required />
            <input v-model="form.email" type="email" placeholder="Email" class="field" required />
            <input v-model="form.password" type="password" placeholder="Password" class="field" required />

            <p v-if="message" class="text-sm font-semibold" :class="hasError ? 'text-rose-300' : 'text-emerald-300'">
              {{ message }}
            </p>

            <button class="premium-button w-full" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Creating account...' : 'Register' }}
            </button>

            <router-link to="/" class="secondary-button w-full">
              Continue as Guest
            </router-link>
          </form>

          <p class="mt-6 text-center text-sm text-neutral-400">
            Already have an account?
            <router-link to="/login" class="font-semibold text-amber-200 hover:text-amber-100">
              Login
            </router-link>
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { registerUser } from '../services/userService'

const router = useRouter()
const message = ref('')
const hasError = ref(false)
const isSubmitting = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
})

const handleRegister = async () => {
  isSubmitting.value = true
  message.value = ''
  hasError.value = false

  try {
    await registerUser(form)
    message.value = 'Account created. Redirecting to login...'
    setTimeout(() => router.push('/login'), 700)
  } catch (error) {
    hasError.value = true
    message.value = error.response?.data?.error || 'Could not create account.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
