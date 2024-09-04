const User = require('../models/User')
const checkUserBalance = require('../utils/checkUserBalance/checkUserBalance')

async function getBoosts(req, res) {
	const telegramId = req.params.telegramId

	try {
		const userData = await User.findOne({ telegramId }).lean()

		if (!userData) {
			return res.status(404).json({
				error: 'User not found',
			})
		}
		return res.json({ success: true, userData })
	} catch (error) {
		console.error('Error fetching boosts:', error)
		return res.status(500).json({
			error: 'Internal server error',
		})
	}
}

async function addUserBoost(req, res) {
	const userId = req.params.telegramId
	const boostName = req.params.boostName

	const now = new Date()
	const today = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate()
	).getTime()

	try {
		const user = await User.findOne({ telegramId: userId })

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		const userBoost = user.boosts.find(ub => ub.name === boostName)

		if (!userBoost) {
			return res.status(404).json({ error: 'Boost not found' })
		}

		const maxUsesPerDay = userBoost.level

		if (userBoost.lastUsedDate && userBoost.lastUsedDate.getTime() < today) {
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

		userBoost.lastUsed = now
		userBoost.lastUsedDate = new Date(today)
		userBoost.usesToday += 1
		userBoost.startTime = now

		if (userBoost.name !== 'energy') {
			const durations = [15, 20, 30] // durations in seconds
			userBoost.endTime = new Date(
				now.getTime() + durations[userBoost.level - 1] * 1000
			)
		} else {
			userBoost.endTime = new Date(now)
		}

		user.lastVisit = Date.now()
		user.isOnline = true

		await user.save()
		return res.json({ success: true, userBoost })
	} catch (error) {
		console.error('Error adding user boost:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
}

const upgradeBoost = async (req, res) => {
	const telegramId = req.params.telegramId
	const name = req.params.boostName
	const currency = req.params.currency

	try {
		const user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		if (!Array.isArray(user.upgradeBoosts)) {
			return res.status(500).json({
				message: 'Upgrade boosts data is corrupted',
			})
		}

		const boost = user.upgradeBoosts.find(boost => boost.name === name)

		if (!boost) {
			return res.status(404).json({
				message: `Boost with name ${name} not found`,
			})
		}

		const cost =
			boost.name === 'auto' ? boost.level * 500000 : boost.level * 50000

		console.log(`User ${telegramId} balance check:`)
		console.log(`Required cost: ${cost}`)

		if (checkUserBalance(user, currency, cost, boost)) {
			if (boost.level + 1 <= boost.maxLevel) {
				if (boost.boostType === 'daily') {
					const dailyBoost = user.boosts.find(boost => boost.name === name)
					if (dailyBoost) {
						dailyBoost.level += 1
					}
				}

				boost.level += 1

				user.lastVisit = Date.now()
				user.isOnline = true

				if (currency === 'soldoTaps') {
					user.soldoTaps -= cost
				} else if (currency === 'zecchinoTaps') {
					user.zecchinoTaps -= cost
				}

				await user.save()
				return res.status(200).json({
					message: `Boost ${boost.name} successful upgrade`,
				})
			} else {
				return res.status(400).json({
					message: `Boost ${boost.name} cannot be upgraded further`,
				})
			}
		} else {
			console.log('Insufficient funds for upgrade boost')
			return res.status(423).json({
				message: 'Insufficient funds for upgrade boost',
			})
		}
	} catch (error) {
		console.error('Error upgrading boost:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
}

const activateTreeBoost = async (req, res) => {
	try {
		const telegramId = req.params.telegramId
		const boostName = req.params.boostName

		const user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' })
		}

		if (checkUserBalance(user, 'zecchino', 1)) {
			const boost = user.treeCoinBoosts.find(boost => boost.name === boostName)

			if (!boost) {
				return res
					.status(404)
					.json({ success: false, message: 'Boost not found' })
			}

			if (!boost.status) {
				const now = Date.now()
				boost.startTime = now
				boost.endTime = new Date(now + 1000 * 60 * 60 * 24 * 10) // 10 days duration
				boost.status = true
				user.zecchino -= 1
				user.lastVisit = Date.now()
				user.isOnline = true

				await user.save()
				return res
					.status(200)
					.json({ success: true, message: 'Boost activated successfully' })
			} else {
				return res
					.status(400)
					.json({ success: false, message: 'Boost is already active' })
			}
		} else {
			return res.status(423).json({
				message: 'Insufficient funds for activate tree boost',
			})
		}
	} catch (error) {
		console.error('Error activating tree boost:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

const robotClaim = async (req, res) => {
	const telegramId = req.params.telegramId

	try {
		const user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		user.robot.isActive = false
		if (user.stage === 1) {
			user.soldoTaps += user.robot.miningBalance
		} else {
			user.zecchinoTaps += user.robot.miningBalance
		}

		user.robot.endMiningDate = null
		user.robot.startMiningDate = null
		user.robot.miningBalance = 0
		user.lastVisit = Date.now()
		user.isOnline = true

		await user.save()
		return res.status(200).json({ message: 'Successful claim' })
	} catch (error) {
		console.error('Error during robot claim:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
}

module.exports = {
	addUserBoost,
	getBoosts,
	upgradeBoost,
	activateTreeBoost,
	robotClaim,
}
