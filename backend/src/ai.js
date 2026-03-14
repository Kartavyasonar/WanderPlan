// ai stuff - switched from gemini to groq because gemini free tier is broken
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const buildPrompt = (destination, days) => {
  return `You are a travel itinerary expert. A user wants to visit ${destination} for ${days} day(s).

Your task is to generate a detailed day-by-day travel itinerary.

IMPORTANT: You MUST respond with ONLY a valid JSON array. No explanation, no markdown, no code blocks. Just the raw JSON array.

The JSON array must follow this exact structure:
[
  {
    "day": 1,
    "placeName": "Colosseum",
    "description": "The iconic ancient amphitheater, a must-see symbol of Rome's imperial past.",
    "timeOfDay": "Morning",
    "category": "Historical"
  }
]

Rules:
- Generate 3 to 4 places per day (so ${days * 3} to ${days * 4} total items)
- timeOfDay must be exactly one of: "Morning", "Afternoon", "Evening"
- category must be exactly one of: "Historical", "Food", "Nature", "Culture", "Shopping", "Entertainment"
- placeName must be a real, specific place in ${destination}. Use SHORT simple names that can be found on a map (e.g. "Senso-ji Temple" not "Asakusa Kannon Temple (Senso-ji)"). Avoid overly descriptive names, just the common name people use.
- description should be 1-2 sentences, engaging and informative
- Order the places logically by time of day within each day
- The destination is: ${destination}
- Total days: ${days}

Respond with ONLY the JSON array, nothing else.`;
};

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