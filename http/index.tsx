import * as React from "react"
import Graph from "./Graph"
import ReactDOM from "react-dom"
import superagent from "superagent"
import { Card } from "@blueprintjs/core"

interface State {
	money: number

	portfolio: string[]

	term: string
	dates: string[]
	costs: number[]
}

export default class Index extends React.Component<any, State> {
	constructor(props) {
		super(props)

		this.state = {
			money: 100,

			portfolio: ["Google", "Facebook"],

			term: "",
			dates: [],
			costs: [],
		}
	}

	async update(term) {
		if (term) {
			// Sets dates and costs
			this.setState((await superagent.get("/graph.json").query({ term })).body)
		}

		this.setState({ term })
	}

	calculateNetWorth() {
		// TODO: include value of assets
		return this.state.money.toFixed(2)
	}

	render() {
		return (
			<React.Fragment>
				<Card id="sidebar" elevation={3}>
					Money: ${this.state.money.toFixed(2)}
					<br />
					Net worth: ${this.calculateNetWorth()}

					<div id="portfolio">
						{this.state.portfolio.map((term) => (
							<Card
								key={term}
								interactive
								elevation={1}
								onClick={() => this.update(term)}
							>
								{term}
							</Card>
						))}
					</div>
				</Card>
				<div id="main-view">
					<div style={{
						width: "80%",
						margin: "auto",
					}}>
						<Graph term={this.state.term} dates={this.state.dates} costs={this.state.costs} />
					</div>
				</div>
			</React.Fragment>
		)
	}
}

addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(<Index />, document.querySelector("#root"))
})
