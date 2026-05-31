const express = require('express')
const router = express.Router()

const Review = require('../models/Review')
const User = require('../models/User')

const refreshSellerRating = async (seller) => {
  const reviews = await Review.find({ seller })
  const reviewCount = reviews.length
  const sellerRating = reviewCount
    ? reviews.reduce((total, review) => total + Number(review.rating), 0) / reviewCount
    : 0

  await User.findOneAndUpdate(
    { username: seller },
    { sellerRating, reviewCount },
    { new: true }
  )

  return { sellerRating, reviewCount }
}

router.post('/', async (req, res) => {
  try {
    const review = new Review(req.body)
    await review.save()
    const summary = await refreshSellerRating(review.seller)

    res.status(201).json({
      review,
      summary,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

router.get('/seller/:seller', async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.seller }).sort({ createdAt: -1 })
    const seller = await User.findOne({ username: req.params.seller })

    res.status(200).json({
      reviews,
      summary: {
        sellerRating: seller?.sellerRating || 0,
        reviewCount: seller?.reviewCount || 0,
        isVerifiedSeller: seller?.isVerifiedSeller || false,
      },
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

module.exports = router
