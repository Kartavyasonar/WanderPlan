import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { generateICS, downloadICS } from '../utils/calendarExport'
import { speakTrip, stopSpeaking } from '../utils/voiceNarration'
import WeatherWidget from '../components/WeatherWidget'
import CostEstimate from '../components/CostEstimate'
import PackingModal from '../components/PackingModal'
import PlaceDetailDrawer from '../components/PlaceDetailDrawer'
import MapModal from '../components/MapModal'
import DaySection from '../components/DaySection'
import './TripPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function TripPage() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeDay, setActiveDay] = useState('all')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [showPacking, setShowPacking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [checkedPlaces, setCheckedPlaces] = useState({})
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const { dark, setDark } = useTheme()
  const scrollRef = useRef(null)

  useEffect(() => {
    fetchTrip()
    const saved = localStorage.getItem(`wp-checked-${id}`)
    if (saved) setCheckedPlaces(JSON.parse(saved))
  }, [id])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setHeaderScrolled(el.scrollTop > 40)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

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
    setTimeout(() => setCopied(false), 2500)
  }

  const handleCalendar = () => {
    if (!trip || !locations.length) return
    downloadICS(generateICS(trip, locations), `${trip.destination}-wanderplan.ics`)
  }

  const handleVoice = () => {
    if (isSpeaking) { stopSpeaking(); setIsSpeaking(false); return }
    const visible = activeDay === 'all' ? locations : locations.filter(l => l.day === activeDay)
    speakTrip(visible, trip?.destination, () => setIsSpeaking(false))
    setIsSpeaking(true)
  }

  const toggleChecked = (locId) => {
    const updated = { ...checkedPlaces, [locId]: !checkedPlaces[locId] }
    setCheckedPlaces(updated)
    localStorage.setItem(`wp-checked-${id}`, JSON.stringify(updated))
  }

  // group by day
  const groupedLocations = locations.reduce((acc, loc) => {
    if (!acc[loc.day]) acc[loc.day] = []
    acc[loc.day].push(loc)
    return acc
  }, {})

  const visibleLocations = activeDay === 'all'
    ? locations
    : locations.filter(l => l.day === activeDay)

  const checkedCount = visibleLocations.filter(l => checkedPlaces[l.id]).length
  const progress = visibleLocations.length ? Math.round((checkedCount / visibleLocations.length) * 100) : 0

  const days = trip ? Array.from({ length: trip.days }, (_, i) => i + 1) : []

  // loading state
  if (loading) return (
    <div className="trip-loading page-enter">
      <div className="trip-loading__compass">
        <img src="/compass.svg" alt="" width="48" height="48" />
      </div>
      <div className="trip-loading__lines">
        <div className="skeleton" style={{ height: 28, width: 160, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: 100 }} />
      </div>
      <div className="trip-loading__cards">
        {[1,2,3].map(i => (
          <div key={i} className="skeleton trip-loading__card" style={{ animationDelay: `${i*0.1}s` }} />
        ))}
      </div>
    </div>
  )

  // error state
  if (error === 'not_found' || error) return (
    <div className="trip-err page-enter">
      <div className="trip-err__inner">
        <div className="trip-err__icon">🗺️</div>
        <h2>{error === 'not_found' ? 'Trip not found' : 'Something went wrong'}</h2>
        <p>{error === 'not_found' ? 'This trip doesn\'t exist or was deleted.' : error}</p>
        <div className="trip-err__btns">
          <Link to="/" className="btn btn--primary">Plan a new trip</Link>
          <Link to="/history" className="btn btn--ghost">Past trips</Link>
        </div>
      </div>
    </div>
  )

  const coverUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(trip.destination + ' travel scenic landscape golden hour photography')}?width=1400&height=500&nologo=true&seed=${trip.id}`

  return (
    <div className="trip-page page-enter">
      {/* ── COVER HERO ── */}
      <div className="trip-hero">
        <div className="trip-hero__img" style={{ backgroundImage: `url(${coverUrl})` }} />
        <div className="trip-hero__gradient" />
        <div className="trip-hero__content">
          <Link to="/" className="trip-hero__brand">
            <img src="/compass.svg" alt="" width="20" height="20" />
            WanderPlan
          </Link>
          <div>
            <h1 className="trip-hero__title">{trip.destination}</h1>
            <div className="trip-hero__tags">
              <span>{trip.days} day{trip.days > 1 ? 's' : ''}</span>
              {trip.style && <span>{trip.style}</span>}
              {trip.mood && <span>{trip.mood} mood</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY TOPBAR ── */}
      <header className={`trip-topbar ${headerScrolled ? 'trip-topbar--scrolled' : ''}`}>
        <div className="trip-topbar__left">
          <Link to="/" className="trip-topbar__logo no-print">
            <img src="/compass.svg" alt="" width="22" height="22" />
          </Link>
          <span className="trip-topbar__dest">{trip.destination}</span>
          {progress > 0 && (
            <div className="trip-topbar__prog">
              <div className="trip-topbar__prog-fill" style={{ width: `${progress}%` }} />
              <span>{progress}%</span>
            </div>
          )}
        </div>
        <div className="trip-topbar__actions no-print">
          <button className={`topbar-btn ${isSpeaking ? 'topbar-btn--active' : ''}`} onClick={handleVoice} title="Voice narration">
            {isSpeaking ? '⏹' : '🔊'}
          </button>
          <button className="topbar-btn" onClick={() => setShowMap(true)} title="Full map">
            🗺️
          </button>
          <button className="topbar-btn" onClick={() => setShowPacking(true)} title="Packing list">
            🧳
          </button>
          <button className="topbar-btn" onClick={handleCalendar} title="Add to calendar">
            📅
          </button>
          <button className="topbar-btn" onClick={() => window.print()} title="Print / PDF">
            📄
          </button>
          <button className="topbar-btn" onClick={() => setDark(!dark)}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button className={`topbar-btn topbar-btn--share ${copied ? 'topbar-btn--copied' : ''}`} onClick={handleShare}>
            {copied ? '✓ Copied' : '🔗 Share'}
          </button>
        </div>
      </header>

      {/* ── WIDGETS ROW ── */}
      <div className="trip-widgets no-print">
        <WeatherWidget destination={trip.destination} />
        <CostEstimate destination={trip.destination} days={trip.days} />
        {trip.style && <span className="widget-pill">🎯 {trip.style}</span>}
        <button className="widget-pill widget-pill--map" onClick={() => setShowMap(true)}>
          🗺️ View full map
        </button>
      </div>

      {/* ── DAY TABS ── */}
      <div className="trip-tabs no-print">
        <button
          className={`trip-tab ${activeDay === 'all' ? 'trip-tab--active' : ''}`}
          onClick={() => setActiveDay('all')}
        >
          All Days
        </button>
        {days.map(d => (
          <button
            key={d}
            className={`trip-tab ${activeDay === d ? 'trip-tab--active' : ''}`}
            data-day={d}
            onClick={() => setActiveDay(d)}
          >
            Day {d}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="trip-content" ref={scrollRef}>
        {activeDay === 'all' ? (
          Object.entries(groupedLocations).map(([day, locs]) => (
            <DaySection
              key={day}
              day={parseInt(day)}
              locations={locs}
              onPlaceClick={setSelectedPlace}
              checkedPlaces={checkedPlaces}
              onToggleChecked={toggleChecked}
            />
          ))
        ) : (
          <DaySection
            day={activeDay}
            locations={groupedLocations[activeDay] || []}
            onPlaceClick={setSelectedPlace}
            checkedPlaces={checkedPlaces}
            onToggleChecked={toggleChecked}
          />
        )}

        <footer className="trip-footer">
          <img src="/compass.svg" alt="" width="24" height="24" style={{ opacity: 0.4 }} />
          <p>© {new Date().getFullYear()} WanderPlan · Made with ❤️ by Kartavya Sonar</p>
        </footer>
      </div>

      {/* ── MODALS ── */}
      {selectedPlace && (
        <PlaceDetailDrawer
          location={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          isChecked={checkedPlaces[selectedPlace.id]}
          onToggleChecked={() => toggleChecked(selectedPlace.id)}
        />
      )}

      {showMap && (
        <MapModal
          locations={visibleLocations}
          activeDay={activeDay}
          onClose={() => setShowMap(false)}
          onPlaceClick={(place) => { setSelectedPlace(place); setShowMap(false) }}
        />
      )}

      {showPacking && (
        <PackingModal
          tripId={id}
          destination={trip.destination}
          onClose={() => setShowPacking(false)}
        />
      )}

      {/* print footer */}
      <div className="print-only" style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#666' }}>
        Generated by WanderPlan · © {new Date().getFullYear()} Kartavya Sonar
      </div>
    </div>
  )
}
