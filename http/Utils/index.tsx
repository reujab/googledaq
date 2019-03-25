import * as React from "react"

interface Props {
	children: number
}

export function formatMoney(cents: number) {
	return `$${(cents / 100).toFixed(2)}`
}

export function formatPercent(percent: number) {
	return `${(100 * percent).toFixed(1)}%`
}

export class Money extends React.Component<Props> {
	render() {
		return formatMoney(this.props.children)
	}
}

export class Percent extends React.Component<Props> {
	render() {
		return formatPercent(this.props.children)
	}
}
