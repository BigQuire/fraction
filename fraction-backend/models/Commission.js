const mongoose = require('mongoose')

const commissionSchema = new mongoose.Schema({
  artist: { type: String, required: true },
  fromUser: { type: String, required: true },
  artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  budget: { type: Number, default: 0 },
  deadline: { type: Date },
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Commission', commissionSchema)
