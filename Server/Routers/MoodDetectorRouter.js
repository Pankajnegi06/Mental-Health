const express=require("express");
const router1=express.Router();
const {getYourMood}=require('../Controllers/HandleMoodDetectorController');
// console.log("step 2");
router1.post("/getMyCurrentMood",getYourMood);
// console.log("step 3");
module.exports=router1;