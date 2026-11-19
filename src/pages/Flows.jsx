import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Workflow, Plus, FolderPlus, Download, Search, Folder, FolderOpen, Home, MoreHorizontal, Trash2, Copy, Pause, Play, Archive, ArrowLeft, Pencil, LayoutGrid, Languages, ZoomIn, ZoomOut, Maximize, RotateCcw, MessageSquare, FileText, Tags, QrCode, List, GalleryHorizontal, Hourglass, MessageCircle, Bell, GitBranch, Shuffle, Link2, Activity, Timer, Building, Puzzle, Brain, Bot, Columns3, Wrench, BadgeCheck, CreditCard, Wallet, Phone, Sparkles, PlayCircle, Zap, X, Diamond } from 'lucide-react'
import { useStore, Modal, Menu, Empty, PageHead, useToast, uid, Confirm, nowStr } from '../ui'

export const BLOCKS = {
  inicio: ['Inicio', '#16a34a', PlayCircle, 'Punto de entrada del flujo'],
  mensaje: ['Mensaje', '#3b82f6', MessageSquare, 'Envía texto, imagen, audio o video'],
  template: ['Template WhatsApp', '#0ea5e9', FileText, 'Envía una plantilla aprobada por Meta'],
  etiquetas: ['Etiquetas', '#6366f1', Tags, 'Añadir etiquetas al cliente'],
  pix: ['Botón de pago', '#10b981', QrCode, 'Botón de pago rápido con QR'],
  menu: ['Menú', '#9333ea', List, 'Opciones para que el cliente elija'],
  carrusel: ['Carrusel', '#0891b2', GalleryHorizontal, 'Tarjetas deslizables con botones'],
  esperar: ['Esperar respuesta', '#ea580c', Hourglass, 'Pausa hasta que el cliente responda'],
  controlador: ['Controlador de chat', '#64748b', MessageCircle, 'Abre o cierra la atención'],
  notificacion: ['Notificación', '#f59e0b', Bell, 'Avisa al equipo por WhatsApp o correo'],
  condicional: ['Condicional', '#2563eb', GitBranch, 'Divide el flujo según condiciones'],
  distribuidor: ['Distribuidor', '#d97706', Shuffle, 'Reparte leads entre caminos (A/B)'],
  conexion: ['Conexión de flujo', '#e11d48', Link2, 'Redirige a otro flujo'],
  pixel: ['Pixel', '#ca8a04', Activity, 'Dispara eventos en herramientas de anuncios (Facebook Ads, etc.)'],
  intervalo: ['Intervalo inteligente', '#0891b2', Timer, 'Espera de 01 minuto'],
  departamento: ['Departamento', '#7c3aed', Building, 'Transfiere a un departamento'],
  integracion: ['Integración', '#475569', Puzzle, 'Webhook / API externa'],
  ia: ['Bloque de IA', '#059669', Brain, 'Integración con GPT y Gemini para respuestas inteligentes'],
  agente: ['Agente de IA', '#8b5cf6', Bot, 'Un agente responde dudas y cierra la venta'],
  kanban: ['Kanban', '#db2777', Columns3, 'Mueve el lead a una columna del tablero'],
  manipulador: ['Manipulador', '#ea580c', Wrench, 'Actualizar la fecha de creación del contacto en la base y guardar en un campo personalizado'],
  venta: ['Venta aprobada', '#16a34a', BadgeCheck, 'Registra la venta en el dashboard'],
  pago: ['Pago', '#9333ea', CreditCard, 'Genera un cobro y continúa el flujo'],
  ariapay: ['Aria Pay', '#4f46e5', Wallet, 'Cobro integrado con estados de pago'],
  llamar: ['Llamar', '#0d9488', Phone, 'Realiza una llamada de voz'],
  kie: ['Integración Kie.ai', '#be185d', Sparkles, 'Genera imágenes o videos con IA'],
}
const N = (type, x, y) => ({ id: uid(), type, x, y, title: BLOCKS[type][0], desc: BLOCKS[type][3], stats: [0, 0, 0] })
const seedFlow = (name, status, blocks, date) => {
  const nodes = [N('inicio', 80, 200), ...blocks.map((b, i) => N(b, 330 + Math.floor(i / 2) * 240, 90 + (i % 2) * 220))]
  return { id: uid(), name, status, folder: null, updated: date, nodes, edges: nodes.slice(1).map((n, i) => ({ id: uid(), from: nodes[i].id, to: n.id })) }
}
export const SEED_FLOWS = () => [
  seedFlow('Flujo nuevo', 'pausado', [], '20/10/2026, 10:39 p.m.'),
  seedFlow('Flujo nuevo 1', 'archivado', [], '20/10/2026, 10:39 p.m.'),
  seedFlow('Flujo nuevo 2', 'activo', ['menu', 'manipulador', 'etiquetas', 'menu', 'pago', 'pixel', 'conexion', 'intervalo', 'ariapay', 'ia'], '20/10/2026, 10:39 p.m.'),
  seedFlow('TEMPLATE MÉXICO - SPEI e OXXO', 'activo', ['mensaje', 'esperar', 'menu', 'condicional', 'pago', 'venta', 'notificacion'], '18/11/2026, 11:43 a.m.'),
  seedFlow('Flujo nuevo 3', 'activo', ['mensaje', 'agente', 'kanban', 'venta'], '19/11/2026, 11:04 a.m.'),
]
const STAT = { activo: ['b-green', '#22c55e', 'ACTIVO'], pausado: ['b-amber', '#f59e0b', 'PAUSADO'], archivado: ['b-red', '#ef4444', 'ARCHIVADO'] }

