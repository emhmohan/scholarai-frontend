import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import jsPDF from 'jspdf';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TYPE_COLORS = {
  scholarship: 'var(--y)',
  college:     '#34d399',
  custom:      'var(--b-1)',
};

export default function CalendarPage() {
  const [today]   = useState(new Date());
  const [current, setCurrent]  = useState(new Date());
  const [events,  setEvents]   = useState([]);
  const [selected,setSelected] = useState(null);
  const [loading, setLoading]  = useState(true);
  const [showAdd, setShowAdd]  = useState(false);
  const [customForm, setCustomForm] = useState({ title:'', date:'', notes:'' });

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [schRes, colRes] = await Promise.all([api.get('/scholarships'), api.get('/colleges')]);
      const schEvents = (schRes.data.data?.scholarships || []).filter((s) => s.deadline).map((s) => ({ id:s._id, title:s.title, date:new Date(s.deadline), type:'scholarship', provider:s.provider, amount:s.amount, url:s.url }));
      const colEvents = (colRes.data.data?.colleges || []).filter((c) => c.deadline).map((c) => ({ id:c._id, title:c.name, date:new Date(c.deadline), type:'college', location:c.location, url:c.url }));
      const custom    = JSON.parse(localStorage.getItem('scholarai_cal_custom') || '[]').map((e) => ({ ...e, date:new Date(e.date) }));
      setEvents([...schEvents, ...colEvents, ...custom]);
    } catch { toast.error('Failed to load deadlines'); }
    finally  { setLoading(false); }
  };

  const saveCustom = (updatedEvents) => {
    const custom = updatedEvents.filter((e) => e.type==='custom').map((e) => ({ ...e, date:e.date.toISOString() }));
    localStorage.setItem('scholarai_cal_custom', JSON.stringify(custom));
  };

  const addCustom = () => {
    if (!customForm.title || !customForm.date) { toast.error('Title and date required'); return; }
    const newEvent = { id:`custom_${Date.now()}`, title:customForm.title, date:new Date(customForm.date), type:'custom', notes:customForm.notes };
    const updated  = [...events, newEvent];
    setEvents(updated);
    saveCustom(updated);
    setCustomForm({ title:'', date:'', notes:'' });
    setShowAdd(false);
    toast.success('Event added!');
  };

  const deleteCustom = (id) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveCustom(updated);
    setSelected(null);
    toast.success('Event removed');
  };

  const year  = current.getFullYear();
  const month = current.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const getEventsForDay = (day) => events.filter((e) => { const d=e.date; return d.getFullYear()===year && d.getMonth()===month && d.getDate()===day; });
  const isToday         = (day) => today.getFullYear()===year && today.getMonth()===month && today.getDate()===day;
  const getDaysLeft     = (date) => Math.ceil((date - new Date()) / (1000*60*60*24));
  const urgencyColor    = (days) => days < 0 ? 'var(--muted)' : days <= 7 ? '#f87171' : days <= 30 ? 'var(--y)' : '#34d399';

  const upcoming = events.filter((e) => { const d=getDaysLeft(e.date); return d >= 0 && d <= 60; }).sort((a,b) => a.date - b.date);

  const handlePDF = () => {
    const doc = new jsPDF();
    const w   = doc.internal.pageSize.getWidth();
    const h   = doc.internal.pageSize.getHeight();
    const m   = 20;
    doc.setFillColor(5,5,7); doc.rect(0,0,w,36,'F');
    doc.setFillColor(245,197,24); doc.rect(0,0,4,36,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('Deadline Calendar', m+4, 16);
    doc.setFontSize(9); doc.setFont('helvetica','normal');
    doc.text(`${events.length} total deadlines · Generated ${new Date().toLocaleDateString()}`, m+4, 27);
    let y = 46;
    [...events].sort((a,b) => a.date-b.date).forEach((event) => {
      if (y > h-20) { doc.addPage(); y=20; }
      const days = getDaysLeft(event.date);
      doc.setTextColor(30,30,30); doc.setFontSize(10); doc.setFont('helvetica','bold');
      doc.text(event.title, m, y);
      doc.setFont('helvetica','normal'); doc.setTextColor(100,100,100);
      doc.text(`${event.date.toLocaleDateString()} · ${event.type} · ${days<0?'Passed':days===0?'Today!':days+' days left'}`, m, y+6);
      y += 14;
    });
    doc.save('ScholarAI_Calendar.pdf');
    toast.success('Calendar downloaded!');
  };

  return (
    <div style={{ maxWidth:1200, margin:'0 auto' }}>

      {/* Header */}
      <div className="afu" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'var(--b-dim)', border:'1px solid var(--b-border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Calendar size={19} style={{ color:'var(--b-1)' }} />
          </div>
          <div>
            <h1 style={{ fontFamily:'Space Grotesk', fontSize:22, fontWeight:800, color:'var(--white)' }}>Deadline Calendar</h1>
            <p style={{ fontSize:13, color:'var(--muted)' }}>All scholarship and college deadlines in one place</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setShowAdd(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--muted)', fontSize:13, cursor:'pointer' }}>
            <Plus size={13} /> Add Event
          </button>
          <button onClick={handlePDF} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, background:'var(--b-dim)', border:'1px solid var(--b-border)', color:'var(--b-1)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            <Download size={13} /> PDF
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, alignItems:'start' }}>

        {/* Calendar */}
        <div style={{ borderRadius:18, overflow:'hidden', background:'var(--bg-2)', border:'1px solid var(--border)' }}>
          {/* Nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-3)' }}>
            <button onClick={() => setCurrent(new Date(year, month-1, 1))} style={{ width:32, height:32, borderRadius:9, background:'var(--bg-4)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--muted)', transition:'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor='var(--y-border)'; e.currentTarget.style.color='var(--y)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; }}>
              <ChevronLeft size={15} />
            </button>
            <h2 style={{ fontFamily:'Space Grotesk', fontSize:16, fontWeight:800, color:'var(--white)' }}>{MONTHS[month]} {year}</h2>
            <button onClick={() => setCurrent(new Date(year, month+1, 1))} style={{ width:32, height:32, borderRadius:9, background:'var(--bg-4)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--muted)', transition:'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor='var(--y-border)'; e.currentTarget.style.color='var(--y)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; }}>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid var(--border)' }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign:'center', padding:'10px 0', fontSize:11, fontWeight:700, color:'var(--muted)', letterSpacing:'0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
            {Array.from({ length:firstDay }).map((_,i) => (
              <div key={`e${i}`} style={{ minHeight:80, borderBottom:'1px solid var(--border)', borderRight:'1px solid var(--border)', background:'var(--bg-1)' }} />
            ))}
            {Array.from({ length:daysInMonth }).map((_,i) => {
              const day = i+1;
              const dayEvents = getEventsForDay(day);
              const todayDay  = isToday(day);
              return (
                <div key={day} style={{ minHeight:80, borderBottom:'1px solid var(--border)', borderRight:'1px solid var(--border)', padding:6, cursor: dayEvents.length>0?'pointer':'default', background: todayDay ? 'rgba(245,197,24,0.04)' : 'transparent', transition:'background 0.2s' }}
                  onClick={() => dayEvents.length>0 && setSelected({ day, events:dayEvents })}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background: todayDay ? 'var(--y)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight: todayDay?900:500, color: todayDay?'#000':'var(--white-2)', marginBottom:4 }}>
                    {day}
                  </div>
                  {dayEvents.slice(0,2).map((event,idx) => (
                    <div key={idx} style={{ fontSize:9, padding:'2px 5px', borderRadius:4, marginBottom:2, background:`${TYPE_COLORS[event.type]}18`, color:TYPE_COLORS[event.type], overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:700 }}>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length>2 && <div style={{ fontSize:9, color:'var(--muted)' }}>+{dayEvents.length-2}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Selected day */}
          {selected && (
            <div className="afi" style={{ borderRadius:16, border:'1px solid var(--y-border)', overflow:'hidden', background:'var(--bg-2)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid var(--border)', background:'var(--bg-3)' }}>
                <p style={{ fontFamily:'Space Grotesk', fontSize:13, fontWeight:700, color:'var(--white)' }}>{MONTHS[month]} {selected.day}</p>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)' }}><X size={14} /></button>
              </div>
              <div style={{ padding:12 }}>
                {selected.events.map((event,i) => (
                  <div key={i} style={{ padding:'12px', borderRadius:10, background:'var(--bg-3)', border:`1px solid ${TYPE_COLORS[event.type]}30`, marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <p style={{ fontSize:12, fontWeight:700, color:'var(--white)', flex:1 }}>{event.title}</p>
                      {event.type==='custom' && (
                        <button onClick={() => deleteCustom(event.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', padding:0, marginLeft:8 }}><X size={12} /></button>
                      )}
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:`${TYPE_COLORS[event.type]}15`, color:TYPE_COLORS[event.type], textTransform:'capitalize' }}>{event.type}</span>
                    {event.provider && <p style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{event.provider}</p>}
                    {event.notes    && <p style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{event.notes}</p>}
                    {event.url && <a href={event.url} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'var(--b-1)', display:'block', marginTop:4 }}>Apply →</a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div style={{ borderRadius:16, background:'var(--bg-2)', border:'1px solid var(--border)', overflow:'hidden' }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', background:'var(--bg-3)' }}>
              <p style={{ fontFamily:'Space Grotesk', fontSize:13, fontWeight:700, color:'var(--white)' }}>⏰ Upcoming 60 Days ({upcoming.length})</p>
            </div>
            <div style={{ padding:10, maxHeight:300, overflowY:'auto' }}>
              {loading ? (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', border:'2px solid var(--y)', borderTopColor:'transparent', animation:'spinSlow 0.8s linear infinite', margin:'0 auto' }} />
                </div>
              ) : upcoming.length === 0 ? (
                <p style={{ fontSize:12, color:'var(--muted)', textAlign:'center', padding:'16px 0' }}>No upcoming deadlines</p>
              ) : upcoming.map((event,i) => {
                const days = getDaysLeft(event.date);
                const uc   = urgencyColor(days);
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px', borderRadius:10, marginBottom:6, background:'var(--bg-3)', cursor:'pointer', transition:'all 0.2s' }}
                    onClick={() => { setCurrent(new Date(event.date.getFullYear(),event.date.getMonth(),1)); setSelected({ day:event.date.getDate(), events:getEventsForDay(event.date.getDate()) }); }}
                    onMouseEnter={(e) => e.currentTarget.style.background='var(--bg-4)'}
                    onMouseLeave={(e) => e.currentTarget.style.background='var(--bg-3)'}>
                    <div style={{ width:38, height:38, borderRadius:10, background:`${uc}15`, border:`1px solid ${uc}30`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontFamily:'Space Grotesk', fontSize:12, fontWeight:900, color:uc, lineHeight:1 }}>{days===0?'!':days}</span>
                      <span style={{ fontSize:8, color:uc, fontWeight:700 }}>{days===0?'today':'days'}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:12, fontWeight:700, color:'var(--white-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>{event.title}</p>
                      <p style={{ fontSize:10, color:'var(--muted)' }}>{event.date.toLocaleDateString()}</p>
                    </div>
                    <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:99, background:`${TYPE_COLORS[event.type]}15`, color:TYPE_COLORS[event.type], textTransform:'capitalize', flexShrink:0 }}>{event.type}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add custom event */}
          {showAdd && (
            <div className="afi" style={{ borderRadius:16, padding:'16px', background:'var(--bg-2)', border:'1px solid var(--b-border)' }}>
              <p style={{ fontFamily:'Space Grotesk', fontSize:13, fontWeight:700, color:'var(--white)', marginBottom:12 }}>Add Custom Event</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <input value={customForm.title} onChange={(e) => setCustomForm((p) => ({ ...p, title:e.target.value }))} placeholder="Event title..." style={{ padding:'9px 12px', borderRadius:9, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:12, outline:'none' }} onFocus={(e) => e.target.style.borderColor='var(--y)'} onBlur={(e) => e.target.style.borderColor='var(--border)'} />
                <input type="date" value={customForm.date} onChange={(e) => setCustomForm((p) => ({ ...p, date:e.target.value }))} style={{ padding:'9px 12px', borderRadius:9, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:12, outline:'none', colorScheme:'dark' }} />
                <input value={customForm.notes} onChange={(e) => setCustomForm((p) => ({ ...p, notes:e.target.value }))} placeholder="Notes (optional)..." style={{ padding:'9px 12px', borderRadius:9, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:12, outline:'none' }} />
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={addCustom} className="btn-p" style={{ flex:1, padding:'9px', borderRadius:9, background:'var(--g-b)', color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>Add</button>
                  <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:'9px', borderRadius:9, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--muted)', fontSize:12, cursor:'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{ borderRadius:14, padding:'14px 16px', background:'var(--bg-2)', border:'1px solid var(--border)' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>Legend</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {Object.entries(TYPE_COLORS).map(([type,color]) => (
                <div key={type} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:color }} />
                  <span style={{ fontSize:12, color:'var(--muted)', textTransform:'capitalize' }}>{type} Deadlines</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}