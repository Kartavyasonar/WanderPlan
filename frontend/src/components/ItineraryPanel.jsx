import DayCard from './DayCard'
import './ItineraryPanel.css'

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lat2) return null
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

const getTravelTime = (loc1, loc2) => {
  const dist = getDistanceKm(
    parseFloat(loc1.lat), parseFloat(loc1.lng),
    parseFloat(loc2.lat), parseFloat(loc2.lng)
  )
  if (!dist) return null
  const mins = Math.round((dist / 20) * 60)
  if (mins < 5) return '~5 min'
  if (mins < 60) return `~${mins} min`
  return `~${Math.round(mins/60)}h`
}

const groupByDay = (locations) => {
  const groups = {}
  for (const loc of locations) {
    if (!groups[loc.day]) groups[loc.day] = []
    groups[loc.day].push(loc)
  }
  return groups
}

const renderLocationsWithTravel = (locs, dayColor) => {
  return locs.map((loc, i) => (
    <div key={loc.id}>
      <DayCard location={loc} dayColor={dayColor} />
      {i < locs.length - 1 && (
        <div className="travel-connector">
          <div className="travel-connector__line" />
          <span className="travel-connector__time">
            🚶 {getTravelTime(loc, locs[i + 1]) || '?'}
          </span>
          <div className="travel-connector__line" />
        </div>
      )}
    </div>
  ))
}

export default function ItineraryPanel({ locations, activeDay, totalDays, className }) {
  if (activeDay === 'all') {
    const grouped = groupByDay(locations)
    return (
      <div className={`itinerary-panel ${className || ''}`}>
        <div className="itinerary-panel__scroll">
          {Object.entries(grouped).map(([day, dayLocations]) => (
            <div key={day} className="itinerary-day-section">
              <div className="itinerary-day-header" style={{ '--day-color': `var(--day-${Math.min(parseInt(day), 7)})` }}>
                <span className="itinerary-day-dot" />
                <h3>Day {day}</h3>
                <span className="itinerary-day-count">{dayLocations.length} places</span>
              </div>
              {renderLocationsWithTravel(dayLocations, `var(--day-${Math.min(parseInt(day), 7)})`)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const filtered = locations.filter(l => l.day === activeDay)
  return (
    <div className={`itinerary-panel ${className || ''}`}>
      <div className="itinerary-panel__scroll">
        <div className="itinerary-day-header" style={{ '--day-color': `var(--day-${Math.min(activeDay, 7)})` }}>
          <span className="itinerary-day-dot" />
          <h3>Day {activeDay}</h3>
          <span className="itinerary-day-count">{filtered.length} places</span>
        </div>
        {renderLocationsWithTravel(filtered, `var(--day-${Math.min(activeDay, 7)})`)}
      </div>
    </div>
  )
}