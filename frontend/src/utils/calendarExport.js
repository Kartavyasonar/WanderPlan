// generates an .ics file for Google/Apple calendar
// pure javascript, no library needed

const pad = (n) => String(n).padStart(2, '0')

const formatICSDate = (date, hour) => {
  const d = new Date(date)
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(hour)}0000`
}

const TIME_HOURS = {
  Morning: 9,
  Afternoon: 13,
  Evening: 19,
}

export const generateICS = (trip, locations) => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WanderPlan//AI Travel Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${trip.destination} - WanderPlan`,
  ]

  // use today as base date since we don't store actual travel dates
  const baseDate = new Date()

  locations.forEach((loc, i) => {
    const dayOffset = (loc.day - 1)
    const eventDate = new Date(baseDate)
    eventDate.setDate(eventDate.getDate() + dayOffset)

    const startHour = TIME_HOURS[loc.time_of_day] || 10
    const endHour = startHour + 1

    const uid = `wanderplan-${trip.id}-${loc.id}@wanderplan.app`
    const dtstart = formatICSDate(eventDate, startHour)
    const dtend = formatICSDate(eventDate, endHour)
    const summary = `${loc.place_name} (Day ${loc.day})`
    const description = loc.description?.replace(/\n/g, '\\n') || ''
    const location = loc.lat && loc.lng ? `${loc.lat},${loc.lng}` : loc.place_name

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `CATEGORIES:${loc.category || 'Travel'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    )
  })

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export const downloadICS = (content, filename) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}