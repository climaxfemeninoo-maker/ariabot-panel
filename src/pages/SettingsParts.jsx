import { useState, useRef } from 'react'
import { Search, Plus, MoreVertical, KeyRound, Pencil, Mail, Shield, ShieldCheck, Crown, Users, Clock, CircleCheck, CircleX, CircleAlert, UserPlus, Headphones, Languages, Sparkles, Plug, MessageCircle, Image, Video, Mic, FileText, Sticker, LayoutGrid, Hash, ChevronUp, ChevronDown, Trash2, Upload, Bold, Italic, Strikethrough, Smile, Code, Save, RotateCcw, X } from 'lucide-react'
import { useStore, useToast, uid, useOutside } from '../ui'
import { LModal, LSelect, Toggle } from './leona'

const ME = { id: 'me', name: 'Pablo Monja Suclupe', email: 'k4el.ux@gmail.com', role: 'owner', dep: '' }
const ROLES = { owner: ['Propietario', '#f59e0b', Crown], admin: ['Administrador', '#a78bfa', ShieldCheck], member: ['Miembro', '#60a5fa', Shield] }
const Info = ({ children, ic: Ic = Mail }) => <div className="pf-hint" style={{ height: 'auto', padding: '11px 14px', alignItems: 'flex-start', lineHeight: 1.5, marginTop: 9 }}><Ic size={15} style={{ marginTop: 2, flexShrink: 0 }} />{children}</div>
const EmailIn = ({ v, set }) => <div className="pf-in"><Mail size={15} /><input type="email" autoFocus style={{ background: 'var(--in2)', fontWeight: 500 }} value={v} onChange={e => set(e.target.value)} placeholder="usuario@ejemplo.com" /></div>
const okMail = v => /^\S+@\S+\.\S+$/.test(v.trim())
export const Empty = ({ ic: Ic, t, d, children, h = 178 }) => <div className="sa-empty" style={{ height: h }}><Ic size={40} strokeWidth={1.9} className="big" /><h3>{t}</h3>{d && <p>{d}</p>}{children}</div>

/* ---------------- Nueva cuenta ---------------- */
export function NewAccountModal({ open, onClose }) {
  const toast = useToast(); const [, setCompanies] = useStore('companies', [{ id: 'c1', name: 'Empresa Pablo Monja Suclupe' }])
  const [f, setF] = useState({ name: '', desc: '', slug: '', active: true })
  if (!open) return null
  const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const save = () => { setCompanies(cs => [...cs, { id: uid(), name: f.name.trim(), desc: f.desc.trim(), slug: f.slug || slugify(f.name), active: f.active }]); toast('Cuenta creada: ' + f.name.trim()); setF({ name: '', desc: '', slug: '', active: true }); onClose() }
  return <LModal open onClose={onClose} title="Nueva cuenta" width={491} bodyStyle={{ padding: '24px 24px 0' }}>
    <label className="tm-lb">Nombre de la cuenta *</label><input className="l-in" style={{ background: 'var(--in2)', height: 37 }} autoFocus value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Ingrese el nombre de la cuenta" />
    <label className="tm-lb" style={{ marginTop: 20 }}>Descripción</label><textarea className="l-in" style={{ background: 'var(--in2)', height: 73, padding: '10px 13px', resize: 'vertical' }} value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} placeholder="Descripción opcional" />
    <label className="tm-lb" style={{ marginTop: 16 }}>Slug</label><input className="l-in" style={{ background: 'var(--in2)', height: 37 }} value={f.slug} onChange={e => setF({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder={f.name ? slugify(f.name) : 'slug-de-cuenta (opcional)'} />
    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>El slug se genera a partir del nombre. Use solo minúsculas, números y guiones.</div>
    <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.3, marginTop: 17, cursor: 'pointer' }}><input type="checkbox" checked={f.active} onChange={e => setF({ ...f, active: e.target.checked })} style={{ width: 15, height: 15, accentColor: '#3b82f6' }} />Cuenta activa</label>
    <div style={{ borderTop: '1px solid var(--border2)', marginTop: 21, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 11 }}>
      <button className="lb2 g" onClick={onClose}>Cancelar</button><button className="lb2 p" style={{ background: '#9b6cf8' }} disabled={!f.name.trim()} onClick={save}>Crear cuenta</button></div>
  </LModal>
}

