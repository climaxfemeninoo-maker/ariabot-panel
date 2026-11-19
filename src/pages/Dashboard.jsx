import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, DollarSign, ShoppingBag, Trophy, CircleCheck, ShoppingCart, Gem, Megaphone, TrendingUp, Info, RotateCcw, Bookmark, RefreshCw, Settings, Filter, Download, Plus, CreditCard, X, ArrowRight, Bot, Award, Trash2, MessageSquare, Clock, Headphones, Star } from 'lucide-react'
import { useStore, Select, Modal, useToast, money, uid, downloadCSV, Confirm } from '../ui'

const COLORS = ['#8b5cf6', '#22d3ee', '#f59e0b', '#22c55e', '#ef4444', '#ec4899']
const CUR = { PEN: '🇵🇪', USD: '🇺🇸', BRL: '🇧🇷', MXN: '🇲🇽' }

function Kpi({ icon, color, value, label, tip, extra }) {
  const [t, setT] = useState(false)
  return <div className="card lift" style={{ padding: '14px 14px 12px', position: 'relative' }}>
    <div className="row"><div className="kpi-ic" style={{ background: color + '22', color }}>{icon}</div><span className="sp" />{extra}<span className="trend"><TrendingUp size={10} />0.0%</span></div>
    <div style={{ fontSize: 18, fontWeight: 800, marginTop: 18, color: color === '#8b5cf6' || color === '#60a5fa' ? 'var(--text)' : color }}>{value}</div>
    <div className="row"><span style={{ fontWeight: 600, fontSize: 12, opacity: .85 }}>{label}</span><span className="sp" />
      <span onMouseEnter={() => setT(true)} onMouseLeave={() => setT(false)} className="muted" style={{ cursor: 'help', position: 'relative' }}><Info size={12} />
        {t && <span className="tip" style={{ bottom: 18, right: -6 }}>{tip}</span>}</span></div>
  </div>
}

function LineChart({ points, labels, color = '#22d3ee' }) {
  const [hover, setHover] = useState(null)
  const W = 800, H = 210, pl = 30, pb = 26, max = Math.max(4, ...points)
  const x = i => pl + i * (W - pl - 10) / (points.length - 1), y = v => H - pb - v / max * (H - pb - 10)
  const d = points.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')
  return <div style={{ position: 'relative' }}><svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} width="100%" height="220" preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
    <defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    {[0, 1, 2, 3, 4].map(i => <g key={i}><line className="gl" x1={pl} x2={W} y1={y(max * i / 4)} y2={y(max * i / 4)} /><text x={pl - 8} y={y(max * i / 4) + 3} textAnchor="end">{+(max * i / 4).toFixed(1)}</text></g>)}
    {points.map((_, i) => <line key={i} className="gl" x1={x(i)} x2={x(i)} y1={10} y2={H - pb} opacity=".5" />)}
    <path d={d + ` L${x(points.length - 1)},${H - pb} L${x(0)},${H - pb}Z`} fill="url(#ga)" />
    <path className="line-path" d={d} stroke={color} strokeWidth="2.5" fill="none" key={d} />
    {labels.map((l, i) => i % Math.ceil(labels.length / 11) === 0 && <text key={i} x={x(i)} y={H - 6} textAnchor="middle">{l}</text>)}
    {points.map((v, i) => <rect key={i} x={x(i) - (W / points.length) / 2} y={0} width={W / points.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />)}
    {hover != null && <circle cx={x(hover)} cy={y(points[hover])} r="5" fill={color} stroke="var(--card)" strokeWidth="2" />}
  </svg>{hover != null && <div className="tip" style={{ left: `${x(hover) / W * 100}%`, top: 0 }}><b>{labels[hover]}</b><br />{points[hover]}</div>}</div>
}

