// cost estimate widget - click to set your origin city
// shows INR or local currency based on origin
import { useState } from 'react'
import './CostEstimate.css'

// ── REGION DETECTION ──
const getRegion = (city) => {
  const c = city.toLowerCase()
  if (['delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata',
       'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'goa', 'kochi',
       'surat', 'lucknow', 'nagpur', 'indore', 'bhopal', 'patna',
       'india'].some(x => c.includes(x))) return 'india'

  if (['london', 'manchester', 'birmingham', 'glasgow', 'edinburgh',
       'uk', 'england', 'britain', 'scotland', 'wales'].some(x => c.includes(x))) return 'uk'

  if (['paris', 'marseille', 'lyon', 'france'].some(x => c.includes(x))) return 'france'
  if (['berlin', 'munich', 'hamburg', 'frankfurt', 'germany'].some(x => c.includes(x))) return 'germany'
  if (['rome', 'milan', 'naples', 'italy'].some(x => c.includes(x))) return 'italy'
  if (['madrid', 'barcelona', 'seville', 'spain'].some(x => c.includes(x))) return 'spain'
  if (['amsterdam', 'rotterdam', 'netherlands', 'holland'].some(x => c.includes(x))) return 'netherlands'
  if (['zurich', 'geneva', 'bern', 'switzerland'].some(x => c.includes(x))) return 'switzerland'
  if (['stockholm', 'gothenburg', 'sweden'].some(x => c.includes(x))) return 'sweden'
  if (['oslo', 'bergen', 'norway'].some(x => c.includes(x))) return 'norway'
  if (['copenhagen', 'denmark'].some(x => c.includes(x))) return 'denmark'
  if (['helsinki', 'finland'].some(x => c.includes(x))) return 'finland'
  if (['vienna', 'austria'].some(x => c.includes(x))) return 'austria'
  if (['brussels', 'belgium'].some(x => c.includes(x))) return 'belgium'
  if (['lisbon', 'porto', 'portugal'].some(x => c.includes(x))) return 'portugal'
  if (['warsaw', 'krakow', 'poland'].some(x => c.includes(x))) return 'poland'
  if (['prague', 'czech', 'czechia'].some(x => c.includes(x))) return 'czech'
  if (['budapest', 'hungary'].some(x => c.includes(x))) return 'hungary'
  if (['bucharest', 'romania'].some(x => c.includes(x))) return 'romania'
  if (['athens', 'greece'].some(x => c.includes(x))) return 'greece'

  if (['new york', 'los angeles', 'chicago', 'houston', 'phoenix',
       'san francisco', 'seattle', 'boston', 'miami', 'dallas',
       'usa', 'united states', 'america'].some(x => c.includes(x))) return 'usa'
  if (['toronto', 'vancouver', 'montreal', 'calgary', 'canada'].some(x => c.includes(x))) return 'canada'

  if (['sydney', 'melbourne', 'brisbane', 'perth', 'australia'].some(x => c.includes(x))) return 'australia'
  if (['auckland', 'wellington', 'new zealand'].some(x => c.includes(x))) return 'newzealand'

  if (['tokyo', 'osaka', 'kyoto', 'hiroshima', 'japan'].some(x => c.includes(x))) return 'japan'
  if (['seoul', 'busan', 'korea'].some(x => c.includes(x))) return 'korea'
  if (['beijing', 'shanghai', 'guangzhou', 'shenzhen', 'china'].some(x => c.includes(x))) return 'china'
  if (['singapore'].some(x => c.includes(x))) return 'singapore'
  if (['bangkok', 'phuket', 'chiang mai', 'thailand'].some(x => c.includes(x))) return 'thailand'
  if (['bali', 'jakarta', 'indonesia'].some(x => c.includes(x))) return 'indonesia'
  if (['kuala lumpur', 'malaysia'].some(x => c.includes(x))) return 'malaysia'
  if (['ho chi minh', 'hanoi', 'vietnam'].some(x => c.includes(x))) return 'vietnam'
  if (['manila', 'philippines'].some(x => c.includes(x))) return 'philippines'

  if (['dubai', 'abu dhabi', 'uae', 'emirates'].some(x => c.includes(x))) return 'uae'
  if (['doha', 'qatar'].some(x => c.includes(x))) return 'qatar'
  if (['riyadh', 'jeddah', 'saudi'].some(x => c.includes(x))) return 'saudi'
  if (['muscat', 'oman'].some(x => c.includes(x))) return 'oman'
  if (['kuwait'].some(x => c.includes(x))) return 'kuwait'
  if (['bahrain'].some(x => c.includes(x))) return 'bahrain'
  if (['tel aviv', 'jerusalem', 'israel'].some(x => c.includes(x))) return 'israel'
  if (['istanbul', 'ankara', 'turkey'].some(x => c.includes(x))) return 'turkey'

  if (['cairo', 'egypt'].some(x => c.includes(x))) return 'egypt'
  if (['nairobi', 'kenya'].some(x => c.includes(x))) return 'kenya'
  if (['johannesburg', 'cape town', 'south africa'].some(x => c.includes(x))) return 'southafrica'
  if (['lagos', 'abuja', 'nigeria'].some(x => c.includes(x))) return 'nigeria'
  if (['accra', 'ghana'].some(x => c.includes(x))) return 'ghana'
  if (['addis ababa', 'ethiopia'].some(x => c.includes(x))) return 'ethiopia'
  if (['casablanca', 'morocco'].some(x => c.includes(x))) return 'morocco'

  if (['sao paulo', 'rio', 'brazil'].some(x => c.includes(x))) return 'brazil'
  if (['buenos aires', 'argentina'].some(x => c.includes(x))) return 'argentina'
  if (['bogota', 'colombia'].some(x => c.includes(x))) return 'colombia'
  if (['lima', 'peru'].some(x => c.includes(x))) return 'peru'
  if (['mexico city', 'cancun', 'mexico'].some(x => c.includes(x))) return 'mexico'

  if (['colombo', 'sri lanka'].some(x => c.includes(x))) return 'srilanka'
  if (['kathmandu', 'nepal'].some(x => c.includes(x))) return 'nepal'
  if (['dhaka', 'bangladesh'].some(x => c.includes(x))) return 'bangladesh'
  if (['islamabad', 'karachi', 'lahore', 'pakistan'].some(x => c.includes(x))) return 'pakistan'

  if (['male', 'maldives'].some(x => c.includes(x))) return 'maldives'
  if (['moscow', 'st. petersburg', 'russia'].some(x => c.includes(x))) return 'russia'

  return 'other'
}

