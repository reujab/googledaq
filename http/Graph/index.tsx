import * as React from "react"
import { GraphedStock } from ".."
import { Line } from "react-chartjs-2"
import { displayMoney } from "../common"

interface Props {
	stock: null | GraphedStock
}

export default class Graph extends React.Component<Props> {
	render() {
		return this.props.stock && (
			<Line data={{
				labels: this.props.stock.dates,
				datasets: [{
					backgroundColor: "rgb(66, 133, 244)",
					label: this.props.stock.name,
					data: this.props.stock.costs,
					lineTension: 0.25,
				}],
			}} options={{
				// The animation seems to be a bit glitched.
				animation: {
					duration: 0,
				},

				scales: {
					yAxes: [{
						ticks: {
							callback(cents) {
								return displayMoney(cents)
							},
						},
					}],
				},

				legend: {
					display: false,
				},

				title: {
					display: true,
					fontSize: 24,
					text: this.props.stock.name,
				},

				tooltips: {
					displayColors: false,

					callbacks: {
						label: (tooltip) => displayMoney(this.props.stock.costs[tooltip.index])
					},
				},
			}} />
		)
	}
}
