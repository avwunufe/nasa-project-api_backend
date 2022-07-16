const mongoose = require("mongoose")
const MONGO_URL = process.env.MONGO_URL

mongoose.connection.once("open", ()=>{
    console.log("MongoDB connection started");
})
mongoose.connection.on("error", ()=>{
    console.error("MongoDB connection error");
})

async function mongoConnect() {
   await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        // useFindAndModify: false,
        // useCreateIndex: true,
        useUnifiedTopology: true
    })
}

async function mongooseDisconnect(){
    await mongoose.disconnect()
}

module.exports = {
    mongoConnect,
    mongooseDisconnect
}


module.exports = {
    mongoConnect
}