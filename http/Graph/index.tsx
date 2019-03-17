import * as React from "react"
import { Line } from "react-chartjs-2"

interface Props {
	term: string
	dates: string[]
	costs: number[]
}

export default class Graph extends React.Component<Props> {
	render() {
		return (
			<Line data={{
				labels: this.props.dates,
				datasets: [{
					backgroundColor: "rgb(66, 133, 244)",
					label: this.props.term,
					data: this.props.costs,
					lineTension: 0.25,
				}],
			}} />
		)
	}
}