// ── FLIGHT COST TABLE (USD) ──
// [origin_region][destination_region] = cost in USD
const FLIGHT_COSTS = {
  india: {
    india: 60, srilanka: 150, nepal: 120, bangladesh: 100, pakistan: 140, maldives: 250,
    uae: 200, qatar: 220, saudi: 240, oman: 200, kuwait: 230, bahrain: 210,
    thailand: 220, singapore: 250, malaysia: 230, indonesia: 280, vietnam: 260, philippines: 300,
    japan: 420, korea: 380, china: 350,
    uk: 580, france: 560, germany: 570, italy: 550, spain: 560, netherlands: 575,
    switzerland: 600, sweden: 600, norway: 620, denmark: 610, finland: 610,
    austria: 580, belgium: 575, portugal: 570, poland: 550, czech: 555,
    hungary: 550, romania: 540, greece: 530, turkey: 350, israel: 380, egypt: 320,
    usa: 780, canada: 800, mexico: 850,
    australia: 680, newzealand: 750,
    brazil: 950, argentina: 1000, colombia: 920, peru: 980,
    kenya: 450, southafrica: 520, nigeria: 480, egypt: 320, ethiopia: 380, morocco: 420, ghana: 500,
    russia: 400, other: 450
  },
  uk: {
    uk: 80, france: 100, germany: 110, italy: 120, spain: 110, netherlands: 90,
    switzerland: 130, sweden: 140, norway: 150, denmark: 140, finland: 150,
    austria: 130, belgium: 90, portugal: 110, poland: 120, czech: 120,
    hungary: 130, romania: 130, greece: 130, turkey: 120, israel: 160,
    uae: 280, qatar: 270, saudi: 290, egypt: 180, morocco: 130,
    india: 560, srilanka: 600, nepal: 620, maldives: 580, thailand: 550, singapore: 570,
    indonesia: 600, japan: 650, korea: 680, china: 580,
    usa: 450, canada: 480, australia: 700, newzealand: 800,
    kenya: 400, southafrica: 500, nigeria: 420,
    brazil: 600, other: 400
  },
  usa: {
    usa: 150, canada: 200, mexico: 250,
    uk: 450, france: 500, germany: 490, italy: 500, spain: 490, netherlands: 480,
    switzerland: 520, sweden: 530, norway: 550, denmark: 540,
    greece: 520, turkey: 580, israel: 550,
    uae: 700, qatar: 680, saudi: 720, india: 780, japan: 650, korea: 700,
    china: 680, singapore: 750, thailand: 720, australia: 800, newzealand: 900,
    brazil: 500, argentina: 550, colombia: 350, peru: 450, mexico: 250,
    kenya: 800, southafrica: 900, egypt: 700, morocco: 600,
    other: 550
  },
  uae: {
    uae: 80, qatar: 120, saudi: 150, oman: 130, kuwait: 110, bahrain: 100,
    india: 200, srilanka: 230, nepal: 250, maldives: 280, pakistan: 180, bangladesh: 220,
    uk: 280, france: 270, germany: 280, italy: 260, spain: 270, netherlands: 275,
    usa: 700, canada: 750, australia: 650, japan: 550, korea: 580, china: 480,
    thailand: 300, singapore: 350, indonesia: 380, malaysia: 360,
    egypt: 180, kenya: 350, southafrica: 500, morocco: 280, turkey: 200, israel: 200,
    russia: 300, other: 350
  },
  australia: {
    australia: 120, newzealand: 180, singapore: 300, indonesia: 250, malaysia: 300,
    thailand: 350, philippines: 300, japan: 400, korea: 420, china: 380,
    india: 680, srilanka: 700, maldives: 750, uae: 650, uk: 700, usa: 800,
    france: 720, germany: 730, italy: 720, other: 500
  },
  japan: {
    japan: 80, korea: 150, china: 200, taiwan: 180, singapore: 300, thailand: 280,
    indonesia: 320, philippines: 250, india: 420, uae: 550, australia: 400,
    uk: 650, france: 660, germany: 660, usa: 650, canada: 680, other: 450
  },
  singapore: {
    singapore: 80, malaysia: 100, indonesia: 120, thailand: 150, vietnam: 150,
    philippines: 180, japan: 300, korea: 320, china: 250, india: 250,
    uae: 350, australia: 380, uk: 570, usa: 750, other: 350
  },
  brazil: {
    brazil: 120, argentina: 200, colombia: 250, peru: 280, mexico: 400,
    usa: 500, canada: 580, uk: 600, france: 620, germany: 640,
    portugal: 580, spain: 590, other: 500
  },
  southafrica: {
    southafrica: 100, kenya: 300, nigeria: 350, ethiopia: 280, egypt: 350, ghana: 380,
    uk: 500, france: 520, germany: 530, netherlands: 510,
    uae: 400, india: 520, usa: 900, other: 500
  },
  other: {
    other: 300, india: 400, uk: 400, usa: 500, uae: 350, australia: 500
  }
}

