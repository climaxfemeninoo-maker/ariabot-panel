import { useState, useRef, useEffect, useMemo } from 'react'
import { MessageCircle, MessageSquare, Search, Plus, Filter, CalendarDays, Calendar, Send, Paperclip, Smile, CheckCheck, MoreVertical, UserCheck, CircleCheck, Trash2, ChevronLeft, ChevronRight, RotateCcw, X, User, ArrowLeft, Save, Zap, ChevronDown, Check } from 'lucide-react'
import { useStore, useToast, uid, useOutside, Menu } from '../ui'
import { LModal, LSelect } from './leona'

const COLORS = ['#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444']
const hhmm = () => new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
const QUICK = ['¡Hola! ¿En qué puedo ayudarte? 😊', 'Te envío la información en un momento.', 'Puedes pagar por Yape, Plin o tarjeta.', '¡Gracias por tu compra! 🙌']
export const COUNTRIES = [['br', '+55', 'Brasil'], ['pe', '+51', 'Perú'], ['mx', '+52', 'México'], ['co', '+57', 'Colombia'], ['ar', '+54', 'Argentina'], ['cl', '+56', 'Chile'], ['ec', '+593', 'Ecuador'], ['bo', '+591', 'Bolivia'], ['py', '+595', 'Paraguay'], ['uy', '+598', 'Uruguay'], ['ve', '+58', 'Venezuela'], ['us', '+1', 'Estados Unidos'], ['es', '+34', 'España'], ['pt', '+351', 'Portugal'], ['cr', '+506', 'Costa Rica'], ['pa', '+507', 'Panamá'], ['gt', '+502', 'Guatemala'], ['do', '+1', 'Rep. Dominicana']]
const UF = ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins']
const flag = c => `https://flagcdn.com/w40/${c}.png`

