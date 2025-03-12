import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    clientName: {
        type: String,
        set: val => val.toLowerCase()
    },
    clientID: {
        type: String
    },
    userID: {
        type: String
    },
    commentaries: [
        {            
            text: {type: String, required: true},
            createdAt: { type: Date, default: Date.now }
        },        
    ]
})

export default mongoose.model("Appointment", AppointmentSchema)