// get flight cost with fallback
const getFlightCost = (originCity, destinationCity) => {
  const originRegion = getRegion(originCity || 'india')
  const destRegion = getRegion(destinationCity)

  // same region = much cheaper or free (domestic)
  if (originRegion === destRegion) {
    const domesticCosts = { india: 60, usa: 150, uk: 80, australia: 120, uae: 80, japan: 80, singapore: 80, brazil: 120 }
    return domesticCosts[originRegion] || 100
  }

  const table = FLIGHT_COSTS[originRegion] || FLIGHT_COSTS.other
  return table[destRegion] || table.other || 400
}

// hotel cost per night USD
const getHotelCost = (destination) => {
  const d = destination.toLowerCase()
  if (['zurich', 'geneva', 'switzerland', 'oslo', 'norway', 'copenhagen', 'denmark',
       'singapore', 'new york', 'san francisco', 'london', 'paris', 'tokyo',
       'sydney', 'melbourne', 'reykjavik'].some(c => d.includes(c))) return 150
  if (['stockholm', 'amsterdam', 'vienna', 'dubai', 'hong kong', 'seoul',
       'berlin', 'rome', 'barcelona', 'madrid', 'los angeles', 'chicago',
       'toronto', 'melbourne', 'osaka'].some(c => d.includes(c))) return 110
  if (['prague', 'budapest', 'lisbon', 'athens', 'istanbul', 'tel aviv',
       'buenos aires', 'maldives', 'mauritius', 'kuala lumpur', 'bangkok',
       'mexico city', 'sao paulo', 'cape town', 'nairobi'].some(c => d.includes(c))) return 75
  if (['delhi', 'mumbai', 'bangalore', 'goa', 'jaipur', 'kolkata', 'hyderabad',
       'bali', 'colombo', 'kathmandu', 'cairo', 'casablanca', 'ho chi minh',
       'hanoi', 'manila', 'jakarta', 'dhaka', 'islamabad', 'karachi'].some(c => d.includes(c))) return 45
  return 80 // default
}

