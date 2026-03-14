import './DayCard.css'

const CATEGORY_ICONS = {
  Historical: '🏛️', Food: '🍽️', Nature: '🌿',
  Culture: '🎭', Shopping: '🛍️', Entertainment: '🎉',
}

const TIME_ICONS = {
  Morning: '🌅', Afternoon: '☀️', Evening: '🌙',
}

const TYPE_ICONS = {
  breakfast: '☕', lunch: '🥗', dinner: '🍴',
  attraction: '📸', experience: '✨', sunset: '🌇',
  nightlife: '🌃',
}

const TYPE_LABELS = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner',
  attraction: 'Attraction', experience: 'Experience',
  sunset: 'Sunset Spot', nightlife: 'Night Out',
}

export default function DayCard({ location, dayColor, onClick }) {
  const categoryIcon = CATEGORY_ICONS[location.category] || '📍'
  const timeIcon = TIME_ICONS[location.time_of_day] || '🕐'
  const typeIcon = TYPE_ICONS[location.type] || categoryIcon
  const typeLabel = TYPE_LABELS[location.type] || location.category
  const hasCoords = location.lat && location.lng

  return (
    <div
      className="day-card"
      style={{ '--card-accent': dayColor }}
      onClick={() => onClick && onClick(location)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick && onClick(location)}
    >
      <div className="day-card__accent-bar" />
      <div className="day-card__content">
        <div className="day-card__top">
          <div className="day-card__time">
            <span>{timeIcon}</span>
            <span className="day-card__time-label">{location.time_of_day}</span>
          </div>
          <div className="day-card__type-badge">
            {typeIcon} {typeLabel}
          </div>
        </div>

        <h4 className="day-card__name">{location.place_name}</h4>
        <p className="day-card__desc">{location.description}</p>

        <div className="day-card__meta-row">
          {location.duration && (
            <span className="day-card__duration">⏱️ {location.duration}</span>
          )}
          {location.tip && (
            <span className="day-card__tip">💡 {location.tip}</span>
          )}
        </div>

        {hasCoords ? (
          <div className="day-card__coords">
            📍 {parseFloat(location.lat).toFixed(4)}, {parseFloat(location.lng).toFixed(4)}
          </div>
        ) : (
          <div className="day-card__no-coords">⚠️ location not found on map</div>
        )}

        <div className="day-card__click-hint">Tap for photos & info →</div>
      </div>
    </div>
  )
}