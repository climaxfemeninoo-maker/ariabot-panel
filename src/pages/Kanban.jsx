import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Columns3, Plus, ArrowLeft, MoreHorizontal, Trash2, Pencil, Phone, DollarSign, GripVertical, Search } from 'lucide-react'
import { useStore, Modal, Menu, Empty, PageHead, useToast, uid, Confirm, money } from '../ui'

const DEF_COLS = [['Nuevo', '#14b8a6'], ['Calificación', '#ea580c'], ['Ganado', '#6366f1']]
const PALETTE = ['#14b8a6', '#ea580c', '#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444']

function NewBoard({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  return <Modal open={open} onClose={onClose} title="Nuevo Kanban" sub="Asigne un nombre al tablero. Las columnas predeterminadas ya vienen listas para empezar." icon={<Columns3 size={18} />}
    footer={<><button className="btn btn-g" onClick={onClose}>Cancelar</button><button className="btn btn-p" disabled={!name.trim()} onClick={() => { onCreate(name); setName('') }}>Crear</button></>}>
    <div className="field"><label className="lb">Nombre del Kanban</label><input className="input" autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && name.trim() && (onCreate(name), setName(''))} placeholder="Escriba el nombre del Kanban..." /></div>
    <label className="lb">Vista previa</label>
    <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <div className="funnel">{DEF_COLS.map(([, c]) => <div key={c} style={{ flex: 1, background: c }} />)}</div>
      <div className="row small" style={{ marginTop: 6 }}>{DEF_COLS.map(([n, c]) => <span key={n} style={{ flex: 1, textAlign: 'center', color: c }}>{n}</span>)}</div>
      <div className="row" style={{ marginTop: 10 }}><b style={{ fontSize: 13 }}>{name || 'Nombre del Kanban'}</b><span className="sp" /><span className="badge b-gray">3 columnas</span></div>
      <div className="small muted" style={{ marginTop: 4 }}>Así aparece el tablero en la lista, con el embudo arriba.</div></div>
  </Modal>
}

export default function Kanban() {
  const { id } = useParams(); const nav = useNavigate(); const toast = useToast()
  const [boards, setBoards] = useStore('boards', [])
  const [open, setOpen] = useState(false); const [del, setDel] = useState(null)
  const create = name => {
    const b = { id: uid(), name, created: new Date().toLocaleDateString('es-PE'), cols: DEF_COLS.map(([n, c]) => ({ id: uid(), name: n, color: c, cards: [] })) }
    setBoards(x => [...x, b]); setOpen(false); toast('Kanban creado'); nav('/crms/' + b.id)
  }
  if (id) { const b = boards.find(x => x.id === id); if (b) return <Board board={b} setBoard={fn => setBoards(bs => bs.map(x => x.id === id ? fn(x) : x))} onDelete={() => { setBoards(bs => bs.filter(x => x.id !== id)); nav('/crms'); toast('Tablero eliminado') }} /> }
  return <div className="page">
    <PageHead icon={<Columns3 size={18} />} title="Tableros Kanban" sub="Pipeline de ventas y gestión visual"><button className="btn btn-p" onClick={() => setOpen(true)}><Plus size={14} />Nuevo Kanban</button></PageHead>
    {boards.length ? <div className="grid g3 stagger">{boards.map(b => <div key={b.id} className="card lift board-card" onClick={() => nav('/crms/' + b.id)}>
      <div className="funnel">{b.cols.map(c => <div key={c.id} style={{ flex: Math.max(1, c.cards.length), background: c.color, transition: '.4s' }} />)}</div>
      <div className="row" style={{ marginTop: 14 }}><b style={{ fontSize: 14 }}>{b.name}</b><span className="sp" /><span className="badge b-gray">{b.cols.length} columnas</span>
        <Menu right trigger={<button className="icon-btn" style={{ width: 24, height: 24 }}><MoreHorizontal size={14} /></button>} items={[{ icon: <Trash2 size={13} />, label: 'Eliminar', danger: true, onClick: () => setDel(b.id) }]} /></div>
      <div className="small muted" style={{ marginTop: 6 }}>{b.cols.reduce((a, c) => a + c.cards.length, 0)} oportunidades · creado {b.created}</div></div>)}</div>
      : <div className="card"><Empty icon={<Columns3 size={30} />} title="No hay tableros Kanban" text="Cree su primer tablero para seguir el pipeline de ventas en un solo lugar." action={<button className="btn btn-p" onClick={() => setOpen(true)}><Plus size={14} />Nuevo Kanban</button>} /></div>}
    <NewBoard open={open} onClose={() => setOpen(false)} onCreate={create} />
    <Confirm open={!!del} onClose={() => setDel(null)} onOk={() => { setBoards(bs => bs.filter(x => x.id !== del)); toast('Tablero eliminado') }} title="Eliminar tablero" />
  </div>
}

