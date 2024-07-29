const cron = require('node-cron')
const Statistic = require('../../models/Statistic')

const resetStatistic = async () => {
	try {
		const stats = await Statistic.find({})
		for (let stat of stats) {
			stat.allTouchers = 0
			stat.dailyUsers = []
			await stat.save()
			console.log(`Statistic reset`)
		}
	} catch (error) {
		console.error('Error resetting statistics:', error)
	}
}

// cron.schedule('*/30 * * * * *', resetStatistic)

cron.schedule('0 0 * * *', resetStatistic)

module.exports = resetStatistic
