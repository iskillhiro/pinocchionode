const User = require('../models/User')

const getUserTasks = async (req, res) => {
	const telegramId = req.params.telegramId
	try {
		const user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Фильтруем задачи на наличие хотя бы одной невыполненной задачи в блоке
		const filteredIncompleteTasks = user.tasks.filter(taskBlock =>
			taskBlock.tasksBlock.some(task => !task.isComplete)
		)

		return res.json({
			user: {
				telegramId: user.telegramId,
				username: user.username,
			},
			incompleteTasks: filteredIncompleteTasks,
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: 'Internal server error' })
	}
}

const setCompleteTask = async (req, res) => {
	const { telegramId, id } = req.body // Используем id вместо taskId

	try {
		const user = await User.findOne({ telegramId })

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Проверяем наличие задачи с указанным id в каждом блоке
		let taskFound = false
		user.tasks.forEach(taskBlock => {
			taskBlock.tasksBlock.forEach(task => {
				if (task._id.toString() === id) {
					task.isComplete = true

					user.stage == 1 // Выдача награды
						? (user.soldoTaps += task.reward)
						: (user.zecchinoTaps += task.reward)
					taskFound = true
				}
			})
		})

		if (!taskFound) {
			return res.status(404).json({ error: 'Task not found' })
		}

		await user.save()

		res.status(200).json({ message: 'Task completed successfully' })
	} catch (error) {
		console.error('Error completing task:', error)
		res
			.status(500)
			.json({ error: 'An error occurred while completing the task' })
	}
}

module.exports = {
	getUserTasks,
	setCompleteTask,
}
