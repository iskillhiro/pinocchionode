const TelegramBot = require('node-telegram-bot-api')
const dotenv = require('dotenv')
dotenv.config()

const bot = new TelegramBot(process.env.TOKEN, { polling: true })

// const setWebhook = async () => {
// 	const url = 'https://pinocchionode-backend.onrender.com/webhook'
// 	try {
// 		const res = await bot.setWebHook(url)
// 		console.log(`Webhook set to ${url}`, res)
// 	} catch (err) {
// 		console.error('Error setting webhook:', err)
// 	}
// }

// setWebhook()

module.exports = bot
