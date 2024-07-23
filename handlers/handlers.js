const User = require('../models/User')
const { addReferral } = require('../utils/addReferral/addReferral')
const bot = require('../bot')
const path = require('path')
const fs = require('fs')

bot.on('message', async msg => {
	console.log('Received message:', msg) // Логирование входящего сообщения

	const chatId = msg.chat.id
	const telegramId = String(chatId)
	let refId = null // автор ссылки

	if (msg.text && msg.text.startsWith('/start')) {
		const startParam = msg.text.split(' ')[1]
		if (startParam) {
			refId = startParam // user_id из реферальной ссылки
		}
		const username = msg.chat.username || 'unknown'

		try {
			let user = await User.findOne({ telegramId })
			console.log('User found:', user) // Логирование найденного пользователя

			if (!user) {
				// Примерные данные задач
				const defaultTasks = [
					{
						taskType: 'YT',
						title: 'Watch YouTube',
						reward: 10,
						iconSrc: 'logo.jpeg',
						link: 'https://www.youtube.com/',
					},
					{
						taskType: 'TG',
						title: 'Join Telegram Group',
						reward: 5,
						iconSrc: 'logo.jpeg',
						link: 'https://t.me/+U_ztILf351Q1YmRi',
					},
					{
						taskType: 'X',
						title: 'Join in X',
						reward: 20,
						iconSrc: 'logo.jpeg',
						link: 'https://x.com/',
					},
				]

				const defaultBoosts = [
					{
						name: 'energy',
						icon: 'lightning.svg',
						boostType: 'daily',
					},
					{
						name: 'turbo',
						icon: 'silver.svg',
						boostType: 'daily',
					},
				]
				const upgradeBoosts = [
					{
						name: 'energy',
						icon: 'lightning.svg',
						boostType: 'daily',
						maxLevel: 5,
						currency: 'soldo',
					},
					{
						name: 'turbo',
						icon: 'silver.svg',
						boostType: 'daily',
						maxLevel: 5,
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
						maxLevel: 3,
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
						name: 'shovel',
						icon: 'shovel.svg',
						boostType: 'tree-coin',
						currency: 'zecchino',
					},
					{
						name: 'bucket',
						icon: 'bucket.svg',
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
				const taskBlock = { tasksBlock: defaultTasks } // Create task block

				user = new User({
					telegramId,
					username,
					tasks: [taskBlock], // Save task block to user
					boosts: defaultBoosts,
					treeCoinBoosts: treeCoinBoosts,
					upgradeBoosts: upgradeBoosts,
				})
				// Добавление реферала, если refId передан
				if (refId && refId !== telegramId) {
					const refUser = await User.findOne({ telegramId: refId })
					if (refUser) {
						user.inviter = refId
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

		// Check if the file exists
		if (!fs.existsSync(photoPath)) {
			console.error('File not found:', photoPath)
			return
		}

		// Check the file format
		const fileExtension = path.extname(photoPath).toLowerCase()
		const validExtensions = ['.jpg', '.jpeg', '.png']
		if (!validExtensions.includes(fileExtension)) {
			console.error('Invalid file format:', fileExtension)
			return
		}

		const caption = `Hey @${username}! It's Pinocchio! 🌟📱\n\nNow we're rolling out our Telegram mini app! Start farming points now, and who knows what cool stuff you'll snag with them soon! 🚀\n\nGot friends? Bring 'em in! The more, the merrier! 🌱\n\nRemember: Pinocchio is where growth thrives and endless opportunities bloom! 🌼`

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
