const express=require("express");
const userAuth = require("../Middleware/userAuth");
const { addJournal, getJournals } = require("../Controllers/JournalController");
const RouterJournal=express.Router();


RouterJournal.post("/addJournal",userAuth,addJournal);
RouterJournal.get("/getJournals",userAuth,getJournals);

module.exports=RouterJournal;