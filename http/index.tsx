import * as React from "react"
import ReactDOM from "react-dom"
import superagent from "superagent"
import { Line } from "react-chartjs-2"

interface State {
	term: string
	dates: string[]
	costs: number[]
}

export default class Index extends React.Component<any, State> {
	constructor(props) {
		super(props)

		this.state = {
			term: "",
			dates: [],
			costs: [],
		}
	}

	async update() {
		const term = decodeURIComponent(location.hash.slice(1))
		this.setState({ term })
		if (!term) {
			return
		}

		// Sets dates and costs
		this.setState((await superagent.get("/graph.json").query({ term })).body)
	}

	componentDidMount() {
		addEventListener("hashchange", this.update.bind(this))
		this.update()
	}

	render() {
		return (
			<div>
				<Line data={{
					labels: this.state.dates,
					datasets: [{
						backgroundColor: "rgb(66, 133, 244)",
						label: this.state.term,
						data: this.state.costs,
						lineTension: 0.25,
					}],
				}} />
			</div>
		)
	}
}

addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(<Index />, document.querySelector("#root"))
})
