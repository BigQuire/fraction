import axios from 'axios'

const API_URL = 'https://fraction-hfg4.onrender.com/api/reviews'

export const createReview = async (reviewData) => {
  const response = await axios.post(API_URL, reviewData)
  return response.data
}

export const getSellerReviews = async (seller) => {
  const response = await axios.get(`${API_URL}/seller/${seller}`)
  return response.data
}
