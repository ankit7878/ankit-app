const AnkitProDetails = require('../models/AnkitProDetails');

exports.getDetails = async (req, res) => {
  try {
    const visitors = await AnkitProDetails.findById("69ee26c0b439728ac6a592bb");
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};