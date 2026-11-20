import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Workflow, Plus, FolderPlus, MoreVertical, Share2, ChevronLeft, TriangleAlert, Save, Download, Search, Folder, FolderOpen, Home, MoreHorizontal, Trash2, Copy, Pause, Play, Archive, ArrowLeft, Pencil, LayoutGrid, Languages, ZoomIn, ZoomOut, Maximize, RotateCcw, MessageSquare, FileText, Tags, QrCode, List, GalleryHorizontal, Hourglass, MessageCircle, Bell, GitBranch, Shuffle, Link2, Activity, Timer, Building, Puzzle, Brain, Bot, Columns3, Wrench, BadgeCheck, CreditCard, Wallet, Phone, Sparkles, PlayCircle, Zap, X, Diamond } from 'lucide-react'
import { useStore, Modal, Menu, Empty, PageHead, useToast, uid, Confirm, nowStr, useOutside } from '../ui'
import { LModal, LSelect } from './leona'

export const BLOCKS = {
  inicio: ['Inicio', '#16a34a', PlayCircle, 'Punto de entrada del flujo'],
  mensaje: ['Mensaje', '#3b82f6', MessageSquare, 'Envía texto, imagen, audio o video'],
  template: ['Template WhatsApp', '#0ea5e9', FileText, 'Envía una plantilla aprobada por Meta'],
  etiquetas: ['Etiquetas', '#639cf1', Tags, 'Añadir etiquetas al cliente'],
  pix: ['Botón de pago', '#10b981', QrCode, 'Botón de pago rápido con QR'],
  menu: ['Menú', '#005ae3', List, 'Opciones para que el cliente elija'],
  carrusel: ['Carrusel', '#0891b2', GalleryHorizontal, 'Tarjetas deslizables con botones'],
  esperar: ['Esperar respuesta', '#ea580c', Hourglass, 'Pausa hasta que el cliente responda'],
  controlador: ['Controlador de chat', '#64748b', MessageCircle, 'Abre o cierra la atención'],
  notificacion: ['Notificación', '#f59e0b', Bell, 'Avisa al equipo por WhatsApp o correo'],
  condicional: ['Condicional', '#2563eb', GitBranch, 'Divide el flujo según condiciones'],
  distribuidor: ['Distribuidor', '#d97706', Shuffle, 'Reparte leads entre caminos (A/B)'],
  conexion: ['Conexión de flujo', '#e11d48', Link2, 'Redirige a otro flujo'],
  pixel: ['Pixel', '#ca8a04', Activity, 'Dispara eventos en herramientas de anuncios (Facebook Ads, etc.)'],
  intervalo: ['Intervalo inteligente', '#0891b2', Timer, 'Espera de 01 minuto'],
  departamento: ['Departamento', '#004fc7', Building, 'Transfiere a un departamento'],
  integracion: ['Integración', '#475569', Puzzle, 'Webhook / API externa'],
  ia: ['Bloque de IA', '#059669', Brain, 'Integración con GPT y Gemini para respuestas inteligentes'],
  agente: ['Agente de IA', '#005ae3', Bot, 'Un agente responde dudas y cierra la venta'],
  kanban: ['Kanban', '#db2777', Columns3, 'Mueve el lead a una columna del tablero'],
  manipulador: ['Manipulador', '#ea580c', Wrench, 'Actualizar la fecha de creación del contacto en la base y guardar en un campo personalizado'],
  venta: ['Venta aprobada', '#16a34a', BadgeCheck, 'Registra la venta en el dashboard'],
  pago: ['Pago', '#005ae3', CreditCard, 'Genera un cobro y continúa el flujo'],
  ariapay: ['Aria Pay', '#4686e5', Wallet, 'Cobro integrado con estados de pago'],
  llamar: ['Llamar', '#0d9488', Phone, 'Realiza una llamada de voz'],
  kie: ['Integración Kie.ai', '#be185d', Sparkles, 'Genera imágenes o videos con IA'],
}
const N = (type, x, y) => ({ id: uid(), type, x, y, title: type === 'inicio' ? 'Início' : BLOCKS[type][0], desc: '', actions: [], stats: [0, 0, 0] })
const seedFlow = (name, status, blocks, date) => {
  const nodes = [N('inicio', 80, 200), ...blocks.map((b, i) => N(b, 420 + Math.floor(i / 2) * 340, 60 + (i % 2) * 230))]
  return { id: uid(), name, status, folder: null, updated: date, nodes, edges: nodes.slice(1).map((n, i) => ({ id: uid(), from: nodes[i].id, to: n.id })) }
}
export const SEED_FLOWS = () => [
  seedFlow('Flujo nuevo', 'pausado', [], '20/10/2026, 10:39 p.m.'),
  seedFlow('Flujo nuevo 1', 'archivado', [], '20/10/2026, 10:39 p.m.'),
  seedFlow('Flujo nuevo 2', 'activo', ['menu', 'manipulador', 'etiquetas', 'menu', 'pago', 'pixel', 'conexion', 'intervalo', 'ariapay', 'ia'], '20/10/2026, 10:39 p.m.'),
  seedFlow('TEMPLATE MÉXICO - SPEI e OXXO', 'activo', ['mensaje', 'esperar', 'menu', 'condicional', 'pago', 'venta', 'notificacion'], '18/11/2026, 11:43 a.m.'),
  seedFlow('Flujo nuevo 3', 'activo', ['mensaje', 'agente', 'kanban', 'venta'], '19/11/2026, 11:04 a.m.'),
]
const STAT = { activo: ['#22c55e', 'ACTIVO', 'rgba(34,197,94,.1)', 'rgba(34,197,94,.35)'], pausado: ['#f59e0b', 'PAUSADO', 'rgba(245,158,11,.1)', 'rgba(245,158,11,.4)'], archivado: ['#ef4444', 'ARCHIVADO', 'rgba(239,68,68,.1)', 'rgba(239,68,68,.35)'] }
const FCOL = [['#3b82f6', 'Azul'], ['#10b981', 'Verde'], ['#005ae3', 'Morado'], ['#f97316', 'Naranja'], ['#ef4444', 'Rojo'], ['#f59e0b', 'Amarillo'], ['#6b7280', 'Gris']]

