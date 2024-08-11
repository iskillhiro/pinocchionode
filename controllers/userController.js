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
const awardUserForYears = async (req, res) => {
	const { telegramId } = req.params

	try {
		let user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const registration_date = getRegistrationDateV2Shift3(telegramId)

		const years = parseInt(yearsSinceRegistration(registration_date))

		let reward = calculateReward(years)

		user.soldoTaps += reward

		await user.save()

		res.status(200).json({
			message: `Awarded ${reward} soldo for ${years} year(s) of membership`,
			user,
			reward,
			years,
		})
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

function calculateReward(years) {
	let reward

	if (years > 1) {
		reward = 20000 * years
	} else {
		reward = 10000
	}

	return reward
}
function getRegistrationDateV2Shift3(telegramId) {
	// Используем 3 старших бита
	const timestampSeconds = telegramId >> 3

	// Начальная дата (1 января 2016 года)
	const startDate = new Date(Date.UTC(2016, 0, 1)) // январь - 0, февраль - 1, ...

	// Вычисляем дату регистрации
	const registrationDate = new Date(
		startDate.getTime() + timestampSeconds * 1000
	)

	return registrationDate
}

function yearsSinceRegistration(registrationDate) {
	const currentDate = new Date()
	const diffTime = Math.abs(currentDate - registrationDate)
	const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25) // Учитываем високосные годы

	return diffYears
}

module.exports = {
	getUser,
	updateUser,
	awardUserForYears,
}
