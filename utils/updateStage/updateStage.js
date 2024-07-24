const cron = require('node-cron')
const User = require('../../models/User')
const {
	sendReferralReward,
} = require('../sendReferralReward/sendReferralReward')
const bot = require('../../bot') // Инициализированный бот

// TODO: Исправить - когда пользователь в начале получает первый миллион - поднимается сразу 2 уровня coinStage
async function updateStageBasedOnCurrency(user) {
	let hasChanges = false

	if (user.soldoTaps > 1000000) {
		user.soldoTaps -= 1000000
		user.soldo += 1

		// Проверка на этап 1
		if (user.stage === 1) {
			if (user.coinStage !== 4) {
				user.coinStage += 1
				console.log(
					`Stage 1, CoinStage: ${user.coinStage}. Sending 20000 Soldo as reward.`
				)

				sendReferralReward(user, user.inviter[0].inviterId, 20000) // отправить солдо

				// Отправка сообщения инвайтеру
				const inviterId = user.inviter[0]?.inviterId
				if (inviterId) {
					const message = `Ваш реферал ${user.username} достиг нового уровня: CoinStage ${user.coinStage}. Вы получаете 20000 Soldo!`
					bot.sendMessage(inviterId, message)
				} else {
					console.warn('Инвайтер не найден или не указан.')
				}
			}

			if (user.coinStage >= 4) {
				user.stage += 1
				user.coinStage = 0 // сброс стадии
				console.log(`Stage 1 complete. Moving to stage 2.`)
			}
		}

		// Проверка на этап 2
		else if (user.stage === 2 && user.coinStage !== 5) {
			user.coinStage += 1
			console.log(
				`Stage 2, CoinStage: ${user.coinStage}. Sending 20000 Zecchino as reward.`
			)

			sendReferralReward(user, user.inviter[0].inviterId, null, 20000) // отправить зекчино

			// Отправка сообщения инвайтеру
			const inviterId = user.inviter[0]?.inviterId
			if (inviterId) {
				const message = `Ваш реферал ${user.username} достиг нового уровня: CoinStage ${user.coinStage}. Вы получаете 20000 Zecchino!`
				bot.sendMessage(inviterId, message)
			} else {
				console.warn('Инвайтер не найден или не указан.')
			}
		}

		hasChanges = true
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
