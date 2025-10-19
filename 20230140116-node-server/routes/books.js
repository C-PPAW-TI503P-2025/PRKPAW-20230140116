const express = require('express');
const router = express.Router();

let books = [
  { id: 1, title: 'Laskar Pelangi', authorAlsin: 'Andrea Hirata' },
  { id: 2, title: 'Bumi Manusia', authorAlsin: 'Pramoedya Ananta Toer' }
];

// READ ALL (GET)
router.get('/', (req, res) => {
  res.json(books);
});

// READ ONE (GET by ID)
router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).send('Book not found');
  res.json(book);
});

// CREATE (POST)
router.post('/', (req, res) => {
  const { title, authorAlsin } = req.body;
  if (!title || !authorAlsin) {
    return res.status(400).json({ message: 'Title dan authorAlsin wajib diisi' });
  }

  const book = {
    id: books.length + 1,
    title,
    authorAlsin
  };

  books.push(book);
  res.status(201).json(book);
});

// UPDATE (PUT)
router.put('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const { title, authorAlsin } = req.body;
  if (!title || !authorAlsin) {
    return res.status(400).json({ message: 'Title dan authorAlsin wajib diisi' });
  }

  book.title = title;
  book.authorAlsin = authorAlsin;

  res.json({ message: 'Book updated successfully', book });
});

// DELETE
router.delete('/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
  if (bookIndex === -1) return res.status(404).json({ message: 'Book not found' });

  const deletedBook = books.splice(bookIndex, 1);
  res.json({ message: 'Book deleted successfully', deletedBook });
});

module.exports = router;
