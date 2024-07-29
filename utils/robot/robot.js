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
				if (
					new Date(user.robot.endMiningDate) < Date.now() &&
					user.robot.isActive
				) {
					user.robot.isActive = false
					console.log('robot off')
				} else if (
					new Date(user.robot.endMiningDate) > Date.now() &&
					user.robot.isActive
				) {
					user.robot.miningBalance += 1
				}
				await user.save()
			})
		)
	} catch (error) {
		console.error('Error finding users with active robots:', error)
	}
}

// Запускайте задачу каждую секунду
cron.schedule('* * * * * *', robot)
