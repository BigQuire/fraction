const express = require('express')
const router = express.Router()

const multer = require('multer')

const { CloudinaryStorage } = require('multer-storage-cloudinary')

const cloudinary = require('../config/cloudinary')

const Artwork = require('../models/Artwork')
const User = require('../models/User')

const BID_INCREMENT = 10
const RESALE_COOLDOWN_DAYS = 7

const getSellerUsername = (artwork) => artwork.owner || artwork.artist

const refreshUserNetWorth = async (username) => {
  if (!username) return null

  const ownedArtworks = await Artwork.find({ owner: username })
  const netWorth = ownedArtworks.reduce(
    (total, artwork) => total + Number(artwork.price || 0),
    0
  )

  return User.findOneAndUpdate(
    { username },
    {
      netWorth,
      artworkNumbers: ownedArtworks.length,
    },
    { new: true }
  )
}

const isCooldownActive = (artwork) => {
  return artwork.resaleAvailableAt && new Date(artwork.resaleAvailableAt) > new Date()
}

const validateListingUpdate = (artwork, updatedData) => {
  const listingSaleTypes = ['sale', 'bid', 'both']

  if (
    updatedData.saleType
    && listingSaleTypes.includes(updatedData.saleType)
    && isCooldownActive(artwork)
  ) {
    throw new Error('This artwork is in resale cooldown')
  }
}

const settleBid = async (artwork, username, bidAmount) => {
  const amount = Number(bidAmount)
  const currentBid = Number(artwork.currentBid || 0)
  const previousBidder = artwork.highestBidder

  if (amount <= currentBid) {
    throw new Error('Bid must be higher')
  }

  const user = await User.findOne({ username })

  if (!user) {
    throw new Error('User not found')
  }

  const amountToCharge = previousBidder === username
    ? amount - currentBid
    : amount

  if (user.walletBalance < amountToCharge) {
    throw new Error('Insufficient wallet balance')
  }

  if (previousBidder && previousBidder !== username && currentBid > 0) {
    await User.findOneAndUpdate(
      { username: previousBidder },
      { $inc: { walletBalance: currentBid } }
    )
  }

  user.walletBalance -= amountToCharge
  await user.save()

  artwork.currentBid = amount
  artwork.highestBidder = username
}

const processAutoBids = async (artwork) => {
  let safetyLimit = 50

  while (safetyLimit > 0) {
    safetyLimit -= 1

    const currentBid = Number(artwork.currentBid || 0)
    const nextBid = currentBid + BID_INCREMENT
    const activeAutoBids = [...(artwork.autoBids || [])]
      .filter((autoBid) =>
        autoBid.active
        && autoBid.username !== artwork.highestBidder
        && Number(autoBid.maxBid) >= nextBid
      )
      .sort((a, b) => Number(b.maxBid) - Number(a.maxBid))

    if (!activeAutoBids.length) {
      break
    }

    const autoBid = activeAutoBids[0]
    const nextAmount = Math.min(Number(autoBid.maxBid), nextBid)

    try {
      await settleBid(artwork, autoBid.username, nextAmount)
    } catch (error) {
      const storedAutoBid = artwork.autoBids.find(
        (item) => item.username === autoBid.username
      )

      if (storedAutoBid) {
        storedAutoBid.active = false
      }
    }
  }
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'fraction-artworks',
      resource_type: 'image',
    }
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
      if(!req.file){
        return res.status(400).json({
          error: 'No file uploaded'
        })
      }

      const {title, artist, description, price, saleType, category,} = req.body

      const artwork = new Artwork({
        title,
        artist,
        description,
        price,
        saleType,
        category,
        imageUrl: req.file.path,
        owner: artist,
        ownedAt: new Date(),
      })
      await artwork.save()
      await refreshUserNetWorth(artist)

      res.status(201).json({
        message: 'Artwork uploaded successfully',
        artwork,
      })
    } catch (error) {
      console.log(error)

      res.status(500).json({
        error: error.message,
      })
    }
  }
)

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

router.get('/owner/:owner', async (req, res) => {
  try {
    const artworks = await Artwork.find({
      owner: req.params.owner,
    })
    res.status(200).json(artworks)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      error: error.message,
    })
  }
})

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
    const artwork = await Artwork.findById(req.params.id)

    if (!artwork) {
      return res.status(404).json({
        error: 'Artwork not found',
      })
    }

    validateListingUpdate(artwork, req.body)

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

