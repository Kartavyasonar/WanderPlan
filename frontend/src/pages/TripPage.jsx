import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ItineraryPanel from '../components/ItineraryPanel'
import MapPanel from '../components/MapPanel'
import WeatherWidget from '../components/WeatherWidget'
import CostEstimate from '../components/CostEstimate'
import SkeletonLoader from '../components/SkeletonLoader'
import PackingModal from '../components/PackingModal'
import { useTheme } from '../context/ThemeContext'
import { generateICS, downloadICS } from '../utils/calendarExport'
import { speakTrip, stopSpeaking } from '../utils/voiceNarration'
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
  const [showPacking, setShowPacking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [checkedPlaces, setCheckedPlaces] = useState({})
  const { dark, setDark } = useTheme()

  useEffect(() => {
    fetchTrip()
    // load checked places from localStorage
    const saved = localStorage.getItem(`wanderplan-checked-${id}`)
    if (saved) setCheckedPlaces(JSON.parse(saved))
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

  const handleExportPDF = () => window.print()

  const handleCalendarExport = () => {
    if (!trip || !locations.length) return
    const icsContent = generateICS(trip, locations)
    downloadICS(icsContent, `${trip.destination}-wanderplan.ics`)
  }

  const handleVoice = () => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
      return
    }
    const visible = activeDay === 'all'
      ? locations
      : locations.filter(l => l.day === activeDay)
    speakTrip(visible, trip?.destination, () => setIsSpeaking(false))
    setIsSpeaking(true)
  }

  const toggleChecked = (locationId) => {
    const updated = { ...checkedPlaces, [locationId]: !checkedPlaces[locationId] }
    setCheckedPlaces(updated)
    localStorage.setItem(`wanderplan-checked-${id}`, JSON.stringify(updated))
  }

  // progress for current view
  const visibleLocations = activeDay === 'all'
    ? locations
    : locations.filter(l => l.day === activeDay)
  const checkedCount = visibleLocations.filter(l => checkedPlaces[l.id]).length
  const progress = visibleLocations.length ? Math.round((checkedCount / visibleLocations.length) * 100) : 0

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

  // AI cover art from Pollinations - free, no API key needed!
  const coverArtUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`${trip.destination} travel landscape beautiful scenic photography`)}?width=1200&height=400&nologo=true&seed=${trip.id}`

  return (
    <div className="trip-page page-enter">
      {/* AI cover art banner */}
      <div className="trip-cover" style={{ backgroundImage: `url(${coverArtUrl})` }}>
        <div className="trip-cover__overlay">
          <Link to="/" className="trip-cover__logo">
            <img src="/compass.svg" alt="compass" width="24" height="24" />
            WanderPlan
          </Link>
          <div className="trip-cover__info">
            <h1 className="trip-cover__title">{trip.destination}</h1>
            <div className="trip-cover__meta">
              <span>{trip.days} day{trip.days > 1 ? 's' : ''}</span>
              {trip.style && <span>· {trip.style}</span>}
              {trip.mood && <span>· {trip.mood} mood</span>}
            </div>
          </div>
        </div>
      </div>

      {/* sticky action bar */}
      <header className="trip-header">
        <div className="trip-header__info">
          <h1 className="trip-header__title">{trip.destination}</h1>
          <span className="trip-header__badge">{trip.days} day{trip.days > 1 ? 's' : ''}</span>
          {progress > 0 && (
            <div className="trip-header__progress">
              <div className="trip-header__progress-bar" style={{ width: `${progress}%` }} />
              <span className="trip-header__progress-label">{progress}% visited</span>
            </div>
          )}
        </div>

        <div className="trip-header__actions">
          <button
            className={`trip-header__btn trip-header__btn--ghost ${isSpeaking ? 'speaking' : ''}`}
            onClick={handleVoice}
            title={isSpeaking ? 'Stop narration' : 'Voice narration'}
          >
            {isSpeaking ? '⏹️' : '🔊'} <span className="btn-label">{isSpeaking ? 'Stop' : 'Listen'}</span>
          </button>
          <button className="trip-header__btn trip-header__btn--ghost" onClick={() => setShowPacking(true)} title="Packing list">
            🧳 <span className="btn-label">Packing</span>
          </button>
          <button className="trip-header__btn trip-header__btn--ghost" onClick={handleCalendarExport} title="Export to calendar">
            📅 <span className="btn-label">Calendar</span>
          </button>
          <button className="trip-header__btn trip-header__btn--ghost" onClick={handleExportPDF} title="Export as PDF">
            📄 <span className="btn-label">PDF</span>
          </button>
          <button className="trip-header__btn trip-header__btn--ghost" onClick={() => setDark(!dark)}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button className="trip-header__btn trip-header__btn--primary" onClick={handleShare}>
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
        </div>
      </header>

      {/* widgets */}
      <div className="trip-widgets">
        <WeatherWidget destination={trip.destination} />
        <CostEstimate destination={trip.destination} days={trip.days} />
        {trip.style && (
          <div className="trip-style-badge">
            🎯 {trip.style} trip
          </div>
        )}
      </div>

      {/* day tabs */}
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
          checkedPlaces={checkedPlaces}
          onToggleChecked={toggleChecked}
        />
        <MapPanel
          locations={locations}
          activeDay={activeDay}
          className={!showMap ? 'hidden-mobile' : ''}
          selectedPlace={selectedPlace}
        />
      </div>

      {/* packing list modal */}
      {showPacking && (
        <PackingModal
          tripId={id}
          destination={trip.destination}
          onClose={() => setShowPacking(false)}
        />
      )}

      <div className="trip-print-footer">
        <p>Generated by WanderPlan · wanderplan.vercel.app</p>
        <p>© {new Date().getFullYear()} Made by Kartavya Sonar</p>
      </div>
    </div>
  )
}