import * as React from "react"
import { Line } from "react-chartjs-2"
import { Stock } from ".."

interface Props {
	stock: null | Stock
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
			}} />
		)
	}
}
