import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, FileText, Award, Briefcase,
  CheckSquare, ArrowRight, Star, Zap, Globe,
  Shield, TrendingUp, Users, BookOpen, Mic,
  ChevronRight, Sparkles, BarChart2, Calendar,
} from 'lucide-react';

/* ─── 3D Floating Sphere Component ─── */
function Sphere3D({ size = 200, colorClass = 'sphere', style = {} }) {
  return (
    <div
      className={`${colorClass} afl`}
      style={{ width: size, height: size, flexShrink: 0, ...style }}
    />
  );
}

/* ─── 3D Rotating Ring ─── */
function Ring3D({ size = 160, color = 'rgba(59,126,255,0.5)', speed = '8s', reverse = false }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ animation: `${reverse ? 'spinRev' : 'spinSlow'} ${speed} linear infinite` }}>
        <ellipse
          cx={size / 2} cy={size / 2}
          rx={size / 2 - 4} ry={size / 4}
          fill="none" stroke={color} strokeWidth="2"
          strokeDasharray="8 6"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
    </div>
  );
}

/* ─── 3D Cube ─── */
function Cube3D({ size = 80, color = '#3b7eff' }) {
  const s = size;
  const h = size / 2;
  return (
    <div style={{ width: s, height: s, position: 'relative', animation: 'spinSlow 10s linear infinite', transformStyle: 'preserve-3d' }}>
      <svg width={s * 1.5} height={s * 1.5} viewBox="0 0 120 120"
        style={{ filter: `drop-shadow(0 0 12px ${color}44)`, animation: 'bounce3d 5s ease-in-out infinite' }}>
        {/* Top face */}
        <polygon points="60,10 100,30 60,50 20,30"
          fill={`${color}22`} stroke={color} strokeWidth="1.5" opacity="0.9" />
        {/* Left face */}
        <polygon points="20,30 60,50 60,90 20,70"
          fill={`${color}11`} stroke={color} strokeWidth="1.5" opacity="0.7" />
        {/* Right face */}
        <polygon points="100,30 60,50 60,90 100,70"
          fill={`${color}18`} stroke={color} strokeWidth="1.5" opacity="0.8" />
        {/* Inner lines */}
        <line x1="60" y1="50" x2="60" y2="10" stroke={color} strokeWidth="1" opacity="0.4" />
        <line x1="60" y1="50" x2="20" y2="30" stroke={color} strokeWidth="1" opacity="0.4" />
        <line x1="60" y1="50" x2="100" y2="30" stroke={color} strokeWidth="1" opacity="0.4" />
      </svg>
    </div>
  );
}

/* ─── Floating Pyramid ─── */
function Pyramid3D({ color = '#f5c518' }) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100"
      style={{ filter: `drop-shadow(0 0 14px ${color}55)`, animation: 'float2 7s ease-in-out infinite' }}>
      <polygon points="50,8 90,80 50,65 10,80"
        fill={`${color}18`} stroke={color} strokeWidth="1.5" />
      <polygon points="50,8 10,80 50,65"
        fill={`${color}10`} stroke={color} strokeWidth="1" />
      <polygon points="50,8 90,80 50,65"
        fill={`${color}14`} stroke={color} strokeWidth="1" />
      <line x1="50" y1="8" x2="50" y2="65" stroke={color} strokeWidth="1" opacity="0.5" strokeDasharray="3 2" />
    </svg>
  );
}

