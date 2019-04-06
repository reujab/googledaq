import * as React from "react"
import Stock from "../../Stock";
import { HistoryStock } from "../.."

interface Props {
	history: HistoryStock[]
}

export default class History extends React.Component<Props> {
	render() {
		return (
			<div className="history">
				{this.props.history.slice().reverse().map((stock) => (
					<Stock
						key={stock.id}
						stock={stock}
						graph={stock.graph}
						interactive={false}
						open={false}
						onClick={() => { }}
						onSell={() => { }}
					/>
				))}
			</div>
		)
	}
}
