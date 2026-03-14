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
    await Promise.all([fetchWiki(), fetchPhoto()])
    setLoading(false)
  }

  const fetchWiki = async () => {
  try {
    // add destination context to avoid wrong matches
    // e.g. "Cafe Madras Mumbai" instead of just "Cafe Madras"
    const contextQuery = encodeURIComponent(`${location.place_name}`)
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${contextQuery}`)
    if (!res.ok) throw new Error('no wiki')
    const data = await res.json()
    if (data.type === 'disambiguation') throw new Error('disambiguation')

    // sanity check - if the wikipedia result seems completely unrelated, skip it
    // e.g. if place is a restaurant but wiki says it's a film, reject it
    const placeLower = location.place_name.toLowerCase()
    const summaryLower = (data.extract || '').toLowerCase()
    const titleLower = (data.title || '').toLowerCase()

    // check if result is a film/movie when we're looking for a place
    const isFilm = summaryLower.includes('is a film') || summaryLower.includes('is an indian film') ||
                   summaryLower.includes('is a movie') || summaryLower.includes('directed by') ||
                   summaryLower.includes('is a television') || summaryLower.includes('is a novel')

    const isRelevant = titleLower.includes(placeLower.split(' ')[0]) || 
                       summaryLower.includes(location.category?.toLowerCase()) ||
                       summaryLower.includes('restaurant') ||
                       summaryLower.includes('temple') ||
                       summaryLower.includes('mosque') ||
                       summaryLower.includes('museum') ||
                       summaryLower.includes('park') ||
                       summaryLower.includes('monument') ||
                       summaryLower.includes('located in') ||
                       summaryLower.includes('situated in')

    if (isFilm && !isRelevant) throw new Error('wrong result - film not place')

    setWiki({
      summary: data.extract,
      url: data.content_urls?.desktop?.page,
      thumbnail: data.thumbnail?.source || null
    })
  } catch {
    // fallback: search with category context
    try {
      // add category context to make search more specific
      const categoryHint = {
        Food: 'restaurant cafe',
        Historical: 'monument historic',
        Nature: 'park garden',
        Culture: 'cultural',
        Shopping: 'market shopping',
        Entertainment: 'entertainment'
      }[location.category] || ''

      const searchQuery = encodeURIComponent(`${location.place_name} ${categoryHint}`)
      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*&srlimit=3`
      )
      const data = await res.json()
      const results = data?.query?.search || []

      // find the most relevant result - skip films/shows
      const best = results.find(r => {
        const snippet = (r.snippet || '').toLowerCase()
        const title = (r.title || '').toLowerCase()
        const isFilm = snippet.includes('film') || snippet.includes('directed by') || snippet.includes('television series')
        const matchesPlace = title.includes(location.place_name.toLowerCase().split(' ')[0])
        return !isFilm || matchesPlace
      })

      if (best) {
        const pageRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(best.title)}`
        )
        const pageData = await pageRes.json()
        setWiki({
          summary: pageData.extract,
          url: pageData.content_urls?.desktop?.page,
          thumbnail: pageData.thumbnail?.source || null
        })
      } else {
        setWiki(null)
      }
    } catch {
      setWiki(null)
    }
  }
}

  const fetchPhoto = async () => {
    try {
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
      <div className="place-panel__backdrop" onClick={onClose} />
      <div className="place-panel">
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
          {loading && <div className="place-panel__photo-skeleton skeleton" />}

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

          <div className="place-panel__section">
            <h4>About this place</h4>
            <p>{location.description}</p>
          </div>

          {location.tip && (
            <div className="place-panel__section">
              <h4>💡 Insider Tip</h4>
              <p className="place-panel__tip-text">{location.tip}</p>
            </div>
          )}

          {location.duration && (
            <div className="place-panel__section">
              <h4>⏱️ Suggested Duration</h4>
              <p>{location.duration}</p>
            </div>
          )}

          {loading && (
            <div className="place-panel__section">
              <div className="skeleton skeleton--text" style={{ width: '100%', marginBottom: 8 }} />
              <div className="skeleton skeleton--text" style={{ width: '90%', marginBottom: 6 }} />
              <div className="skeleton skeleton--text" style={{ width: '80%' }} />
            </div>
          )}

          {!loading && wiki?.summary && (
            <div className="place-panel__section">
              <h4>📖 Wikipedia</h4>
              <p className="place-panel__wiki-text">
                {wiki.summary.length > 400 ? wiki.summary.substring(0, 400) + '...' : wiki.summary}
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

          {location.lat && location.lng && (
            <div className="place-panel__section">
              <h4>📍 Coordinates</h4>
              <p className="place-panel__coords">
                {parseFloat(location.lat).toFixed(4)}, {parseFloat(location.lng).toFixed(4)}
              </p>
            </div>
          )}

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