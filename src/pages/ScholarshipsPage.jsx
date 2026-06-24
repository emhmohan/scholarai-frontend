import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  GraduationCap, Sparkles, ExternalLink, Filter,
  TrendingUp, Clock, ChevronDown, Search, RefreshCw,
  CheckCircle, XCircle, BookOpen, ArrowRight, Zap,
} from 'lucide-react';

/* ── Step indicator during AI pipeline ── */
const STEPS = [
  { label: 'Analyzing your profile',       icon: '🧠', color: 'var(--y)'   },
  { label: 'Discovering scholarships',      icon: '🔍', color: 'var(--b-1)' },
  { label: 'Scoring matches 0–100',         icon: '⚡', color: 'var(--y)'   },
  { label: 'Building your strategy',        icon: '🎯', color: 'var(--b-1)' },
];

const STATUS_OPTIONS = ['saved','applying','applied','accepted','rejected'];

const STATUS_STYLE = {
  saved:    { bg: 'rgba(107,107,128,0.15)', color: '#9494b0', border: 'rgba(107,107,128,0.2)' },
  applying: { bg: 'rgba(59,126,255,0.12)',  color: 'var(--b-1)', border: 'var(--b-border)'   },
  applied:  { bg: 'rgba(245,197,24,0.1)',   color: 'var(--y)',   border: 'var(--y-border)'   },
  accepted: { bg: 'rgba(52,211,153,0.12)',  color: '#34d399',   border: 'rgba(52,211,153,0.25)' },
  rejected: { bg: 'rgba(248,113,113,0.1)',  color: '#f87171',   border: 'rgba(248,113,113,0.2)' },
};

function ScoreBadge({ score }) {
  const color = score >= 80 ? 'var(--y)' : score >= 60 ? 'var(--b-1)' : 'var(--muted)';
  const bg    = score >= 80 ? 'var(--y-dim)' : score >= 60 ? 'var(--b-dim)' : 'rgba(255,255,255,0.04)';
  const bdr   = score >= 80 ? 'var(--y-border)' : score >= 60 ? 'var(--b-border)' : 'var(--border)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: bg, border: `2px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 8, color, fontWeight: 700, lineHeight: 1 }}>%</span>
      </div>
      <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>match</span>
    </div>
  );
}

