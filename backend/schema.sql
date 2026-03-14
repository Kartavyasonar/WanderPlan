
CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  destination VARCHAR(255) NOT NULL,
  days INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  place_name VARCHAR(255) NOT NULL,
  description TEXT,
  time_of_day VARCHAR(50),
  category VARCHAR(100),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_trip_id ON locations(trip_id);