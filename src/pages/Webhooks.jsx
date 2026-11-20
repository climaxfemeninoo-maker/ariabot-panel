import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Webhook, Plus, Search, HardDrive, ArrowUpDown, Pencil, Trash2, ChevronRight, ChevronDown, Save, Zap, Settings, History, Copy, Radio, Lock, Tag, Kanban as KIcon, Workflow, Smartphone, Code, Check, TriangleAlert, X } from 'lucide-react'
import { useStore, useToast, uid, useOutside } from '../ui'
import { LModal, LSelect, Toggle } from './leona'

const LIMIT = 30000
const token = () => Array.from({ length: 64 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('')
const blank = name => ({ id: uid(), name, active: true, conn: '', token: token(), map: { name: '', phone: '', email: '' }, custom: [], addTags: [], rmTags: [], kanban: [], trigger: { instance: '', number: '', on: false, flow: '', mode: 'all', rules: [] }, sample: null, history: [], fires: 0, created: Date.now() })
const hookUrl = h => `${location.origin}/api/webhooks/inbound/${h.token}`

export default function Webhooks() {
  const { id } = useParams()
  if (id === 'new') return <NewHook />
  if (id) return <Detail id={id} />
  return <List />
}

function Crumb({ last }) {
  const nav = useNavigate()
  return <div className="kb-crumb" style={{ margin: 0 }}><a onClick={() => nav('/settings/inbound-webhooks')}>Webhooks</a><ChevronRight size={14} /><b>{last}</b></div>
}

/* ======================= LISTA ======================= */
function List() {
  const nav = useNavigate(); const toast = useToast()
  const [hooks, setHooks] = useStore('webhooks', [])
  const [conns] = useStore('connections', [])
  const [q, setQ] = useState(''); const [sort, setSort] = useState(['name', 1]); const [del, setDel] = useState(null)
  const used = hooks.reduce((a, h) => a + (h.fires || 0), 0)
  const rows = hooks.filter(h => h.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => sort[0] === 'name' ? sort[1] * a.name.localeCompare(b.name) : sort[1] * ((a.fires || 0) - (b.fires || 0)))
  const tog = k => setSort(s => [k, s[0] === k ? -s[1] : 1])
  return <div className="lp" style={{ paddingTop: 22 }}>
    <div className="lp-hd"><Webhook size={22} strokeWidth={1.9} style={{ marginLeft: 2 }} />
      <div><h1>Webhooks</h1><p>Administre varios webhooks, cada uno con su conexión y mapeo.</p></div>
      <div className="r"><button className="wh-btn" onClick={() => nav('/settings/inbound-webhooks/new')}><Plus size={15} />Nuevo webhook</button></div></div>
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
      <div className="lp-srch" style={{ width: 360 }}><Search size={15} /><input style={{ height: 34 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar webhook por nombre..." /></div>
      <div className="wh-cons" style={{ marginLeft: 'auto' }}><HardDrive size={15} color="#8b5cf6" />
        <div><div><b>Consumo: {used.toLocaleString('es-PE')}</b> <span>/ {LIMIT.toLocaleString('es-PE')}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="wh-bar"><div style={{ width: Math.min(100, used / LIMIT * 100) + '%', height: '100%', background: '#8b5cf6' }} /></div><span className="wh-pc">{(used / LIMIT * 100).toFixed(1)}%</span></div></div></div>
    </div>
    {hooks.length === 0 ? <div className="wh-empty"><Webhook size={42} strokeWidth={1.9} className="big" /><h3>No hay webhooks registrados</h3><p>Cree el primer webhook para comenzar.</p>
      <button className="wh-btn" style={{ marginTop: 18 }} onClick={() => nav('/settings/inbound-webhooks/new')}><Plus size={15} />Crear webhook</button></div>
      : <div className="wh-tbl">
        <div className="wh-tr wh-th"><span style={{ cursor: 'pointer', textTransform: 'none', letterSpacing: '.02em', fontSize: 12 }} onClick={() => tog('name')}>Nombre <ArrowUpDown size={11} /></span><span>ESTADO</span><span>CONEXIÓN</span>
          <span style={{ cursor: 'pointer', textTransform: 'none', letterSpacing: '.02em', fontSize: 12 }} onClick={() => tog('fires')}>Disparos del mes <ArrowUpDown size={11} /></span><span style={{ textAlign: 'right', paddingRight: 18 }}>ACCIONES</span></div>
        {rows.map(h => <div key={h.id} className="wh-tr wh-row" onClick={() => nav('/settings/inbound-webhooks/' + h.id)}>
          <b style={{ fontSize: 13.3 }}>{h.name}</b>
          <span><span className={'wh-ok' + (h.active ? '' : ' wh-off')}>{h.active ? 'Activo' : 'Inactivo'}</span></span>
          <span className="wh-mono">{conns.find(c => c.id === h.conn)?.name || 'Sin conexión'}</span>
          <b style={{ fontSize: 13.3 }}>{h.fires || 0}</b>
          <span style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', paddingRight: 18 }} onClick={e => e.stopPropagation()}>
            <button className="ch-ib" style={{ width: 26, height: 26 }} title="Editar" onClick={() => nav('/settings/inbound-webhooks/' + h.id)}><Pencil size={14} /></button>
            <button className="ch-ib" style={{ width: 26, height: 26 }} title="Eliminar" onClick={() => setDel(h)}><Trash2 size={14} color="#ef4444" /></button></span>
        </div>)}
        {rows.length === 0 && <div style={{ padding: 30, textAlign: 'center', fontSize: 13, color: '#94a3b8', fontStyle: 'italic', background: 'var(--card)' }}>Ningún webhook coincide con la búsqueda.</div>}
      </div>}
    <LModal open={!!del} onClose={() => setDel(null)} title="Eliminar webhook" icon={<TriangleAlert size={21} color="#ef4444" />} width={482} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55 }}>¿Eliminar el webhook "{del?.name}"? La URL dejará de recibir solicitudes.</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 13 }}>
        <button className="lb2 g" onClick={() => setDel(null)}>Cancelar</button>
        <button className="lb2 d" onClick={() => { setHooks(x => x.filter(h => h.id !== del.id)); setDel(null); toast('Webhook eliminado') }}>Eliminar</button></div>
    </LModal>
  </div>
}

