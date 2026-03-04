const express = require('express');
const router = express.Router();
const controller = require('../controllers/booksController');

router.get('/', controller.getBooksList);
router.post('/', controller.addBook);
router.get('/:id', controller.getBookById);
router.put('/:id', controller.updateBook);
router.delete('/:id', controller.deleteBook);

module.exports = router;
