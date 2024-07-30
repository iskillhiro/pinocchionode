const User = require('../models/User')
const { addReferral } = require('../utils/addReferral/addReferral')
const bot = require('../bot')
const path = require('path')
const fs = require('fs')

bot.on('message', async msg => {
	console.log('Received message:', msg) // Логирование входящего сообщения

	const chatId = msg.chat.id
	const telegramId = String(chatId)
	let refId = null

	if (msg.text && msg.text.startsWith('/start')) {
		console.log('Processing /start command') // Логирование команды /start

		const startParam = msg.text.split(' ')[1]
		if (startParam) {
			refId = startParam
		}
		const username = msg.chat.username || 'unknown'

		try {
			let user = await User.findOne({ telegramId })
			console.log('User found:', user) // Логирование найденного пользователя

			if (!user) {
				const defaultTasks = [
					{
						taskType: 'TG',
						title: 'Join in CandFnews',
						reward: 5000,
						iconSrc: 'logo.jpeg',
						link: 'https://t.me/CandFnews',
					},
					{
						taskType: 'TG',
						title: 'Join in Pinocchio',
						reward: 5000,
						iconSrc: 'logo.jpeg',
						link: 'https://t.me/pinocchiocoins',
					},
				]

				const defaultBoosts = [
					{ name: 'energy', icon: 'lightning.svg', boostType: 'daily' },
					{ name: 'turbo', icon: 'silver.svg', boostType: 'daily' },
				]

				const upgradeBoosts = [
					{
						name: 'energy',
						icon: 'lightning.svg',
						boostType: 'daily',
						maxLevel: 3,
						currency: 'soldo',
					},
					{
						name: 'turbo',
						icon: 'silver.svg',
						boostType: 'daily',
						maxLevel: 3,
						currency: 'soldo',
					},
					{
						name: 'tap',
						icon: 'tap.svg',
						boostType: 'upgradable',
						maxLevel: 5,
						currency: 'soldo',
					},
					{
						name: 'auto',
						icon: 'robot.svg',
						boostType: 'upgradable',
						level: 0,
						maxLevel: 2,
						// maxLevel: 3,
						currency: 'soldo',
					},
					{
						name: 'skin',
						icon: 'skin.svg',
						boostType: 'one-time',
						currency: 'soldo',
					},
				]

				const treeCoinBoosts = [
					{
						name: 'bucket',
						icon: 'bucket.svg',
						boostType: 'tree-coin',
						currency: 'zecchino',
					},
					{
						name: 'shovel',
						icon: 'shovel.svg',
						boostType: 'tree-coin',
						currency: 'zecchino',
					},
					{
						name: 'salt',
						icon: 'salt.svg',
						boostType: 'tree-coin',
						currency: 'zecchino',
					},
				]

				const taskBlock = { tasksBlock: defaultTasks }

				user = new User({
					telegramId,
					username,
					tasks: [taskBlock],
					boosts: defaultBoosts,
					treeCoinBoosts: treeCoinBoosts,
					upgradeBoosts: upgradeBoosts,
					tree: {
						isActive: false,
						coinPlanted: 0,
						lootBalance: 0,
						landingStartDate: null,
						landingEndDate: null,
					},
					robot: {},
				})

				if (refId && refId !== telegramId) {
					const refUser = await User.findOne({ telegramId: refId })
					if (refUser) {
						user.inviter.push({
							inviterId: refId,
						})
						user.soldo += 1
						user.coinStage += 1
						bot.sendMessage(
							user.telegramId,
							'Congratulations! You have received 1 Soldo coin as a reward!'
						)
						await addReferral(refId, telegramId, username)
					} else {
						console.log('Referral user not found:', refId)
					}
				}

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

		const photoPath = path.join(__dirname, '..', 'static', 'start-image.png')

		if (!fs.existsSync(photoPath)) {
			console.error('File not found:', photoPath)
			return
		}

		const fileExtension = path.extname(photoPath).toLowerCase()
		const validExtensions = ['.jpg', '.jpeg', '.png']
		if (!validExtensions.includes(fileExtension)) {
			console.error('Invalid file format:', fileExtension)
			return
		}

		// const caption = `Hey @${username}! It's Pinocchio! 🌟📱\n\nNow we're rolling out our Telegram mini app! Start farming points now, and who knows what cool stuff you'll snag with them soon! 🚀\n\nGot friends? Bring 'em in! The more, the merrier! 🌱\n\nRemember: Pinocchio is where growth thrives and endless opportunities bloom! 🌼`
		const caption = `Hello mate! Only you can help Pinocchio collect four silver soldos and visit the puppet theatre. However, your adventures do not stop there. Pinocchio also needs to get five golden zecchinos, and only you can help him obtain them. What to do with the golden zecchinos is well known—you should plant them in the ground and pick golden Pinocchio coins from the magic tree after midnight.

		For those who:
		- Use multiple accounts
		- Use autoclickers or other devices
		- Use referrals dishonestly
		- Use other dishonest methods in the game
		
		The game will remain just a game.
		
		For everyone else, we do not promise anything except Pinocchio's assistance. Remember the magic spell "krex pex fex"—it will help everyone to win the game.`

		try {
			await bot.sendPhoto(chatId, photoPath, {
				caption: caption,
				...options,
			})
			console.log('Photo sent successfully')
		} catch (err) {
			console.error('Error sending photo:', err)
		}
	}
})

module.exports = bot
