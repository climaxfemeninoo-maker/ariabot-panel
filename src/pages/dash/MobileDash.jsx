import { useState, useEffect, useRef } from 'react'
import { Share, SlidersHorizontal, UserPlus, Banknote, TrendingUp, ShoppingBag, Megaphone, Wallet, Zap, Percent, ChartLine, Clock, Network, Flag, Archive, ReceiptText, Download, Users, Columns3, Wallet as WalletIc, UserSearch, Check, X, Star, ArrowLeft, Search, CalendarDays, ChevronRight, ChevronDown, BookmarkPlus, Pencil, Calendar } from 'lucide-react'
import { useStore, useToast, downloadCSV } from '../../ui'

export function useMobile() {
  const q = '(max-width: 760px)'
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => { const mq = window.matchMedia(q); const f = () => setM(mq.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f) }, [])
  return m
}

const pad = n => String(n).padStart(2, '0')
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
const MONL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const short = s => { const d = new Date(s + 'T00:00'); return `${d.getDate()} ${MON[d.getMonth()]}` }
const PL = { today: 'Hoy', yesterday: 'Ayer', 7: '7d', 30: '30d', month: 'Mes', custom: 'Pers.' }

function Empty({ ic: Ic, t, d }) {
  return <div className="md-emp"><div className="bars">{[30, 50, 70, 92, 30, 50, 70, 92, 30, 50].map((h, i) => <span key={i} style={{ height: h + '%' }} />)}</div>
    <Ic size={34} strokeWidth={1.8} className="ic" /><b>{t}</b><p>{d}</p></div>
}
function Bars({ data, fmt = v => v }) {
  const max = Math.max(1, ...data.map(d => d[1]))
  return <div style={{ marginTop: 14 }}>{data.map(([k, v]) => <div key={k} className="md-bar"><span style={{ width: 92, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#cbd5e1' }}>{k}</span><div><i style={{ width: v / max * 100 + '%' }} /></div><b style={{ minWidth: 48, textAlign: 'right', fontWeight: 600 }}>{fmt(v)}</b></div>)}</div>
}
function VBars({ data }) {
  const max = Math.max(1, ...data.map(d => d[1]))
  return <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 4, marginTop: 14, minHeight: 190 }}>{data.map(([k, v], i) => <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
    {v > 0 && <span style={{ fontSize: 9, color: '#cbd5e1' }}>{v % 1 ? v.toFixed(0) : v}</span>}<div style={{ width: '100%', height: v / max * 150 + 2, background: 'linear-gradient(#a78bfa,#6d28d9)', borderRadius: '3px 3px 0 0' }} /><span style={{ fontSize: 8.5, color: '#8f8a9e' }}>{k}</span></div>)}</div>
}
const Card = ({ t, s, children, style }) => <div className="md-c" style={style}><div className="md-ct"><i /><div><b>{t}</b>{s && <span>{s}</span>}</div></div>{children}</div>

export function Sheet({ onClose, children, alt, z = 200 }) {
  return <div className="md-ov" style={{ zIndex: z }} onClick={e => e.target === e.currentTarget && onClose()}><div className={'md-sh' + (alt ? ' alt' : '')}><div className="md-hd" onClick={onClose} />{children}</div></div>
}

/* ---------------- selector multiple (conexiones/productos) ---------------- */
function Pick({ title, all, items, value, onApply, onBack }) {
  const [v, setV] = useState(value); const [q, setQ] = useState('')
  const list = items.filter(i => i.toLowerCase().includes(q.toLowerCase()))
  const Box = ({ on }) => <span style={{ width: 18, height: 18, borderRadius: 3, border: on ? 'none' : '1.5px solid #6b6675', background: on ? '#9b6cf8' : 'none', display: 'grid', placeItems: 'center' }}>{on && <Check size={14} strokeWidth={3} />}</span>
  return <Sheet onClose={onBack} alt z={210}>
    <div style={{ minHeight: '78vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', height: 44 }}><button onClick={onBack} style={{ color: '#fff', display: 'grid', padding: 4 }}><ArrowLeft size={20} /></button><b style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 500, marginRight: 28 }}>{title}</b></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 44, borderRadius: 10, background: '#1c1922', padding: '0 13px', marginTop: 12 }}><Search size={18} color="#a19cb0" /><input autoFocus={false} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 15 }} /></div>
      <div style={{ display: 'flex', gap: 22, marginTop: 17, fontSize: 13.5, color: '#b88cff', paddingLeft: 11 }}><button style={{ color: 'inherit' }} onClick={() => setV([...items])}>Marcar todas</button><button style={{ color: 'inherit' }} onClick={() => setV([])}>Limpiar</button></div>
      <button onClick={() => setV([])} style={{ display: 'flex', alignItems: 'center', gap: 23, marginTop: 20, paddingLeft: 26, fontSize: 15, color: '#fff' }}><Box on={!v.length} />{all}</button>
      {list.length === 0 ? <div style={{ textAlign: 'center', fontSize: 14, color: '#a19cb0', marginTop: 32 }}>Ningún resultado para la búsqueda.</div>
        : list.map(i => <button key={i} onClick={() => setV(v.includes(i) ? v.filter(x => x !== i) : [...v, i])} style={{ display: 'flex', alignItems: 'center', gap: 23, marginTop: 18, paddingLeft: 26, fontSize: 15, color: '#fff' }}><Box on={v.includes(i)} />{i}</button>)}
      <div style={{ flex: 1 }} /><button className="md-btn" style={{ marginTop: 20 }} onClick={() => onApply(v)}>Aplicar</button>
    </div>
  </Sheet>
}

