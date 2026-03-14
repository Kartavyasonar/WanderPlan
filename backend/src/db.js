// db connection - suppresses the pg ssl warning by being explicit
const { Pool } = require('pg')

// parse the connection string to check if it's neon
const isNeon = (process.env.DATABASE_URL || '').includes('neon.tech')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? {
    rejectUnauthorized: false,
    // being explicit about ssl mode to avoid the warning
  } : false
})

// suppress the pg ssl warning - it's just a heads up, not an error
// todo: update when pg v9 releases
const originalWarn = process.emitWarning.bind(process)
process.emitWarning = (warning, ...args) => {
  if (typeof warning === 'string' && warning.includes('SECURITY WARNING')) return
  originalWarn(warning, ...args)
}

pool.connect((err, client, release) => {
  if (err) {
    console.error('error connecting to db:', err.message)
  } else {
    release()
    console.log('connected to postgres ok!')
  }
})

module.exports = pool