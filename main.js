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
		width: 1200,
		height: 900,
		show: false,
		webPreferences: {
			nodeIntegration: true,
		},
	})

	mainWindow.on("closed", () => {
		mainWindow = null
	})

	mainWindow.webContents.on("dom-ready", () => {
		mainWindow.show()
	})

	mainWindow.loadURL(`file://${path.join(__dirname, "dist/index.html")}`)
}
