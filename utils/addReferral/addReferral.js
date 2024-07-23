const User = require('../../models/User')
const bot = require('../../bot')

const addReferral = async (telegramId, referralId, username) => {
	// TODO: Система награждения рефералам
	// За каждую закрытую монету(сольд, цихин) или за собирание коинов с дерева будет даваться % от собранного кол-ва. !Без дробных чисел, только целые!
	try {
		let user = await User.findOne({ telegramId })

		if (user) {
			const alreadyReferred = user.referrals.some(
				referral => referral.user_id === referralId
			)

			if (!alreadyReferred) {
				user.referrals.push({
					username: username,
					user_id: referralId,
				})

				await user.save()
				console.log('Referral added:', { username, user_id: referralId })
				bot.sendMessage(
					telegramId,
					`🥳 Congratulations! @${username} has joined!
💎You'll earn a 20% cashback every time your friend claims coins.
Invite more friends to join the fun and increase your rewards even further! 🧑‍🤝‍🧑`
				)
			} else {
				console.log('Referral already exists:', {
					username,
					user_id: referralId,
				})
			}
		} else {
			console.log('User not found:', telegramId)
		}
	} catch (err) {
		console.error('Error adding referral:', err)
	}
}

module.exports = {
	addReferral,
}
