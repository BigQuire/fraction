import axios from 'axios'

const API_URL = 'http://192.168.82.1:5173/api/artworks'

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

export const placeBid = async (id, username, bidAmount) => {

  const response = await axios.put(`${API_URL}/${id}/bid`, {username, bidAmount,})
  return response.data
}