const mongoose = require('mongoose')

const referralSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	money_count: {
		type: Number,
		default: 0,
	},
	telegramId: {
		type: String,
		required: true,
		unique: true,
	},
})

const userSchema = new mongoose.Schema({
	telegramId: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,
	},
	stage: {
		type: Number,
		default: 1,
	},
	coins: {
		type: Number,
		default: 0,
	},
	soldo: {
		type: Number,
		default: 0,
	},
	zecchino: {
		type: Number,
		default: 0,
	},
	energy: {
		type: Number,
		default: 100,
	},
	maxEnergy: {
		type: Number,
		default: 100,
	},
	referrals: [referralSchema],
	createdAt: {
		type: Date,
		default: Date.now,
	},
})
const User = mongoose.model('User', userSchema)
module.exports = User
