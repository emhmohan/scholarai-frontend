import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

function Sphere({ size, style }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'radial-gradient(circle at 33% 33%, rgba(59,126,255,0.85), rgba(59,126,255,0.3) 45%, rgba(5,5,7,0.9) 100%)',
      boxShadow: 'inset -6px -6px 16px rgba(0,0,0,0.5), inset 3px 3px 10px rgba(59,126,255,0.4), 0 0 40px rgba(59,126,255,0.12)',
      ...style,
    }} />
  );
}

function SphereY({ size, style }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'radial-gradient(circle at 33% 33%, rgba(245,197,24,0.9), rgba(245,197,24,0.4) 45%, rgba(5,5,7,0.9) 100%)',
      boxShadow: 'inset -6px -6px 16px rgba(0,0,0,0.5), inset 3px 3px 10px rgba(245,197,24,0.4), 0 0 40px rgba(245,197,24,0.1)',
      ...style,
    }} />
  );
}

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function LoginPage() {
  const navigate            = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) { toast.error('Email and password required'); return; }
    if (!isLogin && !form.name)        { toast.error('Name is required'); return; }
    if (form.password.length < 6)      { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created! Check your email for a welcome message.');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || (isLogin ? 'Login failed' : 'Registration failed'));
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    color: 'var(--white-1)', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const onF = (e) => { e.target.style.borderColor = 'var(--y)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,197,24,0.08)'; };
  const onB = (e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>

      {/* Background */}
      <div className="orb aor"  style={{ width: 500, height: 500, background: 'rgba(59,126,255,0.05)', top: -150, left: -150 }} />
      <div className="orb aor2" style={{ width: 400, height: 400, background: 'rgba(245,197,24,0.04)', bottom: -100, right: -100 }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* 3D objects */}
      <Sphere  size={120} style={{ position: 'absolute', top: '10%', right: '8%',  animation: 'float 7s ease-in-out infinite' }} />
      <SphereY size={80}  style={{ position: 'absolute', bottom: '15%', left: '6%', animation: 'float2 9s ease-in-out infinite' }} />
      <Sphere  size={60}  style={{ position: 'absolute', top: '60%', right: '15%', animation: 'float 5s ease-in-out infinite 1s' }} />

      {/* Card */}
      <div className="afu" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--g-y)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#000', fontFamily: 'Space Grotesk', margin: '0 auto 14px', boxShadow: '0 0 32px rgba(245,197,24,0.25)' }}>
            S
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 26, fontWeight: 900, color: 'var(--white)', marginBottom: 6 }}>
            Scholar<span style={{ color: 'var(--y)' }}>AI</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>AI-powered scholarship platform</p>
        </div>

        {/* Form card */}
        <div style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-2)', border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>

          {/* Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
            {['Sign In', 'Sign Up'].map((label, i) => {
              const active = isLogin ? i === 0 : i === 1;
              return (
                <button key={label} onClick={() => setIsLogin(i === 0)}
                  style={{ padding: '16px', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: active ? 'var(--bg-3)' : 'transparent', color: active ? 'var(--y)' : 'var(--muted)', borderBottom: active ? '2px solid var(--y)' : '2px solid transparent' }}>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Fields */}
          <div style={{ padding: '28px 28px 8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {!isLogin && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)}
                    placeholder="Your full name" style={inputStyle} onFocus={onF} onBlur={onB} />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                <input value={form.email} onChange={(e) => set('email', e.target.value)}
                  type="email" placeholder="you@example.com" style={inputStyle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  onFocus={onF} onBlur={onB} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input value={form.password} onChange={(e) => set('password', e.target.value)}
                    type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    onFocus={onF} onBlur={onB} />
                  <button onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="btn-p"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 12, background: loading ? 'var(--bg-4)' : 'var(--g-y)', color: loading ? 'var(--muted)' : '#000', fontSize: 14, fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 20, marginBottom: 16 }}>
              {loading
                ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--muted)', borderTopColor: 'transparent', animation: 'spinSlow 0.8s linear infinite' }} />
                : <><Sparkles size={16} /> {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={15} /></>}
            </button>

            <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setIsLogin(!isLogin)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--y)', fontWeight: 700, fontSize: 12, padding: 0 }}>
                {isLogin ? 'Sign Up Free' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div style={{ padding: '0 28px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.06em' }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* OAuth buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <a href={`${BACKEND}/api/auth/google`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px', borderRadius: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--white-2)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(66,133,244,0.5)'; e.currentTarget.style.color = '#4285F4'; e.currentTarget.style.background = 'rgba(66,133,244,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--white-2)'; e.currentTarget.style.background = 'var(--bg-3)'; }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </a>

              <a href={`${BACKEND}/api/auth/github`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px', borderRadius: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--white-2)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--white-2)'; e.currentTarget.style.background = 'var(--bg-3)'; }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '12px 28px 20px', borderTop: '1px solid var(--border)' }}>
            {['🔒 Secure', '⚡ Instant Access', '🆓 Always Free'].map((item) => (
              <span key={item} style={{ fontSize: 11, color: 'var(--muted)' }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}