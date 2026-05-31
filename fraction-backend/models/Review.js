const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  seller: { type: String, required: true },
  reviewer: { type: String, required: true },
  artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Review', reviewSchema)