/* ======================= NUEVO ======================= */
function NewHook() {
  const nav = useNavigate(); const toast = useToast()
  const [, setHooks] = useStore('webhooks', [])
  const [conns] = useStore('connections', [])
  const [name, setName] = useState(''); const [conn, setConn] = useState(''); const [active, setActive] = useState(true)
  const save = () => {
    if (!name.trim()) return toast('Escriba el nombre del webhook', 'err')
    const h = { ...blank(name.trim()), conn, active }; setHooks(x => [...x, h]); toast('Webhook creado'); nav('/settings/inbound-webhooks/' + h.id)
  }
  return <div className="wh-page" style={{ paddingTop: 28 }}>
    <Crumb last="Nuevo" />
    <div className="wh-hd"><Webhook size={22} strokeWidth={1.9} /><div><h1>Nuevo webhook</h1><p>Crear webhook</p></div></div>
    <div className="wh-card">
      <div className="wh-ct">Crear webhook<span style={{ marginLeft: 'auto' }}><Toggle on={active} onChange={setActive} /></span></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
        <div><label className="wh-lb">Nombre del webhook</label><input className="wh-in soft" autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()} placeholder="Ej.: Webhook N8N Ventas" style={{ fontWeight: name ? 700 : 400, marginTop: 6 }} /></div>
        <div><label className="wh-lb">Conexión</label><LSelect className="wh-in soft l-selb" value={conn} onChange={setConn} options={[{ value: '', label: 'Ninguna' }, ...conns.map(c => ({ value: c.id, label: c.name }))]} />
          <div className="wh-help">Opcional. Necesaria para etiquetas, Kanban y disparo de flujo. Use la misma conexión de WhatsApp del lead.</div></div>
      </div>
      <button className="wh-btn" style={{ marginTop: 18 }} onClick={save}><Save size={14} />Guardar y continuar</button>
    </div>
  </div>
}

