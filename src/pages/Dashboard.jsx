import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, DollarSign, ShoppingBag, Trophy, CircleCheck, ShoppingCart, Gem, Megaphone, RotateCcw, BookmarkPlus, RefreshCw, Settings, Filter, Download, Plus, CreditCard, X, UserCheck, Clock, MessageSquareOff, Minus, Trash2, Award } from 'lucide-react'
import { useStore, Modal, useToast, uid, downloadCSV, Confirm } from '../ui'
import { Seg, Kpi, Section, EmptyBox, PeriodSelect, MultiSelect, CurrencySelect, IconGroup, LineChart, BarChart, Heatmap, InfoTip, fmtMoney, ddmm } from './dash/parts'

const pad = n => String(n).padStart(2, '0')
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/* rango [desde, hasta) y puntos del gráfico según el período */
function usePeriod(period, range) {
  return useMemo(() => {
    const now = new Date(); const day0 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let from, to, hourly = false
    if (period === 'today') { from = day0; to = new Date(+day0 + 864e5); hourly = true }
    else if (period === 'yesterday') { from = new Date(+day0 - 864e5); to = day0; hourly = true }
    else if (period === 'month') { from = new Date(now.getFullYear(), now.getMonth(), 1); to = new Date(+day0 + 864e5) }
    else if (period === 'custom') { from = new Date(range[0] + 'T00:00'); to = new Date(+new Date(range[1] + 'T00:00') + 864e5); hourly = +to - +from <= 864e5 }
    else { const n = +period; from = new Date(+day0 - (n - 1) * 864e5); to = new Date(+day0 + 864e5) }
    const buckets = hourly ? Array.from({ length: 24 }, (_, h) => new Date(+from + h * 36e5)) : Array.from({ length: Math.max(1, Math.round((to - from) / 864e5)) }, (_, i) => new Date(+from + i * 864e5))
    const idx = d => hourly ? Math.floor((d - from) / 36e5) : Math.floor((d - from) / 864e5)
    return { from, to, hourly, buckets, idx }
  }, [period, range[0], range[1]])
}

