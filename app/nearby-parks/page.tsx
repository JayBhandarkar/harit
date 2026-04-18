'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin, Search, Navigation, Star, Clock,
  ExternalLink, Loader2, AlertCircle, Filter, X, ChevronRight,
} from 'lucide-react';

const API_KEY    = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const BACKEND    = '/api';

interface Park {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  openNow?: boolean;
  lat: number;
  lng: number;
  photo?: string | null;
  distance?: number;
}

const RADIUS_OPTIONS = [1000, 2000, 5000, 10000];
const RADIUS_LABELS: Record<number, string> = {
  1000: '1 km', 2000: '2 km', 5000: '5 km', 10000: '10 km',
};

function distKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',      stylers: [{ visibility: 'off' }] },
  { elementType: 'geometry',     stylers: [{ color: '#1a2e1f' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#9ca3af' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1f14' }] },
  { featureType: 'road', elementType: 'geometry',        stylers: [{ color: '#1f3327' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#162a1e' }] },
  { featureType: 'water',    elementType: 'geometry',         stylers: [{ color: '#0d2137' }] },
  { featureType: 'poi.park', elementType: 'geometry',         stylers: [{ color: '#1a3d22' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#34d399' }] },
];

export default function NearbyParksPage() {
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef     = useRef<google.maps.Marker[]>([]);
  const infoWindowRef  = useRef<google.maps.InfoWindow | null>(null);
  const userMarkerRef  = useRef<google.maps.Marker | null>(null);

  const [parks, setParks]             = useState<Park[]>([]);
  const [selected, setSelected]       = useState<Park | null>(null);
  const [loading, setLoading]         = useState(true);
  const [searching, setSearching]     = useState(false);
  const [error, setError]             = useState('');
  const [userPos, setUserPos]         = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius]           = useState(2000);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapsReady, setMapsReady]     = useState(false);

  /* ── Load Maps JS SDK (Maps only, no Places library needed) ── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).google?.maps) { setMapsReady(true); return; }
    if (document.getElementById('gmap-script')) return;

    const script    = document.createElement('script');
    script.id       = 'gmap-script';
    script.src      = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly`;
    script.async    = true;
    script.defer    = true;
    script.onload   = () => setMapsReady(true);
    script.onerror  = () => setError('Failed to load Google Maps. Check your API key.');
    document.head.appendChild(script);
  }, []);

  /* ── Init map + get location ── */
  useEffect(() => {
    if (!mapsReady || !mapRef.current) return;

    const buildMap = (lat: number, lng: number) => {
      const map = new google.maps.Map(mapRef.current!, {
        center: { lat, lng },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: MAP_STYLES,
      });
      mapInstanceRef.current = map;
      infoWindowRef.current  = new google.maps.InfoWindow();

      userMarkerRef.current = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: 'You are here',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#34d399',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
        zIndex: 999,
      });

      setUserPos({ lat, lng });
      fetchNearby(lat, lng, radius, map);
    };

    navigator.geolocation.getCurrentPosition(
      (p) => buildMap(p.coords.latitude, p.coords.longitude),
      ()  => buildMap(19.076, 72.8777),
      { timeout: 8000 },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady]);

  /* ── Fetch nearby via backend ── */
  const fetchNearby = useCallback(async (
    lat: number, lng: number, rad: number, map?: google.maps.Map,
  ) => {
    const m = map || mapInstanceRef.current;
    if (!m) return;
    setSearching(true);
    setError('');
    clearMarkers();

    try {
      const res  = await fetch(`${BACKEND}/parks/nearby?lat=${lat}&lng=${lng}&radius=${rad}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error_message || data.message || 'Failed to fetch parks');

      const enriched: Park[] = (data.parks || [])
        .map((p: Park) => ({ ...p, distance: distKm(lat, lng, p.lat, p.lng) }))
        .sort((a: Park, b: Park) => (a.distance ?? 0) - (b.distance ?? 0));

      setParks(enriched);
      enriched.forEach((park) => placeMarker(park, m));
    } catch (e: any) {
      setError(e.message || 'Could not load parks.');
    } finally {
      setSearching(false);
      setLoading(false);
    }
  }, []);

  /* ── Text search via backend ── */
  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q || !mapInstanceRef.current) return;
    setSearching(true);
    setError('');
    clearMarkers();

    try {
      const latLng = userPos ? `&lat=${userPos.lat}&lng=${userPos.lng}` : '';
      const res    = await fetch(`${BACKEND}/parks/search?query=${encodeURIComponent(q)}${latLng}`);
      const data   = await res.json();

      if (!res.ok) throw new Error(data.error_message || data.message || 'Search failed');

      const enriched: Park[] = (data.parks || []).map((p: Park) => ({
        ...p,
        distance: userPos ? distKm(userPos.lat, userPos.lng, p.lat, p.lng) : undefined,
      }));

      setParks(enriched);
      enriched.forEach((park) => placeMarker(park, mapInstanceRef.current!));

      if (enriched[0]) {
        mapInstanceRef.current!.panTo({ lat: enriched[0].lat, lng: enriched[0].lng });
        mapInstanceRef.current!.setZoom(13);
      }
    } catch (e: any) {
      setError(e.message || 'Search failed.');
    } finally {
      setSearching(false);
    }
  }, [searchQuery, userPos]);

  /* ── Markers ── */
  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  const placeMarker = (park: Park, map: google.maps.Map) => {
    const marker = new google.maps.Marker({
      position: { lat: park.lat, lng: park.lng },
      map,
      title: park.name,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new google.maps.Size(38, 38),
      },
      animation: google.maps.Animation.DROP,
    });

    marker.addListener('click', () => {
      setSelected(park);
      infoWindowRef.current?.setContent(`
        <div style="font-family:Inter,sans-serif;padding:6px 4px;min-width:180px">
          <p style="font-weight:600;font-size:13px;margin:0 0 4px;color:#111">${park.name}</p>
          <p style="font-size:11px;color:#6b7280;margin:0">${park.address}</p>
          ${park.rating ? `<p style="font-size:11px;margin:6px 0 0;color:#f59e0b">★ ${park.rating} <span style="color:#9ca3af">(${park.userRatingCount ?? 0})</span></p>` : ''}
          ${park.openNow !== undefined ? `<p style="font-size:11px;margin:4px 0 0;color:${park.openNow ? '#34d399' : '#f87171'}">${park.openNow ? '● Open Now' : '● Closed'}</p>` : ''}
        </div>
      `);
      infoWindowRef.current?.open(map, marker);
      map.panTo({ lat: park.lat, lng: park.lng });
    });

    markersRef.current.push(marker);
  };

  /* ── Radius change ── */
  const handleRadiusChange = (r: number) => {
    setRadius(r);
    if (userPos) fetchNearby(userPos.lat, userPos.lng, r);
  };

  /* ── Click park in list ── */
  const panToPark = (park: Park) => {
    setSelected(park);
    mapInstanceRef.current?.panTo({ lat: park.lat, lng: park.lng });
    mapInstanceRef.current?.setZoom(16);
  };

  /* ── Clear search ── */
  const clearSearch = () => {
    setSearchQuery('');
    setError('');
    if (userPos) fetchNearby(userPos.lat, userPos.lng, radius);
  };

  const stars = (r: number) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 px-5 py-3 flex items-center gap-3 flex-wrap"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-nav)', backdropFilter: 'blur(16px)' }}>

        {/* Search input */}
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border-base)' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search parks by name or area..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {searchQuery && (
            <button onClick={clearSearch}>
              <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 flex-shrink-0"
          style={{ background: 'var(--accent)', boxShadow: '0 4px 12px var(--shadow-accent)' }}>
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>

        {/* Radius pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <div className="flex gap-1">
            {RADIUS_OPTIONS.map((r) => (
              <button key={r} onClick={() => handleRadiusChange(r)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                style={{
                  background: radius === r ? 'var(--accent)' : 'var(--bg-card)',
                  color:      radius === r ? '#fff' : 'var(--text-secondary)',
                  border:     `1px solid ${radius === r ? 'var(--accent)' : 'var(--border-base)'}`,
                }}>
                {RADIUS_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Locate me */}
        <button
          onClick={() => {
            if (userPos) {
              mapInstanceRef.current?.panTo(userPos);
              mapInstanceRef.current?.setZoom(14);
            }
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 flex-shrink-0"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)' }}
          title="Go to my location">
          <Navigation className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Park list ── */}
        <div className="w-80 flex-shrink-0 flex flex-col overflow-hidden"
          style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-sidebar)' }}>

          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {loading ? 'Finding parks...' : `${parks.length} Parks Found`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {searchQuery ? `Results for "${searchQuery}"` : `Within ${RADIUS_LABELS[radius]} of you`}
              </p>
            </div>
            {searching && <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-3 mt-3 p-3 rounded-xl flex items-start gap-2"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-red-400 font-medium">Error</p>
                <p className="text-xs text-red-400 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Skeleton */}
          {loading && !error && (
            <div className="p-3 space-y-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="rounded-xl p-4 animate-pulse"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div className="h-3 rounded w-3/4 mb-2" style={{ background: 'var(--border-base)' }} />
                  <div className="h-2.5 rounded w-1/2 mb-2" style={{ background: 'var(--border-base)' }} />
                  <div className="h-2 rounded w-1/3" style={{ background: 'var(--border-base)' }} />
                </div>
              ))}
            </div>
          )}

          {/* Park cards */}
          {!loading && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {parks.length === 0 && !searching && !error && (
                <div className="text-center py-12">
                  <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No parks found</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Try a wider radius or search by name
                  </p>
                </div>
              )}

              {parks.map((park) => {
                const isSel = selected?.id === park.id;
                return (
                  <button key={park.id} onClick={() => panToPark(park)}
                    className="w-full text-left rounded-xl p-3.5 transition-all hover:-translate-y-0.5"
                    style={{
                      background: isSel ? 'var(--accent-bg)' : 'var(--bg-card)',
                      border: `1px solid ${isSel ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                    }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {park.name}
                        </p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                          {park.address}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {park.rating && (
                            <span className="flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}>
                              <Star className="w-3 h-3 fill-current" />
                              {park.rating}
                              <span style={{ color: 'var(--text-muted)' }}>({park.userRatingCount})</span>
                            </span>
                          )}
                          {park.openNow !== undefined && (
                            <span className="flex items-center gap-1 text-xs"
                              style={{ color: park.openNow ? '#34d399' : '#f87171' }}>
                              <Clock className="w-3 h-3" />
                              {park.openNow ? 'Open' : 'Closed'}
                            </span>
                          )}
                          {park.distance !== undefined && (
                            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                              <Navigation className="w-3 h-3" />
                              {park.distance < 1
                                ? `${Math.round(park.distance * 1000)}m`
                                : `${park.distance.toFixed(1)}km`}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1"
                        style={{ color: isSel ? 'var(--accent)' : 'var(--text-muted)' }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Map ── */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />

          {/* Loading overlay */}
          {!mapsReady && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'var(--bg-base)' }}>
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading map...</p>
              </div>
            </div>
          )}

          {/* Selected park card */}
          {selected && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[440px] rounded-2xl p-5 shadow-2xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-base)', backdropFilter: 'blur(20px)' }}>
              <button onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
              </button>

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
                      <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                    </div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{selected.name}</p>
                  </div>
                  <p className="text-xs mb-3 pl-9" style={{ color: 'var(--text-muted)' }}>{selected.address}</p>

                  <div className="flex items-center gap-3 pl-9 flex-wrap">
                    {selected.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs" style={{ color: '#f59e0b' }}>{stars(selected.rating)}</span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.rating}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({selected.userRatingCount})</span>
                      </div>
                    )}
                    {selected.openNow !== undefined && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: selected.openNow ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                          color:      selected.openNow ? '#34d399' : '#f87171',
                        }}>
                        {selected.openNow ? '● Open Now' : '● Closed'}
                      </span>
                    )}
                    {selected.distance !== undefined && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        📍 {selected.distance < 1
                          ? `${Math.round(selected.distance * 1000)}m away`
                          : `${selected.distance.toFixed(1)}km away`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white rounded-lg transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--accent)', boxShadow: '0 2px 8px var(--shadow-accent)' }}>
                    <Navigation className="w-3.5 h-3.5" /> Directions
                  </a>
                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${selected.id}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)', color: 'var(--text-secondary)' }}>
                    <ExternalLink className="w-3.5 h-3.5" /> View on Maps
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Count badge */}
          {!loading && parks.length > 0 && (
            <div className="absolute top-4 right-4 px-3 py-2 rounded-xl text-xs font-medium"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-base)', backdropFilter: 'blur(12px)', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{parks.length}</span> parks found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
