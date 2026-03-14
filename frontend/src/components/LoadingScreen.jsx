import './LoadingScreen.css'

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-screen__content">
        <div className="loading-screen__compass">
          <img src="/compass.svg" alt="loading" width="60" height="60" />
        </div>
        <h2>Loading your itinerary...</h2>
        <p>Fetching all your travel spots</p>
      </div>
    </div>
  )
}