function Bars({ values, labels }) {
  const [hover, setHover] = useState(null)
  const W = 420, H = 210, pl = 26, pb = 26, max = Math.max(4, ...values), bw = (W - pl) / values.length
  const y = v => H - pb - v / max * (H - pb - 10)
  return <div style={{ position: 'relative' }}><svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} width="100%" height="220" preserveAspectRatio="none">
    <defs><linearGradient id="gbar" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#a78bfa" /><stop offset="1" stopColor="#7c3aed" /></linearGradient></defs>
    {[0, 1, 2, 3, 4].map(i => <g key={i}><line className="gl" x1={pl} x2={W} y1={y(max * i / 4)} y2={y(max * i / 4)} /><text x={pl - 8} y={y(max * i / 4) + 3} textAnchor="end">{+(max * i / 4).toFixed(1)}</text></g>)}
    {values.map((v, i) => <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}><rect className="bar" x={pl + i * bw + bw * .2} width={bw * .6} y={y(v)} height={H - pb - y(v)} rx="3" />
      <rect x={pl + i * bw} width={bw} y="0" height={H} fill="transparent" /><text x={pl + i * bw + bw / 2} y={H - 8} textAnchor="middle" style={{ fontSize: 8.5 }}>{labels[i]}</text></g>)}
  </svg>{hover != null && <div className="tip" style={{ left: `${(pl + hover * bw) / W * 100}%`, top: 0 }}><b>{labels[hover]}</b>: {values[hover]} ventas</div>}</div>
}

function HBars({ data, fmt }) {
  const max = Math.max(1, ...data.map(d => d[1]))
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{data.map(([k, v], i) => <div key={k}>
    <div className="row small" style={{ marginBottom: 5 }}><span className="bold">{k}</span><span className="sp" /><span className="muted">{fmt ? fmt(v) : v}</span></div>
    <div className="progress"><div style={{ width: v / max * 100 + '%', background: COLORS[i % 6] }} /></div></div>)}</div>
}

function Donut({ data }) {
  const total = data.reduce((a, b) => a + b[1], 0); let acc = 0
  return <div className="row" style={{ gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}><svg width="150" height="150" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
    <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--card2)" strokeWidth="5" />
    {data.map(([k, v], i) => { const p = v / total * 100; const el = <circle key={k} cx="21" cy="21" r="15.9" fill="none" stroke={COLORS[i % 6]} strokeWidth="5" strokeDasharray={`${p} ${100 - p}`} strokeDashoffset={-acc} style={{ transition: '.6s' }} />; acc += p; return el })}
  </svg><div>{data.map(([k, v], i) => <div key={k} className="row small" style={{ marginBottom: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: COLORS[i % 6] }} />{k}<b style={{ marginLeft: 6 }}>{(v / total * 100).toFixed(0)}%</b></div>)}</div></div>
}

const Card = ({ title, sub, right, children, style }) => <div className="card" style={{ padding: 18, ...style }}><div className="row" style={{ alignItems: 'flex-start', marginBottom: 14 }}><div><div className="bold" style={{ fontSize: 14 }}>{title}</div><div className="small muted" style={{ marginTop: 3 }}>{sub}</div></div><span className="sp" />{right}</div>{children}</div>
const NoData = () => <div style={{ border: '1px dashed var(--border)', borderRadius: 6, padding: '26px 10px', textAlign: 'center' }} className="muted">Sin datos en el período seleccionado.</div>

