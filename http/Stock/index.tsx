import * as React from "react"
import Collapse from "@material-ui/core/Collapse"
import { Button, Card, Icon, NumericInput, Spinner } from "@blueprintjs/core"
import { PortfolioStock, GraphedStock } from ".."
import { displayMoney, displayPercent } from "../common"

interface Props {
	stock: PortfolioStock
	graph: GraphedStock
	open: boolean

	onClick: () => void
	onSell: (number) => void
}

interface State {
	shares: number
}

export default class Stock extends React.Component<Props, State> {
	constructor(props) {
		super(props)

		this.state = {
			shares: 0,
		}
	}

	getPercent() {
		return (this.props.graph.currentCost - this.props.stock.originalPrice) / this.props.stock.originalPrice
	}

	render() {
		return (
			<Card
				className="stock"
				interactive={!this.props.stock.loading}
				elevation={1}
				onClick={this.props.onClick}
			>
				{this.props.stock.loading && (
					<div className="stock-spinner">
						<Spinner />
					</div>
				)}

				<div className="stock-stats">
					<div className="stock-stats-left">
						<div>{this.props.stock.name}</div>
						<div>{this.props.stock.shares} Share{this.props.stock.shares === 1 ? "" : "s"}</div>
					</div>
					<div className="stock-stats-right">
						{displayMoney(this.props.graph.currentCost)}/share
						<br />
						<div className={`stock-percentage ${this.getPercent() > 0 ? "green" : this.getPercent() < 0 ? "red" : "neutral"}`}>
							<Icon icon={this.getPercent() >= 1 ? "double-chevron-up" : this.getPercent() <= -1 ? "double-chevron-down" : this.getPercent() > 0 ? "chevron-up" : this.getPercent() < 0 ? "chevron-down" : "small-minus"} />
							{displayPercent(Math.abs(this.getPercent()))}
						</div>
					</div>
				</div>

				<Collapse in={this.props.open}>
					<div style={{ display: "flex", marginTop: 10 }}>
						<div style={{ flex: "1 0" }}>
							<NumericInput
								clampValueOnBlur
								fill
								min={0}
								minorStepSize={null}
								max={this.props.stock.shares}
								onValueChange={(shares) => this.setState({ shares: shares || 0 })}
								value={this.state.shares}
							/>
						</div>
						<Button
							style={{ flex: "auto 0", marginLeft: 5 }}
							disabled={!this.state.shares}
							onClick={() => this.props.onSell(Math.floor(this.state.shares))}
						>
							Sell
						</Button>
					</div>
				</Collapse>
			</Card>
		)
	}
}