export default function Chats() {
  const toast = useToast()
  const [chats, setChats] = useStore('chat_list', [])
  const [contacts, setContacts] = useStore('contacts', [])
  const [conns] = useStore('connections', [])
  const [boards] = useStore('boards', [])
  const [deps] = useStore('departments', [])
  const [sched] = useStore('scheduled', [])
  const [tab, setTab] = useState('espera'); const [chip, setChip] = useState('Todo'); const [q, setQ] = useState('')
  const [sel, setSel] = useState(null); const [txt, setTxt] = useState(''); const [hide, setHide] = useState(false); const [quick, setQuick] = useState(false)
  const [modal, setModal] = useState(null)
  const blankF = { resp: '', from: '', to: '', crm: 'all', tags: [], conns: [], deps: [] }
  const [flt, setFlt] = useState(blankF)
  const end = useRef()
  const [openId, setOpenId] = useStore('chat_open', null)
  useEffect(() => { if (!openId) return; const c = chats.find(x => x.id === openId); if (c) { setTab(c.status); setChip('Todo'); setSel(c.id) } setOpenId(null) }, [openId, chats.length])
  const fActive = JSON.stringify(flt) !== JSON.stringify(blankF)
  const list = chats.filter(c => c.status === tab
    && (chip !== 'No leídos' || c.unread) && (chip !== 'Sin responder' || c.msgs.at(-1)?.f === 'in')
    && (c.name + c.phone).toLowerCase().includes(q.toLowerCase())
    && (!flt.resp || (c.agent || '').toLowerCase().includes(flt.resp.toLowerCase()))
    && (!flt.from || (c.last || 0) >= +new Date(flt.from + 'T00:00')) && (!flt.to || (c.last || 0) < +new Date(flt.to + 'T00:00') + 864e5)
    && (!flt.conns.length || flt.conns.includes(c.conn)) && (!flt.tags.length || flt.tags.some(t => (c.tags || []).includes(t))))
  const cur = chats.find(c => c.id === sel)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [cur?.msgs.length])
  const upd = (id, fn) => setChats(cs => cs.map(c => c.id === id ? fn(c) : c))
  const open = c => { setSel(c.id); upd(c.id, x => ({ ...x, unread: 0 })) }
  const send = (x = txt) => {
    if (!x.trim() || !cur) return
    upd(cur.id, c => ({ ...c, last: Date.now(), msgs: [...c.msgs, { f: 'out', x, t: hhmm() }] })); setTxt(''); setQuick(false)
  }
  const move = (status, msg) => { upd(cur.id, c => ({ ...c, status, agent: status === 'atencion' ? 'Pablo Monja Suclupe' : c.agent })); setTab(status); toast(msg) }
  const startChat = (ct, conn) => {
    const ex = chats.find(c => c.contactId === ct.id)
    if (ex) { setTab(ex.status); setSel(ex.id); setModal(null); return }
    const id = uid()
    setChats(c => [{ id, contactId: ct.id, name: ct.name, phone: ct.phone, conn, tags: ct.tags || [], status: 'atencion', agent: 'Pablo Monja Suclupe', unread: 0, last: Date.now(), msgs: [] }, ...c])
    setTab('atencion'); setChip('Todo'); setSel(id); setModal(null); toast('Conversación abierta')
  }
  const count = k => chats.filter(c => c.status === k).length
  const tagsAll = [...new Set(contacts.flatMap(c => c.tags || []))]

  return <div className="ch-wrap">
    <div className={'ch-list' + (hide ? ' hide' : '')}>
      <div className="ch-top">
        <div className="ch-ttl"><MessageCircle size={15} color="#8b5cf6" strokeWidth={2.2} />Empresa Pablo Monja Suclupe</div>
        <div className="ch-srow">
          <div className="ch-srch"><Search size={14} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar chats..." /></div>
          <button className="ch-pb" style={{ width: 27, height: 27 }} title="Crear chat nuevo" onClick={() => setModal('new')}><Plus size={16} /></button>
          <button className="ch-pb" style={{ width: 29, height: 29, borderRadius: 7, position: 'relative' }} title="Filtros" onClick={() => setModal('filter')}><Filter size={15} />{fActive && <span className="dot-badge" style={{ top: -2, right: -2 }} />}</button>
        </div>
      </div>
      <div className="ch-tabs">{[['espera', 'En espera'], ['atencion', 'En atención'], ['resueltos', 'Resueltos']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}{count(k) > 0 && <span className="n">{count(k)}</span>}</button>)}</div>
      <div className="ch-chips">
        {[['Todo', ''], ['No leídos', 'r'], ['Sin responder', 'a']].map(([x, c]) => <button key={x} className={'ch-chip ' + c + (chip === x ? ' on' : '')} onClick={() => setChip(x)}>{x}</button>)}
        <button className="ch-cal" title="Mensajes programados" onClick={() => setModal('sched')}><CalendarDays size={15} /></button>
        {chip !== 'Todo' && <span className="ch-tag">{chip}<button onClick={() => setChip('Todo')}><X size={12} /></button></span>}
      </div>
      <div className="ch-items">
        {list.length ? list.map(c => <div key={c.id} className={'ch-it' + (sel === c.id ? ' on' : '')} onClick={() => open(c)}>
          <div className="ch-av" style={{ background: COLORS[c.name.length % 6] }}>{c.name[0]?.toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="nm">{c.name}</span><span className="tm">{c.msgs.at(-1)?.t}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}><span className="lm2">{c.msgs.at(-1)?.f === 'out' && <CheckCheck size={12} color="#22d3ee" style={{ verticalAlign: -2, marginRight: 3 }} />}{c.msgs.at(-1)?.x || c.phone}</span>{c.unread > 0 && <span className="ur">{c.unread}</span>}</div>
          </div></div>)
          : <div className="ch-empty"><MessageSquare size={47} strokeWidth={1.9} /><h3>No hay chats</h3><p>Pruebe a ajustar la búsqueda o los filtros</p></div>}
      </div>
      <button className="ch-col" onClick={() => setHide(!hide)} title={hide ? 'Mostrar lista' : 'Ocultar lista'}>{hide ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}</button>
    </div>

    <div className="ch-main">
      {cur ? <>
        <div className="ch-head">
          <div className="ch-av" style={{ background: COLORS[cur.name.length % 6] }}>{cur.name[0]?.toUpperCase()}</div>
          <div style={{ minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{cur.name}</div><div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{cur.phone}{cur.agent ? ' · ' + cur.agent : ''}</div></div>
          <span style={{ marginLeft: 'auto' }} />
          {cur.status !== 'atencion' && cur.status !== 'resueltos' && <button className="lb2 g sm" onClick={() => move('atencion', 'Chat asignado a ti')}><UserCheck size={14} />Atender</button>}
          {cur.status !== 'resueltos' ? <button className="lb2 sm" style={{ background: '#16a34a', color: '#fff' }} onClick={() => move('resueltos', 'Chat resuelto')}><CircleCheck size={14} />Resolver</button>
            : <button className="lb2 g sm" onClick={() => move('espera', 'Chat reabierto')}><RotateCcw size={14} />Reabrir</button>}
          <Menu right trigger={<button className="ch-ib"><MoreVertical size={17} /></button>} items={[{ icon: <Trash2 size={14} />, label: 'Eliminar chat', danger: true, onClick: () => { setChats(c => c.filter(x => x.id !== cur.id)); setSel(null); toast('Chat eliminado') } }]} />
        </div>
        <div className="ch-msgs">
          {cur.msgs.length === 0 && <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Envía el primer mensaje para iniciar la conversación.</div>}
          {cur.msgs.map((m, i) => <div key={i} className={'ch-m ' + m.f}>{m.x}<div className="t">{m.t}{m.f === 'out' && <CheckCheck size={12} />}</div></div>)}
          <div ref={end} /></div>
        <div style={{ position: 'relative' }}>{quick && <div className="l-selm" style={{ top: 'auto', bottom: 6, left: 14, right: 'auto', width: 320 }}>{QUICK.map(x => <button key={x} className="l-opt" style={{ fontWeight: 500 }} onClick={() => send(x)}><Zap size={13} color="#f59e0b" />{x}</button>)}</div>}</div>
        <div className="ch-comp">
          <button className="ch-ib" onClick={() => setTxt(x => x + '😊')}><Smile size={18} /></button>
          <button className="ch-ib" onClick={() => toast('Adjuntar archivo disponible al conectar WhatsApp', 'info')}><Paperclip size={18} /></button>
          <button className="ch-ib" style={{ color: '#f59e0b' }} title="Respuestas rápidas" onClick={() => setQuick(!quick)}><Zap size={18} /></button>
          <input className="l-in" value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Escribe un mensaje…" />
          <button className="lb2 p" style={{ minWidth: 0, padding: '0 13px' }} onClick={() => send()}><Send size={15} /></button>
        </div>
      </> : <div className="ch-sel"><div className="bx"><MessageSquare size={36} strokeWidth={1.8} /></div><h3>Seleccione un chat</h3><p>Elija una conversación de la lista para empezar a atender</p></div>}
    </div>

    <LModal open={modal === 'sched'} onClose={() => setModal(null)} title="Mensajes programados" icon={<Calendar size={19} />} footerBg
      footer={<button className="lb2 g" style={{ minWidth: 135 }} onClick={() => setModal(null)}>Cerrar</button>} bodyStyle={{ padding: '28px 24px 29px' }}>
      {sched.length ? sched.map(s => <div key={s.id} style={{ fontSize: 13, padding: '6px 0' }}>{s.text}</div>)
        : <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: 13.2, color: '#94a3b8' }}>No hay programaciones activas en la cuenta</div>}
    </LModal>

    {modal === 'filter' && <ChatFilters init={flt} blank={blankF} boards={boards} conns={conns} deps={deps} tags={tagsAll} onClose={() => setModal(null)} onApply={f => { setFlt(f); setModal(null); toast('Filtros aplicados') }} />}
    {(modal === 'new' || modal === 'contact') && <NewChat mode={modal} setMode={setModal} contacts={contacts} conns={conns} tags={tagsAll} onPick={startChat}
      onSave={(ct, openIt, conn) => { setContacts(l => [ct, ...l]); toast('Contacto guardado'); if (openIt) startChat(ct, conn); else setModal(null) }} />}
  </div>
}

