// ai stuff - switched from gemini to groq because gemini free tier is broken
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const buildPrompt = (destination, days) => {
  return `You are an expert travel planner and travel blogger who has personally visited ${destination}. 
A traveler wants a COMPLETE, realistic day-by-day itinerary for ${days} day(s) in ${destination}.

IMPORTANT: You MUST respond with ONLY a valid JSON array. No explanation, no markdown, no code blocks. Just raw JSON.

Each item in the array must follow EXACTLY this structure:
{
  "day": 1,
  "placeName": "Cafe Coffee Day",
  "description": "Start your morning with a strong filter coffee and light breakfast at this beloved local cafe before heading out for the day.",
  "timeOfDay": "Morning",
  "category": "Food",
  "type": "breakfast",
  "duration": "45 mins",
  "tip": "Order the South Indian filter coffee, it's their specialty"
}

STRICT DAY STRUCTURE - every single day MUST follow this exact flow:
1. Morning - Breakfast spot (type: "breakfast") 
2. Morning - First main attraction (type: "attraction")
3. Afternoon - Lunch restaurant (type: "lunch")
4. Afternoon - Second main attraction (type: "attraction")
5. Afternoon - Third attraction or unique local experience (type: "experience")
6. Evening - Sunset spot or pre-dinner activity (type: "sunset")
7. Evening - Dinner restaurant (type: "dinner")
8. Evening - Nightlife/dessert/night walk (type: "nightlife")

That is EXACTLY 8 items per day. ${days} days = ${days * 8} total items.

Additional rules:
- timeOfDay must be exactly one of: "Morning", "Afternoon", "Evening"  
- category must be exactly one of: "Historical", "Food", "Nature", "Culture", "Shopping", "Entertainment"
- placeName must be SHORT and searchable on Google Maps (e.g. "Karim's Restaurant" not "Famous Mughal Restaurant near Jama Masjid")
- description must be 2-3 sentences. First sentence sets the scene. Second explains what to do/see. Third gives context or transition to next activity.
- duration must be realistic (e.g. "45 mins", "2 hours", "1.5 hours")
- tip must be a genuine insider tip a local would give (not generic advice)
- Places must be geographically logical - don't send people across the city back and forth
- Food spots must be real, well-known restaurants/cafes in ${destination}
- Mix of famous landmarks AND hidden gems
- Day 1 should start near the city center
- Each day should cover a different neighborhood/area of ${destination}

Destination: ${destination}
Total days: ${days}
Total items needed: ${days * 8}

Respond with ONLY the raw JSON array.`
}

const generateItinerary = async (destination, days) => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: buildPrompt(destination, days)
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 4000,
  });

  const text = completion.choices[0]?.message?.content || '';

  // strip markdown code blocks just in case
  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error('ai did not return an array');
  }

  return parsed;
};

module.exports = { generateItinerary };