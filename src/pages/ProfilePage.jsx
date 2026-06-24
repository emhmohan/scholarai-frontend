import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Save, Plus, X, GraduationCap, Globe, BookOpen, Sparkles, CheckCircle, Zap } from 'lucide-react';

const COUNTRIES = ['United States','United Kingdom','Germany','Canada','Australia','France','Netherlands','Sweden','Japan','Singapore','India','Switzerland','New Zealand','Denmark','Norway'];
const DEGREES   = [{ value:'',label:'Select degree' },{ value:'bachelors',label:"Bachelor's" },{ value:'masters',label:"Master's" },{ value:'phd',label:'PhD / Doctorate' },{ value:'postdoc',label:'Post-doctoral' }];
const EXPERIENCE= [{ value:'0',label:'0 years' },{ value:'1',label:'1 year' },{ value:'2',label:'2 years' },{ value:'3',label:'3 years' },{ value:'4',label:'4 years' },{ value:'5',label:'5+ years' }];

const inp = { width:'100%', padding:'11px 14px', borderRadius:10, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:13, outline:'none', transition:'border-color 0.2s, box-shadow 0.2s' };
const onF  = (e) => { e.target.style.borderColor='var(--y)'; e.target.style.boxShadow='0 0 0 3px rgba(245,197,24,0.08)'; };
const onB  = (e) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

function Label({ text }) {
  return <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>{text}</label>;
}

