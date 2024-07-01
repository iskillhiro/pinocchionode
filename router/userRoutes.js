const express = require('express')
const router = express.Router()
const { getUser, updateUser } = require('../controllers/userController')

router.get('/user/:telegramId', getUser)
router.put('/user/update', updateUser)

module.exports = router
