const express = require('express')
const connectDB = require('./config/db')
const userRoutes = require('./router/userRoutes.js')
const cors = require('cors')
const dotenv = require('dotenv')
const bot = require('./bot') // Импортируйте bot из обновленного bot.js
const Statistic = require('./models/Statistic.js')

dotenv.config()
const app = express()
app.use(cors())

connectDB()

app.use(express.json())

app.use('/api', userRoutes)

// Обработчик вебхуков
app.post('/webhook', (req, res) => {
	console.log('Webhook received:', req.body) // Логирование запроса вебхука
	bot.processUpdate(req.body)
	res.sendStatus(200)
})
// Инициализация статистики
const initializeStatistics = async () => {
	try {
		const stat = await Statistic.create({})
		console.log('Statistic created:', stat)
	} catch (err) {
		console.error('Error creating Statistic:', err)
	}
}

require('./handlers/handlers.js')
require('./utils/energyRegen/energyRegen.js')
require('./utils/checkActiveBoost/checkActiveBoost.js')
require('./utils/miningCoins/miningCoins.js')
require('./utils/checkOnline/checkOnline.js')
require('./utils/robot/robot.js')
require('./utils/resetStatistic/resetStatistic.js')

const PORT = process.env.PORT || 5000

app.listen(PORT, () =>
	console.log(`Server started successful🚀 on port ${PORT}`)
)
