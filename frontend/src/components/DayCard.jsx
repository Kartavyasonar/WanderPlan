import './DayCard.css'

// icons for each category
const CATEGORY_ICONS = {
  Historical: '🏛️',
  Food: '🍽️',
  Nature: '🌿',
  Culture: '🎭',
  Shopping: '🛍️',
  Entertainment: '🎉',
}

const TIME_ICONS = {
  Morning: '🌅',
  Afternoon: '☀️',
  Evening: '🌙',
}

export default function DayCard({ location, dayColor }) {
  const categoryIcon = CATEGORY_ICONS[location.category] || '📍'
  const timeIcon = TIME_ICONS[location.time_of_day] || '🕐'
  const hasCoords = location.lat && location.lng

  return (
    <div className="day-card" style={{ '--card-accent': dayColor }}>
      <div className="day-card__accent-bar" />

      <div className="day-card__content">
        <div className="day-card__top">
          <div className="day-card__time">
            <span>{timeIcon}</span>
            <span className="day-card__time-label">{location.time_of_day}</span>
          </div>
          <div className="day-card__category">
            <span>{categoryIcon}</span>
            <span>{location.category}</span>
          </div>
        </div>

        <h4 className="day-card__name">{location.place_name}</h4>
        <p className="day-card__desc">{location.description}</p>

        {/* show coordinates if we have them, just a small note */}
        {hasCoords && (
          <div className="day-card__coords">
            📍 {parseFloat(location.lat).toFixed(4)}, {parseFloat(location.lng).toFixed(4)}
          </div>
        )}

        {!hasCoords && (
          <div className="day-card__no-coords">
            ⚠️ location not found on map
          </div>
        )}
      </div>
    </div>
  )
}