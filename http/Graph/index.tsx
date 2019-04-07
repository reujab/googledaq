import * as React from "react"
import { GraphedStock } from ".."
import { Line } from "react-chartjs-2"
import { formatMoney } from "../Utils"

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
					cubicInterpolationMode: "monotone",
					data: this.props.stock.costs,
					label: this.props.stock.name,
				}],
			}} options={{
				scales: {
					yAxes: [{
						ticks: {
							callback(cents) {
								return formatMoney(cents)
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
						label: (tooltip) => formatMoney(this.props.stock.costs[tooltip.index])
					},
				},
			}} />
		)
	}
}
