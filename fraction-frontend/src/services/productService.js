import axios from 'axios'

const API_URL = 'https://fraction-hfg4.onrender.com/api/products'

export const getProducts = async () => {

  const response = await axios.get(API_URL)
  return response.data
}

export const getProductById = async (id) => {

  const response = await axios.get(`${API_URL}/${id}`)
  return response.data
}

export const getSellerProducts = async (artist) => {

  const response = await axios.get(`${API_URL}/artist/${artist}`)
  return response.data
}

export const getOwnerProducts = async (owner) => {

  const response = await axios.get(`${API_URL}/owner/${owner}`)
  return response.data
}


export const deleteProduct = async (id) => {

  const response = await axios.delete(`${API_URL}/${id}`)
  return response.data
}

export const updateProduct = async (id, updatedData) => {

  const response = await axios.put(`${API_URL}/${id}`, updatedData)
  return response.data
}

export const uploadProduct = async (formData) => {

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

export const purchaseProduct = async (id, username, shippingDetails) => {

  const response = await axios.put(`${API_URL}/${id}/purchase`, { username, shippingDetails })
  return response.data
}

export const listProductForSale = async (id, listingData) => {

  const response = await axios.put(`${API_URL}/${id}/list`, listingData)
  return response.data
}

export const markOrderShipped = async (id, purchaseId, username, trackingCode) => {

  const response = await axios.put(`${API_URL}/${id}/orders/${purchaseId}/shipped`, { username, trackingCode })
  return response.data
}

export const getArtworks = getProducts
export const getArtworkById = getProductById
export const getArtistArtworks = getSellerProducts
export const getOwnerArtworks = getOwnerProducts
export const deleteArtwork = deleteProduct
export const updateArtwork = updateProduct
export const uploadArtwork = uploadProduct
export const purchaseArtwork = purchaseProduct
export const listArtworkForSale = listProductForSale