function PopMenu({ items, children, btnClass, width = 200, alignRight = true }) {
  const [open, setOpen] = useState(false); const ref = useRef(); useOutside(ref, () => setOpen(false))
  return <span ref={ref} style={{ position: 'relative', display: 'inline-flex' }} onClick={e => e.stopPropagation()}>
    <button className={btnClass + (open ? ' open' : '')} onClick={() => setOpen(!open)}>{children}</button>
    {open && <div className="fl-menu" style={{ top: 'calc(100% + 4px)', [alignRight ? 'right' : 'left']: alignRight ? -4 : -8, width }}>
      {items.map((it, i) => it === '-' ? <div key={i} style={{ height: 1, background: 'var(--border2)', margin: '6px 2px' }} /> :
        <button key={i} className={'fl-mi' + (it.danger ? ' dg' : '')} onClick={() => { setOpen(false); it.onClick() }}>{it.icon}{it.label}</button>)}
    </div>}
  </span>
}

export default function Flows() {
  const nav = useNavigate(); const toast = useToast()
  const [flows, setFlows] = useStore('flows', SEED_FLOWS)
  const [folders, setFolders] = useStore('folders', [])
  const [folder, setFolder] = useState(null); const [q, setQ] = useState(''); const [st, setSt] = useState('Todos')
  const [mod, setMod] = useState(null); const [del, setDel] = useState(null); const file = useRef()
  const rows = flows.filter(f => (f.folder || null) === folder && f.name.toLowerCase().includes(q.toLowerCase()) && (st === 'Todos' || (st === 'Activos' ? f.status === 'activo' : f.status === 'pausado')))
  const create = () => {
    const base = 'Flujo nuevo'; let n = base, i = 1; while (flows.some(f => f.name === n)) n = base + ' ' + i++
    const f = { ...seedFlow(n, 'pausado', [], nowStr()), folder }; setFlows(x => [...x, f]); toast('Flujo creado'); nav(`/flows/${f.id}/edit`)
  }
  const upd = (id, p) => setFlows(fs => fs.map(f => f.id === id ? { ...f, ...p, updated: nowStr() } : f))
  const importFlow = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const j = JSON.parse(t); if (!Array.isArray(j.nodes)) throw 0; setFlows(x => [...x, { ...j, id: uid(), folder, updated: nowStr() }]); toast('Flujo importado') } catch { toast('Archivo inválido', 'err') } }); e.target.value = '' }
  const cur = folders.find(f => f.id === folder)
  return <div className="lp">
    <div className="lp-hd"><Workflow size={22} strokeWidth={1.9} style={{ marginLeft: 2, marginTop: 9 }} />
      <div><h1 style={{ marginTop: 0 }}>Flujos</h1><p style={{ marginTop: 5 }}>Automatizaciones y flujos de atención</p></div>
      <div className="r" style={{ marginTop: 4 }}>
        <button className="lp-btn p" onClick={create}><Plus size={17} />Flujo nuevo</button>
        <button className="lp-btn" onClick={() => setMod({ t: 'folder', name: '', color: FCOL[0][0] })}><FolderPlus size={16} />Carpeta</button>
        <button className="lp-btn" onClick={() => file.current.click()}><Download size={16} />Importar</button><input ref={file} type="file" accept=".json" hidden onChange={importFlow} />
      </div></div>
    <div className="lp-srch" style={{ marginTop: 18 }}><Search size={15} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar flujos..." /></div>
    <div className="fl-chips">{[['Todos'], ['Activos', '#22c55e'], ['Pausados', '#ef4444']].map(([s, c]) => <button key={s} className={'fl-chip' + (st === s ? ' on' : '')} onClick={() => setSt(s)}>{c && <i style={{ background: c }} />}{s}</button>)}</div>
    <div className="lp-card fl-panel">
      <div className="fl-side">
        <div className="cap">CARPETAS</div>
        <div className={'fl-fold' + (folder === null ? ' on' : '')} onClick={() => setFolder(null)}><span className="ib"><Home size={11} /></span>Sin carpeta</div>
        {folders.map(f => <div key={f.id} className={'fl-fold' + (folder === f.id ? ' on' : '')} onClick={() => setFolder(f.id)}>
          <span className="ib" style={{ background: folder === f.id ? 'rgba(0,0,0,.35)' : (f.color || '#3b82f6') + '33' }}><Folder size={11} color={folder === f.id ? '#60a5fa' : f.color || '#3b82f6'} /></span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{f.name}</span>
          <span style={{ marginLeft: 'auto' }}><PopMenu btnClass="mb" width={215} items={[
            { icon: <Pencil size={16} />, label: 'Editar carpeta', onClick: () => setMod({ t: 'folder', id: f.id, name: f.name, color: f.color || '#3b82f6' }) },
            { icon: <Trash2 size={16} />, label: 'Eliminar carpeta', danger: true, onClick: () => setDel({ t: 'folder', ...f }) }]}><MoreVertical size={14} /></PopMenu></span>
        </div>)}
      </div>
      <div className="fl-main">
        {cur ? <div className="fl-mh" style={{ height: 56, paddingLeft: 14 }}><button onClick={() => setFolder(null)} style={{ display: 'grid', color: 'var(--text)', marginRight: 10 }}><ChevronLeft size={16} /></button><b>{cur.name}</b></div>
          : <div className="fl-mh"><b>Sin carpeta</b><small>{folders.length} carpeta{folders.length !== 1 ? 's' : ''}</small></div>}
        {rows.length ? <>
          <div className="fl-row fl-th"><span>NOMBRE</span><span>ESTADO</span><span>BLOQUES</span><span>ACTUALIZADO</span><span /></div>
          {rows.map(f => { const S = STAT[f.status] || STAT.pausado; return <div key={f.id} className="fl-row fl-tr" style={{ borderLeftColor: S[0] }} onClick={() => nav(`/flows/${f.id}/edit`)}>
            <span className="nm"><i style={{ background: S[0] }} />{f.name}</span>
            <span><span className="fl-bd" style={{ color: S[0], background: S[2], borderColor: S[3] }}><i />{S[1]}</span></span>
            <span className="bl"><Zap size={13} color="#005ae3" />{f.nodes.length}</span>
            <span className="dt">{f.updated}</span>
            <PopMenu btnClass="mn" width={207} items={[
              { icon: <Pencil size={17} />, label: 'Editar nombre del flujo', onClick: () => setMod({ t: 'rename', id: f.id, name: f.name }) },
              { icon: <Copy size={17} />, label: 'Duplicar', onClick: () => { setFlows(x => [...x, { ...f, id: uid(), name: f.name + ' (copia)', updated: nowStr() }]); toast('Flujo duplicado') } },
              { icon: <Share2 size={17} />, label: 'Compartir', onClick: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(f, null, 2)], { type: 'application/json' })); a.download = f.name + '.json'; a.click(); toast('Flujo exportado para compartir') } },
              { icon: <Languages size={17} />, label: 'Traducir', onClick: () => setMod({ t: 'translate', id: f.id, lang: f.lang || 'es' }) },
              f.status === 'activo' ? { icon: <Pause size={17} />, label: 'Pausar', onClick: () => { upd(f.id, { status: 'pausado' }); toast('Flujo pausado') } } : { icon: <Play size={17} />, label: 'Reactivar', onClick: () => { upd(f.id, { status: 'activo' }); toast('Flujo reactivado') } },
              ...folders.filter(x => x.id !== f.folder).map(x => ({ icon: <Folder size={17} color={x.color || '#3b82f6'} />, label: 'Mover a ' + x.name, onClick: () => { upd(f.id, { folder: x.id }); toast('Movido a ' + x.name) } })),
              ...(f.folder ? [{ icon: <Home size={17} />, label: 'Quitar de carpeta', onClick: () => upd(f.id, { folder: null }) }] : []),
              { icon: <Archive size={17} />, label: 'Archivar', onClick: () => { upd(f.id, { status: 'archivado' }); toast('Flujo archivado') } },
              '-', { icon: <Trash2 size={17} />, label: 'Eliminar', danger: true, onClick: () => setDel({ t: 'flow', ...f }) }]}><MoreVertical size={15} /></PopMenu>
          </div> })}
        </> : <div className="fl-empty"><Workflow size={50} strokeWidth={1.9} className="big" /><h3>No se encontraron flujos</h3><p>Cree su primer flujo de automatización para comenzar.</p>
          <button className="lp-btn p" style={{ marginTop: 26, height: 43, padding: '0 18px' }} onClick={create}><Plus size={17} />Crear primer flujo</button></div>}
      </div>
    </div>

    {mod?.t === 'folder' && <LModal open onClose={() => setMod(null)} title={mod.id ? 'Editar carpeta' : 'Carpeta nueva'} icon={<Folder size={20} />} width={427} bodyStyle={{ padding: '20px 21px 0', overflow: 'visible' }}>
      <label className="l-lbl" style={{ color: 'var(--text)' }}>Nombre de la carpeta</label>
      <input className="l-in ct-in" autoFocus value={mod.name} onChange={e => setMod({ ...mod, name: e.target.value })} placeholder="Escriba el nombre de la carpeta" />
      <label className="l-lbl" style={{ color: 'var(--text)', marginTop: 17 }}>Color de la carpeta</label>
      <LSelect className="l-in ct-in" value={mod.color} onChange={v => setMod({ ...mod, color: v })} bold options={FCOL.map(([c, l]) => ({ value: c, label: l, dot: c }))} />
      <div style={{ borderTop: '1px solid var(--border2)', marginTop: 17, padding: '16px 0 16px', display: 'flex', justifyContent: 'flex-end', gap: 11 }}>
        <button className="lb2 g" onClick={() => setMod(null)}>Cancelar</button>
        <button className="lb2 p" disabled={!mod.name.trim()} onClick={() => { if (mod.id) setFolders(fs => fs.map(x => x.id === mod.id ? { ...x, name: mod.name.trim(), color: mod.color } : x)); else setFolders(fs => [...fs, { id: uid(), name: mod.name.trim(), color: mod.color }]); toast(mod.id ? 'Carpeta actualizada' : 'Carpeta creada'); setMod(null) }}><Save size={15} />{mod.id ? 'Guardar' : 'Crear'}</button>
      </div>
    </LModal>}
    {mod?.t === 'rename' && <LModal open onClose={() => setMod(null)} title="Editar nombre del flujo" icon={<Pencil size={18} />}
      footer={<><button className="lb2 g" onClick={() => setMod(null)}>Cancelar</button><button className="lb2 p" disabled={!mod.name.trim()} onClick={() => { upd(mod.id, { name: mod.name.trim() }); setMod(null); toast('Nombre actualizado') }}>Guardar</button></>}>
      <label className="l-lbl">Nombre del flujo</label><input className="l-in ct-in" autoFocus value={mod.name} onChange={e => setMod({ ...mod, name: e.target.value })} onKeyDown={e => e.key === 'Enter' && mod.name.trim() && (upd(mod.id, { name: mod.name.trim() }), setMod(null))} />
    </LModal>}
    {mod?.t === 'translate' && <LModal open onClose={() => setMod(null)} title="Traducir flujo" desc="Los mensajes del flujo se enviarán en el idioma elegido." icon={<Languages size={19} />}
      footer={<><button className="lb2 g" onClick={() => setMod(null)}>Cancelar</button><button className="lb2 p" onClick={() => { upd(mod.id, { lang: mod.lang }); setMod(null); toast('Idioma del flujo actualizado') }}>Traducir</button></>}>
      <label className="l-lbl">Idioma</label><LSelect className="l-in ct-in" value={mod.lang} onChange={v => setMod({ ...mod, lang: v })} bold options={[['es', 'Español'], ['pt', 'Português'], ['en', 'English']].map(([value, label]) => ({ value, label }))} />
    </LModal>}
    <LModal open={!!del} onClose={() => setDel(null)} title={del?.t === 'folder' ? 'Eliminar carpeta' : 'Eliminar flujo'} icon={<TriangleAlert size={21} color="#ef4444" />} width={482} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55 }}>{del?.t === 'folder' ? `¿Eliminar la carpeta "${del?.name}"? Sus flujos pasarán a "Sin carpeta".` : `¿Eliminar el flujo "${del?.name}"? Esta acción no se puede deshacer.`}</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 13 }}>
        <button className="lb2 g" onClick={() => setDel(null)}>Cancelar</button>
        <button className="lb2 d" onClick={() => { if (del.t === 'folder') { setFolders(x => x.filter(y => y.id !== del.id)); setFlows(fs => fs.map(x => x.folder === del.id ? { ...x, folder: null } : x)); if (folder === del.id) setFolder(null); toast('Carpeta eliminada') } else { setFlows(f => f.filter(x => x.id !== del.id)); toast('Flujo eliminado') } setDel(null) }}>Eliminar</button></div>
    </LModal>
  </div>
}

