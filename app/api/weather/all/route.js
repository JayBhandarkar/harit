const WEATHER_KEY = process.env.WEATHER_API_KEY;

const PARKS = [
  { name: 'Lodhi Garden',     lat: 28.5931, lng: 77.2197 },
  { name: 'Nehru Park',       lat: 28.5987, lng: 77.1882 },
  { name: 'Sunder Nursery',   lat: 28.5921, lng: 77.2432 },
  { name: 'Deer Park',        lat: 28.5535, lng: 77.2006 },
  { name: 'Talkatora Garden', lat: 28.6241, lng: 77.2008 },
];

// Static fallback data for Delhi in case API fails
const FALLBACK = [
  { name: 'Lodhi Garden',     temp: 32, feels_like: 35, humidity: 55, wind_speed: 14, description: 'partly cloudy', icon: '02d', visibility: 8,  pressure: 1008, clouds: 35, uvi: 6.2 },
  { name: 'Nehru Park',       temp: 33, feels_like: 36, humidity: 58, wind_speed: 11, description: 'clear sky',     icon: '01d', visibility: 9,  pressure: 1007, clouds: 10, uvi: 7.1 },
  { name: 'Sunder Nursery',   temp: 31, feels_like: 34, humidity: 52, wind_speed: 16, description: 'few clouds',    icon: '02d', visibility: 10, pressure: 1009, clouds: 20, uvi: 5.8 },
  { name: 'Deer Park',        temp: 34, feels_like: 37, humidity: 61, wind_speed: 9,  description: 'haze',          icon: '50d', visibility: 5,  pressure: 1006, clouds: 45, uvi: 4.5 },
  { name: 'Talkatora Garden', temp: 32, feels_like: 35, humidity: 57, wind_speed: 12, description: 'partly cloudy', icon: '02d', visibility: 7,  pressure: 1008, clouds: 30, uvi: 5.2 },
];

export async function GET() {
  // If no API key configured, return fallback immediately
  if (!WEATHER_KEY || WEATHER_KEY === 'your_weather_api_key') {
    return Response.json({ parks: FALLBACK, source: 'fallback' });
  }

  try {
    const results = await Promise.all(
      PARKS.map(async (park) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${park.lat}&lon=${park.lng}&appid=${WEATHER_KEY}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`OpenWeatherMap ${response.status}: ${errData.message || response.statusText}`);
        }

        const d = await response.json();

        return {
          name:        park.name,
          temp:        Math.round(d.main.temp),
          feels_like:  Math.round(d.main.feels_like),
          humidity:    d.main.humidity,
          wind_speed:  Math.round((d.wind?.speed || 0) * 3.6), // m/s → km/h
          description: d.weather[0]?.description || 'clear sky',
          icon:        d.weather[0]?.icon || '01d',
          visibility:  Math.round((d.visibility || 10000) / 1000),
          pressure:    d.main.pressure,
          clouds:      d.clouds?.all || 0,
          uvi:         null, // free tier doesn't include UV in /weather
        };
      })
    );

    return Response.json({ parks: results, source: 'live' });
  } catch (err) {
    console.error('Weather API error:', err.message);
    // Return fallback with error info so frontend knows
    return Response.json({ parks: FALLBACK, source: 'fallback', error: err.message });
  }
}
