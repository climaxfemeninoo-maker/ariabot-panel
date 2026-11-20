import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react'
import { ChevronDown, Check, Search, Info, TrendingUp, Calendar, X } from 'lucide-react'
import { useOutside } from '../../ui'

/* ---------- helpers ---------- */
export const fmtMoney = (n, cur = 'PEN') => `${cur} ${Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const pad = n => String(n).padStart(2, '0')
export const ddmm = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`

function useWidth() {
  const ref = useRef(); const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return
    setW(el.clientWidth)
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect()
  }, [])
  return [ref, w]
}

/* ---------- basic pieces ---------- */
export function Seg({ value, onChange, options, sm }) {
  return <div className={'db-seg' + (sm ? ' sm' : '')}>
    {options.map(([v, l]) => <button key={v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>)}
  </div>
}

export function InfoTip({ text, size = 14 }) {
  return <span className="db-info"><Info size={size} strokeWidth={1.8} />{text && <span className="db-tip">{text}</span>}</span>
}

export function Trend({ v = 0, green }) {
  return <span className={'db-trend' + (green ? ' g' : '')}><TrendingUp size={10} strokeWidth={2.4} />{v.toFixed(1)}%</span>
}

export function Kpi({ icon: Ic, color, value, valueColor, label, tip, green, extra }) {
  return <div className="db-card db-kpi">
    <div className="top"><div className="ic" style={{ background: color + '24', color }}><Ic size={15} strokeWidth={2} /></div>
      <span style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>{extra}<Trend green={green} /></span></div>
    <div className="v" style={{ color: valueColor || 'var(--text)' }}>{value}</div>
    <div className="bot"><span className="l">{label}</span><InfoTip text={tip} /></div>
  </div>
}

export function Section({ title, sub, right, children, style, className = '' }) {
  return <div className={'db-card db-sec ' + className} style={style}>
    <div className="hd"><div style={{ minWidth: 0 }}><h3>{title}</h3>{sub && <div className="sd">{sub}</div>}</div>{right && <div className="r">{right}</div>}</div>
    {children}
  </div>
}

export const EmptyBox = ({ text = 'Sin datos en el período seleccionado.', h = 90, center, style }) =>
  <div className={'db-empty' + (center ? ' c' : '')} style={{ height: h, ...style }}>{text}</div>

/* ---------- dropdowns ---------- */
export const PERIODS = [['today', 'Hoy'], ['yesterday', 'Ayer'], ['7', 'Últimos 7 días'], ['30', 'Últimos 30 días'], ['month', 'Este mes'], ['custom', 'Personalizado']]

export function PeriodSelect({ value, onChange, range, setRange }) {
  const [open, setOpen] = useState(false); const ref = useRef(); useOutside(ref, () => setOpen(false))
  const label = PERIODS.find(p => p[0] === value)?.[1]
  return <>
    <div className="db-dd" ref={ref}>
      <button className={'db-ddb' + (open ? ' open' : '')} style={{ width: 142 }} onClick={() => setOpen(!open)}>{label}<ChevronDown size={14} className="chev" /></button>
      {open && <div className="db-menu">
        {PERIODS.map(([v, l]) => <button key={v} className={'db-mi' + (v === value ? ' on' : '')} onClick={() => { onChange(v); setOpen(false) }}>{l}</button>)}
      </div>}
    </div>
    {value === 'custom' && <>
      <label className="db-date"><Calendar size={13} style={{ color: 'var(--muted)' }} /><input type="date" value={range[0]} max={range[1]} onChange={e => setRange([e.target.value, range[1]])} /></label>
      <label className="db-date"><Calendar size={13} style={{ color: 'var(--muted)' }} /><input type="date" value={range[1]} min={range[0]} onChange={e => setRange([range[0], e.target.value])} /></label>
    </>}
  </>
}

export function MultiSelect({ allLabel, header, items, value, onChange, width }) {
  const [open, setOpen] = useState(false); const [q, setQ] = useState('')
  const ref = useRef(); useOutside(ref, () => setOpen(false))
  const list = items.filter(i => i.toLowerCase().includes(q.toLowerCase()))
  const label = value.length === 0 ? allLabel : value.length === 1 ? value[0] : `${value.length} seleccionados`
  const tog = i => onChange(value.includes(i) ? value.filter(x => x !== i) : [...value, i])
  return <div className="db-dd" ref={ref}>
    <button className={'db-ddb' + (open ? ' open' : '')} style={{ width }} onClick={() => setOpen(!open)}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span><ChevronDown size={14} className="chev" /></button>
    {open && <div className="db-pop">
      <div className="h">{header}<button className="a" onClick={() => onChange([...items])}>Seleccionar todas</button><button className="c" onClick={() => onChange([])}>Limpiar</button></div>
      <div className="db-search"><Search size={14} /><input autoFocus placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
      {list.length === 0 ? <div className="none">Ningún resultado para la búsqueda.</div>
        : <div style={{ marginTop: 6, maxHeight: 200, overflowY: 'auto' }}>{list.map(i => <button key={i} className={'db-chk' + (value.includes(i) ? ' on' : '')} onClick={() => tog(i)}><i>{value.includes(i) && <Check size={10} strokeWidth={3} />}</i>{i}</button>)}</div>}
    </div>}
  </div>
}

/* monedas: todas las ISO 4217 que conoce el navegador, nombre en portugués como la referencia */
const FLAG = { PEN: 'pe', USD: 'us', BRL: 'br', ARS: 'ar', MXN: 'mx', CLP: 'cl', COP: 'co', EUR: 'eu', BOB: 'bo', UYU: 'uy', PYG: 'py', VES: 've', CRC: 'cr', GTQ: 'gt', DOP: 'do', HNL: 'hn', NIO: 'ni', PAB: 'pa', CAD: 'ca', GBP: 'gb', JPY: 'jp', CNY: 'cn', CHF: 'ch', AUD: 'au', CUP: 'cu', BZD: 'bz', SVC: 'sv', HTG: 'ht', JMD: 'jm', TTD: 'tt', GYD: 'gy', SRD: 'sr', AWG: 'aw', BSD: 'bs', BBD: 'bb', KYD: 'ky', XCD: 'ag', BMD: 'bm', ANG: 'cw' }
export const flagUrl = c => FLAG[c] ? `https://flagcdn.com/w40/${FLAG[c]}.png` : null
const CURRENCIES = (() => {
  let codes = ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'BOB', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'COP', 'CRC', 'DOP', 'EUR', 'GBP', 'GTQ', 'HNL', 'JPY', 'MXN', 'NIO', 'PAB', 'PEN', 'PYG', 'USD', 'UYU', 'VES']
  try { const all = Intl.supportedValuesOf('currency'); if (all.length) codes = all } catch { }
  let dn = null; try { dn = new Intl.DisplayNames(['pt-BR'], { type: 'currency' }) } catch { }
  return codes.map(c => { let n = c; try { n = dn ? dn.of(c) : c } catch { } return [c, n.charAt(0).toUpperCase() + n.slice(1)] })
})()

