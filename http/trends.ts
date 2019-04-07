import _ from "lodash"
import moment from "moment"
import trends from "google-trends-api"

// The base terms are required to ensure there are common terms that every searched term is compared
// to. There doesn't seem to be a better way to do this since Google Trends doesn't assign a search
// term an absolute value. There are multiple base terms so if one term peaks, the fictional economy
// won't plummet. The base terms must have consistent averages.
const baseTerms = ["gold", "silver", "bible"]

interface Frame {
	date: Date,
	cost: number,
}

export async function getGraph(term: string) {
	// Goes four weeks back
	const startTime = new Date()
	startTime.setDate(startTime.getDate() - 7 * 4)

	// The first request typically fails
	let data
	await retry(async () => {
		data = JSON.parse(await trends.interestOverTime({
			keyword: [term].concat(baseTerms),
			startTime,
		})).default.timelineData.map(toFrame)
	}, 3)

	// For some reason, the above API call doesn't include the last couple days, so this API call
	// fills in the gap by averaging the hour-by-hour data after the last day provided by the last
	// call (ignoring the incomplete data from today unless it's greater than yesterday).
	const lastDate = new Date((_.last(data) as Frame).date)
	lastDate.setUTCDate(lastDate.getUTCDate() + 1)

	const granularData = JSON.parse(await trends.interestOverTime({
		keyword: [term].concat(baseTerms),
		startTime: lastDate,
		granularTimeResolution: true,
	})).default.timelineData.map(toFrame)

	while (granularData[0] && granularData[0].date.getUTCDate() !== (new Date()).getUTCDate()) {
		const date = granularData[0].date.getUTCDate()
		// Takes every frame from the next day and separates it from `granularData`
		const nextDay = _.takeWhile(granularData, (frame: Frame) => frame.date.getUTCDate() === date)
		granularData.splice(0, nextDay.length)

		data.push({
			date: nextDay[0].date,
			// Averages cost
			cost: Math.round(_.sumBy(nextDay, "cost") / nextDay.length),
		})
	}

	// Includes the average of today's incomplete data only if it's greater than yesterday's
	const averageToday = Math.round(_.sumBy(granularData, "cost") / granularData.length)
	if (averageToday >= (_.last(data) as Frame).cost) {
		data.push({
			date: granularData[0].date,
			cost: averageToday,
		})
	}

	return {
		name: term,
		dates: data.map((frame) => moment(frame.date).utc().format("ddd MMM D")),
		costs: data.map((frame) => frame.cost),
		currentCost: (_.last(data) as Frame).cost,
	}
}

async function retry(func: () => void, attempts: number) {
	try {
		return await func()
	} catch (err) {
		if (attempts === 1) {
			throw err
		}

		return await retry(func, attempts - 1)
	}
}

function toFrame(frame): Frame {
	const baseAverage = _.sum(frame.value.slice(1)) / (frame.value.length - 1)
	return {
		date: new Date(1000 * Number(frame.time)),
		// If cost for a term is less than 50 cents, make it 50 cents
		cost: Math.max(Math.round(100 * 100 * frame.value[0] / baseAverage), 50),
	}
}
