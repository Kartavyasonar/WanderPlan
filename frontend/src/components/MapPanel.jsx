import { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import './MapPanel.css'

const DAY_COLORS = ['#e07a5f', '#3d5a80', '#588157', '#9c6b98', '#d4a017', '#457b9d', '#bc4749']

const createMarkerIcon = (dayIndex, timeOfDay, isSelected) => {
  const color = DAY_COLORS[dayIndex % DAY_COLORS.length]
  const size = isSelected ? 40 : 28

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: ${isSelected ? '4px' : '3px'} solid white;
        border-radius: 50%;
        box-shadow: 0 2px ${isSelected ? '16px' : '8px'} rgba(0,0,0,${isSelected ? '0.5' : '0.3'});
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.4}px;
        ${isSelected ? 'animation: markerPulse 1s ease infinite;' : ''}
      ">
        ${timeOfDay === 'Morning' ? '🌅' : timeOfDay === 'Evening' ? '🌙' : '☀️'}
      </div>
      <style>
        @keyframes markerPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FlyToPlace({ selectedPlace }) {
  const map = useMap()

  useEffect(() => {
    if (selectedPlace && selectedPlace.lat && selectedPlace.lng) {
      map.flyTo(
        [parseFloat(selectedPlace.lat), parseFloat(selectedPlace.lng)],
        16,
        { duration: 1.2 }
      )
    }
  }, [selectedPlace?.id])

  return null
}

function FitBounds({ positions }) {
  const map = useMap()

  useMemo(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0], 14)
      return
    }
    const bounds = L.latLngBounds(positions)
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [positions.length])

  return null
}

export default function MapPanel({ locations, activeDay, className, selectedPlace }) {
  const visibleLocations = useMemo(() => {
    if (activeDay === 'all') return locations
    return locations.filter(l => l.day === activeDay)
  }, [locations, activeDay])

  const mappable = useMemo(
    () => visibleLocations.filter(l => l.lat && l.lng),
    [visibleLocations]
  )

  const positions = mappable.map(l => [parseFloat(l.lat), parseFloat(l.lng)])
  const defaultCenter = positions.length > 0 ? positions[0] : [48.8566, 2.3522]

  return (
    <div className={`map-panel ${className || ''}`}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="map-panel__map"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <FitBounds positions={positions} />
        <FlyToPlace selectedPlace={selectedPlace} />

        {mappable.map((loc) => {
          const isSelected = selectedPlace?.id === loc.id
          return (
            <Marker
              key={loc.id}
              position={[parseFloat(loc.lat), parseFloat(loc.lng)]}
              icon={createMarkerIcon(loc.day - 1, loc.time_of_day, isSelected)}
              zIndexOffset={isSelected ? 1000 : 0}
            >
              <Popup className="map-popup">
                <div className="map-popup__content">
                  <strong>{loc.place_name}</strong>
                  <span className="map-popup__day">Day {loc.day} · {loc.time_of_day}</span>
                  <p>{loc.description}</p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {mappable.length < visibleLocations.length && (
        <div className="map-panel__warning">
          ⚠️ {visibleLocations.length - mappable.length} place(s) couldn't be mapped
        </div>
      )}
    </div>
  )
}