export function CurrencySelect({ value, onChange }) {
  const [open, setOpen] = useState(false); const [q, setQ] = useState('')
  const ref = useRef(); useOutside(ref, () => setOpen(false))
  const list = CURRENCIES.filter(([c, n]) => (c + ' ' + n).toLowerCase().includes(q.toLowerCase()))
  const f = flagUrl(value)
  return <div className="db-dd" ref={ref}>
    <button className={'db-ddb deep db-cur' + (open ? ' open' : '')} onClick={() => { setOpen(!open); setQ('') }}>{f && <img className="db-flag" src={f} alt="" onError={e => e.currentTarget.style.display = 'none'} />}{value}<ChevronDown size={14} className="chev" /></button>
    {open && <div className="db-menu db-curmenu">
      <div className="db-search"><Search size={13} /><input autoFocus placeholder="Buscar moeda..." value={q} onChange={e => setQ(e.target.value)} /></div>
      <div className="db-curlist">
        {list.length === 0 && <div className="db-mi" style={{ color: 'var(--muted)' }}>Nenhuma moeda</div>}
        {list.map(([c, n]) => { const fl = flagUrl(c); return <button key={c} className={'db-mi' + (c === value ? ' on' : '')} onClick={() => { onChange(c); setOpen(false) }}>{fl && <img className="db-flag" src={fl} alt="" onError={e => e.currentTarget.style.display = 'none'} />}<span>{c} · {n}</span></button> })}
      </div>
    </div>}
  </div>
}

export function IconGroup({ items }) {
  const [spin, setSpin] = useState(-1)
  return <div className="db-icons">
    {items.map(([Ic, tip, fn, pu], i) => <button key={i} className={(pu ? 'pu' : '') + (spin === i ? ' spin' : '')} onClick={() => { setSpin(i); setTimeout(() => setSpin(-1), 800); fn?.() }}>
      <Ic size={15} strokeWidth={2} /><span className="db-tip">{tip}</span></button>)}
  </div>
}

/* ---------- charts ---------- */
const niceMax = m => { if (m <= 4) return 4; const p = Math.pow(10, Math.floor(Math.log10(m))); const n = Math.ceil(m / p); return (n <= 2 ? 2 : n <= 4 ? 4 : n <= 5 ? 5 : 10) * p }
const ticksOf = max => { const t = []; for (let i = 0; i <= 4; i++) t.push(max * i / 4); return t }
const tickLbl = v => Number.isInteger(v) ? v.toLocaleString('pt-BR') : v.toFixed(1)

