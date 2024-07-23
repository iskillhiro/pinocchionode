const User = require('../models/User')
const {
	updateStageBasedOnCurrency,
} = require('../utils/updateStage/updateStage')
// Маршрут для получения данных пользователя
const getUser = async (req, res) => {
	try {
		const user = await User.findOne({ telegramId: req.params.telegramId })
		if (!user) return res.status(404).json({ message: 'User not found' })
		res.json(user)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

const updateUser = async (req, res) => {
	const { telegramId, energy, soldoTaps, zecchinoTaps } = req.body

	try {
		let user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		if (soldoTaps !== undefined) {
			if (
				user.boosts &&
				user.boosts.length > 0 &&
				new Date(user.boosts[1].endTime) > Date.now()
			) {
				user.soldoTaps += user.upgradeBoosts[2].level * 10
			} else {
				user.soldoTaps = soldoTaps
			}
		}

		if (zecchinoTaps !== undefined) {
			if (
				user.boosts &&
				user.boosts.length > 0 &&
				new Date(user.boosts[1].endTime) > Date.now()
			) {
				user.zecchinoTaps += user.upgradeBoosts[2].level * 10
			} else {
				user.zecchinoTaps = soldoTaps
			}
		}

		if (energy !== undefined) {
			user.energy = energy
		}
		updateStageBasedOnCurrency(user)
		await user.save()

		res.json(user)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

module.exports = {
	getUser,
	updateUser,
}
