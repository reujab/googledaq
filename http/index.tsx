import * as React from "react"
import Graph from "./Graph"
import ReactDOM from "react-dom"
import Search from "./Search"
import Stock from "./Stock"
import _ from "lodash"
import superagent from "superagent"
import { Button, Card, Icon } from "@blueprintjs/core"
import { displayMoney } from "./common"

interface State {
	// Money is stored internally as cents to avoid floating point math errors.
	money: number
	loading: boolean
	graph: null | GraphedStock
	portfolio: PortfolioStock[]
	cache: GraphedStock[]
}

// Metadata of a stock
export interface GraphedStock {
	lastUpdated: Date
	name: string
	dates: string[]
	costs: number[]
	currentCost: number
}

// Metadata of a purchased stock
export interface PortfolioStock {
	name: string
	shares: number
	originalPrice: number
	loading: boolean
}

export default class Index extends React.Component<any, State> {
	constructor(props) {
		super(props)

		this.state = {
			money: 100 * 100,
			loading: false,
			graph: null,
			portfolio: [],
			cache: [],
		}
	}

	async getGraph(term): Promise<GraphedStock> {
		const stock = (await superagent.get("/graph.json").query({ term })).body
		stock.lastUpdated = new Date()
		this.setState({
			cache: this.state.cache.filter((cachedStock) => cachedStock.name !== stock.name).concat([stock]),
		})
		return stock
	}

	async updateGraph(term) {
		if (this.state.loading) {
			return
		}

		for (const stock of this.state.cache) {
			if (
				stock.name === term &&
				Date.now() - Number(stock.lastUpdated) < 1000 * 60 * 5
			) {
				this.setState({ graph: stock })
				return
			}
		}

		this.setState({ graph: null })

		if (term) {
			this.setState({ loading: true })
			// Sets dates and costs
			this.setState({
				graph: await this.getGraph(term),
				loading: false,
			})
		}
	}

	getCachedGraph(stock: PortfolioStock): GraphedStock {
		return this.state.cache.find((cachedStock) => cachedStock.name === stock.name)
	}

	calculateNetWorth() {
		return this.state.money + this.state.portfolio.reduce((sum, stock) => sum + stock.shares * this.getCachedGraph(stock).currentCost, 0)
	}

	buy(shares) {
		const sharePrice = this.state.graph.currentCost
		const totalCost = shares * sharePrice

		if (totalCost > this.state.money) {
			return
		}

		// If a stock with that name and original price already exists in the portfolio, simply
		// increase the number of shares.
		const portfolio = _.cloneDeep(this.state.portfolio)
		const existingStock = portfolio.find((stock) => stock.name === this.state.graph.name && stock.originalPrice === sharePrice)
		if (existingStock) {
			existingStock.shares += shares
		} else {
			portfolio.push({
				name: this.state.graph.name,
				shares,
				originalPrice: sharePrice,
				loading: false,
			})
		}

		this.setState({
			money: this.state.money - totalCost,
			portfolio,
		})
	}

	refreshPortfolio() {
		this.setState({
			portfolio: this.state.portfolio.map((stock) => Object.assign(stock, {
				loading: true,
			}))
		})

		for (const stock of this.state.portfolio) {
			this.getGraph(stock.name).then(() => this.setState({
				portfolio: this.state.portfolio.map((subStock) => {
					if (stock === subStock) {
						return Object.assign(subStock, { loading: false })
					}
					return subStock
				})
			}))
		}
	}

	render() {
		return (
			<React.Fragment>
				<Card id="sidebar" elevation={3}>
					Net worth: {displayMoney(this.calculateNetWorth())}
					<br />
					Money: {displayMoney(this.state.money)}

					<div id="portfolio">
						<h3 className="bp3-heading">
							Portfolio
							<Button onClick={() => this.refreshPortfolio()}>
								<Icon icon="refresh" />
							</Button>
						</h3>

						<Search
							money={this.state.money}
							loading={this.state.loading}
							stock={this.state.graph}
							onSearch={this.updateGraph.bind(this)}
							onBuy={this.buy.bind(this)}
						/>
						{this.state.portfolio.map((stock) => (
							<Stock
								key={`${Number(stock.originalPrice)}-${stock.name}`}
								stock={stock}
								graph={this.getCachedGraph(stock)}
								onClick={() => !stock.loading && this.updateGraph(stock.name)}
							/>
						))}
					</div>
				</Card>
				<div id="main-view">
					<div style={{
						width: "80%",
						margin: "auto",
					}}>
						<Graph stock={this.state.graph} />
					</div>
				</div>
			</React.Fragment>
		)
	}
}

addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(<Index />, document.querySelector("#root"))
})
