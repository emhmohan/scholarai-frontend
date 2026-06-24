import { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import { MessageCircle, X, Send, Bot, User, Loader } from 'lucide-react';

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am ScholarAI Assistant 👋 Ask me anything about scholarships, SOPs, LORs, or your application strategy!',
    },
  ]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post('/agent/chat', {
        message: userMsg.content,
        history,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    'Which scholarship suits me best?',
    'How do I write a strong SOP?',
    'What documents do I need?',
    'How to request a LOR?',
  ];

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 rounded-2xl border shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{ background: '#111118', borderColor: '#2d2d3d', height: '500px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', borderColor: '#2d2d3d' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <Bot size={16} color="white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">ScholarAI Assistant</p>
                <p className="text-xs text-white text-opacity-80" style={{ opacity: 0.8 }}>
                  Powered by LLaMA 3
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-white hover:opacity-70 transition-opacity">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: msg.role === 'user' ? '#6c63ff' : '#1a1a24' }}>
                  {msg.role === 'user'
                    ? <User size={12} color="white" />
                    : <Bot size={12} style={{ color: '#6c63ff' }} />}
                </div>

                {/* Bubble */}
                <div className="max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background:   msg.role === 'user' ? '#6c63ff' : '#1a1a24',
                    color:        '#e2e8f0',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: '#1a1a24' }}>
                  <Bot size={12} style={{ color: '#6c63ff' }} />
                </div>
                <div className="px-4 py-3 rounded-2xl" style={{ background: '#1a1a24' }}>
                  <Loader size={16} className="animate-spin" style={{ color: '#6c63ff' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions — only show when no user messages yet */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs mb-2" style={{ color: '#64748b' }}>Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {quickQuestions.map((q) => (
                  <button key={q} onClick={() => setInput(q)}
                    className="text-xs px-2 py-1 rounded-lg transition-all"
                    style={{ background: '#1a1a24', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(167,139,250,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a24'}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t" style={{ borderColor: '#2d2d3d' }}>
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{ background: '#1a1a24', border: '1px solid #2d2d3d', color: '#e2e8f0', maxHeight: '80px' }}
                onFocus={(e) => e.target.style.borderColor = '#6c63ff'}
                onBlur={(e) => e.target.style.borderColor = '#2d2d3d'} />
              <button onClick={sendMessage} disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: loading || !input.trim() ? '#2d2d3d' : 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                }}>
                <Send size={14} color="white" />
              </button>
            </div>
            <p className="text-xs mt-1.5 text-center" style={{ color: '#64748b' }}>
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-200"
        style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
        {open
          ? <X size={22} color="white" />
          : <MessageCircle size={22} color="white" />}

        {/* Pulse animation when closed */}
        {!open && (
          <span className="absolute w-full h-full rounded-full animate-ping opacity-30"
            style={{ background: '#6c63ff' }} />
        )}
      </button>
    </>
  );
}