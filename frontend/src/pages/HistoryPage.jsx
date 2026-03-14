// shows all past trips
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './HistoryPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const DEST_EMOJIS = {
  paris: '🗼', tokyo: '🗾', rome: '🏛️', london: '🎡',
  dubai: '🏙️', bali: '🌴', delhi: '🕌', mumbai: '🌊',
  bangkok: '⛩️', barcelona: '🏖️', default: '🌍'
}

const getEmoji = (dest) => {
  const key = Object.keys(DEST_EMOJIS).find(k => dest.toLowerCase().includes(k))
  return key ? DEST_EMOJIS[key] : DEST_EMOJIS.default
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function HistoryPage() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { dark, setDark } = useTheme()

  useEffect(() => {
    fetch(`${API_URL}/api/trips`)
      .then(r => r.json())
      .then(data => {
        setTrips(data.trips || [])
        setLoading(false)
      })
      .catch(err => {
        setError('Could not load trip history')
        setLoading(false)
      })
  }, [])

  return (
    <div className="history-page page-enter">
      <nav className="history__nav">
        <Link to="/" className="history__logo">
          <img src="/compass.svg" alt="compass" width="28" height="28" />
          WanderPlan
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/" className="history__new-btn">+ New Trip</Link>
          <button
            className="landing__theme-toggle"
            onClick={() => setDark(!dark)}
            style={{ background: 'var(--sand-dark)', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: '1.1rem', cursor: 'pointer' }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <main className="history__main">
        <div className="history__header">
          <h1>Past Trips</h1>
          <p>All itineraries ever generated on WanderPlan</p>
        </div>

        {loading && (
          <div className="history__grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="history__card history__card--skeleton">
                <div className="skeleton skeleton--text" style={{ width: 60, height: 60, borderRadius: '50%' }} />
                <div className="skeleton skeleton--text" style={{ width: '70%', marginTop: 12 }} />
                <div className="skeleton skeleton--text" style={{ width: '40%', marginTop: 8 }} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="history__error">
            <p>😕 {error}</p>
            <Link to="/" className="history__new-btn">Plan a new trip instead</Link>
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="history__empty">
            <div style={{ fontSize: '4rem' }}>🗺️</div>
            <h2>No trips yet!</h2>
            <p>Generate your first itinerary to see it here</p>
            <Link to="/" className="history__new-btn">Plan a Trip</Link>
          </div>
        )}

        {!loading && trips.length > 0 && (
          <div className="history__grid">
            {trips.map(trip => (
              <Link key={trip.id} to={`/trip/${trip.id}`} className="history__card">
                <div className="history__card-emoji">{getEmoji(trip.destination)}</div>
                <h3 className="history__card-dest">{trip.destination}</h3>
                <div className="history__card-meta">
                  <span>📅 {trip.days} day{trip.days > 1 ? 's' : ''}</span>
                  <span>🕐 {formatDate(trip.created_at)}</span>
                </div>
                <div className="history__card-arrow">View Trip →</div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="history__footer">
        <p>© {new Date().getFullYear()} WanderPlan · Made with ❤️ by Kartavya Sonar</p>
      </footer>
    </div>
  )
}