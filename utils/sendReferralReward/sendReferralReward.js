const User = require('../../models/User')

const sendReferralReward = async (
	user,
	inviterId,
	soldo = null,
	zecchino = null,
	coins = null
) => {
	try {
		console.log(`inviterId: ${inviterId}`)
		// Найти пользователя
		if (user) {
			// Найти пользователя, который пригласил
			const inviterUser = await User.findOne({ telegramId: inviterId })

			if (inviterUser) {
				if (soldo !== null) {
					inviterUser.soldoTaps += soldo
					const referralUser = inviterUser.referrals.find(
						referral => referral.user_id === user.telegramId
					)

					if (referralUser) {
						referralUser.soldo_count += soldo
					}
				}
				if (zecchino !== null) {
					inviterUser.zecchinoTaps += zecchino
					const referralUser = inviterUser.referrals.find(
						referral => referral.user_id === user.telegramId
					)

					if (referralUser) {
						referralUser.zecchino_count += zecchino
					}
				}
				if (coins !== null) {
					inviterUser.coins += coins
					const referralUser = inviterUser.referrals.find(
						referral => referral.user_id === user.telegramId
					)

					if (referralUser) {
						referralUser.coin_count += coins
					}
				}

				await inviterUser.save() // Сохранить изменения в базе данных
			}
		}
	} catch (error) {
		console.error('Error in sendReferralReward:', error)
	}
}

module.exports = {
	sendReferralReward,
}
