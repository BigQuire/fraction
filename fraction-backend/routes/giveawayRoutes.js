const express = require('express')
const router = express.Router()

const Giveaway = require('../models/Giveaway')
const User = require('../models/User')

router.get('/', async (req, res) => {
  try {
    const giveaways = await Giveaway.find().sort({ createdAt: -1 })
    res.status(200).json(giveaways)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/:id/join', async (req, res) => {
  try {
    const { username } = req.body
    const giveaway = await Giveaway.findById(req.params.id)
    const user = await User.findOne({ username })

    if (!giveaway || giveaway.status !== 'active') {
      return res.status(404).json({ error: 'Giveaway not available' })
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.tickets < giveaway.ticketCost) {
      return res.status(400).json({ error: 'Not enough tickets' })
    }

    user.tickets -= giveaway.ticketCost
    giveaway.entries.push({
      username,
      ticketsUsed: giveaway.ticketCost,
    })

    await user.save()
    await giveaway.save()

    res.status(200).json({ giveaway, user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