function ChatFilters({ init, blank, boards, conns, deps, tags, onClose, onApply }) {
  const [f, setF] = useState(init)
  const tog = (k, v) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] })
  return <LModal open onClose={onClose} title="Filtros de chat" width={1078} footerBg bodyStyle={{ padding: '23px 24px 23px' }}
    footer={<><button className="lb2 g" style={{ minWidth: 135 }} onClick={() => setF(blank)}><RotateCcw size={15} />Limpiar</button><button className="lb2 g" style={{ minWidth: 135 }} onClick={onClose}>Cancelar</button><button className="lb2 p" style={{ minWidth: 135 }} onClick={() => onApply(f)}><Filter size={15} />Aplicar</button></>}>
    <div className="ch-filt">
      <div>
        <div className="ch-box"><h4>Responsable</h4><div className="l-ico"><User size={15} /><input className="l-in" value={f.resp} onChange={e => setF({ ...f, resp: e.target.value })} placeholder="Nombre del responsable" /></div></div>
        <div className="ch-box"><h4><CalendarDays size={15} />Última interacción</h4>
          <div className="d">Filtra por la hora del último mensaje (la que aparece en la lista). Indica fecha inicial y final (rango inclusivo); ambos campos.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
            <label><span style={{ fontSize: 11.5, color: 'var(--soft)', display: 'block', marginBottom: 6 }}>Desde</span><input type="date" className="l-in" value={f.from} max={f.to || undefined} onChange={e => setF({ ...f, from: e.target.value })} /></label>
            <label><span style={{ fontSize: 11.5, color: 'var(--soft)', display: 'block', marginBottom: 6 }}>Hasta</span><input type="date" className="l-in" value={f.to} min={f.from || undefined} onChange={e => setF({ ...f, to: e.target.value })} /></label>
          </div></div>
        <div className="ch-box"><h4>CRM</h4><LSelect value={f.crm} onChange={v => setF({ ...f, crm: v })} options={[{ value: 'all', label: 'Todos los CRM' }, ...boards.map(b => ({ value: b.id, label: b.name }))]} bold={false} /></div>
        <div className="ch-box"><h4>Etiquetas</h4><TagPicker value={f.tags} onChange={v => setF({ ...f, tags: v })} options={tags} placeholder="Seleccione etiquetas para filtrar..." soft /></div>
      </div>
      <div>
        <div className="ch-box"><h4 style={{ marginBottom: 8 }}>Conexiones</h4><div className="d" style={{ margin: '0 0 6px' }}>Seleccione las conexiones (instancias) para filtrar</div>
          {conns.length ? conns.map(c => <Check2 key={c.id || c.name} on={f.conns.includes(c.name)} onClick={() => tog('conns', c.name)} label={c.name} />) : <div className="em">Ninguna conexión disponible.</div>}</div>
        <div className="ch-box"><h4 style={{ marginBottom: 8 }}>Departamentos</h4><div className="d" style={{ margin: '0 0 6px' }}>Seleccione los departamentos para filtrar</div>
          {deps.length ? deps.map(d => <Check2 key={d.id || d.name} on={f.deps.includes(d.name)} onClick={() => tog('deps', d.name)} label={d.name} />) : <div className="em">Ningún departamento registrado.</div>}</div>
      </div>
    </div>
  </LModal>
}
const Check2 = ({ on, onClick, label }) => <button className={'db-chk' + (on ? ' on' : '')} onClick={onClick}><i>{on && <Check size={10} strokeWidth={3} />}</i>{label}</button>

