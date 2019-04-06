import * as React from "react"
import History from "./History"
import logo from "../../googledaq.png"
import { ButtonGroup, Button, Card, IToaster, Popover, Toaster } from "@blueprintjs/core"
import { HistoryStock } from ".."

const fs = global["require"]("fs")
const { dialog } = global["require"]("electron").remote

interface Props {
	gameID: string
	lastUpdate: number
	history: HistoryStock[]

	onLoad: (object) => void
}

export default class Header extends React.Component<Props> {
	toaster: IToaster

	constructor(props) {
		super(props)

		// Toasters cannot be created in React lifecycle methods.
		setImmediate(() => this.toaster = Toaster.create({
			position: "bottom",
		}))
	}

	showError(message: string) {
		this.toaster.show({
			icon: "warning-sign",
			intent: "danger",
			message,
		})
	}

	render() {
		return (
			<Card className="header" elevation={3}>
				<img draggable={false} src={logo} />
				<h1 className="bp3-heading">GoogleDAQ</h1>

				<div style={{ flexGrow: 1 }} />

				{(!!this.props.history.length && (
					<Popover usePortal={false}>
						<Button style={{ marginRight: 8 }} icon="history">History</Button>
						<History history={this.props.history} />
					</Popover>
				))}

				<ButtonGroup>
					<Button
						icon="download"
						onClick={() => {
							const path = dialog.showSaveDialog({
								defaultPath: "GoogleDAQ.gdaq",
							})
							if (path) {
								fs.writeFile(path, btoa(localStorage.indexState), (err) => {
									if (err) {
										console.warn(err)
										this.showError(String(err))
									}
								})
							}
						}}
					>
						Save
					</Button>
					<Button
						icon="upload"
						onClick={() => {
							const path = dialog.showOpenDialog({
								filters: [{
									name: "GoogleDAQ Save Files",
									extensions: ["gdaq"],
								}],
								properties: ["openFile"],
							})

							if (path && path[0]) {
								let file
								try {
									file = fs.readFileSync(path[0])
								} catch (err) {
									console.warn(err)
									this.showError(String(err))
									return
								}

								let decoded
								try {
									decoded = atob(file)
								} catch (err) {
									this.showError("Selected file is not a save file")
									return
								}

								let state
								try {
									state = JSON.parse(decoded)
								} catch (err) {
									this.showError("Failed to parse save file")
									return
								}

								if (!state.gameID) {
									this.showError("No game ID found")
									return
								}

								if (state.gameID === this.props.gameID && state.lastUpdate < this.props.lastUpdate) {
									this.showError("Cannot load state from previous save")
									return
								}

								this.props.onLoad(state)
							}
						}}
					>
						Load
					</Button>
				</ButtonGroup>
			</Card>
		)
	}
}
