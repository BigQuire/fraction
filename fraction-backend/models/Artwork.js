
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

  bidEndTime: { type: Date, },

  currentBid: { type: Number, default: 0, },

  highestBidder: { type: String, default: '', },

  owner: { type: String, },
})

module.exports = mongoose.model('Artwork', artworkSchema)
