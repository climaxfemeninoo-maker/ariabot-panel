import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ListFilter, SlidersHorizontal, X, Check, ArrowLeft, Send, Smartphone, Plus, ChevronRight, ChevronDown, ChevronLeft, Lock, Copy, LogOut, Award, Archive, FolderPlus, LayoutGrid, RefreshCw, ArrowUpDown, BarChart3, QrCode, ShieldCheck, CheckCheck, UserCheck, CircleCheck, RotateCcw, Info } from 'lucide-react'
import { ChatInfo, ChatActions } from './ChatInfo'
import { Ticks } from './ChatTools'
import { useStore, useToast, uid, nowStr } from '../ui'
import { Sheet } from './dash/MobileDash'
import { HuellaModal } from './Huella'

const COLORS = ['#005ae3', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444']
const flag = c => <img src={`https://flagcdn.com/w40/${c}.png`} alt="" style={{ width: 22, height: 15, borderRadius: 2, objectFit: 'cover' }} onError={e => e.currentTarget.style.visibility = 'hidden'} />
const hhmm = () => new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
const Logo = ({ children }) => <div className="mv-logo"><img src="/leona-white.png" alt="Leona" />{children}</div>
const Tg = ({ on, set }) => <button className={'mv-tg' + (on ? ' on' : '')} onClick={() => set(!on)} />

/* ======================= MENÚ ======================= */
export function MobileMenu({ onClose, onAll }) {
  const nav = useNavigate(); const [p] = useStore('profile', { name: 'Pablo Monja Suclupe', email: 'k4el.ux@gmail.com' }); const [huella, setHuella] = useState(false)
  const ini = (p.name || '?').trim().split(/\s+/).map(w => w[0]).filter((_, i, a) => i === 0 || i === a.length - 1).join('').toUpperCase()
  if (huella) return <HuellaModal open onClose={() => { setHuella(false); onClose() }} />
  const Item = ({ ic, t, d, d2, onClick }) => <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', background: '#0c0f15', border: '1px solid #252933', borderRadius: 15, padding: '13px 13px', marginTop: 9, color: '#fff' }}>
    {ic}<div style={{ minWidth: 0, flex: 1 }}><div style={{ fontSize: 14.5 }}>{t}</div><div style={{ fontSize: 12, color: '#afb7c2', marginTop: 3 }}>{d}</div>{d2 && <div style={{ fontSize: 10.5, color: '#8f8a9e', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d2}</div>}</div><ChevronRight size={18} color="#8f8a9e" /></button>
  return <div className="md-ov" style={{ zIndex: 95, padding: '0 15px' }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="md-sh" style={{ background: '#0a0c12', border: '1px solid #252933', borderBottom: 'none', borderRadius: '22px 22px 0 0', padding: '8px 15px 22px' }}><div className="md-hd" style={{ background: '#5d5868' }} />
      <div style={{ fontSize: 15, fontWeight: 500, margin: '8px 0 6px' }}>Menú</div>
      <Item ic={<span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#60a5fa,#005ae3)', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 14 }}>{ini}</span>} t="Perfil" d="Cuenta, idioma y preferencias" d2={`${p.name} · ${p.email}`} onClick={() => { onClose(); nav('/profile') }} />
      <Item ic={<span style={{ width: 40, height: 40, borderRadius: 10, background: '#2c3c61', border: '1px solid #0b4eb7', display: 'grid', placeItems: 'center', color: '#bfdbfe' }}><Award size={19} /></span>} t="Trilha do Predador" d="Sellos, facturación y el próximo hito" onClick={() => { onClose(); nav('/trilha') }} />
    </div></div>
}

/* ======================= CHATS ======================= */
export function MobileChats() {
  const toast = useToast()
  const [chats, setChats] = useStore('chat_list', []); const [conns] = useStore('connections', []); const [deps] = useStore('departments', [])
  const [tags] = useStore('tags', []); const [contacts] = useStore('contacts', []); const [boards] = useStore('boards', []); const [qrs] = useStore('quick_replies', [])
  const [openId, setOpenId] = useStore('chat_open', null)
  const [tab, setTab] = useState('espera'); const [q, setQ] = useState(''); const [quick, setQuick] = useState('Todos'); const [sheet, setSheet] = useState(null)
  const blank = { q: '', agent: '', conns: [], deps: [], tags: [], crm: '' }; const [f, setF] = useState(blank); const [d, setD] = useState(blank); const [tq, setTq] = useState('')
  const [sel, setSel] = useState(null); const [txt, setTxt] = useState(''); const end = useRef(); const [mInfo, setMInfo] = useState(false)
  useEffect(() => { if (openId) { const c = chats.find(x => x.id === openId); if (c) { setTab(c.status); setSel(c.id) } setOpenId(null) } }, [openId])
  const cur = chats.find(c => c.id === sel)
  useEffect(() => { end.current?.scrollIntoView() }, [cur?.msgs.length])
  const allTags = [...new Set([...tags.map(t => t.name), ...contacts.flatMap(c => c.tags || [])])]
  const fOn = JSON.stringify(f) !== JSON.stringify(blank)
  const list = chats.filter(c => c.status === tab && (c.name + ' ' + c.phone).toLowerCase().includes((q + ' ').trim().toLowerCase())
    && (quick !== 'No leídos' || c.unread) && (quick !== 'Sin respuesta' || c.msgs.at(-1)?.f === 'in')
    && (!f.q || (c.name + c.phone + (c.email || '')).toLowerCase().includes(f.q.toLowerCase())) && (!f.agent || (c.agent || '').toLowerCase().includes(f.agent.toLowerCase()))
    && (!f.conns.length || f.conns.includes(c.conn)) && (!f.tags.length || f.tags.some(t => (c.tags || []).includes(t))))
  const upd = (id, fn) => setChats(cs => cs.map(c => c.id === id ? fn(c) : c))
  const send = (x = txt) => { if (!x.trim()) return; upd(cur.id, c => ({ ...c, last: Date.now(), msgs: [...c.msgs, { f: 'out', x, t: hhmm() }] })); setTxt('') }
  const move = (status, m) => { upd(cur.id, c => ({ ...c, status, agent: status === 'atencion' ? 'Pablo Monja Suclupe' : c.agent })); setTab(status); toast(m) }
  const tog = (k, v) => setD({ ...d, [k]: d[k].includes(v) ? d[k].filter(x => x !== v) : [...d[k], v] })
  if (cur) return <div style={{ position: 'fixed', inset: 0, zIndex: 95, background: '#0a0d13', color: '#fff', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 12px', borderBottom: '1px solid #1b1f27' }}><button onClick={() => setSel(null)} style={{ color: '#fff', display: 'grid' }}><ArrowLeft size={22} /></button>
      <span className="mv-av" style={{ width: 36, height: 36, background: COLORS[cur.name.length % 6] }}>{cur.name[0]?.toUpperCase()}</span><div style={{ minWidth: 0, flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600 }}>{cur.name}</div><div style={{ fontSize: 11.5, color: '#8f8a9e' }}>{cur.phone}</div></div>
      <ChatActions compact c={cur} upd={fn => upd(cur.id, fn)} move={move} /><button className="mv-rb" title="Información" onClick={() => setMInfo(true)}><Info size={18} /></button></div>
    {mInfo && <div className="ci-mob"><ChatInfo c={cur} upd={fn => upd(cur.id, fn)} onClose={() => setMInfo(false)} /></div>}
    <div className="wa-bg" style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {cur.msgs.length === 0 && <div style={{ margin: 'auto', fontSize: 13, color: '#8f8a9e' }}>Envía el primer mensaje.</div>}
      {cur.msgs.map((m, i) => <div key={i} className={'ch-m ' + m.f} style={{ maxWidth: '82%' }}>{m.x}<div className="t">{m.t}{m.f === 'out' && <Ticks size={16} />}</div></div>)}<div ref={end} /></div>
    {qrs.length > 0 && <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 12px 8px' }}>{qrs.map(r => <button key={r.id} className="mv-chip" style={{ height: 28, fontSize: 12, whiteSpace: 'nowrap', color: '#93c5fd' }} onClick={() => send(r.actions.filter(a => a.text).map(a => a.text).join('\n') || r.short)}>#{r.short}</button>)}</div>}
    <div style={{ display: 'flex', gap: 8, padding: '10px 12px 18px', borderTop: '1px solid #1b1f27' }}><div className="mv-srch" style={{ height: 44 }}><input value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Escribe un mensaje…" /></div>
      <button className="mv-rb" style={{ width: 44, height: 44, background: '#005ae3' }} onClick={() => send()}><Send size={18} /></button></div>
  </div>
  return <div className="mv">
    <Logo />
    <div className="mv-seg">{[['espera', 'En espera'], ['atencion', 'Atendiendo'], ['resueltos', 'Resueltos']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}{chats.filter(c => c.status === k).length > 0 && ` (${chats.filter(c => c.status === k).length})`}</button>)}</div>
    <div style={{ display: 'flex', gap: 9, alignItems: 'center', margin: '9px 15px 0' }}>
      <div className="mv-srch"><Search size={20} color="#8f8a9e" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar conversaciones..." /></div>
      <button className="mv-rb" onClick={() => setSheet('quick')}><ListFilter size={19} />{quick !== 'Todos' && <i className="dot" />}</button>
      <button className="mv-rb" onClick={() => { setD(f); setSheet('filter') }}><SlidersHorizontal size={19} />{fOn && <i className="dot" />}</button></div>
    <div className="mv-line" />
    {list.length === 0 ? <div className="mv-empty">No hay conversaciones en esta pestaña</div>
      : list.map(c => <div key={c.id} className="mv-it" onClick={() => { setSel(c.id); upd(c.id, x => ({ ...x, unread: 0 })) }}>
        <span className="mv-av" style={{ background: COLORS[c.name.length % 6] }}>{c.name[0]?.toUpperCase()}</span>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: 'flex' }}><b style={{ fontSize: 14.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</b><span style={{ marginLeft: 'auto', fontSize: 11, color: '#8f8a9e' }}>{c.msgs.at(-1)?.t}</span></div>
          <div style={{ display: 'flex', marginTop: 3 }}><span style={{ fontSize: 12.5, color: '#8f8a9e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.msgs.at(-1)?.x || c.phone}</span>{c.unread > 0 && <span className="ur" style={{ minWidth: 18, height: 18, borderRadius: 9, background: '#22c55e', fontSize: 10, display: 'grid', placeItems: 'center' }}>{c.unread}</span>}</div></div></div>)}
    {sheet === 'quick' && <Sheet onClose={() => setSheet(null)}><div style={{ fontSize: 16.5, fontWeight: 500, margin: '4px 0 6px 12px' }}>Filtros rápidos</div>
      {['Todos', 'No leídos', 'Sin respuesta'].map(x => <button key={x} onClick={() => { setQuick(x); setSheet(null) }} style={{ display: 'flex', alignItems: 'center', width: '100%', height: 37, padding: '0 12px', fontSize: 14.5, color: quick === x ? '#60a5fa' : '#fff' }}>{x}{quick === x && <Check size={19} style={{ marginLeft: 'auto' }} />}</button>)}<div style={{ height: 14 }} /></Sheet>}
    {sheet === 'filter' && <div className="md-ov" style={{ zIndex: 200 }} onClick={e => e.target === e.currentTarget && setSheet(null)}><div className="md-sh" style={{ maxHeight: '83vh', padding: '18px 18px 22px', background: '#13161c' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}><button style={{ color: '#fff', display: 'grid' }} onClick={() => setSheet(null)}><X size={22} /></button><b style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 500 }}>Filtros</b><button style={{ color: '#60a5fa', fontSize: 14 }} onClick={() => setD(blank)}>Limpiar</button></div>
      <div className="mv-lbl" style={{ marginTop: 22 }}>Buscar</div><input className="mv-in" value={d.q} onChange={e => setD({ ...d, q: e.target.value })} placeholder="Nombre, teléfono o correo" />
      <div className="mv-lbl">Agente</div><input className="mv-in" value={d.agent} onChange={e => setD({ ...d, agent: e.target.value })} placeholder="Nombre del agente" />
      <div className="mv-lbl">Conexiones</div>{conns.length ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{conns.map(c => <button key={c.id} className={'mv-chip' + (d.conns.includes(c.name) ? ' on' : '')} onClick={() => tog('conns', c.name)}>{c.name}</button>)}</div> : <div style={{ fontSize: 14, color: '#c2c9d4' }}>Sin opciones</div>}
      <div className="mv-lbl">Departamentos</div>{deps.length ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{deps.map(x => <button key={x.id} className={'mv-chip' + (d.deps.includes(x.name) ? ' on' : '')} onClick={() => tog('deps', x.name)}>{x.name}</button>)}</div> : <div style={{ fontSize: 14, color: '#c2c9d4' }}>Sin opciones</div>}
      <div className="mv-lbl">Etiquetas</div>
      <div style={{ position: 'relative' }}><Search size={19} color="#8f8a9e" style={{ position: 'absolute', left: 15, top: 15 }} /><input className="mv-in" style={{ paddingLeft: 47 }} value={tq} onChange={e => setTq(e.target.value)} placeholder="Buscar etiqueta..." /></div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{allTags.filter(t => t.toLowerCase().includes(tq.toLowerCase())).map(t => <button key={t} className={'mv-chip' + (d.tags.includes(t) ? ' on' : '')} onClick={() => tog('tags', t)}>{t}</button>)}</div>
      <div className="mv-lbl" style={{ marginTop: 18 }}>CRM</div>
      <select className="mv-in" style={{ appearance: 'none', background: '#0a0d13 url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'%23fff\'%3E%3Cpath d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E") no-repeat right 15px center' }} value={d.crm} onChange={e => setD({ ...d, crm: e.target.value })}><option value="">Todos</option>{boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
      <button className="md-btn" style={{ height: 41, marginTop: 48 }} onClick={() => { setF(d); setSheet(null) }}>Aplicar</button>
    </div></div>}
  </div>
}

/* ======================= CONEXIONES ======================= */
export function MobileConnections() {
  const toast = useToast(); const [conns, setConns] = useStore('connections', [])
  const [tab, setTab] = useState('all'); const [q, setQ] = useState(''); const [m, setM] = useState(null)
  const on = conns.filter(c => c.on).length
  const list = conns.filter(c => (tab === 'all' || (tab === 'on') === !!c.on) && (c.name + (c.phone || '')).toLowerCase().includes(q.toLowerCase()))
  return <div className="mv">
    <Logo><button className="mv-rb" style={{ position: 'absolute', right: 8, top: 58, width: 37, height: 37 }} onClick={() => setM({ name: '', type: 'qr', step: 0 })}><Plus size={20} /></button></Logo>
    <div className="mv-seg"><button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>Todos</button><button className={tab === 'on' ? 'on' : ''} onClick={() => setTab('on')}>Conectadas ({on})</button><button className={tab === 'off' ? 'on' : ''} onClick={() => setTab('off')}>Desconectadas ({conns.length - on})</button></div>
    <div style={{ margin: '11px 15px 0', display: 'flex' }}><div className="mv-srch"><Search size={20} color="#8f8a9e" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o número..." /></div></div>
    <div className="mv-line" style={{ marginTop: 11 }} />
    {list.length === 0 ? <div style={{ textAlign: 'center', paddingTop: 225 }}><Smartphone size={44} color="#9a96a8" strokeWidth={1.7} /><div style={{ fontSize: 15, fontWeight: 500, marginTop: 20 }}>Sin conexiones</div><div style={{ fontSize: 12.8, color: '#afb7c2', marginTop: 10 }}>{conns.length ? 'Ninguna conexión coincide con la búsqueda.' : 'Crea tu primera instancia de WhatsApp para empezar.'}</div></div>
      : list.map(c => <div key={c.id} className="mv-it"><span className="mv-av" style={{ borderRadius: 11, background: c.on ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)', color: c.on ? '#22c55e' : '#ef4444' }}><Smartphone size={20} /></span>
        <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 14.5, fontWeight: 600 }}>{c.name}</b><div style={{ fontSize: 12, color: '#8f8a9e', marginTop: 2 }}>{c.phone} · {c.type === 'qr' ? 'QR Code' : 'API Oficial'}</div></div>
        <button className={'mv-tsw' + (c.on ? ' on' : '')} onClick={() => { setConns(x => x.map(y => y.id === c.id ? { ...y, on: !y.on } : y)); toast(c.on ? 'Conexión desconectada' : 'Conexión reconectada', 'info') }} /></div>)}
    {m && <Sheet onClose={() => setM(null)}>
      {m.step === 0 ? <><div style={{ fontSize: 17, fontWeight: 500, marginTop: 4 }}>Nueva conexión</div>
        <div className="mv-lbl">Nombre de la conexión</div><input className="mv-in" autoFocus value={m.name} onChange={e => setM({ ...m, name: e.target.value })} placeholder="Ej.: WhatsApp ventas" />
        <div className="mv-lbl">Tipo</div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>{[['qr', 'QR Code', QrCode], ['api', 'API Oficial', ShieldCheck]].map(([k, l, Ic]) => <button key={k} onClick={() => setM({ ...m, type: k })} style={{ height: 70, borderRadius: 12, border: '1px solid ' + (m.type === k ? '#4d94ff' : '#343a46'), background: m.type === k ? '#1f2b45' : '#0a0d13', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13.5 }}><Ic size={20} color="#4d94ff" />{l}</button>)}</div>
        <button className="md-btn" style={{ marginTop: 22 }} disabled={!m.name.trim()} onClick={() => { setM({ ...m, step: 1 }); setTimeout(() => setM(x => x && { ...x, step: 2 }), 3500) }}>Continuar</button></>
        : m.step === 1 ? <div style={{ textAlign: 'center', padding: '10px 0 20px' }}><div style={{ fontSize: 16, fontWeight: 500 }}>Escanee el código con WhatsApp</div><div style={{ display: 'inline-block', background: '#fff', padding: 12, borderRadius: 12, marginTop: 16 }}><QrCode size={170} color="#111" strokeWidth={1.2} /></div><div style={{ fontSize: 12.5, color: '#afb7c2', marginTop: 12 }}>WhatsApp › Dispositivos vinculados › Vincular un dispositivo</div></div>
          : <div style={{ textAlign: 'center', padding: '14px 0 6px' }}><CircleCheck size={50} color="#22c55e" /><div style={{ fontSize: 16, fontWeight: 600, marginTop: 10 }}>¡Conectado!</div>
            <button className="md-btn" style={{ marginTop: 20 }} onClick={() => { setConns(c => [...c, { id: uid(), name: m.name.trim(), type: m.type, phone: '+51 9' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0'), on: true, created: nowStr() }]); setM(null); toast('Conexión creada') }}>Finalizar</button></div>}
    </Sheet>}
  </div>
}

/* ======================= PERFIL ======================= */
const LANGS = [['pt-BR', 'Portugués (Brasil)', 'br'], ['en-US', 'Inglés', 'us'], ['es-LA', 'Español', 'es']]
export function MobileProfile() {
  const toast = useToast(); const nav = useNavigate()
  const PD = { name: 'Pablo Monja Suclupe', email: 'k4el.ux@gmail.com', phone: '+994181027' }
  const [pr, setP] = useStore('profile', PD); const p = { ...PD, ...pr }
  const [companies] = useStore('companies', [{ id: 'c1', name: 'Empresa Pablo Monja Suclupe' }]); const [cur, setCur] = useStore('company', 'c1')
  const [lang, setLang] = useStore('lang', 'es-LA'); const [, setAuthed] = useStore('authed', false)
  const [nt, setNt] = useStore('notif_mobile', { all: false, sales: {}, report: {}, disc: {} })
  const [f, setF] = useState({ name: p.name, phone: p.phone }); const [s, setS] = useState(null)
  const co = companies.find(c => c.id === cur) || companies[0]; const L = LANGS.find(l => l[0] === lang) || LANGS[2]
  const dirty = f.name.trim() !== p.name || f.phone !== p.phone
  if (s === 'notif') return <div className="mv" style={{ padding: '0 15px 100px' }}>
    <div style={{ display: 'flex', alignItems: 'center', height: 80, paddingTop: 20 }}><button onClick={() => setS(null)} style={{ color: '#fff', display: 'grid' }}><ArrowLeft size={22} /></button><b style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 500, marginRight: 22 }}>Notificaciones</b></div>
    <div className="mv-sec" style={{ marginTop: 8 }}>Recibir de todas las cuentas</div>
    <div className="mv-box mv-row" style={{ gap: 12 }}><div><div style={{ fontSize: 14.5 }}>Recibir de todas las cuentas</div><div style={{ fontSize: 12, color: '#afb7c2', marginTop: 3, lineHeight: 1.4 }}>Hoy las notificaciones llegan solo de la cuenta activa. Actívalo para recibir también de las otras empresas a las que tienes acceso.</div></div><Tg on={nt.all} set={v => setNt({ ...nt, all: v })} /></div>
    {[['sales', 'Notificaciones de ventas'], ['report', 'Notificaciones de informe'], ['disc', 'Notificaciones de desconexión']].map(([k, l]) => <div key={k}><div className="mv-sec">{l}</div>
      <div className="mv-box">{(nt.all ? companies : [co]).map((c, i) => <div key={c.id} className="mv-row" style={{ borderTop: i ? '1px solid #1f232d' : 'none', minHeight: 56 }}><span style={{ fontSize: 14.5, flex: 1 }}>{c.name}</span><Tg on={nt[k][c.id] !== false} set={v => setNt({ ...nt, [k]: { ...nt[k], [c.id]: v } })} /></div>)}</div></div>)}
  </div>
  return <div className="mv" style={{ padding: '0 15px 100px' }}>
    <div className="mv-logo" style={{ marginBottom: 2 }}><img src="/leona-white.png" alt="" /></div>
    <div className="mv-sec" style={{ marginTop: 0 }}>Cuenta</div>
    <div className="mv-box"><button className="mv-row" style={{ minHeight: 64 }} onClick={() => setS('acc')}><div><small>Cuenta activa</small><b>{co.name}</b></div><ChevronRight size={18} color="#8f8a9e" style={{ marginLeft: 'auto' }} /></button></div>
    <div className="mv-sec">Preferencias</div>
    <div className="mv-box"><button className="mv-row" onClick={() => setS('lang')}><div><small>Idioma</small><b style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{flag(L[2])}{L[1]}</b></div><ChevronDown size={18} color="#8f8a9e" style={{ marginLeft: 'auto' }} /></button>
      <button className="mv-row" onClick={() => setS('notif')}><div><small>Notificaciones</small><b>Ventas, informes y desconexiones</b></div><ChevronRight size={18} color="#8f8a9e" style={{ marginLeft: 'auto' }} /></button></div>
    <div className="mv-sec">Datos personales</div>
    <div className="mv-box mv-row" style={{ gap: 16, alignItems: 'flex-start', padding: '17px 15px' }}><Lock size={19} color="#5d5868" style={{ marginTop: 10 }} /><div style={{ flex: 1, minWidth: 0 }}><small>Correo</small><b style={{ display: 'block' }}>{p.email}</b><div style={{ fontSize: 11.5, color: '#afb7c2', marginTop: 6 }}>Lo modifica el administrador de la cuenta.</div></div>
      <button style={{ color: '#fff', display: 'grid', marginTop: 12 }} onClick={() => { navigator.clipboard?.writeText(p.email); toast('Correo copiado') }}><Copy size={20} /></button></div>
    <label className="mv-of"><span>Nombre</span><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></label>
    <label className="mv-of" style={{ display: 'block' }}><span>WhatsApp</span><input inputMode="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/[^\d+ ]/g, '') })} /></label>
    <button disabled={!dirty || !f.name.trim()} onClick={() => { setP(x => ({ ...x, name: f.name.trim(), phone: f.phone })); toast('Datos guardados') }} style={{ width: '100%', height: 41, borderRadius: 11, marginTop: 20, fontSize: 14, background: dirty && f.name.trim() ? '#005ae3' : '#23262d', color: dirty && f.name.trim() ? '#fff' : '#77737f' }}>Guardar</button>
    <button onClick={() => setS('exit')} style={{ width: '100%', height: 36, borderRadius: 18, marginTop: 20, fontSize: 14, border: '1px solid #7f2f33', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}><LogOut size={16} />Salir</button>
    {s === 'acc' && <Sheet onClose={() => setS(null)}><div style={{ textAlign: 'center', fontSize: 16, fontWeight: 500, marginTop: 8 }}>Elegir cuenta</div>
      {companies.length < 2 ? <div style={{ textAlign: 'center', fontSize: 14, color: '#afb7c2', margin: '18px 0 30px' }}>Solo tienes acceso a esta cuenta.</div>
        : <div style={{ margin: '16px 0 14px' }}>{companies.map(c => <button key={c.id} onClick={() => { setCur(c.id); setS(null); toast('Cuenta cambiada a ' + c.name) }} className="mv-box mv-row" style={{ marginBottom: 8, borderColor: c.id === cur ? '#0b4eb7' : undefined, background: c.id === cur ? '#1f2b45' : undefined }}>{c.name}{c.id === cur && <Check size={18} color="#4d94ff" style={{ marginLeft: 'auto' }} />}</button>)}</div>}</Sheet>}
    {s === 'lang' && <Sheet onClose={() => setS(null)}><div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 18px' }}><button onClick={() => setS(null)} style={{ color: '#fff', display: 'grid' }}><ArrowLeft size={22} /></button><b style={{ flex: 1, textAlign: 'center', fontSize: 16.5, fontWeight: 500, marginRight: 22 }}>Idioma de la app</b></div>
      {LANGS.map(([k, l, c]) => <button key={k} onClick={() => { setLang(k); toast('Idioma guardado') }} style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', height: 56, borderRadius: 13, marginBottom: 9, padding: '0 17px', background: lang === k ? '#1d263b' : '#12151b', border: '1px solid ' + (lang === k ? '#0b4eb7' : '#1f232d'), color: '#fff', fontSize: 15.5 }}>{flag(c)}{l}
        <span style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', border: lang === k ? 'none' : '1.5px solid #343a46', background: lang === k ? '#4d94ff' : 'none', display: 'grid', placeItems: 'center' }}>{lang === k && <Check size={13} strokeWidth={3.5} color="#12151b" />}</span></button>)}<div style={{ height: 16 }} /></Sheet>}
    {s === 'exit' && <div className="mv-dlg" onClick={e => e.target === e.currentTarget && setS(null)}><div><div style={{ fontSize: 22, fontWeight: 500 }}>¿Salir?</div><div style={{ fontSize: 13.5, color: '#e3e6ea', marginTop: 12, lineHeight: 1.5 }}>Tendrás que iniciar sesión de nuevo para usar la app.</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 18, marginTop: 22 }}><button style={{ color: '#60a5fa', fontSize: 14 }} onClick={() => setS(null)}>Cancelar</button><button style={{ background: '#005ae3', color: '#fff', fontSize: 14, height: 41, padding: '0 22px', borderRadius: 13 }} onClick={() => { setAuthed(false); nav('/welcome') }}>Salir</button></div></div></div>}
  </div>
}

/* ======================= CAMPAÑAS (Facebook) ======================= */
const DEMO = [['-[Recetas]-[PDF]-[Ventas]-[PBR]', 2.08, 0], ['-[Recetas]-[PDF]-[Ventas]-[PBR] 2', 2.25, 0], ['[CBO] Ebook Recetas - Conversión', 45.2, 312.6], ['[ABO] Ebook Uñas - Mensajes WhatsApp', 28.9, 189.4], ['Remarketing 7 días', 12.5, 74.7]]
const FAC = { 'Hoy': .15, 'Ayer': .15, 'Últimos 7 días': 1, 'Últimos 30 días': 4 }
export function MobileCampaigns() {
  const toast = useToast()
  const [connected, setConnected] = useStore('fbConnected', false); const [camps, setCamps] = useStore('fbCamps', []); const [products] = useStore('products', [])
  const [tab, setTab] = useState('camp'); const [open, setOpen] = useState(false); const [sel, setSel] = useState([]); const [per, setPer] = useState(50); const [page, setPage] = useState(0); const [spin, setSpin] = useState(false); const [upd, setUpd] = useState(Date.now())
  const blank = { st: 'any', period: 'Últimos 7 días', acc: 'all', prod: 'any', sort: 'def', dir: -1, q: '', detail: true }
  const [f, setF] = useState(blank); const [d, setD] = useState(blank)
  const nF = ['st', 'acc', 'prod', 'sort', 'q'].filter(k => f[k] !== blank[k]).length + (f.period !== blank.period ? 1 : 0)
  const k = FAC[f.period]
  const rows = camps.map(c => { const spend = c.spend * k, rev = c.rev * k, sales = Math.round(rev / 29.9); return { ...c, spend, rev, sales, prof: rev - spend, roas: spend ? rev / spend : 0 } })
    .filter(c => (f.st === 'any' || (f.st === 'on') === c.on) && c.name.toLowerCase().includes(f.q.toLowerCase()))
    .sort((a, b) => f.sort === 'def' ? 0 : f.dir * (a[f.sort] - b[f.sort]))
  const pages = Math.max(1, Math.ceil(rows.length / per)); const pg = Math.min(page, pages - 1); const shown = rows.slice(pg * per, pg * per + per)
  const usd = v => '$' + v.toFixed(2); const neg = v => v < 0 ? '-$' + Math.abs(v).toFixed(2) : usd(v)
  const connect = () => { setConnected(true); setCamps(DEMO.map(([name, spend, rev], i) => ({ id: uid(), name, spend, rev, on: i > 1, budget: 20, aid: '1202' + String(Math.floor(Math.random() * 1e14)).padStart(14, '0') }))); toast('Cuenta de Meta conectada') }
  const TABS = [['acc', Archive, 'Cuentas'], ['camp', FolderPlus, 'Campañas'], ['set', LayoutGrid, 'Conjuntos'], ['ads', Smartphone, 'Anuncios']]
  const mins = Math.floor((Date.now() - upd) / 6e4)
  return <div className="mv" style={{ padding: '0 13px 100px' }}>
    <div style={{ display: 'flex', borderBottom: '1px solid #252933', margin: '10px -13px 0' }}>{TABS.map(([t, Ic, l]) => <button key={t} title={l} onClick={() => setTab(t)} style={{ flex: 1, height: 40, display: 'grid', placeItems: 'center', color: tab === t ? '#4d94ff' : '#c2c9d4', borderBottom: '2px solid ' + (tab === t ? '#005ae3' : 'transparent'), marginBottom: -1 }}><Ic size={19} /></button>)}</div>
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 13 }}><div><div style={{ fontSize: 20, fontWeight: 700 }}>{TABS.find(t => t[0] === tab)[2]}</div><div style={{ fontSize: 10, color: '#8f8a9e', marginTop: 2 }}>Actualizado {mins ? `hace ${mins} min` : 'ahora mismo'} · {camps.length}</div></div>
      <button disabled={!connected} onClick={() => { setSpin(true); setTimeout(() => { setSpin(false); setUpd(Date.now()); toast('Campañas actualizadas') }, 900) }} style={{ marginLeft: 'auto', height: 36, padding: '0 13px', borderRadius: 9, background: '#005ae3', color: '#fff', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, opacity: connected ? 1 : .5 }}><RefreshCw size={13} className={spin ? 'spin' : ''} />Actualizar</button></div>
    {!connected ? <div style={{ textAlign: 'center', paddingTop: 120 }}><BarChart3 size={44} color="#77737f" /><div style={{ fontSize: 15, fontWeight: 500, marginTop: 18 }}>Conecte su cuenta de Meta</div><div style={{ fontSize: 12.8, color: '#afb7c2', marginTop: 8 }}>Vea gasto, ingresos y ROAS de sus campañas.</div><button className="md-btn" style={{ width: 'auto', padding: '0 22px', marginTop: 20 }} onClick={connect}>Conectar con Facebook</button></div>
      : tab === 'acc' ? <div className="mv-camp"><b>Cuenta publicitaria principal</b><div style={{ fontSize: 11.5, color: '#8f8a9e', marginTop: 3 }}>{camps.length} campañas · moneda USD</div><button style={{ marginTop: 12, fontSize: 12.5, color: '#f87171' }} onClick={() => { setConnected(false); setCamps([]) }}>Desconectar</button></div>
        : tab !== 'camp' ? <div style={{ textAlign: 'center', color: '#afb7c2', paddingTop: 100, fontSize: 13.5 }}>Sin {tab === 'set' ? 'conjuntos de anuncios' : 'anuncios'} en el período.</div> : <>
          <div style={{ background: '#14171e', border: '1px solid #252933', borderRadius: 10, marginTop: 13 }}>
            <button onClick={() => { setD(f); setOpen(!open) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 38, padding: '0 11px', color: '#fff', fontSize: 12.5 }}><SlidersHorizontal size={14} color="#4d94ff" />{f.period}
              {nF > 0 && <span style={{ marginLeft: 'auto', width: 17, height: 17, borderRadius: '50%', background: '#005ae3', fontSize: 10, display: 'grid', placeItems: 'center' }}>{nF}</span>}<ChevronDown size={15} color="#8f8a9e" style={{ marginLeft: nF ? 6 : 'auto', transform: open ? 'rotate(180deg)' : '' }} /></button>
            {open && <div style={{ padding: '0 11px 12px', borderTop: '1px solid #252933' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><span className="mv-cap">ESTADO DE LA CAMPAÑA</span><select className="mv-sel" value={d.st} onChange={e => setD({ ...d, st: e.target.value })}><option value="any">Cualquiera</option><option value="on">Activas</option><option value="off">Pausadas</option></select></div>
                <div><span className="mv-cap">PERÍODO DE VISUALIZACIÓN</span><select className="mv-sel" value={d.period} onChange={e => setD({ ...d, period: e.target.value })}>{Object.keys(FAC).map(x => <option key={x}>{x}</option>)}</select></div>
                <div><span className="mv-cap">CUENTA DE ANUNCIO</span><select className="mv-sel" value={d.acc} onChange={e => setD({ ...d, acc: e.target.value })}><option value="all">Todas</option><option value="main">Principal</option></select></div>
                <div><span className="mv-cap">PRODUCTO</span><select className="mv-sel" value={d.prod} onChange={e => setD({ ...d, prod: e.target.value })}><option value="any">Cualquier</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div></div>
              <span className="mv-cap">ORDENAR POR</span><div style={{ display: 'flex', gap: 8 }}><select className="mv-sel" value={d.sort} onChange={e => setD({ ...d, sort: e.target.value })}><option value="def">Predeterminado del período</option><option value="spend">Gasto</option><option value="rev">Ingresos</option><option value="roas">ROAS</option><option value="prof">Utilidad</option></select>
                <button onClick={() => setD({ ...d, dir: -d.dir })} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #252933', color: '#c2c9d4', display: 'grid', placeItems: 'center', flexShrink: 0, background: '#0a0d13' }}><ArrowUpDown size={14} style={{ transform: d.dir > 0 ? 'scaleY(-1)' : '' }} /></button></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, borderRadius: 8, border: '1px solid #252933', background: '#0a0d13', padding: '0 10px', marginTop: 9 }}><Search size={14} color="#8f8a9e" /><input value={d.q} onChange={e => setD({ ...d, q: e.target.value })} placeholder="Filtrar por nombre" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 12 }} /></div>
              <button onClick={() => setD({ ...d, detail: !d.detail })} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 36, borderRadius: 8, border: '1px solid #252933', background: '#0a0d13', padding: '0 10px', marginTop: 8, color: '#fff', fontSize: 12, fontWeight: 600 }}><span className={'mv-cb' + (d.detail ? ' on' : '')}>{d.detail && <Check size={11} strokeWidth={3} />}</span>Métricas del detalle<span style={{ marginLeft: 'auto', fontSize: 10, color: '#4d94ff' }}>{d.detail ? 'ON' : 'OFF'}</span></button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}><button onClick={() => { setD(blank); setF(blank) }} style={{ height: 38, borderRadius: 8, background: '#23262d', color: '#fff', fontSize: 13, fontWeight: 600 }}>Limpiar</button><button onClick={() => { setF(d); setOpen(false); setPage(0) }} style={{ height: 38, borderRadius: 8, background: '#005ae3', color: '#fff', fontSize: 13, fontWeight: 600 }}>Aplicar filtros</button></div>
            </div>}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 12 }}><button className={'mv-cb' + (sel.length === shown.length && shown.length ? ' on' : '')} onClick={() => setSel(sel.length === shown.length ? [] : shown.map(c => c.id))}>{sel.length === shown.length && shown.length > 0 && <Check size={11} strokeWidth={3} />}</button>{sel.length ? `${sel.length} seleccionadas` : 'Seleccionar todas'}
            {sel.length > 0 && <><button style={{ fontSize: 11.5, color: '#4d94ff' }} onClick={() => { setCamps(c => c.map(x => sel.includes(x.id) ? { ...x, on: true } : x)); setSel([]) }}>Activar</button><button style={{ fontSize: 11.5, color: '#f87171' }} onClick={() => { setCamps(c => c.map(x => sel.includes(x.id) ? { ...x, on: false } : x)); setSel([]) }}>Pausar</button></>}
            <span style={{ marginLeft: 'auto', fontSize: 10.5, color: '#8f8a9e' }}>{rows.length ? pg * per + 1 : 0} - {Math.min(rows.length, pg * per + per)} / {rows.length}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}><select className="mv-sel" style={{ width: 110, height: 30 }} value={per} onChange={e => { setPer(+e.target.value); setPage(0) }}>{[10, 25, 50].map(n => <option key={n} value={n}>{n} / por página</option>)}</select>
            <button disabled={pg === 0} onClick={() => setPage(pg - 1)} style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: 7, border: '1px solid #252933', color: pg ? '#fff' : '#5d5868', display: 'grid', placeItems: 'center' }}><ChevronLeft size={15} /></button>
            <button disabled={pg >= pages - 1} onClick={() => setPage(pg + 1)} style={{ marginLeft: 6, width: 30, height: 30, borderRadius: 7, border: '1px solid #252933', color: pg < pages - 1 ? '#fff' : '#5d5868', display: 'grid', placeItems: 'center' }}><ChevronRight size={15} /></button></div>
          {shown.length === 0 && <div style={{ textAlign: 'center', color: '#afb7c2', paddingTop: 60, fontSize: 13 }}>Ninguna campaña coincide con los filtros.</div>}
          {shown.map(c => <div key={c.id} className="mv-camp">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
              <button className={'mv-cb' + (sel.includes(c.id) ? ' on' : '')} style={{ marginTop: 2 }} onClick={() => setSel(s => s.includes(c.id) ? s.filter(x => x !== c.id) : [...s, c.id])}>{sel.includes(c.id) && <Check size={11} strokeWidth={3} />}</button>
              <button className={'mv-tsw' + (c.on ? ' on' : '')} onClick={() => { setCamps(x => x.map(y => y.id === c.id ? { ...y, on: !y.on } : y)); toast(c.on ? 'Campaña pausada' : 'Campaña activada') }} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}><span style={{ width: 7, height: 10, borderRadius: 1.5, background: c.on ? '#22c55e' : '#ef4444', flexShrink: 0 }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span></div>
                <div style={{ fontSize: 9, color: '#8f8a9e', marginTop: 2 }}>#{(c.aid || c.id).slice(0, 15)} · Sin Bid Cap</div></div>
              <div style={{ textAlign: 'right' }}><b style={{ fontSize: 12.5, color: c.roas >= 1 ? '#22c55e' : '#ef4444' }}>{c.roas.toFixed(2)}</b><div style={{ fontSize: 8, fontWeight: 700, color: '#8f8a9e', letterSpacing: '.06em' }}>ROAS</div></div></div>
            <div className="mv-mg"><div><small>GASTOS</small><b>{usd(c.spend)}</b></div><div><small>INGRESOS</small><b>{usd(c.rev)}</b></div><div><small>VENTAS</small><b>{c.sales}</b></div>
              {f.detail && <><div><small>UTILIDAD</small><b style={{ color: c.prof < 0 ? '#ef4444' : '#22c55e' }}>{neg(c.prof)}</b></div><div><small>CPA</small><b>{c.sales ? usd(c.spend / c.sales) : 'N/A'}</b></div><div><small>MARGEN</small><b>{c.rev ? (c.prof / c.rev * 100).toFixed(0) + '%' : 'N/A'}</b></div></>}</div>
          </div>)}
        </>}
  </div>
}
