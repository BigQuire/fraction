import axios from 'axios'

const API_URL = 'http://192.168.82.1:5173/api/users'

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