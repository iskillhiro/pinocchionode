const User = require('../../models/User')

const sendReferralReward = (
	telegramId,
	soldo = null,
	zecchino = null,
	coins = null
) => {
	const user = User.findOne({ telegramId })

	if (user) {
		if (user.referrals.length > 0) {
			user.referrals.foreach(referral => {
				const referralUser = User.findOne({ telegramId: referral })
				if (referralUser) {
					if (soldo !== null) {
						referralUser.soldoTaps += soldo
					}
					if (zecchino !== null) {
						referralUser.zecchinoTaps += zecchino
					}
					if (coins !== null) {
						referralUser.coins += coins
					}
				}
			})
		} else {
			console.log('List of referrals is empty')
		}
	}
}

module.exports = {
	sendReferralReward,
}
