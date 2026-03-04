require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const booksRoutes = require('./routes/booksRoutes');

const app = express();
app.use(express.json());

connectDB();

app.use('/api/users', userRoutes);
app.use('/api/books', booksRoutes);

app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
