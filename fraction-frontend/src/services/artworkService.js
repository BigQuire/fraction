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

  const response = await fetch( `https://fraction-hfg4.onrender.com/api/artworks/${id}`, 
    { method: 'PUT', headers:  { 'Content-Type': 'application/json', }, 
      body: JSON.stringify(artworkData), 
  }) 
  return await response.json()
}

export const placeBid = async (id, username, bidAmount) => {

  const response = await axios.put(`${API_URL}/${id}/bid`, {username, bidAmount,})
  return response.data
}