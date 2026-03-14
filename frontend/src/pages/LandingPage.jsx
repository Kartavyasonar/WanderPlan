import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './LandingPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const TRAVEL_STYLES = [
  { id: 'balanced', label: '🌍 Balanced', desc: 'A bit of everything' },
  { id: 'adventurous', label: '🧗 Adventure', desc: 'Offbeat & thrilling' },
  { id: 'foodie', label: '🍜 Foodie', desc: 'Eat your way through' },
  { id: 'romantic', label: '💑 Romantic', desc: 'Perfect for couples' },
  { id: 'budget', label: '💸 Budget', desc: 'Spend less, see more' },
  { id: 'cultural', label: '🎭 Cultural', desc: 'History & heritage' },
  { id: 'luxury', label: '✨ Luxury', desc: 'Only the finest' },
  { id: 'family', label: '👨‍👩‍👧 Family', desc: 'Fun for all ages' },
]

const MOODS = [
  { id: 'relaxed', label: '😌 Relaxed' },
  { id: 'energetic', label: '⚡ Energetic' },
  { id: 'curious', label: '🔍 Curious' },
  { id: 'spontaneous', label: '🎲 Spontaneous' },
]

const SAMPLE_CARDS = [
  { emoji: '🗼', name: 'Eiffel Tower', city: 'Paris' },
  { emoji: '🏛️', name: 'Colosseum', city: 'Rome' },
  { emoji: '⛩️', name: 'Fushimi Inari', city: 'Kyoto' },
  { emoji: '🕌', name: 'Taj Mahal', city: 'Agra' },
]

const LOADING_STEPS = [
  '🤖 Asking AI to plan your trip...',
  '🗺️ Building your day-by-day itinerary...',
  '📍 Finding all the locations...',
  '💾 Saving your itinerary...',
]

export default function LandingPage() {
  const [destination, setDestination] = useState('')
  const [days, setDays] = useState(3)
  const [style, setStyle] = useState('balanced')
  const [mood, setMood] = useState('relaxed')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)
  const [retryAfter, setRetryAfter] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const navigate = useNavigate()
  const { dark, setDark } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!destination.trim()) { setError('Please enter a destination!'); return }

    setLoading(true)
    setError('')
    setRetryAfter(null)
    setLoadingStep(0)

    let step = 0
    const stepInterval = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1)
      setLoadingStep(step)
    }, 5000)

    try {
      const res = await fetch(`${API_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destination.trim(), days, style, mood })
      })

      const data = await res.json()
      clearInterval(stepInterval)

      if (res.status === 429) {
        setRetryAfter(data.retryAfter || 30)
        setError(data.error)
        setLoading(false)
        return
      }

      if (!res.ok) throw new Error(data.error || 'something went wrong')
      navigate(`/trip/${data.tripId}`)

    } catch (err) {
      clearInterval(stepInterval)
      setError(err.message)
      setLoading(false)
    }
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
          <button className="landing__theme-toggle" onClick={() => setDark(!dark)} title="Toggle dark mode">
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
              Tell us where you want to go. Our AI builds a complete
              day-by-day itinerary with maps, packing lists, cost estimates,
              and insider tips — completely free.
            </p>
            <div className="landing__features">
              <span>🗺️ Interactive map</span>
              <span>💡 Insider tips</span>
              <span>🧳 Packing list</span>
              <span>💰 Cost estimate</span>
              <span>📅 Calendar export</span>
              <span>🔊 Voice narration</span>
            </div>
          </div>

          <div className="landing__form-wrapper">
            <form className="landing__form" onSubmit={handleSubmit}>
              <h2 className="landing__form-title">Plan my trip</h2>

              <div className="landing__field">
                <label htmlFor="destination">Where do you want to go?</label>
                <input
                  id="destination"
                  type="text"
                  placeholder="e.g. Tokyo, Paris, Goa, Rajasthan..."
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <div className="landing__field">
                <label>How many days?</label>
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

              {/* travel style quiz toggle */}
              <button
                type="button"
                className="landing__quiz-toggle"
                onClick={() => setShowQuiz(!showQuiz)}
              >
                🎯 Personalise my trip {showQuiz ? '▲' : '▼'}
              </button>

              {showQuiz && (
                <div className="landing__quiz">
                  <div className="landing__field">
                    <label>Travel style</label>
                    <div className="landing__style-grid">
                      {TRAVEL_STYLES.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          className={`landing__style-btn ${style === s.id ? 'active' : ''}`}
                          onClick={() => setStyle(s.id)}
                          disabled={loading}
                        >
                          <span className="landing__style-label">{s.label}</span>
                          <span className="landing__style-desc">{s.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="landing__field">
                    <label>Your mood</label>
                    <div className="landing__mood-picker">
                      {MOODS.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          className={`landing__mood-btn ${mood === m.id ? 'active' : ''}`}
                          onClick={() => setMood(m.id)}
                          disabled={loading}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="landing__loading-steps">
                  {LOADING_STEPS.map((step, i) => (
                    <div key={i} className={`landing__step-item ${i === loadingStep ? 'active' : ''} ${i < loadingStep ? 'done' : ''}`}>
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
                  <button type="button" className="landing__retry-btn" onClick={handleSubmit}>
                    {retryAfter ? `Retry in ${retryAfter}s` : 'Try Again'}
                  </button>
                </div>
              )}

              <button type="submit" className="landing__submit" disabled={loading}>
                {loading ? (
                  <span className="landing__loading-text">
                    <span className="landing__spinner" />
                    Generating... (~{days * 8} places to find)
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
              <h3>Pick destination + style</h3>
              <p>Choose where to go, how many days, and your travel personality</p>
            </div>
            <div className="landing__step-arrow">→</div>
            <div className="landing__step">
              <div className="landing__step-num">2</div>
              <h3>AI builds the plan</h3>
              <p>8 places per day — breakfast, attractions, lunch, hidden gems, dinner, nightlife</p>
            </div>
            <div className="landing__step-arrow">→</div>
            <div className="landing__step">
              <div className="landing__step-num">3</div>
              <h3>Explore, export, share</h3>
              <p>Interactive map, voice narration, packing list, calendar export, WhatsApp share</p>
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