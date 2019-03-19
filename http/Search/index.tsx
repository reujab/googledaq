import * as React from "react"
import { Button, Callout, Card, Icon, InputGroup, NumericInput, Spinner } from "@blueprintjs/core"
import { GraphedStock } from ".."
import { displayMoney, displayPercent } from "../common"

// There is a <Collapse> from blueprint, but it's not nearly as good as the one from material.
import Collapse from "@material-ui/core/Collapse"

interface Props {
	money: number
	loading: boolean
	stock: null | GraphedStock

	onSearch: (string) => void
	onBuy: (number) => void
}

interface State {
	searching: boolean
	shares: number
}

export default class Search extends React.Component<Props, State> {
	constructor(props) {
		super(props)

		this.state = {
			searching: false,
			shares: 0,
		}
	}

	isOpen() {
		return this.state.searching || this.props.loading || !!this.props.stock
	}

	getSharePrice() {
		return this.props.stock ? this.props.stock.currentCost : 0
	}

	getTotalPrice() {
		return this.state.shares * this.getSharePrice()
	}

	render() {
		return (
			<Card
				interactive={!this.isOpen()}
				elevation={this.isOpen() ? 4 : 2}
				onClick={() => this.setState({ searching: true })}
			>
				<Collapse in={!this.isOpen()} style={{ textAlign: "center" }}>
					<Icon icon="plus" />
				</Collapse>
				<Collapse in={this.isOpen() && !this.props.stock && !this.props.loading}>
					<InputGroup
						leftIcon="search"
						placeholder="Search term"

						onKeyDown={(e) => {
							const value = (e.target as HTMLInputElement).value
							if (e.key === "Enter" && value) {
								this.props.onSearch(value.trim())
							}
						}}
					/>
				</Collapse>
				<Collapse in={this.props.loading}>
					<div style={{ display: "flex", justifyContent: "center" }}>
						<Spinner size={58} />
					</div>
				</Collapse>
				<Collapse in={!!this.props.stock}>
					<div>
						Share price: {displayMoney(this.getSharePrice())}

						<div style={{ display: "flex", marginTop: 10 }}>
							<div style={{ flex: "1 0" }}>
								<NumericInput
									clampValueOnBlur
									fill
									min={0}
									minorStepSize={null}
									max={Math.floor(this.props.money / this.getSharePrice())}
									onValueChange={(shares) => this.setState({ shares: shares || 0 })}
									value={this.state.shares}
								/>
							</div>
							<Button
								style={{ flex: "auto 0", marginLeft: 5 }}
								disabled={!this.state.shares}
								onClick={() => this.props.onBuy(Math.floor(this.state.shares))}
							>
								Buy
							</Button>
						</div>

						<Collapse in={this.state.shares > 0}>
							<div style={{ height: 10 }} />
							{this.getTotalPrice() <= this.props.money ? (
								<Callout icon="info-sign" intent="primary">
									Buying {this.state.shares} share{this.state.shares === 1 ? "" : "s"} will cost {displayMoney(this.getTotalPrice())}, which is {displayPercent(this.getTotalPrice() / this.props.money)} of your total money.
								</Callout>
							) : ((
								<Callout icon="error" intent="danger">
									You don't have enough money to buy {this.state.shares} share{this.state.shares === 1 ? "" : "s"}.
								</Callout>
							))}
						</Collapse>
					</div>
				</Collapse>

				<Collapse in={this.isOpen() && !this.props.loading}>
					<Button
						style={{ marginTop: 10 }}
						fill
						onClick={(e) => {
							// Stops the event from bubbling to the card, which will set open to
							// true again
							e.stopPropagation()
							this.props.onSearch("")
							this.setState({
								searching: false,
								shares: 0,
							})
						}}
					>
						Cancel
					</Button>
				</Collapse>
			</Card>
		)
	}
}
