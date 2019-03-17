const trends = require("google-trends-api")

// The base term is required to ensure there is a common term that every searched term is compared
// to. There doesn't seem to be a better way to do this since Google Trends doesn't assign a search
// term an absolute value.
const baseTerm = "gold"

exports.getGraph = async function getGraph(term) {
	// Goes four weeks back
	const startTime = new Date()
	startTime.setDate(startTime.getDate() - 7 * 4)

	const data = JSON.parse(await trends.interestOverTime({
		keyword: [baseTerm, term],
		startTime,
	})).default.timelineData

	const response = {
		dates: [],
		costs: [],
	}
	for (const frame of data) {
		response.dates.push(frame.formattedTime)
		// If the value for a term is 0, make it 0.5 instead
		response.costs.push(parseFloat((100 * (frame.value[1] || 0.5) / frame.value[0]).toFixed(2)))
	}
	return response
}
