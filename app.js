const express = require('express')
const connectDB = require('./config/db')
const userRoutes = require('./router/userRoutes.js')
const cors = require('cors')
const dotenv = require('dotenv')
const bot = require('./handlers/handlers')
dotenv.config()
const app = express()
app.use(cors())

connectDB()

app.use(express.json())

app.use('/api', userRoutes)

require('./utils/energyRegen/energyRegen.js')
require('./utils/checkActiveBoost/checkActiveBoost.js')
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log('Server started successful🚀'))
