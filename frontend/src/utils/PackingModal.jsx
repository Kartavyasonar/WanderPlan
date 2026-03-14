import { useState, useEffect } from 'react'
import './PackingModal.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const SECTIONS = [
  { key: 'essentials', label: '⭐ Essentials' },
  { key: 'clothing', label: '👕 Clothing' },
  { key: 'toiletries', label: '🧴 Toiletries' },
  { key: 'electronics', label: '📱 Electronics' },
  { key: 'documents', label: '📄 Documents' },
  { key: 'tips', label: '💡 Travel Tips' },
]

export default function PackingModal({ tripId, destination, onClose }) {
  const [packingList, setPackingList] = useState(null)
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState('moderate')
  const [checked, setChecked] = useState({})

  useEffect(() => {
    generateList()
  }, [])

  const generateList = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/trips/${tripId}/packing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather })
      })
      const data = await res.json()
      if (data.packingList) {
        setPackingList(data.packingList)
        // load saved checkmarks
        const saved = localStorage.getItem(`wanderplan-packing-${tripId}`)
        if (saved) setChecked(JSON.parse(saved))
      }
    } catch (err) {
      console.log('packing list error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = (key, index) => {
    const itemKey = `${key}-${index}`
    const updated = { ...checked, [itemKey]: !checked[itemKey] }
    setChecked(updated)
    localStorage.setItem(`wanderplan-packing-${tripId}`, JSON.stringify(updated))
  }

  const totalItems = packingList
    ? Object.values(packingList).flat().length
    : 0
  const checkedCount = Object.values(checked).filter(Boolean).length

  return (
    <>
      <div className="packing-backdrop" onClick={onClose} />
      <div className="packing-modal">
        <div className="packing-modal__header">
          <div>
            <h2>🧳 Packing List</h2>
            <p>{destination} · AI generated</p>
          </div>
          <button className="packing-modal__close" onClick={onClose}>✕</button>
        </div>

        {!loading && packingList && (
          <div className="packing-modal__progress">
            <div className="packing-modal__progress-bar">
              <div
                className="packing-modal__progress-fill"
                style={{ width: `${Math.round((checkedCount / totalItems) * 100)}%` }}
              />
            </div>
            <span>{checkedCount}/{totalItems} packed</span>
          </div>
        )}

        <div className="packing-modal__weather">
          <label>Weather at destination:</label>
          <div className="packing-modal__weather-btns">
            {['cold', 'moderate', 'hot', 'rainy'].map(w => (
              <button
                key={w}
                className={`packing-modal__weather-btn ${weather === w ? 'active' : ''}`}
                onClick={() => { setWeather(w); generateList() }}
              >
                {w === 'cold' ? '🥶' : w === 'moderate' ? '🌤️' : w === 'hot' ? '☀️' : '🌧️'} {w}
              </button>
            ))}
          </div>
        </div>

        <div className="packing-modal__body">
          {loading && (
            <div className="packing-modal__loading">
              <div className="landing__spinner" style={{ borderTopColor: 'var(--forest)', borderColor: 'var(--sand-dark)', width: 24, height: 24 }} />
              <p>AI is building your packing list...</p>
            </div>
          )}

          {!loading && packingList && SECTIONS.map(({ key, label }) => (
            packingList[key]?.length > 0 && (
              <div key={key} className="packing-section">
                <h4>{label}</h4>
                <ul>
                  {packingList[key].map((item, i) => {
                    const itemKey = `${key}-${i}`
                    return (
                      <li
                        key={i}
                        className={checked[itemKey] ? 'checked' : ''}
                        onClick={() => toggleItem(key, i)}
                      >
                        <span className="packing-checkbox">
                          {checked[itemKey] ? '✓' : ''}
                        </span>
                        {item}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          ))}
        </div>
      </div>
    </>
  )
}