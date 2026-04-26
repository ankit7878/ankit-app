const SuggestMeMoreDetails = require('../models/SuggestMeMoreDetails');

exports.getDetails = async (req, res) => {
  try {
    const visitors = await SuggestMeMoreDetails.findById("69ee2ff44ae345c7db51ab65");
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};