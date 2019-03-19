import * as React from "react"
import { Card, Icon } from "@blueprintjs/core"
import { PortfolioStock } from ".."
import { displayMoney, displayPercent } from "../common"

interface Props {
	stock: PortfolioStock
	onClick: () => void
}

interface State { }

export default class Stock extends React.Component<Props, State> {
	getPercent() {
		return (this.props.stock.currentPrice - this.props.stock.originalPrice) / this.props.stock.originalPrice
	}

	render() {
		return (
			<Card
				className="stock"
				interactive
				elevation={1}
				onClick={this.props.onClick}
			>
				<div className="stock-name">
					<div>{this.props.stock.name}</div>
					<div>{this.props.stock.shares} Share{this.props.stock.shares === 1 ? "" : "s"}</div>
				</div>
				<div className="stock-stats">
					{displayMoney(this.props.stock.currentPrice)}/share
					<br />
					<div className={`stock-percentage ${this.getPercent() > 0 ? "green" : this.getPercent() < 0 ? "red" : "neutral"}`}>
						<Icon icon={this.getPercent() >= 1 ? "double-chevron-up" : this.getPercent() <= -1 ? "double-chevron-down" : this.getPercent() > 0 ? "chevron-up" : this.getPercent() < 0 ? "chevron-down" : "small-minus"} />
						{displayPercent(Math.abs(this.getPercent()))}
					</div>
				</div>
			</Card>
		)
	}
}
