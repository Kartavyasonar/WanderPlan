import { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import './MapModal.css'

const DAY_COLORS = ['#d4654a', '#3a6ea8', '#4a8c5c', '#8b5e9e', '#c9881a', '#3a8ca8', '#a84444']

const makeIcon = (dayIdx, time) => {
  const c = DAY_COLORS[dayIdx % DAY_COLORS.length]
  const s = 28
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${s}px;height:${s}px;
      background:${c};
      border:2.5px solid white;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.28);
      display:flex;align-items:center;justify-content:center;
      font-size:11px;
    ">${time === 'Morning' ? '🌅' : time === 'Evening' ? '🌙' : '☀️'}</div>`,
    iconSize: [s, s],
    iconAnchor: [s/2, s/2],
    popupAnchor: [0, -s/2],
  })
}

function FitBounds({ positions }) {
  const map = useMap()
  useMemo(() => {
    if (!positions.length) return
    if (positions.length === 1) { map.setView(positions[0], 15); return }
    try {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [40, 40] })
    } catch(e) {}
  }, [positions.length])
  return null
}

// force map to resize when modal opens
function InvalidateSize() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100)
    setTimeout(() => map.invalidateSize(), 300)
  }, [])
  return null
}

export default function MapModal({ locations, activeDay, onClose, onPlaceClick }) {
  const mappable = locations.filter(l => l.lat && l.lng)
  const positions = mappable.map(l => [parseFloat(l.lat), parseFloat(l.lng)])
  const defaultCenter = positions[0] || [20, 77]
  const days = [...new Set(mappable.map(l => l.day))].sort()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!mappable.length) {
    return (
      <>
        <div className="map-modal-backdrop" onClick={onClose} />
        <div className="map-modal">
          <div className="map-modal__header">
            <h3 className="map-modal__title">Map</h3>
            <button className="map-modal__close" onClick={onClose}>✕ Close</button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: '2.5rem' }}>🗺️</span>
            <p>No locations could be mapped for this view.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="map-modal-backdrop" onClick={onClose} />
      <div className="map-modal">
        <div className="map-modal__header">
          <h3 className="map-modal__title">
            {activeDay === 'all' ? 'Full Itinerary Map' : `Day ${activeDay} Map`}
            <span className="map-modal__count">{mappable.length} places</span>
          </h3>
          <button className="map-modal__close" onClick={onClose}>✕ Close</button>
        </div>

        <div className="map-modal__legend">
          {days.map(d => (
            <span key={d} className="map-modal__legend-item">
              <span style={{ background: DAY_COLORS[(d-1) % DAY_COLORS.length] }} className="map-modal__legend-dot" />
              Day {d}
            </span>
          ))}
        </div>

        <div className="map-modal__map">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            <FitBounds positions={positions} />
            <InvalidateSize />
            {mappable.map(loc => (
              <Marker
                key={loc.id}
                position={[parseFloat(loc.lat), parseFloat(loc.lng)]}
                icon={makeIcon(loc.day - 1, loc.time_of_day)}
                eventHandlers={{ click: () => onPlaceClick(loc) }}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>{loc.place_name}</strong>
                    <span>Day {loc.day} · {loc.time_of_day}</span>
                    <p>{(loc.description || '').slice(0, 100)}{loc.description?.length > 100 ? '…' : ''}</p>
                    <button onClick={() => onPlaceClick(loc)}>View details →</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {mappable.length < locations.length && (
          <div className="map-modal__warn">
            ⚠️ {locations.length - mappable.length} place(s) couldn't be located on the map
          </div>
        )}
      </div>
    </>
  )
}
