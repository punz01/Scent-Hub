const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use(express.json());

let perfumes = [];

let reviewIdCounter = 1;

// GET all perfumes
app.get('/api/perfumes', (req, res) => {
  res.json(perfumes);
});

// GET a perfume by ID
app.get('/api/perfumes/:id', (req, res) => {
  const { id } = req.params;
  const perfume = perfumes.find(p => p.id === parseInt(id));
  if (perfume) {
    res.json(perfume);
  } else {
    res.status(404).json({ message: 'Perfume not found' });
  }
});

// POST: Add new perfume
app.post('/api/perfumes', (req, res) => {
  const { name, brand, scent } = req.body;

  if (!name || !brand || !scent) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const newPerfume = {
    id: perfumes.length + 1,
    name,
    brand,
    scent,
    reviews: [],
  };

  perfumes.push(newPerfume);
  res.status(201).json(newPerfume);
});

// POST: Add review
app.post('/api/perfumes/:id/review', (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const perfume = perfumes.find(p => p.id === parseInt(id));
  if (!perfume) return res.status(404).send('Perfume not found');

  const newReview = {
    id: reviewIdCounter++,
    rating,
    comment,
    likes: 0,
    dislikes: 0,
  };

  perfume.reviews.push(newReview);
  res.status(201).json(perfume);
});

// PUT: Edit review
app.put('/api/perfumes/:perfumeId/review/:reviewId', (req, res) => {
  const { perfumeId, reviewId } = req.params;
  const { rating, comment } = req.body;

  const perfume = perfumes.find(p => p.id === parseInt(perfumeId));
  if (!perfume) return res.status(404).send('Perfume not found');

  const review = perfume.reviews.find(r => r.id === parseInt(reviewId));
  if (!review) return res.status(404).send('Review not found');

  review.rating = rating;
  review.comment = comment;

  res.json(perfume);
});

// DELETE: Remove review
app.delete('/api/perfumes/:perfumeId/review/:reviewId', (req, res) => {
  const { perfumeId, reviewId } = req.params;

  const perfume = perfumes.find(p => p.id === parseInt(perfumeId));
  if (!perfume) return res.status(404).send('Perfume not found');

  const reviewIndex = perfume.reviews.findIndex(r => r.id === parseInt(reviewId));
  if (reviewIndex === -1) return res.status(404).send('Review not found');

  perfume.reviews.splice(reviewIndex, 1);
  res.json(perfume);
});

// POST: Like or Dislike a review
app.post('/api/perfumes/:perfumeId/review/:reviewId/react', (req, res) => {
  const { perfumeId, reviewId } = req.params;
  const { action } = req.body; // expected: 'like' or 'dislike'

  const perfume = perfumes.find(p => p.id === parseInt(perfumeId));
  if (!perfume) return res.status(404).send('Perfume not found');

  const review = perfume.reviews.find(r => r.id === parseInt(reviewId));
  if (!review) return res.status(404).send('Review not found');

  if (action === 'like') {
    review.likes = (review.likes || 0) + 1;
  } else if (action === 'dislike') {
    review.dislikes = (review.dislikes || 0) + 1;
  } else {
    return res.status(400).json({ message: 'Invalid action' });
  }

  res.json({ message: `Review ${action}d`, review });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