/* ---------------- Invitar miembro (equipo) ---------------- */
export function InviteMemberModal({ open, onClose }) {
  const toast = useToast(); const [, setInv] = useStore('team_invites', [])
  const [e, setE] = useState(''); const [role, setRole] = useState('member')
  if (!open) return null
  return <LModal open onClose={onClose} title="Invitar miembro" desc="Envíe una invitación por correo a un usuario ya registrado en la plataforma" width={641} bodyStyle={{ padding: '22px 22px 0' }}>
    <label className="tm-lb">Correo del usuario</label><EmailIn v={e} set={setE} />
    <Info>El usuario debe estar registrado en la plataforma. Enviaremos un correo para aceptar la invitación.</Info>
    <label className="tm-lb" style={{ marginTop: 20 }}>Rol en la cuenta</label>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[['member', 'Miembro', 'Acceso básico', Shield], ['admin', 'Administrador', 'Gestionar recursos', ShieldCheck]].map(([k, t, d, Ic]) => <button key={k} className={'tm-role' + (role === k ? ' on' : '')} onClick={() => setRole(k)}><Ic size={18} /><b>{t}</b><span>{d}</span></button>)}</div>
    <div style={{ borderTop: '1px solid var(--border2)', marginTop: 20, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 11 }}>
      <button className="lb2 g" onClick={onClose}>Cancelar</button>
      <button className="lb2 p" disabled={!okMail(e)} onClick={() => { setInv(x => [{ id: uid(), email: e.trim(), role, date: new Date().toLocaleDateString('es-PE') }, ...x]); toast('Invitación enviada a ' + e.trim()); setE(''); onClose() }}><UserPlus size={16} />Enviar invitación</button></div>
  </LModal>
}

function RowMenu({ items }) {
  const [o, setO] = useState(false); const r = useRef(); useOutside(r, () => setO(false))
  return <span ref={r} style={{ position: 'relative', display: 'inline-flex' }}><button className="ch-ib" style={{ width: 28, height: 28 }} onClick={() => setO(!o)}><MoreVertical size={16} /></button>
    {o && <div className="fl-menu" style={{ top: 'calc(100% + 6px)', right: -20, width: 175 }}>{items.map(([Ic, l, fn]) => <button key={l} className="fl-mi" style={{ fontSize: 13.3 }} onClick={() => { setO(false); fn() }}><Ic size={15} />{l}</button>)}</div>}</span>
}

