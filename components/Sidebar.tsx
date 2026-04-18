'use client';
import { useRouter, usePathname } from 'next/navigation';
import {
  Leaf, LogOut, ChevronRight,
  LayoutDashboard, MapPin, Settings, Bell,
  // Citizen
  Navigation, BookOpen, CalendarDays, ShieldAlert, Map, Sprout,
  Glasses, MessageSquare, Globe, Thermometer, Siren, Star,
  // Admin
  BarChart2, Brain, ClipboardList, CheckSquare, Wallet,
  TreePine, Wrench, TrendingUp, Users, Building2,
  // Maintenance
  CalendarClock, ListTodo, AlertTriangle, Camera, CheckCircle, UserCog,
  // Event Organizer
  PlusCircle, Upload, Send, UsersRound, Flower2, Ticket,
} from 'lucide-react';
import { User, Role } from '@/lib/roles';
import ThemeToggle from './ThemeToggle';

const sidebarConfig: Record<Role, {
  accent: string;
  accentBg: string;
  accentBorder: string;
  gradient: string;
  sections: { heading: string; items: { icon: any; label: string; badge?: string }[] }[];
}> = {

  /* ─── CITIZEN ─── */
  citizen: {
    accent: '#34d399',
    accentBg: 'rgba(52,211,153,0.1)',
    accentBorder: 'rgba(52,211,153,0.25)',
    gradient: 'from-emerald-400 to-teal-500',
    sections: [
      {
        heading: 'Overview',
        items: [
          { icon: LayoutDashboard, label: 'Dashboard' },
          { icon: MapPin,          label: 'Nearby Parks' },
          { icon: Thermometer,     label: 'Microclimate Alerts', badge: '2' },
        ],
      },
      {
        heading: 'Park Life',
        items: [
          { icon: Navigation,   label: 'Real-Time Park Data' },
          { icon: CalendarDays, label: 'Events',              badge: '3' },
          { icon: Map,          label: 'Safety Map' },
          { icon: Siren,        label: 'SOS Alert',           badge: '🚨' },
        ],
      },
      {
        heading: 'Eco & Fun',
        items: [
          { icon: Glasses,       label: 'AR Experiences' },
          { icon: Star,          label: 'My Favourites' },
        ],
      },
      {
        heading: 'Community',
        items: [
          { icon: MessageSquare, label: 'Feedback & Reports' },
          { icon: Globe,         label: 'Language & Offline' },
          { icon: Settings,      label: 'Settings' },
        ],
      },
    ],
  },

  /* ─── ADMIN ─── */
  admin: {
    accent: '#fb923c',
    accentBg: 'rgba(251,146,60,0.1)',
    accentBorder: 'rgba(251,146,60,0.25)',
    gradient: 'from-orange-400 to-red-500',
    sections: [
      {
        heading: 'Overview',
        items: [
          { icon: LayoutDashboard, label: 'Dashboard' },
          { icon: Building2,       label: 'All Parks Overview' },
          { icon: TrendingUp,      label: 'Footfall Analytics' },
          { icon: Brain,           label: 'AI Insights' },
        ],
      },
      {
        heading: 'Approvals',
        items: [
          { icon: ClipboardList, label: 'Complaint Management', badge: '5' },
          { icon: CheckSquare,   label: 'Approve Events',       badge: '3' },
          { icon: CheckSquare,   label: 'Approve Bookings',     badge: '7' },
        ],
      },
      {
        heading: 'Finance & Eco',
        items: [
          { icon: Wallet,   label: 'GreenBudget Voting' },
          { icon: BarChart2,label: 'Budget & Materials' },
          { icon: TreePine, label: 'Ecological Monitoring' },
        ],
      },
      {
        heading: 'Maintenance',
        items: [
          { icon: Wrench,   label: 'Predictive Maintenance' },
          { icon: Users,    label: 'User Management' },
          { icon: Settings, label: 'System Settings' },
        ],
      },
    ],
  },

  /* ─── MAINTENANCE STAFF ─── */
  maintenance_staff: {
    accent: '#38bdf8',
    accentBg: 'rgba(56,189,248,0.1)',
    accentBorder: 'rgba(56,189,248,0.25)',
    gradient: 'from-blue-400 to-cyan-500',
    sections: [
      {
        heading: 'Overview',
        items: [
          { icon: LayoutDashboard, label: 'Staff Dashboard' },
          { icon: UserCog,         label: 'My Profile' },
        ],
      },
      {
        heading: 'My Work',
        items: [
          { icon: CalendarClock, label: 'Duty Schedule' },
          { icon: ListTodo,      label: 'Task Assignment', badge: '4' },
          { icon: CheckCircle,   label: 'Resolved Tasks' },
        ],
      },
      {
        heading: 'Incidents',
        items: [
          { icon: Siren,         label: 'SOS Notifications', badge: '🚨' },
          { icon: AlertTriangle, label: 'Incident Reporting' },
          { icon: Camera,        label: 'Photo Updates' },
        ],
      },
      {
        heading: 'More',
        items: [
          { icon: Bell,     label: 'Notifications' },
          { icon: Settings, label: 'Settings' },
        ],
      },
    ],
  },

  /* ─── EVENT ORGANIZER ─── */
  event_organizer: {
    accent: '#a78bfa',
    accentBg: 'rgba(167,139,250,0.1)',
    accentBorder: 'rgba(167,139,250,0.25)',
    gradient: 'from-violet-400 to-purple-500',
    sections: [
      {
        heading: 'Overview',
        items: [
          { icon: LayoutDashboard, label: 'Dashboard' },
          { icon: Ticket,          label: 'My Events' },
        ],
      },
      {
        heading: 'Create & Book',
        items: [
          { icon: PlusCircle,  label: 'Create Event ⭐',    badge: 'New' },
          { icon: MapPin,      label: 'Park Booking ⭐',    badge: 'New' },
          { icon: Upload,      label: 'Upload Event Details' },
          { icon: Send,        label: 'Submit for Approval', badge: '2' },
        ],
      },
      {
        heading: 'Manage',
        items: [
          { icon: UsersRound, label: 'Participants' },
          { icon: CalendarDays,label: 'Event Calendar' },
          { icon: CheckSquare, label: 'Approval Status' },
        ],
      },
      {
        heading: 'Eco Activities',
        items: [
          { icon: Flower2,  label: 'Plant Donation' },
          { icon: Sprout,   label: 'Eco Activities' },
          { icon: Settings, label: 'Settings' },
        ],
      },
    ],
  },
};

