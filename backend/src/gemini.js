// ai stuff here - calls gemini and gets back a json itinerary
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
- placeName must be a real, specific place with an exact address in ${destination}
- description should be 1-2 sentences, engaging and informative
- Order the places logically by time of day within each day
- Make sure places are geographically sensible
- The destination is: ${destination}
- Total days: ${days}

Remember: respond with ONLY the JSON array, nothing else.`;
};

const generateItinerary = async (destination, days) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = buildPrompt(destination, days);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // gemini sometimes wraps in markdown code blocks even when told not to
  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error('gemini did not return an array');
  }

  return parsed;
};

module.exports = { generateItinerary };