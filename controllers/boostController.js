const User = require('../models/User')

async function getBoosts(req, res) {
	const telegramId = req.params.telegramId

	try {
		const userData = await User.find({ telegramId }).lean()

		if (!userData) {
			return res.status(404).json({
				error: 'User not found',
			})
		}
		return res.json({ success: true, userData })
	} catch (error) {
		return res.status(500).json({
			error: 'Internal server error',
		})
	}
}

async function addUserBoost(req, res) {
	const userId = req.params.telegramId
	const boostName = req.params.boostName // Используем имя буста для идентификации

	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

	const user = await User.findOne({ telegramId: userId })

	if (!user) {
		return res.status(404).json({ error: 'User not found' })
	}

	// Найти буст по имени
	const userBoost = user.boosts.find(ub => ub.name === boostName)

	if (!userBoost) {
		return res.status(404).json({ error: 'Boost not found' })
	}

	// Максимальное количество использований в день в зависимости от уровня
	const maxUsesPerDay = userBoost.level

	// Сбросить usesToday, если день изменился
	if (userBoost.lastUsedDate && userBoost.lastUsedDate < today) {
		userBoost.usesToday = 0
	}

	if (userBoost.usesToday >= maxUsesPerDay) {
		return res.status(400).json({
			error: `Этот буст можно использовать только ${maxUsesPerDay} раз(а) в день`,
		})
	}
	if (userBoost.name === 'energy') {
		user.energy = user.maxEnergy
	}
	// Обновляем время последнего использования и время окончания
	userBoost.lastUsed = now
	userBoost.lastUsedDate = today
	userBoost.usesToday += 1
	userBoost.startTime = now
	userBoost.endTime = new Date(now.getTime() + (1 * 60 * 60 * 1000) / 2) // 30 min
	user.lastVisit = Date.now()
	user.isOnline = true

	await user.save()
	return res.json({ success: true, userBoost })
}
// upgradingBoost

const upgradeBoost = async (req, res) => {
	const telegramId = req.params.telegramId
	const name = req.params.boostName

	let isUpdate = false
	const user = await User.findOne({ telegramId })

	if (user) {
		// Assuming user.upgradeBoosts is an array
		const boost = user.upgradeBoosts.find(boost => boost.name === name)

		if (boost) {
			if (!(boost.level + 1 > boost.maxLevel)) {
				if (boost.boostType === 'daily') {
					const dailyBoost = user.boosts.find(boost => boost.name === name)
					dailyBoost.level += 1
				}
				boost.level += 1
				isUpdate = true
			}

			if (isUpdate) {
				user.lastVisit = Date.now()
				user.isOnline = true
				await user.save()
				res.status(200).json({
					message: `Boost ${boost.name} successful upgrade`,
				})
			} else {
				res.status(400).json({
					message: `Boost ${boost.name} cannot be upgraded further`,
				})
			}
		} else {
			res.status(404).json({
				message: `Boost with name ${name} not found`,
			})
		}
	} else {
		res.status(404).json({
			message: 'User not found',
		})
	}
}
const activateTreeBoost = async (req, res) => {
	try {
		const telegramId = req.params.telegramId
		const boostName = req.params.boostName

		const user = await User.findOne({ telegramId }) // Await the promise
		if (user) {
			user.lastVisit = Date.now()
			user.isOnline = true
			console.log(user.treeCoinBoosts)
			const boost = user.treeCoinBoosts.find(boost => boost.name === boostName) // Use correct method to find the boost
			if (boost) {
				if (boost.status === false) {
					const now = Date.now()
					boost.startTime = now
					boost.endTime = new Date(now + 1000 * 60 * 60 * 24) // Fixed Date object creation
					boost.status = true
					await user.save() // Save changes to the database
					return res
						.status(200)
						.send({ success: true, message: 'Boost activated successfully' })
				} else {
					return res
						.status(400)
						.send({ success: false, message: 'Boost is already active' })
				}
			} else {
				return res
					.status(404)
					.send({ success: false, message: 'Boost not found' })
			}
		} else {
			return res.status(404).send({ success: false, message: 'User not found' })
		}
	} catch (error) {
		console.error(error)
		return res.status(500).send({ success: false, message: 'Server error' })
	}
}
const robotClaim = async (req, res) => {
	const telegramId = req.params.telegramId
	const user = await User.findOne({ telegramId }) // Await the promise

	if (user) {
		user.robot.isActive = false
		user.stage === 1
			? (user.soldoTaps += user.robot.miningBalance)
			: (user.zecchinoTaps += user.robot.miningBalance)

		user.robot.endMiningDate = null
		user.robot.startMiningDate = null
		user.robot.miningBalance = 0

		await user.save()
		res.status(200).json({
			message: 'Successful claim',
		})
	} else {
		res.status(404).json({
			message: 'User not found',
		})
	}
}
module.exports = {
	addUserBoost,
	getBoosts,
	upgradeBoost,
	activateTreeBoost,
	robotClaim,
}
