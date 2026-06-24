import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { BookMarked, Plus, Search, Sparkles, Edit2, Trash2, X, Save, Download, Tag } from 'lucide-react';
import jsPDF from 'jspdf';

const CATEGORIES = ['motivation','research','leadership','personal','academic','career','other'];
const CAT_COLORS = { motivation:'var(--y)', research:'var(--b-1)', leadership:'#34d399', personal:'var(--y)', academic:'var(--b-1)', career:'#34d399', other:'var(--muted)' };

export default function EssayBankPage() {
  const [essays,       setEssays]       = useState([]);
  const [search,       setSearch]       = useState('');
  const [catFilter,    setCatFilter]    = useState('all');
  const [showForm,     setShowForm]     = useState(false);
  const [editingId,    setEditingId]    = useState(null);
  const [selected,     setSelected]     = useState(null);
  const [suggestions,  setSuggestions]  = useState(null);
  const [adapted,      setAdapted]      = useState(null);
  const [adaptTarget,  setAdaptTarget]  = useState('');
  const [loading,      setLoading]      = useState(false);
  const [sugLoading,   setSugLoading]   = useState(false);
  const [adaptLoading, setAdaptLoading] = useState(false);
  const [tagInput,     setTagInput]     = useState('');
  const [form, setForm] = useState({ title:'', content:'', category:'motivation', tags:[], usedFor:'' });

  useEffect(() => { fetchEssays(); }, []);

  const fetchEssays = async (cat='', q='') => {
    try {
      const params = new URLSearchParams();
      if (cat && cat !== 'all') params.append('category', cat);
      if (q) params.append('search', q);
      const res = await api.get(`/essays?${params}`);
      setEssays(res.data.data?.essays || []);
    } catch { /* silent */ }
  };

  const handleSearch = (val) => { setSearch(val); fetchEssays(catFilter, val); };
  const handleCat    = (cat) => { setCatFilter(cat); fetchEssays(cat, search); };

  const openForm = (essay = null) => {
    if (essay) { setForm({ title:essay.title, content:essay.content, category:essay.category, tags:essay.tags||[], usedFor:essay.usedFor?.join(', ')||'' }); setEditingId(essay._id); }
    else { setForm({ title:'', content:'', category:'motivation', tags:[], usedFor:'' }); setEditingId(null); }
    setShowForm(true); setSelected(null); setSuggestions(null); setAdapted(null);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) { toast.error('Title and content required'); return; }
    setLoading(true);
    try {
      const payload = { ...form, usedFor: form.usedFor ? form.usedFor.split(',').map((s) => s.trim()).filter(Boolean) : [] };
      if (editingId) {
        const res = await api.put(`/essays/${editingId}`, payload);
        setEssays((p) => p.map((e) => e._id===editingId ? res.data.data.essay : e));
        toast.success('Essay updated!');
      } else {
        const res = await api.post('/essays', payload);
        setEssays((p) => [res.data.data.essay, ...p]);
        toast.success('Essay saved!');
      }
      setShowForm(false);
    } catch { toast.error('Failed to save essay'); }
    finally  { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/essays/${id}`);
      setEssays((p) => p.filter((e) => e._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Essay deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleSuggest = async (essay) => {
    setSugLoading(true); setSuggestions(null);
    try {
      const res = await api.post(`/essays/${essay._id}/suggest`);
      setSuggestions(res.data.data);
      toast.success('Suggestions ready!');
    } catch { toast.error('Failed to get suggestions'); }
    finally  { setSugLoading(false); }
  };

  const handleAdapt = async () => {
    if (!adaptTarget.trim()) { toast.error('Enter a scholarship name'); return; }
    setAdaptLoading(true); setAdapted(null);
    try {
      const res = await api.post(`/essays/${selected._id}/adapt`, { targetScholarship: adaptTarget });
      setAdapted(res.data.data.adapted);
      toast.success('Essay adapted!');
    } catch { toast.error('Failed to adapt'); }
    finally  { setAdaptLoading(false); }
  };

  const handlePDF = (essay, adaptedContent=null) => {
    const doc = new jsPDF();
    const w   = doc.internal.pageSize.getWidth();
    const h   = doc.internal.pageSize.getHeight();
    const m   = 20;
    doc.setFillColor(5,5,7); doc.rect(0,0,w,36,'F');
    doc.setFillColor(245,197,24); doc.rect(0,0,4,36,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text(adaptedContent ? `Adapted: ${essay.title}` : essay.title, m+4, 16);
    doc.setFontSize(9); doc.setFont('helvetica','normal');
    doc.text(`${essay.category} · ${essay.wordCount} words · ScholarAI`, m+4, 27);
    const content = adaptedContent || essay.content;
    const lines   = doc.splitTextToSize(content, w-m*2);
    let y = 46;
    doc.setTextColor(30,30,30); doc.setFontSize(11); doc.setFont('helvetica','normal');
    lines.forEach((line) => { if (y+6>h-20) { doc.addPage(); y=20; } doc.text(line,m,y); y+=6; });
    doc.save(`Essay_${essay.title.replace(/\s+/g,'_')}.pdf`);
    toast.success('Downloaded!');
  };

  const addTag    = () => { if (!tagInput.trim()) return; setForm((p) => ({ ...p, tags:[...p.tags, tagInput.trim()] })); setTagInput(''); };
  const removeTag = (tag) => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t!==tag) }));

  const inpStyle = { width:'100%', padding:'10px 14px', borderRadius:10, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:13, outline:'none' };

  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }}>

      {/* Header */}
      <div className="afu" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'var(--b-dim)', border:'1px solid var(--b-border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <BookMarked size={19} style={{ color:'var(--b-1)' }} />
          </div>
          <div>
            <h1 style={{ fontFamily:'Space Grotesk', fontSize:22, fontWeight:800, color:'var(--white)' }}>Essay Bank</h1>
            <p style={{ fontSize:13, color:'var(--muted)' }}>Store, reuse and adapt essays for any scholarship</p>
          </div>
        </div>
        <button onClick={() => openForm()} className="btn-p" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:11, background:'var(--g-y)', color:'#000', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>
          <Plus size={15} /> New Essay
        </button>
      </div>

      <div style={{ display:'flex', gap:20 }}>

        {/* Left list */}
        <div style={{ width:280, flexShrink:0 }}>
          <div style={{ position:'relative', marginBottom:10 }}>
            <Search size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
            <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search essays..."
              style={{ width:'100%', padding:'9px 12px 9px 34px', borderRadius:10, background:'var(--bg-2)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:13, outline:'none' }}
              onFocus={(e) => e.target.style.borderColor='var(--y)'} onBlur={(e) => e.target.style.borderColor='var(--border)'} />
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
            <button onClick={() => handleCat('all')} style={{ padding:'5px 12px', borderRadius:99, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.2s', background:catFilter==='all'?'var(--y-dim)':'var(--bg-3)', color:catFilter==='all'?'var(--y)':'var(--muted)', border:`1px solid ${catFilter==='all'?'var(--y-border)':'var(--border)'}` }}>All</button>
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => handleCat(cat)}
                style={{ padding:'5px 10px', borderRadius:99, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.2s', background:catFilter===cat?`${CAT_COLORS[cat]}15`:'var(--bg-3)', color:catFilter===cat?CAT_COLORS[cat]:'var(--muted)', border:`1px solid ${catFilter===cat?`${CAT_COLORS[cat]}30`:'var(--border)'}`, textTransform:'capitalize' }}>
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {essays.length===0 && (
              <div style={{ textAlign:'center', padding:'32px 16px', borderRadius:12, background:'var(--bg-2)', border:'1px solid var(--border)' }}>
                <BookMarked size={24} style={{ color:'var(--border)', margin:'0 auto 8px' }} />
                <p style={{ fontSize:12, color:'var(--muted)' }}>No essays yet</p>
              </div>
            )}
            {essays.map((essay) => {
              const c       = CAT_COLORS[essay.category] || 'var(--muted)';
              const isSel   = selected?._id === essay._id;
              return (
                <div key={essay._id} onClick={() => { setSelected(essay); setShowForm(false); setSuggestions(null); setAdapted(null); }}
                  style={{ padding:'14px', borderRadius:12, border:`1px solid ${isSel?'var(--y-border)':'var(--border)'}`, background: isSel?'var(--y-dim)':'var(--bg-2)', cursor:'pointer', transition:'all 0.2s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                    <div style={{ minWidth:0, flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'var(--white)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>{essay.title}</p>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:`${c}15`, color:c, border:`1px solid ${c}30`, textTransform:'capitalize' }}>{essay.category}</span>
                        <span style={{ fontSize:10, color:'var(--muted)' }}>{essay.wordCount}w</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                      <button onClick={(e) => { e.stopPropagation(); openForm(essay); }} style={{ padding:4, background:'none', border:'none', cursor:'pointer', color:'var(--muted)', transition:'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color='var(--y)'} onMouseLeave={(e) => e.currentTarget.style.color='var(--muted)'}><Edit2 size={12} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(essay._id); }} style={{ padding:4, background:'none', border:'none', cursor:'pointer', color:'var(--muted)', transition:'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color='#f87171'} onMouseLeave={(e) => e.currentTarget.style.color='var(--muted)'}><Trash2 size={12} /></button>
                    </div>
                  </div>
                  {essay.tags?.length>0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:6 }}>
                      {essay.tags.slice(0,3).map((tag) => (
                        <span key={tag} style={{ fontSize:10, padding:'1px 7px', borderRadius:99, background:'var(--bg-4)', color:'var(--muted)' }}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right content */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* Form */}
          {showForm && (
            <div style={{ borderRadius:18, padding:'24px', background:'var(--bg-2)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                <h2 style={{ fontFamily:'Space Grotesk', fontSize:16, fontWeight:700, color:'var(--white)' }}>{editingId?'Edit Essay':'New Essay'}</h2>
                <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)' }}><X size={16} /></button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title:e.target.value }))} placeholder="Essay title..." style={inpStyle} onFocus={(e) => e.target.style.borderColor='var(--y)'} onBlur={(e) => e.target.style.borderColor='var(--border)'} />
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category:e.target.value }))} style={{ ...inpStyle, cursor:'pointer' }}>
                  {CATEGORIES.map((c) => <option key={c} value={c} style={{ background:'var(--bg-3)', textTransform:'capitalize' }}>{c}</option>)}
                </select>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Content</label>
                    <span style={{ fontSize:11, color:'var(--muted)' }}>{form.content.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content:e.target.value }))} rows={10} placeholder="Paste or write your essay here..." style={{ ...inpStyle, resize:'vertical', lineHeight:1.7 }} onFocus={(e) => e.target.style.borderColor='var(--y)'} onBlur={(e) => e.target.style.borderColor='var(--border)'} />
                </div>
                {/* Tags */}
                <div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                    {form.tags.map((tag) => (
                      <span key={tag} style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:99, background:'var(--b-dim)', border:'1px solid var(--b-border)', fontSize:12, color:'var(--b-1)', fontWeight:600 }}>
                        #{tag} <button onClick={() => removeTag(tag)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--b-1)', padding:0, display:'flex' }}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if(e.key==='Enter'){e.preventDefault();addTag();} }} placeholder="Add tag..." style={{ ...inpStyle, flex:1 }} onFocus={(e) => e.target.style.borderColor='var(--y)'} onBlur={(e) => e.target.style.borderColor='var(--border)'} />
                    <button onClick={addTag} style={{ padding:'10px 14px', borderRadius:10, background:'var(--b-dim)', border:'1px solid var(--b-border)', color:'var(--b-1)', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:13, fontWeight:700 }}><Tag size={13} /> Add</button>
                  </div>
                </div>
                <input value={form.usedFor} onChange={(e) => setForm((p) => ({ ...p, usedFor:e.target.value }))} placeholder="Used for (comma separated): Fulbright, Gates..." style={inpStyle} onFocus={(e) => e.target.style.borderColor='var(--y)'} onBlur={(e) => e.target.style.borderColor='var(--border)'} />
                <button onClick={handleSave} disabled={loading} className="btn-p" style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 24px', borderRadius:11, background:loading?'var(--bg-4)':'var(--g-y)', color:loading?'var(--muted)':'#000', fontSize:13, fontWeight:700, border:'none', cursor:loading?'not-allowed':'pointer' }}>
                  <Save size={14} /> {loading?'Saving...':'Save Essay'}
                </button>
              </div>
            </div>
          )}

          {/* Essay viewer */}
          {selected && !showForm && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ borderRadius:18, background:'var(--bg-2)', border:'1px solid var(--border)', overflow:'hidden' }}>
                <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)', background:'var(--bg-3)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:14, flexWrap:'wrap' }}>
                  <div>
                    <h2 style={{ fontFamily:'Space Grotesk', fontSize:18, fontWeight:800, color:'var(--white)', marginBottom:6 }}>{selected.title}</h2>
                    <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99, background:`${CAT_COLORS[selected.category]}15`, color:CAT_COLORS[selected.category], border:`1px solid ${CAT_COLORS[selected.category]}30`, textTransform:'capitalize' }}>{selected.category}</span>
                      <span style={{ fontSize:11, color:'var(--muted)' }}>{selected.wordCount} words</span>
                      <span style={{ fontSize:11, color:'var(--muted)' }}>{new Date(selected.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <button onClick={() => openForm(selected)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background:'var(--bg-4)', border:'1px solid var(--border)', color:'var(--muted)', fontSize:12, cursor:'pointer' }}><Edit2 size={12} /> Edit</button>
                    <button onClick={() => handlePDF(selected)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background:'var(--b-dim)', border:'1px solid var(--b-border)', color:'var(--b-1)', fontSize:12, cursor:'pointer' }}><Download size={12} /> PDF</button>
                    <button onClick={() => handleSuggest(selected)} disabled={sugLoading} className="btn-p" style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background:sugLoading?'var(--bg-4)':'var(--g-y)', color:sugLoading?'var(--muted)':'#000', fontSize:12, fontWeight:700, border:'none', cursor:sugLoading?'not-allowed':'pointer' }}>
                      <Sparkles size={12} /> {sugLoading?'Analyzing...':'AI Suggest'}
                    </button>
                  </div>
                </div>
                <div style={{ padding:'22px' }}>
                  <pre style={{ fontSize:13, lineHeight:1.8, color:'var(--white-1)', fontFamily:'inherit', whiteSpace:'pre-wrap' }}>{selected.content}</pre>
                </div>
              </div>

              {/* AI Suggestions */}
              {suggestions && (
                <div className="afi" style={{ borderRadius:16, padding:'22px', background:'var(--bg-2)', border:'1px solid var(--y-border)' }}>
                  <h3 style={{ fontFamily:'Space Grotesk', fontSize:14, fontWeight:700, color:'var(--white)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}><Sparkles size={15} style={{ color:'var(--y)' }} /> AI Analysis</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
                    {[
                      { key:'bestFits', label:'Best Fits For', color:'var(--y)' },
                      { key:'themes',   label:'Key Themes',    color:'var(--b-1)' },
                      { key:'strengths',label:'Strengths',     color:'#34d399'   },
                      { key:'improvements',label:'Improvements',color:'var(--y)' },
                    ].map(({ key, label, color }) => suggestions[key]?.length>0 && (
                      <div key={key}>
                        <p style={{ fontSize:11, fontWeight:700, color, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>
                        {suggestions[key].map((item, i) => (
                          <p key={i} style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>• {item}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adapt */}
              <div style={{ borderRadius:16, padding:'22px', background:'var(--bg-2)', border:'1px solid var(--border)' }}>
                <h3 style={{ fontFamily:'Space Grotesk', fontSize:14, fontWeight:700, color:'var(--white)', marginBottom:6 }}>✨ Adapt for Scholarship</h3>
                <p style={{ fontSize:12, color:'var(--muted)', marginBottom:14 }}>AI rewrites this essay specifically for your target scholarship</p>
                <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                  <input value={adaptTarget} onChange={(e) => setAdaptTarget(e.target.value)} placeholder="Scholarship name e.g. Fulbright..." style={{ flex:1, padding:'10px 14px', borderRadius:10, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:13, outline:'none' }} onFocus={(e) => e.target.style.borderColor='var(--y)'} onBlur={(e) => e.target.style.borderColor='var(--border)'} />
                  <button onClick={handleAdapt} disabled={adaptLoading} className="btn-p" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:10, background:adaptLoading?'var(--bg-4)':'var(--g-y)', color:adaptLoading?'var(--muted)':'#000', fontSize:13, fontWeight:700, border:'none', cursor:adaptLoading?'not-allowed':'pointer' }}>
                    <Sparkles size={13} /> {adaptLoading?'Adapting...':'Adapt'}
                  </button>
                </div>
                {adapted && (
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <p style={{ fontSize:12, fontWeight:700, color:'var(--white)' }}>Adapted for: <span style={{ color:'var(--y)' }}>{adaptTarget}</span></p>
                      <button onClick={() => handlePDF(selected, adapted)} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:9, background:'var(--b-dim)', border:'1px solid var(--b-border)', color:'var(--b-1)', fontSize:11, cursor:'pointer' }}><Download size={11} /> Download</button>
                    </div>
                    <div style={{ padding:'16px', borderRadius:12, background:'var(--bg-3)', border:'1px solid var(--border)' }}>
                      <pre style={{ fontSize:12, lineHeight:1.8, color:'var(--white-1)', fontFamily:'inherit', whiteSpace:'pre-wrap' }}>{adapted}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty */}
          {!selected && !showForm && (
            <div style={{ textAlign:'center', padding:'80px 32px', borderRadius:20, background:'var(--bg-2)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:24, alignItems:'center' }}>
                {[60,90,60].map((s,i) => (
                  <div key={i} style={{ width:s, height:s, borderRadius:'50%', background: i===1 ? 'radial-gradient(circle at 33% 33%, rgba(59,126,255,0.8), rgba(59,126,255,0.2) 60%, rgba(5,5,7,0.9))' : 'radial-gradient(circle at 33% 33%, rgba(245,197,24,0.8), rgba(245,197,24,0.2) 60%, rgba(5,5,7,0.9))', boxShadow:`inset -4px -4px 10px rgba(0,0,0,0.4), 0 0 ${s/3}px ${i===1?'rgba(59,126,255,0.12)':'rgba(245,197,24,0.1)'}`, animation:`float ${5+i}s ease-in-out infinite ${i*0.5}s` }} />
                ))}
              </div>
              <h2 style={{ fontFamily:'Space Grotesk', fontSize:20, fontWeight:800, color:'var(--white)', marginBottom:8 }}>Your Essay Bank</h2>
              <p style={{ fontSize:13, color:'var(--muted)', maxWidth:400, margin:'0 auto 24px', lineHeight:1.7 }}>Store all your essays in one place. AI suggests which scholarships they fit and adapts them for specific applications.</p>
              <button onClick={() => openForm()} className="btn-p" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 24px', borderRadius:12, background:'var(--g-y)', color:'#000', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>
                <Plus size={15} /> Add Your First Essay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}