function Board({ board, setBoard, onDelete }) {
  const nav = useNavigate(); const toast = useToast()
  const [drag, setDrag] = useState(null); const [over, setOver] = useState(null)
  const [cardM, setCardM] = useState(null); const [colM, setColM] = useState(null); const [delB, setDelB] = useState(false); const [q, setQ] = useState('')
  const drop = colId => {
    if (!drag) return
    setBoard(b => { const card = b.cols.find(c => c.id === drag.from).cards.find(x => x.id === drag.id)
      return { ...b, cols: b.cols.map(c => c.id === drag.from && c.id === colId ? c : c.id === drag.from ? { ...c, cards: c.cards.filter(x => x.id !== drag.id) } : c.id === colId ? { ...c, cards: [...c.cards, card] } : c) } })
    setDrag(null); setOver(null)
  }
  const saveCard = () => {
    const { col, card } = cardM; if (!card.name.trim()) return
    setBoard(b => ({ ...b, cols: b.cols.map(c => c.id !== col ? c : { ...c, cards: card.id ? c.cards.map(x => x.id === card.id ? card : x) : [...c.cards, { ...card, id: uid() }] }) }))
    setCardM(null); toast(card.id ? 'Tarjeta actualizada' : 'Tarjeta creada')
  }
  const saveCol = () => {
    if (!colM.name.trim()) return
    setBoard(b => ({ ...b, cols: colM.id ? b.cols.map(c => c.id === colM.id ? { ...c, ...colM } : c) : [...b.cols, { ...colM, id: uid(), cards: [] }] })); setColM(null)
  }
  return <div className="page">
    <div className="ph"><button className="icon-btn" onClick={() => nav('/crms')}><ArrowLeft size={16} /></button><div><h1>{board.name}</h1><p>{board.cols.reduce((a, c) => a + c.cards.length, 0)} oportunidades · {money(board.cols.reduce((a, c) => a + c.cards.reduce((s, x) => s + +(x.value || 0), 0), 0))}</p></div>
      <div className="actions"><div className="search"><Search size={13} /><input className="input" placeholder="Buscar tarjeta…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <button className="btn btn-g" onClick={() => setColM({ name: '', color: PALETTE[board.cols.length % 8] })}><Plus size={14} />Columna</button>
        <button className="btn btn-g" style={{ color: '#ef4444' }} onClick={() => setDelB(true)}><Trash2 size={14} /></button></div></div>
    <div className="kb-cols">{board.cols.map(col => <div key={col.id} className={'kb-col' + (over === col.id ? ' over' : '')} onDragOver={e => { e.preventDefault(); setOver(col.id) }} onDragLeave={() => setOver(null)} onDrop={() => drop(col.id)}>
      <div className="kb-col-h" style={{ borderTopColor: col.color }}><span style={{ width: 8, height: 8, borderRadius: 9, background: col.color }} /><b>{col.name}</b><span className="badge b-gray">{col.cards.length}</span><span className="sp" />
        <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setCardM({ col: col.id, card: { name: '', phone: '', value: '', note: '' } })}><Plus size={14} /></button>
        <Menu right trigger={<button className="icon-btn" style={{ width: 24, height: 24 }}><MoreHorizontal size={14} /></button>} items={[{ icon: <Pencil size={13} />, label: 'Editar columna', onClick: () => setColM(col) }, { icon: <Trash2 size={13} />, label: 'Eliminar columna', danger: true, onClick: () => setBoard(b => ({ ...b, cols: b.cols.filter(c => c.id !== col.id) })) }]} /></div>
      <div className="kb-list">{col.cards.filter(c => c.name.toLowerCase().includes(q.toLowerCase())).map(card => <div key={card.id} draggable className={'kb-card' + (drag?.id === card.id ? ' drag' : '')} onDragStart={() => setDrag({ id: card.id, from: col.id })} onDragEnd={() => setDrag(null)} onClick={() => setCardM({ col: col.id, card })}>
        <div className="row"><GripVertical size={12} className="muted" /><b style={{ fontSize: 12.5 }}>{card.name}</b><span className="sp" /><button className="icon-btn" style={{ width: 20, height: 20 }} onClick={e => { e.stopPropagation(); setBoard(b => ({ ...b, cols: b.cols.map(c => c.id === col.id ? { ...c, cards: c.cards.filter(x => x.id !== card.id) } : c) })) }}><Trash2 size={11} /></button></div>
        {card.phone && <div className="small muted row" style={{ marginTop: 6 }}><Phone size={11} />{card.phone}</div>}
        {card.value && <div className="small row" style={{ marginTop: 4, color: '#22c55e', fontWeight: 700 }}><DollarSign size={11} />{money(card.value)}</div>}
        {card.note && <div className="small muted" style={{ marginTop: 6 }}>{card.note}</div>}</div>)}
        <button className="btn btn-g btn-sm" style={{ borderStyle: 'dashed' }} onClick={() => setCardM({ col: col.id, card: { name: '', phone: '', value: '', note: '' } })}><Plus size={12} />Agregar tarjeta</button></div>
    </div>)}</div>
    <Modal open={!!cardM} onClose={() => setCardM(null)} title={cardM?.card.id ? 'Editar oportunidad' : 'Nueva oportunidad'} icon={<Columns3 size={18} />}
      footer={<><button className="btn btn-g" onClick={() => setCardM(null)}>Cancelar</button><button className="btn btn-p" onClick={saveCard}>Guardar</button></>}>
      {cardM && <>{[['name', 'Nombre del lead', 'Juan Pérez'], ['phone', 'Teléfono', '+51 999 999 999'], ['value', 'Valor', '0.00']].map(([k, l, p]) => <div className="field" key={k}><label className="lb">{l}</label><input className="input" value={cardM.card[k]} placeholder={p} onChange={e => setCardM({ ...cardM, card: { ...cardM.card, [k]: e.target.value } })} /></div>)}
        <div className="field"><label className="lb">Notas</label><textarea className="input" value={cardM.card.note} onChange={e => setCardM({ ...cardM, card: { ...cardM.card, note: e.target.value } })} /></div></>}</Modal>
    <Modal open={!!colM} onClose={() => setColM(null)} title={colM?.id ? 'Editar columna' : 'Nueva columna'} icon={<Columns3 size={18} />}
      footer={<><button className="btn btn-g" onClick={() => setColM(null)}>Cancelar</button><button className="btn btn-p" onClick={saveCol}>Guardar</button></>}>
      {colM && <><div className="field"><label className="lb">Nombre</label><input className="input" autoFocus value={colM.name} onChange={e => setColM({ ...colM, name: e.target.value })} /></div>
        <label className="lb">Color</label><div className="row">{PALETTE.map(c => <button key={c} onClick={() => setColM({ ...colM, color: c })} style={{ width: 26, height: 26, borderRadius: 7, background: c, outline: colM.color === c ? '2px solid var(--text)' : 'none', outlineOffset: 2, transition: '.2s' }} />)}</div></>}</Modal>
    <Confirm open={delB} onClose={() => setDelB(false)} onOk={onDelete} title="Eliminar tablero" />
  </div>
}
