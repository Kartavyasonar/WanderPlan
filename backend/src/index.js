// main server file
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tripRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    /\.vercel\.app$/
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use('/api/trips', tripRoutes);

// health check - useful for render.com
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'wanderplan backend is running!' });
});

app.listen(PORT, () => {
  console.log(`wanderplan server running on port ${PORT}`);
});