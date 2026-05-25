const express = require('express')
const router = express.Router()

const User = require('../models/User')

router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate('wishlist')

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

router.post('/register', async (req, res) => {
  try {

    const { username, email, password } = req.body

    const newUser = new User({
      username,
      email,
      password,
    })

    await newUser.save()

    res.status(201).json({
      message: 'User registered successfully',
    })

  } catch (error) {

    res.status(500).json({
      error: error.message,
    })

  }
})

router.put('/:username/settings', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { settings: req.body },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

router.post('/:username/wishlist/:artworkId', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate('wishlist')

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const exists = user.wishlist.some(
      (artwork) => artwork._id.toString() === req.params.artworkId
    )

    if (!exists) {
      user.wishlist.push(req.params.artworkId)
      await user.save()
    }

    await user.populate('wishlist')
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

router.delete('/:username/wishlist/:artworkId', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    user.wishlist = user.wishlist.filter(
      (artworkId) => artworkId.toString() !== req.params.artworkId
    )

    await user.save()
    await user.populate('wishlist')
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {

      return res.status(404).json({
        message: 'User not found',
      })

    }

    if (user.password !== password) {

      return res.status(401).json({
        message: 'Invalid password',
      })

    }

    res.status(200).json({
      message: 'Login successful',
      user,
    })

  } catch (error) {

    res.status(500).json({
      error: error.message,
    })

  }

})

module.exports = router