function ScoreBar({ score }) {
  const color = score >= 80 ? 'var(--y)' : score >= 60 ? 'var(--b-1)' : 'var(--muted)';
  return (
    <div style={{ height: 3, borderRadius: 99, background: 'var(--bg-4)', overflow: 'hidden', marginTop: 6 }}>
      <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
    </div>
  );
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [fetching,     setFetching]     = useState(true);
  const [step,         setStep]         = useState(0);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy,       setSortBy]       = useState('matchScore');
  const [updating,     setUpdating]     = useState('');
  const [expanded,     setExpanded]     = useState(null);

  useEffect(() => { fetchScholarships(); }, []);

  useEffect(() => {
    let timer;
    if (loading) {
      setStep(0);
      timer = setInterval(() => {
        setStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const fetchScholarships = async () => {
    setFetching(true);
    try {
      const res = await api.get('/scholarships');
      setScholarships(res.data.data?.scholarships || []);
    } catch { /* silent */ }
    finally  { setFetching(false); }
  };

  const handleFind = async () => {
    setLoading(true);
    try {
      const res = await api.post('/scholarships/suggest');
      const list = res.data.data?.scholarships || [];
      setScholarships(list);
      toast.success(`Found ${list.length} scholarships!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to find scholarships');
    } finally { setLoading(false); }
  };

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/scholarships/${id}`, { status });
      setScholarships((prev) => prev.map((s) => s._id === id ? { ...s, status } : s));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
    finally  { setUpdating(''); }
  };

  const filtered = scholarships
    .filter((s) => statusFilter === 'all' || s.status === statusFilter)
    .filter((s) => !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.provider?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'matchScore' ? (b.matchScore || 0) - (a.matchScore || 0) : new Date(a.deadline || 0) - new Date(b.deadline || 0));

  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = scholarships.filter((x) => x.status === s).length;
    return acc;
  }, {});

  const avgScore = scholarships.length
    ? Math.round(scholarships.reduce((a, b) => a + (b.matchScore || 0), 0) / scholarships.length)
    : 0;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div className="afu" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--y-dim)', border: '1px solid var(--y-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={19} style={{ color: 'var(--y)' }} />
              </div>
              <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--white)' }}>
                Scholarships
              </h1>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 48 }}>
              AI-matched opportunities ranked by your profile fit
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {scholarships.length > 0 && (
              <button onClick={fetchScholarships} disabled={fetching}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--white-2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}>
                <RefreshCw size={13} style={{ animation: fetching ? 'spinSlow 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            )}
            <button onClick={handleFind} disabled={loading}
              className="btn-p"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 22px', borderRadius: 11,
                background: loading ? 'var(--bg-4)' : 'var(--g-y)',
                color: loading ? 'var(--muted)' : '#000',
                fontSize: 13, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              }}>
              <Sparkles size={14} />
              {loading ? 'Running AI...' : scholarships.length > 0 ? 'Re-run AI' : 'Find Scholarships'}
            </button>
          </div>
        </div>
      </div>

      {/* ── AI Loading pipeline ── */}
      {loading && (
        <div className="afu" style={{ borderRadius: 18, padding: '32px 28px', marginBottom: 24, background: 'var(--bg-2)', border: '1px solid var(--y-border)', boxShadow: 'var(--s-y)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--y)', borderTopColor: 'transparent', animation: 'spinSlow 0.8s linear infinite' }} />
            <div>
              <p style={{ fontWeight: 700, color: 'var(--white)', fontSize: 14 }}>AI Pipeline Running</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>This takes 30–60 seconds</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {STEPS.map((s, i) => {
              const done    = i < step;
              const active  = i === step;
              const pending = i > step;
              return (
                <div key={i} style={{
                  borderRadius: 12, padding: '14px 16px',
                  background:  active ? `${s.color === 'var(--y)' ? 'rgba(245,197,24,0.08)' : 'rgba(59,126,255,0.08)'}` : 'var(--bg-3)',
                  border:      active ? `1px solid ${s.color === 'var(--y)' ? 'var(--y-border)' : 'var(--b-border)'}` : '1px solid var(--border)',
                  opacity:     pending ? 0.4 : 1,
                  transition:  'all 0.4s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    {done && <CheckCircle size={14} style={{ color: '#34d399' }} />}
                    {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, animation: 'pulse-y 1s ease-in-out infinite' }} />}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: done ? 'var(--white-2)' : active ? 'var(--white)' : 'var(--muted)' }}>
                    Step {i + 1}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Stats row ── */}
      {scholarships.length > 0 && !loading && (
        <div className="afu" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Found', value: scholarships.length, color: 'var(--y)'   },
            { label: 'Avg Match',   value: `${avgScore}%`,       color: 'var(--b-1)' },
            { label: 'Applying',    value: statusCounts.applying || 0, color: 'var(--b-1)' },
            { label: 'Applied',     value: statusCounts.applied  || 0, color: 'var(--y)'   },
            { label: 'Accepted',    value: statusCounts.accepted || 0, color: '#34d399'     },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ borderRadius: 12, padding: '14px 16px', background: 'var(--bg-2)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color, marginBottom: 3 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      {scholarships.length > 0 && !loading && (
        <div className="afu" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scholarships..."
              style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--white-1)', fontSize: 13, outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--y-border)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', ...STATUS_OPTIONS].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background:  statusFilter === s ? 'var(--y-dim)' : 'var(--bg-3)',
                  color:       statusFilter === s ? 'var(--y)' : 'var(--muted)',
                  border:      `1px solid ${statusFilter === s ? 'var(--y-border)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                }}>
                {s === 'all' ? `All (${scholarships.length})` : `${s} (${statusCounts[s] || 0})`}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--white-2)', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
            <option value="matchScore">Sort by Match Score</option>
            <option value="deadline">Sort by Deadline</option>
          </select>
        </div>
      )}

      {/* ── Scholarship cards ── */}
      {!loading && scholarships.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((s, i) => {
            const statusStyle = STATUS_STYLE[s.status] || STATUS_STYLE.saved;
            const isExp = expanded === s._id;
            const daysLeft = s.deadline ? Math.ceil((new Date(s.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <div key={s._id} className="ch afu"
                style={{
                  borderRadius: 16, overflow: 'hidden',
                  background: 'var(--bg-2)',
                  border: `1px solid ${isExp ? 'var(--y-border)' : 'var(--border)'}`,
                  animationDelay: `${i * 0.03}s`,
                  transition: 'all 0.25s ease',
                }}>

                {/* Card header */}
                <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>

                  {/* Score */}
                  <ScoreBadge score={s.matchScore || 0} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 700, color: 'var(--white)', margin: 0 }}>
                        {s.title}
                      </h3>
                      {s.amount && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'var(--y-dim)', color: 'var(--y)', border: '1px solid var(--y-border)' }}>
                          {s.amount}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{s.provider}</p>

                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      {s.deadline && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Clock size={11} style={{ color: daysLeft !== null && daysLeft <= 30 ? '#f87171' : 'var(--muted)' }} />
                          <span style={{ fontSize: 11, color: daysLeft !== null && daysLeft <= 30 ? '#f87171' : 'var(--muted)', fontWeight: 600 }}>
                            {daysLeft !== null ? (daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`) : new Date(s.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--b-1)', textDecoration: 'none', fontWeight: 600 }}
                          onClick={(e) => e.stopPropagation()}>
                          <ExternalLink size={10} /> Apply Now
                        </a>
                      )}
                    </div>
                    <ScoreBar score={s.matchScore || 0} />
                  </div>

                  {/* Status + expand */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                    <select
                      value={s.status || 'saved'}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(s._id, e.target.value); }}
                      disabled={updating === s._id}
                      style={{
                        padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: statusStyle.bg, color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        cursor: 'pointer', outline: 'none', textTransform: 'capitalize',
                      }}>
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} style={{ background: 'var(--bg-3)', color: 'var(--white-1)', textTransform: 'capitalize' }}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    <button onClick={() => setExpanded(isExp ? null : s._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--y)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}>
                      {isExp ? 'Less' : 'Details'}
                      <ChevronDown size={12} style={{ transform: isExp ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExp && (
                  <div className="afi" style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, paddingTop: 16 }}>

                      {/* AI Analysis */}
                      {s.aiAnalysis && (
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--y)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            <Sparkles size={11} /> AI Analysis
                          </p>
                          {s.aiAnalysis.strengths?.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <p style={{ fontSize: 11, color: '#34d399', fontWeight: 600, marginBottom: 4 }}>Strengths</p>
                              {s.aiAnalysis.strengths.slice(0, 2).map((str, i) => (
                                <p key={i} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 3 }}>• {str}</p>
                              ))}
                            </div>
                          )}
                          {s.aiAnalysis.tips?.length > 0 && (
                            <div>
                              <p style={{ fontSize: 11, color: 'var(--b-1)', fontWeight: 600, marginBottom: 4 }}>Tips</p>
                              {s.aiAnalysis.tips.slice(0, 2).map((tip, i) => (
                                <p key={i} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 3 }}>• {tip}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Requirements */}
                      {s.requirements?.length > 0 && (
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--b-1)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Requirements
                          </p>
                          {s.requirements.slice(0, 4).map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                              <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--b-dim)', border: '1px solid var(--b-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                <span style={{ fontSize: 8, color: 'var(--b-1)', fontWeight: 900 }}>✓</span>
                              </div>
                              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{r}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</p>
                        <textarea
                          defaultValue={s.notes || ''}
                          onBlur={(e) => api.put(`/scholarships/${s._id}`, { notes: e.target.value }).catch(() => {})}
                          placeholder="Add personal notes..."
                          rows={3}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--white-1)', fontSize: 12, outline: 'none', resize: 'none' }}
                          onFocus={(e) => e.target.style.borderColor = 'var(--y-border)'}
                          onBlur2={(e) => e.target.style.borderColor = 'var(--border)'} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !fetching && scholarships.length === 0 && (
        <div className="afu" style={{ borderRadius: 20, padding: '64px 32px', textAlign: 'center', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>

          {/* 3D decoration */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, alignItems: 'center' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'radial-gradient(circle at 33% 33%, rgba(245,197,24,0.8), rgba(245,197,24,0.2) 60%, rgba(5,5,7,0.8))', boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.4), 0 0 20px rgba(245,197,24,0.12)', animation: 'float 5s ease-in-out infinite' }} />
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle at 33% 33%, rgba(59,126,255,0.8), rgba(59,126,255,0.2) 60%, rgba(5,5,7,0.8))', boxShadow: 'inset -6px -6px 16px rgba(0,0,0,0.4), 0 0 30px rgba(59,126,255,0.15)', animation: 'float2 6s ease-in-out infinite' }} />
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'radial-gradient(circle at 33% 33%, rgba(245,197,24,0.8), rgba(245,197,24,0.2) 60%, rgba(5,5,7,0.8))', boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.4), 0 0 20px rgba(245,197,24,0.12)', animation: 'float 7s ease-in-out infinite 1s' }} />
          </div>

          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--white)', marginBottom: 10 }}>
            No scholarships yet
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Click "Find Scholarships" to run the AI pipeline. It analyzes your profile and discovers the best matches from Fulbright, Chevening, DAAD and 50+ others.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleFind} disabled={loading}
              className="btn-p"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: 'var(--g-y)', color: '#000', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              <Sparkles size={16} /> Find Scholarships
            </button>
          </div>

          {/* Feature hints */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 36, maxWidth: 600, margin: '36px auto 0' }}>
            {[
              { icon: '🎓', text: 'Fulbright, Chevening, DAAD' },
              { icon: '⚡', text: '4-step AI scoring pipeline'  },
              { icon: '🎯', text: 'Match scores 0–100'          },
              { icon: '🗺️', text: 'India & global scholarships' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 20, display: 'block', marginBottom: 6 }}>{icon}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── No results after filter ── */}
      {!loading && scholarships.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 16, color: 'var(--white)', fontWeight: 600, marginBottom: 6 }}>No matches found</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Try changing the filter or search term</p>
        </div>
      )}
    </div>
  );
}