import mongoose from "mongoose";

const connection = async()=>{

    try {
        console.log(process.env.DB_URI);
        
        const connect = await mongoose.connect(process.env.DB_URI)
        console.log("Database Succesfully connected");
        
        
    } catch (error) {
        console.log(error);
        
    }
}
export default connection;