function TagPicker({ value, onChange, options, placeholder, soft, slate }) {
  const [open, setOpen] = useState(false); const [n, setN] = useState(''); const ref = useRef(); useOutside(ref, () => setOpen(false))
  const all = [...new Set([...options, ...value])]
  const add = () => { const t = n.trim(); if (t && !value.includes(t)) onChange([...value, t]); setN('') }
  return <div className="l-sel" ref={ref}>
    <button type="button" className={'l-in l-selb' + (soft ? ' soft' : '') + (slate ? ' slate2' : '') + (open ? ' open' : '')} style={{ color: value.length ? 'var(--text)' : '#94a3b8', height: slate ? 44 : 37, fontSize: 13.3, borderColor: open ? 'var(--p)' : undefined }} onClick={() => setOpen(!open)}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value.length ? value.join(', ') : placeholder}</span><ChevronDown size={15} className="chev" /></button>
    {open && <div className="l-selm">
      <div style={{ display: 'flex', gap: 6, padding: 3 }}><input className="l-in" style={{ height: 30, fontSize: 12.5 }} autoFocus placeholder="Nueva etiqueta y Enter…" value={n} onChange={e => setN(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} /></div>
      {all.length === 0 && <div className="l-opt" style={{ color: '#94a3b8', fontWeight: 500 }}>No hay etiquetas todavía</div>}
      {all.map(t => <button type="button" key={t} className="l-opt" onClick={() => onChange(value.includes(t) ? value.filter(x => x !== t) : [...value, t])}>{t}{value.includes(t) && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--p)' }} />}</button>)}
    </div>}
  </div>
}

function NewChat({ mode, setMode, contacts, conns, tags, onPick, onSave }) {
  const [conn, setConn] = useState(conns[0]?.name || '')
  const [q, setQ] = useState('')
  const res = q.trim() ? contacts.filter(c => [c.name, c.phone, c.email].join(' ').toLowerCase().includes(q.toLowerCase())) : []
  const ConnPick = () => <><span className="l-cap" style={{ marginBottom: 9 }}>Conexión</span>
    {conns.length ? <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>{conns.map(c => <button key={c.name} className={'kb-chip' + (conn === c.name ? ' on' : '')} onClick={() => setConn(c.name)}>{c.name}</button>)}</div>
      : <div style={{ fontSize: 13.3, color: 'var(--soft)', marginBottom: 14 }}>No hay conexiones disponibles.</div>}</>
  if (mode === 'contact') return <ContactForm conn={conn} ConnPick={ConnPick} tags={tags} onBack={() => setMode('new')} onClose={() => setMode(null)} onSave={(c, o) => onSave(c, o, conn)} />
  return <LModal open onClose={() => setMode(null)} title="Crear chat nuevo" icon={<MessageSquare size={20} />} width={718} footerBg bodyStyle={{ padding: '22px 19px 24px' }}
    footer={<div style={{ display: 'flex', gap: 9, width: '100%', margin: '0 -5px' }}><button className="lb2 p" style={{ flex: 1, fontSize: 12.5, height: 33 }} onClick={() => setMode('contact')}><Plus size={16} />Crear nuevo contacto</button><button className="lb2 g" onClick={() => setMode(null)} style={{ fontSize: 12.5, height: 33 }}>Cancelar</button></div>}>
    <ConnPick />
    <span className="l-cap">Buscar cliente por nombre, teléfono o correo...</span>
    <div className="l-ico"><Search size={15} style={{ color: 'var(--p)' }} /><input className="l-in" autoFocus style={{ borderColor: 'var(--p)', fontSize: 12.5 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar cliente por nombre, teléfono o correo..." /></div>
    {!q.trim() ? <div style={{ textAlign: 'center', fontSize: 13.3, color: '#94a3b8', padding: '24px 0 2px' }}>Escriba para buscar contactos existentes</div>
      : res.length ? <div style={{ marginTop: 10, maxHeight: 240, overflowY: 'auto' }}>{res.map(c => <button key={c.id} className="l-opt" style={{ height: 46 }} onClick={() => onPick(c, conn)}>
        <span className="ch-av" style={{ width: 30, height: 30, fontSize: 12, background: COLORS[c.name.length % 6] }}>{c.name[0]?.toUpperCase()}</span>
        <span style={{ textAlign: 'left' }}><span style={{ display: 'block' }}>{c.name}</span><span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 500 }}>{c.phone}{c.email ? ' · ' + c.email : ''}</span></span></button>)}</div>
        : <div style={{ textAlign: 'center', fontSize: 13.3, color: '#94a3b8', padding: '24px 0 2px' }}>Ningún contacto encontrado</div>}
  </LModal>
}

function ContactForm({ ConnPick, tags, onBack, onClose, onSave }) {
  const [f, setF] = useState({ name: '', cc: 'br', phone: '', email: '', state: '', city: '', cep: '', tags: [], fields: [] })
  const [ccOpen, setCc] = useState(false); const ccRef = useRef(); useOutside(ccRef, () => setCc(false))
  const cc = COUNTRIES.find(c => c[0] === f.cc)
  const ok = f.name.trim() && f.phone.replace(/\D/g, '').length >= 6
  const L = ({ children }) => <label className="l-lbl" style={{ marginTop: 19 }}>{children}</label>
  const save = openIt => onSave({ id: uid(), name: f.name.trim(), phone: `${cc[1]} ${f.phone}`, email: f.email, state: f.state, city: f.city, cep: f.cep, tags: f.tags, fields: f.fields.filter(x => x.k), created: new Date().toISOString(), stage: 'Nuevo', origin: 'Manual' }, openIt)
  return <LModal open onClose={onClose} title="Nuevo contacto" icon={<MessageSquare size={20} />} width={720} bodyStyle={{ padding: '20px 21px 26px' }}>
    <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}><ArrowLeft size={13} />Volver a la búsqueda</button>
    <ConnPick />
    <label className="l-lbl" style={{ marginTop: 0 }}>Nombre completo</label>
    <input className="l-in slate" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Nombre completo" />
    <L>Teléfono</L>
    <div style={{ display: 'flex', gap: 7 }}>
      <div className="l-sel" ref={ccRef} style={{ width: 100, flexShrink: 0 }}>
        <button type="button" className="l-in l-selb" style={{ height: 44, background: 'var(--card)', fontWeight: 600, fontSize: 14 }} onClick={() => setCc(!ccOpen)}><img src={flag(cc[0])} alt="" style={{ width: 16, height: 11, borderRadius: 1 }} onError={e => e.currentTarget.style.display = 'none'} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cc[1]}</span><ChevronDown size={14} className="chev" /></button>
        {ccOpen && <div className="l-selm" style={{ width: 230 }}>{COUNTRIES.map(c => <button key={c[0] + c[2]} className={'l-opt' + (c[0] === f.cc ? ' on' : '')} onClick={() => { setF({ ...f, cc: c[0] }); setCc(false) }}><img src={flag(c[0])} alt="" style={{ width: 16, height: 11, borderRadius: 1 }} onError={e => e.currentTarget.style.display = 'none'} />{c[2]}<span style={{ marginLeft: 'auto', opacity: .7 }}>{c[1]}</span></button>)}</div>}
      </div>
      <input className="l-in slate" inputMode="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/[^\d ]/g, '') })} placeholder={f.cc === 'br' ? '8599999999' : '999999999'} />
    </div>
    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 7 }}>{f.cc === 'br' ? 'DDD + número (10 u 11 dígitos)' : 'Número sin el código de país'}</div>
    <L>Correo</L>
    <input className="l-in slate" type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="Correo del contacto" />
    <L>Estado</L>
    <LSelect className="l-in slate2" value={f.state} onChange={v => setF({ ...f, state: v, city: '' })} options={UF.map(u => ({ value: u, label: u }))} placeholder="Seleccione el estado" bold style={{ fontSize: 15 }} />
    <L>Ciudad</L>
    <input className="l-in slate2" disabled={!f.state} value={f.city} onChange={e => setF({ ...f, city: e.target.value })} placeholder={f.state ? 'Escriba la ciudad' : 'Seleccione primero el estado'} style={{ fontSize: 14.5 }} />
    <L>CEP</L>
    <input className="l-in slate" inputMode="numeric" value={f.cep} placeholder="00000-000" onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 8); setF({ ...f, cep: d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d }) }} />
    <L>Etiquetas</L>
    <TagPicker value={f.tags} onChange={v => setF({ ...f, tags: v })} options={tags} placeholder="Seleccione etiquetas para este contacto..." slate />
    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--soft)', marginTop: 46 }}>Campos personalizados</div>
    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 9, marginBottom: 18 }}>Añada campos personalizados para este contacto</div>
    {f.fields.map((x, i) => <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 9 }}>
      <input className="l-in slate2" placeholder="Nombre del campo" value={x.k} onChange={e => setF({ ...f, fields: f.fields.map((y, j) => j === i ? { ...y, k: e.target.value } : y) })} />
      <input className="l-in slate2" placeholder="Valor" value={x.v} onChange={e => setF({ ...f, fields: f.fields.map((y, j) => j === i ? { ...y, v: e.target.value } : y) })} />
      <button className="ch-ib" style={{ height: 39, width: 39 }} onClick={() => setF({ ...f, fields: f.fields.filter((_, j) => j !== i) })}><Trash2 size={15} /></button></div>)}
    <button className="ch-dash" onClick={() => setF({ ...f, fields: [...f.fields, { k: '', v: '' }] })}><Plus size={16} />Añadir campo</button>
    <div style={{ height: 1, background: '#3a3550', margin: '26px 0 22px' }} />
    <div style={{ display: 'flex', gap: 9 }}>
      <button className="lb2 o" style={{ height: 34, fontSize: 13, padding: '0 13px' }} disabled={!ok} onClick={() => save(false)}><Save size={15} />Guardar contacto</button>
      <button className="lb2 p" style={{ height: 34, fontSize: 13, padding: '0 13px' }} disabled={!ok} onClick={() => save(true)}><MessageSquare size={15} />Guardar y abrir conversación</button>
    </div>
    <button onClick={onClose} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 20, marginLeft: 11 }}>Cancelar</button>
  </LModal>
}
