const CodingLeagueVisitors = require('../models/CodingLeagueVisitors');

exports.getVisitors = async (req, res) => {
  try {
    const visitors = await CodingLeagueVisitors.find().sort({ createdAt: -1 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};