/* ---------------- calendario ---------------- */
function CalendarPicker({ range, onClose, onUse }) {
  const today = new Date(); const t0 = iso(today)
  const minD = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate()); const min = iso(minD)
  const [a, setA] = useState(range[0]); const [b, setB] = useState(range[1]); const [edit, setEdit] = useState(false)
  const [ea, setEa] = useState(''); const [eb, setEb] = useState('')
  const ref = useRef(); useEffect(() => { ref.current && (ref.current.scrollTop = ref.current.scrollHeight) }, [])
  const tap = d => { if (!a || (a && b)) { setA(d); setB('') } else if (d < a) { setB(a); setA(d) } else setB(d) }
  const months = [2, 1, 0].map(k => new Date(today.getFullYear(), today.getMonth() - k, 1))
  const toIso = s => { const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? `${m[3]}-${pad(m[2])}-${pad(m[1])}` : null }
  const toDmy = s => s ? s.split('-').reverse().map((x, i) => i < 2 ? String(+x) : x).join('/') : ''
  return <div className="md-cal">
    <div style={{ display: 'flex', alignItems: 'center', padding: '22px 15px 0' }}><button onClick={onClose} style={{ color: '#fff', display: 'grid' }}><X size={22} /></button><button disabled={!a} onClick={() => onUse([a, b || a])} style={{ marginLeft: 'auto', color: a ? '#fff' : '#5d5868', fontSize: 14 }}>Usar período</button></div>
    <div style={{ display: 'flex', alignItems: 'center', padding: '13px 15px 0 66px' }}><div><div style={{ fontSize: 13 }}>Período personalizado...</div><div style={{ fontSize: 22, fontWeight: 500, marginTop: 5 }}>{a ? short(a) : 'Inicio'} – {b ? short(b) : 'Fin'}</div></div>
      <button onClick={() => { setEa(toDmy(a)); setEb(toDmy(b)); setEdit(true) }} style={{ marginLeft: 'auto', color: '#fff', display: 'grid' }}><Pencil size={19} /></button></div>
    <div className="wd" style={{ marginTop: 18 }}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <span key={d}>{d}</span>)}</div>
    <div ref={ref} style={{ flex: 1, overflowY: 'auto', padding: '0 0 30px' }}>{months.map(m => { const off = (m.getDay() + 6) % 7; const n = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate()
      return <div key={m.getMonth()}><div style={{ fontSize: 13, padding: '22px 15px 14px' }}>{MONL[m.getMonth()]} de {m.getFullYear()}</div>
        <div className="gr">{Array.from({ length: off }, (_, i) => <span key={'x' + i} />)}{Array.from({ length: n }, (_, i) => { const d = iso(new Date(m.getFullYear(), m.getMonth(), i + 1)); const dis = d > t0 || d < min
          const s = d === a, e = d === (b || (a && !b ? a : '')), inr = a && b && d > a && d < b
          return <button key={d} disabled={dis} className={(s ? 's ' : '') + (e ? 'e ' : '') + (inr ? 'in' : '')} onClick={() => tap(d)}>{s || e ? <span>{i + 1}</span> : i + 1}</button> })}</div></div> })}</div>
    {edit && <div className="md-ov" style={{ alignItems: 'center', justifyContent: 'center', zIndex: 230 }} onClick={e => e.target === e.currentTarget && setEdit(false)}>
      <div style={{ width: 300, background: '#1d1a23', borderRadius: 18, padding: '20px 21px 16px', color: '#fff' }}>
        <div style={{ fontSize: 13 }}>Período personalizado...</div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}><span style={{ fontSize: 26, fontWeight: 500 }}>{toIso(ea) ? short(toIso(ea)) : '—'} – {toIso(eb) ? short(toIso(eb)) : '—'}</span><Calendar size={20} style={{ marginLeft: 'auto' }} /></div>
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>{[['Fecha de inicio', ea, setEa], ['Fecha de finalización', eb, setEb]].map(([l, v, set]) => <label key={l} style={{ flex: 1, position: 'relative', border: '1.5px solid ' + (toIso(v) || !v ? '#a77bf9' : '#ef4444'), borderRadius: 9, padding: '15px 11px 9px' }}>
          <span style={{ position: 'absolute', top: -8, left: 9, background: '#1d1a23', padding: '0 3px', fontSize: 10.5, color: '#c7c2d4', whiteSpace: 'nowrap', maxWidth: 'calc(100% - 14px)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l}</span>
          <input value={v} onChange={e => set(e.target.value.replace(/[^\d/]/g, ''))} inputMode="numeric" placeholder="dd/mm/aaaa" style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14 }} /></label>)}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 26, marginTop: 22, fontSize: 13.5, color: '#b88cff' }}><button style={{ color: 'inherit' }} onClick={() => setEdit(false)}>Cancelar</button>
          <button style={{ color: 'inherit', fontWeight: 600 }} onClick={() => { const x = toIso(ea), y = toIso(eb); if (!x || !y || x > y || y > t0 || x < min) return; setA(x); setB(y); setEdit(false) }}>ACEPTAR</button></div>
      </div></div>}
  </div>
}

