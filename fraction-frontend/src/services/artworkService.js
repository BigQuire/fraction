import axios from 'axios'

const API_URL = 'https://fraction-hfg4.onrender.com/api/artworks'

export const getArtworks = async () => {

  const response = await axios.get(API_URL)
  return response.data
}

export const getArtworkById = async (id) => {

  const response = await axios.get(`${API_URL}/${id}`)
  return response.data
}

export const getArtistArtworks = async (artist) => {

  const response = await axios.get(`${API_URL}/artist/${artist}`)
  return response.data
}


export const deleteArtwork = async (id) => {

  const response = await axios.delete(`${API_URL}/${id}`)
  return response.data
}

export const updateArtwork = async (id, updatedData) => {

  const response = await axios.put(`${API_URL}/${id}`, updatedData)
  return response.data
}

export const uploadArtwork = async (formData) => {

  const response = await axios.post(`${API_URL}/upload`, formData)
  return response.data
}

export const placeBid = async (id, username, bidAmount) => {

  const response = await axios.put(`${API_URL}/${id}/bid`, {username, bidAmount,})
  return response.data
}

export const setAutoBid = async (id, username, maxBid) => {

  const response = await axios.put(`${API_URL}/${id}/auto-bid`, { username, maxBid })
  return response.data
}
