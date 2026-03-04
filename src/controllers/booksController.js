const Books = require('../models/Books');

exports.getBooksList = async (req, res) => {
  try {
    const books = await Books.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addBook = async (req, res) => {
  const { title, subtitle, author, publisher, publisher_date, edition, language, page_count, description, cover_image_url, images, isbn, genre } = req.body;
  try {
    const book = new Books({ title, subtitle, author, publisher, publisher_date, edition, language, page_count, description, cover_image_url, images, isbn, genre });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getBookById = async (req, res) => {
  // const { isbn, genre } = req.body;
  try {
    // const book = new Books({ title, subtitle, author, publisher, publisher_date, edition, language, page_count, description, cover_image_url, images, isbn, genre });
    // await book.save();
    res.status(201).json({success: true});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  // const { isbn, genre } = req.body;
  try {
    // const book = new Books({ title, subtitle, author, publisher, publisher_date, edition, language, page_count, description, cover_image_url, images, isbn, genre });
    // await book.save();
    res.status(201).json({success: true});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  // const { isbn, genre } = req.body;
  try {
    // const book = new Books({ title, subtitle, author, publisher, publisher_date, edition, language, page_count, description, cover_image_url, images, isbn, genre });
    // await book.save();
    res.status(201).json({success: true});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};