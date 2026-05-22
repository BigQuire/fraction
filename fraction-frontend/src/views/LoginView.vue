<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2">
    <div class="hidden lg:flex items-center justify-center bg-black relative">
      <video autoplay muted loop class="absolute w-full h-full object-cover">
        <source src="/src/assets/fraction-video.mp4" type="video/mp4" />
      </video>

      <div class="relative z-10 text-center px-10">
        <h1 class="text-5xl font-bold mb-6 text-white">
         Fraction
        </h1>

        <p class="text-gray-300 text-xl">
          Collect rare hand-drawn digital art.
        </p>
      </div>
    </div>

    <div class="flex items-center justify-center bg-[#0F0F0F] p-10">
      <div class="bg-[#1A1A1A] p-10 rounded-2xl w-full max-w-md">
        <h2 class="text-4xl font-bold mb-8">Login</h2>

        <form class="space-y-6">
          <input v-model="email" type="email" placeholder="Email" class="w-full p-4 rounded-xl bg-black border border-gray-700"/>

          <input v-model="password" type="password" placeholder="Password" class="w-full p-4 rounded-xl bg-black border border-gray-700"/>

          <div class="flex flex-col gap-4">
            <router-link to="/dashboard" class="w-full">
              <button @click="handleLogin" class="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-xl font-bold">
              Login
              </button>
            </router-link>
            

            <router-link to="/" class="w-full">
              <button class="w-full bg-gray-800 hover:bg-gray-700 py-4 rounded-xl font-bold">
                Continue as Guest
              </button>
            </router-link>
          </div>
          <div><router-link to="/register">Don't have an account? Register here</router-link></div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import { loginUser } from '../services/userService'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {

  try {

    const userData = {
      email: email.value,
      password: password.value,
    }

    const response = await loginUser(userData)

    console.log(response)

    // Save logged in user
    localStorage.setItem(
      'user',
      JSON.stringify(response.user)
    )

    // Redirect to dashboard
    router.push('/dashboard')

  } catch (error) {

    console.error(error)

    alert('Invalid Email or Password')

  }

}
</script>