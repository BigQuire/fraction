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
    const { username, entryCount = 1 } = req.body
    const entries = Number(entryCount)
    const giveaway = await Giveaway.findById(req.params.id)
    const user = await User.findOne({ username })

    if (!giveaway || giveaway.status !== 'active') {
      return res.status(404).json({ error: 'Giveaway not available' })
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!Number.isInteger(entries) || entries <= 0) {
      return res.status(400).json({ error: 'Entry count must be at least 1' })
    }

    const ticketsNeeded = entries

    if (user.tickets < ticketsNeeded) {
      return res.status(400).json({ error: 'Not enough tickets' })
    }

    user.tickets -= ticketsNeeded
    giveaway.entries.push(
      ...Array.from({ length: entries }, () => ({
        username,
        ticketsUsed: 1,
      }))
    )

    await user.save()
    await giveaway.save()

    res.status(200).json({ giveaway, user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
