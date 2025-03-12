import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({    
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        set: val => val.toLowerCase()
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        required: true
    },
})

export default mongoose.model("User", UserSchema)