import * as React from "react"
import Graph from "./Graph"
import ReactDOM from "react-dom"
import superagent from "superagent"
import { Card } from "@blueprintjs/core"

interface State {
	money: number

	selectedStock: null | Stock

	portfolio: Stock[]
}

export interface Stock {
	name: string
	dates: string[]
	costs: number[]
}

export default class Index extends React.Component<any, State> {
	constructor(props) {
		super(props)

		this.state = {
			money: 100,

			selectedStock: null,

			portfolio: [],
		}
	}

	async updateGraph(term) {
		if (term) {
			// Sets dates and costs
			this.setState({ selectedStock: (await superagent.get("/graph.json").query({ term })).body })
		}
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
								key={term.name}
								interactive
								elevation={1}
								onClick={() => this.updateGraph(term.name)}
							>
								{term.name}
							</Card>
						))}
					</div>
				</Card>
				<div id="main-view">
					<div style={{
						width: "80%",
						margin: "auto",
					}}>
						<Graph stock={this.state.selectedStock} />
					</div>
				</div>
			</React.Fragment>
		)
	}
}

addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(<Index />, document.querySelector("#root"))
})
