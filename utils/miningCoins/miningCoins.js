const cron = require('node-cron')
const User = require('../../models/User') // Импорт модели пользователя

const miningCoins = async () => {
	try {
		const users = await User.find({})

		for (const user of users) {
			const now = Date.now()
			const lastLootTime = new Date(user.tree.lastGettingLoot).getTime()
			const oneHourInMilliseconds = 3600000

			if (
				new Date(user.tree.landingEndDate) > now &&
				now > lastLootTime + oneHourInMilliseconds
			) {
				let boostsPercent = 0
				user.treeCoinBoosts.forEach(boost => {
					if (boost.status) {
						boostsPercent += 0.5
					}
				})

				// Рассчитываем количество монет за час
				let coinsToAdd = 240

				user.tree.lootBalance +=
					boostsPercent > 0
						? coinsToAdd + Math.floor(coinsToAdd * boostsPercent)
						: coinsToAdd

				// Обновите lastGettingLoot на текущее время
				user.tree.lastGettingLoot = new Date()

				// Сохраните изменения в базе данных
				await user.save()
			}
		}
	} catch (error) {
		console.error('Error in miningCoins:', error)
	}
}

// Периодическое выполнение задания (каждую минуту)
cron.schedule('* * * * *', miningCoins)
