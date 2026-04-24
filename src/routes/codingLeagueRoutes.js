const express = require('express');
const router = express.Router();
const controller = require('../controllers/codingLeagueController');

router.get('/getVisitors', controller.getVisitors);

module.exports = router;