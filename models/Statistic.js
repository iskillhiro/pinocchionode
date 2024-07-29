const { default: mongoose } = require('mongoose')

const StatisticUserSchema = new mongoose.Schema({
	statUserId: {
		type: String,
	},
})
const StatisticSchema = new mongoose.Schema({
	allTouchers: {
		type: Number,
		default: 0,
	},
	dailyUsers: {
		type: [StatisticUserSchema],
		default: [],
	},
})

const Statistic = mongoose.model('Statistic', StatisticSchema)
module.exports = Statistic
