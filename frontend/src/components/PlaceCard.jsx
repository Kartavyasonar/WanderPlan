import './PlaceCard.css'

const TYPE_CONFIG = {
  breakfast: { icon: '☕', label: 'Breakfast', bg: '#fff3e0' },
  lunch:     { icon: '🥗', label: 'Lunch',     bg: '#e8f5e9' },
  dinner:    { icon: '🍴', label: 'Dinner',    bg: '#fce4ec' },
  attraction:{ icon: '📸', label: 'Attraction',bg: '#e3f2fd' },
  experience:{ icon: '✨', label: 'Experience',bg: '#f3e5f5' },
  sunset:    { icon: '🌇', label: 'Sunset',    bg: '#fff8e1' },
  nightlife: { icon: '🌃', label: 'Night Out', bg: '#e8eaf6' },
}

const CAT_ICONS = {
  Historical: '🏛️', Food: '🍽️', Nature: '🌿',
  Culture: '🎭', Shopping: '🛍️', Entertainment: '🎉',
}

export default function PlaceCard({ location, dayColor, onClick, isChecked, onToggleChecked }) {
  const typeConf = TYPE_CONFIG[location.type] || { icon: CAT_ICONS[location.category] || '📍', label: location.category, bg: '#f5f5f5' }
  const hasCoords = location.lat && location.lng

  const handleCheck = (e) => {
    e.stopPropagation()
    onToggleChecked?.()
  }

  return (
    <div
      className={`place-card ${isChecked ? 'place-card--done' : ''}`}
      style={{ '--dc': dayColor }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      {/* left accent */}
      <div className="place-card__bar" />

      <div className="place-card__body">
        {/* top row */}
        <div className="place-card__top">
          <span
            className="place-card__type"
            style={{ background: typeConf.bg }}
          >
            {typeConf.icon} {typeConf.label}
          </span>
          {location.duration && (
            <span className="place-card__dur">⏱ {location.duration}</span>
          )}
          {/* visited toggle */}
          <button
            className={`place-card__check ${isChecked ? 'place-card__check--done' : ''}`}
            onClick={handleCheck}
            aria-label="Mark as visited"
          >
            {isChecked ? '✓' : ''}
          </button>
        </div>

        {/* title */}
        <h3 className={`place-card__name ${isChecked ? 'place-card__name--done' : ''}`}>
          {location.place_name}
        </h3>

        {/* description */}
        <p className="place-card__desc">{location.description}</p>

        {/* insider tip */}
        {location.tip && (
          <div className="place-card__tip">
            <span className="place-card__tip-icon">💡</span>
            <span>{location.tip}</span>
          </div>
        )}

        {/* bottom row */}
        <div className="place-card__bottom">
          {hasCoords ? (
            <span className="place-card__coords">
              📍 {parseFloat(location.lat).toFixed(3)}, {parseFloat(location.lng).toFixed(3)}
            </span>
          ) : (
            <span className="place-card__no-coords">⚠️ not on map</span>
          )}
          <span className="place-card__cta">View details →</span>
        </div>
      </div>
    </div>
  )
}
