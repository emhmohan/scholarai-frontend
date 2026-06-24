import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckSquare, Sparkles, Plus, Trash2, RefreshCw } from 'lucide-react';

const PRIORITY_STYLE = {
  critical: { bg: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'rgba(248,113,113,0.2)', dot: '#f87171'  },
  high:     { bg: 'rgba(245,197,24,0.1)',  color: 'var(--y)', border: 'var(--y-border)',      dot: 'var(--y)' },
  medium:   { bg: 'rgba(59,126,255,0.1)',  color: 'var(--b-1)', border: 'var(--b-border)',    dot: 'var(--b-1)' },
  low:      { bg: 'rgba(148,148,176,0.1)', color: 'var(--muted)', border: 'rgba(148,148,176,0.2)', dot: 'var(--muted)' },
};

const CATEGORY_ICONS = {
  documents:    '📄', tests:        '📝', applications: '📨',
  financial:    '💰', interviews:   '🎤', other:         '📌',
};

export default function ChecklistPage() {
  const [checklist, setChecklist] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [generating,setGenerating]= useState(false);
  const [newTask,   setNewTask]   = useState('');
  const [filter,    setFilter]    = useState('all');

  useEffect(() => { fetchChecklist(); }, []);

  const fetchChecklist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/checklist');
      setChecklist(res.data.data);
    } catch { /* silent */ }
    finally  { setLoading(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/checklist/generate');
      setChecklist(res.data.data);
      toast.success('Personalized checklist generated!');
    } catch { toast.error('Failed to generate checklist'); }
    finally  { setGenerating(false); }
  };

  const handleToggle = async (taskId) => {
    try {
      const res = await api.patch(`/checklist/${taskId}/toggle`);
      setChecklist(res.data.data);
    } catch { toast.error('Failed to update task'); }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      const res = await api.post('/checklist/suggest', { customTask: newTask });
      setChecklist(res.data.data);
      setNewTask('');
      toast.success('Task added!');
    } catch { toast.error('Failed to add task'); }
  };

  const tasks    = checklist?.tasks || [];
  const total    = tasks.length;
  const done     = tasks.filter((t) => t.completed).length;
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
  const pctColor = pct >= 80 ? '#34d399' : pct >= 50 ? 'var(--y)' : 'var(--b-1)';

  const priorities = ['critical','high','medium','low'];

  const filtered = filter === 'all' ? tasks : tasks.filter((t) =>
    filter === 'done' ? t.completed : filter === 'pending' ? !t.completed : t.priority === filter
  );

  const grouped = priorities.reduce((acc, p) => {
    const items = filtered.filter((t) => t.priority === p);
    if (items.length) acc[p] = items;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div className="afu" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--y-dim)', border: '1px solid var(--y-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckSquare size={19} style={{ color: 'var(--y)' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--white)' }}>Application Checklist</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>25 AI-personalized tasks to keep you on track</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {tasks.length > 0 && (
            <button onClick={fetchChecklist}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
              <RefreshCw size={13} /> Refresh
            </button>
          )}
          <button onClick={handleGenerate} disabled={generating}
            className="btn-p"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 11, background: generating ? 'var(--bg-4)' : 'var(--g-y)', color: generating ? 'var(--muted)' : '#000', fontSize: 13, fontWeight: 700, border: 'none', cursor: generating ? 'not-allowed' : 'pointer' }}>
            <Sparkles size={14} />
            {generating ? 'Generating...' : tasks.length > 0 ? 'Regenerate' : 'Generate Checklist'}
          </button>
        </div>
      </div>

      {/* Progress */}
      {tasks.length > 0 && (
        <div className="afu" style={{ borderRadius: 16, padding: '20px 24px', marginBottom: 20, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>Overall Progress</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{done} of {total} tasks completed</p>
            </div>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 900, color: pctColor }}>{pct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-4)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pctColor, borderRadius: 99, transition: 'width 0.8s ease', boxShadow: `0 0 10px ${pctColor}44` }} />
          </div>
          {/* Priority breakdown */}
          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            {priorities.map((p) => {
              const count    = tasks.filter((t) => t.priority === p).length;
              const doneCount = tasks.filter((t) => t.priority === p && t.completed).length;
              const style    = PRIORITY_STYLE[p];
              if (!count) return null;
              return (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: style.dot }} />
                  <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{p}: {doneCount}/{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add task */}
      {tasks.length > 0 && (
        <div className="afu" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input value={newTask} onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a custom task..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--white-1)', fontSize: 13, outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--y)'}
            onBlur={(e)  => e.target.style.borderColor = 'var(--border)'} />
          <button onClick={handleAddTask}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: 'var(--y-dim)', border: '1px solid var(--y-border)', color: 'var(--y)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={14} /> Add
          </button>
        </div>
      )}

      {/* Filters */}
      {tasks.length > 0 && (
        <div className="afu" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'all',     label: `All (${total})`         },
            { key: 'pending', label: `Pending (${total - done})` },
            { key: 'done',    label: `Done (${done})`          },
            ...priorities.map((p) => ({ key: p, label: `${p.charAt(0).toUpperCase() + p.slice(1)} (${tasks.filter((t) => t.priority === p).length})` })),
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize', background: filter === key ? 'var(--y-dim)' : 'var(--bg-3)', color: filter === key ? 'var(--y)' : 'var(--muted)', border: `1px solid ${filter === key ? 'var(--y-border)' : 'var(--border)'}` }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Tasks grouped by priority */}
      {tasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {priorities.map((priority) => {
            const group = grouped[priority];
            if (!group) return null;
            const style = PRIORITY_STYLE[priority];
            return (
              <div key={priority} className="afu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: style.dot }} />
                  <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 700, color: style.color, textTransform: 'capitalize', letterSpacing: '0.04em' }}>
                    {priority} Priority
                  </h3>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${style.dot}33, transparent)` }} />
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {group.filter((t) => t.completed).length}/{group.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.map((task) => (
                    <div key={task._id}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: 'var(--bg-2)', border: `1px solid ${task.completed ? 'rgba(52,211,153,0.15)' : 'var(--border)'}`, transition: 'all 0.2s' }}>

                      {/* Checkbox */}
                      <button onClick={() => handleToggle(task._id)}
                        style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${task.completed ? '#34d399' : style.dot}`, background: task.completed ? 'rgba(52,211,153,0.15)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                        {task.completed && <span style={{ color: '#34d399', fontSize: 12, fontWeight: 900 }}>✓</span>}
                      </button>

                      {/* Category icon */}
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{CATEGORY_ICONS[task.category] || '📌'}</span>

                      {/* Task text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: task.completed ? 'var(--muted)' : 'var(--white-1)', textDecoration: task.completed ? 'line-through' : 'none', marginBottom: 2 }}>
                          {task.title}
                        </p>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: style.bg, color: style.color, border: `1px solid ${style.border}`, textTransform: 'capitalize' }}>
                            {task.priority}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'capitalize' }}>{task.category}</span>
                          {task.dueDate && (
                            <span style={{ fontSize: 10, color: 'var(--muted)' }}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 32px', borderRadius: 20, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle at 33% 33%, rgba(245,197,24,0.8), rgba(245,197,24,0.2) 60%, rgba(5,5,7,0.9))', boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.4), 0 0 20px rgba(245,197,24,0.12)', animation: 'float 5s ease-in-out infinite' }} />
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle at 33% 33%, rgba(59,126,255,0.8), rgba(59,126,255,0.2) 60%, rgba(5,5,7,0.9))', boxShadow: 'inset -6px -6px 16px rgba(0,0,0,0.4), 0 0 30px rgba(59,126,255,0.15)', animation: 'float2 7s ease-in-out infinite' }} />
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle at 33% 33%, rgba(245,197,24,0.8), rgba(245,197,24,0.2) 60%, rgba(5,5,7,0.9))', boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.4), 0 0 20px rgba(245,197,24,0.12)', animation: 'float 6s ease-in-out infinite 1s' }} />
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--white)', marginBottom: 10 }}>No checklist yet</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Generate a personalized checklist of 25 tasks across Documents, Tests, Applications, Financial, Interviews and more.
          </p>
          <button onClick={handleGenerate} disabled={generating}
            className="btn-p"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: 'var(--g-y)', color: '#000', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            <Sparkles size={16} /> Generate My Checklist
          </button>
        </div>
      )}
    </div>
  );
}