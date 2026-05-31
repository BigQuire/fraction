const express = require('express')
const router = express.Router()

const User = require('../models/User')

const GACHA_COST = 100
const GACHA_DRAW_COUNTS = [1, 10, 50, 100]
const gachaPrizePool = [
  { name: 'Sealed Card Pack', rarity: 'Common', chance: 45, color: 'text-neutral-300', description: 'A starter collectible pack for your collection.', imageUrl: '' }, // Replace imageUrl with your common prize image later.
  { name: 'Limited Figure Voucher', rarity: 'Rare', chance: 30, color: 'text-sky-200', description: 'A rare voucher placeholder for future fulfilment.', imageUrl: '' }, // Replace imageUrl with your rare prize image later.
  { name: 'Premium Storage Case', rarity: 'Epic', chance: 18, color: 'text-violet-200', description: 'An epic accessory prize for collectors.', imageUrl: '' }, // Replace imageUrl with your epic prize image later.
  { name: 'Golden Collector Ticket', rarity: 'Legendary', chance: 7, color: 'text-amber-200', description: 'A top-tier prize placeholder for the detailed gacha system later.', imageUrl: '' }, // Replace imageUrl with your legendary prize image later.
]
const resaleValues = {
  Common: 20,
  Rare: 55,
  Epic: 140,
  Legendary: 400,
}

const populateUser = (query) => query
  .populate('wishlist')
  .populate('purchases.product')
  .populate('inventory.product')
  .populate('shipments.product')

const pickGachaPrize = () => {
  const roll = Math.random() * 100
  let total = 0

  return gachaPrizePool.find((prize) => {
    total += prize.chance
    return roll <= total
  }) || gachaPrizePool[0]
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

const hasCompleteShippingDetails = (shippingDetails = {}) => {
  return requiredShippingFields.every((field) => String(shippingDetails[field] || '').trim())
}

router.get('/:username', async (req, res) => {
  try {
    const user = await populateUser(User.findOne({ username: req.params.username }))

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
      profile: {
        displayName: username,
      },
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
    const { theme, language, region } = req.body
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { settings: { theme, language, region } },
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

router.put('/:username/wallet', async (req, res) => {
  try {
    const amount = Number(req.body.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        error: 'Enter a valid amount to add',
      })
    }

    const user = await populateUser(User.findOneAndUpdate(
      { username: req.params.username },
      { $inc: { walletBalance: amount } },
      { new: true }
    ))

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

router.put('/:username/wallet/spend', async (req, res) => {
  try {
    const amount = Number(req.body.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        error: 'Enter a valid amount to spend',
      })
    }

    const user = await User.findOne({ username: req.params.username })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    if (Number(user.walletBalance || 0) < amount) {
      return res.status(400).json({
        error: 'Insufficient wallet balance',
      })
    }

    user.walletBalance -= amount
    await user.save()

    await user.populate('wishlist')
    await user.populate('purchases.product')
    await user.populate('inventory.product')

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

router.post('/:username/gacha-draw', async (req, res) => {
  try {
    const drawCount = Number(req.body.drawCount || 1)

    if (!GACHA_DRAW_COUNTS.includes(drawCount)) {
      return res.status(400).json({
        error: 'Choose 1, 10, 50, or 100 draws',
      })
    }

    const user = await User.findOne({ username: req.params.username })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const totalCost = drawCount * GACHA_COST

    if (Number(user.walletBalance || 0) < totalCost) {
      return res.status(400).json({
        error: `Insufficient wallet balance. ${drawCount} draw costs ${totalCost} FRC.`,
      })
    }

    const prizes = Array.from({ length: drawCount }, pickGachaPrize)

    user.walletBalance -= totalCost
    user.inventory.push(
      ...prizes.map((prize) => ({
        name: prize.name,
        rarity: prize.rarity,
        source: 'gacha',
        description: prize.description,
        imageUrl: prize.imageUrl,
        status: 'stored',
      }))
    )

    await user.save()
    await user.populate('wishlist')
    await user.populate('purchases.product')
    await user.populate('inventory.product')
    await user.populate('shipments.product')

    res.status(200).json({
      user,
      prizes,
      totalCost,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

router.put('/:username/inventory/sell', async (req, res) => {
  try {
    const { itemIds = [] } = req.body

    if (!Array.isArray(itemIds) || !itemIds.length) {
      return res.status(400).json({
        error: 'Select at least one gacha item to sell',
      })
    }

    const user = await User.findOne({ username: req.params.username })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const itemIdSet = new Set(itemIds.map(String))
    const selectedItems = user.inventory.filter((item) =>
      itemIdSet.has(item._id.toString()) && item.status === 'stored'
    )
    const unsellableItem = selectedItems.find((item) => item.source !== 'gacha')

    if (!selectedItems.length) {
      return res.status(400).json({
        error: 'Selected items are not available for selling',
      })
    }

    if (unsellableItem) {
      return res.status(400).json({
        error: 'Marketplace purchases cannot be resold from inventory',
      })
    }

    const earnedCredits = selectedItems.reduce(
      (total, item) => total + Number(resaleValues[item.rarity] || 10),
      0
    )

    user.walletBalance += earnedCredits
    user.tickets += selectedItems.length
    user.inventory = user.inventory.filter((item) => !itemIdSet.has(item._id.toString()))

    await user.save()
    await user.populate('wishlist')
    await user.populate('purchases.product')
    await user.populate('inventory.product')
    await user.populate('shipments.product')

    res.status(200).json({
      user,
      earnedCredits,
      ticketsEarned: selectedItems.length,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

router.put('/:username/inventory/ship', async (req, res) => {
  try {
    const { itemIds = [], shippingDetails = {} } = req.body

    if (!Array.isArray(itemIds) || !itemIds.length) {
      return res.status(400).json({
        error: 'Select at least one inventory item to ship',
      })
    }

    if (!hasCompleteShippingDetails(shippingDetails)) {
      return res.status(400).json({
        error: 'Complete the shipping details before shipping inventory items',
      })
    }

    const user = await User.findOne({ username: req.params.username })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const itemIdSet = new Set(itemIds.map(String))
    let updatedCount = 0

    const shippedItems = []

    user.inventory.forEach((item) => {
      if (itemIdSet.has(item._id.toString()) && item.status === 'stored') {
        shippedItems.push({
          itemName: item.name,
          rarity: item.rarity,
          source: item.source,
          product: item.product,
          price: item.price,
          imageUrl: item.imageUrl,
          status: 'pending-fulfilment',
          shippingDetails,
        })
        updatedCount += 1
      }
    })

    if (!updatedCount) {
      return res.status(400).json({
        error: 'Selected items are not available for shipping',
      })
    }

    user.inventory = user.inventory.filter((item) => !itemIdSet.has(item._id.toString()))
    user.shipments.push(...shippedItems)

    await user.save()
    await user.populate('wishlist')
    await user.populate('purchases.product')
    await user.populate('inventory.product')
    await user.populate('shipments.product')

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

router.put('/:username/profile', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { profile: req.body },
      { new: true }
    ).populate('wishlist')

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

router.post('/:username/verification-request', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      {
        verificationStatus: 'pending',
        verificationRequest: {
          message: req.body.message || '',
          submittedAt: new Date(),
          adminNote: '',
        },
      },
      { new: true }
    ).populate('wishlist')

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
