const User = require('../models/User')

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
	const { telegramId, energy, soldo, zecchino } = req.body

	try {
		let user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		if (soldo !== undefined) {
			user.soldo = soldo
		} else if (zecchino !== undefined) {
			user.zecchino = zecchino
		}

		user.energy = energy
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
