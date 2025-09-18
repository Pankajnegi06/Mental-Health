import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const verifyjwt = async (req,res,next)=>{
    try{
        const AccessToken = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log("Access Token : " ,AccessToken)
    
        if(!AccessToken){
            console.log("Access Token not present")
            return res.status(401).json({ message: "User is not logged in" });
        }
        const decodetoken =  jwt.verify(AccessToken,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodetoken._id).select("-password -RefreshToken")
     
        req.user = user
        next()
    }catch(error){
        console.error('JWT Verification Error:', error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
}
export {verifyjwt}