import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Search, Plus, Filter, Calendar, Send, Paperclip, Smile, CheckCheck, MoreVertical, UserCheck, CheckCircle2, Trash2, ChevronLeft, ChevronRight, Bot, Zap, Phone, RotateCcw } from 'lucide-react'
import { useStore, Modal, Menu, useToast, uid, Confirm } from '../ui'

const COLORS = ['#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444']
const t = () => new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
const SEED = [
  { id: 'a1', name: 'María López', phone: '+51 987 654 321', status: 'espera', unread: 2, msgs: [{ f: 'in', x: 'Hola, quisiera información del ebook 📚', t: '10:21' }, { f: 'in', x: '¿Cuál es el precio?', t: '10:22' }] },
  { id: 'a2', name: 'Carlos Ruiz', phone: '+51 912 345 678', status: 'espera', unread: 0, msgs: [{ f: 'in', x: 'Buenas, ¿aceptan Yape?', t: '09:40' }, { f: 'out', x: '¡Hola Carlos! Sí, aceptamos Yape y Plin 😊', t: '09:41' }] },
  { id: 'a3', name: 'Ana Torres', phone: '+52 55 1234 5678', status: 'atencion', unread: 1, msgs: [{ f: 'in', x: 'Ya realicé el pago, te envío el comprobante', t: '08:15' }] },
  { id: 'a4', name: 'Luis Fernández', phone: '+57 300 123 4567', status: 'resueltos', unread: 0, msgs: [{ f: 'in', x: '¡Gracias! Ya me llegó el PDF', t: 'Ayer' }, { f: 'out', x: '¡Excelente! Cualquier duda nos escribes 🙌', t: 'Ayer' }] },
]
const QUICK = ['¡Hola! ¿En qué puedo ayudarte? 😊', 'El precio es PEN 29,90 con acceso inmediato.', 'Puedes pagar por Yape, Plin o tarjeta.', '¡Gracias por tu compra! 🙌']
const AUTO = ['¡Perfecto, gracias!', 'Ok, entiendo 👍', '¿Y tienen garantía?', 'Genial, ahora mismo lo reviso', '¿Me envías el link de pago?']

