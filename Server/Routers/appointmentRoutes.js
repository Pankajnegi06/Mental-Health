const express = require("express");
const router8 = express.Router();
const { addAppointment, removeAppointment, getTable, changeTable, getAllApointments } = require("../Controllers/AppointmentController");
const userAuth = require("../Middleware/userAuth");


router8.post("/addAppointment",userAuth,addAppointment);
router8.post("/removeAppointment",userAuth,removeAppointment);
router8.get("/getTable",userAuth,getTable);
router8.post("/changeTable",userAuth,changeTable);
router8.get("/getAllApointments",userAuth,getAllApointments);

module.exports = router8;