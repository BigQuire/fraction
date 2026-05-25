import axios from 'axios'

const API_URL = 'https://fraction-hfg4.onrender.com/api/commissions'

export const createCommission = async (commissionData) => {
  const response = await axios.post(API_URL, commissionData)
  return response.data
}

export const getArtistCommissions = async (artist) => {
  const response = await axios.get(`${API_URL}/artist/${artist}`)
  return response.data
}

export const getUserCommissions = async (username) => {
  const response = await axios.get(`${API_URL}/user/${username}`)
  return response.data
}

export const updateCommissionStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/${id}/status`, { status })
  return response.data
}
