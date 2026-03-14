// rough cost estimate widget
// these are ballpark numbers based on typical travel costs
// not financial advice lol
import './CostEstimate.css'

// rough daily hotel cost by region (USD)
const getHotelCost = (destination) => {
  const dest = destination.toLowerCase()
  if (['tokyo', 'paris', 'london', 'new york', 'sydney', 'zurich', 'singapore'].some(c => dest.includes(c))) return 120
  if (['dubai', 'amsterdam', 'barcelona', 'rome', 'berlin', 'seoul'].some(c => dest.includes(c))) return 90
  if (['bangkok', 'bali', 'delhi', 'mumbai', 'cairo', 'istanbul'].some(c => dest.includes(c))) return 40
  return 70 // default
}

// rough flight cost from India (since user is from India)
const getFlightCost = (destination) => {
  const dest = destination.toLowerCase()
  if (['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'india'].some(c => dest.includes(c))) return 30
  if (['bangkok', 'bali', 'kuala lumpur', 'singapore', 'dubai', 'colombo'].some(c => dest.includes(c))) return 200
  if (['london', 'paris', 'rome', 'berlin', 'amsterdam', 'europe'].some(c => dest.includes(c))) return 500
  if (['new york', 'los angeles', 'chicago', 'usa', 'canada'].some(c => dest.includes(c))) return 700
  if (['tokyo', 'seoul', 'beijing', 'japan', 'korea', 'china'].some(c => dest.includes(c))) return 400
  if (['sydney', 'australia', 'new zealand'].some(c => dest.includes(c))) return 600
  return 350 // default
}

export default function CostEstimate({ destination, days }) {
  const hotelPerNight = getHotelCost(destination)
  const flightCost = getFlightCost(destination)
  const foodPerDay = Math.round(hotelPerNight * 0.4)
  const activitiesPerDay = Math.round(hotelPerNight * 0.3)

  const totalHotel = hotelPerNight * days
  const totalFood = foodPerDay * days
  const totalActivities = activitiesPerDay * days
  const totalEstimate = flightCost + totalHotel + totalFood + totalActivities

  return (
    <div className="cost-estimate">
      <span className="cost-estimate__icon">💰</span>
      <div className="cost-estimate__info">
        <span className="cost-estimate__total">~${totalEstimate.toLocaleString()}</span>
        <span className="cost-estimate__label">est. trip cost</span>
      </div>
      <div className="cost-estimate__breakdown">
        <span>✈️ ${flightCost}</span>
        <span>🏨 ${totalHotel}</span>
        <span>🍽️ ${totalFood}</span>
      </div>
    </div>
  )
}