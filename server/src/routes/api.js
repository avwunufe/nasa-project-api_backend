const express = require("express")
const planetRouter = require("./planets/planets.routers")
const launchesRouter = require("./launches/launches.routers")
const api = express()

api.use("/planets", planetRouter)
api.use("/launches", launchesRouter)

module.exports = api