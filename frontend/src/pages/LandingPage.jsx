import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './LandingPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const STYLES = [
  { id: 'balanced',    emoji: '🌍', label: 'Balanced',    desc: 'A bit of everything' },
  { id: 'adventurous', emoji: '🧗', label: 'Adventure',   desc: 'Offbeat & thrilling' },
  { id: 'foodie',      emoji: '🍜', label: 'Foodie',      desc: 'Eat your way through' },
  { id: 'romantic',    emoji: '💑', label: 'Romantic',    desc: 'Perfect for couples' },
  { id: 'budget',      emoji: '💸', label: 'Budget',      desc: 'Spend less, see more' },
  { id: 'cultural',    emoji: '🎭', label: 'Cultural',    desc: 'History & heritage' },
  { id: 'luxury',      emoji: '✨', label: 'Luxury',      desc: 'Only the finest' },
  { id: 'family',      emoji: '👨‍👩‍👧', label: 'Family',   desc: 'Fun for all ages' },
]

const MOODS = [
  { id: 'relaxed',     emoji: '😌', label: 'Relaxed' },
  { id: 'energetic',   emoji: '⚡', label: 'Energetic' },
  { id: 'curious',     emoji: '🔍', label: 'Curious' },
  { id: 'spontaneous', emoji: '🎲', label: 'Spontaneous' },
]

const POPULAR = ['Tokyo', 'Paris', 'Goa', 'Bali', 'New York', 'Rome', 'Rajasthan', 'Dubai', 'London', 'Kyoto']

const STEPS = [
  '🤖 Asking AI to plan your trip…',
  '📋 Building day-by-day itinerary…',
  '📍 Geocoding all locations…',
  '💾 Saving your itinerary…',
]

