import { useState, useMemo } from 'react'
import { RefreshCw, Search, SlidersHorizontal, Pencil, Info, ChevronDown, Check, BarChart3, X } from 'lucide-react'
import { useStore, useToast } from '../ui'
import { Sheet } from './dash/MobileDash'
import { ACC_ONLY, CM, DEF_ORDER, TABS, PERIODS, PF, STATES, demo, calc, fmt, usd, ago } from './Facebook'

const LBL = { ganancia: 'Utilidad', limiteOferta: 'Bid Cap', ultAct: 'Última actualización', estadoCuenta: 'Estado de cuenta', totalGastado: 'Total gastado', presupuesto: 'Presupuesto', imp: 'Impresiones' }
const SUMK = ['presupuesto', 'ciclo', 'totalGastado', 'gastos', 'ingresos', 'ventas', 'imp', 'clics', 'ic', 'conv', 'vistas', 'ventasInd', 'ventasTot', 'ingBrutos', 'impuesto']
const RED = ['ganancia', 'roas', 'roi', 'margen']

export default function FacebookMobile() {
  const toast = useToast()
  const [tab, setTab] = useStore('fbx_tab', 'camp')
  const [data, setData] = useStore('fbx_data', null)
  const [cols] = useStore('fbx_cols', DEF_ORDER)
  const [upd, setUpd] = useStore('fbx_upd', Date.now())
  const [sel, setSel] = useState({ acc: [], camp: [], set: [], ad: [] })
  const [f, setF] = useState({ q: '', status: 'any', period: 'today' })
  const [sheet, setSheet] = useState(null); const [draft, setDraft] = useState(f)
  const [sort, setSort] = useState({ k: null, dir: -1 }); const [tip, setTip] = useState(null)
  const [edit, setEdit] = useState(null); const [spin, setSpin] = useState(false)
  const d = data || { acc: [], camps: [], sets: [], ads: [] }
  const [, , , ent, plural] = TABS.find(t => t[0] === tab)
  const k = PF[f.period] || 1

  const rows = useMemo(() => {
    const now = new Date(upd).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    let list
    if (tab === 'acc') list = d.acc.map(a => { const ms = d.camps.filter(c => c.acc === a.id).map(c => c.m); const m = ms.reduce((s, x) => Object.fromEntries(Object.keys(x).map(q => [q, (s[q] || 0) + x[q]])), {})
      return { ...a, row: calc(m, k, { ultAct: now, ciclo: a.ciclo, tarjeta: a.card, estadoCuenta: a.status === 'ACTIVE' ? 'Activa' : 'Pago pendiente', totalGastado: a.total, presupuesto: d.camps.filter(c => c.acc === a.id && c.status === 'ACTIVE').reduce((s, c) => s + c.budget, 0) }) } })
    else { const src = tab === 'camp' ? d.camps : tab === 'set' ? d.sets : d.ads
      const par = x => tab === 'set' ? (!sel.camp.length || sel.camp.includes(x.camp)) : tab === 'ad' ? (sel.set.length ? sel.set.includes(x.set) : !sel.camp.length || sel.camp.includes(x.camp)) : true
      list = src.filter(par).map(x => ({ ...x, row: calc(x.m, k, { ultAct: now, presupuesto: x.budget ?? null, limiteOferta: null, gastoMin: x.budget ? x.budget * .5 : null, gastoMax: x.budget ? x.budget * 1.5 : null }) })) }
    list = list.filter(x => x.name.toLowerCase().includes(f.q.toLowerCase()) && (f.status === 'any' || x.status === f.status))
    if (sort.k) list = [...list].sort((a, b) => { const A = sort.k === 'name' ? a.name : sort.k === 'status' ? a.status : a.row[sort.k], B = sort.k === 'name' ? b.name : sort.k === 'status' ? b.status : b.row[sort.k]; return (A > B ? 1 : A < B ? -1 : 0) * sort.dir })
    return list
  }, [data, tab, f, sel, sort, upd])

  const shown = cols.filter(c => CM[c] && (tab === 'acc' ? true : !ACC_ONLY.includes(c)))
  const tot = useMemo(() => { const s = {}; SUMK.forEach(q => s[q] = rows.reduce((a, r) => a + (+r.row[q] || 0), 0)); const dv = (a, b) => b ? a / b : null
    return { ...s, ganancia: s.ingresos - s.gastos, roas: dv(s.ingresos, s.gastos), margen: dv(s.ingresos - s.gastos, s.ingresos), roi: dv(s.ingresos - s.gastos, s.gastos), cpa: dv(s.gastos, s.ventas), cpi: dv(s.gastos, s.ic), cpc: dv(s.gastos, s.clics), ctr: dv(s.clics, s.imp), cpm: dv(s.gastos * 1000, s.imp) } }, [rows])
  const totV = q => CM[q][4] === 't' || tot[q] === undefined ? 'N/A' : fmt(q, tot[q])
  const isRed = (q, v) => RED.includes(q) && v != null && (q === 'roas' ? v < 1 : v < 0)
  const S = sel[tab]; const setS = v => setSel(s => ({ ...s, [tab]: v }))
  const ordered = h => <button className="fbm-h" onClick={() => setSort(s => ({ k: h, dir: s.k === h ? -s.dir : -1 }))}><ChevronDown size={13} style={{ transform: sort.k === h && sort.dir > 0 ? 'rotate(180deg)' : '', opacity: sort.k === h ? 1 : .7 }} /></button>
  const refresh = () => { setSpin(true); setTimeout(() => { setSpin(false); setUpd(Date.now()); toast(data ? 'Datos actualizados' : 'No hay cuentas de anuncios conectadas', data ? 'ok' : 'info') }, 900) }
  const toggle = (x, on) => { const key = tab === 'camp' ? 'camps' : tab === 'set' ? 'sets' : 'ads'; setData(D => ({ ...D, [key]: D[key].map(y => y.id === x.id ? { ...y, status: on ? 'ACTIVE' : 'PAUSED' } : y) })); toast(`${ent} ${on ? 'activado' : 'pausado'}`) }
  const saveBudget = () => { const v = parseFloat(String(edit.v).replace(/[^\d,.-]/g, '').replace(',', '.')); if (!(v > 0)) return toast('Ingrese un valor válido', 'err'); const key = tab === 'camp' ? 'camps' : 'sets'; setData(D => ({ ...D, [key]: D[key].map(y => y.id === edit.id ? { ...y, budget: v } : y) })); setEdit(null); toast('Presupuesto actualizado') }
  const nF = (f.status !== 'any' ? 1 : 0) + (f.period !== 'today' ? 1 : 0)
  const acc = tab === 'acc'

  return <div className="mv fbm">
    <div className="fbm-tabs">{TABS.map(([t, l, I]) => <button key={t} title={l} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}><I size={21} strokeWidth={1.8} />{sel[t].length > 0 && <em>{sel[t].length}</em>}</button>)}</div>
    <div className="fbm-top"><div style={{ minWidth: 0 }}><h2>{TABS.find(t => t[0] === tab)[1]}</h2><small>Actualizado {ago(upd)} · {PERIODS.find(p => p[0] === f.period)?.[1]}</small></div>
      <button className="fbm-up" onClick={refresh} disabled={spin}><RefreshCw size={14} className={spin ? 'spin' : ''} />Actualizar</button></div>
    {!data ? <div className="fbm-empty"><BarChart3 size={44} color="#77737f" /><b>Conecte su cuenta de Meta</b><span>Vea gasto, ingresos y ROAS de sus campañas.</span><button className="md-btn" style={{ width: 'auto', padding: '0 22px', marginTop: 20 }} onClick={() => { setData(demo()); setUpd(Date.now()); toast('Cuenta de Meta conectada') }}>Conectar con Facebook</button></div> : <>
      <div className="fbm-bar"><div className="fbm-q"><Search size={15} /><input value={f.q} onChange={e => setF({ ...f, q: e.target.value })} placeholder={`Buscar ${acc ? 'cuenta' : ent.toLowerCase()}`} />{f.q && <button onClick={() => setF({ ...f, q: '' })}><X size={14} /></button>}</div>
        <button className="fbm-fb" onClick={() => { setDraft(f); setSheet('f') }}><SlidersHorizontal size={16} />{nF > 0 && <em>{nF}</em>}</button></div>
      <div className="fbm-tw"><table className="fbm-t"><thead><tr>
        {!acc && <th className="ck"><button className={'mv-cb' + (rows.length && S.length === rows.length ? ' on' : '')} onClick={() => setS(S.length === rows.length ? [] : rows.map(r => r.id))}>{rows.length > 0 && S.length === rows.length && <Check size={12} strokeWidth={3} />}</button></th>}
        {!acc && <th><span>Status{ordered('status')}</span></th>}
        <th className={acc ? 'ck nm' : 'nm'}><span>{acc ? 'Cuenta' : ent}{ordered('name')}</span></th>
        {shown.map(q => <th key={q}><span><em>{LBL[q] || CM[q][3]}</em>{CM[q][6] && <button className="fbm-h" onClick={() => setTip(tip === q ? null : q)}><Info size={14} /></button>}{ordered(q)}</span>{tip === q && <div className="fbm-tip" onClick={() => setTip(null)}>{CM[q][6]}</div>}</th>)}</tr></thead>
        <tbody>{rows.map(r => <tr key={r.id} className={S.includes(r.id) ? 'sel' : ''}>
          {!acc && <td className="ck"><button className={'mv-cb' + (S.includes(r.id) ? ' on' : '')} onClick={() => setS(S.includes(r.id) ? S.filter(x => x !== r.id) : [...S, r.id])}>{S.includes(r.id) && <Check size={12} strokeWidth={3} />}</button></td>}
          {!acc && <td><button className={'mv-tsw fbm-sw' + (r.status === 'ACTIVE' ? ' on' : '')} onClick={() => toggle(r, r.status !== 'ACTIVE')} /></td>}
          <td className={acc ? 'ck nm' : 'nm'}><div className="fbm-nm" onClick={() => { const nx = { acc: 'camp', camp: 'set', set: 'ad' }[tab]; if (nx) { setSel(s => ({ ...s, [tab]: [r.id] })); setTab(nx) } }}>{!acc && <i className={r.status === 'ACTIVE' && r.row.ganancia >= 0 ? 'g' : 'r'} />}{r.name}</div></td>
          {shown.map(q => <td key={q} className={isRed(q, r.row[q]) ? 'neg' : ''}>
            {q === 'presupuesto' && r.budget != null && tab !== 'ad' ? <div className="fbm-bud"><button onClick={() => setEdit({ id: r.id, v: r.budget.toFixed(2).replace('.', ',') })}><Pencil size={14} /></button><div>{usd(r.row[q])}<small>Diario</small></div></div>
              : q === 'limiteOferta' ? <div className="fbm-sub">{fmt(q, r.row[q])}<small>Bid Cap</small></div>
              : fmt(q, r.row[q])}</td>)}</tr>)}
          {!rows.length && <tr><td colSpan={shown.length + 3} className="fbm-none">Ningún resultado con los filtros actuales.</td></tr>}
          <tr className="fbm-fill">{!acc && <><td className="ck" /><td /></>}<td className={acc ? 'ck nm' : 'nm'} />{shown.map(q => <td key={q} />)}</tr></tbody>
        <tfoot><tr>{!acc && <><td className="ck">N/A</td><td>N/A</td></>}<td className={acc ? 'ck nm' : 'nm'}>{rows.length} {(rows.length === 1 ? (acc ? 'Cuenta' : ent) : plural.charAt(0).toUpperCase() + plural.slice(1))}</td>
          {shown.map(q => <td key={q} className={isRed(q, tot[q]) ? 'neg' : ''}>{totV(q)}</td>)}</tr></tfoot></table></div>
    </>}
    {sheet === 'f' && <Sheet onClose={() => setSheet(null)}><div style={{ padding: '4px 18px 22px' }}><div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Filtros</div>
      <span className="mv-cap">ESTADO</span><select className="mv-sel" value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>{STATES.filter(x => x[0]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <span className="mv-cap">PERÍODO DE VISUALIZACIÓN</span><select className="mv-sel" value={draft.period} onChange={e => setDraft({ ...draft, period: e.target.value })}>{PERIODS.filter(x => x[0] && x[0] !== 'custom').map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 18 }}><button className="fbm-b2" onClick={() => { const b = { ...f, status: 'any', period: 'today' }; setDraft(b); setF(b); setSheet(null) }}>Limpiar</button><button className="fbm-b2 p" onClick={() => { setF(draft); setSheet(null) }}>Aplicar</button></div></div></Sheet>}
    {edit && <div className="mv-dlg" onClick={e => e.target === e.currentTarget && setEdit(null)}><div><div style={{ fontSize: 20, fontWeight: 500 }}>Diario</div>
      <div className="fbm-money"><span>$</span><input autoFocus inputMode="decimal" value={edit.v} onChange={e => setEdit({ ...edit, v: e.target.value })} onKeyDown={e => e.key === 'Enter' && saveBudget()} /></div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}><button className="fbm-b2" style={{ border: '1px solid #8b5cf6', color: '#c4b5fd', background: 'transparent', width: 104 }} onClick={() => setEdit(null)}>Cancelar</button><button className="fbm-b2 p" style={{ width: 104 }} onClick={saveBudget}>Guardar</button></div></div></div>}
  </div>
}
