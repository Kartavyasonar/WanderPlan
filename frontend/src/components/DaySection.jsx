import PlaceCard from './PlaceCard'
import './DaySection.css'

const DAY_LABELS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// rough distance calc
const getDistKm = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lat2) return null
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

const getTravelTime = (l1, l2) => {
  const d = getDistKm(parseFloat(l1.lat), parseFloat(l1.lng), parseFloat(l2.lat), parseFloat(l2.lng))
  if (!d) return null
  const mins = Math.round((d / 20) * 60)
  if (mins < 5) return '~5 min'
  if (mins < 60) return `~${mins} min`
  return `~${Math.round(mins/60)}h`
}

// group by time of day
const groupByTime = (locs) => {
  const groups = { Morning: [], Afternoon: [], Evening: [] }
  locs.forEach(l => {
    const t = l.time_of_day
    if (groups[t]) groups[t].push(l)
    else groups.Morning.push(l)
  })
  return groups
}

const TIME_META = {
  Morning:   { emoji: '🌅', label: 'Morning',   color: '#e8913a' },
  Afternoon: { emoji: '☀️',  label: 'Afternoon', color: '#d4a017' },
  Evening:   { emoji: '🌙', label: 'Evening',   color: '#3a6ea8' },
}

export default function DaySection({ day, locations, onPlaceClick, checkedPlaces, onToggleChecked }) {
  if (!locations.length) return null
  const dayColor = `var(--day-${Math.min(day, 7)})`
  const grouped = groupByTime(locations)

  return (
    <section className="day-section">
      {/* day header */}
      <div className="day-section__header">
        <div className="day-section__pill" style={{ '--dc': dayColor }}>
          <span className="day-section__num">Day {day}</span>
        </div>
        <div className="day-section__meta">
          <span className="day-section__count">{locations.length} stops</span>
        </div>
      </div>

      {/* time blocks */}
      {Object.entries(grouped).map(([time, locs]) => {
        if (!locs.length) return null
        const meta = TIME_META[time]
        return (
          <div key={time} className="time-block">
            <div className="time-block__label">
              <span className="time-block__emoji">{meta.emoji}</span>
              <span className="time-block__name" style={{ color: meta.color }}>{meta.label}</span>
              <div className="time-block__line" />
            </div>
            <div className="time-block__cards">
              {locs.map((loc, i) => (
                <div key={loc.id}>
                  <PlaceCard
                    location={loc}
                    dayColor={dayColor}
                    onClick={() => onPlaceClick(loc)}
                    isChecked={checkedPlaces?.[loc.id]}
                    onToggleChecked={() => onToggleChecked(loc.id)}
                  />
                  {i < locs.length - 1 && (
                    <div className="travel-gap">
                      <div className="travel-gap__dot" />
                      <div className="travel-gap__line" />
                      <span className="travel-gap__time">
                        🚶 {getTravelTime(loc, locs[i+1]) || '?'}
                      </span>
                      <div className="travel-gap__line" />
                      <div className="travel-gap__dot" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