/* ---------------- Equipo ---------------- */
const PERMS = ['Dashboard', 'Chats en vivo', 'Kanban', 'Contactos', 'Flujos', 'Agentes de IA', 'Conexiones', 'Webhooks', 'Envíos masivos', 'Cobros y suscripciones', 'Configuración']
export function Team() {
  const toast = useToast()
  const [members, setMembers] = useStore('team_members', [ME]); const [inv, setInv] = useStore('team_invites', []); const [deps] = useStore('departments', [])
  const [q, setQ] = useState(''); const [fr, setFr] = useState('all'); const [fd, setFd] = useState('all'); const [sort, setSort] = useState(['name', 1]); const [sel, setSel] = useState([])
  const [mod, setMod] = useState(null)
  const rows = members.filter(m => (m.name + m.email + ROLES[m.role][0]).toLowerCase().includes(q.toLowerCase()) && (fr === 'all' || m.role === fr) && (fd === 'all' || (m.dep || '') === (fd === 'none' ? '' : fd)))
    .sort((a, b) => sort[1] * String(a[sort[0]] || '').localeCompare(String(b[sort[0]] || '')))
  const S = k => <span style={{ cursor: 'pointer' }} onClick={() => setSort(s => [k, s[0] === k ? -s[1] : 1])}> ⇅</span>
  const depName = id => deps.find(d => d.id === id)?.name
  return <div className="st-card" style={{ marginTop: 0, padding: '23px 23px 23px' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ fontSize: 13.3, color: 'var(--soft)' }}>{members.length} miembros</span><button className="lp-btn p" style={{ marginLeft: 'auto' }} onClick={() => setMod({ t: 'invite' })}><Plus size={16} />Invitar miembro</button></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 165px 194px', gap: 15, marginTop: 16 }}>
      <div><label className="tm-lb">Buscar</label><div className="lp-srch"><Search size={15} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, correo o rol..." style={{ fontWeight: 500 }} /></div></div>
      <div><label className="tm-lb">Función</label><LSelect className="l-in ct-in" bold value={fr} onChange={setFr} options={[['all', 'Todas las funciones'], ['owner', 'Propietario'], ['admin', 'Administrador'], ['member', 'Miembro']].map(([value, label]) => ({ value, label }))} /></div>
      <div><label className="tm-lb">Departamento</label><LSelect className="l-in ct-in" bold value={fd} onChange={setFd} options={[{ value: 'all', label: 'Todos los departamentos' }, { value: 'none', label: 'Sin departamento' }, ...deps.map(d => ({ value: d.id, label: d.name }))]} /></div>
    </div>
    <div style={{ border: '1px solid var(--border)', borderRadius: 5, marginTop: 16 }}>
      <table className="ct-tbl"><thead><tr><th style={{ width: 52, paddingLeft: 16 }}><span className={'ct-cb' + (sel.length === rows.length && rows.length ? ' on' : '')} onClick={() => setSel(sel.length === rows.length ? [] : rows.map(r => r.id))} /></th>
        <th style={{ textTransform: 'none', fontSize: 11.8 }}>Miembro{S('name')}</th><th style={{ textTransform: 'none', fontSize: 11.8 }}>Función{S('role')}</th><th style={{ textTransform: 'none', fontSize: 11.8 }}>Depto{S('dep')}</th><th style={{ textAlign: 'right', paddingRight: 16 }}>ACCIONES</th></tr></thead>
        <tbody>{rows.map(m => { const [rl, rc, RI] = ROLES[m.role]; return <tr key={m.id}>
          <td style={{ paddingLeft: 16 }}><span className={'ct-cb' + (sel.includes(m.id) ? ' on' : '')} onClick={() => setSel(s => s.includes(m.id) ? s.filter(x => x !== m.id) : [...s, m.id])} /></td>
          <td><div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><span className="ct-av" style={{ background: '#059669', position: 'relative', overflow: 'visible' }}>{m.name[0]?.toUpperCase()}{m.id === 'me' && <i className="tm-dot" />}</span><div><div className="ct-nm">{m.name}</div><div className="ct-em">{m.email}</div></div></div></td>
          <td><span className="tm-badge" style={{ color: rc, background: rc + '1f', borderColor: rc + '66' }}><RI size={12} />{rl}</span></td>
          <td style={{ fontStyle: depName(m.dep) ? 'normal' : 'italic', color: depName(m.dep) ? 'var(--text)' : '#94a3b8', fontSize: 12.5 }}>{depName(m.dep) || 'Sin departamento'}</td>
          <td style={{ textAlign: 'right', paddingRight: 22 }}><RowMenu items={[[KeyRound, 'Permissões', () => setMod({ t: 'perm', m })], [Pencil, 'Editar perfil', () => setMod({ t: 'edit', m: { ...m } })], ...(m.id !== 'me' ? [[Trash2, 'Quitar del equipo', () => { setMembers(x => x.filter(y => y.id !== m.id)); toast('Miembro quitado') }]] : [])]} /></td></tr> })}</tbody></table>
      {rows.length === 0 && <div style={{ padding: 22, textAlign: 'center', fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Ningún miembro coincide con los filtros.</div>}
    </div>
    <div style={{ border: '1px solid var(--border)', borderRadius: 5, marginTop: 17, padding: '20px 17px 16px' }}>
      <div style={{ fontSize: 15, fontWeight: 700 }}>Invitaciones pendientes</div><div style={{ fontSize: 13.3, color: 'var(--soft)', marginTop: 6 }}>Reenvía o cancela invitaciones que aún no fueron aceptadas</div>
      {inv.length === 0 ? <div style={{ border: '1px dashed var(--border)', borderRadius: 5, height: 104, marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9, color: '#94a3b8' }}><Mail size={27} strokeWidth={1.8} /><span style={{ fontSize: 13.3 }}>No hay invitaciones pendientes</span></div>
        : <div style={{ marginTop: 12 }}>{inv.map(i => <div key={i.id} className="bl-info" style={{ height: 46 }}><Mail size={15} style={{ marginRight: 10 }} />{i.email}<span style={{ marginLeft: 10 }} className="tm-badge" title={ROLES[i.role][0]}>{ROLES[i.role][0]}</span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}><button className="lb2 g sm" style={{ height: 30, minWidth: 0 }} onClick={() => toast('Invitación reenviada a ' + i.email)}><RotateCcw size={14} />Reenviar</button><button className="lb2 g sm" style={{ height: 30, minWidth: 0, color: '#ef4444' }} onClick={() => setInv(x => x.filter(y => y.id !== i.id))}><X size={14} />Cancelar</button></span></div>)}</div>}
    </div>
    <InviteMemberModal open={mod?.t === 'invite'} onClose={() => setMod(null)} />
    {mod?.t === 'perm' && <PermModal m={mod.m} onClose={() => setMod(null)} />}
    {mod?.t === 'edit' && <LModal open onClose={() => setMod(null)} title="Editar perfil" desc={mod.m.email} icon={<Pencil size={18} />} bodyStyle={{ overflow: 'visible' }}
      footer={<><button className="lb2 g" onClick={() => setMod(null)}>Cancelar</button><button className="lb2 p" disabled={!mod.m.name.trim()} onClick={() => { setMembers(x => x.map(y => y.id === mod.m.id ? mod.m : y)); setMod(null); toast('Perfil actualizado') }}>Guardar</button></>}>
      <label className="tm-lb">Nombre</label><input className="l-in ct-in" value={mod.m.name} onChange={e => setMod({ ...mod, m: { ...mod.m, name: e.target.value } })} />
      <label className="tm-lb" style={{ marginTop: 16 }}>Función</label><LSelect className="l-in ct-in" bold disabled={mod.m.role === 'owner'} value={mod.m.role} onChange={v => setMod({ ...mod, m: { ...mod.m, role: v } })} options={Object.entries(ROLES).filter(([k]) => k !== 'owner' || mod.m.role === 'owner').map(([value, [label]]) => ({ value, label }))} />
      <label className="tm-lb" style={{ marginTop: 16 }}>Departamento</label><LSelect className="l-in ct-in" bold value={mod.m.dep || ''} onChange={v => setMod({ ...mod, m: { ...mod.m, dep: v } })} options={[{ value: '', label: 'Sin departamento' }, ...deps.map(d => ({ value: d.id, label: d.name }))]} />
    </LModal>}
  </div>
}
function PermModal({ m, onClose }) {
  const toast = useToast(); const [perms, setPerms] = useStore('team_perms', {}); const [p, setP] = useState(perms[m.id] || Object.fromEntries(PERMS.map(x => [x, true])))
  const owner = m.role === 'owner'
  return <LModal open onClose={onClose} title="Permissões" desc={owner ? 'El propietario tiene acceso total a la cuenta.' : `Módulos que ${m.name} puede ver`} icon={<KeyRound size={18} />}
    footer={<><button className="lb2 g" onClick={onClose}>Cancelar</button>{!owner && <button className="lb2 p" onClick={() => { setPerms({ ...perms, [m.id]: p }); onClose(); toast('Permisos guardados') }}>Guardar</button>}</>}>
    {PERMS.map(x => <div key={x} style={{ display: 'flex', alignItems: 'center', height: 38, borderBottom: '1px solid var(--border)', fontSize: 13.3 }}>{x}<span style={{ marginLeft: 'auto', opacity: owner ? .5 : 1, pointerEvents: owner ? 'none' : 'auto' }}><Toggle on={owner || p[x] !== false} onChange={v => setP({ ...p, [x]: v })} /></span></div>)}
  </LModal>
}

/* ---------------- Invitaciones a la plataforma ---------------- */
export function Invites() {
  const toast = useToast(); const [list, setList] = useStore('platform_invites', [])
  const [q, setQ] = useState(''); const [st, setSt] = useState('all'); const [open, setOpen] = useState(false); const [e, setE] = useState('')
  const cnt = k => list.filter(x => x.status === k).length
  const C = [['Total', list.length, '#8b5cf6', Users], ['Pendientes', cnt('pendiente'), '#f59e0b', Clock], ['Aceptadas', cnt('aceptada'), '#22c55e', CircleCheck], ['Rechazadas', cnt('rechazada'), '#ef4444', CircleX], ['Vencidas', cnt('vencida'), '#94a3b8', CircleAlert]]
  const rows = list.filter(x => (st === 'all' || x.status === st) && (x.email + ' Pablo Monja Suclupe').toLowerCase().includes(q.toLowerCase()))
  const SC = { pendiente: '#f59e0b', aceptada: '#22c55e', rechazada: '#ef4444', vencida: '#94a3b8' }
  return <div className="st-card" style={{ marginTop: 0, padding: '23px 23px 23px' }}>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="lp-btn p" onClick={() => setOpen(true)}><Plus size={16} />Invitar a la plataforma</button></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 11, marginTop: 16 }}>{C.map(([l, v, c, Ic]) => <div key={l} className="iv-st" style={{ borderColor: c === '#94a3b8' ? 'var(--border)' : c + '99' }}><i style={{ background: c + '26', color: c }}><Ic size={16} /></i><div><b style={{ color: c === '#94a3b8' ? 'var(--text)' : c }}>{v}</b><span>{l}</span></div></div>)}</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 17 }}>
      <div><label className="tm-lb">Buscar</label><div className="lp-srch"><Search size={15} /><input value={q} onChange={x => setQ(x.target.value)} placeholder="Buscar por correo, nombre del invitador o cuenta" style={{ fontWeight: 500 }} /></div></div>
      <div><label className="tm-lb">Filtrar por estado:</label><LSelect className="l-in ct-in" bold value={st} onChange={setSt} options={[['all', 'Todas'], ['pendiente', 'Pendientes'], ['aceptada', 'Aceptadas'], ['rechazada', 'Rechazadas'], ['vencida', 'Vencidas']].map(([value, label]) => ({ value, label }))} /></div>
    </div>
    <div style={{ marginTop: 16 }}>{rows.length === 0 ? <Empty ic={UserPlus} t={list.length ? 'Ninguna invitación coincide' : 'No hay invitaciones a la plataforma enviadas'} h={207}>{!list.length && <button className="lp-btn p" style={{ marginTop: 18 }} onClick={() => setOpen(true)}><Plus size={16} />Invitar a la primera persona</button>}</Empty>
      : <div style={{ border: '1px solid var(--border)', borderRadius: 5 }}>{rows.map(x => <div key={x.id} className="bl-info" style={{ height: 50, padding: '0 15px' }}><Mail size={15} style={{ marginRight: 10 }} />{x.email}<span style={{ marginLeft: 12, fontSize: 12, color: '#94a3b8' }}>{x.date}</span>
        <span className="tm-badge" style={{ marginLeft: 'auto', color: SC[x.status], borderColor: SC[x.status] + '66', background: SC[x.status] + '1f', textTransform: 'capitalize' }}>{x.status}</span>
        {x.status === 'pendiente' && <><button className="ch-ib" style={{ marginLeft: 8 }} title="Reenviar" onClick={() => toast('Invitación reenviada')}><RotateCcw size={14} /></button><button className="ch-ib" title="Cancelar" onClick={() => setList(l => l.filter(y => y.id !== x.id))}><X size={15} color="#ef4444" /></button></>}</div>)}</div>}</div>
    <LModal open={open} onClose={() => setOpen(false)} title="Invitar a la plataforma" desc="Invite personas a la plataforma Leona." width={436} bodyStyle={{ padding: '20px 20px 0' }}>
      <label className="tm-lb">Correo del invitado <span style={{ color: '#ef4444' }}>*</span></label><EmailIn v={e} set={setE} />
      <Info>Si el correo está registrado en el sistema, se enviará la invitación.</Info>
      <div style={{ borderTop: '1px solid var(--border2)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 11 }}>
        <button className="lb2 g" onClick={() => setOpen(false)}>Cancelar</button>
        <button className="lb2 p" style={{ background: '#9b6cf8' }} disabled={!okMail(e)} onClick={() => { setList(l => [{ id: uid(), email: e.trim(), status: 'pendiente', date: new Date().toLocaleDateString('es-PE') }, ...l]); toast('Invitación enviada'); setE(''); setOpen(false) }}>Enviar invitación</button></div>
    </LModal>
  </div>
}

/* ---------------- Vacíos simples ---------------- */
export const SupportAccess = () => <div className="st-card" style={{ marginTop: 0, padding: 23 }}><Empty ic={Headphones} t="Ningún soporte con acceso activo." d="Equipo de soporte con acceso temporal aprobado en esta cuenta." /></div>
export const Translations = () => <div className="st-card" style={{ marginTop: 0, padding: 23 }}><Empty ic={Languages} t="No hay traducciones en esta cuenta." d="Cuando traduzcas un flujo, aquí aparecen reservado, usado y devuelto." /></div>
export const AiUsage = () => <div className="st-card" style={{ marginTop: 0, padding: 23 }}><Empty ic={Sparkles} t="No hay cargos de Leona AI en esta cuenta." d="Las conversaciones de Leona aparecen aquí agrupadas por sesión, con el total usado." /></div>

export function StdFlows() {
  const toast = useToast(); const [conns] = useStore('connections', []); const [flows] = useStore('flows', []); const [cfg, setCfg] = useStore('std_flows', {})
  if (!conns.length) return <div style={{ marginTop: 40, border: '1px solid var(--border)', borderRadius: 6 }}><Empty ic={Plug} t="No se encontraron conexiones" d="Cree primero una conexión de WhatsApp para configurar los flujos estándar." h={177} /></div>
  const EV = [['first', 'Primer mensaje de un contacto nuevo'], ['off', 'Mensaje fuera del horario de atención'], ['any', 'Cualquier mensaje sin flujo activo']]
  const opts = [{ value: '', label: 'Ninguno' }, ...flows.map(f => ({ value: f.id, label: f.name }))]
  return <div style={{ marginTop: 0 }}>{conns.map(c => <div key={c.id} className="st-card" style={{ marginTop: 0, marginBottom: 16, overflow: 'visible' }}><h3><Plug size={16} />{c.name}</h3><div className="sd">{c.phone}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13, marginTop: 15 }}>{EV.map(([k, l]) => <div key={k}><label className="tm-lb" style={{ fontSize: 12.5 }}>{l}</label>
      <LSelect className="l-in ct-in" value={cfg[c.id]?.[k] || ''} onChange={v => { setCfg({ ...cfg, [c.id]: { ...cfg[c.id], [k]: v } }); toast('Flujo estándar guardado') }} options={opts} /></div>)}</div></div>)}</div>
}

