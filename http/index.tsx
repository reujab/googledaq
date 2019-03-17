import * as React from "react"
import Graph from "./Graph"
import ReactDOM from "react-dom"
import superagent from "superagent"

interface State {
	term: string
	dates: string[]
	costs: number[]
}

export default class Index extends React.Component<any, State> {
	constructor(props) {
		super(props)

		this.state = {
			term: "",
			dates: [],
			costs: [],
		}
	}

	async update() {
		const term = decodeURIComponent(location.hash.slice(1))
		this.setState({ term })
		if (!term) {
			return
		}

		// Sets dates and costs
		this.setState((await superagent.get("/graph.json").query({ term })).body)
	}

	componentDidMount() {
		addEventListener("hashchange", this.update.bind(this))
		this.update()
	}

	render() {
		return (
			<Graph term={this.state.term} dates={this.state.dates} costs={this.state.costs} />
		)
	}
}

addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(<Index />, document.querySelector("#root"))
})
