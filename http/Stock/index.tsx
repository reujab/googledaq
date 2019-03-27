import * as React from "react"
import Collapse from "@material-ui/core/Collapse"
import { Button, Card, Icon, NumericInput, Spinner, Tooltip } from "@blueprintjs/core"
import { Line } from "peity-react"
import { PortfolioStock, GraphedStock } from ".."
import { Money, Percent } from "../Utils"

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
				interactive={!this.props.stock.loading && !this.props.open}
				elevation={this.props.open ? 3 : 1}
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
						<Money>{this.props.graph.currentCost}</Money>/share
						<div className="stock-graph-wrapper">
							<Line values={this.props.graph.costs} width={64} />
							<Tooltip content={<React.Fragment>Net {this.props.graph.currentCost >= this.props.stock.originalPrice ? "profit" : "loss"}: <Money>{Math.abs(this.props.graph.currentCost - this.props.stock.originalPrice)}</Money></React.Fragment>} usePortal={false}>
								<div className={`stock-percentage ${this.getPercent() > 0 ? "green" : this.getPercent() < 0 ? "red" : "neutral"}`}>
									<Icon icon={this.getPercent() >= 1 ? "double-chevron-up" : this.getPercent() <= -1 ? "double-chevron-down" : this.getPercent() > 0 ? "chevron-up" : this.getPercent() < 0 ? "chevron-down" : "small-minus"} />
									<Percent>{Math.abs(this.getPercent())}</Percent>
								</div>
							</Tooltip>
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
