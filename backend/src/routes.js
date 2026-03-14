// routes for creating and fetching trips
const express = require('express');
const router = express.Router();
const pool = require('./db');
const { generateItinerary } = require('./ai');
const { geocodeItinerary } = require('./geocode');

// POST /api/trips - create a new trip
router.post('/', async (req, res) => {
  const { destination, days } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ error: 'destination and days are required' });
  }

  if (days < 1 || days > 14) {
    return res.status(400).json({ error: 'days must be between 1 and 14' });
  }

  try {
    console.log(`generating trip for ${destination}, ${days} days...`);

    const itinerary = await generateItinerary(destination, parseInt(days));

    console.log(`geocoding ${itinerary.length} places...`);
    const geocodedItinerary = await geocodeItinerary(itinerary, destination);

    const tripResult = await pool.query(
      'INSERT INTO trips (destination, days, created_at) VALUES ($1, $2, NOW()) RETURNING id',
      [destination, parseInt(days)]
    );

    const tripId = tripResult.rows[0].id;

    for (const item of geocodedItinerary) {
      await pool.query(
        `INSERT INTO locations (trip_id, day, place_name, description, time_of_day, category, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [tripId, item.day, item.placeName, item.description,
         item.timeOfDay, item.category || 'Culture', item.lat, item.lng]
      );
    }

    console.log(`trip created with id: ${tripId}`);
    res.json({ tripId });

  } catch (err) {
    console.error('error creating trip:', err.message);

    // check if it's a rate limit error
    if (err.message && (err.message.includes('429') || err.message.includes('rate limit') || err.message.includes('quota'))) {
      return res.status(429).json({
        error: 'Our AI is a bit busy right now. Please wait 30 seconds and try again!',
        retryAfter: 30
      });
    }

    res.status(500).json({
      error: 'Something went wrong generating the trip. Please try again!'
    });
  }
});

// GET /api/trips - get all trips (for history page)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, destination, days, created_at FROM trips ORDER BY created_at DESC LIMIT 20'
    );
    res.json({ trips: result.rows });
  } catch (err) {
    console.error('error fetching trips:', err.message);
    res.status(500).json({ error: 'could not fetch trips' });
  }
});

// GET /api/trips/:id - get a trip by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tripResult = await pool.query('SELECT * FROM trips WHERE id = $1', [id]);

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: 'trip not found' });
    }

    const trip = tripResult.rows[0];

    const locationsResult = await pool.query(
      `SELECT * FROM locations WHERE trip_id = $1
       ORDER BY day, CASE time_of_day WHEN 'Morning' THEN 1 WHEN 'Afternoon' THEN 2 WHEN 'Evening' THEN 3 END`,
      [id]
    );

    res.json({ trip, locations: locationsResult.rows });

  } catch (err) {
    console.error('error fetching trip:', err.message);
    res.status(500).json({ error: 'could not fetch trip' });
  }
});

module.exports = router;