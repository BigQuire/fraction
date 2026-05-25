const express = require('express')
const router = express.Router()

const Commission = require('../models/Commission')

router.post('/', async (req, res) => {
  try {
    const commission = new Commission(req.body)
    await commission.save()
    res.status(201).json(commission)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/artist/:artist', async (req, res) => {
  try {
    const commissions = await Commission.find({ artist: req.params.artist }).sort({ createdAt: -1 })
    res.status(200).json(commissions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/user/:username', async (req, res) => {
  try {
    const commissions = await Commission.find({ fromUser: req.params.username }).sort({ createdAt: -1 })
    res.status(200).json(commissions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id/status', async (req, res) => {
  try {
    const commission = await Commission.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    res.status(200).json(commission)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
