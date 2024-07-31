function checkUserBalance(user, currency, amount, boost = null) {
	// Проверяем, что amount - положительное число
	if (typeof amount !== 'number') {
		return false
	}
	if (boost !== null && amount === 0) {
		amount = boost.minPrice
	}

	switch (currency) {
		case 'soldo':
			// Убедимся, что у пользователя есть поле soldo и оно числовое
			return typeof user.soldo === 'number' && user.soldo >= amount
		case 'soldoTaps':
			return typeof user.soldoTaps === 'number' && user.soldoTaps >= amount
		case 'zecchino':
			return typeof user.zecchino === 'number' && user.zecchino >= amount
		case 'zecchinoTaps':
			return (
				typeof user.zecchinoTaps === 'number' && user.zecchinoTaps >= amount
			)
		case 'coins':
			return typeof user.coins === 'number' && user.coins >= amount
		default:
			return false
	}
}

module.exports = checkUserBalance
