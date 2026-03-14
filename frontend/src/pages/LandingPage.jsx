import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// the little floating cards showing what places look like
const SAMPLE_CARDS = [
  { emoji: '🗼', name: 'Eiffel Tower', city: 'Paris' },
  { emoji: '🏛️', name: 'Colosseum', city: 'Rome' },
  { emoji: '⛩️', name: 'Fushimi Inari', city: 'Kyoto' },
  { emoji: '🌉', name: 'Golden Gate', city: 'San Francisco' },
]

export default function LandingPage() {
  const [destination, setDestination] = useState('')
  const [days, setDays] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!destination.trim()) {
      setError('please enter a destination!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destination.trim(), days })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'something went wrong')
      }

      // redirect to the trip page
      navigate(`/trip/${data.tripId}`)

    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="landing">
      {/* background decorations */}
      <div className="landing__bg-blob landing__bg-blob--1" />
      <div className="landing__bg-blob landing__bg-blob--2" />

      <nav className="landing__nav">
        <div className="landing__logo">
          <img src="/compass.svg" alt="compass" width="32" height="32" />
          <span>WanderPlan</span>
        </div>
      </nav>

      <main className="landing__main">
        <div className="landing__hero">
          <div className="landing__text">
            <p className="landing__eyebrow">✨ AI-powered travel planning</p>
            <h1 className="landing__title">
              Your next adventure,<br />
              <em>planned in seconds</em>
            </h1>
            <p className="landing__subtitle">
              Tell us where you want to go. Our AI builds a personalized 
              day-by-day itinerary with an interactive map — completely free.
            </p>
          </div>

          <div className="landing__form-wrapper">
            <form className="landing__form" onSubmit={handleSubmit}>
              <h2 className="landing__form-title">Plan my trip</h2>

              <div className="landing__field">
                <label htmlFor="destination">Where do you want to go?</label>
                <input
                  id="destination"
                  type="text"
                  placeholder="e.g. Tokyo, Paris, New York..."
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <div className="landing__field">
                <label htmlFor="days">How many days?</label>
                <div className="landing__days-picker">
                  {[1,2,3,4,5,6,7].map(d => (
                    <button
                      key={d}
                      type="button"
                      className={`landing__day-btn ${days === d ? 'active' : ''}`}
                      onClick={() => setDays(d)}
                      disabled={loading}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="landing__error">⚠️ {error}</p>}

              <button
                type="submit"
                className="landing__submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="landing__loading-text">
                    <span className="landing__spinner" />
                    Building your itinerary... ({days * 3}–{days * 4} places to geocode, ~{days * 4}s)
                  </span>
                ) : (
                  '🗺️ Generate My Itinerary'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* sample cards just for looks */}
        <div className="landing__cards">
          {SAMPLE_CARDS.map((card, i) => (
            <div key={i} className="landing__sample-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="landing__card-emoji">{card.emoji}</span>
              <div>
                <strong>{card.name}</strong>
                <span>{card.city}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="landing__how">
          <h2>How it works</h2>
          <div className="landing__steps">
            <div className="landing__step">
              <div className="landing__step-num">1</div>
              <h3>You pick a destination</h3>
              <p>Just type the city and choose how many days you have</p>
            </div>
            <div className="landing__step-arrow">→</div>
            <div className="landing__step">
              <div className="landing__step-num">2</div>
              <h3>AI builds the plan</h3>
              <p>Gemini AI creates a logical day-by-day itinerary with real places</p>
            </div>
            <div className="landing__step-arrow">→</div>
            <div className="landing__step">
              <div className="landing__step-num">3</div>
              <h3>Explore on the map</h3>
              <p>All spots pinned on an interactive map, color-coded by day</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="landing__footer">
        <p>Built with React, Node.js, Gemini AI & OpenStreetMap · 100% free to use</p>
      </footer>
    </div>
  )
}