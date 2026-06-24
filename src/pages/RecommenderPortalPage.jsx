import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Award, Send, CheckCircle, Eye } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function RecommenderPortalPage() {
  const { token }   = useParams();
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [content,   setContent]   = useState('');
  const [notes,     setNotes]     = useState('');
  const [submitting,setSubmitting]= useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { fetchPortal(); }, [token]);

  const fetchPortal = async () => {
    try {
      const res = await api.get(`/recommender/${token}`);
      setData(res.data.data);
      setContent(res.data.data.draftContent || '');
      if (res.data.data.status === 'submitted') setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Portal not found or expired');
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!content.trim()) { toast.error('Please write or edit the LOR before submitting'); return; }
    setSubmitting(true);
    try {
      await api.post(`/recommender/${token}/submit`, { content, notes });
      setSubmitted(true);
      toast.success('LOR submitted successfully! The student has been notified.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit LOR');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: '#6c63ff', borderTopColor: 'transparent' }} />
        <p className="text-white">Loading portal...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
      <div className="text-center p-8 rounded-2xl border max-w-md"
        style={{ background: '#111118', borderColor: '#2d2d3d' }}>
        <p className="text-4xl mb-4">🔗</p>
        <h2 className="text-white font-bold text-xl mb-2">Portal Not Found</h2>
        <p style={{ color: '#94a3b8' }}>{error}</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
      <div className="text-center p-10 rounded-2xl border max-w-md"
        style={{ background: '#111118', borderColor: 'rgba(52,211,153,0.3)' }}>
        <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#34d399' }} />
        <h2 className="text-white font-bold text-2xl mb-2">LOR Submitted!</h2>
        <p style={{ color: '#94a3b8' }}>
          Thank you for submitting the letter of recommendation for{' '}
          <strong style={{ color: '#fff' }}>{data?.studentName}</strong>.
          They have been notified.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#0a0a0f' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}>
            <Award size={20} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Letter of Recommendation Portal</h1>
          <p style={{ color: '#94a3b8' }}>
            {data?.studentName} has requested a letter of recommendation
          </p>
        </div>

        {/* Info Card */}
        <div className="rounded-2xl border p-6 mb-6"
          style={{ background: 'rgba(108,99,255,0.05)', borderColor: 'rgba(108,99,255,0.3)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: '#64748b' }}>Student</p>
              <p className="text-white font-semibold">{data?.studentName}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#64748b' }}>Target Program</p>
              <p className="text-white font-semibold">{data?.targetProgram || 'Graduate Program'}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#64748b' }}>Status</p>
              <span className="text-xs px-3 py-1 rounded-full font-medium capitalize"
                style={{
                  background: data?.status === 'submitted' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)',
                  color:      data?.status === 'submitted' ? '#34d399' : '#fbbf24',
                }}>
                {data?.status === 'viewed' ? 'In Progress' : data?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl border p-5 mb-6"
          style={{ background: '#111118', borderColor: '#2d2d3d' }}>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Eye size={16} style={{ color: '#6c63ff' }} /> Instructions
          </h2>
          <div className="space-y-2">
            {[
              'An AI-drafted letter has been pre-filled below for your convenience',
              'Please review, edit, and personalize the letter as you see fit',
              'You can completely rewrite it or make minor adjustments',
              'Click Submit LOR when you are satisfied with the letter',
              'The student will be notified immediately upon submission',
            ].map((inst, i) => (
              <p key={i} className="text-sm flex items-start gap-2" style={{ color: '#94a3b8' }}>
                <span style={{ color: '#6c63ff', fontWeight: 'bold', minWidth: '16px' }}>{i + 1}.</span>
                {inst}
              </p>
            ))}
          </div>
        </div>

        {/* LOR Editor */}
        <div className="rounded-2xl border mb-6" style={{ background: '#111118', borderColor: '#2d2d3d' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: '#2d2d3d' }}>
            <h2 className="text-white font-semibold">Letter of Recommendation</h2>
            <span className="text-xs" style={{ color: '#64748b' }}>
              {content.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <div className="p-6">
            <textarea value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              placeholder="Write or edit the letter of recommendation here..."
              className="w-full text-sm outline-none resize-none leading-relaxed"
              style={{
                background:  'transparent',
                border:      'none',
                color:       '#e2e8f0',
                fontFamily:  'Georgia, serif',
                lineHeight:  '1.8',
              }} />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border p-6 mb-6"
          style={{ background: '#111118', borderColor: '#2d2d3d' }}>
          <h2 className="text-white font-semibold mb-3">Notes to Student (Optional)</h2>
          <textarea value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any additional notes or comments for the student..."
            className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
            style={{ background: '#1a1a24', border: '1px solid #2d2d3d' }}
            onFocus={(e) => e.target.style.borderColor = '#6c63ff'}
            onBlur={(e) => e.target.style.borderColor = '#2d2d3d'} />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white"
            style={{
              background: submitting ? '#2d2d3d' : 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}>
            <Send size={18} />
            {submitting ? 'Submitting...' : 'Submit Letter of Recommendation'}
          </button>
          <p className="text-xs" style={{ color: '#64748b' }}>
            Once submitted the student will be notified immediately
          </p>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: '#64748b' }}>
          Powered by <span style={{ color: '#6c63ff' }}>ScholarAI</span> · Secure Recommender Portal
        </p>
      </div>
    </div>
  );
}