export default function Flows() {
  const nav = useNavigate(); const toast = useToast()
  const [flows, setFlows] = useStore('flows', SEED_FLOWS)
  const [folders, setFolders] = useStore('folders', [{ id: 'f1', name: 'Ventas' }])
  const [folder, setFolder] = useState(null); const [q, setQ] = useState(''); const [st, setSt] = useState('Todos')
  const [mod, setMod] = useState(null); const [name, setName] = useState(''); const [del, setDel] = useState(null); const file = useRef()
  const rows = flows.filter(f => f.folder === folder && f.name.toLowerCase().includes(q.toLowerCase()) && (st === 'Todos' || (st === 'Activos' ? f.status === 'activo' : f.status === 'pausado')))
  const create = () => { const f = { ...seedFlow(name || 'Flujo nuevo ' + flows.length, 'pausado', [], nowStr()), folder }; setFlows(x => [...x, f]); setMod(null); setName(''); toast('Flujo creado'); nav(`/flows/${f.id}/edit`) }
  const upd = (id, p) => setFlows(fs => fs.map(f => f.id === id ? { ...f, ...p, updated: nowStr() } : f))
  const importFlow = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const j = JSON.parse(t); setFlows(x => [...x, { ...j, id: uid(), folder, updated: nowStr() }]); toast('Flujo importado') } catch { toast('Archivo inválido', 'err') } }); e.target.value = '' }
  return <div className="page">
    <PageHead icon={<Workflow size={18} />} title="Flujos" sub="Automatizaciones y flujos de atención">
      <button className="btn btn-p" onClick={() => setMod('flow')}><Plus size={14} />Flujo nuevo</button>
      <button className="btn btn-g" onClick={() => setMod('folder')}><FolderPlus size={14} />Carpeta</button>
      <button className="btn btn-g" onClick={() => file.current.click()}><Download size={14} />Importar</button><input ref={file} type="file" accept=".json" hidden onChange={importFlow} /></PageHead>
    <div className="search" style={{ marginBottom: 12 }}><Search size={13} /><input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar flujos..." /></div>
    <div className="row" style={{ marginBottom: 14 }}>{[['Todos'], ['Activos', '#22c55e'], ['Pausados', '#ef4444']].map(([s, c]) => <button key={s} className={'chip' + (st === s ? ' on' : '')} onClick={() => setSt(s)}>{c && <span style={{ width: 6, height: 6, borderRadius: 6, background: c }} />}{s}</button>)}</div>
    <div className="card" style={{ display: 'flex', minHeight: 'calc(100vh - 220px)', overflow: 'hidden' }}>
      <div style={{ width: 220, borderRight: '1px solid var(--border)', padding: 10, flexShrink: 0 }}>
        <div className="small muted bold" style={{ margin: '4px 4px 8px', fontSize: 9.5 }}>CARPETAS</div>
        <div className={'folder' + (folder === null ? ' on' : '')} onClick={() => setFolder(null)}><Home size={13} />Sin carpeta</div>
        {folders.map(f => <div key={f.id} className={'folder' + (folder === f.id ? ' on' : '')} onClick={() => setFolder(f.id)}>{folder === f.id ? <FolderOpen size={13} /> : <Folder size={13} color="#60a5fa" />}{f.name}<span className="sp" />
          <Menu right trigger={<MoreHorizontal size={13} />} items={[{ icon: <Trash2 size={13} />, label: 'Eliminar carpeta', danger: true, onClick: () => { setFolders(x => x.filter(y => y.id !== f.id)); setFlows(fs => fs.map(x => x.folder === f.id ? { ...x, folder: null } : x)); setFolder(null) } }]} /></div>)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ padding: '12px 14px' }}><b>{folder ? folders.find(f => f.id === folder)?.name : 'Sin carpeta'}</b><span className="small muted">{folders.length} carpeta{folders.length !== 1 && 's'}</span></div>
        <div className="fl-row small muted bold" style={{ cursor: 'default', fontSize: 9.5, background: 'transparent' }}><span>NOMBRE</span><span>ESTADO</span><span>BLOQUES</span><span>ACTUALIZADO</span><span /></div>
        {rows.length ? rows.map((f, i) => <div key={f.id} className="fl-row" style={{ animationDelay: i * .04 + 's', boxShadow: `inset 2px 0 ${STAT[f.status][1]}` }} onClick={() => nav(`/flows/${f.id}/edit`)}>
          <span className="row bold"><span style={{ width: 7, height: 7, borderRadius: 7, background: STAT[f.status][1] }} />{f.name}</span>
          <span><span className={'badge ' + STAT[f.status][0]}>● {STAT[f.status][2]}</span></span>
          <span className="row" style={{ gap: 4 }}><Diamond size={11} color="#8b5cf6" />{f.nodes.length}</span><span className="small">{f.updated}</span>
          <Menu right trigger={<button className="icon-btn" style={{ width: 26, height: 26 }}><MoreHorizontal size={14} /></button>} items={[
            { icon: <Pencil size={13} />, label: 'Editar', onClick: () => nav(`/flows/${f.id}/edit`) },
            { icon: <Copy size={13} />, label: 'Duplicar', onClick: () => { setFlows(x => [...x, { ...f, id: uid(), name: f.name + ' (copia)', updated: nowStr() }]); toast('Flujo duplicado') } },
            f.status === 'activo' ? { icon: <Pause size={13} />, label: 'Pausar', onClick: () => upd(f.id, { status: 'pausado' }) } : { icon: <Play size={13} />, label: 'Activar', onClick: () => upd(f.id, { status: 'activo' }) },
            { icon: <Archive size={13} />, label: 'Archivar', onClick: () => upd(f.id, { status: 'archivado' }) },
            ...folders.filter(x => x.id !== f.folder).map(x => ({ icon: <Folder size={13} />, label: 'Mover a ' + x.name, onClick: () => upd(f.id, { folder: x.id }) })),
            f.folder ? { icon: <Home size={13} />, label: 'Quitar de carpeta', onClick: () => upd(f.id, { folder: null }) } : null,
            { icon: <Download size={13} />, label: 'Exportar', onClick: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(f)])); a.download = f.name + '.json'; a.click() } },
            '-', { icon: <Trash2 size={13} />, label: 'Eliminar', danger: true, onClick: () => setDel(f.id) }].filter(Boolean)} />
        </div>) : <Empty icon={<Workflow size={30} />} title="No hay flujos aquí" text="Cree un flujo nuevo o mueva uno a esta carpeta." action={<button className="btn btn-p" onClick={() => setMod('flow')}><Plus size={14} />Flujo nuevo</button>} />}
      </div></div>
    <Modal open={mod === 'flow'} onClose={() => setMod(null)} title="Flujo nuevo" sub="Dale un nombre a tu automatización" icon={<Workflow size={18} />} footer={<><button className="btn btn-g" onClick={() => setMod(null)}>Cancelar</button><button className="btn btn-p" onClick={create}>Crear y editar</button></>}>
      <label className="lb">Nombre del flujo</label><input className="input" autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} placeholder="Ej: Bienvenida + venta ebook" /></Modal>
    <Modal open={mod === 'folder'} onClose={() => setMod(null)} title="Nueva carpeta" icon={<FolderPlus size={18} />} footer={<><button className="btn btn-g" onClick={() => setMod(null)}>Cancelar</button><button className="btn btn-p" disabled={!name.trim()} onClick={() => { setFolders(f => [...f, { id: uid(), name }]); setName(''); setMod(null); toast('Carpeta creada') }}>Crear</button></>}>
      <label className="lb">Nombre de la carpeta</label><input className="input" autoFocus value={name} onChange={e => setName(e.target.value)} /></Modal>
    <Confirm open={!!del} onClose={() => setDel(null)} onOk={() => { setFlows(f => f.filter(x => x.id !== del)); toast('Flujo eliminado') }} title="Eliminar flujo" />
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
        {flow.nodes.map(n => <rect key={n.id} x={n.x} y={n.y} width={NW} height={80} rx="8" fill={sel === n.id ? '#8b5cf6' : (BLOCKS[n.type] || BLOCKS.mensaje)[1]} opacity=".8" />)}
        {box.current && <rect x={-view.x / view.k} y={-view.y / view.k} width={box.current.clientWidth / view.k} height={box.current.clientHeight / view.k} fill="rgba(139,92,246,.08)" stroke="#8b5cf6" strokeWidth={4} />}
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
