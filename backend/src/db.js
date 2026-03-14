// db stuff - connects to postgres using the pg library
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false
});
pool.connect((err, client, release) => {
  if (err) {
    console.error('error connecting to db:', err.message);
  } else {
    release();
    console.log('connected to postgres ok!');
  }
});

module.exports = pool;