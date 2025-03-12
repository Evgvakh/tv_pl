import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        set: val => val.toLowerCase()
    },
    email: {
        type: String,
        set: val => val.toLowerCase()
    },
    phone: {
        type: String,
    },
    age: {
        type: Number
    },
    commentaries: [
        {
            appointmentID: { type: String },
            text: {type: String, required: true},
            createdAt: { type: Date, default: Date.now }
        },        
    ]
})

export default mongoose.model("Client", ClientSchema)