export default function Dashboard() {
  const nav = useNavigate(); const toast = useToast()
  const [banner, setBanner] = useStore('banner', true)
  const [sales, setSales] = useStore('sales', [])
  const [contacts] = useStore('contacts', [])
  const [tab, setTab] = useState('Ventas')
  const [period, setPeriod] = useState('Hoy'); const [conn, setConn] = useState('all'); const [prod, setProd] = useState('all')
  const [cur, setCur] = useStore('currency', 'PEN')
  const [mode, setMode] = useState('Valor'); const [pmode, setPmode] = useState('Valor')
  const [spin, setSpin] = useState(false); const [newSale, setNewSale] = useState(false); const [del, setDel] = useState(null)
  const [medals, setMedals] = useState(false); const [cfg, setCfg] = useState(false)
  const [form, setForm] = useState({ client: '', product: '', value: '', instance: 'WhatsApp principal', state: 'Lima' })
  const h = new Date().getHours(); const greet = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
  const days = { Hoy: 1, Ayer: 2, 'Últimos 7 días': 7, 'Últimos 30 días': 30, 'Este año': 365 }[period]
  const filtered = useMemo(() => sales.filter(s => (Date.now() - new Date(s.date)) / 864e5 < days && (conn === 'all' || s.instance === conn) && (prod === 'all' || s.product === prod)), [sales, days, conn, prod])
  const total = filtered.reduce((a, s) => a + +s.value, 0)
  const products = [...new Set(sales.map(s => s.product))]
  const group = k => Object.entries(filtered.reduce((a, s) => (a[s[k]] = (a[s[k]] || 0) + (pmode === 'Valor' || k !== 'product' ? +s.value : 1), a), {}))
  const countBy = k => Object.entries(filtered.reduce((a, s) => (a[s[k]] = (a[s[k]] || 0) + 1, a), {}))
  // line chart hourly buckets for today else daily
  const buckets = period === 'Hoy' ? 12 : Math.min(days, 30)
  const lineLabels = [], linePts = []
  for (let i = buckets - 1; i >= 0; i--) {
    const d = new Date(); if (period === 'Hoy') { d.setHours(23 - i * 2) } else d.setDate(d.getDate() - i)
    const dd = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0')
    lineLabels.push(period === 'Hoy' ? `${dd}, ${String(d.getHours()).padStart(2, '0')}` : dd)
    linePts.push(filtered.filter(s => { const sd = new Date(s.date); return period === 'Hoy' ? Math.abs(sd.getHours() - d.getHours()) < 1.5 && sd.toDateString() === d.toDateString() : sd.toDateString() === d.toDateString() }).reduce((a, s) => a + (mode === 'Valor' ? +s.value : 1), 0))
  }
  const hours = Array.from({ length: 15 }, (_, i) => i + 6)
  const hourVals = hours.map(hh => filtered.filter(s => new Date(s.date).getHours() === hh).length)
  const save = () => {
    if (!form.client || !form.value) return toast('Completa cliente y valor', 'err')
    setSales(s => [{ ...form, id: uid(), lead: Math.floor(Math.random() * 9000 + 1000), currency: cur, date: new Date().toISOString(), nf: '—' }, ...s])
    setNewSale(false); setForm({ ...form, client: '', product: '', value: '' }); toast('Venta registrada')
  }
  return <div className="page">
    <div className="card" style={{ padding: '16px 18px', marginBottom: 20 }}><div className="row">
      <div><div className="bold" style={{ fontSize: 16 }}>{greet}, Pablo Monja Suclupe! <span style={{ display: 'inline-block', animation: 'float 2.5s ease-in-out infinite' }}>{h < 19 ? '☀️' : '🌙'}</span></div>
        <div className="small muted" style={{ marginTop: 4 }}>Operación <b style={{ color: 'var(--p)' }}>Empresa Pablo Monja Suclupe</b> • <b style={{ color: 'var(--text)' }}>{contacts.length}</b> leads acumulados</div></div>
      <span className="sp" /><button className="btn btn-g" onClick={() => setMedals(true)}><Award size={14} />Mis logros</button></div></div>

    {banner && <div className="banner">
      <svg className="curve" viewBox="0 0 1000 164" preserveAspectRatio="none"><path d="M0 130 Q 300 40 620 150" stroke="#a855f7" strokeWidth="1.5" fill="none" opacity=".6" /><path d="M0 20 Q 200 90 340 0" stroke="#a855f7" strokeWidth="1" fill="none" opacity=".4" /></svg>
      <button className="bx" onClick={() => setBanner(false)}><X size={12} /></button>
      <div style={{ zIndex: 2 }} className="hide-md"><svg height="60" viewBox="0 0 150 34"><rect x="1" y="3" width="28" height="28" rx="8" fill="#fff" /><rect x="7" y="11" width="16" height="12" rx="4" fill="#7c3aed" /><circle cx="12" cy="17" r="1.8" fill="#fff" /><circle cx="18" cy="17" r="1.8" fill="#fff" /><text x="36" y="25" fontFamily="Inter" fontWeight="800" fontSize="20" fill="#fff">AriaBot</text></svg>
        <div style={{ fontSize: 10, letterSpacing: '.2em', marginTop: 6, opacity: .9 }}>TU VENDEDOR <span style={{ color: '#c084fc' }}>24/7</span></div></div>
      <div className="vline hide-md" />
      <div style={{ zIndex: 2 }}><div style={{ letterSpacing: '.3em', fontSize: 15, opacity: .9 }}>HAZTE NUESTRO</div><div className="shine" style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, letterSpacing: '.02em' }}>SOCIO</div>
        <div style={{ marginTop: 10, border: '1px solid #ffffff55', borderRadius: 8, padding: '5px 12px', fontSize: 11, display: 'inline-flex', gap: 8, alignItems: 'center', letterSpacing: '.06em', whiteSpace: 'nowrap' }}><Bot size={14} color="#c084fc" />CHATBOT CON IA PARA <b style={{ color: '#c084fc' }}>VENTAS POR WHATSAPP</b></div></div>
      <div style={{ zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ fontSize: 15, lineHeight: 1.3 }}>HASTA<br />DE</div><div><div style={{ fontSize: 44, fontWeight: 900, color: '#a855f7', lineHeight: .9 }}>40%</div><div style={{ fontWeight: 800, color: '#a855f7', fontSize: 15 }}>COMISIÓN</div></div></div>
      <button className="cta" onClick={() => toast('Abriendo programa de socios…', 'info')}>QUIERO SER SOCIO <ArrowRight size={16} /></button>
      <svg className="robot hide-md" width="210" height="210" viewBox="0 0 100 100"><defs><radialGradient id="rg"><stop offset="0" stopColor="#c084fc" /><stop offset="1" stopColor="#6d28d9" /></radialGradient></defs>
        <rect x="18" y="26" width="64" height="52" rx="18" fill="url(#rg)" opacity=".9" /><rect x="26" y="38" width="48" height="26" rx="12" fill="#1e0b3a" /><circle cx="40" cy="51" r="5" fill="#e9d5ff"><animate attributeName="r" values="5;1;5" dur="4s" repeatCount="indefinite" /></circle><circle cx="60" cy="51" r="5" fill="#e9d5ff"><animate attributeName="r" values="5;1;5" dur="4s" repeatCount="indefinite" /></circle><rect x="47" y="12" width="6" height="14" rx="3" fill="#c084fc" /><circle cx="50" cy="11" r="5" fill="#e9d5ff" /></svg>
    </div>}

    <div className="card" style={{ padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <CreditCard size={16} className="muted" /><div><div className="bold" style={{ fontSize: 13.5, opacity: .8 }}>Suscripción inactiva</div><div className="small" style={{ marginTop: 3, opacity: .85 }}>Su suscripción está inactiva. Contrate un plan para empezar a usar el servicio.</div></div>
      <span className="sp" /><button className="btn btn-p" onClick={() => nav('/billing')}>Contratar ahora</button></div>

    <div className="card" style={{ padding: '10px 14px', marginBottom: 18, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <div className="seg">{['Ventas', 'Atención'].map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      <Select value={period} onChange={setPeriod} width={130} options={['Hoy', 'Ayer', 'Últimos 7 días', 'Últimos 30 días', 'Este año']} />
      <Select value={conn} onChange={setConn} width={180} options={[{ value: 'all', label: 'Todas las conexiones' }, ...[...new Set(sales.map(s => s.instance))].map(i => ({ value: i, label: i }))]} />
      <Select value={prod} onChange={setProd} width={180} options={[{ value: 'all', label: 'Todos los productos' }, ...products.map(p => ({ value: p, label: p }))]} />
      <span className="sp" />
      <Select value={cur} onChange={setCur} right width={86} options={Object.keys(CUR).map(c => ({ value: c, label: `${CUR[c]} ${c}` }))} />
      <div className="row card" style={{ padding: 2, gap: 0 }}>
        <button className="icon-btn" title="Restablecer filtros" onClick={() => { setPeriod('Hoy'); setConn('all'); setProd('all'); toast('Filtros restablecidos', 'info') }}><RotateCcw size={14} /></button>
        <button className="icon-btn" title="Guardar vista" onClick={() => toast('Vista guardada')}><Bookmark size={14} /></button>
        <button className="icon-btn" title="Actualizar" style={{ color: 'var(--p)' }} onClick={() => { setSpin(true); setTimeout(() => { setSpin(false); toast('Datos actualizados') }, 900) }}><RefreshCw size={14} className={spin ? 'spin' : ''} /></button>
        <button className="icon-btn" title="Configurar" onClick={() => setCfg(true)}><Settings size={14} /></button></div>
    </div>

    {tab === 'Ventas' ? <>
      <div className="grid g4 stagger" style={{ marginBottom: 18 }} key={period + conn + prod + cur}>
        <Kpi icon={<Users size={14} />} color="#60a5fa" value={contacts.length} label="Leads nuevos" tip="Contactos creados en el período" />
        <Kpi icon={<DollarSign size={14} />} color="#2dd4bf" value={money(total, cur)} label="Facturación" tip="Suma de ventas aprobadas" />
        <Kpi icon={<ShoppingBag size={14} />} color="#8b5cf6" value={filtered.length} label="Ventas" tip="Cantidad de ventas aprobadas" />
        <Kpi icon={<Trophy size={14} />} color="#f59e0b" value={total ? '∞' : '0.00'} label="ROAS" tip="Facturación / gasto en anuncios" />
        <Kpi icon={<CircleCheck size={14} />} color="#22c55e" value={(contacts.length ? filtered.length / contacts.length * 100 : 0).toFixed(2) + '%'} label="Tasa de conversión" tip="Ventas / leads" />
        <Kpi icon={<ShoppingCart size={14} />} color="#a855f7" value={money(filtered.length ? total / filtered.length : 0, cur)} label="Ticket promedio" tip="Facturación / ventas" />
        <Kpi icon={<Gem size={14} />} color="#22c55e" value={money(total, cur)} label="Beneficio" tip="Facturación − gasto en anuncios" />
        <Kpi icon={<Megaphone size={14} />} color="#ef4444" value={money(0, cur)} label="Gasto Meta (Ad)" tip="Gasto sincronizado de Meta Ads" extra={<button className="icon-btn" style={{ width: 22, height: 22, background: 'var(--card2)' }}><Filter size={11} /></button>} />
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1.9fr 1fr', marginBottom: 18 }}>
        <Card title="Ventas por período" sub="Histórico temporal de conversiones y facturación" right={<div className="seg sm">{['Valor', 'Cant.'].map(t => <button key={t} className={mode === t ? 'on' : ''} onClick={() => setMode(t)}>{t}</button>)}</div>}><LineChart points={linePts} labels={lineLabels} /></Card>
        <Card title="Ventas por horario" sub="Total de ventas del período filtrado, por hora del día"><Bars values={hourVals} labels={hours.map(h => String(h).padStart(2, '0') + 'h')} /></Card>
      </div>
      <div className="grid g3" style={{ marginBottom: 18 }}>
        <Card title="Ventas por instancia" sub="Operaciones por conexión activa" style={{ minHeight: 255 }}>{filtered.length ? <HBars data={countBy('instance')} /> : <NoData />}</Card>
        <Card title="Facturación por instancia" sub="Ingresos por conexión activa">{filtered.length ? <HBars data={group('instance')} fmt={v => money(v, cur)} /> : <NoData />}</Card>
        <Card title="Ventas por estado" sub="Distribución geográfica de las ventas">{filtered.length ? <HBars data={countBy('state')} /> : <NoData />}</Card>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1.9fr 1fr' }}>
        <Card title="Historial de ventas" sub="Auditoría y emisión fiscal de notas" right={<div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <button className="btn btn-g btn-sm" disabled={!filtered.length} style={{ opacity: filtered.length ? 1 : .5 }} onClick={() => downloadCSV('ventas.csv', [['Instancia', 'Lead', 'Cliente', 'Producto', 'Valor', 'Moneda', 'Fecha'], ...filtered.map(s => [s.instance, s.lead, s.client, s.product, s.value, s.currency, s.date])])}><Download size={12} />Exportar CSV</button>
          <button className="btn btn-p btn-sm" onClick={() => setNewSale(true)}><Plus size={13} />Nueva venta</button></div>}>
          <div className="tbl-wrap"><table className="tbl"><thead><tr>{['Instancia', 'Nº de instancia', 'Nº del lead', 'Nombre del cliente', 'Producto', 'ID', 'Valor', 'Moneda', 'Source ID', 'Fecha', 'NF', 'Acciones'].map(t => <th key={t}>{t}</th>)}</tr></thead>
            <tbody>{filtered.length ? filtered.map(s => <tr key={s.id}><td>{s.instance}</td><td>1</td><td>#{s.lead}</td><td className="bold">{s.client}</td><td>{s.product || '—'}</td><td className="muted">{s.id}</td><td style={{ color: '#22c55e', fontWeight: 700 }}>{money(s.value, '')}</td><td>{s.currency}</td><td className="muted">manual</td><td>{new Date(s.date).toLocaleString('es-PE')}</td><td>{s.nf}</td>
              <td><button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => setDel(s.id)}><Trash2 size={13} /></button></td></tr>)
              : <tr><td colSpan={12} style={{ textAlign: 'center', padding: 30, fontStyle: 'italic' }} className="muted">Ninguna venta registrada en el historial del período.</td></tr>}</tbody></table></div>
        </Card>
        <Card title="Rendimiento de productos" sub="Participación en el total" right={<div className="row"><div className="seg sm">{['Valor', 'Cant.'].map(t => <button key={t} className={pmode === t ? 'on' : ''} onClick={() => setPmode(t)}>{t}</button>)}</div><button className="icon-btn"><Filter size={13} /></button></div>}>
          {filtered.length ? <Donut data={group('product').map(([k, v]) => [k || 'Sin producto', v])} /> : <NoData />}</Card>
      </div>
    </> : <Attention />}

    <Modal open={newSale} onClose={() => setNewSale(false)} title="Nueva venta" sub="Registra una venta manual en el historial" icon={<ShoppingBag size={18} />}
      footer={<><button className="btn btn-g" onClick={() => setNewSale(false)}>Cancelar</button><button className="btn btn-p" onClick={save}>Guardar venta</button></>}>
      <div className="field"><label className="lb">Nombre del cliente *</label><input className="input" autoFocus value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Juan Pérez" /></div>
      <div className="grid g2"><div className="field"><label className="lb">Producto</label><input className="input" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="Ebook" /></div>
        <div className="field"><label className="lb">Valor ({cur}) *</label><input className="input" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="29.90" /></div></div>
      <div className="grid g2"><div className="field"><label className="lb">Instancia</label><select className="input" value={form.instance} onChange={e => setForm({ ...form, instance: e.target.value })}><option>WhatsApp principal</option><option>WhatsApp ventas</option></select></div>
        <div className="field"><label className="lb">Estado / región</label><input className="input" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div></div>
    </Modal>
    <Confirm open={!!del} onClose={() => setDel(null)} onOk={() => { setSales(s => s.filter(x => x.id !== del)); toast('Venta eliminada') }} title="Eliminar venta" />
    <Modal open={medals} onClose={() => setMedals(false)} title="Mis logros" sub="Desbloquea medallas a medida que vendes" icon={<Award size={18} />} lg>
      <div className="grid g3 stagger">{[['Primera venta', 1, ShoppingBag], ['10 ventas', 10, Star], ['100 leads', 100, Users], ['PEN 1.000', 1000, DollarSign], ['Primer flujo', 1, Trophy], ['Top vendedor', 500, Award]].map(([t, goal, Ic], i) => {
        const prog = Math.min(1, (i === 3 ? total : i === 2 ? contacts.length : sales.length) / goal)
        return <div key={t} className="card lift" style={{ padding: 14, textAlign: 'center', opacity: prog >= 1 ? 1 : .7 }}><div style={{ width: 44, height: 44, borderRadius: 50, margin: '0 auto 8px', display: 'grid', placeItems: 'center', background: prog >= 1 ? 'linear-gradient(135deg,#f59e0b,#a855f7)' : 'var(--card2)', color: prog >= 1 ? '#fff' : 'var(--muted)' }}><Ic size={20} /></div>
          <div className="bold" style={{ fontSize: 12 }}>{t}</div><div className="progress" style={{ marginTop: 8 }}><div style={{ width: prog * 100 + '%' }} /></div></div>
      })}</div></Modal>
    <Modal open={cfg} onClose={() => setCfg(false)} title="Configurar dashboard" sub="Elige qué tarjetas mostrar" icon={<Settings size={18} />} footer={<button className="btn btn-p" onClick={() => { setCfg(false); toast('Preferencias guardadas') }}>Guardar</button>}>
      {['Leads nuevos', 'Facturación', 'Ventas', 'ROAS', 'Tasa de conversión', 'Ticket promedio', 'Beneficio', 'Gasto Meta (Ad)'].map(k => <label key={k} className="row" style={{ padding: '7px 0', cursor: 'pointer' }}><input type="checkbox" defaultChecked style={{ accentColor: '#8b5cf6' }} />{k}</label>)}</Modal>
  </div>
}

function Attention() {
  const [chats] = useStore('chats', [])
  const att = chats.filter(c => c.status === 'atencion').length, res = chats.filter(c => c.status === 'resueltos').length
  return <><div className="grid g4 stagger" style={{ marginBottom: 18 }}>
    <Kpi icon={<MessageSquare size={14} />} color="#8b5cf6" value={chats.length} label="Conversaciones" tip="Chats iniciados" />
    <Kpi icon={<Headphones size={14} />} color="#22d3ee" value={att} label="En atención" tip="Chats asignados" />
    <Kpi icon={<CircleCheck size={14} />} color="#22c55e" value={res} label="Resueltos" tip="Chats finalizados" />
    <Kpi icon={<Clock size={14} />} color="#f59e0b" value="0m 00s" label="Tiempo de respuesta" tip="Promedio de primera respuesta" />
  </div><div className="grid g2"><Card title="Atenciones por agente" sub="Distribución entre agentes humanos y de IA"><NoData /></Card><Card title="Mensajes por hora" sub="Volumen de mensajes recibidos"><Bars values={Array(15).fill(0)} labels={Array.from({ length: 15 }, (_, i) => i + 6 + 'h')} /></Card></div></>
}
