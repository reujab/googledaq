const { app, BrowserWindow } = require("electron")
const path = require("path")

let mainWindow = null

app.on("ready", initWindow)

app.on("window-all-closed", app.quit)

function initWindow() {
	if (mainWindow) {
		return
	}

	mainWindow = new BrowserWindow({
		height: 900,
		minHeight: 600,
		minWidth: 800,
		show: false,
		width: 1200,
		webPreferences: {
			nodeIntegration: true,
		},
	})

	mainWindow.on("closed", () => {
		mainWindow = null
	})

	mainWindow.webContents.on("before-input-event", (_, e) => {
		if (e.key === "F12" && e.type === "keyDown") {
			mainWindow.toggleDevTools()
		}
	})

	mainWindow.webContents.on("dom-ready", () => {
		mainWindow.show()
	})

	mainWindow.loadURL(`file://${path.join(__dirname, "dist/index.html")}`)
}
