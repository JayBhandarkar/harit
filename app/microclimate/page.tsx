'use client';
import { useEffect, useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import {
  Thermometer, Wind, Droplets, Sun, Eye,
  AlertTriangle, MapPin, Loader2, RefreshCw,
  CloudRain, Cloud, CloudSnow, Zap, CheckCircle,
} from 'lucide-react';

const BACKEND = '/api';

interface ParkWeather {
  name:        string;
  temp:        number;
  feels_like:  number;
  humidity:    number;
  wind_speed:  number;
  description: string;
  icon:        string;
  visibility:  number;
  pressure:    number;
  clouds:      number;
  uvi:         number | null;
}

const iconMap: Record<string, any> = {
  '01': Sun, '02': Cloud, '03': Cloud, '04': Cloud,
  '09': CloudRain, '10': CloudRain, '11': Zap,
  '13': CloudSnow, '50': Wind,
};
const getIcon = (icon: string) => iconMap[icon?.slice(0, 2)] ?? Sun;

const aqiLevel = (humidity: number, clouds: number) => {
  const score = humidity * 0.4 + clouds * 0.6;
  if (score < 40) return { label: 'Good',      color: '#34d399' };
  if (score < 65) return { label: 'Moderate',  color: '#fbbf24' };
  if (score < 80) return { label: 'Poor',      color: '#fb923c' };
  return              { label: 'Unhealthy', color: '#f87171' };
};

const uvLevel = (uvi: number | null) => {
  if (uvi === null) return { label: 'N/A',      color: '#9ca3af' };
  if (uvi < 3)      return { label: 'Low',      color: '#34d399' };
  if (uvi < 6)      return { label: 'Moderate', color: '#fbbf24' };
  if (uvi < 8)      return { label: 'High',     color: '#fb923c' };
  return                { label: 'Very High', color: '#f87171' };
};

export default function MicroclimateAlertsPage() {
  const [parks, setParks]           = useState<ParkWeather[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [source, setSource]         = useState<'live' | 'fallback' | ''>('');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${BACKEND}/weather/all`);
      const data = await res.json();
      setParks(data.parks || []);
      setSource(data.source);
      if (data.error) console.warn('Weather fallback reason:', data.error);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (e: any) {
      setError('Could not connect to server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(); }, []);

  // Auto-generate alerts from live data
  const alerts: { msg: string; color: string; icon: any }[] = [];
  parks.forEach((w) => {
    if (w.uvi !== null && w.uvi >= 6)
      alerts.push({ msg: `High UV index (${w.uvi.toFixed(1)}) at ${w.name} — wear sunscreen.`, color: '#fb923c', icon: Sun });
    if (w.humidity > 75)
      alerts.push({ msg: `High humidity (${w.humidity}%) at ${w.name} — stay hydrated.`, color: '#60a5fa', icon: Droplets });
    if (w.temp > 35)
      alerts.push({ msg: `Extreme heat (${w.temp}°C) at ${w.name} — avoid midday visits.`, color: '#f87171', icon: Thermometer });
    if (w.visibility < 4)
      alerts.push({ msg: `Low visibility (${w.visibility} km) at ${w.name} — hazy conditions.`, color: '#fbbf24', icon: Eye });
  });

  const avg = (key: keyof ParkWeather) =>
    parks.length ? Math.round(parks.reduce((s, w) => s + (w[key] as number), 0) / parks.length) : 0;

  return (
    <PageWrapper activeNav="Microclimate Alerts">
      {() => (
        <div className="p-6 space-y-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Microclimate Alerts
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Live weather across Delhi parks
                {lastUpdated && <span> · Updated {lastUpdated}</span>}
              </p>
            </div>
            <button onClick={fetchWeather} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)', color: 'var(--text-secondary)' }}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Fetching live weather data...</p>
            </div>
          )}

          {/* ── Error ── */}
          {error && !loading && (
            <div className="p-4 rounded-2xl flex items-start gap-3"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">Connection Error</p>
                <p className="text-xs text-red-400 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!loading && parks.length > 0 && (
            <>
              {/* ── Source badge ── */}
              <div className="flex items-center gap-2">
                {source === 'live' ? (
                  <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live data from OpenWeatherMap
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <AlertTriangle className="w-3 h-3" />
                    Showing estimated data (API key activating — try again in 2 hours)
                  </span>
                )}
              </div>

              {/* ── Dynamic alerts ── */}
              {alerts.length > 0 && (
                <div className="space-y-2">
                  {alerts.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <div key={i} className="p-3.5 rounded-2xl flex items-center gap-3"
                        style={{ background: `${a.color}10`, border: `1px solid ${a.color}28` }}>
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: a.color }} />
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a.msg}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {alerts.length === 0 && (
                <div className="p-3.5 rounded-2xl flex items-center gap-3"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    All parks have good conditions right now. Great time to visit!
                  </p>
                </div>
              )}

              {/* ── Summary cards ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Thermometer, label: 'Avg Temperature', value: `${avg('temp')}°C`,         color: '#fbbf24' },
                  { icon: Droplets,    label: 'Avg Humidity',    value: `${avg('humidity')}%`,       color: '#60a5fa' },
                  { icon: Wind,        label: 'Avg Wind',        value: `${avg('wind_speed')} km/h`, color: '#34d399' },
                  { icon: Eye,         label: 'Avg Visibility',  value: `${avg('visibility')} km`,   color: '#a78bfa' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="glass-card rounded-2xl p-5"
                    style={{ border: '1px solid var(--border-subtle)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${color}15`, color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* ── Per-park cards ── */}
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Park-wise Live Conditions
              </h2>

              <div className="space-y-4">
                {parks.map((w) => {
                  const WeatherIcon = getIcon(w.icon);
                  const aqi         = aqiLevel(w.humidity, w.clouds);
                  const uv          = uvLevel(w.uvi);

                  return (
                    <div key={w.name} className="glass-card rounded-2xl p-5"
                      style={{ border: '1px solid var(--border-subtle)' }}>

                      {/* Park name + badges */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(52,211,153,0.1)' }}>
                            <MapPin className="w-4 h-4" style={{ color: '#34d399' }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{w.name}</p>
                            <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{w.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${aqi.color}18`, color: aqi.color }}>
                            AQI: {aqi.label}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${uv.color}18`, color: uv.color }}>
                            UV: {uv.label}
                          </span>
                        </div>
                      </div>

                      {/* Temp + icon */}
                      <div className="flex items-center gap-4 mb-4 p-4 rounded-xl"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                        <WeatherIcon className="w-10 h-10" style={{ color: '#fbbf24' }} />
                        <div>
                          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {w.temp}°C
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Feels like {w.feels_like}°C
                          </p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { icon: Droplets,    label: 'Humidity',   value: `${w.humidity}%`,         color: '#60a5fa' },
                          { icon: Wind,        label: 'Wind',       value: `${w.wind_speed} km/h`,   color: '#34d399' },
                          { icon: Eye,         label: 'Visibility', value: `${w.visibility} km`,     color: '#a78bfa' },
                          { icon: Thermometer, label: 'Pressure',   value: `${w.pressure} hPa`,      color: '#fb923c' },
                        ].map(({ icon: Icon, label, value, color }) => (
                          <div key={label} className="text-center p-3 rounded-xl"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                            <Icon className="w-3.5 h-3.5 mx-auto mb-1.5" style={{ color }} />
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Cloud cover */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: 'var(--text-muted)' }}>Cloud Cover</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{w.clouds}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-base)' }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${w.clouds}%`, background: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                🌤️ Powered by OpenWeatherMap · Data refreshes on every visit
              </p>
            </>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
