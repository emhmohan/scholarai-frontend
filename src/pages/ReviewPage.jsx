import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, Star, Send, Eye, Sparkles } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ReviewPage() {
  const { token }  = useParams();
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [name,     setName]     = useState('');
  const [comment,  setComment]  = useState('');
  const [posting,  setPosting]  = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [aiLoading,setAiLoading]= useState(false);

  useEffect(() => { fetchSOP(); }, [token]);

  const fetchSOP = async () => {
    try {
      const res = await api.get(`/share/${token}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Link not found or expired');
    } finally { setLoading(false); }
  };

  const handleComment = async () => {
    if (!comment.trim()) { toast.error('Write a comment first'); return; }
    setPosting(true);
    try {
      const res = await api.post(`/share/${token}/comment`, { name, comment });
      setData((prev) => ({ ...prev, comments: res.data.data.comments }));
      setComment('');
      toast.success('Comment added!');
    } catch { toast.error('Failed to add comment'); }
    finally  { setPosting(false); }
  };

  const handleAiReview = async () => {
    setAiLoading(true);
    try {
      const res = await api.post(`/share/${token}/ai-review`);
      setAiReview(res.data.data);
      toast.success('AI review complete!');
    } catch { toast.error('Failed to get AI review'); }
    finally  { setAiLoading(false); }
  };

  const scoreColor = (s) => s >= 8 ? '#34d399' : s >= 6 ? '#fbbf24' : '#f87171';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: '#6c63ff', borderTopColor: 'transparent' }} />
        <p className="text-white">Loading SOP...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
      <div className="text-center p-8 rounded-2xl border max-w-md"
        style={{ background: '#111118', borderColor: '#2d2d3d' }}>
        <p className="text-4xl mb-4">🔗</p>
        <h2 className="text-white font-bold text-xl mb-2">Link Not Found</h2>
        <p style={{ color: '#94a3b8' }}>{error}</p>
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
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{data.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm" style={{ color: '#64748b' }}>
            <span className="flex items-center gap-1">
              <Eye size={14} /> {data.viewCount} views
            </span>
            <span>·</span>
            <span>{data.comments?.length || 0} comments</span>
            <span>·</span>
            <span>Shared via ScholarAI</span>
          </div>
        </div>

        {/* SOP Content */}
        <div className="rounded-2xl border p-8 mb-6" style={{ background: '#111118', borderColor: '#2d2d3d' }}>
          <pre className="text-sm whitespace-pre-wrap leading-relaxed"
            style={{ color: '#e2e8f0', fontFamily: 'Georgia, serif', lineHeight: '1.8' }}>
            {data.content}
          </pre>
        </div>

        {/* AI Review button */}
        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#111118', borderColor: '#2d2d3d' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Sparkles size={16} style={{ color: '#6c63ff' }} />
              AI Review
            </h2>
            <button onClick={handleAiReview} disabled={aiLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: aiLoading ? '#2d2d3d' : 'linear-gradient(135deg, #6c63ff, #a78bfa)', cursor: aiLoading ? 'not-allowed' : 'pointer' }}>
              <Sparkles size={14} />
              {aiLoading ? 'Reviewing...' : 'Get AI Review'}
            </button>
          </div>

          {aiLoading && (
            <div className="text-center py-4">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-2"
                style={{ borderColor: '#6c63ff', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: '#64748b' }}>Analyzing SOP...</p>
            </div>
          )}

          {aiReview && !aiLoading && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl font-bold" style={{ color: scoreColor(aiReview.overallScore) }}>
                  {aiReview.overallScore}/10
                </div>
                <p className="text-sm" style={{ color: '#94a3b8' }}>{aiReview.summary}</p>
              </div>

              {/* Score bars */}
              {aiReview.scores && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  {Object.entries(aiReview.scores).map(([key, val]) => (
                    <div key={key} className="text-center p-3 rounded-xl" style={{ background: '#0a0a0f' }}>
                      <div className="text-lg font-bold mb-1" style={{ color: scoreColor(val) }}>
                        {val}/10
                      </div>
                      <div className="text-xs capitalize" style={{ color: '#64748b' }}>{key}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiReview.strengths?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>Strengths</p>
                    {aiReview.strengths.map((s, i) => (
                      <p key={i} className="text-sm mb-1" style={{ color: '#94a3b8' }}>• {s}</p>
                    ))}
                  </div>
                )}
                {aiReview.improvements?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#fbbf24' }}>Improvements</p>
                    {aiReview.improvements.map((s, i) => (
                      <p key={i} className="text-sm mb-1" style={{ color: '#94a3b8' }}>• {s}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!aiReview && !aiLoading && (
            <p className="text-sm text-center py-2" style={{ color: '#64748b' }}>
              Click to get an instant AI analysis of this SOP
            </p>
          )}
        </div>

        {/* Comments */}
        <div className="rounded-2xl border p-6" style={{ background: '#111118', borderColor: '#2d2d3d' }}>
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <MessageCircle size={16} style={{ color: '#6c63ff' }} />
            Comments ({data.comments?.length || 0})
          </h2>

          {/* Add comment */}
          <div className="mb-6 p-4 rounded-xl" style={{ background: '#0a0a0f' }}>
            <div className="flex gap-3 mb-3">
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: '#1a1a24', border: '1px solid #2d2d3d' }}
                onFocus={(e) => e.target.style.borderColor = '#6c63ff'}
                onBlur={(e) => e.target.style.borderColor = '#2d2d3d'} />
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              rows={3} placeholder="Add your feedback or review..."
              className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none mb-3"
              style={{ background: '#1a1a24', border: '1px solid #2d2d3d' }}
              onFocus={(e) => e.target.style.borderColor = '#6c63ff'}
              onBlur={(e) => e.target.style.borderColor = '#2d2d3d'} />
            <button onClick={handleComment} disabled={posting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: posting ? '#2d2d3d' : 'linear-gradient(135deg, #6c63ff, #a78bfa)', cursor: posting ? 'not-allowed' : 'pointer' }}>
              <Send size={14} />
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>

          {/* Comments list */}
          {data.comments?.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: '#64748b' }}>
              No comments yet — be the first to review!
            </p>
          )}
          <div className="space-y-3">
            {data.comments?.map((c, i) => (
              <div key={i} className="p-4 rounded-xl border" style={{ background: '#0a0a0f', borderColor: '#2d2d3d' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}>
                    {c.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="text-white text-sm font-medium">{c.name || 'Anonymous'}</span>
                  <span className="text-xs" style={{ color: '#64748b' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#94a3b8' }}>{c.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: '#64748b' }}>
          Shared via <span style={{ color: '#6c63ff' }}>ScholarAI</span> · AI-powered scholarship platform
        </p>
      </div>
    </div>
  );
}