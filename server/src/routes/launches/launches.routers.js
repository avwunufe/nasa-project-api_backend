const routers = require("express").Router()
const {httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch} = require("./launches.controllers")


routers.get("/", httpGetAllLaunches)
routers.post("/", httpAddNewLaunch)
routers.delete("/:id", httpAbortLaunch)
module.exports = routers