export default function LandingPage() {
  const [dest, setDest] = useState('')
  const [days, setDays] = useState(3)
  const [style, setStyle] = useState('balanced')
  const [mood, setMood] = useState('relaxed')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [showPersonalize, setShowPersonalize] = useState(false)
  const navigate = useNavigate()
  const { dark, setDark } = useTheme()

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!dest.trim()) { setError('Please enter a destination!'); return }
    setLoading(true); setError(''); setStep(0)
    let s = 0
    const si = setInterval(() => { s = Math.min(s+1, STEPS.length-1); setStep(s) }, 5000)
    try {
      const res = await fetch(`${API_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: dest.trim(), days, style, mood })
      })
      const data = await res.json()
      clearInterval(si)
      if (res.status === 429) { setError(data.error); setLoading(false); return }
      if (!res.ok) throw new Error(data.error || 'something went wrong')
      navigate(`/trip/${data.tripId}`)
    } catch (err) {
      clearInterval(si); setError(err.message); setLoading(false)
    }
  }

  return (
    <div className="land page-enter">
      {/* mesh background */}
      <div className="land__mesh" />

      {/* nav */}
      <nav className="land__nav">
        <div className="land__brand">
          <img src="/compass.svg" alt="" width="30" height="30" />
          <span>WanderPlan</span>
        </div>
        <div className="land__nav-right">
          <Link to="/history" className="land__nav-link">Past Trips</Link>
          <button className="land__dark-btn" onClick={() => setDark(!dark)}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* hero */}
      <section className="land__hero">
        <div className="land__hero-text">
          <div className="land__eyebrow">✨ AI-powered travel planner</div>
          <h1 className="land__title">
            Your perfect trip,<br />
            <em>crafted in seconds</em>
          </h1>
          <p className="land__sub">
            Type a destination. Get a complete day-by-day itinerary with maps,
            insider tips, packing lists, and cost estimates — all for free.
          </p>
          <div className="land__features">
            {['🗺️ Interactive map', '💡 Insider tips', '🧳 Packing list', '💰 Cost estimate', '📅 Calendar export', '🔊 Voice narration'].map(f => (
              <span key={f} className="land__feature-pill">{f}</span>
            ))}
          </div>
        </div>

        {/* form */}
        <div className="land__form-wrap">
          <form className="land__form" onSubmit={handleSubmit}>
            <div className="land__form-header">
              <h2>Plan my trip</h2>
              <span className="land__form-tag">free · AI-powered</span>
            </div>

            {/* destination */}
            <div className="land__field">
              <label>Destination</label>
              <div className="land__input-wrap">
                <span className="land__input-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Tokyo, Bali, Paris, Goa…"
                  value={dest}
                  onChange={e => setDest(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              {/* popular suggestions */}
              <div className="land__suggest">
                {POPULAR.map(p => (
                  <button key={p} type="button" className="land__suggest-btn" onClick={() => setDest(p)} disabled={loading}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* days */}
            <div className="land__field">
              <label>Duration</label>
              <div className="land__days">
                {[1,2,3,4,5,6,7].map(d => (
                  <button
                    key={d} type="button"
                    className={`land__day-btn ${days === d ? 'land__day-btn--active' : ''}`}
                    onClick={() => setDays(d)} disabled={loading}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* personalise toggle */}
            <button
              type="button"
              className="land__personalise-btn"
              onClick={() => setShowPersonalize(!showPersonalize)}
            >
              <span>🎯 Personalise my trip</span>
              <span>{showPersonalize ? '▲' : '▼'}</span>
            </button>

            {showPersonalize && (
              <div className="land__personalise">
                <div className="land__field">
                  <label>Travel style</label>
                  <div className="land__style-grid">
                    {STYLES.map(s => (
                      <button
                        key={s.id} type="button"
                        className={`land__style-card ${style === s.id ? 'land__style-card--active' : ''}`}
                        onClick={() => setStyle(s.id)} disabled={loading}
                      >
                        <span className="land__style-emoji">{s.emoji}</span>
                        <span className="land__style-name">{s.label}</span>
                        <span className="land__style-desc">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="land__field">
                  <label>Mood</label>
                  <div className="land__moods">
                    {MOODS.map(m => (
                      <button
                        key={m.id} type="button"
                        className={`land__mood-btn ${mood === m.id ? 'land__mood-btn--active' : ''}`}
                        onClick={() => setMood(m.id)} disabled={loading}
                      >
                        {m.emoji} {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* loading steps */}
            {loading && (
              <div className="land__progress">
                {STEPS.map((s, i) => (
                  <div key={i} className={`land__progress-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                    <span>{i < step ? '✓' : i === step ? '⟳' : '·'}</span>
                    {s}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="land__error">
                ⚠️ {error}
                <button type="button" onClick={handleSubmit}>Retry</button>
              </div>
            )}

            <button type="submit" className="land__submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="land__spin" />
                  Generating…
                </>
              ) : '🗺️ Generate My Itinerary'}
            </button>
          </form>
        </div>
      </section>

      {/* how it works */}
      <section className="land__how">
        <h2>How it works</h2>
        <div className="land__steps-row">
          {[
            { n: '1', title: 'Pick destination + style', body: 'Enter a city, choose your days, pick your travel personality' },
            { n: '2', title: 'AI builds the plan',       body: '8 curated stops per day — breakfast, attractions, lunch, hidden gems, dinner, nightlife' },
            { n: '3', title: 'Explore & share',          body: 'Interactive map, voice narration, packing list, calendar, WhatsApp preview' },
          ].map(s => (
            <div key={s.n} className="land__step-card">
              <div className="land__step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="land__footer">
        <img src="/compass.svg" alt="" width="20" height="20" style={{ opacity: 0.4 }} />
        <p>© {new Date().getFullYear()} WanderPlan · Made with ❤️ by Kartavya Sonar</p>
        <p className="land__footer-sub">React · Node.js · Llama AI · OpenStreetMap · 100% free</p>
      </footer>
    </div>
  )
}