/* ---------------- Respuestas rápidas ---------------- */
const TYPES = { text: ['Texto', MessageCircle], image: ['Imagen', Image, 5 * 1024 * 1024, 'image/*', true], video: ['Video', Video, 16 * 1024 * 1024, 'video/*', true], audio: ['Audio', Mic, 16 * 1024 * 1024, 'audio/*'], document: ['Documento', FileText, 100 * 1024 * 1024, '*', true], sticker: ['Sticker', Sticker, 100 * 1024, 'image/webp,image/png'] }
const lim = b => b >= 1048576 ? (b / 1048576) + ' MB' : (b / 1024) + ' KB'
const EMOJI = '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠 👍 👎 👏 🙌 🙏 🤝 💪 👋 ✌️ 🤞 👌 👉 👈 ❤️ 🧡 💛 💚 💙 💜 🖤 💯 🔥 ⭐ ✨ 🎉 🎁 ✅ ❌ ⚠️ 📌 📢 💰 💳 🛒 📦 🚀 ⏰ 📅 📞 💬'.split(' ')
const SYSVARS = [['full_name', 'Nombre completo'], ['first_name', 'Primer nombre'], ['created_at', 'Fecha de creación del contacto (dd/MM/aaaa HH:mm:ss)'], ['phone_number', 'Teléfono'], ['attendant_name', 'Nombre del agente activo'], ['user_email', 'Correo de inicio de sesión del titular de la cuenta (owner). Solo lectura; use {user_email} en textos'], ['instance_number', 'Número de instancia'], ['instance_name', 'Nombre de la instancia (conexión)'], ['hora', 'Hora (HH:mm)'], ['data', 'Fecha (dd/MM)'], ['dia', 'Día de la semana'], ['saudacao', 'Saludo (buenos días/tardes/noches)'], ['greeting', 'Saludo en inglés (Good morning/afternoon/evening)'], ['saludo', 'Saludo en español (Buenos días/tardes/noches)']]

