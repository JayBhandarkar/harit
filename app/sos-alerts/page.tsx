'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Siren, MapPin, Clock, CheckCircle, AlertTriangle,
  Loader2, User, Navigation, RefreshCw, Bell,
} from 'lucide-react';
import { ROLES, User as UserType } from '@/lib/roles';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface SOSAlert {
  _id: string;
  citizenName: string;
  message: string;
  location: { lat?: number; lng?: number; address: string };
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG = {
  active:       { label: 'Active',       color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: '🚨' },
  acknowledged: { label: 'Acknowledged', color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  icon: '👁️' },
  resolved:     { label: 'Resolved',     color: '#34d399', bg: 'rgba(52,211,153,0.12)',  icon: '✅' },
};

export default function SOSAlertsPage() {
  const router = useRouter();
  const [user, setUser]           = useState<UserType | null>(null);
  const [activeNav, setActiveNav] = useState('SOS Notifications');
  const [alerts, setAlerts]       = useState<SOSAlert[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [newCount, setNewCount]   = useState(0);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await api.get('/sos');
      setAlerts(data.alerts);
    } catch (err: any) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (!['admin', 'maintenance_staff'].includes(u.role)) { router.push('/dashboard'); return; }
    setUser(u);

    // Load existing alerts
    fetchAlerts();

    // Poll for new alerts every 10 seconds
    const interval = setInterval(fetchAlerts, 10000);

    return () => clearInterval(interval);
  }, [router, fetchAlerts]);

  const acknowledge = async (id: string) => {
    try {
      await api.patch(`/sos/${id}/acknowledge`);
      toast.success('Alert acknowledged');
      fetchAlerts();
    } catch { toast.error('Failed to acknowledge'); }
  };

  const resolve = async (id: string) => {
    try {
      await api.patch(`/sos/${id}/resolve`);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch { toast.error('Failed to resolve'); }
  };

  const filtered = alerts.filter((a) => filter === 'all' || a.status === filter);
  const activeCount = alerts.filter((a) => a.status === 'active').length;

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  );

  const roleInfo = ROLES.find((r) => r.value === user.role)!;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <Sidebar user={user} roleIcon={roleInfo.icon} roleLabel={roleInfo.label}
        activeNav={activeNav} setActiveNav={setActiveNav} />

      <main className="flex-1 flex flex-col" style={{ marginLeft: '16rem' }}>

        {/* Header */}
        <div className="px-8 py-5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-nav)', backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}>
              <Siren className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>SOS Alerts</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Real-time emergency notifications</p>
            </div>
            {activeCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold animate-pulse"
                style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {activeCount} Active
              </span>
            )}
          </div>
          <button onClick={() => { setLoading(true); setNewCount(0); fetchAlerts(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)', color: 'var(--text-secondary)' }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {(['active', 'acknowledged', 'resolved'] as const).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const count = alerts.filter((a) => a.status === s).length;
              return (
                <div key={s} className="glass-card rounded-2xl p-4 flex items-center gap-3"
                  style={{ border: '1px solid var(--border-subtle)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: cfg.bg }}>
                    {cfg.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: cfg.color }}>{count}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cfg.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {(['all', 'active', 'acknowledged', 'resolved'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                style={{
                  background: filter === f ? 'var(--accent)' : 'var(--bg-card)',
                  color:      filter === f ? '#fff' : 'var(--text-secondary)',
                  border:     `1px solid ${filter === f ? 'var(--accent)' : 'var(--border-base)'}`,
                }}>
                {f === 'all' ? `All (${alerts.length})` : `${STATUS_CONFIG[f].icon} ${f} (${alerts.filter(a => a.status === f).length})`}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <Bell className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No alerts</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {filter === 'all' ? 'No SOS alerts have been triggered yet.' : `No ${filter} alerts.`}
              </p>
            </div>
          )}

          {/* Alert cards */}
          {!loading && (
            <div className="space-y-4">
              {filtered.map((alert) => {
                const cfg = STATUS_CONFIG[alert.status];
                const isActive = alert.status === 'active';
                return (
                  <div key={alert._id}
                    className="glass-card rounded-2xl p-5 transition-all"
                    style={{
                      border: `1px solid ${isActive ? 'rgba(248,113,113,0.3)' : 'var(--border-subtle)'}`,
                      background: isActive ? 'rgba(248,113,113,0.04)' : 'var(--bg-card)',
                    }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Icon */}
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: cfg.bg }}>
                          {cfg.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name + status */}
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {alert.citizenName}
                              </span>
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ background: cfg.bg, color: cfg.color }}>
                              {cfg.label}
                            </span>
                            {isActive && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
                                style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171' }}>
                                URGENT
                              </span>
                            )}
                          </div>

                          {/* Message */}
                          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                            {alert.message}
                          </p>

                          {/* Location */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {alert.location.address}
                            </span>
                            {alert.location.lat && alert.location.lng && (
                              <a
                                href={`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs ml-1 transition-colors hover:opacity-80"
                                style={{ color: 'var(--accent)' }}>
                                <Navigation className="w-3 h-3" /> View on map
                              </a>
                            )}
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {new Date(alert.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {alert.status === 'active' && (
                          <button onClick={() => acknowledge(alert._id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:-translate-y-0.5"
                            style={{ background: 'rgba(251,146,60,0.12)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)' }}>
                            <AlertTriangle className="w-3.5 h-3.5" /> Acknowledge
                          </button>
                        )}
                        {(alert.status === 'active' || alert.status === 'acknowledged') && (
                          <button onClick={() => resolve(alert._id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:-translate-y-0.5"
                            style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
                            <CheckCircle className="w-3.5 h-3.5" /> Resolve
                          </button>
                        )}
                        {alert.location.lat && alert.location.lng && (
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${alert.location.lat},${alert.location.lng}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:-translate-y-0.5"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-base)' }}>
                            <Navigation className="w-3.5 h-3.5" /> Directions
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