export default function Dashboard() {
  const toast = useToast(); const nav = useNavigate()
  const [tab, setTab] = useStore('dash_tab', 'ventas')
  const [banner, setBanner] = useStore('banner', true)
  const [sales, setSales] = useStore('sales', [])
  const [contacts] = useStore('contacts', [])
  const [chats] = useStore('chats', [])
  const [conns] = useStore('connections', [])
  const [cur, setCur] = useStore('currency', 'PEN')
  const [period, setPeriod] = useStore('dash_period', 'today')
  const [range, setRange] = useState(() => { const d = iso(new Date()); return [d, d] })
  const [selConn, setSelConn] = useState([]); const [selProd, setSelProd] = useState([])
  const [saved, setSaved] = useStore('dash_saved', null)
  const [modal, setModal] = useState(null); const [del, setDel] = useState(null)
  const [, setTick] = useState(0)
  const P = usePeriod(period, range)

  const connNames = useMemo(() => [...new Set([...conns.map(c => c.name).filter(Boolean), ...sales.map(s => s.instance).filter(Boolean)])], [conns, sales])
  const prodNames = useMemo(() => [...new Set(sales.map(s => s.product).filter(Boolean))], [sales])
  const inP = d => { const t = new Date(d); return t >= P.from && t < P.to }
  const fs = sales.filter(s => inP(s.date) && (!selConn.length || selConn.includes(s.instance)) && (!selProd.length || selProd.includes(s.product)))

  const reset = () => { setPeriod('today'); setSelConn([]); setSelProd([]); toast('Filtros restablecidos') }
  const save = () => { setSaved({ period, selConn, selProd, cur }); toast('Filtros guardados') }
  const refresh = () => { setTick(t => t + 1); toast('Datos actualizados') }
  useEffect(() => { if (saved) { setPeriod(saved.period); setSelConn(saved.selConn || []); setSelProd(saved.selProd || []) } }, [])

  const h = new Date().getHours()
  const greet = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'

  return <div className="db">
    <div className="db-card db-hero">
      <div style={{ minWidth: 0 }}>
        <h1>{greet}, Pablo Monja Suclupe! <span style={{ fontSize: 17 }}>{h < 19 ? '☀️' : '🌙'}</span></h1>
        <p>Operación <a href="#" onClick={e => { e.preventDefault(); nav('/settings') }}>Empresa Pablo Monja Suclupe</a> • <b>{contacts.length}</b> leads acumulados</p>
      </div>
      <button className="db-ghost" style={{ marginLeft: 'auto' }} onClick={() => setModal('huella')}><Trophy size={15} />Huella del Depredador</button>
    </div>

    {banner && <div className="db-banner" onClick={() => setModal('partner')}>
      <img src="/leona-banner.png" alt="Torne-se nosso parceiro" />
      <button className="x" onClick={e => { e.stopPropagation(); setBanner(false) }} title="Cerrar"><X size={13} /></button>
    </div>}

    <div className="db-sub">
      <div style={{ minWidth: 0 }}>
        <div className="t"><CreditCard size={17} />Suscripción inactiva</div>
        <div className="d">Su suscripción está inactiva. Contrate un plan para empezar a usar el servicio.</div>
      </div>
      <button className="db-btn" style={{ marginLeft: 'auto', alignSelf: 'flex-start', marginTop: 15 }} onClick={() => setModal('assinar')}>Contratar ahora</button>
    </div>

    <div className="db-card db-filter">
      <Seg value={tab} onChange={setTab} options={[['ventas', 'Ventas'], ['atencion', 'Atención']]} />
      <PeriodSelect value={period} onChange={setPeriod} range={range} setRange={setRange} />
      <MultiSelect allLabel="Todas las conexiones" header="Conexión" items={connNames} value={selConn} onChange={setSelConn} width={208} />
      {tab === 'ventas' && <MultiSelect allLabel="Todos los productos" header="Producto" items={prodNames} value={selProd} onChange={setSelProd} width={210} />}
      <span style={{ marginLeft: 'auto' }} />
      {tab === 'ventas' && <CurrencySelect value={cur} onChange={setCur} />}
      <IconGroup items={[[RotateCcw, 'Restablecer filtros', reset], [BookmarkPlus, 'Guardar filtros', save], [RefreshCw, 'Actualizar', refresh, true], ...(tab === 'ventas' ? [[Settings, 'Configurar métricas', () => setModal('cfg')]] : [])]} />
    </div>

    {tab === 'ventas'
      ? <Ventas P={P} fs={fs} cur={cur} contacts={contacts} inP={inP} onNew={() => setModal('sale')} onDel={setDel} />
      : <Atencion P={P} chats={chats} contacts={contacts} inP={inP} />}

    <Assinar open={modal === 'assinar'} onClose={() => setModal(null)} />
    <NewSale open={modal === 'sale'} onClose={() => setModal(null)} conns={connNames} cur={cur} onSave={s => { setSales(l => [s, ...l]); toast('Venta registrada') }} />
    <Modal open={modal === 'huella'} onClose={() => setModal(null)} title="Huella del Depredador" sub="Tus logros dentro de Leona" icon={<Award size={18} />}>
      {[['Primer lead', contacts.length, 1], ['Primera venta', sales.length, 1], ['100 leads', contacts.length, 100], ['PEN 10.000 facturados', sales.reduce((a, s) => a + +s.value || 0, 0), 10000]].map(([t, v, g]) =>
        <div key={t} style={{ marginBottom: 12 }}><div style={{ display: 'flex', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t}<span style={{ marginLeft: 'auto', color: 'var(--muted)' }}>{Math.min(100, Math.round(v / g * 100))}%</span></div>
          <div style={{ height: 6, borderRadius: 6, background: 'var(--deep)' }}><div style={{ height: '100%', width: Math.min(100, v / g * 100) + '%', background: 'var(--p)', borderRadius: 6 }} /></div></div>)}
    </Modal>
    <Modal open={modal === 'partner'} onClose={() => setModal(null)} title="Programa de afiliados" sub="Gana hasta 40% de comisión recurrente" icon={<Users size={18} />}
      footer={<><button className="btn btn-g" onClick={() => setModal(null)}>Cerrar</button><button className="btn btn-p" onClick={() => { navigator.clipboard?.writeText('https://leona.app/r/pablo'); toast('Enlace de afiliado copiado') }}>Copiar mi enlace</button></>}>
      <p style={{ fontSize: 13, color: 'var(--soft)', lineHeight: 1.6 }}>Recomienda Leona y recibe hasta el 40% de cada mensualidad pagada por tus referidos mientras sigan activos.</p>
    </Modal>
    <Modal open={modal === 'cfg'} onClose={() => setModal(null)} title="Configurar métricas" sub="Ajustes del panel de ventas" icon={<Settings size={18} />} footer={<button className="btn btn-p" onClick={() => { setModal(null); toast('Configuración guardada') }}>Guardar</button>}>
      <label style={{ fontSize: 12.5, color: 'var(--muted)' }}>Gasto en Meta Ads del período ({cur})</label>
      <AdSpend />
    </Modal>
    <Confirm open={!!del} onClose={() => setDel(null)} onOk={() => { setSales(s => s.filter(x => x.id !== del)); toast('Venta eliminada') }} title="Eliminar venta" />
  </div>
}

function AdSpend() { const [v, setV] = useStore('adspend', 0); return <input className="input" style={{ marginTop: 6 }} type="number" min="0" value={v} onChange={e => setV(+e.target.value || 0)} /> }

/* ======================= VENTAS ======================= */
function Ventas({ P, fs, cur, contacts, inP, onNew, onDel }) {
  const [mode, setMode] = useState('valor'); const [mode2, setMode2] = useState('valor')
  const [ad] = useStore('adspend', 0)
  const total = fs.reduce((a, s) => a + (+s.value || 0), 0)
  const leads = contacts.filter(c => c.created ? inP(c.created) : false).length
  const conv = leads ? fs.length / leads * 100 : 0
  const money = v => fmtMoney(v, cur)
  const series = P.buckets.map(() => ({ v: 0, n: 0 }))
  fs.forEach(s => { const i = P.idx(new Date(s.date)); if (series[i]) { series[i].v += +s.value || 0; series[i].n++ } })
  const labels = P.buckets.map(d => P.hourly ? `${ddmm(d)}, ${pad(d.getHours())}` : ddmm(d))
  const show = P.hourly ? (i => (i > 0 && i % 2 === 0 && i <= 20) || i === 23) : ((i, n) => n <= 12 || i % Math.ceil(n / 10) === 0 || i === n - 1)
  const hours = Array.from({ length: 15 }, (_, i) => i + 6)
  const hv = hours.map(hh => fs.filter(s => new Date(s.date).getHours() === hh).length)
  const byKey = k => Object.entries(fs.reduce((a, s) => { const key = s[k] || '—'; a[key] = (a[key] || 0) + (k === 'value' ? 0 : 1); return a }, {}))
  const byInst = byKey('instance')
  const factInst = Object.entries(fs.reduce((a, s) => { const key = s.instance || '—'; a[key] = (a[key] || 0) + (+s.value || 0); return a }, {}))
  const byState = Object.entries(fs.reduce((a, s) => { const key = s.state || 'Sin estado'; a[key] = (a[key] || 0) + 1; return a }, {}))
  const prods = Object.entries(fs.reduce((a, s) => { const key = s.product || '—'; a[key] = (a[key] || 0) + (mode2 === 'valor' ? +s.value || 0 : 1); return a }, {})).sort((a, b) => b[1] - a[1])

  return <>
    <div className="db-kpis">
      <Kpi icon={Users} color="#3b82f6" value={leads} label="Leads nuevos" tip="Contactos que entraron en el período." />
      <Kpi icon={DollarSign} color="#2dd4bf" value={money(total)} valueColor="#2dd4bf" label="Facturación" tip="Suma del valor de las ventas del período." />
      <Kpi icon={ShoppingBag} color="#a855f7" value={fs.length} label="Ventas" tip="Cantidad de ventas registradas." />
      <Kpi icon={Trophy} color="#f59e0b" value={(ad ? total / ad : 0).toFixed(2)} valueColor="#fbbf24" label="ROAS" tip="Facturación ÷ gasto en anuncios." />
      <Kpi icon={CircleCheck} color="#22c55e" value={conv.toFixed(2) + '%'} label="Tasa de conversión" tip="Ventas ÷ leads nuevos." />
      <Kpi icon={ShoppingCart} color="#a855f7" value={money(fs.length ? total / fs.length : 0)} label="Ticket promedio" tip="Facturación ÷ ventas." />
      <Kpi icon={Gem} color="#22c55e" value={money(total - ad)} valueColor="#22c55e" label="Beneficio" tip="Facturación − gasto en anuncios." />
      <Kpi icon={Megaphone} color="#ef4444" value={money(ad)} valueColor="#ef4444" label="Gasto Meta (Ad)" tip="Gasto en Meta Ads del período." extra={<span className="fbtn"><Filter size={13} /></span>} />
    </div>

    <div className="db-g21">
      <Section title="Ventas por período" sub="Histórico temporal de conversiones y facturación" style={{ height: 321 }}
        right={<Seg sm value={mode} onChange={setMode} options={[['valor', 'Valor'], ['cant', 'Cant.']]} />}>
        <LineChart labels={labels} showLabel={show} height={228} values={series.map(s => mode === 'valor' ? s.v : s.n)} color={mode === 'valor' ? '#2dd4bf' : '#8b5cf6'} name={mode === 'valor' ? 'Faturamento' : 'Vendas'} fmt={mode === 'valor' ? money : v => v} />
      </Section>
      <Section title="Ventas por horario" sub="Total de ventas del período filtrado, por hora del día" style={{ height: 321 }}>
        <BarChart labels={hours.map(x => pad(x) + 'h')} values={hv} height={228} />
      </Section>
    </div>

    <div className="db-g3">
      <Section title="Ventas por instancia" sub="Operaciones por conexión activa" style={{ height: 279 }}><Bars data={byInst} fmt={v => v} /></Section>
      <Section title="Facturación por instancia" sub="Ingresos por conexión activa" style={{ height: 279 }}><Bars data={factInst} fmt={money} color="#2dd4bf" /></Section>
      <Section title="Ventas por estado" sub="Distribución geográfica de las ventas" style={{ height: 279 }}><Bars data={byState} fmt={v => v} color="#f59e0b" /></Section>
    </div>

    <div className="db-g21">
      <Section title="Historial de ventas" sub="Auditoría y emisión fiscal de notas" style={{ minHeight: 281 }}
        right={<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 9, marginTop: -6 }}>
          <button className="db-btn" style={{ height: 28, fontSize: 12, padding: '0 12px' }} disabled={!fs.length} onClick={() => downloadCSV('ventas.csv', [['Instância', 'Nº do lead', 'Cliente', 'Produto', 'Valor', 'Moeda', 'Data'], ...fs.map(s => [s.instance, s.lead, s.client, s.product, s.value, s.currency, s.date])])}><Download size={13} />Exportar CSV</button>
          <button className="db-btn v" style={{ height: 30 }} onClick={onNew}><Plus size={15} />Nueva venta</button></div>}>
        <div className="db-tbl" style={{ marginTop: 16 }}><div className="sc"><table>
          <thead><tr>{['INSTÂNCIA', 'Nº DA INSTÂNCIA', 'Nº DO LEAD', 'NOMBRE DEL CLIENTE', 'PRODUCTO', 'ID', 'VALOR', 'MOEDA', 'SOURCE ID', 'DATA', 'NF', 'AÇÕES'].map(t => <th key={t}>{t}</th>)}</tr></thead>
          <tbody>{fs.length === 0 ? <tr><td colSpan={12} className="em" style={{ position: 'static', background: 'transparent' }}>Ninguna venta registrada en el historial del período.</td></tr>
            : fs.map(s => <tr key={s.id}><td>{s.instance || '—'}</td><td>{s.instNum || '—'}</td><td>{s.lead}</td><td>{s.client}</td><td>{s.product || '—'}</td><td>{String(s.id).slice(0, 6)}</td><td>{fmtMoney(s.value, '').trim()}</td><td>{s.currency}</td><td>{s.source || '—'}</td><td>{new Date(s.date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}</td><td>{s.nf || '—'}</td>
              <td><button className="db-sqbtn" style={{ width: 26, height: 26, color: '#ef4444' }} onClick={() => onDel(s.id)}><Trash2 size={13} /></button></td></tr>)}</tbody>
        </table></div></div>
      </Section>
      <Section title="Rendimiento de productos" sub="Participación en el total" style={{ minHeight: 281 }}
        right={<><Seg sm value={mode2} onChange={setMode2} options={[['valor', 'Valor'], ['cant', 'Cant.']]} /><ProdFilter /></>}>
        {prods.length ? <Bars data={prods} fmt={mode2 === 'valor' ? money : v => v} pct /> : <EmptyBox h={187} style={{ paddingTop: 30 }} />}
      </Section>
    </div>
  </>
}

