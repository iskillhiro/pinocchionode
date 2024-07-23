const User = require('../../models/User')
const cron = require('node-cron')

const oneDayInMilliseconds = 24 * 60 * 60 * 1000

async function resetExpiredBoostsToDefault() {
	const users = await User.find()
	const now = new Date()

	for (const user of users) {
		let hasChanges = false

		user.boosts.forEach(boost => {
			// Reset expired boosts
			if (boost.endTime && boost.endTime < now) {
				boost.startTime = null
				boost.endTime = null
				hasChanges = true
			}

			// Update lastUsed if condition met
			const timeDifference = now - boost.lastUsed
			const daysPassed = Math.floor(timeDifference / oneDayInMilliseconds)

			if (boost.lastUsed != null && daysPassed >= 1) {
				boost.usesToday = 0
				boost.lastUsed = null
				console.log('Updating lastUsed for boost:', boost.name)
				hasChanges = true
			}
		})

		// Save the user document only if there are changes
		if (hasChanges) {
			await user.save()
		}
	}
}

cron.schedule('* * * * * *', resetExpiredBoostsToDefault)
