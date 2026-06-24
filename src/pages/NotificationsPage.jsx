import { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Send, Settings } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [settings, setSettings] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState('');

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/notifications/settings');
      setSettings(res.data.data);
    } catch { toast.error('Failed to load settings'); }
    finally  { setLoading(false); }
  };

  const handleSend = async (type) => {
    setSending(type);
    try {
      const endpoints = { test: '/notifications/test', deadline: '/notifications/deadline-check', checklist: '/notifications/checklist-reminder' };
      const res = await api.post(endpoints[type]);
      const { sent, message } = res.data.data;
      if (sent) toast.success(message);
      else      toast.error(message || 'Email not configured');
    } catch { toast.error('Failed to send'); }
    finally  { setSending(''); }
  };

  const notifications = [
    { id: 'test',      title: 'Welcome Email',      desc: 'Send a test email to verify your Resend configuration is working', icon: '📧', color: 'var(--y)',   label: 'Send Test' },
    { id: 'deadline',  title: 'Deadline Reminders', desc: 'Get notified about scholarships with deadlines in the next 7 days', icon: '⏰', color: '#f87171',  label: 'Check Deadlines' },
    { id: 'checklist', title: 'Task Reminders',     desc: 'Get a reminder email about your pending checklist tasks',           icon: '📋', color: 'var(--b-1)', label: 'Send Reminder' },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* Header */}
      <div className="afu" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--y-dim)', border: '1px solid var(--y-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={19} style={{ color: 'var(--y)' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--white)' }}>Notifications</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Email reminders for deadlines and tasks via Resend</p>
        </div>
      </div>

      {/* Status */}
      {!loading && (
        <div className="afu" style={{ borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, background: settings?.emailConfigured ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)', border: `1px solid ${settings?.emailConfigured ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.2)'}` }}>
          {settings?.emailConfigured
            ? <CheckCircle size={20} style={{ color: '#34d399', flexShrink: 0 }} />
            : <XCircle    size={20} style={{ color: '#f87171', flexShrink: 0 }} />}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>
              {settings?.emailConfigured ? 'Resend Email Configured' : 'Email Not Configured'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              {settings?.emailConfigured
                ? `Sending to: ${settings.userEmail} · Note: Free tier sends only to your Resend account email`
                : 'Add RESEND_API_KEY to backend/.env to enable emails'}
            </p>
          </div>
        </div>
      )}

      {/* Setup guide */}
      {!loading && !settings?.emailConfigured && (
        <div className="afu" style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={15} style={{ color: 'var(--y)' }} /> Quick Setup
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Go to resend.com and sign up free',
              'Go to API Keys → Create API Key',
              'Copy the key starting with re_',
              'Add to backend/.env: RESEND_API_KEY=re_your_key',
              'Add to backend/.env: RESEND_FROM=ScholarAI <onboarding@resend.dev>',
              'Restart backend — emails will work!',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: 'var(--y-dim)', border: '1px solid var(--y-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--y)', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', paddingTop: 3 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {notifications.map(({ id, title, desc, icon, color, label }) => (
          <div key={id} className="afu ch" style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>{title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
              <button onClick={() => handleSend(id)} disabled={sending === id}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: sending === id ? 'var(--bg-4)' : `${color}15`, border: `1px solid ${color}33`, color: sending === id ? 'var(--muted)' : color, fontSize: 13, fontWeight: 700, cursor: sending === id ? 'not-allowed' : 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
                <Send size={13} />
                {sending === id ? 'Sending...' : label}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Templates info */}
      <div className="afu" style={{ borderRadius: 16, padding: '22px', background: 'var(--bg-2)', border: '1px solid var(--border)', marginTop: 20 }}>
        <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 14 }}>Email Templates</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {[
            { emoji: '🎓', name: 'Welcome',          desc: 'On registration'              },
            { emoji: '⏰', name: 'Deadline Reminder', desc: 'Scholarships due in 7 days'  },
            { emoji: '📬', name: 'Status Update',     desc: 'Scholarship status change'   },
            { emoji: '📋', name: 'Task Reminder',     desc: 'Pending checklist tasks'     },
            { emoji: '✉️', name: 'LOR Request',       desc: 'Invite to recommender portal' },
            { emoji: '📝', name: 'LOR Submitted',     desc: 'Professor submitted LOR'     },
          ].map(({ emoji, name, desc }) => (
            <div key={name} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 18, display: 'block', marginBottom: 6 }}>{emoji}</span>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--white-2)', marginBottom: 2 }}>{name}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}