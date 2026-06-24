import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../utils/api';
import {
  GraduationCap, FileText, CheckSquare, TrendingUp,
  ArrowRight, Sparkles, BookOpen, Award, Briefcase,
  Mic, BookMarked, Calculator, Calendar, BarChart2,
  Users, Bell, ChevronRight, Zap, Clock,
} from 'lucide-react';

/* ── Mini Sphere ── */
function MiniSphere({ size = 60, type = 'b', style = {} }) {
  const bg = type === 'y'
    ? 'radial-gradient(circle at 33% 33%, rgba(255,215,64,0.9), rgba(245,197,24,0.4) 40%, rgba(5,5,7,0.8) 100%)'
    : 'radial-gradient(circle at 33% 33%, rgba(59,126,255,0.9), rgba(59,126,255,0.3) 40%, rgba(5,5,7,0.8) 100%)';
  const shadow = type === 'y'
    ? 'inset -4px -4px 12px rgba(0,0,0,0.5), 0 0 20px rgba(245,197,24,0.15)'
    : 'inset -4px -4px 12px rgba(0,0,0,0.5), 0 0 20px rgba(59,126,255,0.15)';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, boxShadow: shadow, flexShrink: 0, ...style }} />
  );
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, accent, sub, delay = 0 }) {
  const isY = accent === 'y';
  const c   = isY ? 'var(--y)' : 'var(--b-1)';
  const dim = isY ? 'var(--y-dim)' : 'var(--b-dim)';
  const bdr = isY ? 'var(--y-border)' : 'var(--b-border)';

  return (
    <div className="ch afu" style={{
      animationDelay: `${delay}s`,
      borderRadius: 16, padding: '22px 24px',
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top glow line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${c}44, transparent)` }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: dim, border: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} style={{ color: c }} />
        </div>
        <MiniSphere size={36} type={isY ? 'y' : 'b'} />
      </div>

      <div style={{ fontFamily: 'Space Grotesk', fontSize: 32, fontWeight: 900, color: 'var(--white)', lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white-2)', marginBottom: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>}
    </div>
  );
}

/* ── Quick Action ── */
function QuickAction({ icon: Icon, label, desc, path, accent, navigate }) {
  const isY = accent === 'y';
  const c   = isY ? 'var(--y)' : 'var(--b-1)';
  const dim = isY ? 'var(--y-dim)' : 'var(--b-dim)';
  const bdr = isY ? 'var(--y-border)' : 'var(--b-border)';

  return (
    <button onClick={() => navigate(path)}
      className="ch"
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 12,
        background: 'var(--bg-3)', border: '1px solid var(--border)',
        cursor: 'pointer', width: '100%', textAlign: 'left',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = bdr; e.currentTarget.style.background = dim; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-3)'; }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: dim, border: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} style={{ color: c }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</div>
      </div>
      <ChevronRight size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
    </button>
  );
}

const quickActions = [
  { icon: GraduationCap, label: 'Find Scholarships', desc: 'AI-powered matching',          path: '/scholarships', accent: 'y' },
  { icon: BookOpen,       label: 'Find Colleges',     desc: 'Safe, Match and Reach',        path: '/colleges',     accent: 'b' },
  { icon: FileText,       label: 'Write SOP',         desc: 'Generate in 30 seconds',       path: '/sop',          accent: 'y' },
  { icon: Award,          label: 'Request LOR',       desc: 'AI draft + portal link',       path: '/lor',          accent: 'b' },
  { icon: Briefcase,      label: 'Build Resume',       desc: 'ATS-optimized + AI enhance',  path: '/resume',       accent: 'y' },
  { icon: Mic,            label: 'Interview Prep',    desc: 'Practice with AI feedback',    path: '/interview',    accent: 'b' },
  { icon: CheckSquare,    label: 'View Checklist',    desc: 'Track your tasks',             path: '/checklist',    accent: 'y' },
  { icon: BarChart2,      label: 'Analytics',         desc: 'Your complete progress',       path: '/analytics',    accent: 'b' },
];

export default function DashboardPage() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/agent/dashboard-summary');
      setStats(res.data.data);
    } catch { /* silent */ }
    finally  { setLoading(false); }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Hero greeting ── */}
      <div className="afu" style={{
        borderRadius: 20, padding: '32px 36px', marginBottom: 28,
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -40, right: -40, opacity: 0.6 }}>
          <MiniSphere size={120} type="b" style={{ animation: 'float 6s ease-in-out infinite' }} />
        </div>
        <div style={{ position: 'absolute', bottom: -30, right: 100, opacity: 0.4 }}>
          <MiniSphere size={70} type="y" style={{ animation: 'float2 8s ease-in-out infinite' }} />
        </div>

        {/* Glow line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--y), var(--b-1), transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Sparkles size={14} style={{ color: 'var(--y)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--y)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {greeting}
            </span>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, color: 'var(--white)', marginBottom: 8 }}>
            Welcome back, <span style={{ color: 'var(--y)' }}>{firstName}</span> 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 500 }}>
            Your scholarship journey is in progress. Here's what's happening today.
          </p>

          {/* CTA strip */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/scholarships')}
              className="btn-p"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRadius: 10, background: 'var(--g-y)', color: '#000', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              <Zap size={14} /> Find Scholarships
            </button>
            <button onClick={() => navigate('/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRadius: 10, background: 'var(--bg-4)', color: 'var(--white-2)', fontSize: 13, fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--b-border)'; e.currentTarget.style.color = 'var(--b-1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--white-2)'; }}>
              Complete Profile <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={GraduationCap} label="Scholarships Found" value={loading ? '...' : stats?.scholarships || 0}   accent="y" sub="AI-matched for you"     delay={0.05} />
        <StatCard icon={FileText}      label="Documents Created"  value={loading ? '...' : stats?.documents    || 0}   accent="b" sub="SOPs, LORs, Resumes"    delay={0.1}  />
        <StatCard icon={CheckSquare}   label="Tasks Completed"    value={loading ? '...' : `${stats?.tasksCompleted || 0}`} accent="y" sub={`of ${stats?.totalTasks || 0} total`} delay={0.15} />
        <StatCard icon={TrendingUp}    label="Avg Match Score"    value={loading ? '...' : `${stats?.avgMatchScore || 0}%`} accent="b" sub="across all scholarships" delay={0.2} />
      </div>

      {/* ── Application progress ── */}
      {(stats?.totalTasks || 0) > 0 && (
        <div className="afu" style={{ borderRadius: 16, padding: '20px 24px', marginBottom: 28, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>Application Progress</h3>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{stats?.tasksCompleted || 0} of {stats?.totalTasks || 0} tasks completed</p>
            </div>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--y)' }}>
              {stats?.completionPercent || 0}%
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-4)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width:  `${stats?.completionPercent || 0}%`,
              background: 'linear-gradient(90deg, var(--y), var(--b-1))',
              transition: 'width 1s ease',
              boxShadow: '0 0 12px rgba(245,197,24,0.3)',
            }} />
          </div>
        </div>
      )}

      {/* ── Main content grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* Left — Quick actions */}
        <div className="afu d2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>Quick Actions</h2>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{quickActions.length} tools available</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {quickActions.map(({ icon, label, desc, path, accent }) => (
              <QuickAction key={path} icon={icon} label={label} desc={desc} path={path} accent={accent} navigate={navigate} />
            ))}
          </div>
        </div>

        {/* Right — Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Profile completion */}
          <div className="afu d3" style={{ borderRadius: 16, padding: 20, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--y)' }} />
              Profile Strength
            </h3>
            {[
              { label: 'Basic Info',      done: !!(user?.name && user?.email),       path: '/profile'  },
              { label: 'GPA & Scores',    done: false,                                path: '/profile'  },
              { label: 'Target Countries',done: false,                                path: '/profile'  },
              { label: 'Find Scholarships',done: (stats?.scholarships || 0) > 0,     path: '/scholarships' },
              { label: 'Generate SOP',    done: (stats?.documents     || 0) > 0,     path: '/sop'      },
            ].map(({ label, done, path }, i) => (
              <div key={i}
                onClick={() => !done && navigate(path)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', cursor: done ? 'default' : 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background:  done ? 'rgba(245,197,24,0.15)' : 'var(--bg-4)',
                    border:      `1px solid ${done ? 'var(--y-border)' : 'var(--border)'}`,
                    display:     'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize:    9, color: done ? 'var(--y)' : 'var(--muted)', fontWeight: 900,
                  }}>
                    {done ? '✓' : '○'}
                  </div>
                  <span style={{ fontSize: 12, color: done ? 'var(--white-2)' : 'var(--muted)' }}>{label}</span>
                </div>
                {!done && <ChevronRight size={12} style={{ color: 'var(--muted)' }} />}
              </div>
            ))}
          </div>

          {/* Tools grid */}
          <div className="afu d4" style={{ borderRadius: 16, padding: 20, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--b-1)' }} />
              All Tools
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { icon: BookMarked, label: 'Essays',       path: '/essays',        c: 'var(--y)'   },
                { icon: Calculator, label: 'Budget',       path: '/budget',        c: 'var(--b-1)' },
                { icon: Calendar,   label: 'Calendar',     path: '/calendar',      c: 'var(--y)'   },
                { icon: BarChart2,  label: 'Analytics',    path: '/analytics',     c: 'var(--b-1)' },
                { icon: Bell,       label: 'Alerts',       path: '/notifications', c: 'var(--y)'   },
                { icon: Users,      label: 'Compare',      path: '/comparison',    c: 'var(--b-1)' },
              ].map(({ icon: Icon, label, path, c }) => (
                <button key={path} onClick={() => navigate(path)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 6px', borderRadius: 10,
                    background: 'var(--bg-3)', border: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${c}44`; e.currentTarget.style.background = `${c}08`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-3)'; }}>
                  <Icon size={16} style={{ color: c }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tip card */}
          <div className="afu d5" style={{
            borderRadius: 16, padding: 20,
            background: 'linear-gradient(135deg, rgba(245,197,24,0.06), rgba(59,126,255,0.06))',
            border: '1px solid var(--y-border)',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--y-dim)', border: '1px solid var(--y-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={16} style={{ color: 'var(--y)' }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--y)', marginBottom: 4 }}>Pro Tip</p>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--muted)' }}>
                  Complete your profile with GPA, test scores and research interests to get more accurate scholarship matches.
                </p>
                <button onClick={() => navigate('/profile')}
                  style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: 'var(--y)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                  Update Profile <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}