function Editor({ value, onChange, ph = 'Escriba la leyenda...' }) {
  const ta = useRef(); const [pop, setPop] = useState(null); const [vq, setVq] = useState(''); const box = useRef(); useOutside(box, () => setPop(null))
  const [gv] = useStore('set_vars', [])
  const ins = (a, b = '') => { const el = ta.current; const s = el.selectionStart, e = el.selectionEnd; const v = value.slice(0, s) + a + value.slice(s, e) + b + value.slice(e); onChange(v); requestAnimationFrame(() => { el.focus(); el.selectionStart = s + a.length; el.selectionEnd = e + a.length }) }
  const vars = [...SYSVARS, ...gv.filter(x => x.key).map(x => ['g_' + x.key, 'Variable global'])].filter(([k, d]) => (k + d).toLowerCase().includes(vq.toLowerCase()))
  return <div className="qr-ed" ref={box}>
    <textarea ref={ta} value={value} onChange={e => onChange(e.target.value)} placeholder={ph} />
    <div className="qr-tb">
      <button title="Negrita" onClick={() => ins('*', '*')}><Bold size={15} /></button><button title="Cursiva" onClick={() => ins('_', '_')}><Italic size={15} /></button><button title="Tachado" onClick={() => ins('~', '~')}><Strikethrough size={15} /></button>
      <button title="Emoji" className={pop === 'emo' ? 'on' : ''} onClick={() => setPop(pop === 'emo' ? null : 'emo')}><Smile size={15} /></button>
      <button title="Variables" className={pop === 'var' ? 'on' : ''} onClick={() => { setVq(''); setPop(pop === 'var' ? null : 'var') }}><Code size={15} /></button>
    </div>
    {pop === 'emo' && <div className="qr-pop qr-emo">{EMOJI.map(e => <button key={e} onClick={() => ins(e)}>{e}</button>)}</div>}
    {pop === 'var' && <div className="qr-pop qr-var" style={{ left: 'auto', right: 0 }}>
      <div style={{ padding: 9 }}><div className="l-ico"><Search size={14} /><input className="l-in" autoFocus style={{ height: 34, borderColor: 'var(--p)' }} placeholder="Buscar variable..." value={vq} onChange={e => setVq(e.target.value)} /></div></div>
      <div style={{ overflowY: 'auto', padding: '0 5px 6px', borderTop: '1px solid var(--border)' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', padding: '9px 12px 4px' }}>Variables del sistema</div>
        {vars.map(([k, d]) => <button key={k} className="it" onClick={() => { ins(`{${k}}`); setPop(null) }}><code>{`{${k}}`}</code>{d}</button>)}</div></div>}
  </div>
}

function QRModal({ init, onClose, onSave }) {
  const toast = useToast()
  const [short, setShort] = useState(init?.short || ''); const [acts, setActs] = useState(init?.actions || [])
  const valid = /^[a-z0-9 _-]+$/.test(short.trim()) && acts.length > 0 && acts.every(a => a.type === 'text' ? a.text.trim() : a.file)
  const set = (i, p) => setActs(a => a.map((x, j) => j === i ? { ...x, ...p } : x))
  const mv = (i, d) => setActs(a => { const b = [...a]; [b[i], b[i + d]] = [b[i + d], b[i]]; return b })
  const pick = (i, t) => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = TYPES[t][3]; inp.onchange = () => { const f = inp.files[0]; if (!f) return; if (f.size > TYPES[t][2]) return toast(`El archivo supera ${lim(TYPES[t][2])}`, 'err'); set(i, { file: { name: f.name, size: f.size } }) }; inp.click() }
  return <LModal open onClose={onClose} title={init ? 'Editar respuesta rápida' : 'Nueva respuesta rápida'} desc="Configure el atajo y las acciones enviadas al disparar" width={649} bodyStyle={{ padding: '20px 20px 0' }}>
    <label className="tm-lb">Atajo</label>
    <div className="pf-in"><Hash size={15} /><input style={{ background: 'var(--in2)', fontWeight: 500 }} autoFocus value={short} onChange={e => setShort(e.target.value.toLowerCase())} placeholder="ej.: saludo" /></div>
    <div style={{ fontSize: 11.5, color: short && !/^[a-z0-9 _-]+$/.test(short) ? '#ef4444' : '#94a3b8', marginTop: 6 }}>Use solo minúsculas, números, guiones, guiones bajos y espacios</div>
    <label className="tm-lb" style={{ marginTop: 17 }}>Agregar acción</label>
    <div className="qr-acts">{Object.entries(TYPES).map(([k, [l, Ic]]) => <button key={k} className="qr-act" onClick={() => setActs(a => [...a, { id: uid(), type: k, text: '', file: null }])}><Ic size={17} />{l}</button>)}</div>
    {acts.length === 0 ? <div style={{ border: '1px dashed var(--border)', borderRadius: 5, height: 51, marginTop: 16, display: 'grid', placeItems: 'center', fontSize: 13.3, color: '#94a3b8' }}>Ninguna acción agregada. Use los botones de arriba para comenzar.</div>
      : acts.map((a, i) => { const [l, Ic, mx, , cap] = TYPES[a.type]; return <div key={a.id} className="qr-blk">
        <div className="qr-bh"><Ic size={17} className="t" />{l}<span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}><button disabled={!i} onClick={() => mv(i, -1)}><ChevronUp size={16} /></button><button disabled={i === acts.length - 1} onClick={() => mv(i, 1)}><ChevronDown size={16} /></button><button onClick={() => setActs(x => x.filter((_, j) => j !== i))}><Trash2 size={16} color="#ef4444" /></button></span></div>
        {a.type === 'text' ? <><div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 10 }}>Use el botón de variables en la barra inferior (igual que en flujos), ej.: {'{full_name}'}, {'{g_su_variable}'}</div><Editor value={a.text} onChange={v => set(i, { text: v })} /></>
          : <><div className="qr-drop" onClick={() => pick(i, a.type)}><Upload size={24} color="#a78bfa" />{a.file ? <><b>{a.file.name}</b><span>{(a.file.size / 1024).toFixed(0)} KB · clic para cambiar</span></> : <><b>Elegir archivo</b><span>Máximo {lim(mx)}</span></>}</div>
            {cap && <><label className="tm-lb" style={{ marginTop: 15 }}>Leyenda (opcional)</label><Editor value={a.text} onChange={v => set(i, { text: v })} /></>}</>}
      </div> })}
    <div style={{ borderTop: '1px solid var(--border2)', marginTop: 20, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 11, position: 'sticky', bottom: 0, background: 'var(--deep)' }}>
      <button className="lb2 g" onClick={onClose}>Cancelar</button><button className="lb2 p" disabled={!valid} onClick={() => onSave({ id: init?.id || uid(), short: short.trim(), actions: acts })}><Save size={15} />{init ? 'Guardar respuesta' : 'Crear respuesta'}</button></div>
  </LModal>
}

