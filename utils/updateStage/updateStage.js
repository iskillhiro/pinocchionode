const cron = require('node-cron')
const User = require('../../models/User')
const {
	sendReferralReward,
} = require('../sendReferralReward/sendReferralReward')
const bot = require('../../bot') // Инициализированный бот

async function updateStageBasedOnCurrency(user) {
	let hasChanges = false

	const processStage = (
		currentStage,
		coinType,
		rewardAmount,
		nextStageCoinStage
	) => {
		const inviterId = user.inviter[0]?.inviterId

		if (user.coinStage !== nextStageCoinStage) {
			user.coinStage += 1
			console.log(
				`Stage ${currentStage}, CoinStage: ${user.coinStage}. Sending ${rewardAmount} ${coinType} as reward.`
			)

			if (inviterId) {
				sendReferralReward(
					user,
					inviterId,
					coinType === 'Soldo' ? rewardAmount : null,
					coinType === 'Zecchino' ? rewardAmount : null
				)
				const message = `Ваш реферал ${user.username} достиг нового уровня: CoinStage ${user.coinStage}. Вы получаете ${rewardAmount} ${coinType}!`
				bot.sendMessage(inviterId, message)
			} else {
				console.warn('Инвайтер не найден или не указан.')
			}
		}

		if (user.coinStage >= nextStageCoinStage) {
			user.stage += 1
			user.coinStage = 0 // сброс стадии
			console.log(
				`Stage ${currentStage} complete. Moving to stage ${currentStage + 1}.`
			)
		}
	}

	if (user.soldoTaps > 1000000) {
		user.soldoTaps -= 1000000
		user.soldo += 1
		hasChanges = true

		if (user.stage === 1) {
			processStage(1, 'Soldo', 20000, 4)
		} else if (user.stage === 2) {
			processStage(2, 'Zecchino', 20000, 5)
		}
	}

	if (user.zecchinoTaps > 1000000) {
		user.zecchinoTaps -= 1000000
		user.soldo += 1
		hasChanges = true
	}

	if (hasChanges) {
		await user.save()
		console.log(`User changes saved: ${user.telegramId}`)
	}
}

module.exports = {
	updateStageBasedOnCurrency,
}
