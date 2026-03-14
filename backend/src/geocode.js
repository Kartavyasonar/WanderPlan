// geocoding - uses nominatim (openstreetmap) which is totally free
// nominatim has a rate limit of 1 request per second so we need to delay

const geocodePlace = async (placeName, cityContext) => {
  const query = encodeURIComponent(`${placeName}, ${cityContext}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: {
      // nominatim requires a user-agent header, they get mad without it
      'User-Agent': 'WanderPlan-App/1.0 (travel itinerary planner)'
    }
  });

  if (!response.ok) {
    console.log(`nominatim request failed for: ${placeName}`);
    return null;
  }

  const data = await response.json();

  if (data.length === 0) {
    console.log(`no geocoding results for: ${placeName}`);
    return null;
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const geocodeItinerary = async (itinerary, destination) => {
  const results = [];

  for (const item of itinerary) {
    // wait 1.1 seconds between each request (nominatim limit is 1/sec)
    await sleep(1100);
    const coords = await geocodePlace(item.placeName, destination);
    results.push({
      ...item,
      lat: coords ? coords.lat : null,
      lng: coords ? coords.lng : null
    });
  }

  return results;
};

module.exports = { geocodeItinerary };