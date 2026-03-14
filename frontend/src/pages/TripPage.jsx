import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ItineraryPanel from '../components/ItineraryPanel'
import MapPanel from '../components/MapPanel'
import LoadingScreen from '../components/LoadingScreen'
import './TripPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function TripPage() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeDay, setActiveDay] = useState(1)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchTrip()
  }, [id])

  const fetchTrip = async () => {
    try {
      const res = await fetch(`${API_URL}/api/trips/${id}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'trip not found')
      }

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

  if (loading) return <LoadingScreen />

  if (error) {
    return (
      <div className="trip-error">
        <div className="trip-error__content">
          <span style={{ fontSize: '3rem' }}>😕</span>
          <h2>Oops!</h2>
          <p>{error}</p>
          <Link to="/" className="trip-error__btn">Go back home</Link>
        </div>
      </div>
    )
  }

  // figure out how many days there are
  const totalDays = trip.days
  const days = Array.from({ length: totalDays }, (_, i) => i + 1)

  return (
    <div className="trip-page">
      {/* top bar */}
      <header className="trip-header">
        <Link to="/" className="trip-header__logo">
          <img src="/compass.svg" alt="compass" width="28" height="28" />
          WanderPlan
        </Link>

        <div className="trip-header__info">
          <h1 className="trip-header__title">
            {trip.destination}
          </h1>
          <span className="trip-header__badge">{trip.days} day{trip.days > 1 ? 's' : ''}</span>
        </div>

        <button className="trip-header__share" onClick={handleShare}>
          {copied ? '✓ Copied!' : '🔗 Share'}
        </button>
      </header>

      {/* day filter tabs */}
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
      </div>

      {/* main split layout */}
      <div className="trip-split">
        <ItineraryPanel
          locations={locations}
          activeDay={activeDay}
          totalDays={totalDays}
        />
        <MapPanel
          locations={locations}
          activeDay={activeDay}
        />
      </div>
    </div>
  )
}