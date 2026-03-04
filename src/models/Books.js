const mongoose = require('mongoose');

const BooksSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    subtitle: { type: String, required: false, unique: true },
    author: { type: String, required: true },
    publisher: { type: String, required: true },
    publisher_date: { type: Date, required: true },
    edition: { type: String },
    language: { type: String, required: true },
    page_count: { type: Number, required: true },
    description: { type: String, required: true },
    cover_image_url: { type: String, required: false },
    images: { type: Array, required: false },
    isbn: { type: String },
    genre: { type: Array, required: true}
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', BooksSchema);
