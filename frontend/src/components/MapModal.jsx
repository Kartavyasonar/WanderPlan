import { useMemo, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import './MapModal.css'

const DAY_COLORS = ['#d4654a', '#3a6ea8', '#4a8c5c', '#8b5e9e', '#c9881a', '#3a8ca8', '#a84444']

const makeIcon = (dayIdx, time, isSelected) => {
  const c = DAY_COLORS[dayIdx % DAY_COLORS.length]
  const s = isSelected ? 36 : 26
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${s}px;height:${s}px;
      background:${c};
      border:${isSelected ? 3 : 2}px solid white;
      border-radius:50%;
      box-shadow:0 2px ${isSelected ? 12 : 6}px rgba(0,0,0,${isSelected ? 0.45 : 0.25});
      display:flex;align-items:center;justify-content:center;
      font-size:${s * 0.38}px;
      ${isSelected ? 'animation:markerPop 1s ease infinite;' : ''}
    ">
      ${time === 'Morning' ? '🌅' : time === 'Evening' ? '🌙' : '☀️'}
    </div>
    <style>@keyframes markerPop{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}</style>`,
    iconSize: [s, s],
    iconAnchor: [s/2, s/2],
  })
}

function FitBounds({ positions }) {
  const map = useMap()
  useMemo(() => {
    if (!positions.length) return
    if (positions.length === 1) { map.setView(positions[0], 15); return }
    map.fitBounds(L.latLngBounds(positions), { padding: [48, 48] })
  }, [positions.length])
  return null
}

export default function MapModal({ locations, activeDay, onClose, onPlaceClick }) {
  const mappable = locations.filter(l => l.lat && l.lng)
  const positions = mappable.map(l => [parseFloat(l.lat), parseFloat(l.lng)])
  const defaultCenter = positions[0] || [20, 77]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // group by day for the legend
  const days = [...new Set(mappable.map(l => l.day))].sort()

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

        {/* day legend */}
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
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            <FitBounds positions={positions} />
            {mappable.map(loc => (
              <Marker
                key={loc.id}
                position={[parseFloat(loc.lat), parseFloat(loc.lng)]}
                icon={makeIcon(loc.day - 1, loc.time_of_day, false)}
                eventHandlers={{ click: () => onPlaceClick(loc) }}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>{loc.place_name}</strong>
                    <span>Day {loc.day} · {loc.time_of_day}</span>
                    <p>{loc.description?.slice(0, 100)}…</p>
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
