const _ = require("lodash")
const moment = require("moment")
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
	})).default.timelineData.map(fixFrame)

	// For some reason, the above API call doesn't include the last couple days, so this API call
	// fills in the gap by averaging the hour-by-hour data after the last day provided by the last
	// call (ignoring the incomplete data from today unless it's greater than yesterday).
	const lastDate = new Date(_.last(data).date)
	lastDate.setUTCDate(lastDate.getUTCDate() + 1)

	const granularData = JSON.parse(await trends.interestOverTime({
		keyword: [baseTerm, term],
		startTime: lastDate,
		granularTimeResolution: true,
	})).default.timelineData.map(fixFrame)

	while (granularData[0] && granularData[0].date.getUTCDate() !== (new Date()).getUTCDate()) {
		const date = granularData[0].date.getUTCDate()
		// Takes every frame from the next day and separates it from `granularData`
		const nextDay = _.takeWhile(granularData, (frame) => frame.date.getUTCDate() === date)
		granularData.splice(0, nextDay.length)

		data.push({
			date: nextDay[0].date,
			// Averages cost
			cost: parseFloat((_.sumBy(nextDay, "cost") / nextDay.length).toFixed(2)),
		})
	}

	// Includes the average of today's incomplete data only if it's greater than yesterday's
	const averageToday = parseFloat((_.sumBy(granularData, "cost") / granularData.length).toFixed(2))
	if (averageToday >= _.last(data).cost) {
		data.push({
			date: granularData[0].date,
			cost: averageToday,
		})
	}

	return {
		name: term,
		dates: data.map((frame) => moment(frame.date).utc().format("ddd MMM D")),
		costs: data.map((frame) => frame.cost),
		currentCost: _.last(data).cost,
	}
}

function fixFrame(frame) {
	return {
		date: new Date(1000 * Number(frame.time)),
		// If cost for a term is less than 50 cents, make it 50 cents
		cost: Math.max(parseFloat((100 * frame.value[1] / frame.value[0]).toFixed(2)), 0.5),
	}
}
