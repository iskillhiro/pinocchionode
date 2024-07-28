const cron = require('node-cron')
const User = require('../../models/User') // Импорт модели пользователя

const miningCoins = async () => {
	try {
		const users = await User.find({})

		for (const user of users) {
			if (
				new Date(user.tree.landingEndDate) > Date.now() &&
				Date.now() > new Date(user.tree.lastGettingLoot).getTime() + 10000
			) {
				let boostsPercent = 0
				user.treeCoinBoosts.forEach(boost => {
					if (boost.status) {
						boostsPercent += 0.5
					}
				})
				let coinsToAdd =
					Math.floor(user.tree.coinPlanted / 24) > 0
						? Math.floor(user.tree.coinPlanted / 24)
						: 1

				user.tree.lootBalance +=
					boostsPercent > 0
						? coinsToAdd + Math.floor(boostsPercent * boostsPercent)
						: coinsToAdd

				// Обновите lastGettingLoot на текущее время
				user.tree.lastGettingLoot = new Date()

				// Сохраните изменения в базе данных
				await user.save()
				console.log(`Added ${coinsToAdd} coins to user ${user.username}`)
			}
		}
	} catch (error) {
		console.error('Error in miningCoins:', error)
	}
}

// Периодическое выполнение задания (каждую секунду)
cron.schedule('* * * * * *', miningCoins)
