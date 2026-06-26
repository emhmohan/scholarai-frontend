import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { BookOpen, Sparkles, ExternalLink, TrendingUp, ChevronDown, RefreshCw } from 'lucide-react';

const CAT_STYLE = {
  safe:  { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)', label: 'Safe'  },
  match: { color: 'var(--y)', bg: 'var(--y-dim)',          border: 'var(--y-border)',       label: 'Match' },
  reach: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', label: 'Reach' },
};

export default function CollegePage() {
  const [colleges,   setColleges]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [fetching,   setFetching]   = useState(true);
  const [expanded,   setExpanded]   = useState(null);
  const [catFilter,  setCatFilter]  = useState('all');

  useEffect(() => { fetchColleges(); }, []);

  const fetchColleges = async () => {
    setFetching(true);
    try {
      const res = await api.get('/colleges');
      setColleges(res.data.data?.colleges || []);
    } catch { /* silent */ }
    finally  { setFetching(false); }
  };

  const handleFind = async () => {
    setLoading(true);
    try {
      const res = await api.post('/colleges/suggest');
      setColleges(res.data.data?.colleges || []);
      toast.success('Colleges found!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to find colleges');
    } finally { setLoading(false); }
  };

  const filtered = catFilter === 'all' ? colleges : colleges.filter((c) => c.category === catFilter);

  const counts = { safe: colleges.filter((c) => c.category === 'safe').length, match: colleges.filter((c) => c.category === 'match').length, reach: colleges.filter((c) => c.category === 'reach').length };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div className="afu" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--b-dim)', border: '1px solid var(--b-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={19} style={{ color: 'var(--b-1)' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--white)' }}>College Finder</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Safe, Match and Reach colleges based on your profile</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {colleges.length > 0 && (
            <button onClick={fetchColleges}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
              <RefreshCw size={13} /> Refresh
            </button>
          )}
          <button onClick={handleFind} disabled={loading}
            className="btn-p"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 11, background: loading ? 'var(--bg-4)' : 'var(--g-b)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
            <Sparkles size={14} />
            {loading ? 'Finding...' : colleges.length > 0 ? 'Re-run AI' : 'Find Colleges'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="afu" style={{ borderRadius: 18, padding: '32px', marginBottom: 24, background: 'var(--bg-2)', border: '1px solid var(--b-border)', textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--b-1)', borderTopColor: 'transparent', animation: 'spinSlow 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>AI Finding Your Colleges</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Analyzing your profile to find Safe, Match and Reach colleges...</p>
        </div>
      )}

      {/* Stats + filter */}
      {colleges.length > 0 && !loading && (
        <>
          <div className="afu" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
            {Object.entries(CAT_STYLE).map(([cat, style]) => (
              <div key={cat} style={{ borderRadius: 14, padding: '16px 18px', background: 'var(--bg-2)', border: `1px solid ${style.border}`, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setCatFilter(catFilter === cat ? 'all' : cat)}>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 900, color: style.color, marginBottom: 4 }}>{counts[cat]}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: style.color }}>{style.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {cat === 'safe' ? 'High acceptance' : cat === 'match' ? 'Competitive fit' : 'Ambitious target'}
                </div>
              </div>
            ))}
          </div>

          <div className="afu" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['all','safe','match','reach'].map((f) => (
              <button key={f} onClick={() => setCatFilter(f)}
                style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize', background: catFilter === f ? 'var(--b-dim)' : 'var(--bg-3)', color: catFilter === f ? 'var(--b-1)' : 'var(--muted)', border: `1px solid ${catFilter === f ? 'var(--b-border)' : 'var(--border)'}` }}>
                {f === 'all' ? `All (${colleges.length})` : `${f} (${counts[f]})`}
              </button>
            ))}
          </div>
        </>
      )}

      {/* College cards */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((college, i) => {
            const catStyle = CAT_STYLE[college.category] || CAT_STYLE.match;
            const isExp = expanded === college._id;
            return (
              <div key={college._id} className="ch afu"
                style={{ borderRadius: 16, background: 'var(--bg-2)', border: `1px solid ${isExp ? catStyle.border : 'var(--border)'}`, overflow: 'hidden', animationDelay: `${i * 0.03}s` }}>

                <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Category badge */}
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: catStyle.bg, border: `2px solid ${catStyle.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: catStyle.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{catStyle.label}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 700, color: 'var(--white)' }}>{college.name}</h3>
                      {college.ranking && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'var(--b-dim)', color: 'var(--b-1)', border: '1px solid var(--b-border)' }}>
                          #{college.ranking} World
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                      {college.location} {college.program && `· ${college.program}`}
                    </p>
                    {college.acceptanceRate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TrendingUp size={11} style={{ color: catStyle.color }} />
                        <span style={{ fontSize: 11, color: catStyle.color, fontWeight: 600 }}>
                          {college.acceptanceRate}% acceptance rate
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                    {college.url && (
                      <a href={college.url} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--b-1)', textDecoration: 'none', padding: '5px 12px', borderRadius: 8, background: 'var(--b-dim)', border: '1px solid var(--b-border)' }}>
                        <ExternalLink size={11} /> Visit
                      </a>
                    )}
                    <button onClick={() => setExpanded(isExp ? null : college._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {isExp ? 'Less' : 'Details'}
                      <ChevronDown size={12} style={{ transform: isExp ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                    </button>
                  </div>
                </div>

                {isExp && (
                  <div className="afi" style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      {college.tuition && (
                        <div>
                          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Tuition</p>
                          <p style={{ fontSize: 13, color: 'var(--white-2)', fontWeight: 600 }}>{college.tuition}</p>
                        </div>
                      )}
                      {college.deadline && (
                        <div>
                          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Deadline</p>
                          <p style={{ fontSize: 13, color: 'var(--white-2)', fontWeight: 600 }}>{new Date(college.deadline).toLocaleDateString()}</p>
                        </div>
                      )}
                      {college.requirements?.length > 0 && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p style={{ fontSize: 11, color: 'var(--b-1)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Requirements</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {college.requirements.map((r, i) => (
                              <span key={i} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--white-2)' }}>{r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {college.whyGood && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p style={{ fontSize: 11, color: 'var(--y)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Why it fits you</p>
                          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{college.whyGood}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && !fetching && colleges.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 32px', borderRadius: 20, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24, alignItems: 'center' }}>
            {[80,110,70].map((s, i) => (
              <div key={i} style={{ width: s, height: s, borderRadius: '50%', background: i === 1 ? 'radial-gradient(circle at 33% 33%, rgba(59,126,255,0.85), rgba(59,126,255,0.3) 50%, rgba(5,5,7,0.9))' : 'radial-gradient(circle at 33% 33%, rgba(245,197,24,0.85), rgba(245,197,24,0.3) 50%, rgba(5,5,7,0.9))', boxShadow: `inset -6px -6px 16px rgba(0,0,0,0.4), 0 0 ${s/3}px ${i===1 ? 'rgba(59,126,255,0.15)' : 'rgba(245,197,24,0.12)'}`, animation: `float ${5+i}s ease-in-out infinite ${i*0.5}s` }} />
            ))}
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--white)', marginBottom: 10 }}>No colleges yet</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Find Safe, Match and Reach colleges based on your GPA, test scores, field and target countries.
          </p>
          <button onClick={handleFind} disabled={loading}
            className="btn-p"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: 'var(--g-b)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            <Sparkles size={16} /> Find My Colleges
          </button>
        </div>
      )}
    </div>
  );
}