/* ======================= DETALLE ======================= */
function SSelect({ value, onChange, options, placeholder = 'Seleccione...', search = 'Buscar...', disabled, bold }) {
  const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const ref = useRef(); useOutside(ref, () => setOpen(false))
  const cur = options.find(o => o.value === value)
  const list = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()))
  return <div className="l-sel" ref={ref}>
    <button type="button" disabled={disabled} className={'wh-in soft l-selb' + (open ? ' open' : '')} style={{ color: cur ? 'var(--text)' : '#94a3b8', fontWeight: cur && bold ? 700 : 500, borderColor: open ? 'var(--p)' : undefined, opacity: disabled ? .6 : 1 }} onClick={() => { setOpen(!open); setQ('') }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur ? cur.label : placeholder}</span><ChevronDown size={15} className="chev" /></button>
    {open && <div className="l-selm" style={{ padding: 0, top: 'auto', bottom: 'calc(100% + 4px)' }}>
      <div style={{ padding: 9 }}><div className="l-ico"><Search size={14} /><input className="l-in" autoFocus style={{ height: 32, borderColor: 'var(--p)' }} placeholder={search} value={q} onChange={e => setQ(e.target.value)} /></div></div>
      <button type="button" className="l-opt" style={{ borderRadius: 0, background: !value ? 'rgba(255,255,255,.06)' : undefined }} onClick={() => { onChange(''); setOpen(false) }}>{placeholder}</button>
      {list.map(o => <button type="button" key={o.value} className="l-opt" style={{ borderRadius: 0 }} onClick={() => { onChange(o.value); setOpen(false) }}>{o.label}{o.value === value && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--p)' }} />}</button>)}
      {list.length === 0 && <div className="l-opt" style={{ color: '#94a3b8', fontWeight: 500 }}>Sin resultados</div>}
    </div>}
  </div>
}

function TagInput({ value, onChange, options }) {
  const [q, setQ] = useState(''); const [open, setOpen] = useState(false); const ref = useRef(); useOutside(ref, () => setOpen(false))
  const sug = [...new Set(options)].filter(t => !value.includes(t) && t.toLowerCase().includes(q.toLowerCase()))
  const add = t => { t = t.trim(); if (t && !value.includes(t)) onChange([...value, t]); setQ('') }
  return <div ref={ref} style={{ position: 'relative' }}>
    <div className="wh-in dash" style={{ height: 'auto', minHeight: 46, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: '6px 12px' }} onClick={() => setOpen(true)}>
      {value.map(t => <span key={t} className="ct-tag" style={{ margin: 0, fontStyle: 'normal' }}>{t}<button style={{ marginLeft: 5, display: 'grid', color: '#94a3b8' }} onClick={() => onChange(value.filter(x => x !== t))}><X size={11} /></button></span>)}
      <input value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(q) } }} placeholder={value.length ? '' : 'Buscar o crear etiqueta...'} style={{ flex: 1, minWidth: 120, background: 'none', border: 'none', outline: 'none', fontStyle: 'italic', fontSize: 13.3, color: 'var(--text)', height: 30 }} />
    </div>
    {open && (sug.length > 0 || q.trim()) && <div className="l-selm">{q.trim() && !options.includes(q.trim()) && <button className="l-opt" onClick={() => add(q)}><Plus size={14} />Crear "{q.trim()}"</button>}{sug.map(t => <button key={t} className="l-opt" onClick={() => add(t)}>{t}</button>)}</div>}
  </div>
}

function Tree({ data, path = '', onPick }) {
  if (data === null || typeof data !== 'object') return null
  return <div style={{ paddingLeft: path ? 14 : 0 }}>{Object.entries(data).map(([k, v]) => { const p = path ? `${path}.${k}` : k; const obj = v && typeof v === 'object'
    return <div key={p} style={{ lineHeight: '22px' }}>
      <span className="wh-key" draggable onDragStart={e => e.dataTransfer.setData('text/plain', `{${p}}`)} onClick={() => onPick(`{${p}}`)} title="Clic o arrastre para usar este campo">{k}</span>
      {!obj && <span style={{ color: '#94a3b8' }}>: {JSON.stringify(v)}</span>}
      {obj && <Tree data={v} path={p} onPick={onPick} />}</div> })}</div>
}

