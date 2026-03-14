const Groq = require('groq-sdk')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const STYLE_PROMPTS = {
  adventurous: 'Focus on adventure activities, hiking, extreme sports, offbeat hidden gems tourists rarely visit.',
  romantic: 'Focus on romantic spots, scenic viewpoints, candlelit dinner restaurants, sunset locations, couples experiences.',
  budget: 'Focus on free attractions, street food, local markets, budget restaurants under ₹300/meal, free entry monuments.',
  family: 'Focus on family-friendly attractions, kid-friendly restaurants, safe neighbourhoods, minimal walking, fun for all ages.',
  foodie: 'Focus heavily on iconic local restaurants, street food markets, food tours, famous chefs, must-try dishes.',
  cultural: 'Focus on museums, art galleries, local festivals, heritage sites, classical music venues, traditional crafts.',
  luxury: 'Focus on 5-star restaurants, rooftop bars, luxury spas, exclusive experiences, high-end shopping.',
  backpacker: 'Focus on hostels areas, backpacker cafes, cheap eats, free walking tours, local transport tips.'
}

const buildPrompt = (destination, days, style, mood) => {
  const styleInstructions = STYLE_PROMPTS[style] || ''
  const moodNote = mood ? `The overall trip mood/vibe should be: ${mood}.` : ''

  return `You are an expert travel planner and travel blogger who has personally visited ${destination}.
A traveler wants a COMPLETE, realistic day-by-day itinerary for ${days} day(s) in ${destination}.

Travel style preference: ${style || 'balanced'}. ${styleInstructions}
${moodNote}

IMPORTANT: You MUST respond with ONLY a valid JSON array. No explanation, no markdown, no code blocks. Just raw JSON.

Each item must follow EXACTLY this structure:
{
  "day": 1,
  "placeName": "Leopold Cafe",
  "description": "Start your morning at this legendary Mumbai institution. Leopold Cafe has been serving travelers since 1871 and is famous for its colonial ambiance, cold beer, and hearty breakfast. The walls tell stories of decades of travelers passing through.",
  "timeOfDay": "Morning",
  "category": "Food",
  "type": "breakfast",
  "duration": "45 mins",
  "tip": "Order the eggs benedict and a fresh lime soda. Arrive before 9am to get a window seat."
}

STRICT DAY STRUCTURE — every single day MUST follow this exact flow:
1. Morning — Breakfast spot (type: "breakfast")
2. Morning — First main attraction (type: "attraction")
3. Afternoon — Lunch restaurant (type: "lunch")
4. Afternoon — Second main attraction (type: "attraction")
5. Afternoon — Local experience or hidden gem (type: "experience")
6. Evening — Sunset spot or pre-dinner activity (type: "sunset")
7. Evening — Dinner restaurant (type: "dinner")
8. Evening — Nightlife/dessert/night walk (type: "nightlife")

That is EXACTLY 8 items per day. ${days} days = ${days * 8} total items.

Rules:
- timeOfDay must be exactly one of: "Morning", "Afternoon", "Evening"
- category must be exactly one of: "Historical", "Food", "Nature", "Culture", "Shopping", "Entertainment"
- placeName must be SHORT and searchable on Google Maps
- description must be 2-3 vivid sentences. Paint a picture. Make the traveler excited.
- duration must be realistic (e.g. "45 mins", "2 hours", "1.5 hours")
- tip must be a genuine insider tip a local would give
- Places must be geographically logical — same neighbourhood per half-day
- Each day should cover a different area of ${destination}
- Day 1 starts near city centre

Destination: ${destination}
Days: ${days}
Total items: ${days * 8}

Respond with ONLY the raw JSON array.`
}

const buildPackingPrompt = (destination, days, weather) => {
  return `You are a travel packing expert. Generate a practical packing list for a ${days}-day trip to ${destination}.
Current/expected weather: ${weather || 'moderate'}.

Respond with ONLY a valid JSON object in this exact format:
{
  "essentials": ["item1", "item2"],
  "clothing": ["item1", "item2"],
  "toiletries": ["item1", "item2"],
  "electronics": ["item1", "item2"],
  "documents": ["item1", "item2"],
  "tips": ["tip1", "tip2"]
}

Keep each list to 5-8 items. Be specific to ${destination} (e.g. if hot weather, mention sunscreen). No explanation, just JSON.`
}

const generateItinerary = async (destination, days, style, mood) => {
  // for longer trips we need more tokens
  const maxTokens = days <= 2 ? 3000 : days <= 4 ? 6000 : 8000

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: buildPrompt(destination, days, style, mood) }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.8,
    max_tokens: maxTokens,
  })

  const text = completion.choices[0]?.message?.content || ''
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()

  // try to fix truncated json - sometimes the model cuts off mid-array
  let jsonToParse = cleaned
  if (!cleaned.endsWith(']')) {
    // find the last complete object (ends with }) and close the array
    const lastBrace = cleaned.lastIndexOf('}')
    if (lastBrace > -1) {
      jsonToParse = cleaned.substring(0, lastBrace + 1) + ']'
      console.log('fixed truncated json - trimmed to last complete object')
    }
  }

  const parsed = JSON.parse(jsonToParse)
  if (!Array.isArray(parsed)) throw new Error('ai did not return an array')
  return parsed
}

const generatePackingList = async (destination, days, weather) => {
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: buildPackingPrompt(destination, days, weather) }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
    max_tokens: 1000,
  })

  const text = completion.choices[0]?.message?.content || ''
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
  return JSON.parse(cleaned)
}

module.exports = { generateItinerary, generatePackingList }