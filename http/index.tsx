import * as React from "react"
import Graph from "./Graph"
import ReactDOM from "react-dom"
import Search from "./Search"
import Stock from "./Stock"
import _ from "lodash"
import superagent from "superagent"
import { Card } from "@blueprintjs/core"
import { displayMoney } from "./common"

interface State {
	// Money is stored internally as cents to avoid floating point math errors.
	money: number
	loading: boolean
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
			money: 100 * 100,
			loading: false,
			selectedStock: null,
			portfolio: [],
		}
	}

	async updateGraph(term) {
		if (this.state.loading) {
			return
		}

		this.setState({ selectedStock: null })

		if (term) {
			this.setState({ loading: true })
			// Sets dates and costs
			this.setState({
				selectedStock: (await superagent.get("/graph.json").query({ term })).body,
				loading: false,
			})
		}
	}

	calculateNetWorth() {
		return this.state.money + this.state.portfolio.reduce((sum, stock) => sum + stock.shares * stock.currentPrice, 0)
	}

	buy(shares) {
		const sharePrice = this.state.selectedStock.currentCost
		const totalCost = shares * sharePrice

		if (totalCost > this.state.money) {
			return
		}

		// If a stock with that name and original price already exists in the portfolio, simply
		// increase the number of shares.
		const portfolio = _.cloneDeep(this.state.portfolio)
		const existingStock = portfolio.find((stock) => stock.name.toLowerCase() === this.state.selectedStock.name.toLowerCase() && stock.originalPrice === sharePrice)
		if (existingStock) {
			existingStock.shares += shares
		} else {
			portfolio.push({
				purchaseDate: new Date(),
				name: this.state.selectedStock.name,
				shares,
				originalPrice: sharePrice,
				currentPrice: sharePrice,
			})
		}

		this.setState({
			money: this.state.money - totalCost,
			portfolio,
		})
	}

	render() {
		return (
			<React.Fragment>
				<Card id="sidebar" elevation={3}>
					Net worth: {displayMoney(this.calculateNetWorth())}
					<br />
					Money: {displayMoney(this.state.money)}

					<div id="portfolio">
						<Search
							money={this.state.money}
							loading={this.state.loading}
							stock={this.state.selectedStock}
							onSearch={this.updateGraph.bind(this)}
							onBuy={this.buy.bind(this)}
						/>
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
