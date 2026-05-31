import axios from 'axios'

const API_URL = 'https://fraction-hfg4.onrender.com/api/admin'

const adminHeaders = () => ({
  'x-admin-key': localStorage.getItem('admin-token') || '',
})

export const loginAdmin = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials)
  return response.data
}

export const getAdminProducts = async () => {
  const response = await axios.get(`${API_URL}/products`, { headers: adminHeaders() })
  return response.data
}

export const removeAdminProduct = async (id, reason) => {
  const response = await axios.put(`${API_URL}/products/${id}/remove`, { reason }, { headers: adminHeaders() })
  return response.data
}

export const getVerificationRequests = async () => {
  const response = await axios.get(`${API_URL}/verification-requests`, { headers: adminHeaders() })
  return response.data
}

export const reviewVerificationRequest = async (username, data) => {
  const response = await axios.put(`${API_URL}/verification-requests/${username}`, data, { headers: adminHeaders() })
  return response.data
}

export const createAdminGiveaway = async (giveawayData) => {
  const response = await axios.post(`${API_URL}/giveaways`, giveawayData, { headers: adminHeaders() })
  return response.data
}

export const getAdminGiveaways = async () => {
  const response = await axios.get(`${API_URL}/giveaways`, { headers: adminHeaders() })
  return response.data
}

export const selectAdminGiveawayWinner = async (id) => {
  const response = await axios.put(`${API_URL}/giveaways/${id}/select-winner`, {}, { headers: adminHeaders() })
  return response.data
}

export const getAdminShippingRequests = async () => {
  const response = await axios.get(`${API_URL}/shipping-requests`, { headers: adminHeaders() })
  return response.data
}

export const fulfillAdminShippingRequest = async (username, shipmentId) => {
  const response = await axios.put(
    `${API_URL}/shipping-requests/${username}/${shipmentId}/fulfill`,
    {},
    { headers: adminHeaders() }
  )
  return response.data
}
