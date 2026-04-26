const express = require('express');
const router = express.Router();
const controller = require('../controllers/SuggestMeMoreController');

router.get('/getDetails', controller.getDetails);

module.exports = router;