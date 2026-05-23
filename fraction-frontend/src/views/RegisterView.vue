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
        <h2 class="text-4xl font-bold mb-8">Register</h2>

        <form class="space-y-6">
          <input v-model="form.username" type="text" placeholder="Username" class="w-full p-4 rounded-xl bg-black border border-gray-700"/>

          <input v-model="form.email" type="email" placeholder="Email" class="w-full p-4 rounded-xl bg-black border border-gray-700"/>

          <input v-model="form.password" type="password" placeholder="Password" class="w-full p-4 rounded-xl bg-black border border-gray-700"/>

          <div class="flex flex-col gap-4">
            <router-link to="/dashboard" class="w-full">
            <button @click="handleRegister" class="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-xl font-bold">
              Register
            </button>
            </router-link>
            <router-link to="/" class="w-full">
              <button class="w-full bg-gray-800 hover:bg-gray-700 py-4 rounded-xl font-bold">
                Continue as Guest
              </button>
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

import { registerUser } from '../services/userService'

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const handleRegister = async () => {

  try {

    console.log(form)
    const response = await registerUser(form)
    console.log(response)

  } catch (error) {
  console.log(error)

  res.status(500).json({
    message: error.message
  })
}
}

</script>