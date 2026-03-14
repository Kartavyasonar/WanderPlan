import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import './MapPanel.css'

// day colors for map markers (must match CSS variables)
const DAY_COLORS = ['#e07a5f', '#3d5a80', '#588157', '#9c6b98', '#d4a017', '#457b9d', '#bc4749']

// create a colored circle marker for each day
const createMarkerIcon = (dayIndex, timeOfDay) => {
  const color = DAY_COLORS[dayIndex % DAY_COLORS.length]

  // slightly different size for morning vs evening
  const size = timeOfDay === 'Evening' ? 32 : 28

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.45}px;
      ">
        ${timeOfDay === 'Morning' ? '🌅' : timeOfDay === 'Evening' ? '🌙' : '☀️'}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// component that auto-fits the map to show all markers
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

export default function MapPanel({ locations, activeDay }) {
  // filter locations based on active day
  const visibleLocations = useMemo(() => {
    if (activeDay === 'all') return locations
    return locations.filter(l => l.day === activeDay)
  }, [locations, activeDay])

  // only locations that have valid coordinates
  const mappable = useMemo(
    () => visibleLocations.filter(l => l.lat && l.lng),
    [visibleLocations]
  )

  const positions = mappable.map(l => [parseFloat(l.lat), parseFloat(l.lng)])

  // default center (will be overridden by fitBounds)
  const defaultCenter = positions.length > 0
    ? positions[0]
    : [48.8566, 2.3522] // paris as fallback

  return (
    <div className="map-panel">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="map-panel__map"
        zoomControl={true}
      >
        {/* using openstreetmap tiles - totally free */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <FitBounds positions={positions} />

        {mappable.map((loc) => (
          <Marker
            key={loc.id}
            position={[parseFloat(loc.lat), parseFloat(loc.lng)]}
            icon={createMarkerIcon(loc.day - 1, loc.time_of_day)}
          >
            <Popup className="map-popup">
              <div className="map-popup__content">
                <strong>{loc.place_name}</strong>
                <span className="map-popup__day">
                  Day {loc.day} · {loc.time_of_day}
                </span>
                <p>{loc.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {mappable.length < visibleLocations.length && (
        <div className="map-panel__warning">
          ⚠️ {visibleLocations.length - mappable.length} place(s) couldn't be found on the map
        </div>
      )}
    </div>
  )
}