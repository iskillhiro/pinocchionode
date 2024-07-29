const User = require('../../models/User')

const awardUserForYears = async (req, res) => {
	const { telegramId } = req.params

	try {
		let user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const currentDate = new Date()
		const registrationDate = new Date(user.registrationDate)
		const yearsDifference =
			currentDate.getFullYear() - registrationDate.getFullYear()
		const isBeforeBirthday =
			currentDate.getMonth() < registrationDate.getMonth() ||
			(currentDate.getMonth() === registrationDate.getMonth() &&
				currentDate.getDate() < registrationDate.getDate())

		const totalYears = isBeforeBirthday ? yearsDifference - 1 : yearsDifference

		// Выдача награды
		let reward = totalYears >= 1 ? 20000 * totalYears : 10000

		// Обновление количества soldo у пользователя
		user.soldoTaps += reward

		// Сохранение обновленных данных пользователя
		await user.save()

		res.status(200).json({
			message: `Awarded ${reward} soldo for ${totalYears} year(s) of membership`,
			user,
		})
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

module.exports = { awardUserForYears }