export default function Chats() {
  const toast = useToast()
  const [chats, setChats] = useStore('chats', SEED)
  const [tab, setTab] = useState('espera'); const [f, setF] = useState('Todo'); const [q, setQ] = useState('')
  const [sel, setSel] = useState(null); const [txt, setTxt] = useState(''); const [hide, setHide] = useState(false)
  const [typing, setTyping] = useState(false); const [newOpen, setNew] = useState(false); const [nf, setNf] = useState({ name: '', phone: '' })
  const [del, setDel] = useState(null); const [quick, setQuick] = useState(false)
  const end = useRef()
  const list = chats.filter(c => c.status === tab && (f !== 'No leídos' || c.unread) && (f !== 'Sin responder' || c.msgs.at(-1)?.f === 'in') && (c.name + c.phone).toLowerCase().includes(q.toLowerCase()))
  const cur = chats.find(c => c.id === sel)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [cur?.msgs.length, typing])
  const upd = (id, fn) => setChats(cs => cs.map(c => c.id === id ? fn(c) : c))
  const open = c => { setSel(c.id); upd(c.id, x => ({ ...x, unread: 0 })) }
  const send = (x = txt) => {
    if (!x.trim() || !cur) return
    const id = cur.id; upd(id, c => ({ ...c, msgs: [...c.msgs, { f: 'out', x, t: t() }] })); setTxt(''); setQuick(false)
    setTimeout(() => setTyping(true), 700)
    setTimeout(() => { setTyping(false); upd(id, c => ({ ...c, msgs: [...c.msgs, { f: 'in', x: AUTO[Math.floor(Math.random() * AUTO.length)], t: t() }] })) }, 2200)
  }
  const move = (status, msg) => { upd(cur.id, c => ({ ...c, status })); setTab(status); toast(msg) }
  return <div className="chat-wrap">
    <div className={'chat-list' + (hide ? ' hide' : '')}>
      <div style={{ padding: '12px 12px 8px' }}>
        <div className="row bold" style={{ fontSize: 12, marginBottom: 9, letterSpacing: '.02em' }}><MessageSquare size={13} color="#8b5cf6" />EMPRESA PABLO MONJA SUCLUPE</div>
        <div className="row"><div className="search sp"><Search size={13} /><input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar chats..." style={{ padding: '6px 10px 6px 30px' }} /></div>
          <button className="btn btn-p" style={{ padding: 6 }} onClick={() => setNew(true)}><Plus size={14} /></button>
          <Menu right trigger={<button className="btn btn-p" style={{ padding: 6 }}><Filter size={14} /></button>} items={[{ label: 'Más recientes', onClick: () => setChats(c => [...c].reverse()) }, { label: 'Nombre (A-Z)', onClick: () => setChats(c => [...c].sort((a, b) => a.name.localeCompare(b.name))) }]} /></div>
      </div>
      <div className="utabs">{[['espera', 'En espera'], ['atencion', 'En atención'], ['resueltos', 'Resueltos']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l} {chats.filter(c => c.status === k).length > 0 && <span className="badge b-violet" style={{ marginLeft: 3 }}>{chats.filter(c => c.status === k).length}</span>}</button>)}</div>
      <div className="row" style={{ padding: '9px 12px', gap: 5 }}>{['Todo', 'No leídos', 'Sin responder'].map(x => <button key={x} className={'chip' + (f === x ? ' on' : '')} onClick={() => setF(x)}>{x}</button>)}<span className="sp" /><button className="icon-btn" style={{ color: 'var(--p)', width: 24, height: 24 }}><Calendar size={13} /></button></div>
      <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border)' }}>
        {list.length ? list.map((c, i) => <div key={c.id} className={'chat-item' + (sel === c.id ? ' on' : '')} style={{ animationDelay: i * .04 + 's' }} onClick={() => open(c)}>
          <div className="chat-av" style={{ background: COLORS[c.name.length % 6] }}>{c.name[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}><div className="row"><b style={{ fontSize: 12.5 }}>{c.name}</b><span className="sp" /><span className="small muted">{c.msgs.at(-1)?.t}</span></div>
            <div className="row"><span className="small muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.msgs.at(-1)?.f === 'out' && <CheckCheck size={11} color="#22d3ee" />} {c.msgs.at(-1)?.x}</span>{c.unread > 0 && <span className="unread">{c.unread}</span>}</div></div></div>)
          : <div className="empty"><div className="ei"><MessageSquare size={34} /></div><h3>No hay chats</h3><p>Pruebe a ajustar la búsqueda o los filtros</p></div>}
      </div>
    </div>
    <div style={{ position: 'relative', width: 0 }}><div className="collapse-tab" onClick={() => setHide(!hide)}>{hide ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}</div></div>
    <div className="chat-main">
      {cur ? <>
        <div className="chat-head"><div className="chat-av" style={{ background: COLORS[cur.name.length % 6], width: 34, height: 34 }}>{cur.name[0]}</div>
          <div><div className="bold">{cur.name}</div><div className="small muted">{cur.phone} · {typing ? <span style={{ color: '#22c55e' }}>escribiendo…</span> : 'en línea'}</div></div><span className="sp" />
          {cur.status !== 'atencion' && <button className="btn btn-g btn-sm" onClick={() => move('atencion', 'Chat asignado a ti')}><UserCheck size={13} />Atender</button>}
          {cur.status !== 'resueltos' ? <button className="btn btn-gr btn-sm" onClick={() => move('resueltos', 'Chat resuelto')}><CheckCircle2 size={13} />Resolver</button> : <button className="btn btn-g btn-sm" onClick={() => move('espera', 'Chat reabierto')}><RotateCcw size={13} />Reabrir</button>}
          <Menu right trigger={<button className="icon-btn"><MoreVertical size={16} /></button>} items={[{ icon: <Phone size={14} />, label: 'Llamar', onClick: () => toast('Llamada iniciada (demo)', 'info') }, { icon: <Bot size={14} />, label: 'Transferir a agente IA', onClick: () => toast('Transferido al agente de IA') }, '-', { icon: <Trash2 size={14} />, label: 'Eliminar chat', danger: true, onClick: () => setDel(cur.id) }]} />
        </div>
        <div className="msgs">{cur.msgs.map((m, i) => <div key={i} className={'msg ' + m.f}>{m.x}<span className="tm">{m.t} {m.f === 'out' && <CheckCheck size={11} />}</span></div>)}
          {typing && <div className="msg in typing"><span /><span /><span /></div>}<div ref={end} /></div>
        <div style={{ position: 'relative' }}>{quick && <div className="dd-menu" style={{ top: 'auto', bottom: '100%', left: 12, marginBottom: 4 }}>{QUICK.map(x => <button key={x} className="dd-item" onClick={() => send(x)}><Zap size={13} color="#f59e0b" />{x}</button>)}</div>}</div>
        <div className="composer"><button className="icon-btn" onClick={() => setTxt(x => x + '😊')}><Smile size={17} /></button><button className="icon-btn" onClick={() => toast('Adjuntar archivo (demo)', 'info')}><Paperclip size={17} /></button>
          <button className="icon-btn" title="Respuestas rápidas" onClick={() => setQuick(!quick)} style={{ color: '#f59e0b' }}><Zap size={17} /></button>
          <input className="input" value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Escribe un mensaje…" />
          <button className="btn btn-p" onClick={() => send()}><Send size={14} /></button></div>
      </> : <div className="empty" style={{ flex: 1 }}><div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--card2)', display: 'grid', placeItems: 'center', marginBottom: 10 }}><MessageSquare size={24} /></div><h3 style={{ fontSize: 17 }}>Seleccione un chat</h3><p>Elija una conversación de la lista para empezar a atender</p></div>}
    </div>
    <Modal open={newOpen} onClose={() => setNew(false)} title="Nuevo chat" sub="Inicia una conversación con un número" icon={<MessageSquare size={18} />}
      footer={<><button className="btn btn-g" onClick={() => setNew(false)}>Cancelar</button><button className="btn btn-p" disabled={!nf.name || !nf.phone} onClick={() => { const id = uid(); setChats(c => [{ id, ...nf, status: 'atencion', unread: 0, msgs: [] }, ...c]); setTab('atencion'); setSel(id); setNew(false); setNf({ name: '', phone: '' }); toast('Chat creado') }}>Iniciar chat</button></>}>
      <div className="field"><label className="lb">Nombre</label><input className="input" autoFocus value={nf.name} onChange={e => setNf({ ...nf, name: e.target.value })} placeholder="Nombre del contacto" /></div>
      <div className="field"><label className="lb">Teléfono (WhatsApp)</label><input className="input" value={nf.phone} onChange={e => setNf({ ...nf, phone: e.target.value })} placeholder="+51 999 999 999" /></div></Modal>
    <Confirm open={!!del} onClose={() => setDel(null)} onOk={() => { setChats(c => c.filter(x => x.id !== del)); setSel(null); toast('Chat eliminado') }} title="Eliminar chat" />
  </div>
}
