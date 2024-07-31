const User = require('../../models/User')
const cron = require('node-cron')

const robot = async () => {
	try {
		const users = await User.find({
			'robot.isActive': true,
			isOnline: false,
		})

		await Promise.all(
			users.map(async user => {
				const now = Date.now()
				const endMiningDate = new Date(user.robot.endMiningDate).getTime()

				if (endMiningDate < now && user.robot.isActive) {
					user.robot.isActive = false
					console.log(`Robot turned off for user ${user._id}`)
				} else if (endMiningDate > now && user.robot.isActive) {
					user.robot.miningBalance += 1
				}
				await user.save()
			})
		)
	} catch (error) {
		console.error('Error processing users with active robots:', error)
	}
}

// Запускайте задачу каждую минуту
cron.schedule('* * * * *', robot)
