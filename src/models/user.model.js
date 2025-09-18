import mongoose, { Schema, model } from "mongoose";
import jwt from "jsonwebtoken"
const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
    ,
    profile:{
        type:String,
        required:false
    },
    RefreshToken:{
        type:String
    }
},{timestamps:true})


userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
        _id:this._id,
        username:this.username,
        email:this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = model("User",userSchema)
export default User