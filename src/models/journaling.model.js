import mongoose, { model } from "mongoose";

const journalSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    note:{
        type:"String",
    },
    mood:{
        type:"String",
        required:true,
    },
    date:{
        type:Date,
        default:Date.now
    }
});

export default mongoose.model("journalingSchema",journalSchema);