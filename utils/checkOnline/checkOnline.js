const User = require('../../models/User')
const cron = require('node-cron')

const checkOnline = async () => {
	try {
		// Найдите всех пользователей
		const users = await User.find({})

		// Получите текущее время в миллисекундах
		const now = Date.now()

		// Пройдитесь по каждому пользователю и обновите статус
		for (const user of users) {
			const lastVisit = new Date(user.lastVisit).getTime()
			// Если время последнего визита больше текущего времени минус 5 минут (300000 мс)
			if (now - lastVisit > 30000 && user.isOnline) {
				user.isOnline = false
				if (user.upgradeBoosts[3].level > 0) {
					user.robot.isActive = true
					const robotLevels = {
						1: 6,
						2: 12,
						3: 24,
					}
					const robotLevel = user.upgradeBoosts[3].level
					user.robot.startMiningDate = now
					user.robot.endMiningDate =
						now + robotLevels[robotLevel] * 60 * 60 * 1000

					console.log('bot started!')
				}
				// Сохраните изменения в базе данных
				console.log(`User ${user.username} offline`)
				await user.save()
			}
		}
	} catch (error) {
		console.error('Error checking online status:', error)
	}
}

// Запускайте задачу каждую минуту
cron.schedule('* * * * *', checkOnline)
