const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const Product = require('./models/Product')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const commissionRoutes = require('./routes/commissionRoutes')
const adminRoutes = require('./routes/adminRoutes')
const giveawayRoutes = require('./routes/giveawayRoutes')
const reviewRoutes = require('./routes/reviewRoutes')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/artworks', productRoutes)
app.use('/api/commissions', commissionRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/giveaways', giveawayRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/uploads', express.static('uploads'))

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log(err))

app.get('/', (req, res) => {
  res.send('Backend Running')
})

const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()

    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

app.post('/api/products', createProduct)
app.post('/api/artworks', createProduct)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

