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
} = require('../controllers/boostController')

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
module.exports = router
