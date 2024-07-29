const express = require('express')
const router = express.Router()
const { getUser, updateUser } = require('../controllers/userController')
const {
	getUserTasks,
	setCompleteTask,
} = require('../controllers/taskController')
const {
	addUserBoost,
	getBoosts,
	upgradeBoost,
	activateTreeBoost,
	robotClaim,
} = require('../controllers/boostController')
const {
	plantCoin,
	startLanding,
	claim,
} = require('../controllers/treeController')
const { getStatistic } = require('../controllers/statisticController')

router.get('/user/:telegramId', getUser)
router.put('/user/update', updateUser)

router
	.get('/tasks/:telegramId', getUserTasks)
	.post('/tasks/complete', setCompleteTask)

router
	.get('/boost/activate/:telegramId/:boostName', addUserBoost)
	.get('/boost/:telegramId', getBoosts)

router.put('/upgradeBoost/:telegramId/:boostName', upgradeBoost)
router.put('/treeBoost/:telegramId/:boostName', activateTreeBoost)

router
	.post('/tree/plant', plantCoin)
	.put('/tree/start', startLanding)
	.get('/tree/claim/:telegramId', claim)

router.get('/robot/claim/:telegramId', robotClaim)

router.get('/statistic', getStatistic)
module.exports = router
