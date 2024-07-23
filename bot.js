const TelegramBot = require('node-telegram-bot-api')
const dotenv = require('dotenv')
dotenv.config()

const bot = new TelegramBot(process.env.TOKEN)

const setWebhook = async () => {
	const url = 'https://pinocchionode-backend.onrender.com/webhook'
	await bot.setWebHook(url)
	console.log(`Webhook set to ${url}`)
}

setWebhook()

module.exports = bot
