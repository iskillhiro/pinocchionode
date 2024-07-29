const { default: mongoose } = require('mongoose')

const TaskSchema = new mongoose.Schema({
	taskType: {
		type: String, // YT, TG, GAME
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	reward: {
		type: Number,
		required: true,
	},
	iconSrc: {
		type: String,
		default: null,
	},
	link: {
		type: String,
		default: null,
	},
	isComplete: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})
const TaskBlockSchema = new mongoose.Schema({
	tasksBlock: [TaskSchema],
})
const ReferralSchema = new mongoose.Schema({
	user_id: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	soldo_count: {
		type: Number,
		default: 0,
	},
	zecchino_count: {
		type: Number,
		default: 0,
	},
	coin_count: {
		type: Number,
		default: 0,
	},
})

const UserBoostSchema = new mongoose.Schema({
	name: { type: String, required: true },
	icon: { type: String, required: true },
	startTime: { type: Date, default: null },
	endTime: { type: Date, default: null },
	lastUsed: { type: Date, default: null },
	level: { type: Number, default: 1 },
	usesToday: { type: Number, default: 0 },
	boostType: {
		type: String,
		required: true,
	},
	lastUsedDate: { type: Date, default: null },
})
const UpgradeBoosts = new mongoose.Schema({
	name: {
		type: String,
	},
	icon: {
		type: String,
	},
	boostType: {
		type: String,
		default: 'upgradable', // upgradable, one-time
	},
	level: {
		type: Number,
		default: 1,
	},
	maxLevel: {
		type: Number,
		default: 2,
	},
	currency: {
		type: String,
		required: true,
	},
})

const TreeCoinBoosts = new mongoose.Schema({
	name: {
		type: String,
	},
	icon: {
		type: String,
	},
	status: {
		type: Boolean,
		default: false,
	},
	startTime: {
		type: Date,
		default: null,
	},
	endTime: {
		type: Date,
		default: null,
	},
	currency: {
		type: String,
		required: true,
	},
})
const TreeSchema = new mongoose.Schema({
	isActive: { type: Boolean, default: false },
	coinPlanted: { type: Number, default: 0 },
	lootBalance: { type: Number, default: 0 },
	lastGettingLoot: { type: Date, default: null },
	landingStartDate: { type: Date, default: null },
	landingEndDate: { type: Date, default: null },
})
const InviterSchema = new mongoose.Schema({
	inviterId: {
		type: String,
		default: null,
	},
})
const RobotSchema = new mongoose.Schema({
	isActive: { type: Boolean, default: false },
	miningBalance: { type: Number, default: 0 },
	startMiningDate: { type: Date, default: null },
	endMiningDate: { type: Date, default: null },
})
const UserSchema = new mongoose.Schema({
	telegramId: { type: String, required: true, unique: true },
	username: { type: String, required: true },
	stage: { type: Number, default: 1 },
	coinStage: { type: Number, default: 0 },
	coins: { type: Number, default: 0 },
	soldoTaps: { type: Number, default: 0 },
	soldo: { type: Number, default: 0 },
	zecchinoTaps: { type: Number, default: 0 },
	zecchino: { type: Number, default: 0 },
	energy: { type: Number, default: 100 },
	maxEnergy: { type: Number, default: 100 },
	tasks: [TaskBlockSchema],
	boosts: [UserBoostSchema],
	upgradeBoosts: [UpgradeBoosts],
	tree: TreeSchema,
	robot: RobotSchema,
	treeCoinBoosts: [TreeCoinBoosts],
	inviter: [InviterSchema],
	referrals: [ReferralSchema],
	isOnline: { type: Boolean, default: false },
	lastVisit: { type: Date, default: Date.now() },
	createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model('User', UserSchema)
module.exports = User
