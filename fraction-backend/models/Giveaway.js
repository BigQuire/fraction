const mongoose = require('mongoose')

const giveawaySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  prize: { type: String, required: true },
  ticketCost: { type: Number, default: 1 },
  status: { type: String, default: 'active' },
  entries: [
    {
      username: { type: String, required: true },
      ticketsUsed: { type: Number, default: 1 },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Giveaway', giveawaySchema)
