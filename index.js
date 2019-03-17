const express = require("express")
const trends = require("./trends")

const app = express()

app.get("/graph.json", async (req, res) => {
	const term = req.query.term.trim()

	if (term) {
		res.json(await trends.getGraph(term))
	} else {
		res.sendStatus(400)
	}
})

app.use(express.static("dist"))

app.listen(8080, () => console.log("Listening to :8080"))
