import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { FileText, Sparkles, Copy, CheckCircle, Download, History, RotateCcw, Save, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';

export default function SOPPage() {
  const [form, setForm] = useState({ program:'', university:'', wordCount:'1000', goals:'', achievements:'' });
  const [loading,       setLoading]       = useState(false);
  const [analyzing,     setAnalyzing]     = useState(false);
  const [sop,           setSop]           = useState(null);
  const [analysis,      setAnalysis]      = useState(null);
  const [copied,        setCopied]        = useState(false);
  const [savedSops,     setSavedSops]     = useState([]);
  const [showSaved,     setShowSaved]     = useState(false);
  const [showVersions,  setShowVersions]  = useState(false);
  const [versionLabel,  setVersionLabel]  = useState('');
  const [savingVersion, setSavingVersion] = useState(false);
  const [restoring,     setRestoring]     = useState(false);
  const [compareIdx,    setCompareIdx]    = useState(null);
  const [shareUrl,      setShareUrl]      = useState('');
  const [sharing,       setSharing]       = useState(false);
  const [shareCopied,   setShareCopied]   = useState(false);

  const inp = { width:'100%', padding:'11px 14px', borderRadius:10, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:13, outline:'none', transition:'border-color 0.2s, box-shadow 0.2s' };
  const onF = (e) => { e.target.style.borderColor='var(--y)'; e.target.style.boxShadow='0 0 0 3px rgba(245,197,24,0.08)'; };
  const onB = (e) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  useEffect(() => { fetchSavedSOPs(); }, []);

  const fetchSavedSOPs = async () => {
    try {
      const res = await api.get('/sop');
      setSavedSops(res.data.data?.sops || []);
    } catch { /* silent */ }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGenerate = async () => {
    if (!form.program || !form.university) { toast.error('Program and university are required'); return; }
    setLoading(true);
    setSop(null);
    setAnalysis(null);
    setShowVersions(false);
    setCompareIdx(null);
    setShareUrl('');
    try {
      const res = await api.post('/sop/generate', form);
      setSop(res.data.data);
      await fetchSavedSOPs();
      toast.success('SOP generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate SOP');
    } finally { setLoading(false); }
  };

  const handleAnalyze = async () => {
    if (!sop?._id) return;
    setAnalyzing(true);
    try {
      const res = await api.post(`/sop/${sop._id}/analyze`);
      setAnalysis(res.data.data);
      toast.success('Analysis complete!');
    } catch { toast.error('Failed to analyze SOP'); }
    finally  { setAnalyzing(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sop?.polished || sop?.draft || sop?.content || '');
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveVersion = async () => {
    if (!sop?._id) return;
    setSavingVersion(true);
    try {
      const res = await api.post(`/sop/${sop._id}/version`, { label: versionLabel || undefined });
      setSop(res.data.data.sop);
      setVersionLabel('');
      toast.success('Version saved!');
    } catch { toast.error('Failed to save version'); }
    finally  { setSavingVersion(false); }
  };

  const handleRestore = async (versionIndex) => {
    if (!sop?._id) return;
    setRestoring(true);
    try {
      const res = await api.post(`/sop/${sop._id}/restore`, { versionIndex });
      setSop({ ...res.data.data.sop, polished: res.data.data.restored });
      setShowVersions(false);
      setCompareIdx(null);
      toast.success('Version restored!');
    } catch { toast.error('Failed to restore version'); }
    finally  { setRestoring(false); }
  };

  const handleShare = async () => {
    if (!sop?._id) return;
    setSharing(true);
    try {
      const res = await api.post(`/share/sop/${sop._id}`);
      setShareUrl(res.data.data.shareUrl);
      toast.success('Share link created!');
    } catch { toast.error('Failed to create share link'); }
    finally  { setSharing(false); }
  };

  const handleDownloadPDF = () => {
    const content = sop?.polished || sop?.draft || sop?.content || '';
    if (!content) return;
    const doc = new jsPDF();
    const w   = doc.internal.pageSize.getWidth();
    const h   = doc.internal.pageSize.getHeight();
    const m   = 20;
    doc.setFillColor(5,5,7); doc.rect(0,0,w,36,'F');
    doc.setFillColor(245,197,24); doc.rect(0,0,4,36,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('Statement of Purpose', m+4, 16);
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text(`${form.program} — ${form.university} · ${new Date().toLocaleDateString()}`, m+4, 27);
    const lines = doc.splitTextToSize(content, w-m*2);
    let y = 46;
    doc.setTextColor(30,30,30); doc.setFontSize(11);
    lines.forEach((line) => { if (y+6>h-20) { doc.addPage(); y=20; } doc.text(line,m,y); y+=6; });
    const tp = doc.internal.getNumberOfPages();
    for (let i=1;i<=tp;i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150,150,150); doc.text('ScholarAI',m,h-10); doc.text(`${i}/${tp}`,w-m,h-10,{align:'right'}); }
    doc.save(`SOP_${form.university.replace(/\s+/g,'_')}.pdf`);
    toast.success('PDF downloaded!');
  };

  const versions = sop?.versions || [];

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>

      {/* Header */}
      <div className="afu" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'var(--y-dim)', border:'1px solid var(--y-border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <FileText size={19} style={{ color:'var(--y)' }} />
          </div>
          <div>
            <h1 style={{ fontFamily:'Space Grotesk', fontSize:22, fontWeight:800, color:'var(--white)' }}>Statement of Purpose</h1>
            <p style={{ fontSize:13, color:'var(--muted)' }}>AI-generated SOP with version history and sharing</p>
          </div>
        </div>
        <button onClick={() => setShowSaved(!showSaved)}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:10, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--muted)', fontSize:13, cursor:'pointer', transition:'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.color='var(--white-2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; }}>
          <History size={14} /> Saved SOPs ({savedSops.length})
        </button>
      </div>

      {/* Saved SOPs */}
      {showSaved && savedSops.length > 0 && (
        <div className="afi" style={{ borderRadius:16, overflow:'hidden', background:'var(--bg-2)', border:'1px solid var(--border)', marginBottom:20 }}>
          <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-3)' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--white)' }}>Your Saved SOPs</p>
          </div>
          {savedSops.map((s) => (
            <button key={s._id}
              onClick={() => { setSop({ ...s, polished:s.content }); setShowSaved(false); setForm({ program:s.program||'', university:s.university||'', wordCount:'1000', goals:'', achievements:'' }); setShareUrl(''); }}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', cursor:'pointer', textAlign:'left', transition:'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background='var(--bg-3)'}
              onMouseLeave={(e) => e.currentTarget.style.background='transparent'}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--white)', marginBottom:2 }}>{s.title}</p>
                <p style={{ fontSize:11, color:'var(--muted)' }}>{s.wordCount} words · {new Date(s.createdAt).toLocaleDateString()} · {s.versions?.length||1} version(s)</p>
              </div>
              <span style={{ fontSize:11, padding:'3px 10px', borderRadius:8, background:'var(--y-dim)', color:'var(--y)', border:'1px solid var(--y-border)', flexShrink:0 }}>Load</span>
            </button>
          ))}
        </div>
      )}

      {/* Form */}
      <div className="afu" style={{ borderRadius:18, padding:'24px', background:'var(--bg-2)', border:'1px solid var(--border)', marginBottom:20 }}>
        <h2 style={{ fontFamily:'Space Grotesk', fontSize:15, fontWeight:700, color:'var(--white)', marginBottom:18 }}>SOP Details</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          {[
            { name:'program',    label:'Program *',    placeholder:'MS Computer Science'   },
            { name:'university', label:'University *', placeholder:'Stanford University'   },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</label>
              <input name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} style={inp} onFocus={onF} onBlur={onB} />
            </div>
          ))}
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Word Count</label>
            <select name="wordCount" value={form.wordCount} onChange={handleChange} style={{ ...inp, cursor:'pointer' }} onFocus={onF} onBlur={onB}>
              {['500','750','1000','1250','1500'].map((w) => <option key={w} value={w} style={{ background:'var(--bg-3)' }}>{w} words</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { name:'goals',        label:'Career Goals',      placeholder:'Describe your career goals...'                     },
            { name:'achievements', label:'Key Achievements',  placeholder:'Research projects, publications, awards...'         },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</label>
              <textarea name={name} value={form[name]} onChange={handleChange} rows={3} placeholder={placeholder} style={{ ...inp, resize:'vertical', lineHeight:1.6, fontFamily:'inherit' }} onFocus={onF} onBlur={onB} />
            </div>
          ))}
        </div>
        <button onClick={handleGenerate} disabled={loading}
          className="btn-p"
          style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 24px', borderRadius:11, background:loading?'var(--bg-4)':'var(--g-y)', color:loading?'var(--muted)':'#000', fontSize:13, fontWeight:700, border:'none', cursor:loading?'not-allowed':'pointer', marginTop:18 }}>
          <Sparkles size={15} />
          {loading ? 'Generating SOP...' : 'Generate SOP'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="afu" style={{ borderRadius:16, padding:'32px', textAlign:'center', background:'var(--bg-2)', border:'1px solid var(--y-border)', marginBottom:20 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', border:'2px solid var(--y)', borderTopColor:'transparent', animation:'spinSlow 0.8s linear infinite', margin:'0 auto 14px' }} />
          <p style={{ fontWeight:700, color:'var(--white)', marginBottom:4 }}>Generating your SOP...</p>
          <p style={{ fontSize:12, color:'var(--muted)' }}>3-step AI pipeline — outline, draft, polish — takes 20–30 seconds</p>
        </div>
      )}

      {/* Generated SOP */}
      {sop && !loading && (
        <div className="afu" style={{ borderRadius:18, background:'var(--bg-2)', border:'1px solid var(--border)', overflow:'hidden', marginBottom:16 }}>

          {/* Toolbar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 22px', borderBottom:'1px solid var(--border)', background:'var(--bg-3)', flexWrap:'wrap', gap:10 }}>
            <div>
              <h2 style={{ fontFamily:'Space Grotesk', fontSize:15, fontWeight:700, color:'var(--white)', marginBottom:2 }}>Generated SOP</h2>
              <p style={{ fontSize:11, color:'var(--muted)' }}>{sop.wordCount||'~1000'} words · {versions.length} version(s)</p>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button onClick={handleCopy}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background:'var(--bg-4)', border:'1px solid var(--border)', color: copied ? '#34d399' : 'var(--muted)', fontSize:12, cursor:'pointer' }}>
                {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={handleDownloadPDF}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background:'var(--b-dim)', border:'1px solid var(--b-border)', color:'var(--b-1)', fontSize:12, cursor:'pointer' }}>
                <Download size={13} /> PDF
              </button>
              <button onClick={handleShare} disabled={sharing}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)', color:'#34d399', fontSize:12, fontWeight:700, cursor:sharing?'not-allowed':'pointer' }}>
                <Share2 size={13} /> {sharing ? 'Sharing...' : 'Share'}
              </button>
              <button onClick={() => setShowVersions(!showVersions)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background: showVersions ? 'rgba(167,139,250,0.1)' : 'var(--bg-4)', border:`1px solid ${showVersions ? 'rgba(167,139,250,0.3)' : 'var(--border)'}`, color: showVersions ? '#a78bfa' : 'var(--muted)', fontSize:12, cursor:'pointer' }}>
                <History size={13} /> History ({versions.length})
                {showVersions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              <button onClick={handleAnalyze} disabled={analyzing}
                className="btn-p"
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background:analyzing?'var(--bg-4)':'var(--g-y)', color:analyzing?'var(--muted)':'#000', fontSize:12, fontWeight:700, border:'none', cursor:analyzing?'not-allowed':'pointer' }}>
                {analyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* Share URL */}
          {shareUrl && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 22px', borderBottom:'1px solid var(--border)', background:'rgba(52,211,153,0.04)' }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#34d399', flexShrink:0 }}>Share Link:</span>
              <code style={{ flex:1, padding:'6px 10px', borderRadius:8, background:'var(--bg-4)', color:'var(--white-1)', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{shareUrl}</code>
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); setShareCopied(true); toast.success('Copied!'); setTimeout(() => setShareCopied(false), 2000); }}
                style={{ padding:'6px 12px', borderRadius:8, background: shareCopied ? 'rgba(52,211,153,0.15)' : 'var(--bg-4)', border:'1px solid var(--border)', color: shareCopied ? '#34d399' : 'var(--muted)', fontSize:11, cursor:'pointer', flexShrink:0 }}>
                {shareCopied ? 'Copied!' : 'Copy'}
              </button>
              <a href={shareUrl} target="_blank" rel="noreferrer"
                style={{ padding:'6px 12px', borderRadius:8, background:'var(--b-dim)', border:'1px solid var(--b-border)', color:'var(--b-1)', fontSize:11, textDecoration:'none', flexShrink:0 }}>
                Preview
              </a>
            </div>
          )}

          {/* Version History */}
          {showVersions && versions.length > 0 && (
            <div className="afi" style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-1)', padding:'16px 22px' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.06em' }}>Version History</p>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                <input value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder="Label e.g. After mentor feedback..."
                  style={{ flex:1, padding:'9px 12px', borderRadius:9, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:12, outline:'none' }}
                  onFocus={(e) => e.target.style.borderColor='var(--y)'}
                  onBlur={(e)  => e.target.style.borderColor='var(--border)'} />
                <button onClick={handleSaveVersion} disabled={savingVersion}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:9, background:savingVersion?'var(--bg-4)':'var(--y-dim)', border:'1px solid var(--y-border)', color:savingVersion?'var(--muted)':'var(--y)', fontSize:12, fontWeight:700, cursor:savingVersion?'not-allowed':'pointer' }}>
                  <Save size={12} /> {savingVersion ? 'Saving...' : 'Save Version'}
                </button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[...versions].reverse().map((ver, idx) => {
                  const realIdx   = versions.length - 1 - idx;
                  const isComparing = compareIdx === realIdx;
                  return (
                    <div key={realIdx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, background: isComparing ? 'rgba(167,139,250,0.08)' : 'var(--bg-3)', border:`1px solid ${isComparing ? 'rgba(167,139,250,0.3)' : 'var(--border)'}` }}>
                      <div>
                        <p style={{ fontSize:12, fontWeight:600, color:'var(--white)', marginBottom:2 }}>{ver.label}</p>
                        <p style={{ fontSize:10, color:'var(--muted)' }}>{new Date(ver.createdAt).toLocaleString()} · {ver.content?.split(/\s+/).length||0} words</p>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={() => setCompareIdx(isComparing ? null : realIdx)}
                          style={{ padding:'6px 12px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', background: isComparing ? 'rgba(167,139,250,0.15)' : 'var(--bg-4)', border:`1px solid ${isComparing ? 'rgba(167,139,250,0.3)' : 'var(--border)'}`, color: isComparing ? '#a78bfa' : 'var(--muted)' }}>
                          {isComparing ? 'Hide' : 'Compare'}
                        </button>
                        <button onClick={() => handleRestore(realIdx)} disabled={restoring}
                          style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius:8, fontSize:11, fontWeight:700, cursor:restoring?'not-allowed':'pointer', background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', color:'#34d399' }}>
                          <RotateCcw size={10} /> {restoring ? '...' : 'Restore'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Compare view */}
          {compareIdx !== null && versions[compareIdx] && (
            <div className="afi" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid var(--border)' }}>
              <div style={{ padding:'18px 20px', borderRight:'1px solid var(--border)' }}>
                <p style={{ fontSize:11, fontWeight:700, color:'var(--y)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>Current Version</p>
                <pre style={{ fontSize:12, lineHeight:1.7, color:'var(--white-1)', fontFamily:'inherit', whiteSpace:'pre-wrap', maxHeight:280, overflowY:'auto' }}>
                  {sop.polished || sop.content}
                </pre>
              </div>
              <div style={{ padding:'18px 20px' }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#a78bfa', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>{versions[compareIdx].label}</p>
                <pre style={{ fontSize:12, lineHeight:1.7, color:'var(--muted)', fontFamily:'inherit', whiteSpace:'pre-wrap', maxHeight:280, overflowY:'auto' }}>
                  {versions[compareIdx].content}
                </pre>
              </div>
            </div>
          )}

          {/* SOP Content */}
          <div style={{ padding:'24px' }}>
            <pre style={{ fontSize:13, lineHeight:1.8, color:'var(--white-1)', fontFamily:'Georgia, serif', whiteSpace:'pre-wrap' }}>
              {sop.polished || sop.draft || sop.content}
            </pre>
          </div>
        </div>
      )}

      {/* Analysis */}
      {analysis && (
        <div className="afu" style={{ borderRadius:16, padding:'24px', background:'var(--bg-2)', border:'1px solid var(--border)' }}>
          <h2 style={{ fontFamily:'Space Grotesk', fontSize:15, fontWeight:700, color:'var(--white)', marginBottom:16 }}>SOP Analysis</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:12, marginBottom:16 }}>
            {analysis.scores && Object.entries(analysis.scores).map(([key, val]) => {
              const c = val >= 8 ? '#34d399' : val >= 6 ? 'var(--y)' : '#f87171';
              return (
                <div key={key} style={{ textAlign:'center', padding:'14px', borderRadius:12, background:'var(--bg-3)', border:'1px solid var(--border)' }}>
                  <div style={{ fontFamily:'Space Grotesk', fontSize:22, fontWeight:900, color:c, marginBottom:4 }}>{val}/10</div>
                  <div style={{ fontSize:11, color:'var(--muted)', textTransform:'capitalize' }}>{key}</div>
                </div>
              );
            })}
          </div>
          {analysis.feedback && (
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'var(--muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Feedback</p>
              {(Array.isArray(analysis.feedback) ? analysis.feedback : [analysis.feedback]).map((f, i) => (
                <p key={i} style={{ fontSize:13, color:'var(--white-1)', marginBottom:6, paddingLeft:12, borderLeft:'2px solid var(--y-border)' }}>• {f}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}