function Bars({ data, fmt, color = '#8b5cf6', pct }) {
  if (!data.length) return <EmptyBox h={79} center />
  const max = Math.max(...data.map(d => d[1]), 1); const tot = data.reduce((a, d) => a + d[1], 0) || 1
  return <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 11, overflowY: 'auto' }}>
    {data.map(([k, v]) => <div key={k}><div style={{ display: 'flex', fontSize: 12.5, marginBottom: 5 }}><span style={{ color: 'var(--soft)' }}>{k}</span><b style={{ marginLeft: 'auto' }}>{fmt(v)}{pct && <span style={{ color: 'var(--muted)', fontWeight: 500 }}> · {(v / tot * 100).toFixed(0)}%</span>}</b></div>
      <div style={{ height: 7, borderRadius: 7, background: 'var(--deep)' }}><div style={{ width: v / max * 100 + '%', height: '100%', borderRadius: 7, background: color, transition: 'width .5s' }} /></div></div>)}
  </div>
}

function ProdFilter() {
  const [open, setOpen] = useState(false); const [q, setQ] = useState('')
  const [prods] = useStore('products', [])
  const list = prods.map(p => p.name || p).filter(n => String(n).toLowerCase().includes(q.toLowerCase()))
  return <div style={{ position: 'relative' }}>
    <button className="db-sqbtn" onClick={() => setOpen(!open)}><Filter size={15} /></button>
    {open && <div className="db-menu" style={{ left: 'auto', right: -2, top: 'calc(100% + 6px)', width: 223, padding: '12px 11px 13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 11.5, fontWeight: 700, marginBottom: 12 }}>Filtrar Productos<button style={{ marginLeft: 'auto', color: 'var(--muted)', display: 'grid' }} onClick={() => setOpen(false)}><X size={13} /></button></div>
      <input className="input" autoFocus placeholder="Buscar producto..." value={q} onChange={e => setQ(e.target.value)} style={{ height: 28, fontSize: 11.5, background: 'var(--card)', border: 'none' }} />
      {list.length ? list.map(n => <div key={n} className="db-mi">{n}</div>) : <div style={{ fontSize: 11, color: 'var(--soft)', padding: '13px 3px 0' }}>Ningún producto encontrado.</div>}
    </div>}
  </div>
}

/* ======================= ATENCIÓN ======================= */
function Atencion({ P, chats, contacts, inP }) {
  const [view, setView] = useState('tabla')
  const fc = chats.filter(c => c.created ? inP(c.created) : false)
  const nuevos = contacts.filter(c => c.created ? inP(c.created) : false).length
  const atendidos = fc.filter(c => c.agent).length, fin = fc.filter(c => c.status === 'closed' || c.done).length
  const sinResp = fc.filter(c => !c.agent).length
  const series = P.buckets.map(() => 0); fc.forEach(c => { const i = P.idx(new Date(c.created)); if (i in series) series[i]++ })
  const labels = P.buckets.map(d => P.hourly ? `${ddmm(d)}, ${pad(d.getHours())}h` : ddmm(d))
  const show = P.hourly ? (i => i % 2 === 1) : ((i, n) => n <= 12 || i % Math.ceil(n / 10) === 0 || i === n - 1)
  const heat = Array.from({ length: 7 }, () => Array(24).fill(0)); fc.forEach(c => { const d = new Date(c.created); heat[d.getDay()][d.getHours()]++ })
  const agents = Object.entries(fc.reduce((a, c) => { if (c.agent) a[c.agent] = (a[c.agent] || 0) + 1; return a }, {}))
  return <>
    <div className="db-kpis k5">
      <Kpi icon={Users} color="#3b82f6" value={nuevos} label="Leads nuevos" tip="Contactos creados en el período." />
      <Kpi icon={UserCheck} color="#a855f7" value={atendidos} label="Leads atendidos" tip="Chats que recibieron respuesta de un agente." />
      <Kpi icon={CircleCheck} color="#22c55e" value={fin} label="Leads finalizados" tip="Chats marcados como resueltos." />
      <Kpi icon={Clock} color="#f59e0b" value="—" label="Tiempo de respuesta" green tip="Promedio hasta la primera respuesta humana." />
      <Kpi icon={MessageSquareOff} color="#f43f5e" value={sinResp} label="Sin respuesta" green tip="Chats sin respuesta de un agente." />
    </div>
    <Section title="Atenciones en el período" sub="Chats abiertos en el período, la misma base de los leads nuevos." style={{ height: 322 }} right={<InfoTip size={15} text="Cada punto suma los chats abiertos en ese intervalo." />}>
      <LineChart labels={labels} showLabel={show} height={232} values={series} color="#2dd4bf" name="Chats" />
    </Section>
    <Section title="Atenciones por hora" sub="Chats abiertos en el período, por día de la semana y hora." right={<InfoTip size={15} text="Cuanto más intenso el color, más chats en esa franja." />}>
      <Heatmap data={heat} />
    </Section>
    <div className="db-g12">
      <Section title="Tiempo de respuesta" sub="Promedio del primer mensaje enviado por un atendente." style={{ height: 300 }} right={<InfoTip size={15} text="Mide el tiempo entre el primer mensaje del lead y la primera respuesta humana." />}>
        <EmptyBox text="Sin respuesta de atendente" h={218} style={{ marginTop: 0, paddingTop: 34 }} />
      </Section>
      <Section title="Leads por estado" sub="Distribución de leads por conexión" style={{ height: 300 }}>
        {contacts.length ? <Bars data={Object.entries(contacts.reduce((a, c) => { const k = c.stage || c.status || 'Nuevo'; a[k] = (a[k] || 0) + 1; return a }, {}))} fmt={v => v} /> : null}
      </Section>
    </div>
    <Section title="Desempeño por agente" sub="Atendidos y tiempo vienen de las primeras respuestas que él escribió. En atención y resueltos son los chats que están con él ahora."
      right={<Seg sm value={view} onChange={setView} options={[['tabla', 'Tabla'], ['grafico', 'Gráfico']]} />}>
      {agents.length ? <Bars data={agents} fmt={v => v} /> : <EmptyBox text="No hay datos de atención" h={80} center style={{ marginTop: 16 }} />}
    </Section>
  </>
}

/* ======================= MODALES ======================= */
function Assinar({ open, onClose }) {
  const [n, setN] = useState(1); const [ct, setCt] = useState('ext'); const toast = useToast()
  useEffect(() => { if (!open) return; const k = e => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [open])
  if (!open) return null
  const brl = v => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="modal db-m">
      <div className="mh"><div><h2>Assinar agora</h2><p>Escolha quantas instâncias deseja contratar. A cobrança mensal é recorrente por instância.</p></div>
        <button className="x" onClick={onClose}><X size={18} /></button></div>
      <div className="mb">
        <div className="db-inst"><div><div className="t">Instâncias adicionais</div><div className="s">{brl(127)} por instância · {brl(127 * n)}/mês</div></div>
          <div className="db-step"><button onClick={() => setN(Math.max(1, n - 1))}><Minus size={13} strokeWidth={2.6} /></button><b>{n}</b><button onClick={() => setN(n + 1)}><Plus size={13} strokeWidth={2.6} /></button></div></div>
        <div className="lbl">PAÍS DE COBRANÇA</div>
        <div className="db-ct"><button className={ct === 'br' ? 'on' : ''} onClick={() => setCt('br')}><small>BR</small>Brasil</button><button className={ct === 'ext' ? 'on' : ''} onClick={() => setCt('ext')}><span style={{ fontSize: 13 }}>🌎</span>Exterior</button></div>
        <div className="note">{ct === 'br' ? 'Pagamento em reais (R$) via Pix, boleto ou cartão.' : 'Valores em reais (R$). No checkout internacional a Paddle cobra na moeda do seu país.'}</div>
      </div>
      <div className="mf"><button className="c" onClick={onClose}>Cancelar</button><button className="ok" onClick={() => { onClose(); toast(`Redirigiendo al pago de ${n} instancia${n > 1 ? 's' : ''}…`, 'info') }}>Ir para o pagamento</button></div>
    </div></div>
}

function NewSale({ open, onClose, conns, cur, onSave }) {
  const toast = useToast()
  const [f, setF] = useState({ client: '', product: '', value: '', instance: '' })
  const ok = () => {
    if (!f.client || !f.value) return toast('Completa cliente y valor', 'err')
    onSave({ ...f, id: uid(), lead: Math.floor(Math.random() * 9000 + 1000), currency: cur, date: new Date().toISOString(), nf: '—' })
    setF({ client: '', product: '', value: '', instance: f.instance }); onClose()
  }
  return <Modal open={open} onClose={onClose} title="Nueva venta" sub="Registra una venta manualmente" icon={<ShoppingBag size={18} />}
    footer={<><button className="btn btn-g" onClick={onClose}>Cancelar</button><button className="btn btn-p" onClick={ok}>Guardar venta</button></>}>
    <div style={{ display: 'grid', gap: 12 }}>
      {[['client', 'Nombre del cliente'], ['product', 'Producto'], ['value', `Valor (${cur})`]].map(([k, l]) => <label key={k} style={{ fontSize: 12.5, color: 'var(--muted)' }}>{l}
        <input className="input" style={{ marginTop: 5 }} type={k === 'value' ? 'number' : 'text'} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} /></label>)}
      <label style={{ fontSize: 12.5, color: 'var(--muted)' }}>Instancia
        <select className="input" style={{ marginTop: 5 }} value={f.instance} onChange={e => setF({ ...f, instance: e.target.value })}><option value="">Sin instancia</option>{conns.map(c => <option key={c}>{c}</option>)}</select></label>
    </div>
  </Modal>
}
