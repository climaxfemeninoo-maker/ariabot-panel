import { useState, useRef, useEffect, useMemo } from 'react'
import { Pencil, Archive, FolderPlus, LayoutGrid, Tablet, Settings, ArrowUp, Activity, ChevronDown, ChevronLeft, ChevronRight, CircleCheck, Info, X, Columns2, SlidersHorizontal, Zap, Lock, GripVertical, Loader2, Search, RefreshCw } from 'lucide-react'
import { useStore, useToast, uid, useOutside, downloadCSV, Switch } from '../ui'
import { Toggle } from './leona'

/* ---------- Columnas (igual que el original) ---------- */
export const ACC_ONLY = ['ciclo', 'tarjeta', 'estadoCuenta', 'totalGastado']
export const COLS = [
  ['ciclo', '[Ciclo] - Ciclo de Tarjeta', 'Ciclo de Tarjeta', 'Ciclo', 'm', 1, 'Monto acumulado en el ciclo actual de facturación de la tarjeta.'],
  ['tarjeta', '[Tarjeta] - Tarjeta de Crédito', 'Tarjeta de Crédito', 'Tarjeta', 't', 1, 'Tarjeta registrada en la cuenta de anuncios.'],
  ['estadoCuenta', 'Estado de Cuenta', 'Estado de Cuenta', 'Estado de Cuenta', 't', 1, 'Estado de la cuenta en Meta (activa, deshabilitada, pendiente de pago).'],
  ['totalGastado', '[Total Gastado] - Total Gastado en Cuenta', 'Total Gastado en Cuenta', 'Total Gastado', 'm', 1, 'Gasto total histórico de la cuenta de anuncios.'],
  ['presupuesto', 'Presupuesto', 'Presupuesto', 'Presupuesto', 'm', 1],
  ['cpa', 'CPA', 'CPA', 'CPA', 'm', 1, 'Costo por adquisición: gastos / ventas.'],
  ['costoProd', 'Costos de Producto', 'Costos de Producto', 'Costos de Producto', 'm', 0],
  ['conv', '[Conversaciones] - Conversaciones Iniciadas', 'Conversaciones Iniciadas', 'Conversaciones', 'n', 0],
  ['costoConv', '[Costo / Conversación] - Costo por Conversación Iniciada', 'Costo por Conversación Iniciada', 'Costo / Conversación', 'm', 0],
  ['ventas', 'Ventas', 'Ventas', 'Ventas', 'n', 1],
  ['ventasInd', '[Ventas Ind.] - Ventas Individuales', 'Ventas Individuales', 'Ventas Ind.', 'n', 0],
  ['gastos', 'Gastos', 'Gastos', 'Gastos', 'm', 1],
  ['ingresos', 'Ingresos', 'Ingresos', 'Ingresos', 'm', 1, 'Ingresos netos de las ventas aprobadas atribuidas.'],
  ['ganancia', 'Ganancia', 'Ganancia', 'Ganancia', 'm', 1, 'Ingresos - gastos - costos de producto.'],
  ['roas', 'ROAS', 'ROAS', 'ROAS', 'x', 1, 'Retorno sobre el gasto en anuncios: ingresos / gastos.'],
  ['margen', 'Margen', 'Margen', 'Margen', 'p', 1, 'Ganancia / ingresos.'],
  ['roi', 'ROI', 'ROI', 'ROI', 'p', 1, 'Ganancia / gastos.'],
  ['ic', '[IC] - Checkout Iniciado', 'Checkout Iniciado', 'IC', 'n', 1],
  ['registros', 'Registros', 'Registros', 'Registros', 'n', 0],
  ['cpl', '[CPL] - Costo por Registro', 'Costo por Registro', 'CPL', 'm', 0],
  ['cpi', '[CPI] - Costo por Checkout Iniciado', 'Costo por Checkout Iniciado', 'CPI', 'm', 1],
  ['cpc', '[CPC] - Costo por clic', 'Costo por clic', 'CPC', 'm', 1],
  ['ctr', 'CTR', 'CTR', 'CTR', 'p', 1],
  ['cpm', 'CPM', 'CPM', 'CPM', 'm', 1],
  ['imp', 'Impresiones', 'Impresiones', 'Impresiones', 'n', 1],
  ['clics', 'Clics', 'Clics', 'Clics', 'n', 1],
  ['vistas', '[Vistas Pág.] - Vistas de Página', 'Vistas de Página', 'Vistas Pág.', 'n', 0],
  ['cpv', '[CPV] - Costo por vista de página', 'Costo por vista de página', 'CPV', 'm', 0],
  ['ventasPend', 'Ventas Pendientes', 'Ventas Pendientes', 'Ventas Pendientes', 'n', 0],
  ['cpp', '[CPP] - Costo por ventas pendientes', 'Costo por ventas pendientes', 'CPP', 'm', 0],
  ['ventasTot', 'Ventas Totales', 'Ventas Totales', 'Ventas Totales', 'n', 0],
  ['cpt', '[CPT] - Costo por ventas totales', 'Costo por ventas totales', 'CPT', 'm', 0],
  ['ca', '[CA] - Cuentas de Anuncios', 'Cuentas de Anuncios', 'CA', 't', 0],
  ['arpu', '[ARPU] - Ingresos por usuario', 'Ingresos por usuario', 'ARPU', 'm', 0],
  ['icr', '[ICR] - Tasa IC = ICs / vistas de pág. (%)', 'Tasa IC', 'ICR', 'p', 0],
  ['con', '[CON] - Tasa de conexión = Vistas de pág. / clics (%)', 'Tasa de conexión', 'CON', 'p', 0],
  ['conversion', '[Conversión] - Ventas / vistas de pág. (%)', 'Conversión', 'Conversión', 'p', 0],
  ['retencion', '[Retención] - Vídeos vistos 3 seg / vídeos iniciados (%)', 'Retención', 'Retención', 'p', 0],
  ['hook', '[Hook] - Vídeos vistos 3 seg / impresiones (%)', 'Hook', 'Hook', 'p', 0],
  ['frecuencia', 'Frecuencia', 'Frecuencia', 'Frecuencia', 'x', 0],
  ['ingBrutos', 'Ingresos Brutos', 'Ingresos Brutos', 'Ingresos Brutos', 'm', 0],
  ['ingPend', '[Ingresos Pend.] - Ingresos Pendientes', 'Ingresos Pendientes', 'Ingresos Pend.', 'm', 0],
  ['convCheckout', '[Conv. Checkout] - Conversión Checkout (%)', 'Conversión Checkout', 'Conv. Checkout', 'p', 0],
  ['convClics', '[Conv. Clics] - Conversión de Clics (%)', 'Conversión de Clics', 'Conv. Clics', 'p', 0],
  ['holdRate', '[Hold Rate] - Vídeos vistos 75% / impresiones (%)', 'Hold Rate', 'Hold Rate', 'p', 0],
  ['convBody', '[Conversión Body] - (Compras / Vídeos vistos 75%) (%)', 'Conversión Body', 'Conversión Body', 'p', 0],
  ['retBody', '[Retención Body] - Vídeos vistos 75% / vídeos iniciados (%)', 'Retención Body', 'Retención Body', 'p', 0],
  ['cta', '[CTA] - (Clics en Enlace / Vídeos vistos 75%) (%)', 'CTA', 'CTA', 'p', 0],
  ['playRate', '[Play Rate Hook] - Vídeos iniciados / impresiones (%)', 'Play Rate Hook', 'Play Rate Hook', 'p', 0],
  ['retVideo', '[Retención Vídeo (75%)] - Tasa de Retención de Vídeo (75%)', 'Retención Vídeo (75%)', 'Retención Vídeo', 'p', 0],
  ['creacion', '[Creación] - Fecha de Creación', 'Fecha de Creación', 'Creación', 't', 0],
  ['distribucion', 'Distribución', 'Distribución', 'Distribución', 't', 0],
  ['ventasRech', 'Ventas Rechazadas', 'Ventas Rechazadas', 'Ventas Rechazadas', 'n', 0],
  ['id', '[ID] - IDs de Campañas, Conjuntos de Anuncios, Anuncios y Cuentas', 'ID', 'ID', 't', 0],
  ['ultAct', '[Últ. Actualización] - Última Actualización', 'Última Actualización', 'Últ. Actualización', 't', 1, 'Última vez que los datos de Meta se sincronizaron.'],
  ['ventasReemb', '[Ventas Reemb.] - Ventas Reembolsadas', 'Ventas Reembolsadas', 'Ventas Reemb.', 'n', 0],
  ['ingReemb', '[Ingresos Reemb.] - Ingresos Reembolsados', 'Ingresos Reembolsados', 'Ingresos Reemb.', 'm', 0],
  ['segIg', '[Seg. Instagram] - Seguidores de Instagram', 'Seguidores de Instagram', 'Seg. Instagram', 'n', 0],
  ['costoSeg', '[Costo / Seguidor] - Costo por Seguidor de Instagram', 'Costo por Seguidor de Instagram', 'Costo / Seguidor', 'm', 0],
  ['impuesto', 'Impuesto Meta Ads', 'Impuesto Meta Ads', 'Impuesto Meta Ads', 'm', 0],
  ['limiteOferta', 'Límite de Oferta', 'Límite de Oferta', 'Límite de Oferta', 'm', 1],
  ['gastoMin', '[Gasto mín.] - Gasto mínimo', 'Gasto mínimo', 'Gasto mín.', 'm', 1],
  ['gastoMax', '[Gasto máx.] - Gasto máximo', 'Gasto máximo', 'Gasto máx.', 'm', 1],
]
export const CM = Object.fromEntries(COLS.map(c => [c[0], c]))
export const DEF_ORDER = ['ciclo', 'tarjeta', 'estadoCuenta', 'totalGastado', 'presupuesto', 'ultAct', 'ventas', 'cpa', 'gastos', 'ingresos', 'ganancia', 'roas', 'margen', 'roi', 'ic', 'cpi', 'cpc', 'ctr', 'cpm', 'imp', 'clics', 'limiteOferta', 'gastoMin', 'gastoMax']

