
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

  title: { type: String, required: true, },

  artist: { type: String, required: true, },

  description: { type: String, },

  imageUrl: { type: String, required: true, },

  price: { type: Number, required: true, },

  createdAt: { type: Date, default: Date.now, },

  saleType: { type: String, default: 'sale', },

  category: { type: String, default: 'Anime', },

  productType: { type: String, default: 'Collectible' },

  stockCount: { type: Number, default: 1, min: 0 },

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

  purchaseHistory: [
    {
      buyer: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
      shippingDetails: {
        fullName: { type: String, default: '' },
        phone: { type: String, default: '' },
        addressLine1: { type: String, default: '' },
        addressLine2: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        country: { type: String, default: '' },
      },
      status: { type: String, default: 'pending-shipment' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
})

module.exports = mongoose.model('Artwork', productSchema)