/* pages that have dedicated routes */
const NAV_ROUTES: Record<string, string> = {
  // Common
  'Dashboard':              '/dashboard',
  'Staff Dashboard':        '/dashboard',
  'Settings':               '/settings',
  // Citizen
  'Nearby Parks':           '/nearby-parks',
  'Microclimate Alerts':    '/microclimate',
  'Real-Time Park Data':    '/nearby-parks',
  'Park Booking ⭐':        '/park-booking',
  'Events':                 '/events',
  'Safety Map':             '/safety-map',
  'SOS Alert':              '/sos',
  'EcoPassport':            '/ecopassport',
  'AR Experiences':         '/ar-experiences',
  'My Favourites':          '/nearby-parks',
  'Feedback & Reports':     '/feedback',
  'Language & Offline':     '/settings',
  // Admin
  'All Parks Overview':     '/parks-overview',
  'Footfall Analytics':     '/footfall',
  'AI Insights':            '/ai-insights',
  'Complaint Management':   '/complaints',
  'Approve Events':         '/approve-events',
  'Approve Bookings':       '/approve-bookings',
  'GreenBudget Voting':     '/budget',
  'Budget & Materials':     '/budget',
  'Ecological Monitoring':  '/eco-monitoring',
  'Predictive Maintenance': '/tasks',
  'User Management':        '/user-management',
  'System Settings':        '/settings',
  // Maintenance
  'My Profile':             '/settings',
  'Duty Schedule':          '/duty-schedule',
  'Task Assignment':        '/tasks',
  'Resolved Tasks':         '/tasks',
  'SOS Notifications':      '/sos-alerts',
  'Incident Reporting':     '/incidents',
  'Photo Updates':          '/incidents',
  'Notifications':          '/sos-alerts',
  // Organizer
  'My Events':              '/my-events',
  'Create Event ⭐':        '/create-event',
  'Park Booking ⭐ ':       '/park-booking',
  'Upload Event Details':   '/create-event',
  'Submit for Approval':    '/my-events',
  'Participants':           '/participants',
  'Event Calendar':         '/events',
  'Approval Status':        '/my-events',
  'Plant Donation':         '/ecopassport',
  'Eco Activities':         '/ecopassport',
};

interface SidebarProps {
  user: User;
  roleIcon: string;
  roleLabel: string;
  activeNav: string;
  setActiveNav: (label: string) => void;
}

export default function Sidebar({ user, roleIcon, roleLabel, activeNav, setActiveNav }: SidebarProps) {
  const router   = useRouter();
  const pathname  = usePathname();
  const cfg       = sidebarConfig[user.role];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-40"
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="px-5 h-16 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}
            style={{ boxShadow: `0 2px 10px ${cfg.accentBg}` }}
          >
            <Leaf className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            PARK<span style={{ color: cfg.accent }}>LY</span>
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* ── User card ── */}
      <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: cfg.accentBg, border: `1px solid ${cfg.accentBorder}` }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{ background: cfg.accentBg, border: `1px solid ${cfg.accentBorder}` }}
          >
            {roleIcon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
            <p className="text-[10px] font-medium" style={{ color: cfg.accent }}>{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* ── Nav sections ── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {cfg.sections.map((section) => (
          <div key={section.heading}>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {section.heading}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ icon: Icon, label, badge }) => {
                const isActive = activeNav === label;
                return (
                  <button
                    key={label}
                    onClick={() => {
                      const route = NAV_ROUTES[label];
                      if (route) { router.push(route); } else { setActiveNav(label); }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: isActive ? 'var(--text-primary)' : 'var(--sidebar-item-color)',
                      background: isActive ? cfg.accentBg : pathname === NAV_ROUTES[label] ? cfg.accentBg : 'transparent',
                      border: isActive ? `1px solid ${cfg.accentBorder}` : pathname === NAV_ROUTES[label] ? `1px solid ${cfg.accentBorder}` : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover-bg)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-item-color)';
                      }
                    }}
                  >
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: isActive ? cfg.accent : 'inherit' }}
                    />
                    <span className="flex-1 text-left text-xs leading-snug">{label}</span>
                    {badge && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: cfg.accentBg,
                          color: cfg.accent,
                          border: `1px solid ${cfg.accentBorder}`,
                        }}
                      >
                        {badge}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: cfg.accent }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'var(--text-muted)', border: '1px solid transparent' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#f87171';
            (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