export const TABS = [['acc', 'Cuentas', Archive, 'Cuenta', 'cuentas'], ['camp', 'Campañas', FolderPlus, 'Campaña', 'campañas'], ['set', 'Conjuntos', LayoutGrid, 'Conjunto', 'conjuntos'], ['ad', 'Anuncios', Tablet, 'Anuncio', 'anuncios']]
export const PERIODS = [['', 'Seleccione una opción'], ['max', 'Máximo (36 meses)'], ['today', 'Hoy'], ['yest', 'Ayer'], ['7d', 'Últimos 7 días'], ['month', 'Este mes'], ['last', 'Mes pasado'], ['custom', 'Personalizado']]
export const PF = { max: 160, today: 1, yest: .85, '7d': 6.4, month: 17, last: 27, custom: 3, '': 1 }
export const STATES = [['', 'Seleccione una opción'], ['any', 'Cualquiera'], ['ACTIVE', 'Activo'], ['PAUSED', 'Pausado'], ['RESTRICTED', 'Con Restricciones']]
export const usd = v => '$' + (+v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* ---------- Datos de ejemplo al conectar ---------- */
const rnd = (a, b) => a + Math.random() * (b - a)
const mkMetrics = () => { const imp = Math.round(rnd(1800, 9000)); const clics = Math.round(imp * rnd(.012, .035)); const ic = Math.round(clics * rnd(.08, .2)); const ventas = Math.round(ic * rnd(.2, .5)); return { gastos: rnd(18, 70), ingresos: ventas * rnd(27, 47), ventas, imp, clics, ic, vistas: Math.round(clics * .8), conv: Math.round(clics * .3) } }
export function demo() {
  const acc = [{ id: 'act_1', name: 'CP1', status: 'PENDING', card: 'VISA *8844', ciclo: 3.73, total: 24.24 }]
  const camps = [['[CBO]-[Ventas]-[PDF]-[Recetas]-[2026]-[PE]', 'Ebook Recetas'], ['[ABO]-[Mensajes]-[PDF]-[Uñas]-[2026]-[PE]', 'Ebook Uñas'], ['[Remarketing]-[7 días]-[Recetas]-[PE]', 'Ebook Recetas'], ['[CBO]-[Ventas]-[PDF]-[Telas]-[2026]-[PE]', 'Ebook Recetas'], ['[ABO]-[Ventas]-[Uñas]-[MX]', 'Ebook Uñas'], ['[Prueba]-[Creativos]-[Recetas]-[PE]', 'Ebook Recetas']].map(([name, prod], i) => ({ id: 'c' + i, acc: 'act_1', name, prod, status: i === 2 || i === 5 ? 'PAUSED' : 'ACTIVE', budget: [50, 30, 20, 25, 15, 10][i], m: mkMetrics(), created: Date.now() - (i + 3) * 864e5 }))
  const sets = camps.flatMap(c => [1, 2].map(j => ({ id: c.id + 's' + j, camp: c.id, acc: c.acc, prod: c.prod, name: `Público ${j === 1 ? 'Abierto' : 'Lookalike 1%'} - ${c.name.split(' ')[1] || 'Ebook'}`, status: c.status, budget: c.budget / 2, m: mkMetrics(), created: c.created })))
  const ads = sets.flatMap(s => [1, 2].map(k => ({ id: s.id + 'a' + k, set: s.id, camp: s.camp, acc: s.acc, prod: s.prod, name: `AD${String(k).padStart(2, '0')} - ${k === 1 ? 'Vídeo testimonio' : 'Imagen oferta'}`, status: s.status, m: mkMetrics(), created: s.created })))
  return { acc, camps, sets, ads, products: ['Ebook Recetas', 'Ebook Uñas'] }
}

export function calc(m, f, extra = {}) {
  const g = m.gastos * f, ing = m.ingresos * f, v = Math.round(m.ventas * f), imp = Math.round(m.imp * f), cl = Math.round(m.clics * f), ic = Math.round(m.ic * f), vi = Math.round(m.vistas * f), cv = Math.round(m.conv * f)
  const d = (a, b) => b ? a / b : null
  return { gastos: g, ingresos: ing, ventas: v, ventasInd: v, ventasTot: v, imp, clics: cl, ic, vistas: vi, conv: cv, ganancia: ing - g, roas: d(ing, g), margen: d(ing - g, ing), roi: d(ing - g, g), cpa: d(g, v), cpi: d(g, ic), cpc: d(g, cl), ctr: d(cl, imp), cpm: d(g * 1000, imp), cpv: d(g, vi), costoConv: d(g, cv), icr: d(ic, vi), con: d(vi, cl), conversion: d(v, vi), convCheckout: d(v, ic), convClics: d(v, cl), arpu: d(ing, v), frecuencia: imp ? 1.1 + (imp % 40) / 100 : null, ingBrutos: ing * 1.06, costoProd: 0, ventasPend: 0, ventasRech: 0, ventasReemb: 0, ingReemb: 0, ingPend: 0, registros: 0, impuesto: g * .1215, ...extra }
}
export const fmt = (k, v) => { const t = CM[k]?.[4]; if (v == null || v === '' || (typeof v === 'number' && !isFinite(v))) return 'N/A'; if (t === 'm') return usd(v); if (t === 'p') return (v * 100).toFixed(2) + '%'; if (t === 'x') return (+v).toFixed(2); if (t === 'n') return Math.round(v).toLocaleString('es'); return v }

/* ---------- UI helpers ---------- */
function Tip({ text, children }) {
  const [o, setO] = useState(false)
  return <span className="fbx-tip" onMouseEnter={() => setO(true)} onMouseLeave={() => setO(false)}>{children || <Info size={14} />}{o && text && <span className="fbx-tipb">{text}</span>}</span>
}
function Drop({ value, options, onChange, label }) {
  const [o, setO] = useState(false); const r = useRef(); useOutside(r, () => setO(false))
  return <div className="fbx-dd" ref={r}><button className={'fbx-in fbx-sel' + (o ? ' on' : '')} onClick={() => setO(!o)}><span>{label ?? (options.find(x => x[0] === value)?.[1] || 'Seleccione una opción')}</span><ChevronDown size={15} /></button>
    {o && <div className="fbx-menu">{options.map(([k, l]) => <button key={k} className={k === value ? 'on' : ''} disabled={k === ''} onClick={() => { onChange(k); setO(false) }}>{l}</button>)}</div>}</div>
}
function Multi({ all, value, onChange, allLabel }) {
  const [o, setO] = useState(false); const r = useRef(); useOutside(r, () => setO(false))
  const sel = value ?? all; const full = sel.length === all.length
  return <div className="fbx-dd" ref={r}><button className={'fbx-in fbx-sel' + (o ? ' on' : '')} onClick={() => setO(!o)}><span>{full ? 'Cualquiera' : sel.length ? sel.join(', ') : 'Ninguno'}</span><ChevronDown size={15} /></button>
    {o && <div className="fbx-menu chk"><label><input type="checkbox" checked={full} onChange={() => onChange(full ? [] : null)} />{allLabel}</label>
      {all.map(x => <label key={x}><input type="checkbox" checked={sel.includes(x)} onChange={() => { const n = sel.includes(x) ? sel.filter(y => y !== x) : [...sel, x]; onChange(n.length === all.length ? null : n) }} />{x}</label>)}</div>}</div>
}
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
function DateTime({ value, onChange, ph = 'dd/mm/aaaa hh:mm' }) {
  const [o, setO] = useState(false); const r = useRef(); useOutside(r, () => setO(false))
  const now = new Date(); const [cur, setCur] = useState(value ? new Date(value) : now); const v = value ? new Date(value) : null
  const y = cur.getFullYear(), mo = cur.getMonth(); const first = new Date(y, mo, 1).getDay(); const days = Array.from({ length: 42 }, (_, i) => new Date(y, mo, i - first + 1))
  const [h, setH] = useState(v ? v.getHours() : 0), [mi, setMi] = useState(v ? v.getMinutes() : 0)
  const put = d => { const n = new Date(d); n.setHours(h, mi, 0, 0); onChange(n.toISOString()) }
  const txt = v ? `${String(v.getDate()).padStart(2, '0')}/${String(v.getMonth() + 1).padStart(2, '0')}/${v.getFullYear()} ${String(v.getHours()).padStart(2, '0')}:${String(v.getMinutes()).padStart(2, '0')}` : ''
  return <div className="fbx-dd" ref={r}><input readOnly className={'fbx-in' + (o ? ' on' : '')} value={txt} placeholder={ph} onClick={() => setO(true)} />
    {o && <div className="fbx-cal"><div className="hd"><button onClick={() => setCur(new Date(y, mo - 1, 1))}><ChevronLeft size={18} /></button>
      <select value={mo} onChange={e => setCur(new Date(y, +e.target.value, 1))}>{MESES.map((m, i) => <option key={m} value={i}>{m}</option>)}</select><input type="number" value={y} onChange={e => setCur(new Date(+e.target.value || y, mo, 1))} />
      <button onClick={() => setCur(new Date(y, mo + 1, 1))}><ChevronRight size={18} /></button></div>
      <div className="gr">{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => <b key={d}>{d}</b>)}
        {days.map(d => { const out = d.getMonth() !== mo; const today = d.toDateString() === now.toDateString(); const s = v && d.toDateString() === v.toDateString()
          return <button key={+d} className={(out ? 'out ' : '') + (today ? 'today ' : '') + (s ? 'sel' : '')} onClick={() => put(d)}>{d.getDate()}</button> })}</div>
      <div className="tm"><input type="number" min="0" max="23" value={String(h).padStart(2, '0')} onChange={e => { const n = Math.min(23, Math.max(0, +e.target.value || 0)); setH(n); if (v) { const d = new Date(v); d.setHours(n); onChange(d.toISOString()) } }} />:<input type="number" min="0" max="59" value={String(mi).padStart(2, '0')} onChange={e => { const n = Math.min(59, Math.max(0, +e.target.value || 0)); setMi(n); if (v) { const d = new Date(v); d.setMinutes(n); onChange(d.toISOString()) } }} /></div></div>}</div>
}
function Mod({ title, sub, onClose, children, foot, w = 980, h }) {
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  return <div className="fbx-ov" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="fbx-m" style={{ width: w, height: h }}>
    <div className="fbx-mh"><div><h3>{title}</h3>{sub && <p>{sub}</p>}</div><button onClick={onClose}><X size={20} /></button></div>
    <div className="fbx-mb">{children}</div>{foot && <div className="fbx-mf">{foot}</div>}</div></div>
}
export const ago = t => { const s = Math.floor((Date.now() - t) / 1000); if (s < 10) return 'hace unos segundos'; if (s < 60) return `hace ${Math.floor(s / 10) * 10} segundos`; const m = Math.floor(s / 60); if (m < 60) return `hace ${m} minuto${m > 1 ? 's' : ''}`; const h = Math.floor(m / 60); return `hace ${h} hora${h > 1 ? 's' : ''}` }