/* ---------------- compartir ---------------- */
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src })
function ShareSheet({ metrics, onClose }) {
  const toast = useToast()
  const [inc, setInc] = useState(metrics.filter(m => !['Ticket medio', 'Tasa de conv.'].includes(m[0])).map(m => m[0])); const [star, setStar] = useState(['Ingresos'])
  const big = metrics.filter(m => star.includes(m[0]) && inc.includes(m[0])); const rest = metrics.filter(m => inc.includes(m[0]) && !star.includes(m[0]))
  const share = async () => {
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d')
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#26113f'); g.addColorStop(.45, '#120b1d'); g.addColorStop(1, '#09070d'); x.fillStyle = g; x.fillRect(0, 0, W, H)
    const logo = await loadImg('/leona-white.png'); if (logo) { const h = 90, w = h * logo.width / logo.height; x.drawImage(logo, (W - w) / 2, 70, w, h); x.globalAlpha = .06; const h2 = 330, w2 = h2 * logo.width / logo.height; x.save(); x.translate(W / 2, 760); x.rotate(-.25); x.drawImage(logo, -w2 / 2, -h2 / 2, w2, h2); x.restore(); x.globalAlpha = 1 }
    let y = 330; x.font = '600 34px Inter, sans-serif'
    big.forEach(([l, v, col]) => { x.fillStyle = col || '#34d399'; x.font = '600 32px Inter, sans-serif'; x.fillText(l.toUpperCase(), 90, y); x.fillStyle = '#d8d0ec'; x.font = '500 150px Inter, sans-serif'; x.fillText(v, 80, y + 150); y += 250 })
    y = Math.max(y + 40, 780); x.fillStyle = 'rgba(255,255,255,.15)'; x.fillRect(90, y - 70, W - 180, 2)
    rest.forEach(([l, v]) => { x.fillStyle = '#b4afc2'; x.font = '400 36px Inter, sans-serif'; x.fillText(l, 90, y); x.fillStyle = '#fff'; x.font = '500 46px Inter, sans-serif'; x.textAlign = 'right'; x.fillText(v, W - 90, y); x.textAlign = 'left'; y += 95 })
    const blob = await new Promise(r => c.toBlob(r, 'image/png')); const file = new File([blob], 'leona-resultado.png', { type: 'image/png' })
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Mi resultado en Leona' }); return } } catch (e) { if (e.name === 'AbortError') return }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'leona-resultado.png'; a.click(); toast('Imagen descargada')
  }
  return <Sheet onClose={onClose}>
    <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 500 }}>Compartir resultado</div><div style={{ textAlign: 'center', fontSize: 12, color: '#a19cb0', marginTop: 5 }}>La estrella destaca hasta 3 números</div>
    <div style={{ position: 'relative', overflow: 'hidden', margin: '11px 18px 0', background: 'linear-gradient(#26113f,#120b1d 45%,#09070d)', padding: '22px 20px 26px', minHeight: 520 }}>
      <img src="/leona-white.png" alt="" style={{ height: 30, display: 'block', margin: '0 auto' }} />
      <img src="/leona-white.png" alt="" style={{ position: 'absolute', width: '90%', left: '5%', top: '42%', opacity: .06, transform: 'rotate(-14deg)' }} />
      <div style={{ marginTop: 60, minHeight: 110 }}>{big.map(([l, v, col]) => <div key={l} style={{ marginBottom: 16 }}><div style={{ fontSize: 11, letterSpacing: '.16em', color: col || '#34d399' }}>{l.toUpperCase()}</div><div style={{ fontSize: 44, color: '#d8d0ec', lineHeight: 1.15, marginTop: 4 }}>{v}</div></div>)}</div>
      <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#5b5468,transparent)', margin: '30px 0 10px' }} />
      {rest.map(([l, v]) => <div key={l} style={{ display: 'flex', alignItems: 'center', height: 42, fontSize: 12, color: '#b4afc2', position: 'relative' }}>{l}<b style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 500, color: '#fff' }}>{v}</b></div>)}
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>{metrics.map(([l]) => { const on = inc.includes(l), st = star.includes(l)
      return <span key={l} className={'md-chip' + (st && on ? ' st' : '') + (!on ? ' off' : '')} onClick={() => !on && setInc([...inc, l])}>
        <Star size={12} fill={st && on ? '#facc15' : 'none'} color={st && on ? '#facc15' : 'currentColor'} onClick={e => { e.stopPropagation(); if (!on) setInc([...inc, l]); setStar(s => s.includes(l) ? s.filter(x => x !== l) : s.length >= 3 ? (toast('Máximo 3 destacados', 'info'), s) : [...s, l]) }} />
        <span>{l}</span>{on && <X size={13} color="#f87171" style={{ flexShrink: 0 }} onClick={e => { e.stopPropagation(); setInc(inc.filter(x => x !== l)); setStar(s => s.filter(x => x !== l)) }} />}</span> })}</div>
    <button className="md-btn" style={{ marginTop: 13, height: 46, background: 'linear-gradient(90deg,#a855f7,#e879f9)' }} onClick={share}>Compartir</button>
  </Sheet>
}