router.put('/:id/list', async (req, res) => {
  try {
    const { username, price, saleType } = req.body
    const artwork = await Artwork.findById(req.params.id)

    if (!artwork) {
      return res.status(404).json({
        error: 'Artwork not found',
      })
    }

    if (artwork.owner !== username) {
      return res.status(403).json({
        error: 'Only the owner can list this artwork',
      })
    }

    if (isCooldownActive(artwork)) {
      return res.status(400).json({
        error: `Resale available after ${artwork.resaleAvailableAt.toDateString()}`,
      })
    }

    artwork.price = Number(price || artwork.price)
    artwork.saleType = saleType || 'sale'
    await artwork.save()
    await refreshUserNetWorth(username)

    res.status(200).json(artwork)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: error.message,
    })
  }
})

router.put('/:id/purchase', async (req, res) => {
  try {
    const { username } = req.body
    const artwork = await Artwork.findById(req.params.id)

    if (!artwork) {
      return res.status(404).json({
        error: 'Artwork not found',
      })
    }

    if (!['sale', 'both'].includes(artwork.saleType)) {
      return res.status(400).json({
        error: 'This artwork is not available for direct purchase',
      })
    }

    const sellerUsername = getSellerUsername(artwork)

    if (sellerUsername === username) {
      return res.status(400).json({
        error: 'You already own this artwork',
      })
    }

    const buyer = await User.findOne({ username })
    const seller = await User.findOne({ username: sellerUsername })
    const price = Number(artwork.price || 0)

    if (!buyer) {
      return res.status(404).json({
        error: 'Buyer not found',
      })
    }

    if (buyer.walletBalance < price) {
      return res.status(400).json({
        error: 'Insufficient wallet balance',
      })
    }

    buyer.walletBalance -= price
    await buyer.save()

    if (seller) {
      seller.walletBalance += price
      await seller.save()
    }

    artwork.previousOwner = sellerUsername
    artwork.owner = username
    artwork.ownedAt = new Date()
    artwork.resaleAvailableAt = new Date(
      Date.now() + RESALE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    )
    artwork.lastSalePrice = price
    artwork.saleType = 'owned'
    artwork.currentBid = 0
    artwork.highestBidder = ''
    artwork.autoBids = []
    await artwork.save()

    const updatedBuyer = await refreshUserNetWorth(username)
    await refreshUserNetWorth(sellerUsername)

    res.status(200).json({
      artwork,
      user: updatedBuyer,
      resaleAvailableAt: artwork.resaleAvailableAt,
    })
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
    if (!artwork) {
      return res.status(404).json({
        error: 'Artwork not found',
      })
    }

    if (getSellerUsername(artwork) === username) {
      return res.status(400).json({
        error: 'You cannot bid on your own artwork',
      })
    }

    await settleBid(artwork, username, bidAmount)
    await processAutoBids(artwork)
    await artwork.save()
    res.status(200).json(artwork)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: error.message,
    })
  }
})

router.put('/:id/auto-bid', async (req, res) => {
  try {
    const { username, maxBid } = req.body
    const artwork = await Artwork.findById(req.params.id)

    if (!artwork) {
      return res.status(404).json({
        error: 'Artwork not found',
      })
    }

    if (getSellerUsername(artwork) === username) {
      return res.status(400).json({
        error: 'You cannot auto bid on your own artwork',
      })
    }

    const user = await User.findOne({ username })

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      })
    }

    if (user.walletBalance <= 0) {
      return res.status(400).json({
        error: 'Insufficient wallet balance',
      })
    }

    const existingAutoBid = artwork.autoBids.find(
      (autoBid) => autoBid.username === username
    )

    if (existingAutoBid) {
      existingAutoBid.maxBid = Number(maxBid)
      existingAutoBid.active = true
    } else {
      artwork.autoBids.push({
        username,
        maxBid: Number(maxBid),
        active: true,
      })
    }

    await processAutoBids(artwork)
    await artwork.save()

    res.status(200).json(artwork)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: error.message,
    })
  }
})

module.exports = router
