import * as React from "react"
import Graph from "./Graph"
import ReactDOM from "react-dom"
import Search from "./Search"
import Stock from "./Stock"
import superagent from "superagent"
import { Card } from "@blueprintjs/core"

interface State {
	money: number

	selectedStock: null | GraphedStock

	portfolio: PortfolioStock[]
}

export interface GraphedStock {
	name: string
	dates: string[]
	costs: number[]
	currentCost: number
}

export interface PortfolioStock {
	purchaseDate: Date
	name: string
	shares: number
	originalPrice: number
	currentPrice: number
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
		this.setState({ selectedStock: null })

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
						<Search money={this.state.money} stock={this.state.selectedStock} onSearch={(term) => this.updateGraph(term)} />
						{this.state.portfolio.map((stock) => (
							<Stock
								key={`${Number(stock.purchaseDate)}-${stock.name}`}
								stock={stock}
								onClick={() => this.updateGraph(stock.name)}
							/>
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
