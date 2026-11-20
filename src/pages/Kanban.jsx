import { useState, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Kanban as KIcon, Plus, Search, Trash2, ChevronRight, Filter, ChartColumn, Download, MoreVertical, Zap, Trophy, EyeOff, Pencil, X, TriangleAlert, Users, TrendingUp, ShoppingCart, DollarSign, Phone, GripVertical } from 'lucide-react'
import { useStore, useToast, uid, useOutside, downloadCSV } from '../ui'
import { LModal, LSelect, Toggle } from './leona'

const COLS = [['auto', 'Automático', null], ['teal', 'Verde azulado', '#0d9488'], ['terra', 'Terracota', '#c2410c'], ['indigo', 'Índigo', '#4f46e5'], ['amber', 'Ámbar', '#d97706'], ['rose', 'Rosa', '#e11d48'], ['ocean', 'Océano', '#0284c7'], ['olive', 'Oliva', '#65a30d']]
const AUTO = COLS.slice(1).map(c => c[2])
const DEF = [['Nuevo', '#0d9488'], ['Calificación', '#c2410c'], ['Ganado', '#4f46e5', true]]
const ago = t => { const m = Math.floor((Date.now() - (t || Date.now())) / 6e4); return m < 1 ? 'hace menos de un minuto' : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.floor(m / 60)} h` : `hace ${Math.floor(m / 1440)} días` }
const num = v => +String(v || 0).replace(',', '.') || 0
const stats = b => {
  const cards = b.cols.reduce((a, c) => a + c.cards.length, 0)
  const conv = b.cols.filter(c => c.conv).reduce((a, c) => a + c.cards.length, 0)
  const value = b.cols.reduce((a, c) => a + c.cards.reduce((s, x) => s + num(x.value), 0), 0)
  const fact = b.cols.filter(c => c.conv).reduce((a, c) => a + c.cards.reduce((s, x) => s + num(x.value), 0), 0)
  return { cards, conv, value, fact, rate: cards ? Math.round(conv / cards * 100) : 0 }
}

export default function Kanban() {
  const { id } = useParams()
  return id ? <Board id={id} /> : <Boards />
}

/* ======================= LISTA DE TABLEROS ======================= */
function Boards() {
  const nav = useNavigate(); const toast = useToast()
  const [boards, setBoards] = useStore('boards', [])
  const [cur] = useStore('currency', 'PEN')
  const [open, setOpen] = useState(false); const [del, setDel] = useState(null); const [q, setQ] = useState('')
  const create = name => {
    const now = Date.now()
    setBoards(x => [...x, { id: uid(), name: name.trim(), created: now, updated: now, cols: DEF.map(([n, c, conv]) => ({ id: uid(), name: n, color: c, conv: !!conv, cards: [] })) }])
    setOpen(false); toast('Kanban creado')
  }
  const all = boards.map(stats)
  const tot = { cards: all.reduce((a, s) => a + s.cards, 0), value: all.reduce((a, s) => a + s.value, 0), rate: all.length ? Math.round(all.reduce((a, s) => a + s.rate, 0) / all.length) : 0 }
  const list = boards.filter(b => b.name.toLowerCase().includes(q.toLowerCase()))
  return <div className="kb">
    <div className="kb-hd"><KIcon size={20} style={{ marginLeft: 6 }} /><div><h1>Tableros Kanban</h1><p>Pipeline de ventas y gestión visual</p></div>
      <div className="r"><button className="kb-btn p" onClick={() => setOpen(true)}><Plus size={16} />Nuevo Kanban</button></div></div>
    {boards.length === 0 ? <div className="kb-empty">
      <KIcon size={34} className="big" />
      <h3>No hay tableros Kanban</h3>
      <p>Cree su primer tablero para seguir el pipeline de ventas en un solo lugar.</p>
      <button className="kb-btn p" style={{ marginTop: 26 }} onClick={() => setOpen(true)}><Plus size={16} />Nuevo Kanban</button>
    </div> : <>
      <div className="kb-stats">
        <div className="kb-st"><b>{boards.length}</b><span>TABLEROS</span></div>
        <div className="kb-st"><b>{tot.cards}</b><span>CARDS EN EL PIPELINE</span></div>
        <div className="kb-st"><b>{cur} {tot.value.toLocaleString('es-PE')}</b><span>VALOR DEL PIPELINE</span></div>
        <div className="kb-st"><b>{tot.rate}%</b><span>CONVERSIÓN PROMEDIO</span></div>
      </div>
      <div className="kb-search l-ico"><Search size={15} /><input className="l-in" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar tablero..." /></div>
      <div className="kb-grid">
        {list.map(b => { const s = stats(b); return <div key={b.id} className="kb-bc" onClick={() => nav('/crms/' + b.id)}>
          <div className={'fn' + (b.cols.length ? '' : ' none')}>{b.cols.map((c, i) => <i key={c.id} style={{ flex: 1, background: c.color || AUTO[i % 7] }} />)}</div>
          <div className="fl">{b.cols.length ? b.cols.map((c, i) => <span key={c.id} style={{ color: c.color || AUTO[i % 7] }}>{c.name}</span>) : <span>Sin columnas todavía</span>}</div>
          <div className="nm"><b>{b.name}</b><span className="kb-badge">{b.cols.length} columnas</span></div>
          <div className="mt"><span><b style={{ color: 'var(--text)' }}>{s.cards}</b> <span style={{ color: 'var(--text)' }}>cards</span></span><span style={{ color: '#22c55e', fontWeight: 600 }}>{cur} {s.value.toLocaleString('es-PE')}</span><span style={{ color: '#8b5cf6' }}><b>{s.conv}</b> <span style={{ color: 'var(--text)' }}>conv.</span></span><span style={{ color: '#ef4444', fontWeight: 600 }}>{s.rate}%</span></div>
          <div className="pg"><i style={{ width: s.rate + '%' }} /></div>
          <div className="up">Actualizado {ago(b.updated || b.created)}</div>
          <button className="del" title="Eliminar Kanban" onClick={e => { e.stopPropagation(); setDel(b) }}><Trash2 size={14} /></button>
        </div> })}
        <button className="kb-new" onClick={() => setOpen(true)}><Plus size={21} />Nuevo tablero</button>
      </div>
    </>}
    <NewBoard open={open} onClose={() => setOpen(false)} onCreate={create} />
    <LModal open={!!del} onClose={() => setDel(null)} title="Eliminar Kanban" icon={<TriangleAlert size={21} color="#ef4444" />} width={482} bodyStyle={{ padding: '22px 24px 0' }}
      footer={null}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55, color: 'var(--text)' }}>¿Eliminar el Kanban "{del?.name}"? Esta acción no se puede deshacer.</p>
      <div style={{ borderTop: '1px solid var(--border)', margin: '19px 0 0', padding: '16px 0 16px', display: 'flex', justifyContent: 'flex-end', gap: 13 }}>
        <button className="lb2 g" onClick={() => setDel(null)}>Cancelar</button>
        <button className="lb2 d" onClick={() => { setBoards(x => x.filter(b => b.id !== del.id)); setDel(null); toast('Kanban eliminado') }}>Eliminar</button></div>
    </LModal>
  </div>
}

function NewBoard({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  const go = () => { if (name.trim()) { onCreate(name); setName('') } }
  return <LModal open={open} onClose={onClose} title="Nuevo Kanban" desc="Asigne un nombre al tablero. Las columnas predeterminadas ya vienen listas para empezar." icon={<KIcon size={19} />}
    footer={<><button className="lb2 g" onClick={onClose} style={{ minWidth: 99 }}>Cancelar</button><button className="lb2 p" style={{ background: '#9b6cf8', minWidth: 82 }} disabled={!name.trim()} onClick={go}>Crear</button></>}>
    <label className="l-lbl">Nombre del Kanban</label>
    <input className="l-in soft" autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} placeholder="Escriba el nombre del Kanban..." style={{ fontWeight: name ? 700 : 400 }} />
    <label className="l-lbl" style={{ marginTop: 20 }}>Vista previa</label>
    <div className="kb-pv">
      <div className="fn">{DEF.map(([, c]) => <i key={c} style={{ flex: 1, background: c }} />)}</div>
      <div className="fl">{DEF.map(([n, c]) => <span key={n} style={{ color: c === '#4f46e5' ? '#6366f1' : c === '#c2410c' ? '#ea580c' : '#14b8a6' }}>{n}</span>)}</div>
      <div className="nm"><b>{name || 'Nombre del Kanban'}</b><span className="kb-badge">3 columnas</span></div>
      <p>Así aparece el tablero en la lista, con el embudo arriba.</p>
    </div>
  </LModal>
}

/* ======================= TABLERO ======================= */
function Board({ id }) {
  const nav = useNavigate(); const toast = useToast()
  const [boards, setBoards] = useStore('boards', [])
  const [cur] = useStore('currency', 'PEN')
  const board = boards.find(b => b.id === id)
  const [showF, setShowF] = useState(false); const [showS, setShowS] = useState(false)
  const blank = { stage: 'all', from: '', to: '', tags: [] }
  const [draft, setDraft] = useState(blank); const [flt, setFlt] = useState(blank)
  const [colM, setColM] = useState(null); const [cardM, setCardM] = useState(null); const [ren, setRen] = useState(null); const [delCol, setDelCol] = useState(null)
  const [drag, setDrag] = useState(null); const [over, setOver] = useState(null)
  if (!board) return <div className="kb"><div className="kb-empty"><KIcon size={34} className="big" /><h3>Tablero no encontrado</h3><button className="kb-btn p" style={{ marginTop: 22 }} onClick={() => nav('/crms')}>Volver a Kanban</button></div></div>
  const setBoard = fn => setBoards(bs => bs.map(b => b.id === id ? { ...fn(b), updated: Date.now() } : b))
  const tagsAll = [...new Set(board.cols.flatMap(c => c.cards.flatMap(x => x.tags || [])))]
  const pass = card => (!flt.from || (card.updated || 0) >= +new Date(flt.from + 'T00:00')) && (!flt.to || (card.updated || 0) < +new Date(flt.to + 'T00:00') + 864e5) && (!flt.tags.length || flt.tags.some(t => (card.tags || []).includes(t)))
  const cols = board.cols.filter(c => flt.stage === 'all' || c.id === flt.stage)
  const fOn = JSON.stringify(flt) !== JSON.stringify(blank)
  const drop = colId => {
    if (!drag) return
    setBoard(b => { const card = b.cols.find(c => c.id === drag.from)?.cards.find(x => x.id === drag.id); if (!card || drag.from === colId) return b
      return { ...b, cols: b.cols.map(c => c.id === drag.from ? { ...c, cards: c.cards.filter(x => x.id !== drag.id) } : c.id === colId ? { ...c, cards: [...c.cards, { ...card, updated: Date.now() }] } : c) } })
    setDrag(null); setOver(null)
  }
  const exportCSV = () => {
    const rows = board.cols.flatMap(c => c.cards.map(x => [x.name, x.phone || '', x.value || '', c.name, (x.tags || []).join('; '), new Date(x.updated || Date.now()).toLocaleString('es-PE')]))
    if (!rows.length) return toast('No hay leads para exportar', 'info')
    downloadCSV(`kanban-${board.name}.csv`, [['Nombre', 'Teléfono', 'Valor', 'Etapa', 'Etiquetas', 'Actualizado'], ...rows]); toast('Planilla exportada')
  }
  const s = stats(board)
  return <div className="kb" style={{ paddingTop: 25 }}>
    <div className="kb-crumb"><a onClick={() => nav('/crms')}>Kanban</a><ChevronRight size={14} /><b>{board.name}</b></div>
    <div className="kb-hd"><KIcon size={20} style={{ marginLeft: 6 }} /><div><h1>{board.name}</h1><p>Administrar columnas y tarjetas del Kanban</p></div>
      <div className="r">
        <button className={'kb-btn' + (showF || fOn ? ' p' : '')} onClick={() => setShowF(!showF)}><Filter size={15} />Filtros</button>
        <button className={'kb-btn' + (showS ? ' p' : '')} onClick={() => setShowS(!showS)}><ChartColumn size={15} />{showS ? 'Ocultar estadísticas' : 'Ver estadísticas'}</button>
        <button className="kb-btn" onClick={exportCSV}><Download size={15} />Exportar leads a planilla</button>
        <button className="kb-btn p" onClick={() => setColM({ name: '', color: 'auto', conv: false })}><Plus size={16} />Añadir columna</button>
      </div></div>

    {showF && <div className="kb-filt">
      <div className="row1">
        <div style={{ alignSelf: 'flex-start' }}><span className="cap">RESPONSABLE</span><LSelect value="all" onChange={() => { }} options={[{ value: 'all', label: 'Todos los responsables' }]} disabled style={{ width: 210 }} />
          <div style={{ fontSize: 11.5, fontStyle: 'italic', color: '#94a3b8', marginTop: 9 }}>Será implementado</div></div>
        <div style={{ alignSelf: 'flex-start', marginTop: 19 }}><span className="cap">ETAPA</span><LSelect value={draft.stage} onChange={v => setDraft({ ...draft, stage: v })} options={[{ value: 'all', label: 'Todas las etapas' }, ...board.cols.map(c => ({ value: c.id, label: c.name, dot: c.color }))]} style={{ width: 238 }} /></div>
        <div style={{ alignSelf: 'flex-start', marginTop: 19 }}><span className="cap">ACTUALIZADO DESDE</span><input type="date" className="l-in" style={{ width: 142 }} value={draft.from} onChange={e => setDraft({ ...draft, from: e.target.value })} /></div>
        <div style={{ alignSelf: 'flex-start', marginTop: 19 }}><span className="cap">ACTUALIZADO HASTA</span><input type="date" className="l-in" style={{ width: 142 }} value={draft.to} onChange={e => setDraft({ ...draft, to: e.target.value })} /></div>
        <button className="kb-btn p" style={{ alignSelf: 'flex-start', marginTop: 46, height: 33 }} onClick={() => { setFlt(draft); toast('Filtros aplicados') }}>Aplicar filtros</button>
        <button className="kb-btn" style={{ alignSelf: 'flex-start', marginTop: 46, height: 33 }} onClick={() => { setDraft(blank); setFlt(blank) }}><X size={15} />Limpiar</button>
      </div>
      <span className="cap" style={{ marginTop: 14 }}>ETIQUETAS (CUALQUIERA)</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{tagsAll.length ? tagsAll.map(t => <button key={t} className={'kb-chip' + (draft.tags.includes(t) ? ' on' : '')} onClick={() => setDraft({ ...draft, tags: draft.tags.includes(t) ? draft.tags.filter(x => x !== t) : [...draft.tags, t] })}>{t}</button>)
        : <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Aún no hay etiquetas en las tarjetas</span>}</div>
    </div>}

    {showS && <Stats board={board} s={s} cur={cur} />}

    <div className="kb-cols">
      {cols.map((col, ci) => { const color = col.color || AUTO[ci % 7]; const cards = col.cards.filter(pass)
        return <div key={col.id} className="kb-col" style={{ borderTopColor: color }}>
          <div className="kb-colh"><span className="dt" style={{ background: color }} /><b>{col.name}</b><span className="kb-cnt">{cards.length}</span>
            {col.conv && <Trophy size={13} color="#f59e0b" title="Columna de conversión" />}
            <ColMenu col={col} onConv={() => { setBoard(b => ({ ...b, cols: b.cols.map(c => c.id === col.id ? { ...c, conv: !c.conv } : c) })); toast(col.conv ? 'Ya no cuenta como conversión' : 'Marcada como columna de conversión') }}
              onRename={() => setRen({ id: col.id, name: col.name })} onAdd={() => setCardM({ col: col.id, card: { name: '', phone: '', value: '', tags: '' } })} onDel={() => setDelCol(col)} /></div>
          <div className={'kb-colb' + (over === col.id ? ' over' : '')} onDragOver={e => { e.preventDefault(); setOver(col.id) }} onDragLeave={() => setOver(null)} onDrop={() => drop(col.id)}>
            {cards.map(card => <div key={card.id} draggable className={'kb-card' + (drag?.id === card.id ? ' drag' : '')} onDragStart={() => setDrag({ id: card.id, from: col.id })} onDragEnd={() => { setDrag(null); setOver(null) }} onClick={() => setCardM({ col: col.id, card: { ...card, tags: (card.tags || []).join(', ') } })}>
              <div className="n"><GripVertical size={13} style={{ color: 'var(--muted)' }} />{card.name}</div>
              {card.phone && <div className="s"><Phone size={11} />{card.phone}</div>}
              {num(card.value) > 0 && <div className="s" style={{ color: '#22c55e', fontWeight: 700 }}>{cur} {num(card.value).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>}
              {(card.tags || []).length > 0 && <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>{card.tags.map(t => <span key={t} className="kb-badge" style={{ marginLeft: 0 }}>{t}</span>)}</div>}
            </div>)}
            {cards.length === 0 && <div className="kb-drop">Arrastra cards aquí</div>}
          </div>
          <button className="kb-colf" onClick={() => setCardM({ col: col.id, card: { name: '', phone: '', value: '', tags: '' } })}><Plus size={15} />Añadir tarjeta</button>
        </div> })}
    </div>

    {colM && <NewColumn idx={board.cols.length} onClose={() => setColM(null)} onCreate={c => { setBoard(b => ({ ...b, cols: [...b.cols, { id: uid(), name: c.name, color: c.color === 'auto' ? AUTO[b.cols.length % 7] : COLS.find(x => x[0] === c.color)[2], conv: c.conv, cards: [] }] })); setColM(null); toast('Columna creada') }} />}
    <LModal open={!!ren} onClose={() => setRen(null)} title="Renombrar columna" icon={<Pencil size={18} />} footer={<><button className="lb2 g" onClick={() => setRen(null)}>Cancelar</button><button className="lb2 p" disabled={!ren?.name.trim()} onClick={() => { setBoard(b => ({ ...b, cols: b.cols.map(c => c.id === ren.id ? { ...c, name: ren.name.trim() } : c) })); setRen(null); toast('Columna renombrada') }}>Guardar</button></>}>
      {ren && <><label className="l-lbl">Nombre de la columna</label><input className="l-in soft" autoFocus value={ren.name} onChange={e => setRen({ ...ren, name: e.target.value })} /></>}
    </LModal>
    <LModal open={!!delCol} onClose={() => setDelCol(null)} title="Eliminar columna" icon={<TriangleAlert size={21} color="#ef4444" />} width={482} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55 }}>¿Eliminar la columna "{delCol?.name}" y sus {delCol?.cards.length || 0} tarjetas? Esta acción no se puede deshacer.</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 13 }}>
        <button className="lb2 g" onClick={() => setDelCol(null)}>Cancelar</button>
        <button className="lb2 d" onClick={() => { setBoard(b => ({ ...b, cols: b.cols.filter(c => c.id !== delCol.id) })); setDelCol(null); toast('Columna eliminada') }}>Eliminar</button></div>
    </LModal>
    <LModal open={!!cardM} onClose={() => setCardM(null)} title={cardM?.card.id ? 'Editar tarjeta' : 'Añadir tarjeta'} desc="Datos del lead dentro de esta etapa del Kanban." icon={<Plus size={19} />}
      footer={<>{cardM?.card.id && <button className="lb2" style={{ color: '#ef4444', marginRight: 'auto' }} onClick={() => { setBoard(b => ({ ...b, cols: b.cols.map(c => c.id === cardM.col ? { ...c, cards: c.cards.filter(x => x.id !== cardM.card.id) } : c) })); setCardM(null); toast('Tarjeta eliminada') }}><Trash2 size={15} />Eliminar</button>}
        <button className="lb2 g" onClick={() => setCardM(null)}>Cancelar</button>
        <button className="lb2 p" disabled={!cardM?.card.name.trim()} onClick={() => { const c = { ...cardM.card, tags: cardM.card.tags.split(',').map(t => t.trim()).filter(Boolean), updated: Date.now() }
          setBoard(b => ({ ...b, cols: b.cols.map(col => col.id !== cardM.col ? col : { ...col, cards: c.id ? col.cards.map(x => x.id === c.id ? c : x) : [...col.cards, { ...c, id: uid() }] }) })); setCardM(null); toast(cardM.card.id ? 'Tarjeta actualizada' : 'Tarjeta añadida') }}>Guardar</button></>}>
      {cardM && [['name', 'Nombre del lead', 'Ej.: Juan Pérez'], ['phone', 'Teléfono', '+51 999 999 999'], ['value', `Valor (${cur})`, '0,00'], ['tags', 'Etiquetas (separadas por coma)', 'Venta, PARTE 1']].map(([k, l, p], i) =>
        <div key={k} style={{ marginTop: i ? 16 : 0 }}><label className="l-lbl">{l}</label><input className="l-in soft" autoFocus={!i} value={cardM.card[k]} placeholder={p} onChange={e => setCardM({ ...cardM, card: { ...cardM.card, [k]: e.target.value } })} /></div>)}
    </LModal>
  </div>
}

function ColMenu({ col, onConv, onRename, onAdd, onDel }) {
  const [open, setOpen] = useState(false); const ref = useRef(); useOutside(ref, () => setOpen(false))
  const it = (fn) => () => { setOpen(false); fn() }
  return <div ref={ref} style={{ marginLeft: 'auto', position: 'relative' }}>
    <button className="ch-ib" style={{ width: 26, height: 26 }} onClick={() => setOpen(!open)}><MoreVertical size={16} /></button>
    {open && <div className="kb-menu">
      <button className="kb-mi" disabled><Zap size={16} /><span>Gestionar automatizaciones<small>Será implementado</small></span></button>
      <button className="kb-mi" onClick={it(onConv)}><Trophy size={16} />{col.conv ? 'Quitar de conversión' : 'Marcar como conversión'}</button>
      <div style={{ height: 6 }} />
      <button className="kb-mi" disabled><EyeOff size={16} style={{ color: '#94a3b8' }} /><span>Ocultar columna<small>Será implementado</small></span></button>
      <button className="kb-mi" onClick={it(onRename)}><Pencil size={16} />Renombrar columna</button>
      <button className="kb-mi" onClick={it(onAdd)}><Plus size={16} />Añadir tarjeta</button>
      <button className="kb-mi dg" onClick={it(onDel)}><Trash2 size={16} />Eliminar columna</button>
    </div>}
  </div>
}

function NewColumn({ idx, onClose, onCreate }) {
  const [f, setF] = useState({ name: '', color: 'auto', conv: false })
  const color = f.color === 'auto' ? AUTO[idx % 7] : COLS.find(c => c[0] === f.color)[2]
  return <LModal open onClose={onClose} title="Nueva columna" desc="Crea una nueva etapa para organizar las tarjetas de tu Kanban." width={479} bodyStyle={{ padding: '23px 24px 23px' }}
    footer={<><button className="lb2 g" style={{ minWidth: 87 }} onClick={onClose}>Cancelar</button><button className="lb2 p" style={{ background: '#9b6cf8', minWidth: 129 }} disabled={!f.name.trim()} onClick={() => onCreate(f)}>Crear columna</button></>}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
      <div><label className="l-lbl">Nombre de la columna</label><input className="l-in soft" autoFocus value={f.name} onChange={e => setF({ ...f, name: e.target.value })} onKeyDown={e => e.key === 'Enter' && f.name.trim() && onCreate(f)} placeholder="Ej.: Por hacer, En progreso, Hecho" style={{ fontWeight: f.name ? 600 : 400 }} /></div>
      <div><label className="l-lbl">Color de la columna</label>
        <LSelect className="l-in soft" value={f.color} onChange={v => setF({ ...f, color: v })} options={COLS.map(([v, l, c]) => ({ value: v, label: l, dot: c || undefined }))} bold />
        <div style={{ fontSize: 11.5, lineHeight: 1.45, color: '#94a3b8', marginTop: 8 }}>Define la franja superior y el brillo de la columna. Automático alterna tonos por etapa.</div></div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}><div><div style={{ fontSize: 13, fontWeight: 600 }}>Marcar como columna de conversión</div><div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>Esta columna contará como conversión en los informes</div></div>
      <span style={{ marginLeft: 'auto' }}><Toggle on={f.conv} onChange={v => setF({ ...f, conv: v })} /></span></div>
    <label className="l-lbl" style={{ marginTop: 18 }}>Vista previa</label>
    <div style={{ border: '1px solid var(--border)', borderTop: `4px solid ${color}`, borderRadius: 7, padding: '16px 0 14px', textAlign: 'center', background: 'var(--deep)' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />{f.name || 'Nombre de la columna'}{f.conv && <Trophy size={14} color="#f59e0b" />}</div>
      <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 9 }}>Las tarjetas aparecerán aquí</div></div>
  </LModal>
}

function Stats({ board, s, cur }) {
  const total = s.cards
  const stages = [{ name: 'Total de leads', n: total, color: '#e11d48' }, ...board.cols.map((c, i) => ({ name: c.name, n: c.cards.length, color: c.color || AUTO[i % 7] }))]
  const W = 1000, H = 115, N = stages.length, sw = W / N
  const h = stages.map(st => total ? Math.max(.04, st.n / total) * H : (st === stages[0] ? H : H * .04))
  let d = `M0,${H} L0,${H - h[0]}`
  for (let i = 0; i < N - 1; i++) { const x0 = i * sw + sw * .1, x1 = (i + 1) * sw; d += ` L${x0},${H - h[i]} C${(x0 + x1) / 2},${H - h[i]} ${(x0 + x1) / 2},${H - h[i + 1]} ${x1},${H - h[i + 1]}` }
  d += ` L${W},${H - h[N - 1]} L${W},${H} Z`
  return <div className="kb-stat">
    <h3><ChartColumn size={16} color="#8b5cf6" />Estadísticas de conversión</h3>
    <div className="sd">Sigue el recorrido de tus leads en cada etapa del embudo.</div>
    <div className="kb-fun">
      <div className="st">{stages.map(st => <div key={st.name}><h5 style={{ borderLeftColor: st.color === '#e11d48' ? '#e11d48' : st.color }}>{st.name}</h5><b>{st.n}</b><small>LEADS</small></div>)}</div>
      <div style={{ position: 'relative', marginTop: 22 }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 115, display: 'block' }}>
          <defs><linearGradient id="kbg" x1="0" x2="1"><stop offset="0" stopColor="#6d3fc4" /><stop offset=".45" stopColor="#3f4fb8" /><stop offset="1" stopColor="#0f9a78" /></linearGradient></defs>
          <path d={d} fill="url(#kbg)" />
        </svg>
        {stages.map((st, i) => <span key={i} style={{ position: 'absolute', left: `calc(${(i + .5) / N * 100}% - 18px)`, bottom: 9, background: '#be123c', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>{i === 0 ? (total ? 100 : 100) : total ? Math.round(st.n / total * 100) : 0}%</span>)}
      </div>
    </div>
    <div className="kb-kp">
      <div><div><span>TOTAL DE LEADS</span><b>{total}</b></div><i><Users size={18} /></i></div>
      <div><div><span>TASA DE CONVERSIÓN GENERAL</span><b style={{ color: '#22c55e' }}>{s.rate}%</b></div><i><TrendingUp size={18} color="#22c55e" /></i></div>
      <div><div><span>TOTAL DE COMPRAS</span><b>{s.conv}</b></div><i><ShoppingCart size={18} color="#a855f7" /></i></div>
      <div><div><span>FACTURACIÓN TOTAL</span><b style={{ color: '#22c55e' }}>{cur} {s.fact.toLocaleString('es-PE')}</b></div><i><DollarSign size={18} color="#22c55e" /></i></div>
    </div>
  </div>
}
