'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Leaf, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import { ROLES, Role } from '@/lib/roles';
import api from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get('role') as Role) || 'citizen';

  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { ...form, role: selectedRole });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const activeRole = ROLES.find((r) => r.value === selectedRole)!;

  const DEMO_USERS: Record<Role, { email: string; password: string }> = {
    citizen:           { email: 'citizen@demo.com',     password: 'Demo@1234' },
    admin:             { email: 'admin@demo.com',       password: 'Demo@1234' },
    maintenance_staff: { email: 'maintenance@demo.com', password: 'Demo@1234' },
    event_organizer:   { email: 'organizer@demo.com',   password: 'Demo@1234' },
  };

  const demoLogin = async (role: Role) => {
    setSelectedRole(role);
    setLoading(true);
    try {
      const { email, password } = DEMO_USERS[role];
      const { data } = await api.post('/auth/login', { email, password, role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome, ${data.user.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col w-[460px] flex-shrink-0 relative p-10 overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
          <div className="absolute top-0 left-0 w-full h-64" style={{ background: 'radial-gradient(ellipse at top left, var(--glow-1), transparent 70%)' }} />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 14px var(--shadow-accent)' }}>
              <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              PARK<span style={{ color: 'var(--accent)' }}>LY</span>
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6"
              style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
              {activeRole.icon}
            </div>
            <h2 className="text-3xl font-bold mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
              Welcome back to<br />Parkly
            </h2>
            <p className="text-sm leading-relaxed mb-8 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
              Sign in as <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{activeRole.label}</span> to access your personalized dashboard and tools.
            </p>
            <div className="space-y-3">
              {[activeRole.description, 'Real-time park data & analytics', 'Community engagement tools'].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2025 Parkly Platform</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[400px]">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm transition-colors mb-8 group"
            style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>

          <div className="mb-7">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Sign in</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Choose your role and enter your credentials</p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>Sign in as</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => (
                <button key={role.value} type="button" onClick={() => setSelectedRole(role.value)}
                  className={`role-btn ${selectedRole === role.value ? 'active' : ''}`}>
                  <span className="text-base">{role.icon}</span>
                  <span>{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="theme-input w-full rounded-xl px-4 py-3 text-sm" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <a href="#" className="text-xs transition-colors" style={{ color: 'var(--accent)' }}>Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="theme-input w-full rounded-xl px-4 py-3 pr-11 text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 16px var(--shadow-accent)' }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : (
                <>Sign in as {activeRole.label} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo login */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-2.5 text-center" style={{ color: 'var(--text-muted)' }}>Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => (
                <button key={role.value} type="button" disabled={loading}
                  onClick={() => demoLogin(role.value)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--text-secondary)' }}>
                  <span>{role.icon}</span>
                  <span>{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Don&apos;t have an account?{' '}
              <Link href={`/register?role=${selectedRole}`} className="font-medium transition-colors" style={{ color: 'var(--accent)' }}>
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
