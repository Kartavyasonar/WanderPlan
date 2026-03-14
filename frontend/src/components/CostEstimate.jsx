// cost estimate widget - asks for user's origin city and shows cost in INR
import { useState } from 'react'
import './CostEstimate.css'

const USD_TO_INR = 84 // rough conversion rate

// rough flight costs in USD from major Indian cities
const getFlightCost = (origin, destination) => {
  const dest = destination.toLowerCase()
  const orig = origin.toLowerCase()

  // domestic india flights
  const indiaCities = ['delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'goa']
  if (indiaCities.some(c => dest.includes(c))) return 50 // domestic

  // nearby destinations from india
  if (['bangkok', 'bali', 'kuala lumpur', 'singapore', 'colombo', 'kathmandu', 'dhaka'].some(c => dest.includes(c))) return 250
  if (['dubai', 'abu dhabi', 'doha', 'muscat', 'riyadh'].some(c => dest.includes(c))) return 300
  if (['london', 'paris', 'rome', 'berlin', 'amsterdam', 'madrid', 'europe'].some(c => dest.includes(c))) return 600
  if (['new york', 'los angeles', 'chicago', 'toronto', 'usa', 'canada'].some(c => dest.includes(c))) return 800
  if (['tokyo', 'osaka', 'seoul', 'beijing', 'shanghai', 'japan', 'korea', 'china'].some(c => dest.includes(c))) return 450
  if (['sydney', 'melbourne', 'australia', 'new zealand'].some(c => dest.includes(c))) return 700
  if (['maldives', 'mauritius', 'seychelles'].some(c => dest.includes(c))) return 300
  if (['cairo', 'nairobi', 'africa'].some(c => dest.includes(c))) return 500
  return 400 // default international
}

const getHotelCost = (destination) => {
  const dest = destination.toLowerCase()
  if (['tokyo', 'paris', 'london', 'new york', 'sydney', 'zurich', 'singapore'].some(c => dest.includes(c))) return 120
  if (['dubai', 'amsterdam', 'barcelona', 'rome', 'berlin', 'seoul'].some(c => dest.includes(c))) return 90
  if (['bangkok', 'bali', 'delhi', 'mumbai', 'cairo', 'istanbul'].some(c => dest.includes(c))) return 40
  if (['maldives', 'seychelles', 'mauritius'].some(c => dest.includes(c))) return 200
  return 70
}

export default function CostEstimate({ destination, days }) {
  const [origin, setOrigin] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [showInput, setShowInput] = useState(false)

  const hotelPerNight = getHotelCost(destination)
  const flightCost = getFlightCost(origin || 'india', destination)
  const foodPerDay = Math.round(hotelPerNight * 0.4)
  const activitiesPerDay = Math.round(hotelPerNight * 0.3)

  const totalUSD = flightCost + (hotelPerNight * days) + (foodPerDay * days) + (activitiesPerDay * days)
  const totalINR = Math.round(totalUSD * USD_TO_INR)

  const handleSetOrigin = (e) => {
    e.preventDefault()
    if (inputVal.trim()) {
      setOrigin(inputVal.trim())
      setShowInput(false)
    }
  }

  if (showInput) {
    return (
      <div className="cost-estimate cost-estimate--input">
        <form onSubmit={handleSetOrigin} className="cost-estimate__form">
          <input
            type="text"
            placeholder="Your city (e.g. Delhi)"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            className="cost-estimate__input"
            autoFocus
          />
          <button type="submit" className="cost-estimate__confirm">✓</button>
          <button type="button" className="cost-estimate__cancel" onClick={() => setShowInput(false)}>✕</button>
        </form>
      </div>
    )
  }

  return (
    <div className="cost-estimate" onClick={() => setShowInput(true)} title="Click to set your origin city">
      <span className="cost-estimate__icon">💰</span>
      <div className="cost-estimate__info">
        <span className="cost-estimate__total">₹{totalINR.toLocaleString('en-IN')}</span>
        <span className="cost-estimate__label">
          est. from {origin || 'India'} · click to change
        </span>
      </div>
      <div className="cost-estimate__breakdown">
        <span title="Flights">✈️ ₹{Math.round(flightCost * USD_TO_INR).toLocaleString('en-IN')}</span>
        <span title="Hotel">🏨 ₹{Math.round(hotelPerNight * days * USD_TO_INR).toLocaleString('en-IN')}</span>
        <span title="Food">🍽️ ₹{Math.round(foodPerDay * days * USD_TO_INR).toLocaleString('en-IN')}</span>
      </div>
    </div>
  )
}