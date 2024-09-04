const { default: mongoose } = require('mongoose')
const Statistic = require('../models/Statistic')
const User = require('../models/User')
const {
	updateStageBasedOnCurrency,
} = require('../utils/updateStage/updateStage')

// Константы для магических чисел
const ENERGY_MULTIPLIER = 25
const SOLDO_TAPS_BONUS = 900000
const REWARDS = [1900000, 2900000, 3900000, 4900000]

// Функция для завершения сессии с обработкой ошибок
const endSessionWithErrorHandling = async (session, err, res) => {
	try {
		await session.abortTransaction()
	} catch (abortErr) {
		console.error('Error aborting transaction:', abortErr)
	} finally {
		session.endSession()
	}
	res.status(500).json({ message: err.message })
}

// Функция для работы со статистикой
const updateStatistics = async (telegramId, session) => {
	let statistic = await Statistic.findOne().session(session)
	if (!statistic) {
		statistic = new Statistic()
	}

	const userExists = statistic.dailyUsers.some(
		user => user.statUserId === telegramId
	)
	if (!userExists) {
		statistic.dailyUsers.push({ statUserId: telegramId })
	}

	await statistic.save()
}

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

		await updateStatistics(telegramId, session)

		user.lastVisit = Date.now()
		user.isOnline = true
		await user.save() // Сохраняем изменения в пользователе

		await session.commitTransaction()
		session.endSession()

		res.json(user)
	} catch (err) {
		endSessionWithErrorHandling(session, err, res)
	}
}

// Маршрут для обновления данных пользователя
const updateUser = async (req, res) => {
	const { telegramId, touches } = req.body

	if (!Number.isInteger(touches) || touches <= 0) {
		return res.status(400).json({ message: 'Invalid touches value' })
	}

	try {
		console.log(`Touches: ${touches}`)
		const user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const energyRequiredPerTouch =
			user.upgradeBoosts[2].level * ENERGY_MULTIPLIER
		const totalEnergyRequired = touches * energyRequiredPerTouch

		// Если недостаточно энергии
		if (user.energy < totalEnergyRequired) {
			const possibleTouches = Math.floor(user.energy / energyRequiredPerTouch)
			const remainingTouches = touches - possibleTouches
			const usedEnergy = possibleTouches * energyRequiredPerTouch

			updateUserValues(user, possibleTouches, usedEnergy)

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

		// Если энергии достаточно
		updateUserValues(user, touches, totalEnergyRequired)

		let statistic = (await Statistic.findOne()) || new Statistic()
		statistic.allTouchers += touches

		await statistic.save()
		await user.save()

		res.json(user)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

// Вспомогательная функция для обновления значений пользователя
const updateUserValues = (user, touches, usedEnergy) => {
	if (user.stage === 1) {
		user.soldoTaps += calculateTaps(user, touches)
	} else if (user.stage === 2) {
		user.zecchinoTaps += calculateTaps(user, touches)
	}

	updateStageBasedOnCurrency(user)

	if (
		!user.boosts ||
		user.boosts.length === 0 ||
		new Date(user.boosts[1]?.endTime) <= Date.now()
	) {
		user.energy -= usedEnergy
	}

	user.lastVisit = Date.now()
	user.isOnline = true
}

// Вспомогательная функция для расчета тапов
const calculateTaps = (user, touches) => {
	const multiplier =
		user.boosts &&
		user.boosts.length > 0 &&
		new Date(user.boosts[1]?.endTime) > Date.now()
			? 10
			: 1

	return touches * user.upgradeBoosts[2].level * multiplier * ENERGY_MULTIPLIER
}

// Маршрут для награждения пользователя за годы регистрации
const awardUserForYears = async (req, res) => {
	const { telegramId } = req.params

	try {
		const user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const registrationDate = getRegistrationDateV2Shift3(telegramId)
		const years = Math.floor(yearsSinceRegistration(registrationDate))
		const reward = calculateReward(years)

		user.coinStage = Math.min(4, years + 1)
		user.soldo = Math.min(4, years + 1)
		user.soldoTaps += SOLDO_TAPS_BONUS
		user.yearBonusClaimed = true

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

// Вспомогательная функция для расчета награды
function calculateReward(years) {
	return REWARDS[Math.min(years, REWARDS.length - 1)]
}

function getRegistrationDateV2Shift3(telegramId) {
	const timestampSeconds = telegramId >> 3
	const startDate = new Date(Date.UTC(2016, 0, 1))
	return new Date(startDate.getTime() + timestampSeconds * 1000)
}

function yearsSinceRegistration(registrationDate) {
	const currentDate = new Date()
	const diffTime = currentDate - registrationDate
	return diffTime / (1000 * 60 * 60 * 24 * 365.25)
}

module.exports = {
	getUser,
	updateUser,
	awardUserForYears,
}
