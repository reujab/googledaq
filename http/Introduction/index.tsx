import * as React from "react"

export default class Introduction extends React.Component {
	render() {
		return (
			<div className="introduction">
				<h2>Introduction</h2>

				<p>GoogleDAQ is a game about trading stocks in Google Trends. Your goal is to buy stocks in a search term and sell those stocks when their price peaks. The more Google searches for that search term there are, the higher the price of the stock will be. For example, you could buy stocks in "super bowl" in late January of 2020, and sell them on February 2, 2020, when the stock will peak due to people googling that term.</p>

				<p>The price of stocks reset at the beginning of every day, unlike the actual stock market, so to prevent you from simply buying any stock at the beginning of a day and selling it at the end of the day for a guaranteed profit, the current day will only be factored in if the stock price is higher than the previous day. Keep in mind that Google Trends uses the UTC time zone (displayed above), so the day starts at 12:00am UTC.</p>

				<p>You only start off with $100, so you won't be able to buy any of the big stocks, so start with something small. Maybe it's a weekend and you want to invest in something that you think people will be more likely to search on a weekday.</p>
			</div>
		)
	}
}
