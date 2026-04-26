const mongoose = require('mongoose');

const AnkitProDetails = new mongoose.Schema(
  {
    filters: { type: Object, required: true },
    currentYearLoss: { type: Number, required: true },
    currentYearProfit: { type: Number, required: true },
    totalLoss: { type: Number, required: true },
    totalProfit: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ankitPro', AnkitProDetails);
