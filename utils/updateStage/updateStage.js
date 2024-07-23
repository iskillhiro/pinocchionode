const cron = require('node-cron')
const User = require('../../models/User')
const {
	sendReferralReward,
} = require('../sendReferralReward/sendReferralReward')

async function updateStageBasedOnCurrency(user) {
	let hasChanges = false

	if (user.soldoTaps >= 1000000) {
		user.soldoTaps -= 1000000
		user.soldo += 1
		if (user.stage === 1 && user.coinStage !== 4) {
			user.coinStage += 1
			sendReferralReward(user, user.inviter[0].inviterId, (soldo = 20000))
		}
		if (user.stage === 2 && user.coinStage !== 5) {
			user.coinStage += 1
			sendReferralReward(user, user.inviter[0].inviterId, (zecchino = 20000))
		}
		if (user.stage === 1 && user.coinStage + 1 > 4) {
			user.stage += 1
			user.coinStage = 0
		}
		hasChanges = true
	}
	if (user.zecchinoTaps >= 1000000) {
		user.zecchinoTaps -= 1000000
		user.soldo += 1
		hasChanges = true
	}
	if (hasChanges) {
		await user.save()
	}
}
module.exports = {
	updateStageBasedOnCurrency,
}
