const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, },

  email: { type: String, required: true, unique: true, },

  password: { type: String, required: true, },

  walletBalance: { type: Number, default: 0, },

  netWorth: { type: Number, default: 0, },

  role: { type: String, default: 'user', },

  isVerifiedSeller: { type: Boolean, default: false },

  verificationStatus: { type: String, default: 'not-requested' },

  verificationRequest: {
    message: { type: String, default: '' },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    adminNote: { type: String, default: '' },
  },

  sellerRating: { type: Number, default: 0 },

  reviewCount: { type: Number, default: 0 },

  tickets: { type: Number, default: 0 },

  profile: {
    displayName: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
  },

  settings: {
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'en' },
    region: { type: String, default: 'Malaysia' },
  },

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],

  purchases: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
      title: { type: String, default: '' },
      seller: { type: String, default: '' },
      price: { type: Number, default: 0 },
      shippingStatus: { type: String, default: 'pending-shipment' },
      trackingCode: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  inventory: [
    {
      name: { type: String, required: true },
      rarity: { type: String, default: 'Common' },
      source: { type: String, default: 'gacha' },
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
      price: { type: Number, default: 0 },
      imageUrl: { type: String, default: '' },
      description: { type: String, default: '' },
      status: { type: String, default: 'stored' },
      acquiredAt: { type: Date, default: Date.now },
      shippedAt: { type: Date },
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
    },
  ],

  shipments: [
    {
      itemName: { type: String, required: true },
      rarity: { type: String, default: '' },
      source: { type: String, default: '' },
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
      price: { type: Number, default: 0 },
      imageUrl: { type: String, default: '' },
      status: { type: String, default: 'pending-fulfilment' },
      requestedAt: { type: Date, default: Date.now },
      fulfilledAt: { type: Date },
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
    },
  ],

  createdAt: { type: Date, default: Date.now, },

  artworkNumbers: { type: Number, default: 0, },
})

module.exports = mongoose.model('User', userSchema)
