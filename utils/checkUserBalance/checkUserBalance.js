function checkUserBalance(user, currency, amount) {
	if (typeof amount !== 'number' || amount <= 0) {
		return false
	}

	switch (currency) {
		case 'soldo':
			return user.soldo >= amount
		case 'soldoTaps':
			return user.soldoTaps >= amount
		case 'zecchino':
			return user.zecchino >= amount
		case 'zecchinoTaps':
			return user.zecchinoTaps >= amount
		case 'coins':
			return user.coins >= amount
		default:
			return false
	}
}
