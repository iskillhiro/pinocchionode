export function checkUserBalance(user, currency, amount) {
	switch (currency) {
		case 'soldo':
			return user.soldo >= amount ? true : false
		case 'soldoTaps':
			return user.soldoTaps >= amount ? true : false
		case 'zecchino':
			return user.zecchino >= amount ? true : false
		case 'zecchinoTaps':
			return user.zecchinoTaps >= amount ? true : false
		case 'coins':
			return user.coins >= amount ? true : false
		default:
			return false
	}
}
