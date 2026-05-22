const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const Artwork = require('./models/Artwork')
const userRoutes = require('./routes/userRoutes')
const artworkRoutes = require('./routes/artworkRoutes')

const app = express()

app.use(cors({origin: 'https://fraction-chi.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.options('*', cors())
app.use(express.json())
app.use('/api/users', userRoutes)
app.use('/api/artworks', artworkRoutes)
app.use('/uploads', express.static('uploads'))

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log(err))

app.get('/', (req, res) => {
  res.send('Backend Running')
})

app.post('/api/artworks', async (req, res) => {
  try {
    const artwork = new Artwork(req.body)
    await artwork.save()

    res.status(201).json(artwork)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

