import axios from 'axios'

const API_URL = 'https://fraction-hfg4.onrender.com/api/users'

export const registerUser = async (userData) => {

  const response = await axios.post(
    `${API_URL}/register`,
    userData
  )

  return response.data
}

export const loginUser = async (userData) => {

  const response = await axios.post(
    `${API_URL}/login`,
    userData
  )

  return response.data
}

export const getUserProfile = async (username) => {

  const response = await axios.get(`${API_URL}/${username}`)
  return response.data
}

export const updateUserSettings = async (username, settings) => {

  const response = await axios.put(`${API_URL}/${username}/settings`, settings)
  return response.data
}

export const addWalletBalance = async (username, amount) => {

  const response = await axios.put(`${API_URL}/${username}/wallet`, { amount })
  return response.data
}

export const updateUserProfile = async (username, profile) => {

  const response = await axios.put(`${API_URL}/${username}/profile`, profile)
  return response.data
}

export const addToWishlist = async (username, artworkId) => {

  const response = await axios.post(`${API_URL}/${username}/wishlist/${artworkId}`)
  return response.data
}

export const removeFromWishlist = async (username, artworkId) => {

  const response = await axios.delete(`${API_URL}/${username}/wishlist/${artworkId}`)
  return response.data
}
