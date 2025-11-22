const express = require('express');
const addFeedback = require('../Controllers/ContactController');

const Router12 = express.Router();

Router12.post("/addFeedback",addFeedback);

module.exports = Router12;