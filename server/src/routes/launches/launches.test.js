const request = require("supertest")

const app = require("../../app")
const { mongoConnect, mongooseDisconnect } = require("../../services/mongo")

describe("Launches API", ()=>{
    beforeAll(async()=>{
       await mongoConnect()
    })

    afterAll(async()=>{
        await mongooseDisconnect()
    })

    describe("GET/ launches",  ()=>{
        test("It should respond with 200 success", async ()=>{
            const response = await request(app).get("/v1/launches").expect(200).
            expect("Content-Type", /json/)
            // expect(response.statusCode).toBe(200)
        })
    })
    describe("POST/ launches", ()=>{
        const completeLaunchData = {
            mission:"ZTM&&",
            rocket: "ZTM ex 2536",
            target:"Kepler-442 b",
            launchDate: "January 17, 2030"
        }
        const launchDataWithInvalidDate = {
            mission:"ZTM&&",
            rocket: "ZTM ex 2536",
            target:"Kepler-442 b",
            launchDate: "zoot"
        }
        const launchDataWithoutDate = {
            mission:"ZTM&&",
            rocket: "ZTM ex 2536",
            target:"Kepler-442 b",
        }
        test("It should respond with 201 success", async ()=>{
            const response = await request(app).post("/v1/launches")
            .send(completeLaunchData)
            .expect("Content-Type", /json/)
            .expect(201)
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf()
            const responseDate = new Date(response.body.launchDate).valueOf()
    
            expect(requestDate).toBe(responseDate)
            expect(response.body).toMatchObject(launchDataWithoutDate)
        })
    
        test("It should catch missing required properties", async ()=>{
    
            const response = await request(app).post("/v1/launches")
            .send(launchDataWithoutDate)
            .expect("Content-Type", /json/)
            .expect(400)
    
            expect(response.body).toStrictEqual({
                error: "Missing required launch property"
            })
        })
        test("Should catch invalid date error", async()=>{
            
            const response = await request(app).post("/v1/launches")
            .send(launchDataWithInvalidDate)
            .expect("Content-Type", /json/)
            .expect(400)
        
            expect(response.body).toStrictEqual({
                error: "Invalid launch date"
            })
            
        })
    })
})