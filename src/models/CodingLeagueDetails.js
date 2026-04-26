const mongoose = require('mongoose');

const CodingLeagueDetails = new mongoose.Schema(
  {
    filters: { type: Object, required: true },
    currentYearLoss: { type: Number, required: true },
    currentYearProfit: { type: Number, required: true },
    totalLoss: { type: Number, required: true },
    totalProfit: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('codingLeague', CodingLeagueDetails);