/* ---------------- principal ---------------- */
export default function MobileDash({ P, period, setPeriod, range, setRange, selConn, setSelConn, selProd, setSelProd, connNames, prodNames, fs, contacts, chats, cur, inP, setSaved }) {
  const toast = useToast()
  const [tab, setTab] = useState('ventas'); const [sheet, setSheet] = useState(null); const [sub, setSub] = useState(null); const [cal, setCal] = useState(false)
  const [m1, setM1] = useState('valor'); const [m2, setM2] = useState('etapa')
  const [ad] = useStore('adspend', 0); const [boards] = useStore('boards', [])
  const money = v => `${(+v || 0).toLocaleString('es-PE', { maximumFractionDigits: 2 })} ${cur}`
  const total = fs.reduce((a, s) => a + (+s.value || 0), 0); const leads = contacts.filter(c => c.created && inP(c.created)).length
  const conv = leads ? fs.length / leads * 100 : 0
  const K = [['Leads nuevos', leads, '#2563eb', UserPlus], ['Ingresos', money(total), '#059669', Banknote], ['Ticket medio', money(fs.length ? total / fs.length : 0), '#7c3aed', TrendingUp], ['Ventas', fs.length, '#4f46e5', ShoppingBag],
    ['Inversión Meta', money(ad), '#dc2626', Megaphone], ['Beneficio', money(total - ad), '#059669', Wallet], ['ROAS', (ad ? total / ad : 0).toFixed(2), '#ea580c', Zap], ['Tasa de conv.', conv.toFixed(2) + '%', '#e879f9', Percent, '#a78bfa']]
  const byDay = P.buckets.map(d => [P.hourly ? pad(d.getHours()) : `${d.getDate()}/${d.getMonth() + 1}`, 0, 0]); fs.forEach(s => { const i = P.idx(new Date(s.date)); if (byDay[i]) { byDay[i][1]++; byDay[i][2] += +s.value || 0 } })
  const hours = Array.from({ length: 24 }, (_, h) => [pad(h), fs.filter(s => new Date(s.date).getHours() === h).length]).filter(([, v], i, a) => a.some(x => x[1]) ? true : false)
  const grp = (k, val) => Object.entries(fs.reduce((a, s) => { const key = s[k] || '—'; a[key] = (a[key] || 0) + (val ? +s.value || 0 : 1); return a }, {}))
  const fc = chats.filter(c => c.last && inP(c.last))
  const stages = boards.flatMap(b => b.cols.map(c => [c.name, c.cards.length, c.cards.reduce((a, x) => a + (+String(x.value || 0).replace(',', '.') || 0), 0)])).filter(x => x[1])
  const byAgent = Object.entries(fc.reduce((a, c) => { if (c.agent) a[c.agent] = (a[c.agent] || 0) + 1; return a }, {}))
  const grpBy = P.hourly ? 'Agrupado por hora' : 'Agrupado por día'
  return <div className="md">
    <div className="md-top">
      {tab === 'ventas' ? <button className="md-rb" onClick={() => setSheet('share')} title="Compartir"><Share size={18} /></button> : <span style={{ width: 36 }} />}
      <img src="/leona-white.png" alt="Leona" style={{ height: 31, margin: '0 auto', position: 'relative', left: 22 }} />
      <span className="md-pill">{PL[period]}</span><button className="md-rb" onClick={() => setSheet('filter')} title="Filtros"><SlidersHorizontal size={18} /></button>
    </div>
    <div className="md-seg"><button className={tab === 'ventas' ? 'on' : ''} onClick={() => setTab('ventas')}>Ventas</button><button className={tab === 'leads' ? 'on' : ''} onClick={() => setTab('leads')}>Leads</button></div>
    {tab === 'ventas' ? <>
      <div className="md-kpis">{K.map(([l, v, c, Ic, vc]) => <div key={l} className="md-k"><i style={{ background: c }}><Ic size={15} /></i><div style={{ minWidth: 0 }}><span>{l}</span><b style={vc ? { color: vc } : null}>{v}</b></div></div>)}</div>
      <Card t="Ventas por período" s={grpBy}>{fs.length ? <VBars data={byDay.map(d => [d[0], d[1]])} /> : <Empty ic={ChartLine} t="Sin ventas en este período" d="Cuando haya ventas en el rango seleccionado, aquí verás cuántas ocurrieron por intervalo." />}</Card>
      <Card t="Ingresos en el período" s={grpBy}>{fs.length ? <VBars data={byDay.map(d => [d[0], d[2]])} /> : <Empty ic={ChartLine} t="Sin ventas en este período" d="Cuando haya ventas en el rango seleccionado, aquí verás cuántas ocurrieron por intervalo." />}</Card>
      <Card t="Ventas por horario" s="Total de ventas del período, por hora del día">{fs.length ? <VBars data={hours.filter(h => h[1])} /> : <Empty ic={Clock} t="Sin ventas por horario" d="Cuando haya ventas en el período, el gráfico muestra en qué horas ocurrieron." />}</Card>
      <Card t="Ventas por instancia" s="Cantidad de ventas">{fs.some(s => s.instance) ? <Bars data={grp('instance')} /> : <Empty ic={Network} t="Sin ventas por instancia" d="Los totales aparecen cuando existan ventas vinculadas a instancias en el período." />}</Card>
      <Card t="Facturación por instancia" s={'Montos en ' + cur}>{fs.some(s => s.instance) ? <Bars data={grp('instance', 1)} fmt={money} /> : <Empty ic={Banknote} t="Sin facturación por instancia" d="Los importes por instancia aparecerán cuando existan datos." />}</Card>
      <Card t="Ventas por estado" s="Cantidad de ventas">{fs.some(s => s.state) ? <Bars data={grp('state')} /> : <Empty ic={Flag} t="Sin ventas por estado" d="Cuando el estado esté disponible en los datos, verás la distribución aquí." />}</Card>
      <Card t="Performance de productos" s="Participación en el total"><div className="md-sg"><button className={m1 === 'valor' ? 'on' : ''} onClick={() => setM1('valor')}>Valor</button><button className={m1 === 'cant' ? 'on' : ''} onClick={() => setM1('cant')}>Cant.</button></div>
        {fs.some(s => s.product) ? <Bars data={grp('product', m1 === 'valor')} fmt={m1 === 'valor' ? money : v => v} /> : <Empty ic={Archive} t="Sin ventas por producto" d="Ninguna venta por producto en el período." />}</Card>
      <div className="md-hist"><div style={{ display: 'flex', alignItems: 'center', height: 50, borderBottom: '1px solid #3d2f66' }}><ReceiptText size={19} color="#a78bfa" /><b style={{ fontSize: 14.5, fontWeight: 500, marginLeft: 10 }}>Historial de ventas</b>
        <button disabled={!fs.length} onClick={() => downloadCSV('ventas.csv', [['Cliente', 'Producto', 'Valor', 'Moneda', 'Fecha'], ...fs.map(s => [s.client, s.product, s.value, s.currency, s.date])])} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: fs.length ? '#c4b5fd' : '#8f8a9e' }}><Download size={15} color="#a78bfa" />Exportar CSV</button></div>
        {fs.length ? fs.slice(0, 30).map(s => <div key={s.id} className="md-row"><div><div>{s.client}</div><div style={{ fontSize: 10.5, color: '#a19cb0' }}>{s.product || '—'} · {new Date(s.date).toLocaleDateString('es-PE')}</div></div><b style={{ marginLeft: 'auto', fontWeight: 600, color: '#34d399' }}>{money(s.value)}</b></div>)
          : <div style={{ textAlign: 'center', fontSize: 12.5, color: '#a19cb0', marginTop: 22 }}>Sin ventas en este período.</div>}</div>
    </> : <>
      <Card t="Análisis de leads" s="Nuevos, en curso y cerrados por conexión">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', background: '#1c1922', border: '1px solid #2a2533', borderRadius: 10, marginTop: 11, padding: '6px 0 4px' }}>
          {[['Leads nuevos', leads, '#3b82f6'], ['En curso', fc.filter(c => c.status === 'atencion').length, '#10b981'], ['Cerrados', fc.filter(c => c.status === 'resueltos').length, '#8b5cf6']].map(([l, v, c], i) => <div key={l} style={{ textAlign: 'center', borderLeft: i ? '1px solid #2a2533' : 'none' }}><div style={{ fontSize: 11, color: '#b4afc2' }}>{l}</div><div style={{ fontSize: 19, color: c, marginTop: 2 }}>{v}</div></div>)}</div>
        {fc.length ? <Bars data={Object.entries(fc.reduce((a, c) => { const k = c.conn || 'Sin conexión'; a[k] = (a[k] || 0) + 1; return a }, {}))} /> : <Empty ic={Users} t="Sin leads en el período" d="Cuando entren nuevos leads, verás la distribución por conexión aquí." />}</Card>
      <Card t="Análisis de conversiones"><div className="md-sg"><button className={m2 === 'etapa' ? 'on' : ''} onClick={() => setM2('etapa')}>Por etapa</button><button className={m2 === 'conexion' ? 'on' : ''} onClick={() => setM2('conexion')}>Por conexión</button></div>
        {m2 === 'etapa' && stages.length ? <Bars data={stages.map(s => [s[0], s[1]])} /> : <Empty ic={Columns3} t="Sin conversiones en el período" d="Sin conversiones en este período" />}</Card>
      <Card t="Valor por etapa del embudo">{stages.some(s => s[2]) ? <Bars data={stages.map(s => [s[0], s[2]])} fmt={money} /> : <Empty ic={WalletIc} t="Sin valor por etapa" d="Cuando haya valores en las etapas del embudo, el gráfico aparecerá aquí." />}</Card>
      <Card t="Leads por responsable" s="Volumen por persona en el período">{byAgent.length ? <Bars data={byAgent} /> : <Empty ic={UserSearch} t="Leads por responsable" d="Ningún lead asignado en este período" />}</Card>
    </>}

    {sheet === 'share' && <ShareSheet metrics={['Ingresos', 'Beneficio', 'ROAS', 'Ventas', 'Leads nuevos', 'Inversión Meta', 'Ticket medio', 'Tasa de conv.'].map(n => K.find(k => k[0] === n)).map(([l, v, c]) => [l, String(v), l === 'Ingresos' ? '#34d399' : c])} onClose={() => setSheet(null)} />}
    {sheet === 'filter' && <Sheet onClose={() => setSheet(null)}>
      <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4 }}>Filtros</div>
      <div style={{ fontSize: 13, color: '#c7c2d4', margin: '8px 0 4px 4px' }}>Período</div>
      {[['today', 'Hoy'], ['yesterday', 'Ayer'], ['7', '7 días'], ['30', '30 días'], ['month', 'Mes']].map(([k, l]) => <button key={k} className={'md-radio' + (period === k ? ' on' : '')} onClick={() => setPeriod(k)}><i>{period === k && <Check size={12} strokeWidth={3.5} />}</i>{l}</button>)}
      <button onClick={() => setCal(true)} style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%', textAlign: 'left', padding: '10px 8px', color: '#fff' }}><CalendarDays size={20} color={period === 'custom' ? '#a77bf9' : '#5d5868'} /><div><div style={{ fontSize: 15, color: period === 'custom' ? '#c4b5fd' : '#fff' }}>{period === 'custom' ? `${short(range[0])} – ${short(range[1])}` : 'Período personalizado...'}</div><div style={{ fontSize: 11, color: '#c7c2d4', marginTop: 2 }}>Solo hasta 2 meses atrás.</div></div><ChevronRight size={18} color="#5d5868" style={{ marginLeft: 'auto' }} /></button>
      <div style={{ height: 1, background: '#4a4552', margin: '14px 0 13px' }} />
      {[['conn', 'Conexiones', 'Todas las conexiones', 'Toca para elegir una o más conexiones.', selConn, Network], ['prod', 'Productos', 'Todos los productos', 'Toca para elegir uno o más productos.', selProd, Archive]].map(([k, l, all, h, v, Ic]) => <button key={k} className="md-fc" onClick={() => setSub(k)}><span className="ic"><Ic size={19} /></span><div style={{ minWidth: 0 }}><small>{l}</small><b>{v.length ? (v.length === 1 ? v[0] : `${v.length} seleccionados`) : all}</b><span>{h}</span></div><ChevronDown size={18} color="#c7c2d4" style={{ marginLeft: 'auto' }} /></button>)}
      <div style={{ height: 1, background: '#4a4552', margin: '16px 0 14px' }} />
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 13.5, color: '#c7c2d4' }}>Grupo de filtro<button style={{ marginLeft: 'auto', color: '#c7c2d4', display: 'grid' }} onClick={() => { setSaved({ period, selConn, selProd, cur }); toast('Grupo de filtro guardado') }}><BookmarkPlus size={20} /></button></div>
      <div style={{ fontSize: 11.5, color: '#a19cb0', marginTop: 11, marginBottom: 10 }}>Guarda la selección actual para reutilizarla después.</div>
    </Sheet>}
    {sub === 'conn' && <Pick title="Conexiones" all="Todas las conexiones" items={connNames} value={selConn} onBack={() => setSub(null)} onApply={v => { setSelConn(v); setSub(null) }} />}
    {sub === 'prod' && <Pick title="Productos" all="Todos los productos" items={prodNames} value={selProd} onBack={() => setSub(null)} onApply={v => { setSelProd(v); setSub(null) }} />}
    {cal && <CalendarPicker range={period === 'custom' ? range : [iso(new Date(Date.now() - 6 * 864e5)), iso(new Date())]} onClose={() => setCal(false)} onUse={r => { setRange(r); setPeriod('custom'); setCal(false); setSheet(null) }} />}
  </div>
}
