import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { Award, Sparkles, Copy, CheckCircle, Download, Link, X } from 'lucide-react';
import jsPDF from 'jspdf';

export default function LORPage() {
  const [form, setForm] = useState({
    recommenderName: '', recommenderTitle: '', recommenderEmail: '',
    relationship: '', duration: '', achievements: '', targetProgram: '',
  });
  const [loading,        setLoading]        = useState(false);
  const [emailLoading,   setEmailLoading]   = useState(false);
  const [lor,            setLor]            = useState(null);
  const [reqEmail,       setReqEmail]       = useState(null);
  const [copied,         setCopied]         = useState('');
  const [portalUrl,      setPortalUrl]      = useState('');
  const [portalCopied,   setPortalCopied]   = useState(false);
  const [creatingPortal, setCreatingPortal] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleGenerate = async () => {
    if (!form.recommenderName || !form.relationship) {
      toast.error('Recommender name and relationship are required');
      return;
    }
    setLoading(true);
    setLor(null);
    setReqEmail(null);
    setPortalUrl('');
    try {
      const res = await api.post('/lor/generate', form);
      setLor(res.data.data);
      toast.success('LOR generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate LOR');
    } finally { setLoading(false); }
  };

  const handleRequestEmail = async () => {
    if (!lor?._id) return;
    setEmailLoading(true);
    try {
      const res = await api.post(`/lor/${lor._id}/request-email`);
      setReqEmail(res.data.data?.email || res.data.data);
      toast.success('Request email generated!');
    } catch { toast.error('Failed to generate request email'); }
    finally  { setEmailLoading(false); }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copied!');
    setTimeout(() => setCopied(''), 2000);
  };

  const handleCreatePortal = async () => {
    if (!lor?._id) return;
    setCreatingPortal(true);
    try {
      const res = await api.post('/recommender/create', {
        lorId: lor._id, recommenderEmail: form.recommenderEmail, targetProgram: form.targetProgram,
      });
      setPortalUrl(res.data.data.portalUrl);
      toast.success('Recommender portal created!');
    } catch { toast.error('Failed to create portal'); }
    finally  { setCreatingPortal(false); }
  };

  const handleDownloadPDF = (content, type) => {
    if (!content) return;
    const doc = new jsPDF();
    const w   = doc.internal.pageSize.getWidth();
    const h   = doc.internal.pageSize.getHeight();
    const m   = 20;
    doc.setFillColor(5, 5, 7);
    doc.rect(0, 0, w, 36, 'F');
    doc.setFillColor(245, 197, 24);
    doc.rect(0, 0, 4, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(type === 'lor' ? 'Letter of Recommendation' : 'Professor Request Email', m + 4, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${form.recommenderName} · ScholarAI · ${new Date().toLocaleDateString()}`, m + 4, 27);
    const lines = doc.splitTextToSize(content, w - m * 2);
    let y = 46;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    lines.forEach((line) => {
      if (y + 6 > h - 20) { doc.addPage(); y = 20; }
      doc.text(line, m, y);
      y += 6;
    });
    doc.save(`${type === 'lor' ? 'LOR' : 'Request'}_${form.recommenderName.replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF downloaded!');
  };

  const fields = [
    { key: 'recommenderName',  label: 'Recommender Name *', placeholder: 'Dr. John Smith',                  half: true  },
    { key: 'recommenderTitle', label: 'Title / Position',   placeholder: 'Professor, MIT',                  half: true  },
    { key: 'recommenderEmail', label: 'Email (optional)',   placeholder: 'john@mit.edu',                    half: true  },
    { key: 'targetProgram',    label: 'Target Program',     placeholder: 'MS Computer Science at Stanford',  half: true  },
    { key: 'duration',         label: 'Duration Known',     placeholder: '2 years',                         half: true  },
    { key: 'relationship',     label: 'Your Relationship *',placeholder: 'Describe your relationship...',    half: false, textarea: true },
    { key: 'achievements',     label: 'Key Achievements',   placeholder: 'Specific projects, results...',   half: false, textarea: true },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div className="afu" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--b-dim)', border: '1px solid var(--b-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Award size={19} style={{ color: 'var(--b-1)' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--white)' }}>Letter of Recommendation</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>AI-drafted LOR with recommender portal</p>
        </div>
      </div>

      {/* Form */}
      <div className="afu" style={{ borderRadius: 18, padding: '24px', background: 'var(--bg-2)', border: '1px solid var(--border)', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 700, color: 'var(--white)', marginBottom: 18 }}>Recommender Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {fields.map(({ key, label, placeholder, half, textarea }) => (
            <div key={key} style={{ gridColumn: half ? 'span 1' : '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
              {textarea ? (
                <textarea value={form[key]} onChange={(e) => set(key, e.target.value)} rows={3} placeholder={placeholder}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--white-1)', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--y)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,197,24,0.08)'; }}
                  onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
              ) : (
                <input value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--white-1)', fontSize: 13, outline: 'none' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--y)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,197,24,0.08)'; }}
                  onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
              )}
            </div>
          ))}
        </div>

        <button onClick={handleGenerate} disabled={loading}
          className="btn-p"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 11, background: loading ? 'var(--bg-4)' : 'var(--g-y)', color: loading ? 'var(--muted)' : '#000', fontSize: 13, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 18 }}>
          <Sparkles size={15} />
          {loading ? 'Generating LOR...' : 'Generate LOR'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="afu" style={{ borderRadius: 16, padding: '32px', textAlign: 'center', background: 'var(--bg-2)', border: '1px solid var(--b-border)', marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--b-1)', borderTopColor: 'transparent', animation: 'spinSlow 0.8s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>Drafting your LOR...</p>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>AI writing from recommender perspective — 20–30 seconds</p>
        </div>
      )}

      {/* Generated LOR */}
      {lor && !loading && (
        <div className="afu" style={{ borderRadius: 18, background: 'var(--bg-2)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--border)', background: 'var(--bg-3)', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>Generated LOR</h2>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>From {form.recommenderName} · {form.recommenderTitle}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => handleCopy(lor.polished || lor.draft, 'lor')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, background: 'var(--bg-4)', border: '1px solid var(--border)', color: copied === 'lor' ? '#34d399' : 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>
                {copied === 'lor' ? <CheckCircle size={13} /> : <Copy size={13} />}
                {copied === 'lor' ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => handleDownloadPDF(lor.polished || lor.draft, 'lor')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, background: 'var(--b-dim)', border: '1px solid var(--b-border)', color: 'var(--b-1)', fontSize: 12, cursor: 'pointer' }}>
                <Download size={13} /> PDF
              </button>
              <button onClick={handleCreatePortal} disabled={creatingPortal}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontSize: 12, fontWeight: 700, cursor: creatingPortal ? 'not-allowed' : 'pointer' }}>
                <Link size={13} /> {creatingPortal ? 'Creating...' : 'Recommender Portal'}
              </button>
              <button onClick={handleRequestEmail} disabled={emailLoading}
                className="btn-p"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, background: emailLoading ? 'var(--bg-4)' : 'var(--g-b)', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: emailLoading ? 'not-allowed' : 'pointer' }}>
                {emailLoading ? 'Generating...' : 'Get Request Email'}
              </button>
            </div>
          </div>

          {/* Portal URL */}
          {portalUrl && (
            <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', background: 'rgba(52,211,153,0.04)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>Recommender Portal Created</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                Send this link to {form.recommenderName} — they can review, edit and submit the LOR directly.
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'var(--bg-4)', color: 'var(--white-1)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {portalUrl}
                </code>
                <button onClick={() => { navigator.clipboard.writeText(portalUrl); setPortalCopied(true); toast.success('Copied!'); setTimeout(() => setPortalCopied(false), 2000); }}
                  style={{ padding: '8px 12px', borderRadius: 8, background: portalCopied ? 'rgba(52,211,153,0.15)' : 'var(--bg-4)', border: '1px solid var(--border)', color: portalCopied ? '#34d399' : 'var(--muted)', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                  {portalCopied ? 'Copied!' : 'Copy'}
                </button>
                <a href={portalUrl} target="_blank" rel="noreferrer"
                  style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--b-dim)', border: '1px solid var(--b-border)', color: 'var(--b-1)', fontSize: 11, textDecoration: 'none', flexShrink: 0 }}>
                  Preview
                </a>
              </div>
            </div>
          )}

          {/* LOR content */}
          <div style={{ padding: '22px' }}>
            <pre style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--white-1)', fontFamily: 'Georgia, serif', whiteSpace: 'pre-wrap' }}>
              {lor.polished || lor.draft}
            </pre>
          </div>
        </div>
      )}

      {/* Request Email */}
      {reqEmail && (
        <div className="afu" style={{ borderRadius: 18, background: 'var(--bg-2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--border)', background: 'var(--bg-3)', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>Professor Request Email</h2>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>Send this to {form.recommenderName}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleCopy(reqEmail, 'email')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, background: 'var(--bg-4)', border: '1px solid var(--border)', color: copied === 'email' ? '#34d399' : 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>
                {copied === 'email' ? <CheckCircle size={13} /> : <Copy size={13} />}
                {copied === 'email' ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => handleDownloadPDF(reqEmail, 'email')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, background: 'var(--b-dim)', border: '1px solid var(--b-border)', color: 'var(--b-1)', fontSize: 12, cursor: 'pointer' }}>
                <Download size={13} /> PDF
              </button>
            </div>
          </div>
          <div style={{ padding: '22px' }}>
            <pre style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--white-1)', fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
              {reqEmail}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}