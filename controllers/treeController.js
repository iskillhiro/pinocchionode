const User = require('../models/User')

const plantCoin = async (req, res) => {
	const telegramId = req.body.telegramId

	const user = await User.findOne({ telegramId })

	if (user) {
		// TODO: внедрить проверку баланса коинов

		user.tree.coinPlanted += 1
		user.save()
		res.status(200).json({
			message: 'Successful plant',
		})
	}
}
const startLanding = async (req, res) => {
	const telegramId = req.body.telegramId
	const user = await User.findOne({ telegramId })
	if (user) {
		let tree = user.tree
		if (user.tree.coinPlanted > 0 && user.tree.isActive === false) {
			let now = Date.now()
			tree.isActive = true
			tree.landingStartDate = now
			tree.landingEndDate = now + 24 * 60 * 60 * 1000
		}

		user.save()
		res.status(200).json({
			message: 'Successful landing start',
		})
	}
}

const claim = async (req, res) => {
	const telegramId = req.params.telegramId
	const user = await User.findOne({ telegramId })
	if (user) {
		if (new Date(user.tree.landingEndDate) < Date.now()) {
			user.coins += user.tree.lootBalance
			disableTree(user)
			res.status(200).json({
				message: 'Successful claim',
			})
		}
	} else {
		res.status(404).json({
			error: 'User not found',
		})
	}
}

const disableTree = user => {
	user.tree.isActive = false
	user.tree.landingStartDate = null
	user.tree.landingEndDate = null
	user.tree.lootBalance = 0
	user.tree.coinPlanted = 0
	user.save()
}
module.exports = {
	plantCoin,
	startLanding,
	claim,
}