// currency config per origin region
const CURRENCY = {
  india:       { symbol: '₹', rate: 84,   name: 'INR' },
  uk:          { symbol: '£', rate: 0.79, name: 'GBP' },
  france:      { symbol: '€', rate: 0.92, name: 'EUR' },
  germany:     { symbol: '€', rate: 0.92, name: 'EUR' },
  italy:       { symbol: '€', rate: 0.92, name: 'EUR' },
  spain:       { symbol: '€', rate: 0.92, name: 'EUR' },
  netherlands: { symbol: '€', rate: 0.92, name: 'EUR' },
  switzerland: { symbol: 'CHF', rate: 0.88, name: 'CHF' },
  sweden:      { symbol: 'kr', rate: 10.3, name: 'SEK' },
  norway:      { symbol: 'kr', rate: 10.6, name: 'NOK' },
  denmark:     { symbol: 'kr', rate: 6.9,  name: 'DKK' },
  austria:     { symbol: '€', rate: 0.92, name: 'EUR' },
  belgium:     { symbol: '€', rate: 0.92, name: 'EUR' },
  portugal:    { symbol: '€', rate: 0.92, name: 'EUR' },
  poland:      { symbol: 'zł', rate: 3.9, name: 'PLN' },
  czech:       { symbol: 'Kč', rate: 23,  name: 'CZK' },
  hungary:     { symbol: 'Ft', rate: 360, name: 'HUF' },
  romania:     { symbol: 'lei', rate: 4.6, name: 'RON' },
  greece:      { symbol: '€', rate: 0.92, name: 'EUR' },
  usa:         { symbol: '$', rate: 1,    name: 'USD' },
  canada:      { symbol: 'C$', rate: 1.36, name: 'CAD' },
  australia:   { symbol: 'A$', rate: 1.53, name: 'AUD' },
  newzealand:  { symbol: 'NZ$', rate: 1.63, name: 'NZD' },
  japan:       { symbol: '¥', rate: 150,  name: 'JPY' },
  korea:       { symbol: '₩', rate: 1330, name: 'KRW' },
  china:       { symbol: '¥', rate: 7.2,  name: 'CNY' },
  singapore:   { symbol: 'S$', rate: 1.34, name: 'SGD' },
  uae:         { symbol: 'AED', rate: 3.67, name: 'AED' },
  qatar:       { symbol: 'QAR', rate: 3.64, name: 'QAR' },
  saudi:       { symbol: 'SAR', rate: 3.75, name: 'SAR' },
  turkey:      { symbol: '₺', rate: 32,   name: 'TRY' },
  brazil:      { symbol: 'R$', rate: 5.0,  name: 'BRL' },
  southafrica: { symbol: 'R', rate: 18.5,  name: 'ZAR' },
  other:       { symbol: '$', rate: 1,    name: 'USD' },
}

const getCurrency = (originCity) => {
  const region = getRegion(originCity || 'india')
  return CURRENCY[region] || CURRENCY.other
}

const formatAmount = (usd, currency) => {
  const amount = Math.round(usd * currency.rate)
  if (amount >= 100000) return `${currency.symbol}${(amount/100000).toFixed(1)}L`
  if (amount >= 1000) {
    if (['₹','₩','¥','Ft','Kč'].includes(currency.symbol)) {
      return `${currency.symbol}${amount.toLocaleString()}`
    }
    return `${currency.symbol}${(amount/1000).toFixed(1)}k`
  }
  return `${currency.symbol}${amount}`
}

export default function CostEstimate({ destination, days }) {
  const [origin, setOrigin] = useState('India')
  const [inputVal, setInputVal] = useState('')
  const [showInput, setShowInput] = useState(false)

  const currency = getCurrency(origin)
  const flightUSD = getFlightCost(origin, destination)
  const hotelUSD = getHotelCost(destination)
  const foodUSD = Math.round(hotelUSD * 0.4)
  const activitiesUSD = Math.round(hotelUSD * 0.25)
  const totalHotelUSD = hotelUSD * days
  const totalFoodUSD = foodUSD * days
  const totalActUSD = activitiesUSD * days
  const totalUSD = flightUSD + totalHotelUSD + totalFoodUSD + totalActUSD

  const handleSetOrigin = (e) => {
    e.preventDefault()
    if (inputVal.trim()) { setOrigin(inputVal.trim()); setShowInput(false) }
  }

  if (showInput) {
    return (
      <div className="cost-estimate cost-estimate--input">
        <form onSubmit={handleSetOrigin} className="cost-estimate__form">
          <input
            type="text"
            placeholder="Your city (e.g. London, Tokyo…)"
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
    <div className="cost-estimate" onClick={() => setShowInput(true)} title="Click to change your origin city">
      <span className="cost-estimate__icon">💰</span>
      <div className="cost-estimate__info">
        <span className="cost-estimate__total">{formatAmount(totalUSD, currency)}</span>
        <span className="cost-estimate__label">from {origin} · tap to change</span>
      </div>
      <div className="cost-estimate__breakdown">
        <span title="Return flights">✈️ {formatAmount(flightUSD, currency)}</span>
        <span title={`Hotel ${days} nights`}>🏨 {formatAmount(totalHotelUSD, currency)}</span>
        <span title="Food">🍽️ {formatAmount(totalFoodUSD, currency)}</span>
      </div>
    </div>
  )
}