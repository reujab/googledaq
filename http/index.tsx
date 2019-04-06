// Workaround for uuid requiring crypto
if (require.name !== "localRequire") {
	for (const key of Object.keys(global["require"]("crypto"))) {
		if (!["DEFAULT_ENCODING", "createCredentials", "Credentials"].includes(key)) {
			require("crypto")[key] = global["require"]("crypto")[key]
		}
	}
}

import * as React from "react"
import Graph from "./Graph"
import Header from "./Header"
import ReactDOM from "react-dom"
import Search from "./Search"
import Stock from "./Stock"
import _ from "lodash"
import uuid from "uuid/v4"
import { Button, Card, Icon } from "@blueprintjs/core"
import { Money } from "./Utils"
import { getGraph } from "./trends"

interface State {
	gameID: string
	lastUpdate: number

	// Money is stored internally as cents to avoid floating point math errors.
	money: number
	loading: boolean
	graph: null | GraphedStock
	portfolio: PortfolioStock[]
	cache: GraphedStock[]
	history: HistoryStock[]
}

// Metadata of a stock
export interface GraphedStock {
	lastUpdated: number
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

// Metadata of a sold stock in history
export interface HistoryStock extends PortfolioStock {
	id: number
	graph: GraphedStock
}

export default class Index extends React.Component<any, State> {
	constructor(props) {
		super(props)

		this.state = Object.assign(
			{
				gameID: uuid(),
				lastUpdate: Date.now(),

				money: 100 * 100,
				portfolio: [],
				cache: [],
				history: [],
			},
			JSON.parse(localStorage.indexState || "{}"),
			{
				loading: false,
				graph: null,
			},
		)

		setInterval(this.refreshPortfolio.bind(this), 1000 * 60 * 10)
	}

	componentDidMount() {
		this.refreshPortfolio()
	}

	componentDidUpdate() {
		localStorage.indexState = JSON.stringify(Object.assign({}, this.state, {
			cache: this.state.cache.filter((cache) => this.state.portfolio.find((stock) => stock.name === cache.name)),
		}))
	}

	async getGraph(term): Promise<GraphedStock> {
		const stock = Object.assign({
			lastUpdated: Date.now(),
		}, await getGraph(term)) as GraphedStock

		// Updates cache
		const cache = this.state.cache.filter((cachedStock) => cachedStock.name !== stock.name).concat([stock])
		this.setState({
			cache,
			graph: this.state.graph && cache.find((cachedStock) => cachedStock.name === this.state.graph.name),
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
				Date.now() - stock.lastUpdated < 1000 * 60 * 5
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
			lastUpdate: Date.now(),

			money: this.state.money - totalCost,
			portfolio,
		})
	}

	sell(stock: PortfolioStock, shares: number) {
		const graph = _.cloneDeep(this.getCachedGraph(stock))

		if (shares === stock.shares) {
			this.setState({
				portfolio: this.state.portfolio.filter((val) => val !== stock),
			})
		} else if (shares < stock.shares) {
			this.setState({
				portfolio: this.state.portfolio.map((val) => {
					if (val === stock) {
						return Object.assign({}, stock, {
							shares: stock.shares - shares,
						})
					}

					return val
				}),
			})
		} else {
			return
		}

		// Adds trade to history
		const lastSoldStock = _.last(this.state.history)
		if (
			lastSoldStock &&
			lastSoldStock.name === stock.name &&
			lastSoldStock.originalPrice === stock.originalPrice &&
			lastSoldStock.graph.currentCost === graph.currentCost
		) {
			// Replaces last sold stock in history with updated number of shares
			this.setState({
				history: Object.assign([], this.state.history, {
					[this.state.history.length - 1]: Object.assign({}, lastSoldStock, {
						shares: lastSoldStock.shares + shares,
						graph,
					}),
				})
			})
		} else if (stock.originalPrice !== graph.currentCost) {
			// Adds new stock in history
			// Doesn't add stock to history if the stock was sold for the same price it was bought
			// at
			this.setState({
				history: this.state.history.concat([
					Object.assign({}, stock, {
						id: Date.now(),
						loading: false,
						shares,
						graph,
					})
				]),
			})
		}

		this.setState({
			lastUpdate: Date.now(),

			money: this.state.money + shares * graph.currentCost,
		})
	}

	refreshPortfolio() {
		this.setState({
			portfolio: this.state.portfolio.map((stock) => Object.assign(stock, {
				loading: true,
			})),
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
				<div id="shadow" />

				<Card id="sidebar" elevation={3}>
					Net worth: <Money>{this.calculateNetWorth()}</Money>
					<br />
					Money: <Money>{this.state.money}</Money>

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
								key={`${stock.originalPrice}-${stock.name}`}
								stock={stock}
								graph={this.getCachedGraph(stock)}
								interactive
								open={this.state.graph && this.state.graph.name === stock.name}
								onClick={() => !stock.loading && this.updateGraph(stock.name)}
								onSell={this.sell.bind(this, stock)}
							/>
						))}
					</div>
				</Card>
				<div id="main-view">
					<Header
						gameID={this.state.gameID}
						lastUpdate={this.state.lastUpdate}
						history={this.state.history}

						onLoad={(state) => this.setState(state, this.refreshPortfolio.bind(this))}
					/>

					<div id="graph-wrapper">
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
