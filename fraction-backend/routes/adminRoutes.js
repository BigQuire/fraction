const express = require('express')
const router = express.Router()

const Artwork = require('../models/Artwork')
const Giveaway = require('../models/Giveaway')
const User = require('../models/User')

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fraction.test'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

const requireAdmin = (req, res, next) => {
  if (req.headers['x-admin-key'] !== 'fraction-admin-demo') {
    return res.status(401).json({ error: 'Admin access required' })
  }

  next()
}

router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.status(200).json({
      token: 'fraction-admin-demo',
      email,
    })
  }

  return res.status(401).json({
    error: 'Invalid admin credentials',
  })
})

router.get('/products', requireAdmin, async (req, res) => {
  try {
    const products = await Artwork.find().sort({ createdAt: -1 })
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/products/:id/remove', requireAdmin, async (req, res) => {
  try {
    const product = await Artwork.findByIdAndUpdate(
      req.params.id,
      {
        removedByAdmin: true,
        removalReason: req.body.reason || 'Removed by admin',
        saleType: 'removed',
      },
      { new: true }
    )

    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/verification-requests', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({
      verificationStatus: 'pending',
    }).sort({ 'verificationRequest.submittedAt': -1 })

    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/verification-requests/:username', requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body
    const approved = status === 'approved'
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      {
        isVerifiedSeller: approved,
        verificationStatus: approved ? 'approved' : 'rejected',
        'verificationRequest.adminNote': adminNote || '',
        'verificationRequest.reviewedAt': new Date(),
      },
      { new: true }
    )

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/giveaways', requireAdmin, async (req, res) => {
  try {
    const giveaway = new Giveaway(req.body)
    await giveaway.save()
    res.status(201).json(giveaway)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
