const express = require('express');
const getAddressController = require('../Controllers/GetAddressController');
const router = express.Router();

router.post("/getAddress",getAddressController);

module.exports = router;