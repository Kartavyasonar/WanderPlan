// voice narration using browser's built-in Web Speech API
// works in chrome, firefox, safari - totally free, no api key

let currentUtterance = null

export const speakTrip = (locations, destination, onEnd) => {
  if (!window.speechSynthesis) {
    alert('Your browser does not support voice narration. Try Chrome!')
    return
  }

  stopSpeaking()

  // build the narration script
  const intro = `Welcome to your WanderPlan itinerary for ${destination}. `
  const places = locations.slice(0, 6).map((loc, i) => {
    return `Stop ${i + 1}: ${loc.place_name}. ${loc.description} ${loc.tip ? `Insider tip: ${loc.tip}` : ''}`
  }).join('. Next, ')

  const outro = `That's your WanderPlan itinerary. Have an amazing trip to ${destination}!`
  const fullScript = intro + places + '. ' + outro

  currentUtterance = new SpeechSynthesisUtterance(fullScript)
  currentUtterance.rate = 0.9  // slightly slower for travel narration
  currentUtterance.pitch = 1
  currentUtterance.volume = 1

  // prefer a nice voice if available
  const voices = window.speechSynthesis.getVoices()
  const preferredVoice = voices.find(v =>
    v.name.includes('Google') ||
    v.name.includes('Samantha') ||
    v.name.includes('Daniel')
  )
  if (preferredVoice) currentUtterance.voice = preferredVoice

  currentUtterance.onend = onEnd
  currentUtterance.onerror = onEnd

  window.speechSynthesis.speak(currentUtterance)
}

export const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  currentUtterance = null
}