/* ======================= EDITOR ======================= */
const NW = 168, PY = 34
export function FlowEditor() {
  const { id } = useParams(); const nav = useNavigate(); const toast = useToast()
  const [flows, setFlows] = useStore('flows', SEED_FLOWS)
  const flow = flows.find(f => f.id === id)
  const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const [pal, setPal] = useState(false); const [pq, setPq] = useState(''); const [sel, setSel] = useState(null)
  const [link, setLink] = useState(null); const [edit, setEdit] = useState(null); const [sim, setSim] = useState(-1); const [rename, setRename] = useState(false)
  const box = useRef(); const act = useRef(null)
  const setFlow = useCallback(fn => setFlows(fs => fs.map(f => f.id === id ? { ...fn(f), updated: nowStr() } : f)), [id, setFlows])
  const toWorld = (cx, cy) => { const r = box.current.getBoundingClientRect(); return { x: (cx - r.left - view.x) / view.k, y: (cy - r.top - view.y) / view.k } }
  useEffect(() => {
    const move = e => {
      const a = act.current; if (!a) return
      if (a.t === 'pan') setView(v => ({ ...v, x: a.vx + e.clientX - a.sx, y: a.vy + e.clientY - a.sy }))
      if (a.t === 'node') setFlow(f => ({ ...f, nodes: f.nodes.map(n => n.id === a.id ? { ...n, x: a.nx + (e.clientX - a.sx) / view.k, y: a.ny + (e.clientY - a.sy) / view.k } : n) }))
      if (a.t === 'link') setLink(l => l && { ...l, ...toWorld(e.clientX, e.clientY) })
    }
    const up = () => { if (act.current?.t === 'link') setLink(null); act.current = null; box.current?.classList.remove('panning') }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  })
  useEffect(() => {
    const el = box.current; if (!el) return
    const wheel = e => { e.preventDefault(); const r = el.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top
      setView(v => { const k = Math.min(2, Math.max(.3, v.k * (e.deltaY < 0 ? 1.1 : .9))); return { k, x: mx - (mx - v.x) * k / v.k, y: my - (my - v.y) * k / v.k } }) }
    el.addEventListener('wheel', wheel, { passive: false }); return () => el.removeEventListener('wheel', wheel)
  }, [flow?.id])
  useEffect(() => {
    const k = e => { if ((e.key === 'Delete' || e.key === 'Backspace') && sel && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) removeNode(sel) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  })
  if (!flow) return <div className="page"><Empty icon={<Workflow size={30} />} title="Flujo no encontrado" action={<button className="btn btn-p" onClick={() => nav('/flows')}>Volver</button>} /></div>
  const addNode = type => { const r = box.current.getBoundingClientRect(); const p = toWorld(r.left + r.width / 2 - 80 + Math.random() * 60, r.top + r.height / 2 - 40 + Math.random() * 60); const n = N(type, p.x, p.y); setFlow(f => ({ ...f, nodes: [...f.nodes, n] })); setSel(n.id); setPal(false); toast(BLOCKS[type][0] + ' agregado') }
  function removeNode(nid) { setFlow(f => ({ ...f, nodes: f.nodes.filter(n => n.id !== nid), edges: f.edges.filter(e => e.from !== nid && e.to !== nid) })); setSel(null) }
  const dup = n => setFlow(f => ({ ...f, nodes: [...f.nodes, { ...n, id: uid(), x: n.x + 30, y: n.y + 30 }] }))
  const fit = () => { if (!flow.nodes.length) return setView({ x: 0, y: 0, k: 1 }); const r = box.current.getBoundingClientRect(); const xs = flow.nodes.map(n => n.x), ys = flow.nodes.map(n => n.y)
    const minX = Math.min(...xs) - 40, minY = Math.min(...ys) - 40, w = Math.max(...xs) + NW + 40 - minX, h = Math.max(...ys) + 160 - minY, k = Math.min(1.2, r.width / w, r.height / h); setView({ k, x: -minX * k + (r.width - w * k) / 2, y: -minY * k + (r.height - h * k) / 2 }) }
  const simulate = () => {
    const order = []; let cur = flow.nodes.find(n => n.type === 'inicio') || flow.nodes[0]; const seen = new Set()
    while (cur && !seen.has(cur.id)) { seen.add(cur.id); order.push(cur.id); const e = flow.edges.find(x => x.from === cur.id); cur = e && flow.nodes.find(n => n.id === e.to) }
    order.forEach((nid, i) => setTimeout(() => { setSim(nid); setFlow(f => ({ ...f, nodes: f.nodes.map(n => n.id === nid ? { ...n, stats: [n.stats[0] + 1, n.stats[1] + 1, 100] } : n) })) }, i * 600))
    setTimeout(() => { setSim(-1); toast('Simulación completada: ' + order.length + ' bloques') }, order.length * 600 + 200)
  }
  const nodeMap = Object.fromEntries(flow.nodes.map(n => [n.id, n]))
  const path = (a, b) => { const dx = Math.max(40, Math.abs(b.x - a.x) / 2); return `M${a.x},${a.y} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}` }
  const st = flow.status
  const xs = flow.nodes.map(n => n.x), ys = flow.nodes.map(n => n.y); const mmX = Math.min(0, ...xs) - 50, mmY = Math.min(0, ...ys) - 50, mmW = Math.max(800, ...xs.map(x => x + 250)) - mmX, mmH = Math.max(500, ...ys.map(y => y + 200)) - mmY
  return <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
    <div className="ed-head"><button className="icon-btn" onClick={() => nav('/flows')}><ArrowLeft size={16} /></button>
      {rename ? <input className="input" autoFocus style={{ width: 240 }} defaultValue={flow.name} onBlur={e => { setFlow(f => ({ ...f, name: e.target.value || f.name })); setRename(false) }} onKeyDown={e => e.key === 'Enter' && e.target.blur()} />
        : <><b style={{ fontSize: 15 }}>{flow.name}</b><button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setRename(true)}><Pencil size={12} /></button></>}
      <span className={'badge ' + STAT[st][0]}>● {STAT[st][2]}</span><span className="sp" />
      <button className="btn btn-p btn-sm" style={{ borderRadius: 20 }} onClick={() => setEdit({ ai: true })}><Bot size={13} />AriaAI</button>
      <button className="btn btn-g btn-sm" onClick={() => addNode('ariapay')}>AriaPay</button>
      <button className="btn btn-g btn-sm" onClick={() => { setFlow(f => ({ ...f, status: st === 'activo' ? 'pausado' : 'activo' })); toast(st === 'activo' ? 'Flujo pausado' : 'Flujo activado') }}>{st === 'activo' ? <><Pause size={12} />Pausar</> : <><Play size={12} />Activar</>}</button>
      <button className="btn btn-g btn-sm" onClick={() => toast('Traducción generada (demo)', 'info')}><Languages size={12} />Traducir</button>
      <button className="btn btn-g btn-sm" onClick={() => { setFlow(f => ({ ...f, status: 'archivado' })); toast('Flujo archivado'); nav('/flows') }}><Archive size={12} />Archivar</button></div>
    <div style={{ flex: 1, position: 'relative' }}>
      <div className="tool-top"><button className="btn btn-p" onClick={() => setPal(!pal)}><LayoutGrid size={14} />Herramientas</button><button className="btn btn-g" onClick={simulate}><Play size={13} />Simular</button></div>
      {pal && <div className="palette"><div style={{ padding: 8 }}><div className="search"><Search size={13} /><input className="input" autoFocus value={pq} onChange={e => setPq(e.target.value)} placeholder="Buscar bloques..." /></div></div>
        <div style={{ overflowY: 'auto', padding: '0 6px 8px' }}>{Object.entries(BLOCKS).filter(([k, b]) => k !== 'inicio' && b[0].toLowerCase().includes(pq.toLowerCase())).map(([k, [n, c, Ic]]) => <div key={k} className="pal-item" onClick={() => addNode(k)}><Ic size={15} color={c} />{n}</div>)}</div></div>}
      <div className="canvas" ref={box} style={{ backgroundSize: `${20 * view.k}px ${20 * view.k}px`, backgroundPosition: `${view.x}px ${view.y}px` }}
        onMouseDown={e => { if (e.target === box.current || e.target.tagName === 'svg') { act.current = { t: 'pan', sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y }; box.current.classList.add('panning'); setSel(null); setPal(false) } }}>
        <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${view.x}px,${view.y}px) scale(${view.k})`, transformOrigin: '0 0' }}>
          <svg style={{ position: 'absolute', overflow: 'visible', left: 0, top: 0, width: 1, height: 1 }}>
            {flow.edges.map(e => { const a = nodeMap[e.from], b = nodeMap[e.to]; if (!a || !b) return null
              return <g key={e.id} style={{ cursor: 'pointer' }} onClick={() => { setFlow(f => ({ ...f, edges: f.edges.filter(x => x.id !== e.id) })); toast('Conexión eliminada', 'info') }}>
                <path d={path({ x: a.x + NW, y: a.y + PY }, { x: b.x, y: b.y + PY })} stroke="transparent" strokeWidth="14" fill="none" />
                <path className={'edge' + (sim === e.from || st === 'activo' ? ' edge-anim' : '')} d={path({ x: a.x + NW, y: a.y + PY }, { x: b.x, y: b.y + PY })} /></g> })}
            {link && <path className="edge edge-anim" d={path({ x: link.sx, y: link.sy }, link)} />}
          </svg>
          {flow.nodes.map(n => { const [, c, Ic] = BLOCKS[n.type] || BLOCKS.mensaje; return <div key={n.id} className={'node' + (sel === n.id || sim === n.id ? ' sel' : '')} style={{ left: n.x, top: n.y, transform: sim === n.id ? 'scale(1.06)' : null, transition: 'transform .25s, box-shadow .25s' }} onMouseDown={e => { e.stopPropagation(); setSel(n.id) }}
            onMouseUp={() => { if (link && link.from !== n.id) { setFlow(f => ({ ...f, edges: [...f.edges.filter(x => !(x.from === link.from && x.to === n.id)), { id: uid(), from: link.from, to: n.id }] })); toast('Bloques conectados') } }}>
            <div className="node-h" style={{ background: c }} onMouseDown={e => { e.stopPropagation(); setSel(n.id); act.current = { t: 'node', id: n.id, sx: e.clientX, sy: e.clientY, nx: n.x, ny: n.y } }}>
              <span className="ni"><Ic size={11} /></span>{n.title}<span className="na"><button onMouseDown={e => e.stopPropagation()} onClick={() => setEdit(n)}><Pencil size={10} /></button><button onMouseDown={e => e.stopPropagation()} onClick={() => dup(n)}><Copy size={10} /></button>{n.type !== 'inicio' && <button onMouseDown={e => e.stopPropagation()} onClick={() => removeNode(n.id)}><Trash2 size={10} /></button>}</span></div>
            <div className="node-stats"><div>Entradas<b>{n.stats[0]}</b></div><div>Avances<b>{n.stats[1]}</b></div><div>Tasa<b>{n.stats[2]}%</b></div></div>
            {n.type !== 'inicio' && <div className="node-desc">{n.desc}</div>}
            {n.type !== 'inicio' && <span className="port in" style={{ top: PY }} />}
            <span className="port out" style={{ top: PY }} onMouseDown={e => { e.stopPropagation(); const s = { from: n.id, sx: n.x + NW, sy: n.y + PY }; setLink({ ...s, x: s.sx, y: s.sy }); act.current = { t: 'link' } }} />
          </div> })}
        </div>
        {!flow.nodes.length && <div className="empty" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><Workflow size={30} className="muted" /><h3>Lienzo vacío</h3><p>Abre Herramientas para agregar bloques</p></div>}
      </div>
      <div className="zoomctl"><button className="icon-btn" onClick={() => setView(v => ({ ...v, k: Math.max(.3, v.k * .85) }))}><ZoomOut size={14} /></button><button className="icon-btn" onClick={() => setView(v => ({ ...v, k: Math.min(2, v.k * 1.15) }))}><ZoomIn size={14} /></button><button className="icon-btn" onClick={fit}><Maximize size={14} /></button><button className="icon-btn" onClick={() => setView({ x: 0, y: 0, k: 1 })}><RotateCcw size={14} /></button><span className="small muted" style={{ alignSelf: 'center', padding: '0 6px' }}>{Math.round(view.k * 100)}%</span></div>
      <div className="minimap"><svg width="100%" height="100%" viewBox={`${mmX} ${mmY} ${mmW} ${mmH}`}>
        {flow.nodes.map(n => <rect key={n.id} x={n.x} y={n.y} width={NW} height={80} rx="8" fill={sel === n.id ? '#005ae3' : (BLOCKS[n.type] || BLOCKS.mensaje)[1]} opacity=".8" />)}
        {box.current && <rect x={-view.x / view.k} y={-view.y / view.k} width={box.current.clientWidth / view.k} height={box.current.clientHeight / view.k} fill="rgba(0,90,227,.08)" stroke="#005ae3" strokeWidth={4} />}
      </svg></div>
    </div>
    <Modal open={!!edit && !edit.ai} onClose={() => setEdit(null)} title="Editar bloque" sub={edit && BLOCKS[edit.type]?.[0]} icon={<Pencil size={16} />} footer={<><button className="btn btn-g" onClick={() => setEdit(null)}>Cancelar</button><button className="btn btn-p" onClick={() => { setFlow(f => ({ ...f, nodes: f.nodes.map(n => n.id === edit.id ? edit : n) })); setEdit(null); toast('Bloque guardado') }}>Guardar</button></>}>
      {edit && !edit.ai && <><div className="field"><label className="lb">Título</label><input className="input" value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} /></div>
        <div className="field"><label className="lb">{edit.type === 'mensaje' ? 'Mensaje' : 'Descripción'}</label><textarea className="input" value={edit.desc} onChange={e => setEdit({ ...edit, desc: e.target.value })} /></div></>}</Modal>
    <Modal open={!!edit?.ai} onClose={() => setEdit(null)} title="AriaAI" sub="Describe el flujo y la IA lo construye por ti" icon={<Sparkles size={18} />} footer={<><button className="btn btn-g" onClick={() => setEdit(null)}>Cancelar</button><button className="btn btn-p" onClick={() => {
      const types = ['mensaje', 'esperar', 'menu', 'agente', 'pago', 'venta']; const base = flow.nodes.length ? Math.max(...flow.nodes.map(n => n.y)) + 180 : 120
      const ns = types.map((t, i) => N(t, 120 + i * 230, base + (i % 2) * 50)); setFlow(f => ({ ...f, nodes: [...f.nodes, ...ns], edges: [...f.edges, ...ns.slice(1).map((n, i) => ({ id: uid(), from: ns[i].id, to: n.id }))] })); setEdit(null); toast('Flujo generado con IA ✨') }}><Zap size={13} />Generar</button></>}>
      <textarea className="input" autoFocus placeholder="Ej: Saluda al cliente, pregunta qué producto quiere, el agente de IA resuelve dudas y envía el link de pago." style={{ minHeight: 110 }} /></Modal>
  </div>
}
