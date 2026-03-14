const express = require('express')
const router = express.Router()
const pool = require('./db')
const { generateItinerary, generatePackingList } = require('./ai')
const { geocodeItinerary } = require('./geocode')

// POST /api/trips
router.post('/', async (req, res) => {
  const { destination, days, style, mood } = req.body

  if (!destination || !days) {
    return res.status(400).json({ error: 'destination and days are required' })
  }
  if (days < 1 || days > 14) {
    return res.status(400).json({ error: 'days must be between 1 and 14' })
  }

  try {
    console.log(`generating trip for ${destination}, ${days} days, style: ${style}, mood: ${mood}`)

    const itinerary = await generateItinerary(destination, parseInt(days), style, mood)

    console.log(`geocoding ${itinerary.length} places...`)
    const geocodedItinerary = await geocodeItinerary(itinerary, destination)

    const tripResult = await pool.query(
  'INSERT INTO trips (destination, days, style, mood, browser_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
  [destination, parseInt(days), style || null, mood || null, req.body.browserId || null]
)

    const tripId = tripResult.rows[0].id

    for (const item of geocodedItinerary) {
      await pool.query(
        `INSERT INTO locations (trip_id, day, place_name, description, time_of_day, category, lat, lng, duration, tip, type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [tripId, item.day, item.placeName, item.description,
         item.timeOfDay, item.category || 'Culture',
         item.lat, item.lng, item.duration || null,
         item.tip || null, item.type || null]
      )
    }

    console.log(`trip created: ${tripId}`)
    res.json({ tripId })

  } catch (err) {
    console.error('error creating trip:', err.message)

    if (err.message && (err.message.includes('429') || err.message.includes('rate limit'))) {
      return res.status(429).json({
        error: 'Our AI is busy right now. Please wait 30 seconds and try again!',
        retryAfter: 30
      })
    }
    res.status(500).json({ error: 'Something went wrong. Please try again!' })
  }
})

// GET /api/trips - get recent trips (filtered by session if available)
router.get('/', async (req, res) => {
  try {
    // use a simple browser id passed as query param
    const browserId = req.query.bid
    
    let result
    if (browserId) {
      result = await pool.query(
        'SELECT id, destination, days, style, mood, created_at FROM trips WHERE browser_id = $1 ORDER BY created_at DESC LIMIT 20',
        [browserId]
      )
    } else {
      result = await pool.query(
        'SELECT id, destination, days, style, mood, created_at FROM trips ORDER BY created_at DESC LIMIT 20'
      )
    }
    res.json({ trips: result.rows })
  } catch (err) {
    console.error('error fetching trips:', err.message)
    res.status(500).json({ error: 'could not fetch trips' })
  }
})
// GET /api/trips/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const tripResult = await pool.query('SELECT * FROM trips WHERE id = $1', [id])
    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: 'trip not found' })
    }

    const locationsResult = await pool.query(
      `SELECT * FROM locations WHERE trip_id = $1
       ORDER BY day, CASE time_of_day WHEN 'Morning' THEN 1 WHEN 'Afternoon' THEN 2 WHEN 'Evening' THEN 3 END`,
      [id]
    )

    res.json({ trip: tripResult.rows[0], locations: locationsResult.rows })
  } catch (err) {
    console.error('error fetching trip:', err.message)
    res.status(500).json({ error: 'could not fetch trip' })
  }
})

// POST /api/trips/:id/packing — generate packing list
router.post('/:id/packing', async (req, res) => {
  const { id } = req.params
  const { weather } = req.body

  try {
    const tripResult = await pool.query('SELECT * FROM trips WHERE id = $1', [id])
    if (tripResult.rows.length === 0) return res.status(404).json({ error: 'trip not found' })

    const trip = tripResult.rows[0]
    const packingList = await generatePackingList(trip.destination, trip.days, weather)
    res.json({ packingList })
  } catch (err) {
    console.error('packing list error:', err.message)
    res.status(500).json({ error: 'could not generate packing list' })
  }
})

module.exports = router