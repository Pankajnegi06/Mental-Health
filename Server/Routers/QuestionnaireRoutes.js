const express = require("express");
const router = express.Router();
const userAuth = require("../Middleware/userAuth");
const {
  saveQuestionnaire,
  getUserQuestionnaires,
  getLatestQuestionnaire,
} = require("../Controllers/QuestionnaireController");

router.post("/save", userAuth, saveQuestionnaire);
router.get("/history", userAuth, getUserQuestionnaires);
router.get("/latest", userAuth, getLatestQuestionnaire);

module.exports = router;