/* ---------- Página ---------- */
export default function Facebook() {
  const toast = useToast()
  const [tab, setTab] = useStore('fbx_tab', 'camp')
  const [data, setData] = useStore('fbx_data', null)
  const [cols, setCols] = useStore('fbx_cols', DEF_ORDER)
  const [adv, setAdv] = useStore('fbx_adv', { skipUnselected: false })
  const [upd, setUpd] = useStore('fbx_upd', Date.now())
  const [st, setSt] = useState({}); const [sort, setSort] = useState({ k: null, dir: -1 }); const [ed, setEd] = useState(null); const [bp, setBp] = useState(null); const [, tick] = useState(0)
  const [sel, setSel] = useState({ acc: [], camp: [], set: [], ad: [] })
  const [menu, setMenu] = useState(false); const [modal, setModal] = useState(null); const [folded, setFolded] = useState(false); const [spin, setSpin] = useState(false)
  const mref = useRef(); useOutside(mref, () => setMenu(false))
  useEffect(() => { const t = setInterval(() => tick(x => x + 1), 10000); return () => clearInterval(t) }, [])
  const F = st[tab] || {}; const setF = p => setSt(s => ({ ...s, [tab]: { ...(s[tab] || { status: 'any', period: 'today' }), ...p } }))
  const status = F.status ?? 'any', period = F.period ?? 'today', name = F.name || ''
  const [T, Tl, TI, ent, plural] = TABS.find(t => t[0] === tab)
  const d = data || { acc: [], camps: [], sets: [], ads: [], products: [] }
  const accNames = d.acc.map(a => a.name), prods = d.products
  const f = PF[period] || 1

  const rows = useMemo(() => {
    const accOk = x => !F.accs || F.accs.includes(d.acc.find(a => a.id === x.acc)?.name)
    const prodOk = x => !F.prods || F.prods.includes(x.prod)
    const parentOk = x => { if (tab === 'set' && sel.camp.length) return sel.camp.includes(x.camp); if (tab === 'ad') { if (sel.set.length) return sel.set.includes(x.set); if (sel.camp.length) return sel.camp.includes(x.camp) } if (tab !== 'acc' && sel.acc.length) return sel.acc.includes(x.acc); return true }
    const now = new Date(upd).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    const base = x => ({ ultAct: now, id: x.id, creacion: x.created ? new Date(x.created).toLocaleDateString('es-PE') : null, distribucion: x.status === 'ACTIVE' ? 'Activa' : 'Desactivada', ca: d.acc.find(a => a.id === x.acc)?.name })
    let list
    if (tab === 'acc') list = d.acc.map(a => { const ms = d.camps.filter(c => c.acc === a.id).map(c => c.m); const m = ms.reduce((s, x) => Object.fromEntries(Object.keys(x).map(k => [k, (s[k] || 0) + x[k]])), {})
      const b = d.camps.filter(c => c.acc === a.id && c.status === 'ACTIVE').reduce((s, c) => s + c.budget, 0)
      return { ...a, prod: null, row: calc(m, f, { ...base({ ...a, acc: a.id }), ciclo: a.ciclo, tarjeta: a.card, estadoCuenta: ({ ACTIVE: 'Activa', PENDING: 'Pago pendiente' })[a.status] || 'Deshabilitada', totalGastado: a.total, presupuesto: b, limiteOferta: null, gastoMin: null, gastoMax: null, ca: a.name }) } })
    else { const src = tab === 'camp' ? d.camps : tab === 'set' ? d.sets : d.ads
      list = src.filter(x => accOk(x) && prodOk(x) && parentOk(x)).map(x => ({ ...x, row: calc(x.m, f, { ...base(x), presupuesto: x.budget ?? null, limiteOferta: x.budget ? x.budget * .35 : null, gastoMin: x.budget ? x.budget * .5 : null, gastoMax: x.budget ? x.budget * 1.5 : null }) })) }
    list = list.filter(x => x.name.toLowerCase().includes(name.toLowerCase()) && (status === 'any' || status === '' || x.status === status))
    if (sort.k) { const g = x => sort.k === 'name' ? x.name : sort.k === 'status' ? x.status : (x.row[sort.k] ?? -Infinity); list = [...list].sort((a, b) => (g(a) > g(b) ? 1 : g(a) < g(b) ? -1 : 0) * sort.dir) }
    return list
  }, [data, tab, st, f, adv, sel, upd, sort])

  const shown = cols.filter(k => CM[k] && (tab === 'acc' || !ACC_ONLY.includes(k)))
  const tot = useMemo(() => { const s = {}; ['gastos', 'ingresos', 'ventas', 'imp', 'clics', 'ic', 'presupuesto', 'ciclo', 'totalGastado', 'conv', 'vistas', 'ventasInd', 'ventasTot', 'ingBrutos', 'impuesto', 'costoProd', 'ventasPend', 'ventasRech', 'ventasReemb', 'ingReemb', 'ingPend', 'registros', 'limiteOferta', 'gastoMin', 'gastoMax'].forEach(k => s[k] = rows.reduce((a, r) => a + (+r.row[k] || 0), 0))
    const dv = (a, b) => b ? a / b : null
    return { ...s, ganancia: s.ingresos - s.gastos, roas: dv(s.ingresos, s.gastos), margen: dv(s.ingresos - s.gastos, s.ingresos), roi: dv(s.ingresos - s.gastos, s.gastos), cpa: dv(s.gastos, s.ventas), cpi: dv(s.gastos, s.ic), cpc: dv(s.gastos, s.clics), ctr: dv(s.clics, s.imp), cpm: dv(s.gastos * 1000, s.imp), cpv: dv(s.gastos, s.vistas), costoConv: dv(s.gastos, s.conv), arpu: dv(s.ingresos, s.ventas) } }, [rows])
  const totVal = k => { const t = CM[k][4]; if (t === 't') return 'N/A'; if (['presupuesto', 'ciclo', 'totalGastado', 'gastos', 'ingresos', 'ganancia', 'ingBrutos', 'impuesto', 'costoProd', 'ingReemb', 'ingPend', 'limiteOferta', 'gastoMin', 'gastoMax'].includes(k)) return usd(tot[k]); if (t === 'n') return fmt(k, tot[k] || 0); return fmt(k, tot[k]) }

  const refresh = () => { setSpin(true); setTimeout(() => { setSpin(false); setUpd(Date.now()); toast(data ? 'Datos actualizados' : 'No hay cuentas de anuncios conectadas', data ? 'ok' : 'info') }, 900) }
  const connect = () => { setData(demo()); setUpd(Date.now()); setModal(null); toast('Cuenta de Meta conectada') }
  const toggle = (x, on) => { const key = tab === 'camp' ? 'camps' : tab === 'set' ? 'sets' : 'ads'; setData(D => ({ ...D, [key]: D[key].map(y => y.id === x.id ? { ...y, status: on ? 'ACTIVE' : 'PAUSED' } : y) })); toast(`${ent} ${on ? 'activado' : 'pausado'}`) }
  const S = sel[tab]; const setS = v => setSel(s => ({ ...s, [tab]: v }))
  const exportCsv = () => downloadCSV(`${plural}.csv`, [[ent, ...shown.map(k => CM[k][2])], ...rows.map(r => [r.name, ...shown.map(k => fmt(k, r.row[k]))])])
  const nameHdr = tab === 'acc' ? 'Cuenta' : ent
  const pl = (n, a, b) => `${n} ${n === 1 ? a : b}`
  const tabLabel = (k, l) => { if (k === 'camp' && sel.acc.length) return 'Camp. de ' + pl(sel.acc.length, 'cuenta', 'cuentas')
    if (k === 'set') { if (sel.camp.length) return 'Conj. de ' + pl(sel.camp.length, 'campaña', 'campañas'); if (sel.acc.length) return 'Conj. de ' + pl(sel.acc.length, 'cuenta', 'cuentas') }
    if (k === 'ad') { if (sel.set.length) return 'Anun. de ' + pl(sel.set.length, 'conjunto', 'conjuntos'); if (sel.camp.length) return 'Anun. de ' + pl(sel.camp.length, 'campaña', 'campañas'); if (sel.acc.length) return 'Anun. de ' + pl(sel.acc.length, 'cuenta', 'cuentas') }
    return l }
  const anySel = Object.values(sel).some(v => v.length)
  const H = ({ k, children, cls = '' }) => <th className={cls + ' srt' + (sort.k === k ? ' on' : '')} onClick={() => setSort(s => ({ k, dir: s.k === k ? -s.dir : -1 }))}><span>{children}<ArrowUp size={12} className="ar" style={{ transform: sort.k === k && sort.dir < 0 ? 'rotate(180deg)' : '' }} /></span></th>
  const red = (k, v) => v != null && ((k === 'ganancia' || k === 'roi' || k === 'margen') ? v < 0 : k === 'roas' ? v < 1 : false)
  const cell = (k, v) => k === 'ganancia' && v < 0 ? '$ -' + usd(-v).slice(1) : k === 'roas' && v != null ? (+v).toFixed(2).replace('.', ',') : fmt(k, v)

  return <div className="fbx">
    <div className="fbx-tabs">{TABS.map(([k, l, I]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); setMenu(false); setSort({ k: null, dir: -1 }) }}><I size={20} strokeWidth={1.8} /><span className="lb">{tabLabel(k, l)}</span>
      {sel[k].length > 0 && <span className="fbx-sc" onClick={e => { e.stopPropagation(); setSel(s => ({ ...s, [k]: [] })) }}>{sel[k].length} {sel[k].length === 1 ? 'ítem' : 'ítems'}<X size={14} strokeWidth={2.4} /></span>}</button>)}</div>
    <div className="fbx-panel">
      <div className="fbx-bar">
        <div className="fbx-ib" ref={mref}><button title="Configuración" className={menu ? 'on' : ''} onClick={() => setMenu(!menu)}><Settings size={17} /></button><button title="Exportar" onClick={exportCsv}><ArrowUp size={17} /></button><button title="Diagnóstico" onClick={() => setModal('diag')}><Activity size={17} /></button>{anySel && <a className="fbx-gestor" href="https://adsmanager.facebook.com/adsmanager/manage/campaigns" target="_blank" rel="noreferrer"><LayoutGrid size={16} />Abrir en Gestor</a>}<button title={folded ? 'Mostrar filtros' : 'Ocultar filtros'} onClick={() => setFolded(!folded)}><ChevronDown size={17} style={{ transform: folded ? 'rotate(180deg)' : '' }} /></button>
          {menu && <div className="fbx-menu" style={{ top: 44, width: 230 }}><button onClick={() => { setMenu(false); setModal('cols') }}><Columns2 size={16} />Personalizar Columnas</button><button onClick={() => { setMenu(false); setModal('adv') }}><SlidersHorizontal size={16} />Configuración Avanzada</button></div>}</div>
        <span className="fbx-chip"><CircleCheck size={12} strokeWidth={2.6} />Todas las ventas rastreadas</span>
        <span style={{ marginLeft: 'auto' }} className="fbx-upd">Actualizado {ago(upd)}</span>
        <button className="fbx-btn" onClick={refresh} disabled={spin}>{spin ? <Loader2 size={16} className="spin" /> : 'Actualizar'}</button></div>
      {!folded && <div className="fbx-filters">
        <div><label>Nombre de {nameHdr}</label><input className="fbx-in" value={name} onChange={e => setF({ name: e.target.value })} placeholder="Filtrar por nombre" /></div>
        <div><label>Estado del {nameHdr}</label><Drop value={status} options={STATES} onChange={v => setF({ status: v })} /></div>
        <div className="w"><label>Período de Visualización <Tip text="Las métricas de Meta se muestran en la zona horaria de la cuenta de anuncios; las ventas, en la zona horaria de su empresa." /></label><Drop value={period} options={PERIODS} onChange={v => setF({ period: v })} />
          {period === 'custom' && <div className="fbx-range"><DateTime value={F.from} onChange={v => setF({ from: v })} ph="Desde: dd/mm/aaaa hh:mm" /><DateTime value={F.to} onChange={v => setF({ to: v })} ph="Hasta: dd/mm/aaaa hh:mm" /></div>}</div>
        <div className="w"><label>Cuenta de Anuncio</label><Multi all={accNames} value={F.accs ?? null} onChange={v => setF({ accs: v })} allLabel="Seleccionar Todo" /></div>
        <div><label>Producto</label><Multi all={prods} value={F.prods ?? null} onChange={v => setF({ prods: v })} allLabel="Seleccionar todos" /></div>
      </div>}
      <div className="fbx-tw"><table className="fbx-t"><thead><tr>
        {tab !== 'acc' && <><th className="ck"><input type="checkbox" checked={!!rows.length && S.length === rows.length} onChange={e => setS(e.target.checked ? rows.map(r => r.id) : [])} /></th><H k="status">Estado</H></>}
        <H k="name" cls="nm">{tab === 'acc' ? 'Cuenta' : ent}</H>
        {shown.map(k => <H key={k} k={k} cls={CM[k][4] === 't' ? '' : 'r'}>{CM[k][3]}{CM[k][6] && <Tip text={CM[k][6]} />}</H>)}</tr></thead>
        <tbody>
          {rows.map(r => <tr key={r.id} className={(S.includes(r.id) ? 'sel' : '') + (tab === 'camp' ? ' tall' : '')}>
            {tab !== 'acc' && <><td className="ck"><input type="checkbox" checked={S.includes(r.id)} onChange={e => setS(e.target.checked ? [...S, r.id] : S.filter(x => x !== r.id))} /></td><td className="swc"><Switch on={r.status === 'ACTIVE'} onChange={v => toggle(r, v)} /></td></>}
            <td className={'nm' + (tab === 'camp' ? ' wrap' : '')}><span className="fbx-name" title={r.name} onClick={() => { const nx = { acc: 'camp', camp: 'set', set: 'ad' }[tab]; if (nx) { setSel(s => ({ ...s, [tab]: [r.id] })); setTab(nx) } }}>{tab === 'camp' && <i className={'fbx-dot' + (r.status === 'ACTIVE' && r.row.ganancia >= 0 ? ' g' : '')} />}{r.name}</span>{tab !== 'acc' && <button className="fbx-pen" title="Editar nombre" onClick={() => setEd({ id: r.id, k: 'name', v: r.name })}><Pencil size={13} /></button>}{r.status === 'RESTRICTED' && <small>Con restricciones</small>}</td>
            {shown.map(k => <td key={k} className={(CM[k][4] === 't' ? '' : 'r') + (red(k, r.row[k]) ? ' neg' : '') + (k === 'ganancia' && r.row[k] > 0 ? ' pos' : '')}>{k === 'estadoCuenta' ? fmt(k, r.row[k])
              : k === 'presupuesto' && r.row[k] != null && tab !== 'acc' ? <span className="fbx-bud"><small>Diario</small><span><button className="fbx-pen" title="Editar presupuesto" onClick={e => { const b = e.currentTarget.closest('td').getBoundingClientRect(); setBp({ id: r.id, v: '$' + (+r.budget).toFixed(2), x: Math.min(b.left, innerWidth - 260), y: b.bottom + 4 }) }}><Pencil size={13} /></button>{usd(r.row[k])}</span></span> : cell(k, r.row[k])}</td>)}</tr>)}
        </tbody>
        <tfoot><tr className="tot">{tab !== 'acc' && <><td className="ck">N/A</td><td>N/A</td></>}<td className="nm">{rows.length} {(rows.length === 1 ? (tab === 'acc' ? 'cuenta' : ent) : plural).toUpperCase()}</td>{shown.map(k => <td key={k} className={(CM[k][4] === 't' ? '' : 'r') + (red(k, tot[k]) ? ' neg' : '')}>{k === 'ganancia' || k === 'roas' ? (tot[k] == null ? 'N/A' : cell(k, tot[k])) : totVal(k)}</td>)}</tr></tfoot></table></div>
    </div>
    <div className="fbx-why"><span>¿Por qué no aparecen {plural}?</span><Tip text={data ? `Revise los filtros: estado, período, cuenta de anuncio y producto. ${adv.skipUnselected ? 'La opción "No buscar datos de campañas no seleccionadas" está activa.' : ''}` : 'Aún no hay ninguna cuenta de anuncios de Meta conectada. Conecte su perfil para importar cuentas, campañas, conjuntos y anuncios.'} />
      {!data ? <button className="fbx-link" onClick={() => setModal('connect')}>Conectar cuenta de Meta</button> : <button className="fbx-link" style={{ color: 'var(--muted)' }} onClick={() => { setData(null); setSel({ acc: [], camp: [], set: [], ad: [] }); toast('Cuenta desconectada', 'info') }}>Desconectar</button>}</div>

    {bp && <><div style={{ position: 'fixed', inset: 0, zIndex: 499 }} onClick={() => setBp(null)} /><div className="fbx-pop" style={{ left: bp.x, top: Math.min(bp.y, innerHeight - 140) }}>
      <div className="r"><label>Diario</label><input autoFocus value={bp.v} onChange={e => setBp({ ...bp, v: e.target.value })} onKeyDown={e => e.key === 'Escape' && setBp(null)} /></div>
      <div className="b"><button className="c" onClick={() => setBp(null)}>Cancelar</button><button className="p" onClick={() => { const v = parseFloat(String(bp.v).replace(/[^\d.,]/g, '').replace(',', '.')); if (!(v > 0)) return toast('Ingrese un valor válido', 'err'); const key = tab === 'camp' ? 'camps' : 'sets'; setData(D => ({ ...D, [key]: D[key].map(y => y.id === bp.id ? { ...y, budget: v } : y) })); setBp(null); toast('Presupuesto publicado') }}>Publicar</button></div></div></>}
    {ed && <Mod title={ed.k === 'name' ? 'Editar nombre' : 'Diario'} w={420} onClose={() => setEd(null)} foot={<><button className="fbx-btn g" onClick={() => setEd(null)}>Cancelar</button><button className="fbx-btn" onClick={() => { const key = tab === 'camp' ? 'camps' : tab === 'set' ? 'sets' : 'ads'; let v = ed.v; if (ed.k === 'budget') { v = parseFloat(String(v).replace(',', '.')); if (!(v > 0)) return toast('Ingrese un valor válido', 'err') } else if (!v.trim()) return; setData(D => ({ ...D, [key]: D[key].map(y => y.id === ed.id ? { ...y, [ed.k]: v } : y) })); setEd(null); toast(ed.k === 'name' ? 'Nombre actualizado' : 'Presupuesto actualizado') }}>Guardar</button></>}>
      <div className="fbx-money">{ed.k === 'budget' && <span>$</span>}<input autoFocus className="fbx-in" value={ed.v} onChange={e => setEd({ ...ed, v: e.target.value })} inputMode={ed.k === 'budget' ? 'decimal' : 'text'} /></div></Mod>}
    {modal === 'cols' && <ColsModal cols={cols} onClose={() => setModal(null)} onSave={c => { setCols(c); setModal(null); toast('Columnas guardadas') }} first={nameHdr} />}
    {modal === 'adv' && <AdvModal adv={adv} onClose={() => setModal(null)} onSave={a => { setAdv(a); setModal(null); toast('Configuración guardada') }} />}
    {modal === 'diag' && <Diag data={data} onClose={() => setModal(null)} />}
    {modal === 'connect' && <Mod title="Conectar con Meta" sub="Autorice el acceso de lectura a sus cuentas de anuncios." w={460} onClose={() => setModal(null)} foot={<><button className="fbx-btn g" onClick={() => setModal(null)}>Cancelar</button><button className="fbx-btn" onClick={connect}>Continuar con Facebook</button></>}>
      <p style={{ fontSize: 14, color: 'var(--soft)', lineHeight: 1.6, padding: '4px 0 8px' }}>Se abrirá la autorización de Meta. Tras iniciar sesión podrá elegir qué cuentas de anuncios usar. En esta demo se cargan datos de ejemplo.</p></Mod>}
  </div>
}

