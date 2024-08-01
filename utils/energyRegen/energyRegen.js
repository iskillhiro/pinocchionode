const cron = require('node-cron')
const User = require('../../models/User') // Импорт модели пользователя

// Функция для автоматического восстановления энергии
const energyRegen = async () => {
	// TODO: сделать логику с восполнением энергии в зависимости от того, какое значение
	try {
		const users = await User.find({})

		for (let user of users) {
			user.energy = user.upgradeBoosts[2].level
			await user.save()
		}
	} catch (error) {
		console.error('Error regenerating energy:', error)
	}
}

// Периодическое выполнение задания (каждую секунду)
cron.schedule('* * * * * *', energyRegen)
