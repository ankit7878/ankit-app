const mongoose = require('mongoose');

const CodingLeagueDetails = new mongoose.Schema(
  {
    filters: { type: Object, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('codingLeague', CodingLeagueDetails);
