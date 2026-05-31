const express = require('express')
const router = express.Router()

const multer = require('multer')

const { CloudinaryStorage } = require('multer-storage-cloudinary')

const cloudinary = require('../config/cloudinary')

const Product = require('../models/Product')
const User = require('../models/User')

const BID_INCREMENT = 1
const STARTING_BID = 1
const RESALE_COOLDOWN_DAYS = 7

const getSellerUsername = (artwork) => artwork.owner || artwork.artist

const refreshUserNetWorth = async (username) => {
  if (!username) return null

  const ownedArtworks = await Product.find({ owner: username })
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
    throw new Error('This product is in resale cooldown')
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
  let safetyLimit = 10000

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
      folder: 'fraction-products',
      resource_type: 'image',
    }
  },
})

const upload = multer({ storage })

router.get('/', async (req, res) => {
  try {
    const artworks = await Product.find({
      removedByAdmin: { $ne: true },
      $or: [
        { stockCount: { $gt: 0 } },
        { stockCount: { $exists: false } },
      ],
    }).lean()
    const sellers = await User.find({
      username: { $in: artworks.map((artwork) => artwork.owner || artwork.artist) },
    }).lean()
    const sellerMap = new Map(sellers.map((seller) => [seller.username, seller]))
    const rankedArtworks = artworks
      .map((artwork) => {
        const seller = sellerMap.get(artwork.owner || artwork.artist)
        return {
          ...artwork,
          sellerRating: seller?.sellerRating || 0,
          sellerReviewCount: seller?.reviewCount || 0,
          sellerVerified: seller?.isVerifiedSeller || false,
        }
      })
      .sort((a, b) => {
        const bScore = (b.sellerVerified ? 2 : 0) + Number(b.sellerRating || 0)
        const aScore = (a.sellerVerified ? 2 : 0) + Number(a.sellerRating || 0)
        return bScore - aScore
      })

    res.status(200).json(rankedArtworks)
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

      const {
        title,
        artist,
        description,
        price,
        saleType,
        category,
        productType,
        condition,
        sealed,
        authenticityNotes,
      } = req.body

      const artwork = new Product({
        title,
        artist,
        description,
        price,
        saleType,
        category,
        productType,
        stockCount: Math.max(Number(req.body.stockCount || 1), 0),
        condition,
        sealed: sealed === 'true' || sealed === true,
        authenticityNotes,
        imageUrl: req.file.path,
        owner: artist,
        ownedAt: new Date(),
        priceHistory: [
          {
            price: Number(price),
            event: 'initial-listing',
            seller: artist,
          },
        ],
      })
      await artwork.save()
      await refreshUserNetWorth(artist)

      res.status(201).json({
        message: 'Product uploaded successfully',
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
    const artworks = await Product.find({
      artist: req.params.artist,
      removedByAdmin: { $ne: true },
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
    const artworks = await Product.find({
      owner: req.params.owner,
      removedByAdmin: { $ne: true },
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
    const artwork = await Product.findById(req.params.id).lean()
    const seller = await User.findOne({ username: artwork?.owner || artwork?.artist }).lean()
    res.status(200).json({
      ...artwork,
      sellerRating: seller?.sellerRating || 0,
      sellerReviewCount: seller?.reviewCount || 0,
      sellerVerified: seller?.isVerifiedSeller || false,
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      error: error.message,
    })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.status(200).json({
      message: 'Product deleted successfully',
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
    const artwork = await Product.findById(req.params.id)

    if (!artwork) {
      return res.status(404).json({
        error: 'Product not found',
      })
    }

    validateListingUpdate(artwork, req.body)

    const updatedArtwork =
      await Product.findByIdAndUpdate(
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
    const artwork = await Product.findById(req.params.id)

    if (!artwork) {
      return res.status(404).json({
        error: 'Product not found',
      })
    }

    if (artwork.owner !== username) {
      return res.status(403).json({
        error: 'Only the owner can list this product',
      })
    }

    if (isCooldownActive(artwork)) {
      return res.status(400).json({
        error: `Resale available after ${artwork.resaleAvailableAt.toDateString()}`,
      })
    }

    artwork.saleType = saleType || 'sale'

    if (artwork.saleType === 'bid') {
      artwork.currentBid = STARTING_BID
      artwork.highestBidder = ''
      artwork.autoBids = []
      artwork.bidEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
    } else {
      artwork.price = Number(price || artwork.price)
      artwork.priceHistory.push({
        price: artwork.price,
        event: 'listing',
        seller: username,
      })
    }

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
    const { username, shippingDetails = {} } = req.body
    const artwork = await Product.findById(req.params.id)

    if (!artwork) {
      return res.status(404).json({
        error: 'Product not found',
      })
    }

    if (!['sale', 'both'].includes(artwork.saleType)) {
      return res.status(400).json({
        error: 'This product is not available for direct purchase',
      })
    }

    if (Number(artwork.stockCount ?? 1) <= 0) {
      return res.status(400).json({
        error: 'This product is out of stock',
      })
    }

    const sellerUsername = getSellerUsername(artwork)

    if (sellerUsername === username) {
      return res.status(400).json({
        error: 'You cannot buy your own product',
      })
    }

    const requiredShippingFields = [
      'fullName',
      'phone',
      'addressLine1',
      'city',
      'state',
      'postalCode',
      'country',
    ]
    const missingShippingField = requiredShippingFields.find(
      (field) => !String(shippingDetails[field] || '').trim()
    )

    if (missingShippingField) {
      return res.status(400).json({
        error: 'Complete the shipping details before purchasing',
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

    if (seller) {
      seller.walletBalance += price
      seller.tickets += 1
      await seller.save()
    }

    buyer.walletBalance -= price
    buyer.tickets += 1
    buyer.netWorth += price
    buyer.purchases.push({
      product: artwork._id,
      title: artwork.title,
      seller: sellerUsername,
      price,
      shippingStatus: 'pending-shipment',
    })
    buyer.inventory.push({
      name: artwork.title,
      rarity: 'Purchased',
      source: 'purchase',
      product: artwork._id,
      price,
      imageUrl: artwork.imageUrl,
      description: artwork.description,
      status: 'stored',
    })
    await buyer.save()

    artwork.stockCount = Math.max(Number(artwork.stockCount ?? 1) - 1, 0)
    artwork.lastSalePrice = price
    if (artwork.stockCount === 0) {
      artwork.saleType = 'sold-out'
      artwork.currentBid = 0
      artwork.highestBidder = ''
      artwork.autoBids = []
    }
    artwork.priceHistory.push({
      price,
      event: 'sale',
      buyer: username,
      seller: sellerUsername,
    })
    artwork.purchaseHistory.push({
      buyer: username,
      quantity: 1,
      price,
      shippingDetails,
      status: 'pending-shipment',
    })
    await artwork.save()

    const updatedBuyer = await User.findOne({ username })
      .populate('wishlist')
      .populate('purchases.product')
      .populate('inventory.product')
    await refreshUserNetWorth(sellerUsername)

    res.status(200).json({
      artwork,
      user: updatedBuyer,
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
    const artwork = await Product.findById(
      req.params.id
    )
    if (!artwork) {
      return res.status(404).json({
        error: 'Product not found',
      })
    }

    if (getSellerUsername(artwork) === username) {
      return res.status(400).json({
        error: 'You cannot bid on your own product',
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
    const maxBidAmount = Number(maxBid)
    const artwork = await Product.findById(req.params.id)

    if (!artwork) {
      return res.status(404).json({
        error: 'Product not found',
      })
    }

    if (!Number.isFinite(maxBidAmount) || maxBidAmount <= Number(artwork.currentBid || 0)) {
      return res.status(400).json({
        error: 'Auto bid maximum must be higher than the current bid',
      })
    }

    if (getSellerUsername(artwork) === username) {
      return res.status(400).json({
        error: 'You cannot auto bid on your own product',
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
      existingAutoBid.maxBid = maxBidAmount
      existingAutoBid.active = true
    } else {
      artwork.autoBids.push({
        username,
        maxBid: maxBidAmount,
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
