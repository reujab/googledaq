export function displayMoney(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`
}

export function displayPercent(percent: number): string {
	return `${(100 * percent).toFixed(1)}%`
}