function Detail({ id }) {
  const nav = useNavigate(); const toast = useToast()
  const [hooks, setHooks] = useStore('webhooks', [])
  const [conns] = useStore('connections', []); const [boards] = useStore('boards', []); const [flows] = useStore('flows', []); const [contacts] = useStore('contacts', [])
  const saved = hooks.find(h => h.id === id)
  const [d, setD] = useState(() => saved ? JSON.parse(JSON.stringify(saved)) : null)
  useEffect(() => { if (saved && (!d || d.id !== id)) setD(JSON.parse(JSON.stringify(saved))) }, [saved, id])
  const [tab, setTab] = useState('cfg'); const [editName, setEditName] = useState(false); const [paste, setPaste] = useState(null); const [vars, setVars] = useState(false); const [inst, setInst] = useState(false)
  const focus = useRef('name'); const instRef = useRef(); useOutside(instRef, () => setInst(false))
  if (saved && !d) return null
  if (!saved || !d) return <div className="wh-page"><Crumb last="No encontrado" /><div className="wh-empty"><Webhook size={40} className="big" /><h3>Webhook no encontrado</h3><button className="wh-btn" style={{ marginTop: 16 }} onClick={() => nav('/settings/inbound-webhooks')}>Volver</button></div></div>
  const up = p => setD(x => ({ ...x, ...p })); const upT = p => setD(x => ({ ...x, trigger: { ...x.trigger, ...p } }))
  const persist = (nd = d, msg = 'Cambios guardados') => { setHooks(hs => hs.map(h => h.id === id ? nd : h)); toast(msg) }
  const tags = [...new Set([...contacts.flatMap(c => c.tags || []), ...boards.flatMap(b => b.cols.flatMap(c => c.cards.flatMap(x => x.tags || [])))])]
  const paths = []; const walk = (o, p = '') => { if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => walk(v, p ? p + '.' + k : k)); else if (p) paths.push(p) }; walk(d.sample)
  const pick = v => { const f = focus.current; if (f === 'name' || f === 'phone' || f === 'email') up({ map: { ...d.map, [f]: (d.map[f] || '') + v } }); else if (f.startsWith('c')) { const i = +f.slice(1); up({ custom: d.custom.map((c, j) => j === i ? { ...c, v: (c.v || '') + v } : c) }) } }
  const dropIn = (e, apply) => { e.preventDefault(); const t = e.dataTransfer.getData('text/plain'); if (t) apply(t) }
  const mapIn = (k, ph) => <input className="wh-in dash" value={d.map[k]} placeholder={ph} onFocus={() => focus.current = k} onChange={e => up({ map: { ...d.map, [k]: e.target.value } })} onDragOver={e => e.preventDefault()} onDrop={e => dropIn(e, t => up({ map: { ...d.map, [k]: (d.map[k] || '') + t } }))} style={{ height: 42, background: 'var(--deep)' }} />
  const st = { total: d.history.length, ok: d.history.filter(h => h.st === 'ok').length, fail: d.history.filter(h => h.st === 'fail').length, pend: d.history.filter(h => h.st === 'pend').length, skip: d.history.filter(h => h.st === 'skip').length }
  return <div className="wh-page" style={{ paddingTop: 45 }}>
    <Crumb last={saved.name} />
    <div className="wh-hd" style={{ marginTop: 20 }}><Zap size={22} strokeWidth={1.9} /><div><h1>{saved.name}</h1><p>Webhook</p></div></div>
    <div className="wh-tabs"><button className={tab === 'cfg' ? 'on' : ''} onClick={() => setTab('cfg')}><Settings size={14} />Configuración</button><button className={tab === 'hist' ? 'on' : ''} onClick={() => setTab('hist')}><History size={14} />Historial</button></div>

    {tab === 'hist' ? <div className="wh-box">
      <div className="wh-h3">Historial (hasta 1000 recientes)</div>
      <div className="wh-d" style={{ marginTop: 16, color: '#94a3b8' }}>Total {st.total} · procesados {st.ok} · fallos {st.fail} · pendientes {st.pend} · omitidos {st.skip}</div>
      <div className="wh-d" style={{ marginTop: 16, color: '#94a3b8' }}>Abra cada registro para ver el cuerpo. Los contadores cubren todo el historial retenido.</div>
      <div className="wh-d" style={{ marginTop: 16, color: '#94a3b8' }}>{d.history.length ? '' : 'Sin registros aún.'}</div>
    </div> : <>
      <div className="wh-box" style={{ paddingTop: 0, paddingBottom: 19 }}>
        <div className="wh-ct" style={{ height: 63, paddingLeft: 7 }}>
          {editName ? <input className="wh-in" autoFocus style={{ width: 320, fontWeight: 700 }} value={d.name} onChange={e => up({ name: e.target.value })} onBlur={() => { setEditName(false); if (d.name.trim()) persist({ ...d, name: d.name.trim() }, 'Nombre actualizado') }} onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()} />
            : <>{d.name}<button style={{ marginLeft: 14, color: '#94a3b8', display: 'grid' }} onClick={() => setEditName(true)}><Pencil size={14} /></button></>}
          <span style={{ marginLeft: 'auto' }}><Toggle on={d.active} onChange={v => { up({ active: v }); persist({ ...d, active: v }, v ? 'Webhook activado' : 'Webhook desactivado') }} /></span></div>
      </div>

      <div className="wh-box">
        <div className="wh-url"><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.3, fontWeight: 600, color: 'var(--soft)', marginBottom: 5 }}>URL (POST)</div><div className="u">{hookUrl(d)}</div></div>
          <button className="wh-btn g" onClick={() => { navigator.clipboard?.writeText(hookUrl(d)); toast('URL copiada') }}><Copy size={14} />Copiar URL</button>
          <button className="wh-btn" style={{ height: 33 }} onClick={() => setPaste(d.sample ? JSON.stringify(d.sample, null, 2) : '')}><Radio size={13} />Esperar solicitud de ejemplo</button></div>
        <div className="wh-h3" style={{ marginTop: 19 }}>Recibir payload de ejemplo</div>
        <div className="wh-d">Copie la URL, envíe un POST real y use el botón de abajo para escuchar cuando llegue la solicitud.</div>
        <div className="wh-note"><Lock size={15} />{d.sample ? 'Payload de ejemplo recibido. Haga clic o arrastre los campos del árbol para mapearlos.' : 'Cuando llegue el primer payload, podrá mapear campos del JSON desde el árbol de la izquierda.'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginTop: 16 }}>
          <div className="wh-sub">
            <div className="wh-h3">Estructura del JSON del Payload</div><div className="wh-d">Haga clic en un campo para usarlo como etiqueta en el mapeo al lado.</div>
            <div className="wh-tree" style={!d.sample ? { display: 'grid', placeItems: 'center', textAlign: 'center', lineHeight: 1.6 } : null}>{d.sample ? <Tree data={d.sample} onPick={pick} /> : <span style={{ maxWidth: 360 }}>Esperando payload de ejemplo. Copie la URL de arriba, envíe un POST y use el botón de escucha.</span>}</div>
            <div className="wh-sub" style={{ marginTop: 10, padding: '12px 13px', fontSize: 11.5, lineHeight: 1.6, color: '#94a3b8' }}>El árbol JSON se construye a partir del último payload recibido. La API no devuelve estructura inferida en la sesión sin un POST real.</div>
          </div>
          <div className="wh-sub">
            <div className="wh-h3">Vincular al Lead</div><div className="wh-d">Asocie las claves del JSON con los campos del contacto.</div>
            <label className="wh-lb" style={{ margin: '13px 0 7px' }}>Nombre</label>{mapIn('name', 'Arrastre del árbol o escriba texto + Entrar')}
            <label className="wh-lb" style={{ margin: '13px 0 7px' }}>Teléfono</label>{mapIn('phone', 'Ej.: +55 + Entrar, luego arrastre el número del árbol')}
            <label className="wh-lb" style={{ margin: '13px 0 7px' }}>Correo (opcional)</label>{mapIn('email', 'Arrastre del árbol o escriba texto + Entrar')}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 13, paddingTop: 13, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1 }}><div className="wh-h3" style={{ fontSize: 13.3, textTransform: 'uppercase' }}>Campos personalizados (opcional)</div><div className="wh-d">Mapee campos personalizados del lead con valores del payload (clic o arrastre del árbol JSON).</div></div>
              <button className="wh-mini" onClick={() => up({ custom: [...d.custom, { k: '', v: '' }] })}><Plus size={14} /><span>Nueva<br />fila</span></button></div>
            {d.custom.length === 0 ? <div className="wh-d" style={{ marginTop: 12 }}>Sin mapeos extra. Use "Nueva fila" para guardar más campos del payload en el lead.</div>
              : d.custom.map((c, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 26px', gap: 7, marginTop: 12, alignItems: 'center' }}>
                <input className="wh-in soft" placeholder="Nombre interno (ej.: dni)" value={c.k} onChange={e => up({ custom: d.custom.map((x, j) => j === i ? { ...x, k: e.target.value } : x) })} />
                <input className="wh-in dash" style={{ borderLeft: '2px solid var(--p)', borderRight: '2px solid var(--p)' }} placeholder="Arrastre del árbol o escriba + Entrar" value={c.v} onFocus={() => focus.current = 'c' + i} onChange={e => up({ custom: d.custom.map((x, j) => j === i ? { ...x, v: e.target.value } : x) })} onDragOver={e => e.preventDefault()} onDrop={e => dropIn(e, t => up({ custom: d.custom.map((x, j) => j === i ? { ...x, v: (x.v || '') + t } : x) }))} />
                <button style={{ color: '#94a3b8', display: 'grid' }} onClick={() => up({ custom: d.custom.filter((_, j) => j !== i) })}><Trash2 size={15} /></button></div>)}
          </div>
        </div>

        <div className="wh-sub" style={{ marginTop: 16, display: 'flex', gap: 14 }}>
          <span className="wh-ib" style={{ background: 'rgba(139,92,246,.15)' }}><Tag size={15} color="#8b5cf6" /></span>
          <div style={{ flex: 1 }}>
            <div className="wh-h3">Etiquetas en el contacto</div>
            <div className="wh-d">Misma idea que el nodo de etiquetas en el flujo: busque, seleccione o cree. No es una lista separada por comas.</div>
            <div className="wh-warn">Solo se aplican si tiene una <b>conexión</b> elegida en el bloque <b>Conexión y disparo de flujo</b> (abajo) y esa conexión está <b>conectada</b> cuando se procesa el webhook. Sin eso, este paso se omite (la identificación del lead y los demás pasos continúan).</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 17, marginLeft: -40, marginTop: 10 }}>
              <div><label className="wh-lb" style={{ margin: '8px 0 9px' }}>Agregar etiquetas</label><TagInput value={d.addTags} onChange={v => up({ addTags: v })} options={tags} /><div className="wh-help">Aplicadas al lead cuando el webhook se procesa con éxito.</div></div>
              <div><label className="wh-lb" style={{ margin: '8px 0 9px' }}>Quitar etiquetas</label><TagInput value={d.rmTags} onChange={v => up({ rmTags: v })} options={tags} /><div className="wh-help">Quitadas del lead en la misma ejecución.</div></div>
            </div></div>
        </div>

        <div className="wh-sub" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 14 }}><span className="wh-ib" style={{ background: 'rgba(34,197,94,.13)' }}><KIcon size={14} color="#22c55e" /></span>
            <div><div className="wh-h3">Kanban</div><div className="wh-d">Misma configuración que el nodo Kanban en el flujo: elija el tablero, la columna y el valor cuando haya meta de conversión.</div>
              <div className="wh-warn">Solo se ejecuta con una <b>conexión</b> definida en el bloque <b>Conexión y disparo de flujo</b> (abajo) y <b>conectada</b> al procesar. De lo contrario, las acciones Kanban se omiten.</div></div></div>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 13, paddingTop: 12, display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}><div className="wh-cap">ACCIONES EN KANBAN</div><div className="wh-d" style={{ marginTop: 2 }}>Opcional. Agregar o quitar tarjetas del embudo cuando se procese el webhook.</div></div>
            <button className="wh-mini" onClick={() => up({ kanban: [...d.kanban, { act: 'add', board: '', col: '' }] })}><Plus size={14} /><span>Nueva<br />acción</span></button></div>
          {d.kanban.length === 0 ? <div className="wh-d" style={{ marginTop: 12 }}>Sin acciones. Opcional. Use "Nueva acción" para incluir.</div> : <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr 1.35fr 26px', gap: 8, marginTop: 14 }} className="wh-cap"><span style={{ color: '#94a3b8' }}>ACCIÓN</span><span style={{ color: '#94a3b8' }}>KANBAN</span><span style={{ color: '#94a3b8' }}>COLUMNA</span><span /></div>
            {d.kanban.map((k, i) => { const b = boards.find(x => x.id === k.board); const set = p => up({ kanban: d.kanban.map((x, j) => j === i ? { ...x, ...p } : x) })
              return <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr 1.35fr 26px', gap: 8, marginTop: 10, alignItems: 'center' }}>
                <LSelect className="wh-in soft l-selb" bold value={k.act} onChange={v => set({ act: v })} options={[{ value: 'add', label: 'Agregar' }, { value: 'remove', label: 'Quitar' }]} />
                <LSelect className="wh-in soft l-selb" value={k.board} onChange={v => set({ board: v, col: '' })} placeholder="Seleccione un Kanban" options={boards.map(x => ({ value: x.id, label: x.name }))} />
                <LSelect className="wh-in soft l-selb" disabled={!b} value={k.col} onChange={v => set({ col: v })} placeholder={b ? 'Seleccione una columna' : 'Seleccione un Kanban primero'} options={(b?.cols || []).map(c => ({ value: c.id, label: c.name, dot: c.color }))} />
                <button style={{ color: '#94a3b8', display: 'grid' }} onClick={() => up({ kanban: d.kanban.filter((_, j) => j !== i) })}><Trash2 size={15} /></button></div> })}
          </>}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 17, paddingTop: 19, display: 'flex', alignItems: 'center' }}>
          <div className="wh-d" style={{ maxWidth: 560, margin: 0 }}>Guarde para persistir nombre, conexión, disparo de flujo, estado del webhook, mapeo, etiquetas y Kanban.</div>
          <button className="wh-btn" style={{ marginLeft: 'auto', height: 33 }} onClick={() => persist()}><Save size={14} />Guardar cambios</button></div>
      </div>

      <div className="wh-box" style={{ paddingTop: 23 }}>
        <div className="wh-h3">Conexión y disparo de flujo</div>
        <div className="wh-sub wh-trig" style={{ marginTop: 19, display: "flex", gap: 11, background: "var(--in2)", padding: "14px 15px 18px 13px" }}>
          <span className="wh-ib" style={{ background: 'rgba(245,158,11,.14)' }}><Workflow size={14} color="#f59e0b" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}><span style={{ fontSize: 13.3, fontWeight: 600 }}>Número que dispara{d.trigger.on && <span style={{ color: '#ef4444' }}> *</span>}</span>
              <button style={{ marginLeft: 'auto', color: '#34d399', fontSize: 11.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setVars(!vars)}><Code size={12} />Variables</button>
              {vars && <div className="wh-var">{paths.length ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{paths.map(p => <button key={p} className="ct-tag" style={{ margin: 0, cursor: 'pointer' }} onClick={() => { upT({ number: d.trigger.number + `{${p}}` }); setVars(false) }}>{`{${p}}`}</button>)}</div> : 'Capture un ejemplo del webhook para listar campos, o escriba {ruta.del.campo}.'}</div>}</div>
            <div className="wh-phone" style={{ marginTop: 10 }}>
              <div ref={instRef} style={{ position: 'relative' }}><button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 11px 0 13px', height: 22, borderRight: '1px solid var(--border2)', color: d.trigger.instance ? '#22c55e' : 'var(--text)' }} title="Instancia" onClick={() => setInst(!inst)}><Smartphone size={15} /><ChevronDown size={11} /></button>
                {inst && <div className="l-selm" style={{ width: 240, top: 'calc(100% + 10px)' }}>{conns.length ? conns.map(c => <button key={c.id} className={'l-opt' + (d.trigger.instance === c.id ? ' on' : '')} onClick={() => { upT({ instance: c.id }); up({ conn: c.id }); setInst(false) }}><Smartphone size={14} />{c.name}</button>) : <div className="l-opt" style={{ color: '#94a3b8', fontWeight: 500 }}>No hay conexiones disponibles</div>}</div>}</div>
              <input value={d.trigger.number} onChange={e => upT({ number: e.target.value })} placeholder="11999998888 o {telefono}" /></div>
            <div className="wh-d" style={{ color: '#94a3b8', marginTop: 8 }}>Elija la instancia, escriba el número o inserte una variable.</div>
            <div className="wh-d" style={{ color: '#94a3b8', marginTop: 14 }}>Se usa en etiquetas, Kanban y disparo. Espacios, guiones, barras y + se ignoran: el match es por los 8 últimos dígitos.</div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 17 }}><div><div className="wh-h3">Disparar flujo</div><div className="wh-warn" style={{ fontWeight: 700, marginTop: 6 }}>¡ATENCIÓN! Si el lead tiene un flujo en curso, el flujo del webhook reemplazará el actual</div></div>
              <span style={{ marginLeft: 'auto' }}><Toggle on={d.trigger.on} onChange={v => upT({ on: v })} /></span></div>
            <label className="wh-lb" style={{ margin: '16px 0 9px', color: 'var(--text)' }}>Flujo de destino</label>
            <SSelect value={d.trigger.flow} onChange={v => upT({ flow: v })} placeholder="Buscar flujo por nombre..." search="Buscar flujo..." disabled={!d.trigger.on} options={flows.map(f => ({ value: f.id, label: f.name }))} />
            {d.trigger.on && <>
              <div className="wh-h3" style={{ marginTop: 34 }}>Disparar flujo solo si</div>
              <div className="wh-d" style={{ color: '#94a3b8', marginTop: 6 }}>Se evalúa antes de cancelar un flujo activo. Sin reglas, dispara siempre (como hoy).</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 15 }}><span className="wh-d" style={{ margin: 0, color: '#94a3b8' }}>Reglas:</span>
                <LSelect className="wh-in l-selb" bold style={{ width: 186 }} value={d.trigger.mode} onChange={v => upT({ mode: v })} options={[{ value: 'all', label: 'Todas (Y)' }, { value: 'any', label: 'Cualquiera (O)' }]} /></div>
              {d.trigger.rules.length === 0 ? <div className="wh-d" style={{ color: '#94a3b8', marginTop: 17 }}>Sin reglas — dispara para todo lead que pase los pasos anteriores.</div>
                : d.trigger.rules.map((r, i) => { const set = p => upT({ rules: d.trigger.rules.map((x, j) => j === i ? { ...x, ...p } : x) })
                  return <div key={i} style={{ marginTop: 18, paddingLeft: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 30px', gap: 10, alignItems: 'end' }}><div><label className="wh-lb" style={{ margin: '0 0 9px', color: 'var(--text)' }}>Tipo</label>
                      <LSelect className="wh-in soft l-selb" bold value={r.type} onChange={v => set({ type: v, tag: '', op: v === 'tag' ? 'has' : 'eq' })} options={[{ value: 'tag', label: 'Etiqueta' }, { value: 'field', label: 'Campo del payload' }]} /></div>
                      <button style={{ color: '#94a3b8', display: 'grid', height: 37, placeItems: 'center' }} onClick={() => upT({ rules: d.trigger.rules.filter((_, j) => j !== i) })}><Trash2 size={15} /></button></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginRight: -30 }}>
                      <div><label className="wh-lb" style={{ margin: '13px 0 9px', color: 'var(--text)' }}>{r.type === 'tag' ? 'Etiqueta' : 'Campo'}</label>
                        {r.type === 'tag' ? <SSelect value={r.tag} onChange={v => set({ tag: v })} placeholder="Selecione..." options={tags.map(t => ({ value: t, label: t }))} bold />
                          : <input className="wh-in soft" value={r.tag} onChange={e => set({ tag: e.target.value })} placeholder="{ruta.del.campo}" />}</div>
                      <div><label className="wh-lb" style={{ margin: '13px 0 9px', color: 'var(--text)' }}>Operador</label>
                        <LSelect className="wh-in soft l-selb" bold value={r.op} onChange={v => set({ op: v })} options={r.type === 'tag' ? [{ value: 'has', label: 'Tiene' }, { value: 'not', label: 'No tiene' }] : [{ value: 'eq', label: 'Igual a' }, { value: 'contains', label: 'Contiene' }, { value: 'exists', label: 'Existe' }]} /></div>
                    </div>
                    {r.type === 'field' && r.op !== 'exists' && <input className="wh-in soft" style={{ marginTop: 10 }} value={r.val || ''} onChange={e => set({ val: e.target.value })} placeholder="Valor" />}
                  </div> })}
              <button style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#8b5cf6', fontSize: 13.3, fontWeight: 600, marginTop: 20 }} onClick={() => upT({ rules: [...d.trigger.rules, { type: 'tag', tag: '', op: 'has' }] })}><Plus size={15} />Agregar regla</button>
            </>}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}><button className="wh-btn" style={{ height: 33 }} onClick={() => persist()}><Save size={14} />Guardar cambios</button></div>
      </div>
    </>}

    <LModal open={paste !== null} onClose={() => setPaste(null)} title="Solicitud de ejemplo" desc="Envíe un POST a la URL del webhook o pegue aquí el JSON que envía su sistema para construir el árbol de campos." icon={<Radio size={18} />} width={560}
      footer={<><button className="lb2 g" onClick={() => setPaste(null)}>Cancelar</button><button className="lb2 p" onClick={() => { try { const j = JSON.parse(paste); up({ sample: j }); persist({ ...d, sample: j }, 'Payload de ejemplo cargado'); setPaste(null) } catch { toast('El JSON no es válido', 'err') } }}>Usar este ejemplo</button></>}>
      <textarea className="l-in" style={{ height: 220, padding: 12, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12.5, resize: 'vertical' }} value={paste || ''} onChange={e => setPaste(e.target.value)} placeholder={'{\n  "cliente": { "nombre": "Ana", "telefono": "+51999999999" },\n  "producto": "Curso"\n}'} />
    </LModal>
  </div>
}
