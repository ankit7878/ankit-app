const mongoose = require('mongoose');

const AnkitProDetails = new mongoose.Schema(
  {
    filters: { type: Object, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ankitPro', AnkitProDetails);
