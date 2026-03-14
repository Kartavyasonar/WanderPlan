import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ItineraryPanel from '../components/ItineraryPanel'
import MapPanel from '../components/MapPanel'
import WeatherWidget from '../components/WeatherWidget'
import CostEstimate from '../components/CostEstimate'
import SkeletonLoader from '../components/SkeletonLoader'
import { useTheme } from '../context/ThemeContext'
import './TripPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function TripPage() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeDay, setActiveDay] = useState('all')
  const [copied, setCopied] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const { dark, setDark } = useTheme()

  useEffect(() => {
    fetchTrip()
  }, [id])

  const fetchTrip = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/trips/${id}`)
      const data = await res.json()
      if (res.status === 404) { setError('not_found'); return }
      if (!res.ok) throw new Error(data.error || 'trip not found')
      setTrip(data.trip)
      setLocations(data.locations)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = () => { window.print() }

  if (loading) {
    return (
      <div className="trip-page">
        <div className="trip-header trip-header--skeleton">
          <div className="skeleton skeleton--text" style={{ width: 120 }} />
          <div className="skeleton skeleton--text" style={{ width: 200 }} />
          <div className="skeleton skeleton--btn" />
        </div>
        <SkeletonLoader />
      </div>
    )
  }

  if (error === 'not_found') {
    return (
      <div className="trip-error page-enter">
        <div className="trip-error__content">
          <div style={{ fontSize: '4rem' }}>🗺️</div>
          <h2>Trip Not Found</h2>
          <p>This trip doesn't exist or may have been deleted.</p>
          <div className="trip-error__actions">
            <Link to="/" className="trip-error__btn trip-error__btn--primary">Plan a New Trip</Link>
            <Link to="/history" className="trip-error__btn trip-error__btn--secondary">View Past Trips</Link>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="trip-error page-enter">
        <div className="trip-error__content">
          <div style={{ fontSize: '4rem' }}>😕</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <div className="trip-error__actions">
            <button className="trip-error__btn trip-error__btn--primary" onClick={fetchTrip}>Try Again</button>
            <Link to="/" className="trip-error__btn trip-error__btn--secondary">Go Home</Link>
          </div>
        </div>
      </div>
    )
  }

  const days = Array.from({ length: trip.days }, (_, i) => i + 1)

  return (
    <div className="trip-page page-enter">
      <header className="trip-header">
        <Link to="/" className="trip-header__logo">
          <img src="/compass.svg" alt="compass" width="28" height="28" />
          <span className="trip-header__logo-text">WanderPlan</span>
        </Link>
        <div className="trip-header__info">
          <h1 className="trip-header__title">{trip.destination}</h1>
          <span className="trip-header__badge">{trip.days} day{trip.days > 1 ? 's' : ''}</span>
        </div>
        <div className="trip-header__actions">
          <button className="trip-header__btn trip-header__btn--ghost" onClick={handleExportPDF} title="Export as PDF">
            📄 <span className="btn-label">Export</span>
          </button>
          <button className="trip-header__btn trip-header__btn--ghost" onClick={() => setDark(!dark)} title="Toggle dark mode">
            {dark ? '☀️' : '🌙'}
          </button>
          <button className="trip-header__btn trip-header__btn--primary" onClick={handleShare}>
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
        </div>
      </header>

      <div className="trip-widgets">
        <WeatherWidget destination={trip.destination} />
        <CostEstimate destination={trip.destination} days={trip.days} />
      </div>

      <div className="trip-days-bar">
        <button
          className={`trip-day-tab ${activeDay === 'all' ? 'active' : ''}`}
          onClick={() => setActiveDay('all')}
        >
          All Days
        </button>
        {days.map(d => (
          <button
            key={d}
            className={`trip-day-tab ${activeDay === d ? 'active' : ''}`}
            style={activeDay === d ? { '--day-color': `var(--day-${Math.min(d, 7)})` } : {}}
            onClick={() => setActiveDay(d)}
          >
            Day {d}
          </button>
        ))}
        <button className="trip-day-tab trip-map-toggle" onClick={() => setShowMap(!showMap)}>
          {showMap ? '📋 List' : '🗺️ Map'}
        </button>
      </div>

      <div className={`trip-split ${showMap ? 'trip-split--map-active' : ''}`}>
        <ItineraryPanel
          locations={locations}
          activeDay={activeDay}
          totalDays={trip.days}
          className={showMap ? 'hidden-mobile' : ''}
          onPlaceSelect={setSelectedPlace}
        />
        <MapPanel
          locations={locations}
          activeDay={activeDay}
          className={!showMap ? 'hidden-mobile' : ''}
          selectedPlace={selectedPlace}
        />
      </div>

      <div className="trip-print-footer">
        <p>Generated by WanderPlan · wanderplan.vercel.app</p>
        <p>© {new Date().getFullYear()} Made by Kartavya Sonar</p>
      </div>
    </div>
  )
}