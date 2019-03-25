import * as React from "react"
import logo from "../../googledaq.png"
import { ButtonGroup, Button, Card } from "@blueprintjs/core"

export default class Header extends React.Component {
	render() {
		return (
			<Card className="header" elevation={3}>
				<img draggable={false} src={logo} />
				<h1 className="bp3-heading">GoogleDAQ</h1>

				<div style={{ flexGrow: 1 }} />

				<ButtonGroup>
					<Button icon="download">Save</Button>
					<Button icon="upload">Load</Button>
				</ButtonGroup>
			</Card>
		)
	}
}
