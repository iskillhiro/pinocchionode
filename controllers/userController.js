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

		const energyRequiredPerTouch = user.upgradeBoosts[2].level
		const totalEnergyRequired = touches * energyRequiredPerTouch

		// If energy is insufficient
		if (user.energy < totalEnergyRequired) {
			const possibleTouches = Math.floor(user.energy / energyRequiredPerTouch)
			const remainingTouches = touches - possibleTouches
			const usedEnergy = possibleTouches * energyRequiredPerTouch

			// Update user values
			user.energy -= usedEnergy
			user.lastVisit = Date.now()
			user.isOnline = true

			if (user.stage === 1) {
				user.soldoTaps += calculateTaps(user, possibleTouches)
				updateStageBasedOnCurrency(user)
			} else if (user.stage === 2) {
				user.zecchinoTaps += calculateTaps(user, possibleTouches)
				updateStageBasedOnCurrency(user)
			}

			// Update statistics
			let statistic = (await Statistic.findOne()) || new Statistic()
			statistic.allTouchers += possibleTouches

			await statistic.save()
			await user.save()

			return res.json({
				message: 'Partial update completed',
				user,
				remainingTouches,
			})
		}

		// If energy is sufficient
		if (user.energy >= totalEnergyRequired) {
			if (user.stage === 1) {
				user.soldoTaps += calculateTaps(user, touches)
				updateStageBasedOnCurrency(user)
			} else if (user.stage === 2) {
				user.zecchinoTaps += calculateTaps(user, touches)
				updateStageBasedOnCurrency(user)
			}

			// Update statistics
			let statistic = (await Statistic.findOne()) || new Statistic()
			statistic.allTouchers += touches

			user.energy -= totalEnergyRequired
			user.lastVisit = Date.now()
			user.isOnline = true

			await statistic.save()
			await user.save()

			return res.json(user)
		}
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

// Helper function to calculate taps
const calculateTaps = (user, touches) => {
	if (
		user.boosts &&
		user.boosts.length > 0 &&
		new Date(user.boosts[1].endTime) > Date.now()
	) {
		return touches * user.upgradeBoosts[2].level * 10
	} else {
		return touches * user.upgradeBoosts[2].level
	}
}

module.exports = {
	getUser,
	updateUser,
}
