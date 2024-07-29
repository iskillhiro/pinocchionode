const Statistic = require('../models/Statistic')
const User = require('../models/User')

const getStatistic = async (req, res) => {
	try {
		// Получаем общее количество пользователей
		const totalUsers = await User.countDocuments({})
		console.log(totalUsers)
		// Получаем статистику из базы данных
		let statistic = await Statistic.findOne()
		let allTouchers = statistic.allTouchers
		console.log(allTouchers)
		let dailyUsers = statistic.dailyUsers
		res.status(200).json({
			totalUsers,
			allTouchers,
			dailyUsers,
		})
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

module.exports = {
	getStatistic,
}