function Card({ title, subtitle, icon:Icon, accent='y', children }) {
  const c   = accent==='y' ? 'var(--y)' : 'var(--b-1)';
  const dim = accent==='y' ? 'var(--y-dim)' : 'var(--b-dim)';
  const bdr = accent==='y' ? 'var(--y-border)' : 'var(--b-border)';
  return (
    <div style={{ borderRadius:18, overflow:'hidden', background:'var(--bg-2)', border:'1px solid var(--border)', marginBottom:16 }}>
      <div style={{ padding:'16px 22px', borderBottom:'1px solid var(--border)', background:'var(--bg-3)', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:dim, border:`1px solid ${bdr}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={17} style={{ color:c }} />
        </div>
        <div>
          <h3 style={{ fontFamily:'Space Grotesk', fontSize:14, fontWeight:700, color:'var(--white)', marginBottom:1 }}>{title}</h3>
          {subtitle && <p style={{ fontSize:11, color:'var(--muted)' }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding:'22px' }}>{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name:'', bio:'', degree:'', fieldOfStudy:'', university:'', GPA:'', experience:'0', testScores:{ GRE:'', GMAT:'', TOEFL:'', IELTS:'' }, targetCountries:[], researchInterests:[] });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [tagInput,setTagInput]= useState('');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      const p   = res.data.data?.profile || {};
      const u   = res.data.data?.user    || {};
      setProfile({
        name:              u.name              || '',
        bio:               p.bio               || '',
        degree:            p.degree            || '',
        fieldOfStudy:      p.fieldOfStudy      || '',
        university:        p.university        || '',
        GPA:               p.GPA               || '',
        experience:        String(p.experience || '0'),
        testScores:        p.testScores        || { GRE:'', GMAT:'', TOEFL:'', IELTS:'' },
        targetCountries:   p.targetCountries   || [],
        researchInterests: p.researchInterests || [],
      });
    } catch { /* silent */ }
    finally  { setLoading(false); }
  };

  const set      = (k, v) => setProfile((p) => ({ ...p, [k]:v }));
  const setScore = (k, v) => setProfile((p) => ({ ...p, testScores:{ ...p.testScores, [k]:v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile', profile);
      setSaved(true);
      toast.success('Profile saved!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const addTag    = () => { if (!tagInput.trim() || profile.researchInterests.includes(tagInput.trim())) return; set('researchInterests', [...profile.researchInterests, tagInput.trim()]); setTagInput(''); };
  const removeTag = (t) => set('researchInterests', profile.researchInterests.filter((x) => x !== t));
  const toggleCountry = (c) => set('targetCountries', profile.targetCountries.includes(c) ? profile.targetCountries.filter((x) => x !== c) : [...profile.targetCountries, c]);

  const fields   = [profile.name, profile.degree, profile.fieldOfStudy, profile.university, profile.GPA, profile.bio, profile.targetCountries.length > 0 ? 'ok' : '', profile.researchInterests.length > 0 ? 'ok' : '', Object.values(profile.testScores).some(Boolean) ? 'ok' : ''];
  const pct      = Math.round((fields.filter(Boolean).length / fields.length) * 100);
  const pctColor = pct >= 80 ? '#34d399' : pct >= 50 ? 'var(--y)' : 'var(--b-1)';

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:16 }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'2px solid var(--y)', borderTopColor:'transparent', animation:'spinSlow 0.8s linear infinite' }} />
      <p style={{ color:'var(--muted)', fontSize:14 }}>Loading profile...</p>
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>

      {/* Header */}
      <div className="afu" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'var(--g-y)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:'#000', fontFamily:'Space Grotesk', flexShrink:0, boxShadow:'0 0 24px rgba(245,197,24,0.2)' }}>
              {profile.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{ fontFamily:'Space Grotesk', fontSize:20, fontWeight:800, color:'var(--white)', marginBottom:3 }}>
                {profile.name || 'Your Profile'}
              </h1>
              <p style={{ fontSize:12, color:'var(--muted)' }}>
                {profile.degree && profile.fieldOfStudy ? `${profile.degree} · ${profile.fieldOfStudy}` : 'Complete your profile for better AI matching'}
              </p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="btn-p"
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 24px', borderRadius:11, background: saved ? 'rgba(52,211,153,0.15)' : saving ? 'var(--bg-4)' : 'var(--g-y)', color: saved ? '#34d399' : saving ? 'var(--muted)' : '#000', border: saved ? '1px solid rgba(52,211,153,0.3)' : 'none', fontSize:13, fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saved ? <><CheckCircle size={15} /> Saved!</> : saving ? 'Saving...' : <><Save size={15} /> Save Profile</>}
          </button>
        </div>

        {/* Completion bar */}
        <div style={{ marginTop:20, borderRadius:14, padding:'16px 20px', background:'var(--bg-2)', border:'1px solid var(--border)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Sparkles size={13} style={{ color:pctColor }} />
              <span style={{ fontSize:13, fontWeight:700, color:'var(--white)' }}>Profile Strength</span>
            </div>
            <span style={{ fontFamily:'Space Grotesk', fontSize:20, fontWeight:900, color:pctColor }}>{pct}%</span>
          </div>
          <div style={{ height:6, borderRadius:99, background:'var(--bg-4)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:pctColor, borderRadius:99, transition:'width 0.8s ease', boxShadow:`0 0 10px ${pctColor}44` }} />
          </div>
          <p style={{ fontSize:11, color:'var(--muted)', marginTop:8 }}>
            {pct < 50 && 'Add more details to get better scholarship matches'}
            {pct >= 50 && pct < 80 && 'Good progress! Add test scores and research interests'}
            {pct >= 80 && 'Excellent! Your profile will get the best scholarship matches'}
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <Card title="Basic Information" subtitle="Your personal and academic identity" icon={User} accent="y">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:16 }}>
          {[
            { k:'name',        label:'Full Name',          placeholder:'Your full name'            },
            { k:'university',  label:'Current University', placeholder:'IIT Bombay, BITS Pilani...' },
            { k:'fieldOfStudy',label:'Field of Study',     placeholder:'Computer Science, Physics...' },
          ].map(({ k, label, placeholder }) => (
            <div key={k}>
              <Label text={label} />
              <input value={profile[k]} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} style={inp} onFocus={onF} onBlur={onB} />
            </div>
          ))}
          <div>
            <Label text="Degree Level" />
            <select value={profile.degree} onChange={(e) => set('degree', e.target.value)} style={{ ...inp, cursor:'pointer' }} onFocus={onF} onBlur={onB}>
              {DEGREES.map((d) => <option key={d.value} value={d.value} style={{ background:'var(--bg-3)' }}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <Label text="GPA / CGPA" />
            <input value={profile.GPA} onChange={(e) => set('GPA', e.target.value)} placeholder="8.5 or 3.8" style={inp} onFocus={onF} onBlur={onB} />
          </div>
          <div>
            <Label text="Years of Experience" />
            <select value={profile.experience} onChange={(e) => set('experience', e.target.value)} style={{ ...inp, cursor:'pointer' }} onFocus={onF} onBlur={onB}>
              {EXPERIENCE.map((e) => <option key={e.value} value={e.value} style={{ background:'var(--bg-3)' }}>{e.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop:16 }}>
          <Label text="Bio / About You" />
          <textarea value={profile.bio} onChange={(e) => set('bio', e.target.value)} rows={4}
            placeholder="Briefly describe your background, achievements and academic interests..."
            style={{ ...inp, resize:'vertical', lineHeight:1.6 }} onFocus={onF} onBlur={onB} />
        </div>
      </Card>

      {/* Test Scores */}
      <Card title="Test Scores" subtitle="Add your standardized test scores for better matching" icon={BookOpen} accent="b">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16, marginBottom:16 }}>
          {[
            { k:'GRE',   label:'GRE',   placeholder:'320', hint:'out of 340' },
            { k:'GMAT',  label:'GMAT',  placeholder:'700', hint:'out of 800' },
            { k:'TOEFL', label:'TOEFL', placeholder:'110', hint:'out of 120' },
            { k:'IELTS', label:'IELTS', placeholder:'7.5', hint:'out of 9.0' },
          ].map(({ k, label, placeholder, hint }) => (
            <div key={k}>
              <Label text={`${label} (${hint})`} />
              <input value={profile.testScores[k]} onChange={(e) => setScore(k, e.target.value)} placeholder={placeholder} style={inp} onFocus={onF} onBlur={onB} />
            </div>
          ))}
        </div>
      </Card>

      {/* Target Countries */}
      <Card title="Target Countries" subtitle="Where do you want to study?" icon={Globe} accent="y">
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
          {COUNTRIES.map((c) => {
            const sel = profile.targetCountries.includes(c);
            return (
              <button key={c} onClick={() => toggleCountry(c)}
                style={{ padding:'7px 16px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s', background: sel ? 'var(--y-dim)' : 'var(--bg-3)', color: sel ? 'var(--y)' : 'var(--muted)', border:`1px solid ${sel ? 'var(--y-border)' : 'var(--border)'}` }}>
                {c}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize:12, color: profile.targetCountries.length > 0 ? 'var(--y)' : 'var(--muted)', fontWeight: profile.targetCountries.length > 0 ? 600 : 400 }}>
          {profile.targetCountries.length > 0 ? `✓ ${profile.targetCountries.length} country selected` : 'Click countries above to select them'}
        </p>
      </Card>

      {/* Research Interests */}
      <Card title="Research Interests" subtitle="Topics you want to study or research" icon={Sparkles} accent="b">
        <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:12 }}>
          {profile.researchInterests.map((tag) => (
            <div key={tag} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:99, background:'var(--b-dim)', border:'1px solid var(--b-border)', fontSize:12, fontWeight:600, color:'var(--b-1)' }}>
              {tag}
              <button onClick={() => removeTag(tag)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--b-1)', display:'flex', padding:0 }}><X size={11} /></button>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="Machine Learning, Climate Change..."
            style={{ ...inp, flex:1 }} onFocus={onF} onBlur={onB} />
          <button onClick={addTag}
            style={{ padding:'10px 16px', borderRadius:10, background:'var(--b-dim)', border:'1px solid var(--b-border)', color:'var(--b-1)', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:13, fontWeight:700 }}>
            <Plus size={14} /> Add
          </button>
        </div>
        <div>
          <p style={{ fontSize:11, color:'var(--muted)', marginBottom:8, fontWeight:600 }}>QUICK ADD</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {['Machine Learning','Deep Learning','NLP','Computer Vision','Climate Change','Biotechnology','Robotics','Data Science','Quantum Computing','Neuroscience']
              .filter((s) => !profile.researchInterests.includes(s))
              .slice(0, 8)
              .map((s) => (
                <button key={s} onClick={() => set('researchInterests', [...profile.researchInterests, s])}
                  style={{ padding:'5px 12px', borderRadius:99, fontSize:11, fontWeight:600, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--muted)', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor='var(--b-border)'; e.currentTarget.style.color='var(--b-1)'; e.currentTarget.style.background='var(--b-dim)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.background='var(--bg-3)'; }}>
                  + {s}
                </button>
              ))}
          </div>
        </div>
      </Card>

      {/* AI Tip */}
      <div className="afu" style={{ borderRadius:16, padding:'18px 22px', background:'linear-gradient(135deg, rgba(245,197,24,0.05), rgba(59,126,255,0.05))', border:'1px solid var(--y-border)', display:'flex', gap:14, alignItems:'flex-start', marginBottom:24 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'var(--y-dim)', border:'1px solid var(--y-border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Zap size={16} style={{ color:'var(--y)' }} />
        </div>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--y)', marginBottom:4 }}>How AI uses your profile</p>
          <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.7 }}>
            Your GPA, test scores, field and research interests are used to score scholarship matches 0–100. Target countries filter scholarships by location. The more complete your profile, the better your matches.
          </p>
        </div>
      </div>

      {/* Save footer */}
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button onClick={handleSave} disabled={saving}
          className="btn-p"
          style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 32px', borderRadius:12, background: saved ? 'rgba(52,211,153,0.15)' : saving ? 'var(--bg-4)' : 'var(--g-y)', color: saved ? '#34d399' : saving ? 'var(--muted)' : '#000', border: saved ? '1px solid rgba(52,211,153,0.3)' : 'none', fontSize:14, fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saved ? <><CheckCircle size={16} /> Profile Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Profile</>}
        </button>
      </div>
    </div>
  );
}