function ColsModal({ cols, onClose, onSave, first }) {
  const [c, setC] = useState(cols); const [q, setQ] = useState(''); const [drag, setDrag] = useState(null)
  const list = COLS.filter(x => x[1].toLowerCase().includes(q.toLowerCase()))
  return <Mod title="Personaliza las columnas" sub="Elige cómo quieres ver las columnas en la tabla." onClose={onClose} h="min(860px,94vh)"
    foot={<><button className="fbx-btn g" onClick={onClose}>Cancelar</button><button className="fbx-btn" onClick={() => onSave(c)}>Guardar</button></>}>
    <div className="fbx-cols"><div className="l"><div className="s"><Search size={15} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por columna" autoFocus /></div>
      <div className="sc">{list.map(x => <label key={x[0]} className={c.includes(x[0]) ? 'on' : ''}><input type="checkbox" checked={c.includes(x[0])} onChange={() => setC(c.includes(x[0]) ? c.filter(y => y !== x[0]) : [...c, x[0]])} />{x[1]}</label>)}{!list.length && <div className="fbx-none">Ninguna columna encontrada.</div>}</div></div>
      <div className="r"><div className="it fx">{first}</div>
        {c.map((k, i) => <div key={k} className={'it' + (drag === k ? ' drag' : '')} draggable onDragStart={() => setDrag(k)} onDragEnd={() => setDrag(null)} onDragOver={e => { e.preventDefault(); if (drag && drag !== k) { const a = c.filter(x => x !== drag); a.splice(i, 0, drag); setC(a) } }}>
          <GripVertical size={15} className="g" />{CM[k][2]}<button onClick={() => setC(c.filter(x => x !== k))}><X size={15} /></button></div>)}
        {!c.length && <div className="fbx-none">Seleccione columnas a la izquierda.</div>}</div></div>
  </Mod>
}
function AdvModal({ adv, onClose, onSave }) {
  const [a, setA] = useState(adv)
  return <Mod title="Configuraciones avanzadas" sub="Controle cómo la navegación entre pestañas afecta la búsqueda." w={770} h={548} onClose={onClose} foot={<><button className="fbx-btn g" onClick={onClose}>Cancelar</button><button className="fbx-btn" onClick={() => onSave(a)}>Guardar</button></>}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}><span style={{ fontSize: 14, color: 'var(--soft)' }}>No buscar datos de campañas no seleccionadas</span><Tip text="Al activar, las pestañas Conjuntos y Anuncios solo muestran datos de las campañas (o conjuntos) que seleccionó en la pestaña anterior." /><span style={{ marginLeft: 'auto' }}><Toggle on={a.skipUnselected} onChange={v => setA({ ...a, skipUnselected: v })} /></span></div></Mod>
}
function Diag({ data, onClose }) {
  const [step, setStep] = useState(0); const [res, setRes] = useState(null)
  const start = () => { setStep(1); setTimeout(() => { const ads = (data?.ads || []).filter(a => a.status === 'ACTIVE'); setRes(ads.map((a, i) => ({ name: a.name, ok: i % 3 !== 1 }))); setStep(2) }, 1800) }
  return <Mod title="Diagnóstico" w={410} onClose={onClose}>
    {step === 0 && <><p className="fbx-dp">Analice sus campañas activas e identifique qué anuncios no tienen la configuración correcta de parámetros UTM.</p>
      <div className="fbx-dr"><i style={{ background: 'rgba(0,90,227,.16)', color: '#4d94ff' }}><Zap size={16} /></i><div><b>Rápido</b><span>Análisis en segundos</span></div></div>
      <div className="fbx-dr"><i style={{ background: 'rgba(34,197,94,.14)', color: '#4ade80' }}><Lock size={16} /></i><div><b>Seguro</b><span>No afecta campañas</span></div></div>
      <div style={{ textAlign: 'center', padding: '18px 0 6px' }}><button className="fbx-btn" style={{ width: 132 }} onClick={start}>Iniciar</button></div></>}
    {step === 1 && <div style={{ textAlign: 'center', padding: '30px 0' }}><Loader2 size={30} className="spin" color="#005ae3" /><p className="fbx-dp" style={{ textAlign: 'center', marginTop: 14 }}>Analizando anuncios activos…</p></div>}
    {step === 2 && <>{!res.length ? <p className="fbx-dp" style={{ textAlign: 'center', padding: '18px 0' }}>No se encontraron anuncios activos para analizar.</p>
      : <><p className="fbx-dp">{res.filter(r => !r.ok).length ? `${res.filter(r => !r.ok).length} de ${res.length} anuncios sin parámetros UTM correctos.` : 'Todos los anuncios tienen los parámetros UTM correctos.'}</p>
        <div style={{ maxHeight: 260, overflowY: 'auto' }}>{res.map((r, i) => <div key={i} className="fbx-dr" style={{ marginBottom: 8 }}><i style={{ background: r.ok ? 'rgba(34,197,94,.14)' : 'rgba(239,68,68,.14)', color: r.ok ? '#4ade80' : '#f87171' }}>{r.ok ? <CircleCheck size={16} /> : <X size={16} />}</i><div><b style={{ fontSize: 13.5 }}>{r.name}</b><span>{r.ok ? 'UTM correctos' : 'Faltan utm_source / utm_campaign'}</span></div></div>)}</div></>}
      <div style={{ textAlign: 'center', padding: '16px 0 6px' }}><button className="fbx-btn" style={{ width: 132 }} onClick={() => { setStep(0); setRes(null) }}><RefreshCw size={14} />De nuevo</button></div></>}
  </Mod>
}
