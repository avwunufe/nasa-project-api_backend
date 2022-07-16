const router = require("express").Router()

const { httpGetAllPlanets } = require("./planets.controllers")

router.get("/", httpGetAllPlanets)

module.exports = router