/* ─── Torus / Donut ─── */
function Torus3D({ size = 120, color = '#3b7eff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120"
      style={{
        filter: `drop-shadow(0 0 12px ${color}66)`,
        animation: 'spinSlow 8s linear infinite',
      }}>
      <ellipse cx="60" cy="60" rx="48" ry="20" fill="none" stroke={color} strokeWidth="8" opacity="0.15" />
      <ellipse cx="60" cy="60" rx="48" ry="20" fill="none" stroke={color} strokeWidth="2" opacity="0.8"
        strokeDasharray="12 8" />
      <ellipse cx="60" cy="60" rx="30" ry="12" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

/* ─── Floating Particles ─── */
function Particles() {
  const positions = [
    { x: '10%', y: '20%', size: 3, color: 'var(--y)',   delay: '0s'   },
    { x: '85%', y: '15%', size: 2, color: 'var(--b-1)', delay: '1s'   },
    { x: '25%', y: '70%', size: 4, color: 'var(--y)',   delay: '2s'   },
    { x: '70%', y: '60%', size: 2, color: 'var(--b-1)', delay: '0.5s' },
    { x: '50%', y: '85%', size: 3, color: 'var(--y)',   delay: '1.5s' },
    { x: '90%', y: '45%', size: 2, color: 'var(--b-1)', delay: '3s'   },
    { x: '15%', y: '45%', size: 3, color: 'var(--b-1)', delay: '2.5s' },
    { x: '60%', y: '25%', size: 2, color: 'var(--y)',   delay: '0.8s' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {positions.map((p, i) => (
        <div key={i} style={{
          position:        'absolute',
          left:            p.x,
          top:             p.y,
          width:           p.size,
          height:          p.size,
          borderRadius:    '50%',
          background:      p.color,
          boxShadow:       `0 0 ${p.size * 3}px ${p.color}`,
          animation:       `float ${3 + i * 0.5}s ease-in-out infinite`,
          animationDelay:  p.delay,
          opacity:         0.7,
        }} />
      ))}
    </div>
  );
}

/* ─── Grid Pattern ─── */
function GridBg({ opacity = 0.04 }) {
  return (
    <div style={{
      position:        'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `
        linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)
      `,
      backgroundSize: '48px 48px',
    }} />
  );
}

/* ─── Feature Card ─── */
const features = [
  { icon: GraduationCap, title: 'Scholarship Finder',   desc: 'AI matches you with Fulbright, Chevening, DAAD and 50+ real verified scholarships. 4-step pipeline scores 0–100.',  accent: 'y', tag: 'Most Popular' },
  { icon: BookOpen,       title: 'College Finder',       desc: 'Safe, Match and Reach colleges with AI-powered recommendations and verified admission requirements.',                   accent: 'b', tag: null         },
  { icon: FileText,       title: 'SOP Generator',        desc: '1000-word polished Statement of Purpose in 30 seconds. Version history, comparison and public sharing.',              accent: 'y', tag: 'AI Powered'  },
  { icon: Award,          title: 'LOR Writer',           desc: 'AI drafts Letters from recommender perspective. Professors edit via secure portal and submit directly.',              accent: 'b', tag: null         },
  { icon: Briefcase,      title: 'Resume Builder',       desc: 'ATS-optimized resume with AI STAR-method bullets, missing section detector and keyword suggestions.',                 accent: 'y', tag: null         },
  { icon: Mic,            title: 'Interview Prep',       desc: '10 tailored questions with AI scoring, sample answers, tips and downloadable PDF prep guide.',                        accent: 'b', tag: 'New'         },
  { icon: CheckSquare,    title: 'Smart Checklist',      desc: '25 personalized tasks across 6 categories. Priority sorting and AI task suggestions.',                                accent: 'y', tag: null         },
  { icon: BarChart2,      title: 'Analytics',            desc: 'Pipeline charts, match score distribution, task completion rings and monthly activity bar chart.',                    accent: 'b', tag: null         },
  { icon: Users,          title: 'Peer Comparison',      desc: 'Anonymous benchmarking. See how your GPA, match scores and progress compare to other applicants.',                   accent: 'y', tag: null         },
];

const steps = [
  { n: '01', title: 'Build Profile',      desc: 'GPA, test scores, research interests, target countries. AI uses this for perfect matching.',       accent: 'y' },
  { n: '02', title: 'Find Scholarships',  desc: '4-step AI pipeline — profile analysis, discovery, scoring and strategy generation.',              accent: 'b' },
  { n: '03', title: 'Generate Docs',      desc: 'SOP, LOR, Resume — all in seconds. Share with mentors. Professors submit LOR via portal.',        accent: 'y' },
  { n: '04', title: 'Track & Apply',      desc: 'Checklist, calendar, budget — all in one place. Analytics shows your complete progress.',         accent: 'b' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--white-1)', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '68px',
        background: 'rgba(5,5,7,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ height: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--g-y)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#000', fontFamily: 'Space Grotesk' }}>S</div>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 18, color: 'var(--white)' }}>
              Scholar<span style={{ color: 'var(--y)' }}>AI</span>
            </span>
          </div>

          <div className="hide-sm" style={{ display: 'flex', gap: 32 }}>
            {['Features','Process','Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--white-1)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/login')}
              style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid var(--border-2)', background: 'transparent', color: 'var(--white-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--y-border)'; e.currentTarget.style.color = 'var(--y)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--white-2)'; }}>
              Sign In
            </button>
            <button onClick={() => navigate('/login')}
              className="btn-p"
              style={{ padding: '8px 20px', borderRadius: 10, background: 'var(--g-y)', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', paddingTop: '68px', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

        {/* Background */}
        <div className="orb aor"  style={{ width: 500, height: 500, background: 'rgba(59,126,255,0.06)', top: -100, left: -150 }} />
        <div className="orb aor2" style={{ width: 400, height: 400, background: 'rgba(245,197,24,0.05)', bottom: -100, right: -100 }} />
        <GridBg opacity={0.035} />
        <Particles />

        {/* 3D Objects floating around */}
        <div className="hide-sm" style={{ position: 'absolute', top: '15%', right: '5%', zIndex: 1 }}>
          <Sphere3D size={160} colorClass="sphere afl" style={{ animationDelay: '0s' }} />
        </div>
        <div className="hide-sm" style={{ position: 'absolute', bottom: '20%', left: '4%', zIndex: 1 }}>
          <Sphere3D size={100} colorClass="sphere-y afl2" style={{ animationDelay: '1s' }} />
        </div>
        <div className="hide-sm" style={{ position: 'absolute', top: '60%', right: '12%', zIndex: 1 }}>
          <Cube3D size={80} color="#3b7eff" />
        </div>
        <div className="hide-sm" style={{ position: 'absolute', top: '25%', left: '6%', zIndex: 1 }}>
          <Pyramid3D color="#f5c518" />
        </div>
        <div className="hide-sm" style={{ position: 'absolute', bottom: '35%', right: '5%', zIndex: 1 }}>
          <Torus3D size={100} color="#3b7eff" />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto', padding: '60px 24px', textAlign: 'center', width: '100%' }}>

          {/* Badge */}
          <div className="afu" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'var(--b-dim)', border: '1px solid var(--b-border)', marginBottom: 28 }}>
            <Sparkles size={13} style={{ color: 'var(--b-1)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--b-1)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              AI-Powered · 100% Free
            </span>
          </div>

          {/* Headline */}
          <h1 className="afu d1" style={{ fontSize: 'clamp(2.8rem,7vw,5.5rem)', fontWeight: 900, marginBottom: 24, color: 'var(--white)', lineHeight: 1.05 }}>
            Win Scholarships<br />
            <span className="tg-yb">with AI Precision</span>
          </h1>

          <p className="afu d2" style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'var(--muted)', maxWidth: 560, margin: '0 auto 44px', lineHeight: 1.75 }}>
            Find matching scholarships, generate polished SOPs and LORs,
            prep for interviews and track every deadline — all powered by AI.
          </p>

          {/* CTA */}
          <div className="afu d3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <button onClick={() => navigate('/login')}
              className="btn-p"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 32px', borderRadius: 14,
                background: 'var(--g-y)', color: '#000',
                fontSize: 15, fontWeight: 800, cursor: 'pointer', border: 'none',
                boxShadow: '0 0 40px rgba(245,197,24,0.25)',
              }}>
              Start for Free <ArrowRight size={17} />
            </button>
            <button onClick={() => navigate('/login')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 28px', borderRadius: 14,
                background: 'var(--bg-3)', color: 'var(--white-2)',
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                border: '1px solid var(--border-2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--b-border)'; e.currentTarget.style.color = 'var(--b-1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--white-2)'; }}>
              View Dashboard
            </button>
          </div>

          {/* Social proof */}
          <div className="afu d4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {['F','K','A','R','M'].map((l, i) => (
                <div key={i} style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: i % 2 === 0 ? 'var(--g-y)' : 'var(--g-b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: i % 2 === 0 ? '#000' : '#fff',
                  border: '2px solid var(--bg)', marginLeft: i === 0 ? 0 : -8,
                }}>
                  {l}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1,2,3,4,5].map((i) => <Star key={i} size={12} fill="var(--y)" style={{ color: 'var(--y)' }} />)}
            </div>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>1,000+ students trust ScholarAI</span>
          </div>

          {/* Dashboard preview card */}
          <div className="afu d5" style={{
            marginTop: 60,
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(59,126,255,0.08)',
            transform: 'perspective(1200px) rotateX(4deg)',
            maxWidth: 860,
            margin: '60px auto 0',
          }}>
            {/* Browser bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
              {['#f87171','#fbbf24','#34d399'].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
              <div style={{ flex: 1, margin: '0 12px', padding: '3px 12px', borderRadius: 6, background: 'var(--bg-4)', fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
                app.scholarai.io/dashboard
              </div>
            </div>

            {/* Dashboard content */}
            <div style={{ padding: 20, background: 'var(--bg-1)' }}>
              {/* Top nav bar preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '8px 12px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--g-y)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#000' }}>S</div>
                {['Dashboard','Scholarships','Colleges','SOP','LOR','Resume','More ▾'].map((item, i) => (
                  <span key={i} style={{ fontSize: 11, color: i === 0 ? 'var(--y)' : 'var(--muted)', fontWeight: i === 0 ? 700 : 400 }}>{item}</span>
                ))}
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
                {[
                  { v: '88',   l: 'Scholarships',  c: 'var(--y)'   },
                  { v: '92%',  l: 'Avg Match',      c: 'var(--b-1)' },
                  { v: '6',    l: 'Documents',      c: 'var(--y)'   },
                  { v: '73%',  l: 'Tasks Done',     c: 'var(--b-1)' },
                ].map(({ v, l, c }) => (
                  <div key={l} style={{ borderRadius: 10, padding: '10px 12px', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: c, fontFamily: 'Space Grotesk', marginBottom: 2 }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Scholarship bars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { name: 'Fulbright',       score: 94, c: 'var(--y)'   },
                  { name: 'Chevening',       score: 87, c: 'var(--b-1)' },
                  { name: 'Gates Cambridge', score: 79, c: 'var(--y)'   },
                ].map(({ name, score, c }) => (
                  <div key={name} style={{ borderRadius: 10, padding: '10px 12px', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: 'var(--white-2)', fontWeight: 600 }}>{name}</span>
                      <span style={{ fontSize: 10, color: c, fontWeight: 700 }}>{score}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: 'var(--bg-4)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${score}%`, background: c, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ padding: '60px 24px', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40, textAlign: 'center' }}>
          {[
            { v: '50+',  l: 'Scholarships',   s: 'real verified links'     },
            { v: '4',    l: 'AI Agents',       s: 'working in parallel'     },
            { v: '30s',  l: 'SOP Generated',   s: 'from a blank slate'      },
            { v: '$0',   l: 'Total Cost',       s: 'completely free forever' },
          ].map(({ v, l, s }, i) => (
            <div key={i} className={`afu d${i + 1}`}>
              <div className="tg-yb" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, fontFamily: 'Space Grotesk', marginBottom: 4 }}>{v}</div>
              <p style={{ fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>{l}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '100px 24px', position: 'relative' }}>
        <div className="orb" style={{ width: 300, height: 300, background: 'rgba(59,126,255,0.05)', top: '20%', right: '-100px', animation: 'orb 12s ease-in-out infinite' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="tag tag-b" style={{ marginBottom: 16 }}>Features</div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--white)', marginBottom: 14 }}>
              Everything to win scholarships
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto' }}>
              12 AI-powered tools built specifically for scholarship applicants
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
            {features.map(({ icon: Icon, title, desc, accent, tag }, i) => {
              const isY = accent === 'y';
              const c   = isY ? 'var(--y)' : 'var(--b-1)';
              const dim = isY ? 'var(--y-dim)' : 'var(--b-dim)';
              const bdr = isY ? 'var(--y-border)' : 'var(--b-border)';
              return (
                <div key={i} className="ch"
                  style={{
                    borderRadius: 16,
                    padding: 24,
                    background:  'var(--bg-2)',
                    border:      '1px solid var(--border)',
                    cursor:      'pointer',
                    animationDelay: `${i * 0.04}s`,
                    position:    'relative',
                    overflow:    'hidden',
                  }}>
                  {/* Subtle top glow */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${c}44, transparent)` }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: dim, border: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} style={{ color: c }} />
                    </div>
                    {tag && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: dim, color: c, border: `1px solid ${bdr}`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {tag}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'var(--white)', marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--muted)' }}>{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3D Visual break section ── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div className="orb aor" style={{ width: 400, height: 400, background: 'rgba(245,197,24,0.05)', top: '-100px', left: '-100px' }} />
        <div className="orb aor2" style={{ width: 300, height: 300, background: 'rgba(59,126,255,0.05)', bottom: '-80px', right: '-80px' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 60, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>

          <div style={{ flex: 1, minWidth: 280 }}>
            <div className="tag tag-y" style={{ marginBottom: 20 }}>AI Pipeline</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: 'var(--white)', marginBottom: 16 }}>
              4-step AI pipeline finds<br />
              <span className="tg-y">your perfect match</span>
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.75, marginBottom: 28 }}>
              Our scholarship agent runs four parallel AI models — profile analysis, discovery, match scoring, and strategy — to find and rank the best opportunities for you.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { step: '01', label: 'Profile Analysis',     color: 'var(--y)'   },
                { step: '02', label: 'Scholarship Discovery', color: 'var(--b-1)' },
                { step: '03', label: 'Match Scoring 0–100',  color: 'var(--y)'   },
                { step: '04', label: 'Strategy Generation',  color: 'var(--b-1)' },
              ].map(({ step, label, color }) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color, flexShrink: 0 }}>
                    {step}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--white-2)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Objects cluster */}
          <div style={{ position: 'relative', width: 320, height: 320, flexShrink: 0 }}>
            {/* Center sphere */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
              <Sphere3D size={140} colorClass="sphere afl" />
            </div>
            {/* Orbiting ring */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
              <Ring3D size={220} color="rgba(245,197,24,0.4)" speed="6s" />
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(60deg)' }}>
              <Ring3D size={200} color="rgba(59,126,255,0.3)" speed="10s" reverse />
            </div>
            {/* Satellite spheres */}
            <div style={{ position: 'absolute', top: '5%', left: '10%' }}>
              <Sphere3D size={50} colorClass="sphere-y afl2" />
            </div>
            <div style={{ position: 'absolute', bottom: '8%', right: '5%' }}>
              <Sphere3D size={40} colorClass="sphere afl" style={{ animationDelay: '2s' }} />
            </div>
            <div style={{ position: 'absolute', top: '15%', right: '5%' }}>
              <Cube3D size={55} color="#f5c518" />
            </div>
            <div style={{ position: 'absolute', bottom: '10%', left: '0%' }}>
              <Pyramid3D color="#3b7eff" />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="process" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="tag tag-b" style={{ marginBottom: 16 }}>Process</div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--white)', marginBottom: 14 }}>From profile to acceptance</h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.05rem' }}>4 steps to maximize your scholarship chances</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {steps.map(({ n, title, desc, accent }, i) => {
              const c   = accent === 'y' ? 'var(--y)' : 'var(--b-1)';
              const dim = accent === 'y' ? 'var(--y-dim)' : 'var(--b-dim)';
              return (
                <div key={i} className="ch"
                  style={{ borderRadius: 16, padding: 28, background: 'var(--bg-2)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: 56, fontWeight: 900, fontFamily: 'Space Grotesk', color: c, opacity: 0.18, lineHeight: 1, marginBottom: 12 }}>{n}</div>
                  <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 17, color: 'var(--white)', marginBottom: 10 }}>{title}</h3>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--muted)' }}>{desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, fontSize: 12, fontWeight: 700, color: c }}>
                    Step {n} <ChevronRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '100px 24px', background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="tag tag-y" style={{ marginBottom: 20 }}>Pricing</div>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--white)', marginBottom: 12 }}>Completely free. Always.</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginBottom: 50 }}>No credit card. No trial. No hidden fees.</p>

          <div style={{
            borderRadius: 24, padding: '50px 40px',
            background: 'var(--bg-1)', position: 'relative', overflow: 'hidden',
            border: '1px solid var(--y-border)',
            boxShadow: 'var(--s-y)',
          }}>
            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: 'var(--g-y)', borderRadius: 99 }} />

            <div className="tg-y" style={{ fontSize: 80, fontWeight: 900, fontFamily: 'Space Grotesk', lineHeight: 1, marginBottom: 8 }}>$0</div>
            <p style={{ color: 'var(--muted)', marginBottom: 40, fontSize: '1.05rem' }}>per month, every month</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, textAlign: 'left', marginBottom: 40 }}>
              {[
                'AI Scholarship Finder (50+ real scholarships)',
                'SOP + LOR Generator with version history',
                'College Finder — Safe, Match, Reach',
                'Resume Builder + AI Enhancement',
                'Interview Prep with AI feedback',
                'Essay Bank with AI adaptation',
                'Budget Planner + Deadline Calendar',
                'Analytics Dashboard + Peer Comparison',
                'Email Notifications via Resend',
                'Share SOP + Recommender Portal',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--y-dim)', border: '1px solid var(--y-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ color: 'var(--y)', fontSize: 9, fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--white-2)', lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/login')}
              className="btn-p"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 44px', borderRadius: 14, margin: '0 auto',
                background: 'var(--g-y)', color: '#000',
                fontSize: 16, fontWeight: 800, cursor: 'pointer', border: 'none',
                boxShadow: '0 0 40px rgba(245,197,24,0.25)',
              }}>
              Get Started Free <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 20 }}>
              {[
                { icon: Shield, text: 'No credit card'  },
                { icon: Zap,    text: 'Instant access'   },
                { icon: Globe,  text: 'Works worldwide'  },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                  <Icon size={13} style={{ color: 'var(--y)' }} /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="orb aor" style={{ width: 400, height: 400, background: 'rgba(245,197,24,0.04)', top: '-100px', left: '50%', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'var(--white)', marginBottom: 14 }}>
            Ready to win your dream scholarship?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginBottom: 36 }}>
            Join 1,000+ students applying smarter with AI
          </p>
          <button onClick={() => navigate('/login')}
            className="btn-p"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '16px 44px', borderRadius: 14,
              background: 'var(--g-y)', color: '#000',
              fontSize: 16, fontWeight: 800, cursor: 'pointer', border: 'none',
              boxShadow: '0 0 60px rgba(245,197,24,0.2)',
            }}>
            Start Free — No Card Required <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--g-y)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#000' }}>S</div>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--white)' }}>Scholar<span style={{ color: 'var(--y)' }}>AI</span></span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Built with Groq · MongoDB Atlas · Vercel · $0/month</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy','Terms','GitHub'].map((item) => (
              <a key={item} href="#" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--y)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}