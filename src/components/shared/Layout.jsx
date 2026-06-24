import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ChatWidget from './ChatWidget';
import {
  LayoutDashboard, GraduationCap, FileText, Award,
  Briefcase, CheckSquare, User, LogOut, BookOpen,
  Mic, BookMarked, Calculator, Calendar, BarChart2,
  Bell, Users, Menu, X, ChevronDown, Sparkles, Search,
} from 'lucide-react';

const navMain = [
  { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/scholarships', label: 'Scholarships', icon: GraduationCap   },
  { path: '/colleges',     label: 'Colleges',     icon: BookOpen        },
  { path: '/sop',          label: 'SOP',          icon: FileText        },
  { path: '/lor',          label: 'LOR',          icon: Award           },
  { path: '/resume',       label: 'Resume',       icon: Briefcase       },
];

const navMore = [
  { path: '/checklist',     label: 'Checklist',     icon: CheckSquare  },
  { path: '/interview',     label: 'Interview',     icon: Mic          },
  { path: '/essays',        label: 'Essay Bank',    icon: BookMarked   },
  { path: '/budget',        label: 'Budget',        icon: Calculator   },
  { path: '/calendar',      label: 'Calendar',      icon: Calendar     },
  { path: '/analytics',     label: 'Analytics',     icon: BarChart2    },
  { path: '/notifications', label: 'Notifications', icon: Bell         },
  { path: '/comparison',    label: 'Peer Compare',  icon: Users        },
];

export default function Layout({ children }) {
  const { user, logout }     = useAuth();
  const navigate             = useNavigate();
  const location             = useLocation();
  const [scrolled,  setScrolled]  = useState(false);
  const [moreOpen,  setMoreOpen]  = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);
  const [mobileOpen,setMobileOpen]= useState(false);
  const moreRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setMoreOpen(false); setUserOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isMoreActive = navMore.some((n) => location.pathname === n.path);

  const navLinkStyle = (isActive) => ({
    display:        'flex',
    alignItems:     'center',
    gap:            6,
    padding:        '7px 12px',
    borderRadius:   8,
    fontSize:       13,
    fontWeight:     600,
    textDecoration: 'none',
    color:          isActive ? 'var(--y)' : 'var(--muted)',
    background:     isActive ? 'rgba(245,197,24,0.08)' : 'transparent',
    borderBottom:   isActive ? '2px solid var(--y)' : '2px solid transparent',
    transition:     'all 0.2s',
    whiteSpace:     'nowrap',
  });

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Top Nav ── */}
      <header style={{
        position:       'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height:         'var(--nav-h)',
        background:     scrolled ? 'rgba(5,5,7,0.96)' : 'rgba(5,5,7,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom:   scrolled ? '1px solid rgba(245,197,24,0.1)' : '1px solid rgba(255,255,255,0.05)',
        boxShadow:      scrolled ? '0 4px 32px rgba(0,0,0,0.5)' : 'none',
        transition:     'all 0.3s ease',
      }}>
        <div style={{ height: '100%', maxWidth: 1440, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* Logo */}
          <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--g-y)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#000', fontFamily: 'Space Grotesk', flexShrink: 0 }}>S</div>
            <span className="hide-sm" style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 16, color: 'var(--white)' }}>
              Scholar<span style={{ color: 'var(--y)' }}>AI</span>
            </span>
          </NavLink>

          {/* Divider */}
          <div className="hide-sm" style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

          {/* Main nav */}
          <nav className="hide-sm" style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {navMain.map(({ path, label, icon: Icon }) => (
              <NavLink key={path} to={path}
                style={({ isActive }) => navLinkStyle(isActive)}
                onMouseEnter={(e) => { if (!e.currentTarget.style.color.includes('245')) { e.currentTarget.style.color = 'var(--white-1)'; }}}
                onMouseLeave={(e) => { if (!e.currentTarget.style.color.includes('245')) { e.currentTarget.style.color = 'var(--muted)'; }}}>
                <Icon size={14} />
                {label}
              </NavLink>
            ))}

            {/* More dropdown */}
            <div ref={moreRef} style={{ position: 'relative' }}>
              <button onClick={() => setMoreOpen(!moreOpen)}
                style={{
                  ...navLinkStyle(isMoreActive || moreOpen),
                  color:      isMoreActive || moreOpen ? 'var(--y)' : 'var(--muted)',
                  background: isMoreActive || moreOpen ? 'rgba(245,197,24,0.08)' : 'transparent',
                  border:     'none',
                  cursor:     'pointer',
                }}>
                <Sparkles size={14} />
                Tools
                <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: moreOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {moreOpen && (
                <div className="afi" style={{
                  position:   'absolute', top: '100%', left: '50%',
                  transform:  'translateX(-50%)',
                  marginTop:  8, width: 220, borderRadius: 14,
                  background: 'var(--bg-2)',
                  border:     '1px solid rgba(245,197,24,0.12)',
                  boxShadow:  '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
                  overflow:   'hidden',
                  zIndex:     200,
                }}>
                  {/* Header */}
                  <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>More Tools</span>
                  </div>
                  <div style={{ padding: 6 }}>
                    {navMore.map(({ path, label, icon: Icon }) => (
                      <NavLink key={path} to={path}
                        style={({ isActive }) => ({
                          display:        'flex', alignItems: 'center', gap: 10,
                          padding:        '9px 12px', borderRadius: 9,
                          fontSize:       13, fontWeight: 500, textDecoration: 'none',
                          color:          isActive ? 'var(--y)' : 'var(--white-2)',
                          background:     isActive ? 'rgba(245,197,24,0.08)' : 'transparent',
                          transition:     'all 0.15s',
                        })}
                        onMouseEnter={(e) => { if (!e.currentTarget.style.color.includes('245')) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--white)'; }}}
                        onMouseLeave={(e) => { if (!e.currentTarget.style.color.includes('245')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--white-2)'; }}}>
                        <Icon size={14} style={{ opacity: 0.7 }} />
                        {label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>

            {/* Notifications */}
            <NavLink to="/notifications" className="hide-sm"
              style={({ isActive }) => ({
                width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-3)', border: `1px solid ${isActive ? 'var(--y-border)' : 'var(--border)'}`,
                color: isActive ? 'var(--y)' : 'var(--muted)', textDecoration: 'none', transition: 'all 0.2s',
              })}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--y-border)'; e.currentTarget.style.color = 'var(--y)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}>
              <Bell size={15} />
            </NavLink>

            {/* User menu */}
            <div ref={userRef} style={{ position: 'relative' }}>
              <button onClick={() => setUserOpen(!userOpen)}
                style={{
                  display:     'flex', alignItems: 'center', gap: 8,
                  padding:     '6px 10px', borderRadius: 10,
                  background:  'var(--bg-3)',
                  border:      `1px solid ${userOpen ? 'var(--y-border)' : 'var(--border)'}`,
                  color:       'var(--white-2)', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--g-y)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#000' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hide-sm" style={{ fontSize: 13, fontWeight: 600, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown size={12} style={{ color: 'var(--muted)', transition: 'transform 0.2s', transform: userOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {userOpen && (
                <div className="afi" style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  width: 220, borderRadius: 14,
                  background: 'var(--bg-2)',
                  border: '1px solid rgba(245,197,24,0.12)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
                  overflow: 'hidden', zIndex: 200,
                }}>
                  {/* User info */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--g-y)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#000', flexShrink: 0 }}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</p>
                    </div>
                  </div>

                  <div style={{ padding: 6 }}>
                    {[
                      { to: '/profile',   label: 'Profile Settings', icon: User,     color: 'var(--y)'   },
                      { to: '/analytics', label: 'Analytics',         icon: BarChart2, color: 'var(--b-1)' },
                      { to: '/comparison',label: 'Peer Compare',      icon: Users,    color: 'var(--b-1)' },
                    ].map(({ to, label, icon: Icon, color }) => (
                      <NavLink key={to} to={to}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 500, textDecoration: 'none', color: 'var(--white-2)', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--white)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--white-2)'; }}>
                        <Icon size={14} style={{ color }} />
                        {label}
                      </NavLink>
                    ))}
                  </div>

                  <div style={{ padding: 6, borderTop: '1px solid var(--border)' }}>
                    <button onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'all 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="show-sm"
              style={{
                width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: mobileOpen ? 'rgba(245,197,24,0.1)' : 'var(--bg-3)',
                border: `1px solid ${mobileOpen ? 'var(--y-border)' : 'var(--border)'}`,
                color: mobileOpen ? 'var(--y)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, paddingTop: 'var(--nav-h)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)} />
          <div className="asi" style={{ position: 'relative', width: 260, height: '100%', background: 'var(--bg-2)', borderRight: '1px solid var(--y-border)', overflowY: 'auto' }}>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...navMain, ...navMore].map(({ path, label, icon: Icon }) => (
                <NavLink key={path} to={path}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: 10,
                    fontSize: 14, fontWeight: 600, textDecoration: 'none',
                    color:      isActive ? 'var(--y)' : 'var(--white-2)',
                    background: isActive ? 'rgba(245,197,24,0.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--y)' : '3px solid transparent',
                  })}>
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid var(--border)', marginTop: 8 }}>
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, width: '100%', fontSize: 14, fontWeight: 600, color: '#f87171', background: 'rgba(248,113,113,0.06)', border: 'none', cursor: 'pointer' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Content ── */}
      <main className="afu" style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 20px 60px' }}>
          {children}
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}