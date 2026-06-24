import { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const CATEGORIES = ['Application Fee','Test Fee','Visa Fee','Travel','Accommodation','Tuition','Living Expenses','Health Insurance','Books & Supplies','Other'];
const CURRENCIES  = [{ code:'INR',symbol:'₹',rate:83 },{ code:'USD',symbol:'$',rate:1 },{ code:'GBP',symbol:'£',rate:0.79 },{ code:'EUR',symbol:'€',rate:0.92 },{ code:'AUD',symbol:'A$',rate:1.53 },{ code:'CAD',symbol:'C$',rate:1.36 }];

const DEFAULT_ITEMS = [
  { id:1, name:'GRE Test Fee',          category:'Test Fee',        amount:220,  currency:'USD', paid:false, notes:'' },
  { id:2, name:'TOEFL Test Fee',        category:'Test Fee',        amount:185,  currency:'USD', paid:false, notes:'' },
  { id:3, name:'University App Fee x3', category:'Application Fee', amount:300,  currency:'USD', paid:false, notes:'~$100 each' },
  { id:4, name:'Student Visa Fee',      category:'Visa Fee',        amount:160,  currency:'USD', paid:false, notes:'' },
  { id:5, name:'Flight Ticket',         category:'Travel',          amount:800,  currency:'USD', paid:false, notes:'' },
  { id:6, name:'First Month Rent',      category:'Accommodation',   amount:1200, currency:'USD', paid:false, notes:'' },
];

export default function BudgetPage() {
  const [items,    setItems]    = useState(() => { try { return JSON.parse(localStorage.getItem('scholarai_budget')) || DEFAULT_ITEMS; } catch { return DEFAULT_ITEMS; } });
  const [currency, setCurrency] = useState('USD');
  const [budget,   setBudget]   = useState(() => localStorage.getItem('scholarai_budget_total') || '10000');
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ name:'', category:'Application Fee', amount:'', currency:'USD', notes:'' });

  useEffect(() => { localStorage.setItem('scholarai_budget', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('scholarai_budget_total', budget); }, [budget]);

  const getCurr    = (code) => CURRENCIES.find((c) => c.code === code) || CURRENCIES[1];
  const convert    = (amount, from) => (amount / getCurr(from).rate) * getCurr(currency).rate;
  const currInfo   = getCurr(currency);
  const fmt        = (v) => `${currInfo.symbol}${Math.round(v).toLocaleString()}`;

  const totalExp   = items.reduce((s, i) => s + convert(i.amount, i.currency), 0);
  const totalPaid  = items.filter((i) => i.paid).reduce((s, i) => s + convert(i.amount, i.currency), 0);
  const totalBudget = parseFloat(budget) || 0;
  const remaining  = totalBudget - totalExp;
  const pct        = totalBudget > 0 ? Math.min((totalExp / totalBudget) * 100, 100) : 0;
  const pctColor   = pct > 90 ? '#f87171' : pct > 70 ? 'var(--y)' : '#34d399';

  const addItem = () => {
    if (!form.name || !form.amount) { toast.error('Name and amount required'); return; }
    setItems((p) => [...p, { id: Date.now(), ...form, amount: parseFloat(form.amount), paid: false }]);
    setForm({ name:'', category:'Application Fee', amount:'', currency:'USD', notes:'' });
    setShowForm(false);
    toast.success('Expense added!');
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    const w   = doc.internal.pageSize.getWidth();
    const h   = doc.internal.pageSize.getHeight();
    const m   = 20;
    doc.setFillColor(5,5,7); doc.rect(0,0,w,36,'F');
    doc.setFillColor(245,197,24); doc.rect(0,0,4,36,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('Budget Planner', m+4, 16);
    doc.setFontSize(9); doc.setFont('helvetica','normal');
    doc.text(`${fmt(totalBudget)} budget · ${fmt(totalExp)} expenses · ${fmt(remaining)} remaining`, m+4, 27);
    let y = 46;
    items.forEach((item) => {
      if (y > h-20) { doc.addPage(); y = 20; }
      const conv = convert(item.amount, item.currency);
      doc.setTextColor(item.paid ? 120:30, item.paid ? 120:30, item.paid ? 120:30);
      doc.setFontSize(10); doc.setFont('helvetica', item.paid ? 'italic':'normal');
      doc.text(`${item.paid?'✓':'○'} ${item.name} — ${item.category}`, m, y);
      doc.text(fmt(conv), w-m, y, { align:'right' });
      y += 7;
    });
    doc.save('ScholarAI_Budget.pdf');
    toast.success('PDF downloaded!');
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div className="afu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--y-dim)', border: '1px solid var(--y-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calculator size={19} style={{ color: 'var(--y)' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'var(--white)' }}>Budget Planner</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Track all your application costs</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handlePDF}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--muted)', fontSize:13, cursor:'pointer' }}>
            <Download size={13} /> PDF
          </button>
          <button onClick={() => setShowForm(true)}
            className="btn-p"
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:10, background:'var(--g-y)', color:'#000', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>
            <Plus size={14} /> Add Expense
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="afu" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
        <div style={{ borderRadius:14, padding:'16px 18px', background:'var(--bg-2)', border:'1px solid var(--border)' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>Display Currency</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {CURRENCIES.map((c) => (
              <button key={c.code} onClick={() => setCurrency(c.code)}
                style={{ padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s', background: currency===c.code ? 'var(--y-dim)' : 'var(--bg-3)', color: currency===c.code ? 'var(--y)' : 'var(--muted)', border:`1px solid ${currency===c.code ? 'var(--y-border)' : 'var(--border)'}` }}>
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </div>
        <div style={{ borderRadius:14, padding:'16px 18px', background:'var(--bg-2)', border:'1px solid var(--border)' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>Total Budget ({currInfo.symbol})</p>
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
            placeholder="10000"
            style={{ width:'100%', padding:'10px 14px', borderRadius:10, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:14, fontWeight:700, fontFamily:'Space Grotesk', outline:'none' }}
            onFocus={(e) => { e.target.style.borderColor='var(--y)'; e.target.style.boxShadow='0 0 0 3px rgba(245,197,24,0.08)'; }}
            onBlur={(e)  => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }} />
        </div>
      </div>

      {/* Stats */}
      <div className="afu" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total Budget',  value:fmt(totalBudget), color:'var(--y)'   },
          { label:'Total Expenses',value:fmt(totalExp),    color:'var(--b-1)' },
          { label:'Amount Paid',   value:fmt(totalPaid),   color:'#34d399'    },
          { label:'Remaining',     value:fmt(remaining),   color: remaining >= 0 ? '#34d399' : '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ borderRadius:12, padding:'14px 16px', background:'var(--bg-2)', border:'1px solid var(--border)', textAlign:'center' }}>
            <div style={{ fontFamily:'Space Grotesk', fontSize:20, fontWeight:900, color, marginBottom:4 }}>{value}</div>
            <div style={{ fontSize:11, color:'var(--muted)', fontWeight:600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="afu" style={{ borderRadius:14, padding:'16px 20px', background:'var(--bg-2)', border:'1px solid var(--border)', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--white)' }}>Budget Used</span>
          <span style={{ fontFamily:'Space Grotesk', fontSize:16, fontWeight:800, color:pctColor }}>{pct.toFixed(1)}%</span>
        </div>
        <div style={{ height:8, borderRadius:99, background:'var(--bg-4)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background: pct>90 ? 'linear-gradient(90deg,#f87171,#ef4444)' : pct>70 ? 'linear-gradient(90deg,var(--y),var(--y-2))' : 'linear-gradient(90deg,#34d399,#10b981)', borderRadius:99, transition:'width 0.8s ease' }} />
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="afi" style={{ borderRadius:16, padding:'22px', background:'var(--bg-2)', border:'1px solid var(--y-border)', marginBottom:20 }}>
          <h3 style={{ fontFamily:'Space Grotesk', fontSize:14, fontWeight:700, color:'var(--white)', marginBottom:16 }}>Add Expense</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:14 }}>
            {[
              { key:'name', placeholder:'Expense name', type:'text'   },
              { key:'amount', placeholder:'Amount',     type:'number' },
            ].map(({ key, placeholder, type }) => (
              <input key={key} type={type} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ padding:'10px 14px', borderRadius:10, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:13, outline:'none' }}
                onFocus={(e) => e.target.style.borderColor='var(--y)'}
                onBlur={(e)  => e.target.style.borderColor='var(--border)'} />
            ))}
            {[
              { key:'category', options: CATEGORIES.map((c) => ({ value:c, label:c })) },
              { key:'currency', options: CURRENCIES.map((c) => ({ value:c.code, label:`${c.symbol} ${c.code}` })) },
            ].map(({ key, options }) => (
              <select key={key} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                style={{ padding:'10px 14px', borderRadius:10, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--white-1)', fontSize:13, outline:'none', cursor:'pointer' }}>
                {options.map((o) => <option key={o.value} value={o.value} style={{ background:'var(--bg-3)' }}>{o.label}</option>)}
              </select>
            ))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={addItem} className="btn-p" style={{ padding:'10px 20px', borderRadius:10, background:'var(--g-y)', color:'#000', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>Add</button>
            <button onClick={() => setShowForm(false)} style={{ padding:'10px 20px', borderRadius:10, background:'var(--bg-3)', border:'1px solid var(--border)', color:'var(--muted)', fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Items */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {Object.entries(grouped).map(([cat, catItems]) => {
          const catTotal = catItems.reduce((s, i) => s + convert(i.amount, i.currency), 0);
          return (
            <div key={cat} style={{ borderRadius:14, overflow:'hidden', background:'var(--bg-2)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 18px', background:'var(--bg-3)', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--white)' }}>{cat}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--y)' }}>{fmt(catTotal)}</span>
              </div>
              {catItems.map((item) => {
                const conv = convert(item.amount, item.currency);
                return (
                  <div key={item.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 18px', borderBottom:'1px solid var(--border)' }}>
                    <button onClick={() => setItems((p) => p.map((i) => i.id===item.id ? { ...i, paid:!i.paid } : i))}
                      style={{ width:20, height:20, borderRadius:6, border:`2px solid ${item.paid ? '#34d399' : 'var(--border)'}`, background: item.paid ? 'rgba(52,211,153,0.15)' : 'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
                      {item.paid && <span style={{ color:'#34d399', fontSize:10, fontWeight:900 }}>✓</span>}
                    </button>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color: item.paid ? 'var(--muted)' : 'var(--white-1)', textDecoration: item.paid ? 'line-through' : 'none', marginBottom:2 }}>{item.name}</p>
                      {item.notes && <p style={{ fontSize:11, color:'var(--muted)' }}>{item.notes}</p>}
                    </div>
                    <span style={{ fontSize:11, color:'var(--muted)', flexShrink:0 }}>{getCurr(item.currency).symbol}{item.amount}</span>
                    <span style={{ fontSize:13, fontWeight:700, color: item.paid ? '#34d399' : 'var(--white)', flexShrink:0 }}>{fmt(conv)}</span>
                    <button onClick={() => { setItems((p) => p.filter((i) => i.id !== item.id)); toast.success('Removed'); }}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', padding:4, flexShrink:0, transition:'color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.color='#f87171'}
                      onMouseLeave={(e) => e.currentTarget.style.color='var(--muted)'}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}