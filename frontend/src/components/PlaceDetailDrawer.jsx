import { useState, useEffect } from 'react'
import './PlaceDetailDrawer.css'

const CAT_ICONS = {
  Historical: '🏛️', Food: '🍽️', Nature: '🌿',
  Culture: '🎭', Shopping: '🛍️', Entertainment: '🎉',
}

const TYPE_LABELS = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner',
  attraction: 'Attraction', experience: 'Experience',
  sunset: 'Sunset Spot', nightlife: 'Night Out',
}

const TYPE_ICONS = {
  breakfast: '☕', lunch: '🥗', dinner: '🍴',
  attraction: '📸', experience: '✨', sunset: '🌇', nightlife: '🌃',
}

export default function PlaceDetailDrawer({ location, onClose, isChecked, onToggleChecked }) {
  const [wiki, setWiki] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  // animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    setLoading(true)
    setWiki(null)
    setPhoto(null)
    fetchDetails()
  }, [location?.id])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const fetchDetails = async () => {
    await Promise.all([fetchWiki(), fetchPhoto()])
    setLoading(false)
  }

  const fetchWiki = async () => {
    try {
      const catHint = {
        Food: 'restaurant cafe', Historical: 'monument landmark',
        Nature: 'park garden', Culture: 'cultural museum',
        Shopping: 'market', Entertainment: 'entertainment'
      }[location.category] || ''
      const q = encodeURIComponent(`${location.place_name} ${catHint}`)
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&origin=*&srlimit=5`)
      const data = await res.json()
      const BAD = ['film', 'directed by', 'television series', 'novel', 'album', 'song']
      const best = (data?.query?.search || []).find(r => !BAD.some(k => (r.snippet || '').toLowerCase().includes(k)))
      if (!best) { setWiki(null); return }
      const pageRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(best.title)}`)
      const pageData = await pageRes.json()
      setWiki({ summary: pageData.extract, url: pageData.content_urls?.desktop?.page, thumbnail: pageData.thumbnail?.source })
    } catch { setWiki(null) }
  }

  const fetchPhoto = async () => {
    try {
      const q = encodeURIComponent(location.place_name)
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${q}&prop=pageimages&format=json&pithumbsize=800&origin=*`)
      const data = await res.json()
      const pages = data?.query?.pages
      const p = pages ? Object.values(pages)[0] : null
      if (p?.thumbnail?.source) { setPhoto(p.thumbnail.source); return }
      setPhoto(`https://image.pollinations.ai/prompt/${encodeURIComponent(location.place_name + ' travel photography beautiful')}?width=800&height=400&nologo=true&seed=${location.id}`)
    } catch { setPhoto(null) }
  }

  const mapsUrl = location.lat && location.lng
    ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.place_name)}`

  const dayColors = ['#d4654a','#3a6ea8','#4a8c5c','#8b5e9e','#c9881a','#3a8ca8','#a84444']
  const dayColor = dayColors[(location.day - 1) % dayColors.length]
  const typeIcon = TYPE_ICONS[location.type] || CAT_ICONS[location.category] || '📍'
  const typeLabel = TYPE_LABELS[location.type] || location.category

  return (
    <div className={`pdp-overlay ${visible ? 'pdp-overlay--in' : ''}`} onClick={handleClose}>
      <div className={`pdp ${visible ? 'pdp--in' : ''}`} onClick={e => e.stopPropagation()}>

        {/* ── PHOTO HERO ── */}
        <div className="pdp__hero">
          {loading && <div className="pdp__hero-skeleton" />}
          {photo && (
            <img
              src={photo}
              alt={location.place_name}
              className="pdp__hero-img"
              onError={e => e.target.style.display = 'none'}
            />
          )}
          <div className="pdp__hero-overlay">
            <button className="pdp__close" onClick={handleClose}>✕</button>
            <div className="pdp__hero-bottom">
              <div className="pdp__tags">
                <span className="pdp__tag pdp__tag--day" style={{ background: dayColor }}>
                  Day {location.day}
                </span>
                <span className="pdp__tag pdp__tag--time">{location.time_of_day}</span>
                <span className="pdp__tag pdp__tag--type">{typeIcon} {typeLabel}</span>
              </div>
              <h2 className="pdp__title">{location.place_name}</h2>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="pdp__body">

          {/* action row */}
          <div className="pdp__actions">
            <button
              className={`pdp__visited ${isChecked ? 'pdp__visited--done' : ''}`}
              onClick={onToggleChecked}
            >
              {isChecked ? '✓ Visited' : '○ Mark visited'}
            </button>
            {location.duration && (
              <span className="pdp__pill">⏱ {location.duration}</span>
            )}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="pdp__maps-link">
              🗺️ Maps
            </a>
          </div>

          {/* about */}
          <div className="pdp__section">
            <p className="pdp__about">{location.description}</p>
          </div>

          {/* tip */}
          {location.tip && (
            <div className="pdp__tip">
              <span className="pdp__tip-icon">💡</span>
              <p>{location.tip}</p>
            </div>
          )}

          {/* wikipedia */}
          {loading && (
            <div className="pdp__section">
              <div className="pdp__skel" style={{ width: '35%', height: 12, marginBottom: 10 }} />
              <div className="pdp__skel" style={{ width: '100%', height: 11, marginBottom: 6 }} />
              <div className="pdp__skel" style={{ width: '90%', height: 11, marginBottom: 6 }} />
              <div className="pdp__skel" style={{ width: '78%', height: 11 }} />
            </div>
          )}

          {!loading && wiki?.summary && (
            <div className="pdp__section">
              <div className="pdp__section-label">📖 Wikipedia</div>
              <p className="pdp__wiki">
                {wiki.summary.length > 320 ? wiki.summary.slice(0, 320) + '…' : wiki.summary}
              </p>
              {wiki.url && (
                <a href={wiki.url} target="_blank" rel="noopener noreferrer" className="pdp__wiki-link">
                  Read full article ↗
                </a>
              )}
            </div>
          )}

          {/* coords */}
          {location.lat && location.lng && (
            <div className="pdp__section">
              <div className="pdp__section-label">📍 Location</div>
              <code className="pdp__coords">
                {parseFloat(location.lat).toFixed(5)}, {parseFloat(location.lng).toFixed(5)}
              </code>
            </div>
          )}

          {/* big maps button */}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="pdp__maps-btn">
            🗺️ Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}