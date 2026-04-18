'use client';
import { MapPin, CalendarDays, Leaf, Siren, Star, Clock, Wind, Droplets, Sun, TrendingUp, Shield, Bell, ChevronRight, Navigation, Scan } from 'lucide-react';
import { useRouter } from 'next/navigation';

const stats = [
  { label: 'Parks Nearby',    value: '8',   delta: 'Within 2 km',    icon: MapPin,       color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  { label: 'Active Bookings', value: '2',   delta: '1 today',        icon: CalendarDays, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  { label: 'Events Joined',   value: '7',   delta: '+1 upcoming',    icon: CalendarDays, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  { label: 'EcoPassport XP',  value: '240', delta: '+40 this month', icon: Leaf,         color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
];

const nearbyParks = [
  { name: 'Lodhi Garden',       dist: '0.3 km', open: true,  rating: 4.6, crowd: 'Low'    },
  { name: 'Nehru Park',         dist: '1.2 km', open: true,  rating: 4.4, crowd: 'Medium' },
  { name: 'Sunder Nursery',     dist: '1.8 km', open: true,  rating: 4.6, crowd: 'Low'    },
  { name: 'Deer Park',          dist: '2.1 km', open: true,  rating: 4.4, crowd: 'High'   },
  { name: 'Talkatora Garden',   dist: '2.4 km', open: false, rating: 4.3, crowd: 'Closed' },
];

const upcomingEvents = [
  { name: 'Morning Yoga',       park: 'Lodhi Garden',   date: 'Tomorrow, 6:00 AM',  spots: 12 },
  { name: 'Bird Watching Walk', park: 'Sunder Nursery', date: 'Sat, 7:00 AM',       spots: 8  },
  { name: 'Tree Plantation',    park: 'Nehru Park',     date: 'Sun, 9:00 AM',       spots: 25 },
];

const myBookings = [
  { park: 'Lodhi Garden',   slot: 'Sat 8–10 AM',  status: 'confirmed' },
  { park: 'Nehru Park',     slot: 'Sun 6–8 AM',   status: 'pending'   },
];

const crowdColor = (c: string) =>
  c === 'Low' ? '#34d399' : c === 'Medium' ? '#fbbf24' : c === 'High' ? '#f87171' : '#9ca3af';

export default function CitizenDashboard({ user }: { user: any }) {
  const router = useRouter();
  const accent = '#34d399';

  return (
    <div className="p-6 space-y-6">

      {/* ── Welcome banner ── */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(20,184,166,0.08))', border: '1px solid rgba(52,211,153,0.2)' }}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-20">🌿</div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accent }}>Welcome back</p>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Hello, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Great day to explore a park. 8 parks are open near you right now.
        </p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => router.push('/nearby-parks')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: accent, boxShadow: '0 4px 14px rgba(52,211,153,0.3)' }}>
            <MapPin className="w-4 h-4" /> Explore Parks
          </button>
          <button onClick={() => router.push('/ar-experiences')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }}>
            <Scan className="w-4 h-4" /> AR Explore
          </button>
          <button onClick={() => router.push('/sos')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}>
            <Siren className="w-4 h-4" /> SOS
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card rounded-2xl p-5 transition-all hover:-translate-y-0.5"
              style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-right" style={{ color: 'var(--text-muted)' }}>{s.delta}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid xl:grid-cols-3 gap-6">

        {/* ── Left col ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Nearby Parks */}
          <div className="glass-card rounded-2xl p-5" style={{ border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nearby Parks</h3>
              <button onClick={() => router.push('/nearby-parks')}
                className="text-xs flex items-center gap-1 transition-colors" style={{ color: accent }}>
                View map <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {nearbyParks.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: 'rgba(52,211,153,0.1)' }}>🌳</div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.dist}</span>
                        <span className="text-xs" style={{ color: '#f59e0b' }}>★ {p.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${crowdColor(p.crowd)}18`, color: crowdColor(p.crowd) }}>
                      {p.crowd}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: p.open ? 'rgba(52,211,153,0.1)' : 'rgba(156,163,175,0.1)', color: p.open ? '#34d399' : '#9ca3af' }}>
                      {p.open ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="glass-card rounded-2xl p-5" style={{ border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Upcoming Events</h3>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>3 near you</span>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((e) => (
                <div key={e.name} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: 'rgba(167,139,250,0.1)' }}>🎪</div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{e.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{e.park} · {e.date}</p>
                    </div>
                  </div>
                  <button className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
                    Join ({e.spots} spots)
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* My Bookings */}
          <div className="glass-card rounded-2xl p-5" style={{ border: '1px solid var(--border-subtle)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>My Bookings</h3>
            <div className="space-y-2">
              {myBookings.map((b) => (
                <div key={b.park} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4" style={{ color: '#60a5fa' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{b.park}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.slot}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                    style={{
                      background: b.status === 'confirmed' ? 'rgba(52,211,153,0.12)' : 'rgba(251,146,60,0.12)',
                      color: b.status === 'confirmed' ? '#34d399' : '#fb923c',
                    }}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right col ── */}
        <div className="space-y-5">

          {/* EcoPassport */}
          <div className="glass-card rounded-2xl p-5" style={{ border: '1px solid rgba(74,222,128,0.2)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(74,222,128,0.12)' }}>🌱</div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>EcoPassport</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Level 4 — Explorer</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--text-muted)' }}>240 / 300 XP</span>
                <span style={{ color: '#4ade80' }}>80%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-base)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: '80%', background: 'linear-gradient(90deg, #4ade80, #34d399)' }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[{ icon: '🌳', label: '12 Trees' }, { icon: '🦋', label: '8 Species' }, { icon: '♻️', label: '5 Drives' }].map((b) => (
                <div key={b.label} className="text-center p-2 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  <p className="text-lg">{b.icon}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Microclimate */}
          <div className="glass-card rounded-2xl p-5" style={{ border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Live Conditions</h3>
              <span className="flex items-center gap-1 text-[10px]" style={{ color: accent }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} /> Live
              </span>
            </div>
            {[
              { icon: Sun,      label: 'Temperature', value: '28°C',  color: '#fbbf24' },
              { icon: Droplets, label: 'Humidity',    value: '58%',   color: '#60a5fa' },
              { icon: Wind,     label: 'Air Quality', value: 'Good',  color: '#34d399' },
              { icon: Shield,   label: 'UV Index',    value: 'High',  color: '#f87171' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>📍 Lodhi Garden, Delhi</p>
          </div>

          {/* Safety Map */}
          <div className="glass-card rounded-2xl p-5" style={{ border: '1px solid var(--border-subtle)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Safety Status</h3>
            {[
              { park: 'Lodhi Garden',   status: 'Safe',    color: '#34d399' },
              { park: 'Nehru Park',     status: 'Safe',    color: '#34d399' },
              { park: 'Deer Park',      status: 'Caution', color: '#fbbf24' },
              { park: 'Sunder Nursery', status: 'Safe',    color: '#34d399' },
            ].map((s) => (
              <div key={s.park} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.park}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: `${s.color}18`, color: s.color }}>● {s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
