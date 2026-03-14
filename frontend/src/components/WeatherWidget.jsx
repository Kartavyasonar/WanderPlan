// weather widget - uses open-meteo api, totally free, no key needed
import { useState, useEffect } from 'react'
import './WeatherWidget.css'

const getWeatherEmoji = (code) => {
  if (code === 0) return '☀️'
  if (code <= 2) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '🌨️'
  if (code <= 82) return '🌦️'
  return '⛈️'
}

export default function WeatherWidget({ destination }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeather()
  }, [destination])

  const fetchWeather = async () => {
    try {
      // first geocode the destination to get coordinates
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'WanderPlan-App/1.0' } }
      )
      const geoData = await geoRes.json()

      if (geoData.length === 0) {
        setLoading(false)
        return
      }

      const { lat, lon } = geoData[0]

      // then get weather from open-meteo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
      )
      const weatherData = await weatherRes.json()

      setWeather({
        temp: Math.round(weatherData.current.temperature_2m),
        code: weatherData.current.weather_code,
        unit: weatherData.current_units?.temperature_2m || '°C'
      })
    } catch (err) {
      // weather is not critical, fail silently
      console.log('weather fetch failed:', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="weather-widget weather-widget--loading">
        <div className="skeleton skeleton--text" style={{ width: 100 }} />
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="weather-widget">
      <span className="weather-widget__emoji">{getWeatherEmoji(weather.code)}</span>
      <div className="weather-widget__info">
        <span className="weather-widget__temp">{weather.temp}{weather.unit}</span>
        <span className="weather-widget__label">in {destination}</span>
      </div>
    </div>
  )
}