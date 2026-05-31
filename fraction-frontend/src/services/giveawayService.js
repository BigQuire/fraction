import axios from 'axios'

const API_URL = 'https://fraction-hfg4.onrender.com/api/giveaways'

export const getGiveaways = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

export const joinGiveaway = async (id, username) => {
  const response = await axios.post(`${API_URL}/${id}/join`, { username })
  return response.data
}
