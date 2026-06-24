import { useState, useEffect } from 'react';
import { BarChart2, Download, TrendingUp, CheckSquare, GraduationCap, BookOpen, FileText, Users } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="ch" style={{ borderRadius: 14, padding: '18px 20px', background: 'var(--bg-2)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}44, transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <div style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function BarChartSimple({ data, colorKey = 'color' }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{item.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: item[colorKey] || 'var(--y)' }}>{item.count}</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-4)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(item.count / max) * 100}%`, background: item[colorKey] || 'var(--y)', borderRadius: 99, transition: 'width 0.8s ease', minWidth: item.count > 0 ? 4 : 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

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
      <text x={size/2} y={size/2+5} textAnchor="middle" fill={color} fontSize="14" fontWeight="900" fontFamily="Space Grotesk">
        {percent}%
      </text>
    </svg>
  );
}

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [sumRes, schRes, colRes, sopRes, chkRes] = await Promise.all([
        api.get('/agent/dashboard-summary'),
        api.get('/scholarships'),
        api.get('/colleges'),
        api.get('/sop'),
        api.get('/checklist'),
      ]);

      const scholarships = schRes.data.data?.scholarships || [];
      const colleges     = colRes.data.data?.colleges     || [];
      const sops         = sopRes.data.data?.sops         || [];
      const checklist    = chkRes.data.data || {};
      const summary      = sumRes.data.data || {};

      const schStatus = ['saved','applying','applied','accepted','rejected'].map((s, i) => ({
        label: s, count: scholarships.filter((x) => x.status === s).length,
        color: ['var(--muted)','var(--b-1)','var(--y)','#34d399','#f87171'][i],
      }));

      const colCat = ['safe','match','reach'].map((c, i) => ({
        label: c, count: colleges.filter((x) => x.category === c).length,
        color: ['#34d399','var(--y)','#f87171'][i],
      }));

      const scoreRanges = [
        { label: '90–100%', count: scholarships.filter((s) => (s.matchScore||0) >= 90).length,                              color: '#34d399' },
        { label: '80–89%',  count: scholarships.filter((s) => (s.matchScore||0) >= 80 && (s.matchScore||0) < 90).length,   color: 'var(--y)'   },
        { label: '70–79%',  count: scholarships.filter((s) => (s.matchScore||0) >= 70 && (s.matchScore||0) < 80).length,   color: 'var(--b-1)' },
        { label: 'Below 70',count: scholarships.filter((s) => (s.matchScore||0) < 70).length,                               color: 'var(--muted)' },
      ];

      const tasks = checklist.tasks || [];
      const taskCats = ['documents','tests','applications','financial','interviews','other'].map((cat, i) => {
        const catTasks = tasks.filter((t) => t.category === cat);
        return { label: cat, total: catTasks.length, completed: catTasks.filter((t) => t.completed).length, color: ['var(--y)','var(--b-1)','#34d399','#f87171','var(--y)','var(--muted)'][i] };
      }).filter((c) => c.total > 0);

      const monthlyActivity = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
        return { month: d.toLocaleString('default', { month: 'short' }), count: scholarships.filter((s) => { const c = new Date(s.createdAt); return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear(); }).length };
      });

      setData({ summary, schStatus, colCat, scoreRanges, taskCats, monthlyActivity, totalScholarships: scholarships.length, totalColleges: colleges.length, totalSOPs: sops.length, avgMatchScore: summary.avgMatchScore || 0, completionPercent: checklist.completionPercent || 0, accepted: scholarships.filter((s) => s.status === 'accepted').length });
    } catch { toast.error('Failed to load analytics'); }
    finally  { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--y)', borderTopColor: 'transparent', animation: 'spinSlow 0.8s linear infinite' }} />
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading analytics...</p>
    </div>
  );

  if (!data) return null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div className="afu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--b-dim)', border: '1px solid var(--b-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={19} style={{ color: 'var(--b-1)' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--white)' }}>Analytics</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Your complete application journey at a glance</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Scholarships"  value={data.totalScholarships}       color="var(--y)"   icon={GraduationCap} />
        <StatCard label="Colleges"      value={data.totalColleges}            color="var(--b-1)" icon={BookOpen}      />
        <StatCard label="SOPs Written"  value={data.totalSOPs}                color="var(--y)"   icon={FileText}      />
        <StatCard label="Avg Match"     value={`${data.avgMatchScore}%`}      color="#34d399"    icon={TrendingUp}    />
        <StatCard label="Tasks Done"    value={`${data.completionPercent}%`}  color="var(--b-1)" icon={CheckSquare}   />
        <StatCard label="Accepted"      value={data.accepted}                 color="#34d399"    icon={Users}         />
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>

        {/* Scholarship pipeline */}
        <div style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 18 }}>Scholarship Pipeline</h3>
          {data.totalScholarships === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No scholarships yet</p>
            : <BarChartSimple data={data.schStatus} colorKey="color" />}
        </div>

        {/* College categories */}
        <div style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 18 }}>College Categories</h3>
          {data.totalColleges === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No colleges yet</p>
            : <BarChartSimple data={data.colCat} colorKey="color" />}
        </div>

        {/* Match score distribution */}
        <div style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 18 }}>Match Score Distribution</h3>
          {data.totalScholarships === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No scholarships yet</p>
            : <BarChartSimple data={data.scoreRanges} colorKey="color" />}
        </div>

        {/* Task completion */}
        <div style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 18 }}>Task Completion by Category</h3>
          {data.taskCats.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No tasks yet</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.taskCats.map((cat) => {
                  const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
                  return (
                    <div key={cat.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{cat.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: cat.color }}>{cat.completed}/{cat.total}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-4)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 99, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>

      {/* Progress rings + Monthly activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>

        {/* Rings */}
        <div style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', alignSelf: 'flex-start' }}>Overall Progress</h3>
          <div>
            <Ring percent={data.completionPercent} color="var(--y)" size={110} />
            <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 6 }}>Tasks Completed</p>
          </div>
          <div>
            <Ring percent={data.avgMatchScore} color="var(--b-1)" size={110} />
            <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 6 }}>Avg Match Score</p>
          </div>
        </div>

        {/* Monthly activity */}
        <div style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 20 }}>Monthly Scholarship Activity</h3>
          {data.monthlyActivity.every((m) => m.count === 0)
            ? <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No activity yet</p>
            : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120, paddingBottom: 20 }}>
                {data.monthlyActivity.map((m, i) => {
                  const max = Math.max(...data.monthlyActivity.map((x) => x.count), 1);
                  const h   = m.count > 0 ? Math.max((m.count / max) * 100, 8) : 4;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: m.count > 0 ? 'var(--y)' : 'transparent' }}>{m.count || ''}</span>
                      <div style={{ width: '100%', borderRadius: '6px 6px 0 0', transition: 'height 0.7s ease', background: m.count > 0 ? 'linear-gradient(180deg, var(--y), var(--b-1))' : 'var(--bg-4)', minHeight: 4, height: `${h}%` }} />
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{m.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}