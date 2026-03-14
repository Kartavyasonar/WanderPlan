import { useState, useEffect, useRef } from 'react'
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

export default function PlaceDetailDrawer({ location, onClose, isChecked, onToggleChecked }) {
  const [wiki, setWiki] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const drawerRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setWiki(null)
    setPhoto(null)
    // scroll drawer to top when new place opens
    if (drawerRef.current) drawerRef.current.scrollTop = 0
    fetchDetails()

    // lock body scroll on mobile
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [location?.id])

  const fetchDetails = async () => {
    await Promise.all([fetchWiki(), fetchPhoto()])
    setLoading(false)
  }

  const fetchWiki = async () => {
    try {
      const catHint = {
        Food: 'restaurant cafe food', Historical: 'monument landmark historic',
        Nature: 'park garden', Culture: 'cultural museum', Shopping: 'market',
        Entertainment: 'entertainment'
      }[location.category] || ''

      const q = encodeURIComponent(`${location.place_name} ${catHint}`)
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&origin=*&srlimit=5`)
      const data = await res.json()
      const BAD = ['film', 'directed by', 'television series', 'novel', 'album', 'song', 'actor']
      const best = (data?.query?.search || []).find(r => {
        const s = (r.snippet || '').toLowerCase()
        return !BAD.some(k => s.includes(k))
      })
      if (!best) { setWiki(null); return }

      const pageRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(best.title)}`)
      const pageData = await pageRes.json()
      const ext = (pageData.extract || '').toLowerCase()
      if (BAD.slice(0,3).some(k => ext.startsWith(k) || ext.includes(`is a ${k}`))) { setWiki(null); return }
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
      if (p?.thumbnail?.source) setPhoto(p.thumbnail.source)
      // fallback: Pollinations AI image
      else {
        setPhoto(`https://image.pollinations.ai/prompt/${encodeURIComponent(location.place_name + ' travel photography')}?width=800&height=400&nologo=true&seed=${location.id}`)
      }
    } catch { setPhoto(null) }
  }

  const mapsUrl = location.lat && location.lng
    ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.place_name)}`

  const dayColor = `var(--day-${Math.min(location.day, 7)})`

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        {/* drag handle - mobile */}
        <div className="drawer__handle-wrap" onClick={onClose}>
          <div className="drawer__handle" />
        </div>

        {/* photo header */}
        <div className="drawer__photo-area">
          {loading && <div className="drawer__photo-skeleton skeleton" />}
          {photo && (
            <img
              src={photo}
              alt={location.place_name}
              className="drawer__photo"
              onError={e => e.target.style.display = 'none'}
            />
          )}
          {/* gradient overlay with title */}
          <div className="drawer__photo-overlay">
            <button className="drawer__close" onClick={onClose} aria-label="Close">✕</button>
            <div className="drawer__photo-meta">
              <span className="drawer__day-tag" style={{ background: dayColor }}>
                Day {location.day} · {location.time_of_day}
              </span>
              <span className="drawer__cat-tag">
                {CAT_ICONS[location.category]} {TYPE_LABELS[location.type] || location.category}
              </span>
            </div>
          </div>
        </div>

        {/* scrollable content */}
        <div className="drawer__content" ref={drawerRef}>
          {/* title + check */}
          <div className="drawer__title-row">
            <h2 className="drawer__title">{location.place_name}</h2>
            <button
              className={`drawer__check ${isChecked ? 'drawer__check--done' : ''}`}
              onClick={onToggleChecked}
            >
              {isChecked ? '✓ Visited' : 'Mark visited'}
            </button>
          </div>

          {/* duration */}
          {location.duration && (
            <div className="drawer__badge-row">
              <span className="drawer__badge">⏱ {location.duration}</span>
            </div>
          )}

          {/* about */}
          <section className="drawer__section">
            <h4 className="drawer__section-label">About</h4>
            <p className="drawer__text">{location.description}</p>
          </section>

          {/* tip */}
          {location.tip && (
            <section className="drawer__section">
              <h4 className="drawer__section-label">💡 Insider Tip</h4>
              <p className="drawer__tip">{location.tip}</p>
            </section>
          )}

          {/* wikipedia */}
          {loading && (
            <section className="drawer__section">
              <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 12, width: '100%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 12, width: '75%' }} />
            </section>
          )}
          {!loading && wiki?.summary && (
            <section className="drawer__section">
              <h4 className="drawer__section-label">📖 Wikipedia</h4>
              <p className="drawer__wiki">
                {wiki.summary.length > 380 ? wiki.summary.slice(0, 380) + '…' : wiki.summary}
              </p>
              {wiki.url && (
                <a href={wiki.url} target="_blank" rel="noopener noreferrer" className="drawer__wiki-link">
                  Read full article ↗
                </a>
              )}
            </section>
          )}

          {/* coordinates */}
          {location.lat && location.lng && (
            <section className="drawer__section">
              <h4 className="drawer__section-label">📍 Coordinates</h4>
              <code className="drawer__coords">
                {parseFloat(location.lat).toFixed(5)}, {parseFloat(location.lng).toFixed(5)}
              </code>
            </section>
          )}

          {/* map button */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="drawer__maps-btn"
          >
            🗺️ Open in Google Maps
          </a>
        </div>
      </div>
    </>
  )
}
