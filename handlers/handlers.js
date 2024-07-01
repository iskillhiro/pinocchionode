const TelegramBot = require('node-telegram-bot-api')
const dotenv = require('dotenv')
const User = require('../models/User')

dotenv.config()

const bot = new TelegramBot(process.env.TOKEN, { polling: true })

bot.on('message', async (msg, match) => {
	const chatId = msg.chat.id
	const telegramId = String(chatId)
	const refId = 0
	if (match[1]) {
		refId = match[1] // user_id из реферальной ссылки
	}
	const username = msg.chat.username || 'unknown'

	try {
		let user = await User.findOne({ telegramId })

		if (!user) {
			user = new User({
				telegramId,
				username,
				referrals: [
					{
						username: 'fakeReferral1',
						telegramId: '1234567890',
						money_count: 10,
					},
					{
						username: 'fakeReferral2',
						telegramId: '0987654321',
						money_count: 20,
					},
				],
			})

			await user.save()
			console.log('User saved:', user)
		} else {
			console.log('User already exists:', user)
		}
	} catch (err) {
		console.error('Error saving user:', err)
	}

	const options = {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: 'Launch Pinocchio',
						web_app: {
							url: 'https://pinochiowebsite.netlify.app/',
						},
					},
				],
			],
		},
	}

	await bot.sendMessage(
		chatId,
		`Hey @${username}! It's Pinocchio! 🌟📱\n\nNow we're rolling out our Telegram mini app! Start farming points now, and who knows what cool stuff you'll snag with them soon! 🚀\n\nGot friends? Bring 'em in! The more, the merrier! 🌱\n\nRemember: Pinocchio is where growth thrives and endless opportunities bloom! 🌼`,
		options
	)
})

module.exports = bot
