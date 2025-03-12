import mongoose from "mongoose";

const BlockedDateSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true
    }
})

export default mongoose.model("BlockedDate", BlockedDateSchema)