export function LineChart({ labels, values, color = '#2dd4bf', name, fmt = v => v, showLabel, height = 232, tipLabel }) {
  const [ref, w] = useWidth(); const [hov, setHov] = useState(null)
  const L = 30, R = 8, T = 8, B = 30; const h = height
  const max = niceMax(Math.max(0, ...values)); const ticks = ticksOf(max)
  const iw = Math.max(10, w - L - R), ih = h - T - B
  const x = i => L + (values.length < 2 ? iw / 2 : i * iw / (values.length - 1)); const y = v => T + ih - (v / max) * ih
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join('')
  const vCols = values.map((_, i) => i).filter(i => i % 2 === 0)
  const move = e => { const r = e.currentTarget.getBoundingClientRect(); const px = (e.clientX - r.left) * (w / r.width); let best = 0, bd = 1e9; values.forEach((_, i) => { const dd = Math.abs(x(i) - px); if (dd < bd) { bd = dd; best = i } }); setHov(best) }
  return <div className="db-chart" ref={ref} style={{ height: h }}>
    {w > 0 && <svg width={w} height={h} onMouseMove={move} onMouseLeave={() => setHov(null)}>
      {ticks.map(t => <g key={t}><line x1={L} x2={w - R} y1={y(t)} y2={y(t)} stroke="var(--grid)" strokeDasharray="3 3" /><text x={L - 10} y={y(t) + 4} fontSize="11.5" textAnchor="end" fill="var(--muted)">{tickLbl(t)}</text></g>)}
      {vCols.map(i => <line key={i} x1={x(i)} x2={x(i)} y1={T} y2={T + ih} stroke="var(--grid)" strokeDasharray="3 3" />)}
      {labels.map((l, i) => showLabel(i, labels.length) && <text key={i} x={x(i)} y={h - 8} fontSize="12.5" textAnchor={i === labels.length - 1 && labels.length > 1 ? 'end' : 'middle'} fill="var(--muted)">{l}</text>)}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {hov != null && <><line x1={x(hov)} x2={x(hov)} y1={T} y2={T + ih} stroke="#c9ccd3" strokeWidth="1.2" />
        <circle cx={x(hov)} cy={y(values[hov])} r="4.2" fill="#fff" stroke={color} strokeWidth="2" /></>}
    </svg>}
    {hov != null && w > 0 && <div className="db-tt" style={{ left: Math.min(x(hov) + 10, w - 190), top: Math.max(0, y(values[hov]) - 150) }}>
      <b>{tipLabel ? tipLabel(hov) : labels[hov]}</b><div className="row"><i style={{ background: color }} />{name}: <strong>{fmt(values[hov])}</strong></div></div>}
  </div>
}

export function BarChart({ labels, values, color = '#005ae3', name = 'Vendas', fmt = v => v, height = 232 }) {
  const [ref, w] = useWidth(); const [hov, setHov] = useState(null)
  const L = 30, R = 4, T = 8, B = 26; const h = height
  const max = niceMax(Math.max(0, ...values)); const ticks = ticksOf(max)
  const iw = Math.max(10, w - L - R), ih = h - T - B, bw = iw / values.length
  const y = v => T + ih - (v / max) * ih
  return <div className="db-chart" ref={ref} style={{ height: h }}>
    {w > 0 && <svg width={w} height={h} onMouseLeave={() => setHov(null)}>
      {ticks.map(t => <g key={t}><line x1={L} x2={w - R} y1={y(t)} y2={y(t)} stroke="var(--grid)" strokeDasharray="3 3" /><text x={L - 14} y={y(t) + 4} fontSize="11.5" textAnchor="end" fill="var(--muted)">{tickLbl(t)}</text></g>)}
      {values.map((v, i) => <g key={i} onMouseEnter={() => setHov(i)}>
        <rect x={L + i * bw} y={T} width={bw} height={ih} fill={hov === i ? '#d1d5db' : 'transparent'} />
        {v > 0 && <rect x={L + i * bw + bw * .18} y={y(v)} width={bw * .64} height={T + ih - y(v)} rx="3" fill={color} />}
        <text x={L + i * bw + bw / 2} y={h - 7} fontSize="9.5" textAnchor="middle" fill="var(--muted)">{labels[i]}</text></g>)}
    </svg>}
    {hov != null && w > 0 && <div className="db-tt" style={{ left: Math.min(L + hov * bw + bw * .65, w - 110), top: ih * .45 }}>
      <b>{labels[hov]}</b><div className="row"><i style={{ background: '#9ca3af' }} />{name}: <strong>{fmt(values[hov])}</strong></div></div>}
  </div>
}

export function Heatmap({ data }) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const max = Math.max(1, ...data.flat())
  const shades = ['#1e293b', '#1f4a52', '#22696b', '#26877f', '#2aa898', '#2dd4bf']
  const col = v => v === 0 ? undefined : shades[Math.min(5, 1 + Math.floor((v / max) * 4.999))]
  return <>
    <div className="db-heat">
      <span />{Array.from({ length: 24 }, (_, h) => <span key={h} className="hh">{pad(h)}</span>)}
      {days.map((d, di) => <Row key={d} d={d} vals={data[di]} col={col} />)}
    </div>
    <div className="db-legend">Menos{shades.map(s => <i key={s} style={{ background: s }} />)}Más</div>
  </>
}
function Row({ d, vals, col }) {
  return <><span className="dd">{d}</span>{vals.map((v, h) => <span key={h} className="cell" title={`${d} ${pad(h)}h · ${v} chats`} style={{ background: col(v) }} />)}</>
}
