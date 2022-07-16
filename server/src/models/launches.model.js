const launchesModel = require("./launches.mongo")
const planets = require("./planets.mongo")

const axois = require("axios")

// const launches = new Map()
const DEFAULT_FLIGHT_NUMBER = 100
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query"

async function getLatestFlightNumber(){
    const latestLaunch = await launchesModel
    .findOne()
    .sort("-flightNumber")

     if(!latestLaunch){
         return DEFAULT_FLIGHT_NUMBER
     }

     return latestLaunch.flightNumber
}

async function getAllLaunches(skip, limit) {
    return await launchesModel.find({},{
        "_id":0, "__v": 0
    })
    .sort({flightNumber: 1})
    .skip(skip)
    .limit(limit)
}

async function saveLaunch(launch){
    await launchesModel.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
}

async function scheduleNewLaunch(launch) {
    const newFlightNumber = await getLatestFlightNumber() + 1
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true, 
        customers: ["ZTM", "NASA"],
        flightNumber: newFlightNumber
    })
    const planet = await planets.findOne({
        keplerName: launch.target
    })

    if(!planet){
        throw new Error("No matching planet found")
    }
    await saveLaunch(newLaunch)
}

// function addNewLaunch(launch) {
//     latestFlightNumber++
    
//     launches.set(latestFlightNumber, Object.assign(launch, {
//         flightNumber: latestFlightNumber,
//         customers: ["Zero to mastery", "NASA"],
//         upcoming: true,
//         success: true
//     }))
// }

async function abortLaunchWithId(id) {
    const aborted = await launchesModel.updateOne({
        flightNumber: id
    }, {
        upcoming: false,
        success: false
    })
    return aborted.acknowledged == true && aborted.modifiedCount == 1
}

async function populateLaunches() {
    console.log("Downloading launches data");
    const response = await axois.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: "rocket",
                    select: {
                        name: 1
                    }
                },
                {
                    path: "payloads",
                    select: {
                        "customers": 1
                    },
                    // strictPopulate: false
                }
            ]   
        }
    })  

    if (response.status != 200){
        throw new Error("Launch not downloaded")
    }

    const launchDocs = response.data.docs
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc["payloads"]
        const customers = payloads.flatMap((payload)=>{
            return payload["customers"]
        })
        const launch = {
            flightNumber: launchDoc["flight_number"],
            mission: launchDoc["name"],
            rocket: launchDoc["rocket"]["name"],
            launchDate: launchDoc["date_local"],
            upcoming: launchDoc["upcoming"],
            success: launchDoc["success"],
            customers

        }
        console.log(`FN: ${launch.flightNumber}, LM: ${launch.mission}`);
        await saveLaunch(launch)
    }
    // console.log(response.data.docs[1])
}

async function findLaunch(filter){
   return await launchesModel.findOne(filter)
}

async function existsLaunchWithId(id){
    return await findLaunch({
        flightNumber: id
    })
}

async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: "Falcon 1",
        mission: "FalconSat"
    })
    if(firstLaunch){
        console.log("Launches already exist");
        console.log(firstLaunch);
        return
    } else {
        await populateLaunches()  
    }
    
}

// async function loadLaunchesData(){
//     const launch = await launchesModel.findOne({
//         flightNumber: 1
//     })
//     console.log(launch);
// }
  
module.exports = {
    getAllLaunches,
    existsLaunchWithId,
    abortLaunchWithId,
    scheduleNewLaunch,
    loadLaunchesData
}