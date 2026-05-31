
const mongoose = require('mongoose')

const artworkSchema = new mongoose.Schema({

  title: { type: String, required: true, },

  artist: { type: String, required: true, },

  description: { type: String, },

  imageUrl: { type: String, required: true, },

  price: { type: Number, required: true, },

  createdAt: { type: Date, default: Date.now, },

  saleType: { type: String, default: 'sale', },

  category: { type: String, default: 'Anime', },

  productType: { type: String, default: 'Collectible' },

  condition: { type: String, default: 'Good' },

  sealed: { type: Boolean, default: false },

  authenticityNotes: { type: String, default: '' },

  bidEndTime: { type: Date, },

  currentBid: { type: Number, default: 0, },

  highestBidder: { type: String, default: '', },

  autoBids: [
    {
      username: { type: String, required: true },
      maxBid: { type: Number, required: true },
      active: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  discountPercent: { type: Number, default: 0 },

  owner: { type: String, },

  previousOwner: { type: String, },

  ownedAt: { type: Date, },

  resaleAvailableAt: { type: Date, },

  lastSalePrice: { type: Number, default: 0 },

  removedByAdmin: { type: Boolean, default: false },

  removalReason: { type: String, default: '' },

  priceHistory: [
    {
      price: { type: Number, required: true },
      event: { type: String, default: 'listing' },
      buyer: { type: String, default: '' },
      seller: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
})

module.exports = mongoose.model('Artwork', artworkSchema)
