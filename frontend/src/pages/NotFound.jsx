import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound__content">
        <div className="notfound__emoji">🗺️</div>
        <h1>You got lost!</h1>
        <p>This page doesn't exist. Maybe the map had a typo?</p>
        <Link to="/" className="notfound__btn">Take me home</Link>
      </div>
    </div>
  )
}