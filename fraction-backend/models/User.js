const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, },

  email: { type: String, required: true, unique: true, },

  password: { type: String, required: true, },

  walletBalance: { type: Number, default: 0, },

  netWorth: { type: Number, default: 0, },

  role: { type: String, default: 'user', },

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
    currency: { type: String, default: 'USD' },
  },

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],

  createdAt: { type: Date, default: Date.now, },

  artworkNumbers: { type: Number, default: 0, },
})

module.exports = mongoose.model('User', userSchema)
