const express = require('express');
const router = express.Router();
const controller = require('../controllers/ankitProController');

router.get('/getDetails', controller.getDetails);

module.exports = router;