import './SkeletonLoader.css'

export default function SkeletonLoader() {
  return (
    <div className="skeleton-loader">
      <div className="skeleton-panel">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-card__top">
              <div className="skeleton skeleton--text" style={{ width: 80 }} />
              <div className="skeleton skeleton--text" style={{ width: 60 }} />
            </div>
            <div className="skeleton skeleton--text" style={{ width: '70%', marginTop: 8 }} />
            <div className="skeleton skeleton--text" style={{ width: '100%', marginTop: 6 }} />
            <div className="skeleton skeleton--text" style={{ width: '85%', marginTop: 4 }} />
          </div>
        ))}
      </div>
      <div className="skeleton-map">
        <div className="skeleton-map__inner">
          <div className="skeleton-map__spinner">🗺️</div>
          <p>Loading map...</p>
        </div>
      </div>
    </div>
  )
}