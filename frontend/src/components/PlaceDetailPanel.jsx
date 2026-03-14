// side panel that shows when user clicks a place card
// fetches wikipedia summary and unsplash photo for the place
import { useState, useEffect } from 'react'
import './PlaceDetailPanel.css'

const CATEGORY_ICONS = {
  Historical: '🏛️', Food: '🍽️', Nature: '🌿',
  Culture: '🎭', Shopping: '🛍️', Entertainment: '🎉',
}

export default function PlaceDetailPanel({ location, onClose }) {
  const [wiki, setWiki] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (location) {
      setLoading(true)
      setWiki(null)
      setPhoto(null)
      fetchDetails()
    }
  }, [location?.id])

  const fetchDetails = async () => {
    // fetch wikipedia summary and photo in parallel
    await Promise.all([fetchWiki(), fetchPhoto()])
    setLoading(false)
  }

  const fetchWiki = async () => {
    try {
      const query = encodeURIComponent(location.place_name)
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${query}`
      )
      if (!res.ok) throw new Error('no wiki')
      const data = await res.json()
      if (data.type === 'disambiguation') throw new Error('disambiguation')
      setWiki({
        summary: data.extract,
        url: data.content_urls?.desktop?.page,
        thumbnail: data.thumbnail?.source || null
      })
    } catch {
      // try with destination added
      try {
        const query = encodeURIComponent(`${location.place_name}`)
        const res = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*&srlimit=1`
        )
        const data = await res.json()
        const title = data?.query?.search?.[0]?.title
        if (title) {
          const pageRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
          )
          const pageData = await pageRes.json()
          setWiki({
            summary: pageData.extract,
            url: pageData.content_urls?.desktop?.page,
            thumbnail: pageData.thumbnail?.source || null
          })
        }
      } catch {
        setWiki(null)
      }
    }
  }

  const fetchPhoto = async () => {
    try {
      // use wikimedia commons for photos - totally free
      const query = encodeURIComponent(location.place_name)
      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${query}&prop=pageimages&format=json&pithumbsize=600&origin=*`
      )
      const data = await res.json()
      const pages = data?.query?.pages
      const page = pages ? Object.values(pages)[0] : null
      if (page?.thumbnail?.source) {
        setPhoto(page.thumbnail.source)
      }
    } catch {
      setPhoto(null)
    }
  }

  if (!location) return null

  const mapsUrl = location.lat && location.lng
    ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.place_name)}`

  const dayColor = `var(--day-${Math.min(location.day, 7)})`

  return (
    <>
      {/* backdrop */}
      <div className="place-panel__backdrop" onClick={onClose} />

      <div className="place-panel">
        {/* header */}
        <div className="place-panel__header" style={{ borderTopColor: dayColor }}>
          <button className="place-panel__close" onClick={onClose}>✕</button>
          <div className="place-panel__meta">
            <span className="place-panel__day" style={{ color: dayColor }}>
              Day {location.day} · {location.time_of_day}
            </span>
            <span className="place-panel__category">
              {CATEGORY_ICONS[location.category]} {location.category}
            </span>
          </div>
          <h2 className="place-panel__title">{location.place_name}</h2>
        </div>

        <div className="place-panel__body">
          {/* photo */}
          {loading && (
            <div className="place-panel__photo-skeleton skeleton" />
          )}

          {!loading && (photo || wiki?.thumbnail) && (
            <div className="place-panel__photo-wrap">
              <img
                src={photo || wiki.thumbnail}
                alt={location.place_name}
                className="place-panel__photo"
                onError={e => e.target.style.display = 'none'}
              />
            </div>
          )}

          {/* our description */}
          <div className="place-panel__section">
            <h4>About this place</h4>
            <p>{location.description}</p>
          </div>

          {/* wikipedia summary */}
          {loading && (
            <div className="place-panel__section">
              <div className="skeleton skeleton--text" style={{ width: '100%', marginBottom: 8 }} />
              <div className="skeleton skeleton--text" style={{ width: '90%', marginBottom: 6 }} />
              <div className="skeleton skeleton--text" style={{ width: '95%', marginBottom: 6 }} />
              <div className="skeleton skeleton--text" style={{ width: '70%' }} />
            </div>
          )}

          {!loading && wiki?.summary && (
            <div className="place-panel__section">
              <h4>📖 Wikipedia</h4>
              <p className="place-panel__wiki-text">
                {wiki.summary.length > 400
                  ? wiki.summary.substring(0, 400) + '...'
                  : wiki.summary
                }
              </p>
              {wiki.url && (
                <a href={wiki.url} target="_blank" rel="noopener noreferrer" className="place-panel__wiki-link">
                  Read full article →
                </a>
              )}
            </div>
          )}

          {!loading && !wiki && (
            <div className="place-panel__section place-panel__no-wiki">
              <p>No Wikipedia article found for this place.</p>
            </div>
          )}

          {/* coordinates */}
          {location.lat && location.lng && (
            <div className="place-panel__section">
              <h4>📍 Location</h4>
              <p className="place-panel__coords">
                {parseFloat(location.lat).toFixed(4)}, {parseFloat(location.lng).toFixed(4)}
              </p>
            </div>
          )}

          {/* open in maps button */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="place-panel__maps-btn"
          >
            🗺️ Open in Google Maps
          </a>
        </div>
      </div>
    </>
  )
}