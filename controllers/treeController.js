const User = require('../models/User')
const checkUserBalance = require('../utils/checkUserBalance/checkUserBalance')

const plantCoin = async (req, res) => {
	const telegramId = req.body.telegramId

	const user = await User.findOne({ telegramId })

	if (user) {
		if (checkUserBalance(user, 'zecchino', 1)) {
			user.tree.coinPlanted += 1
			user.zecchino -= 1
			user.lastVisit = Date.now()
			user.isOnline = true
			await user.save()
			res.status(200).json({
				message: 'Successful plant',
			})
		} else {
			return res.status(423).json({
				message: 'Insufficient funds for plant coin',
			})
		}
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
		user.lastVisit = Date.now()
		user.isOnline = true
		await user.save()
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

const disableTree = async user => {
	user.tree.isActive = false
	user.tree.landingStartDate = null
	user.tree.landingEndDate = null
	user.tree.lastGettingLoot = null
	user.tree.lootBalance = 0
	user.tree.coinPlanted = 0
	user.lastVisit = Date.now()
	user.isOnline = true
	await user.save()
}
module.exports = {
	plantCoin,
	startLanding,
	claim,
}
