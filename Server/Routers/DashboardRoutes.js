const express = require('express');
const { getProfileData, editProfileDashboard } = require('../Controllers/DashboardController');
const userAuth = require('../Middleware/userAuth');
const Router9 = express.Router();

Router9.get("/getProfileData",userAuth,getProfileData);
Router9.post("/editProfileDashboard",userAuth,editProfileDashboard);

module.exports = Router9;