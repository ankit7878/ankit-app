const SuggestMeMoreDetails = require('../models/SuggestMeMoreDetails');

exports.getDetails = async (req, res) => {
  try {
    const visitors = await SuggestMeMoreDetails.findById("69eb51bcb246de335234c931");
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};