export function QuickReplies() {
  const toast = useToast(); const [list, setList] = useStore('quick_replies', [])
  const [q, setQ] = useState(''); const [t, setT] = useState('all'); const [mod, setMod] = useState(null)
  const rows = list.filter(r => (t === 'all' || r.actions.some(a => a.type === t)) && (r.short + ' ' + r.actions.map(a => a.text).join(' ')).toLowerCase().includes(q.toLowerCase()))
  const ICO = { all: LayoutGrid, ...Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [k, v[1]])) }
  return <div className="st-card" style={{ marginTop: 0, padding: '23px 23px 26px', overflow: 'visible' }}>
    <button className="lp-btn p" onClick={() => setMod({})}><Plus size={16} />Nueva respuesta</button>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 210px', gap: 17, marginTop: 16 }}>
      <div><label className="tm-lb">Buscar</label><div className="lp-srch"><Search size={15} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por atajo o contenido..." style={{ fontWeight: 500 }} /></div></div>
      <div><label className="tm-lb">Tipo</label><LSelect className="l-in ct-in" bold value={t} onChange={setT} options={[{ value: 'all', label: 'Todos los tipos' }, ...Object.entries(TYPES).map(([value, [label]]) => ({ value, label }))]} renderOpt={o => { const I = ICO[o.value]; return <><I size={15} />{o.label}</> }} /></div>
    </div>
    <div style={{ marginTop: 16 }}>{rows.length === 0 ? <div className="sa-empty" style={{ height: 218 }}><MessageCircle size={38} strokeWidth={1.9} className="big" /><h3 style={{ fontSize: 13.3 }}>{list.length ? 'Ninguna respuesta coincide' : 'No hay respuestas rápidas'}</h3><p>Cree su primera respuesta rápida para usar en WhatsApp</p>
      {!list.length && <button className="lp-btn p" style={{ marginTop: 15 }} onClick={() => setMod({})}><Plus size={16} />Crear primera respuesta</button>}</div>
      : <div style={{ border: '1px solid var(--border)', borderRadius: 5 }}>{rows.map(r => <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 15px', borderBottom: '1px solid var(--border)' }}>
        <b style={{ fontSize: 13.3, color: '#a78bfa', minWidth: 120 }}>#{r.short}</b>
        <span style={{ display: 'flex', gap: 5, color: '#94a3b8' }}>{r.actions.map(a => { const I = TYPES[a.type][1]; return <I key={a.id} size={15} /> })}</span>
        <span style={{ fontSize: 12.5, color: 'var(--soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{r.actions.find(a => a.text)?.text || r.actions.find(a => a.file)?.file.name}</span>
        <button className="ch-ib" onClick={() => setMod(r)}><Pencil size={14} /></button><button className="ch-ib" onClick={() => { setList(l => l.filter(x => x.id !== r.id)); toast('Respuesta eliminada') }}><Trash2 size={14} color="#ef4444" /></button></div>)}</div>}</div>
    {mod && <QRModal init={mod.id ? mod : null} onClose={() => setMod(null)} onSave={r => { setList(l => l.some(x => x.id === r.id) ? l.map(x => x.id === r.id ? r : x) : [...l, r]); setMod(null); toast(mod.id ? 'Respuesta actualizada' : 'Respuesta creada') }} />}
  </div>
}
