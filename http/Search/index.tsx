import * as React from "react"
import { Button, Callout, Card, Icon, InputGroup, NumericInput, Spinner } from "@blueprintjs/core"
import { GraphedStock } from ".."
import { displayMoney, displayPercent } from "../common"

// There is a <Collapse> from blueprint, but it's not nearly as good as the one from material.
import Collapse from "@material-ui/core/Collapse"

interface Props {
	money: number
	stock: null | GraphedStock
	onSearch: (string) => void
}

interface State {
	open: boolean
	loading: boolean

	shares: number
}

export default class Search extends React.Component<Props, State> {
	constructor(props) {
		super(props)

		this.state = {
			open: false,
			loading: false,

			shares: 0
		}
	}

	getPrice() {
		return this.state.shares * this.props.stock.currentCost
	}

	render() {
		return (
			<Card
				interactive={!this.state.open}
				elevation={this.state.open ? 4 : 2}
				onClick={() => this.setState({ open: true })}
			>
				<Collapse in={!this.state.open} style={{ textAlign: "center" }}>
					<Icon icon="plus" />
				</Collapse>
				<Collapse in={this.state.open}>
					<Collapse in={!this.state.loading && !this.props.stock}>
						<InputGroup
							style={{ marginBottom: 10 }}
							defaultValue={this.props.stock && this.props.stock.name}
							placeholder="Search term"
							onKeyDown={(e) => {
								const value = (e.target as HTMLInputElement).value
								if (e.key === "Enter" && value) {
									this.setState({ loading: true })
									this.props.onSearch(value)
								}
							}}
						/>
					</Collapse>
					<Collapse in={this.state.loading && !this.props.stock}>
						<div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}>
							<Spinner size={58} />
						</div>
					</Collapse>
					<Collapse in={!!this.props.stock}>
						{this.props.stock && (
							<div>
								Share price: {displayMoney(this.props.stock.currentCost)}

								<div style={{
									display: "flex",
									margin: "10px 0"
								}}>
									<div style={{ flex: "1 0" }}>
										<NumericInput
											clampValueOnBlur
											fill
											min={0}
											minorStepSize={null}
											max={Math.floor(this.props.money / this.props.stock.currentCost)}
											onValueChange={(shares) => this.setState({ shares: shares || 0 })}
											value={this.state.shares}
										/>
									</div>
									<Button
										style={{ flex: "auto 0", marginLeft: 5 }}
										disabled={!this.state.shares}
									>
										Buy
									</Button>
								</div>

								<Collapse in={this.state.shares > 0}>
									<Callout style={{ marginBottom: 10 }} icon="info-sign" intent="primary">
										Buying {this.state.shares} share{this.state.shares === 1 ? "" : "s"} will cost {displayMoney(this.getPrice())}, which is {displayPercent(this.getPrice() / this.props.money)} of your total money.
									</Callout>
								</Collapse>
							</div>
						)}
					</Collapse>
					<Button
						fill
						onClick={(e) => {
							// Stops the event from bubbling to the card, which will set open to
							// true again
							e.stopPropagation()
							this.props.onSearch("")
							this.setState({
								open: false,
								loading: false,

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
