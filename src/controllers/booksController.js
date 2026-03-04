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
  const { title, subtitle, author, publisher, publisher_date, edition, language, page_count, description, cover_image_url, images, isbn, genre, currently_reading, mark_as_read } = req.body;
  try {
    const book = new Books({ title, subtitle, author, publisher, publisher_date, edition, language, page_count, description, cover_image_url, images, isbn, genre, currently_reading, mark_as_read });
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

exports.markAsRead = async (req, res) => {
  const { bookId } = req.body;
  try {
    if (!bookId) return res.status(400).json({ message: 'bookId is required' });
    const book = await Books.findByIdAndUpdate(bookId, { mark_as_read: true }, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ success: true, message: 'Book marked as read', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsUnread = async (req, res) => {
  const { bookId } = req.body;
  try {
    if (!bookId) return res.status(400).json({ message: 'bookId is required' });
    const book = await Books.findByIdAndUpdate(bookId, { mark_as_read: false }, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ success: true, message: 'Book marked as unread', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};