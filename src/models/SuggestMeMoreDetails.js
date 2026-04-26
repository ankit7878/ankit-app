const mongoose = require('mongoose');

const SuggestMeMoreDetails = new mongoose.Schema(
  {
    filters: { type: Object, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('suggestMeMoreDetails', SuggestMeMoreDetails);