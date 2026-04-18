const PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Delhi parks as static fallback
const DELHI_FALLBACK_PARKS = [
  { id: 'delhi_001', name: 'Indraprastha Park', address: 'Ring Road, ITO, New Delhi, Delhi 110002', rating: 4.3, userRatingCount: 2841, openNow: true, lat: 28.6289, lng: 77.2488 },
  { id: 'delhi_002', name: 'Lodhi Garden', address: 'Lodhi Road, New Delhi, Delhi 110003', rating: 4.6, userRatingCount: 52341, openNow: true, lat: 28.5931, lng: 77.2197 },
  { id: 'delhi_003', name: 'Nehru Park', address: 'Chanakyapuri, New Delhi, Delhi 110021', rating: 4.4, userRatingCount: 18920, openNow: true, lat: 28.5987, lng: 77.1882 },
  { id: 'delhi_004', name: 'Sanjay Lake Park', address: 'Trilokpuri, East Delhi, Delhi 110091', rating: 4.2, userRatingCount: 6540, openNow: true, lat: 28.6219, lng: 77.3101 },
  { id: 'delhi_005', name: 'Raj Ghat Memorial Park', address: 'Ring Road, New Delhi, Delhi 110006', rating: 4.5, userRatingCount: 34210, openNow: true, lat: 28.6406, lng: 77.2490 },
  { id: 'delhi_006', name: 'Deer Park (Hauz Khas)', address: 'Hauz Khas, New Delhi, Delhi 110016', rating: 4.4, userRatingCount: 22100, openNow: true, lat: 28.5535, lng: 77.2006 },
  { id: 'delhi_007', name: 'Talkatora Garden', address: 'Talkatora Road, New Delhi, Delhi 110001', rating: 4.3, userRatingCount: 9870, openNow: true, lat: 28.6241, lng: 77.2008 },
  { id: 'delhi_008', name: 'Buddha Jayanti Park', address: 'Ridge Road, New Delhi, Delhi 110021', rating: 4.5, userRatingCount: 15430, openNow: true, lat: 28.6012, lng: 77.1798 },
  { id: 'delhi_009', name: 'Sunder Nursery', address: 'Nizamuddin East, New Delhi, Delhi 110013', rating: 4.6, userRatingCount: 28760, openNow: true, lat: 28.5921, lng: 77.2432 },
  { id: 'delhi_010', name: 'Garden of Five Senses', address: 'Said-ul-Ajaib, New Delhi, Delhi 110030', rating: 4.3, userRatingCount: 19870, openNow: true, lat: 28.5082, lng: 77.1934 },
  { id: 'delhi_011', name: 'Mughal Garden (Amrit Udyan)', address: 'Rashtrapati Bhavan, New Delhi, Delhi 110004', rating: 4.7, userRatingCount: 41200, openNow: false, lat: 28.6143, lng: 77.1993 },
  { id: 'delhi_012', name: 'Qudsia Garden', address: 'Qudsia Road, Civil Lines, Delhi 110054', rating: 4.1, userRatingCount: 5430, openNow: true, lat: 28.6712, lng: 77.2289 },
  { id: 'delhi_013', name: 'Roshanara Garden', address: 'Roshanara Road, Delhi 110007', rating: 4.2, userRatingCount: 7650, openNow: true, lat: 28.6789, lng: 77.1934 },
  { id: 'delhi_014', name: 'Coronation Park', address: 'Burari Road, Delhi 110036', rating: 4.0, userRatingCount: 3210, openNow: true, lat: 28.7201, lng: 77.2012 },
  { id: 'delhi_015', name: 'Yamuna Biodiversity Park', address: 'Wazirabad, Delhi 110084', rating: 4.4, userRatingCount: 8920, openNow: true, lat: 28.7312, lng: 77.2198 },
  { id: 'delhi_016', name: 'Aravalli Biodiversity Park', address: 'Vasant Vihar, New Delhi, Delhi 110057', rating: 4.5, userRatingCount: 11230, openNow: true, lat: 28.5612, lng: 77.1589 },
  { id: 'delhi_017', name: 'Kalindi Kunj Park', address: 'Kalindi Kunj, New Delhi, Delhi 110025', rating: 4.1, userRatingCount: 4320, openNow: true, lat: 28.5432, lng: 77.2876 },
  { id: 'delhi_018', name: 'Millennium Park', address: 'Ring Road, ITO, New Delhi, Delhi 110002', rating: 4.2, userRatingCount: 6780, openNow: true, lat: 28.6312, lng: 77.2534 },
  { id: 'delhi_019', name: 'Shanti Van', address: 'Ring Road, New Delhi, Delhi 110054', rating: 4.3, userRatingCount: 8910, openNow: true, lat: 28.6489, lng: 77.2378 },
  { id: 'delhi_020', name: 'Vijay Ghat', address: 'Ring Road, New Delhi, Delhi 110006', rating: 4.2, userRatingCount: 5670, openNow: true, lat: 28.6378, lng: 77.2456 },
];

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return Response.json({ message: 'query required' }, { status: 400 });
  }

  const q = query.toLowerCase().trim();
  const userLat = parseFloat(searchParams.get('lat') || '28.6289');
  const userLng = parseFloat(searchParams.get('lng') || '77.2488');

  // Try Google Places text search first
  if (PLACES_API_KEY) {
    try {
      const location = searchParams.get('lat') && searchParams.get('lng')
        ? `&location=${userLat},${userLng}&radius=30000`
        : '';
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q + ' park Delhi')}&type=park${location}&key=${PLACES_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results?.length > 0) {
        const parks = data.results.map((p) => ({
          id: p.place_id,
          name: p.name,
          address: p.formatted_address || p.vicinity,
          rating: p.rating,
          userRatingCount: p.user_ratings_total,
          openNow: p.opening_hours?.open_now,
          lat: p.geometry.location.lat,
          lng: p.geometry.location.lng,
          photo: p.photos?.[0]?.photo_reference || null,
        }));
        return Response.json({ parks, source: 'google' });
      }
    } catch (err) {
      console.error('Google Places search error:', err.message);
    }
  }

  // Fallback: filter Delhi parks by query
  const filtered = DELHI_FALLBACK_PARKS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
  ).map((p) => ({
    ...p,
    distance: getDistanceKm(userLat, userLng, p.lat, p.lng),
  }));

  // If no match, return all Delhi parks sorted by distance
  const results = filtered.length > 0
    ? filtered
    : DELHI_FALLBACK_PARKS.map((p) => ({
        ...p,
        distance: getDistanceKm(userLat, userLng, p.lat, p.lng),
      })).sort((a, b) => a.distance - b.distance);

  return Response.json({ parks: results, source: 'fallback', note: `Showing Delhi parks matching "${q}"` });
}
