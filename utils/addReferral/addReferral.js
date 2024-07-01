const User = require('../../models/User')

const addReferral = async (telegramId, referralId, username) => {
	try {
		let user = await User.findOne({ telegramId })

		if (user) {
			const referralExists = user.referrals.some(
				referral => referral.telegramId === referralId
			)

			if (!referralExists) {
				user.referrals.push({
					username: username,
					telegramId: referralId,
				})

				await user.save()
				console.log('Referral added:', { username, telegramId: referralId })
			} else {
				console.log('Referral already exists:', {
					username,
					telegramId: referralId,
				})
			}
		} else {
			console.log('User not found:', telegramId)
		}
	} catch (err) {
		console.error('Error adding referral:', err)
	}
}
