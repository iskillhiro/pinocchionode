const { default: mongoose } = require('mongoose')
const Statistic = require('../models/Statistic')
const User = require('../models/User')
const {
	updateStageBasedOnCurrency,
} = require('../utils/updateStage/updateStage')

// Маршрут для получения данных пользователя
const getUser = async (req, res) => {
	const telegramId = req.params.telegramId // Получаем telegramId из параметров запроса
	const session = await mongoose.startSession()
	session.startTransaction()
	try {
		const user = await User.findOne({ telegramId }).session(session)
		if (!user) {
			await session.abortTransaction()
			session.endSession()
			return res.status(404).json({ message: 'User not found' })
		}

		// Обновляем статистику
		console.log(telegramId) // Используем переменную telegramId
		let statistic = await Statistic.findOne().session(session)
		if (!statistic) {
			statistic = new Statistic()
		}

		// Проверяем, есть ли пользователь в списке dailyUsers
		const userExists = statistic.dailyUsers.some(
			user => user.statUserId === telegramId
		)
		if (!userExists) {
			statistic.dailyUsers.push({ statUserId: telegramId })
		}

		await statistic.save()
		await session.commitTransaction()
		session.endSession()

		user.lastVisit = Date.now()
		user.isOnline = true
		await user.save() // Сохраняем изменения в пользователе
		res.json(user)
	} catch (err) {
		await session.abortTransaction()
		session.endSession()
		res.status(500).json({ message: err.message })
	}
}

const updateUser = async (req, res) => {
	const { telegramId, touches } = req.body
	try {
		console.log(`Touches: ${touches}`)
		let user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}
		if (user.energy > touches * user.upgradeBoosts[2].level) {
			if (user.stage === 1) {
				if (
					user.boosts &&
					user.boosts.length > 0 &&
					new Date(user.boosts[1].endTime) > Date.now()
				) {
					user.soldoTaps += user.upgradeBoosts[2].level * 10
				} else {
					user.soldoTaps += touches * user.upgradeBoosts[2].level
				}
				updateStageBasedOnCurrency(user)
			}

			if (user.stage === 2) {
				if (
					user.boosts &&
					user.boosts.length > 0 &&
					new Date(user.boosts[1].endTime) > Date.now()
				) {
					user.zecchinoTaps += user.upgradeBoosts[2].level * 10
				} else {
					user.zecchinoTaps += touches * user.upgradeBoosts[2].level
				}
				updateStageBasedOnCurrency(user)
			}
			// Обновляем статистику
			let statistic = await Statistic.findOne()
			if (!statistic) {
				statistic = new Statistic()
			}
			statistic.allTouchers += touches
			user.energy -= touches * user.upgradeBoosts[2].level
			console.log(user.upgradeBoosts[2].level)
			user.lastVisit = Date.now()
			user.isOnline = true
			await statistic.save()
			await user.save()

			res.json(user)
		}
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

module.exports = {
	getUser,
	updateUser,
}
