import DayCard from './DayCard'
import './ItineraryPanel.css'

// helper to get locations for a specific day
const getByDay = (locations, day) => {
  if (day === 'all') return locations
  return locations.filter(l => l.day === day)
}

// group locations by day (for the "all days" view)
const groupByDay = (locations) => {
  const groups = {}
  for (const loc of locations) {
    if (!groups[loc.day]) groups[loc.day] = []
    groups[loc.day].push(loc)
  }
  return groups
}

export default function ItineraryPanel({ locations, activeDay, totalDays }) {
  if (activeDay === 'all') {
    const grouped = groupByDay(locations)

    return (
      <div className="itinerary-panel">
        <div className="itinerary-panel__scroll">
          {Object.entries(grouped).map(([day, dayLocations]) => (
            <div key={day} className="itinerary-day-section">
              <div
                className="itinerary-day-header"
                style={{ '--day-color': `var(--day-${Math.min(parseInt(day), 7)})` }}
              >
                <span className="itinerary-day-dot" />
                <h3>Day {day}</h3>
                <span className="itinerary-day-count">{dayLocations.length} places</span>
              </div>
              {dayLocations.map(loc => (
                <DayCard key={loc.id} location={loc} dayColor={`var(--day-${Math.min(loc.day, 7)})`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const filtered = getByDay(locations, activeDay)

  return (
    <div className="itinerary-panel">
      <div className="itinerary-panel__scroll">
        <div
          className="itinerary-day-header"
          style={{ '--day-color': `var(--day-${Math.min(activeDay, 7)})` }}
        >
          <span className="itinerary-day-dot" />
          <h3>Day {activeDay}</h3>
          <span className="itinerary-day-count">{filtered.length} places</span>
        </div>
        {filtered.map(loc => (
          <DayCard key={loc.id} location={loc} dayColor={`var(--day-${Math.min(loc.day, 7)})`} />
        ))}
      </div>
    </div>
  )
}