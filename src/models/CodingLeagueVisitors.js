const mongoose = require('mongoose');

const CodingLeagueVisitors = new mongoose.Schema(
  {
    filters: { type: Object, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('codingLeague', CodingLeagueVisitors);
