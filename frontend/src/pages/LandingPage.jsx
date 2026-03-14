import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './LandingPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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
  const [loadingStep, setLoadingStep] = useState(0)
  const [retryAfter, setRetryAfter] = useState(null)
  const navigate = useNavigate()
  const { dark, setDark } = useTheme()

  // animated loading steps shown to user
  const LOADING_STEPS = [
    '🤖 Asking AI to plan your trip...',
    '📍 Finding all the locations...',
    '🗺️ Pinning spots on the map...',
    '💾 Saving your itinerary...',
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!destination.trim()) {
      setError('Please enter a destination!')
      return
    }

    setLoading(true)
    setError('')
    setRetryAfter(null)

    // cycle through loading steps for visual feedback
    let step = 0
    setLoadingStep(0)
    const stepInterval = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1)
      setLoadingStep(step)
    }, 4000)

    try {
      const res = await fetch(`${API_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destination.trim(), days })
      })

      const data = await res.json()
      clearInterval(stepInterval)

      if (res.status === 429) {
        setRetryAfter(data.retryAfter || 30)
        setError(data.error)
        setLoading(false)
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'something went wrong')
      }

      navigate(`/trip/${data.tripId}`)

    } catch (err) {
      clearInterval(stepInterval)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setError('')
    setRetryAfter(null)
    handleSubmit({ preventDefault: () => {} })
  }

  return (
    <div className="landing page-enter">
      <div className="landing__bg-blob landing__bg-blob--1" />
      <div className="landing__bg-blob landing__bg-blob--2" />

      <nav className="landing__nav">
        <div className="landing__logo">
          <img src="/compass.svg" alt="compass" width="32" height="32" />
          <span>WanderPlan</span>
        </div>
        <div className="landing__nav-links">
          <Link to="/history" className="landing__nav-link">Past Trips</Link>
          <button
            className="landing__theme-toggle"
            onClick={() => setDark(!dark)}
            title="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
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

              {/* loading steps animation */}
              {loading && (
                <div className="landing__loading-steps">
                  {LOADING_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className={`landing__step-item ${i === loadingStep ? 'active' : ''} ${i < loadingStep ? 'done' : ''}`}
                    >
                      <span className="landing__step-icon">
                        {i < loadingStep ? '✓' : i === loadingStep ? '⟳' : '○'}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="landing__error">
                  <span>⚠️ {error}</span>
                  {retryAfter && (
                    <button
                      type="button"
                      className="landing__retry-btn"
                      onClick={handleRetry}
                    >
                      Retry in {retryAfter}s
                    </button>
                  )}
                  {!retryAfter && (
                    <button
                      type="button"
                      className="landing__retry-btn"
                      onClick={handleRetry}
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="landing__submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="landing__loading-text">
                    <span className="landing__spinner" />
                    Generating... (this takes ~{days * 4}s)
                  </span>
                ) : (
                  '🗺️ Generate My Itinerary'
                )}
              </button>
            </form>
          </div>
        </div>

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
              <p>Llama AI creates a logical day-by-day itinerary with real places</p>
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
        <p>© {new Date().getFullYear()} WanderPlan · Made with ❤️ by Kartavya Sonar</p>
        <p style={{ fontSize: '0.78rem', marginTop: '4px', opacity: 0.7 }}>
          Built with React, Node.js, Llama AI & OpenStreetMap · 100% free to use
        </p>
      </footer>
    </div>
  )
}