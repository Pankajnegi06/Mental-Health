const express = require('express');
const userAuth = require('../Middleware/userAuth');
const getUserData = require('../Controllers/UserController');
const router3 = express.Router();

router3.get("/getUserData", userAuth,getUserData);

module.exports = router3;