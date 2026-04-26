const SuggestMeMoreDetails = require('../models/SuggestMeMoreDetails');

exports.getDetails = async (req, res) => {
  try {
    const visitors = await SuggestMeMoreDetails.findById("69ee26fbb439728ac6a592be");
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};