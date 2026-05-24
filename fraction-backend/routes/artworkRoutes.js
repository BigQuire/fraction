const express = require('express')
const router = express.Router()

const multer = require('multer')

const { CloudinaryStorage } = require('multer-storage-cloudinary')

const cloudinary = require('../config/cloudinary')

const Artwork = require('../models/Artwork')
const User = require('../models/User')

const storage = new CloudinaryStorage({

  cloudinary,
  params: {
    folder: 'fraction-artworks',
  },
})

const upload = multer({ storage })

router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find()
    res.status(200).json(artworks)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      error: error.message,
    })
  }
})

router.post(
  '/upload',
  upload.single('image'),

  async (req, res) => {

    try {
      console.log('File:')
      console.log(req.file)
      console.log('Body:')
      console.log(req.body)
      if(!req.file){
        return res.status(400).json({
          error: 'No file uploaded'
        })
      }

      const {title, artist, description, price, saleType,} = req.body

      const artwork = new Artwork({title, artist, description, price, saleType, imageUrl: req.file.path,})
      console.log(req.file)
      await artwork.save()

      res.status(201).json({
        message: 'Artwork uploaded successfully',
        artwork,
      })
    } catch (error) {
      console.log('Upload error:')
      console.log(error)

      res.status(500).json({
        error: error.message,
      })
    }
  }
)

router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
    res.status(200).json(artwork)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      error: error.message,
    })
  }
})

module.exports = router

router.get('/artist/:artist', async (req, res) => {
  try {
    const artworks = await Artwork.find({
      artist: req.params.artist,
    })
    res.status(200).json(artworks)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      error: error.message,
    })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await Artwork.findByIdAndDelete(req.params.id)
    res.status(200).json({
      message: 'Artwork deleted successfully',
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: error.message,
    })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const updatedArtwork =
      await Artwork.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      )
    res.status(200).json(updatedArtwork)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: error.message,
    })
  }
})

router.put('/:id/bid', async (req, res) => {
  try {
    const { username, bidAmount } = req.body
    const artwork = await Artwork.findById(
      req.params.id
    )
    const user = await User.findOne({
      username,
    })
    if (!artwork || !user) {
      return res.status(404).json({
        error: 'Artwork or user not found',
      })
    }

    // Wallet check
    if (user.walletBalance < bidAmount) {
      return res.status(400).json({
        error: 'Insufficient wallet balance',
      })
    }

    // Bid must be higher
    if (bidAmount <= artwork.currentBid) {
      return res.status(400).json({
        error: 'Bid must be higher',
      })
    }
    artwork.currentBid = bidAmount
    artwork.highestBidder = username
    await artwork.save()
    res.status(200).json(artwork)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: error.message,
    })
  }
})