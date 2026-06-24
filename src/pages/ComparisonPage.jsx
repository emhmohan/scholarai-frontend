import { useState, useEffect } from 'react';
import { Users, TrendingUp, Award, CheckSquare, BarChart2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

function Ring({ percent, color, size = 100 }) {
  const r    = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const off  = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-4)" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x={size/2} y={size/2+5} textAnchor="middle" fill={color} fontSize="13" fontWeight="900" fontFamily="Space Grotesk">{percent}%</text>
    </svg>
  );
}

export default function ComparisonPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.get('/comparison/stats');
      setData(res.data.data);
    } catch { toast.error('Failed to load comparison'); }
    finally  { setLoading(false); }
  };

  const rankColor = (r) => r >= 75 ? '#34d399' : r >= 50 ? 'var(--y)' : r >= 25 ? 'var(--b-1)' : '#f87171';
  const rankLabel = (r) => r >= 75 ? 'Top Performer' : r >= 50 ? 'Above Average' : r >= 25 ? 'Average' : 'Keep Going';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--y)', borderTopColor: 'transparent', animation: 'spinSlow 0.8s linear infinite' }} />
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading peer data...</p>
    </div>
  );

  if (!data) return null;

  const metrics = [
    { key: 'gpa',            label: 'GPA',               icon: Award,       color: 'var(--y)',   unit: ''  },
    { key: 'scholarships',   label: 'Scholarships Found', icon: TrendingUp,  color: '#34d399',   unit: ''  },
    { key: 'matchScore',     label: 'Avg Match Score',    icon: BarChart2,   color: 'var(--b-1)', unit: '%' },
    { key: 'taskCompletion', label: 'Task Completion',    icon: CheckSquare, color: 'var(--y)',   unit: '%' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div className="afu" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--y-dim)', border: '1px solid var(--y-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={19} style={{ color: 'var(--y)' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--white)' }}>Peer Comparison</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Anonymous benchmarking against {data.totalUsers} ScholarAI users</p>
        </div>
      </div>

      {/* Rank cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {metrics.map(({ key, label, icon: Icon, color }) => {
          const metric = data[key];
          const rank   = metric?.rank || 0;
          const rc     = rankColor(rank);
          return (
            <div key={key} className="ch afu" style={{ borderRadius: 16, padding: '20px', background: 'var(--bg-2)', border: '1px solid var(--border)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${rc}44, transparent)` }} />
              <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>{label}</p>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${rc}15`, border: `2px solid ${rc}44`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 900, color: rc, lineHeight: 1 }}>{rank}%</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: rc }}>{rankLabel(rank)}</p>
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{metric?.label}</p>
            </div>
          );
        })}
      </div>

      {/* Comparison bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>

        {/* Your stats vs peers */}
        <div style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 18 }}>Your Stats vs Peers</h3>
          {metrics.map(({ key, label, color, unit }) => {
            const metric = data[key];
            const yours  = metric?.yours   || 0;
            const avg    = metric?.average || 0;
            const max    = Math.max(yours, avg, 1);
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                    <span style={{ color, fontWeight: 700 }}>You: {yours}{unit}</span>
                    <span style={{ color: 'var(--muted)' }}>Avg: {avg}{unit}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--muted)', width: 28, flexShrink: 0 }}>You</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'var(--bg-4)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(yours / max) * 100}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--muted)', width: 28, flexShrink: 0 }}>Avg</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'var(--bg-4)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(avg / max) * 100}%`, background: 'var(--bg-5)', borderRadius: 99, transition: 'width 0.8s ease', border: '1px dashed var(--subtle)' }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status breakdown */}
        <div style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 18 }}>Scholarship Status Breakdown</h3>
          {data.statusCounts?.map((s, i) => {
            const colors = ['var(--muted)','var(--b-1)','var(--y)','#34d399','#f87171'];
            const color  = colors[i % colors.length];
            const total  = data.statusCounts.reduce((a, b) => a + b.count, 0);
            const pct    = total > 0 ? Math.round((s.count / total) * 100) : 0;
            return (
              <div key={s.status} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 12, color: 'var(--white-2)', textTransform: 'capitalize', fontWeight: 600 }}>{s.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                    <span style={{ color, fontWeight: 700 }}>You: {s.yours}</span>
                    <span style={{ color: 'var(--muted)' }}>All: {s.count} ({pct}%)</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-4)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress rings */}
      <div style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 20 }}>Progress Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 20, textAlign: 'center' }}>
          {metrics.map(({ key, label, color, unit }) => {
            const metric = data[key];
            const max    = Math.max(metric?.yours || 0, metric?.average || 0, 1);
            const pct    = Math.round(((metric?.yours || 0) / max) * 100);
            return (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Ring percent={pct} color={color} size={100} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>{label}</p>
                <p style={{ fontSize: 10, color: 'var(--subtle)', marginTop: 2 }}>vs avg {metric?.average || 0}{unit}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personalized tips */}
      <div style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 16 }}>Personalized Tips</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { condition: (data.scholarships?.rank||0) < 50, icon: '🎓', tip: 'Find more scholarships — users with 20+ have 3x higher acceptance rates', color: 'var(--y)', action: '/scholarships', label: 'Find Scholarships' },
            { condition: (data.taskCompletion?.rank||0) < 50, icon: '📋', tip: 'Complete more checklist tasks — top applicants finish 80% before applying', color: 'var(--b-1)', action: '/checklist', label: 'View Checklist' },
            { condition: (data.matchScore?.rank||0) < 50, icon: '🎯', tip: 'Update your profile with GPA and test scores to improve scholarship matching', color: 'var(--y)', action: '/profile', label: 'Update Profile' },
            { condition: (data.gpa?.rank||0) < 50, icon: '📚', tip: 'Users with complete GPA in profile get significantly better scholarship matches', color: 'var(--b-1)', action: '/profile', label: 'Add GPA' },
          ].filter((t) => t.condition).map((tip, i) => (
            <div key={i} style={{ padding: '16px', borderRadius: 12, background: 'var(--bg-3)', border: `1px solid ${tip.color}22` }}>
              <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{tip.icon}</span>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 10 }}>{tip.tip}</p>
              <a href={tip.action} style={{ fontSize: 11, fontWeight: 700, color: tip.color, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                {tip.label} →
              </a>
            </div>
          ))}
          {metrics.every((m) => (data[m.key]?.rank||0) >= 50) && (
            <div style={{ gridColumn: '1 / -1', padding: '24px', borderRadius: 12, background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', textAlign: 'center' }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>🏆</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>You are above average in all areas!</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>Keep applying and track your deadlines to stay ahead</p>
            </div>
          )}
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 20 }}>
        All comparisons are 100% anonymous — no personal data is shared with other users
      </p>
    </div>
  );
}