import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, Users, UserPlus, LifeBuoy, Languages, Sparkles, Workflow, Send, Zap, FileText, Braces, ListPlus, Tags, Puzzle, Activity, Package, Server, ChevronLeft, Plus, Save, LogOut, Trash2, Pencil, Clock, Copy, Store, Building, CalendarClock, Bell } from 'lucide-react'
import { useStore, Modal, Empty, useToast, uid, Switch, Confirm } from '../ui'

const NAV = [['CUENTA', [['accounts', 'Empresa', Building2], ['team', 'Equipo', Users], ['invites', 'Invitaciones a la plataforma', UserPlus], ['support', 'Acceso de soporte', LifeBuoy], ['translations', 'Traducciones de flujo', Languages], ['ai', 'Uso de Aria AI', Sparkles]]],
['AUTOMATIZACIÓN', [['stdflows', 'Flujos estándar', Workflow], ['mass', 'Envíos masivos', Send], ['quick', 'Respuestas rápidas', Zap], ['templates', 'Templates de WhatsApp', FileText], ['vars', 'Variables globales', Braces], ['fields', 'Campos personalizados', ListPlus], ['tags', 'Etiquetas', Tags]]],
['INTEGRACIONES', [['integrations', 'Integraciones', Puzzle], ['tracking', 'Seguimiento', Activity], ['products', 'Productos', Package], ['mcp', 'Herramientas MCP', Server]]]]

const CRUD = {
  quick: ['Respuestas rápidas', 'Atajos para responder más rápido en el chat', [['short', 'Atajo', '/precio'], ['text', 'Mensaje', 'El precio es…', 'area']]],
  templates: ['Templates de WhatsApp', 'Plantillas aprobadas por Meta para iniciar conversaciones', [['name', 'Nombre', 'bienvenida_1'], ['cat', 'Categoría', 'MARKETING'], ['text', 'Contenido', 'Hola {{1}}, …', 'area']]],
  vars: ['Variables globales', 'Valores reutilizables en todos tus flujos', [['key', 'Clave', 'link_pago'], ['text', 'Valor', 'https://…']]],
  fields: ['Campos personalizados', 'Datos extra que guardas en cada contacto', [['name', 'Nombre del campo', 'fecha_compra'], ['type', 'Tipo', 'Texto']]],
  tags: ['Etiquetas', 'Organiza a tus contactos por etiquetas', [['name', 'Etiqueta', 'Comprador'], ['color', 'Color', '#8b5cf6', 'color']]],
  products: ['Productos', 'Catálogo usado en ventas, pagos y el dashboard', [['name', 'Producto', 'Ebook Recetas'], ['price', 'Precio (PEN)', '29.90']]],
  departments: ['Departamentos', 'Áreas a las que se pueden transferir los chats', [['name', 'Departamento', 'Ventas'], ['text', 'Descripción', 'Equipo comercial']]],
  team: ['Equipo', 'Usuarios con acceso a esta empresa', [['name', 'Nombre', 'Ana'], ['email', 'Correo', 'ana@correo.com'], ['role', 'Rol', 'Agente']]],
  invites: ['Invitaciones a la plataforma', 'Invita a otras personas a crear su cuenta', [['email', 'Correo', 'amigo@correo.com']]],
}

function Crud({ k }) {
  const toast = useToast(); const [title, sub, fields] = CRUD[k]
  const [items, setItems] = useStore('set_' + k, k === 'team' ? [{ id: 'me', name: 'Pablo Monja Suclupe', email: 'k4el.ux@gmail.com', role: 'Propietario' }] : [])
  const [form, setForm] = useState(null); const [del, setDel] = useState(null)
  const save = () => { if (!form[fields[0][0]]) return toast('Completa el primer campo', 'err'); setItems(i => form.id ? i.map(x => x.id === form.id ? form : x) : [...i, { ...form, id: uid() }]); setForm(null); toast('Guardado') }
  return <div className="card" style={{ padding: 18 }}><div className="row" style={{ marginBottom: 14 }}><div><b style={{ fontSize: 14 }}>{title}</b><div className="small muted">{sub}</div></div><span className="sp" /><button className="btn btn-p" onClick={() => setForm(Object.fromEntries(fields.map(f => [f[0], f[3] === 'color' ? '#8b5cf6' : ''])))}><Plus size={14} />{k === 'invites' ? 'Invitar' : 'Agregar'}</button></div>
    {items.length ? <div className="tbl-wrap"><table className="tbl"><thead><tr>{fields.map(f => <th key={f[0]}>{f[1]}</th>)}<th /></tr></thead><tbody>{items.map(it => <tr key={it.id}>{fields.map(f => <td key={f[0]} style={{ whiteSpace: 'normal', maxWidth: 320 }}>{f[3] === 'color' ? <span className="badge" style={{ background: it[f[0]] + '22', color: it[f[0]], border: '1px solid ' + it[f[0]] + '55' }}>{it.name}</span> : it[f[0]]}</td>)}
      <td style={{ width: 80 }}>{it.id !== 'me' && <div className="row" style={{ gap: 2 }}><button className="icon-btn" onClick={() => setForm(it)}><Pencil size={13} /></button><button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => setDel(it.id)}><Trash2 size={13} /></button></div>}</td></tr>)}</tbody></table></div>
      : <div style={{ border: '1px dashed var(--border)', borderRadius: 8 }}><Empty icon={<Plus size={24} />} title={'Sin ' + title.toLowerCase()} text="Agrega el primero con el botón de arriba." /></div>}
    <Modal open={!!form} onClose={() => setForm(null)} title={(form?.id ? 'Editar · ' : 'Nuevo · ') + title} footer={<><button className="btn btn-g" onClick={() => setForm(null)}>Cancelar</button><button className="btn btn-p" onClick={save}>Guardar</button></>}>
      {form && fields.map(([fk, l, ph, t]) => <div className="field" key={fk}><label className="lb">{l}</label>{t === 'area' ? <textarea className="input" value={form[fk]} placeholder={ph} onChange={e => setForm({ ...form, [fk]: e.target.value })} /> : t === 'color' ? <input type="color" value={form[fk]} onChange={e => setForm({ ...form, [fk]: e.target.value })} style={{ width: 60, height: 34, border: 'none', background: 'none' }} /> : <input className="input" value={form[fk]} placeholder={ph} onChange={e => setForm({ ...form, [fk]: e.target.value })} />}</div>)}</Modal>
    <Confirm open={!!del} onClose={() => setDel(null)} onOk={() => setItems(i => i.filter(x => x.id !== del))} />
  </div>
}

function Company() {
  const toast = useToast(); const [tab, setTab] = useState('data')
  const [co, setCo] = useStore('companyData', { name: 'Empresa Pablo Monja Suclupe', desc: 'Empresa creada automáticamente', slug: 'empresa-pablo-monja-suclupe', tz: 'Lima (America/Lima)', notif: true })
  const [hours, setHours] = useStore('hours', ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d, i) => ({ d, on: i < 6, from: '09:00', to: '18:00' })))
  const [leave, setLeave] = useState(false); const [newAcc, setNewAcc] = useState(false)
  return <>
    <div className="row" style={{ marginBottom: 14 }}>{[['data', 'Datos corporativos', Store], ['deps', 'Departamentos', Building], ['hours', 'Horarios de trabajo', CalendarClock]].map(([k, l, Ic]) => <button key={k} className={'chip' + (tab === k ? ' on' : '')} style={{ padding: '7px 12px' }} onClick={() => setTab(k)}><Ic size={13} />{l}</button>)}<span className="sp" /><button className="btn btn-p" onClick={() => setNewAcc(true)}><Plus size={14} />Nueva cuenta</button></div>
    {tab === 'data' && <div className="card" style={{ padding: 18, animation: 'pop .3s' }}><div className="row"><div><div className="row"><b style={{ fontSize: 14 }}>Datos de la empresa</b><span className="badge b-green">Activa</span></div><div className="small muted">Información mostrada a sus clientes y en informes</div></div><span className="sp" /><Bell size={15} color="#ef4444" /></div>
      <div className="grid g2" style={{ marginTop: 18 }}>
        <div className="field"><label className="lb">Nombre de la empresa <span style={{ color: '#ef4444' }}>*</span></label><input className="input" value={co.name} onChange={e => setCo({ ...co, name: e.target.value })} /></div>
        <div className="field"><label className="lb">Descripción</label><input className="input" value={co.desc} onChange={e => setCo({ ...co, desc: e.target.value })} /></div>
        <div className="field"><label className="lb">Slug</label><input className="input" style={{ fontFamily: 'monospace' }} value={co.slug} onChange={e => setCo({ ...co, slug: e.target.value })} /></div>
        <div className="field"><label className="lb">Zona horaria</label><select className="input" value={co.tz} onChange={e => setCo({ ...co, tz: e.target.value })}>{['Lima (America/Lima)', 'Ciudad de México (America/Mexico_City)', 'Bogotá (America/Bogota)', 'Brasilia (America/Sao_Paulo)', 'Madrid (Europe/Madrid)'].map(z => <option key={z}>{z}</option>)}</select><div className="small muted" style={{ marginTop: 5 }}>Define la zona horaria usada en el panel, filtros, condiciones de flujo, intervalo inteligente, horario comercial y variables de fecha/hora.</div></div></div>
      <div className="row" style={{ marginTop: 6 }}><div><b>Notificaciones por correo de instancias</b><div className="small muted">Envía un correo al propietario cuando una instancia se desconecta o queda restringida (API Oficial). Disponible con más de 4 instancias; activo por defecto.</div></div><span className="sp" /><Switch on={co.notif} onChange={v => setCo({ ...co, notif: v })} /></div>
      <div className="row" style={{ justifyContent: 'flex-end', margin: '18px 0' }}><button className="btn btn-p" onClick={() => toast('Empresa guardada')}><Save size={14} />Guardar empresa</button></div>
      <div className="row" style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}><div><b>Miembros del equipo</b><div className="small muted">Invite o cree usuarios para la empresa actual.</div></div><span className="sp" /><button className="btn btn-p" onClick={() => setNewAcc('member')}><Plus size={14} />Invitar miembro</button></div>
      <button className="btn" style={{ color: '#ef4444', border: '1px solid #ef444444', marginTop: 12 }} onClick={() => setLeave(true)}><LogOut size={14} />Salir de la empresa</button></div>}
    {tab === 'deps' && <Crud k="departments" />}
    {tab === 'hours' && <div className="card" style={{ padding: 18, animation: 'pop .3s' }}><b style={{ fontSize: 14 }}>Horarios de trabajo</b><div className="small muted" style={{ marginBottom: 14 }}>Fuera de este horario, los flujos pueden usar un mensaje de ausencia.</div>
      {hours.map((h, i) => <div key={h.d} className="row" style={{ padding: '9px 0', borderBottom: '1px solid var(--border)' }}><Switch on={h.on} onChange={v => setHours(x => x.map((y, j) => j === i ? { ...y, on: v } : y))} /><b style={{ width: 100 }}>{h.d}</b>
        {h.on ? <><Clock size={13} className="muted" /><input type="time" className="input" style={{ width: 120 }} value={h.from} onChange={e => setHours(x => x.map((y, j) => j === i ? { ...y, from: e.target.value } : y))} /><span className="muted">a</span><input type="time" className="input" style={{ width: 120 }} value={h.to} onChange={e => setHours(x => x.map((y, j) => j === i ? { ...y, to: e.target.value } : y))} /></> : <span className="muted small">Cerrado</span>}</div>)}
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}><button className="btn btn-p" onClick={() => toast('Horarios guardados')}><Save size={14} />Guardar</button></div></div>}
    <Confirm open={leave} onClose={() => setLeave(false)} onOk={() => toast('No puedes salir: eres el propietario', 'err')} title="Salir de la empresa" text="Perderás el acceso a todos los datos de esta empresa." ok="Salir" />
    <Modal open={!!newAcc} onClose={() => setNewAcc(false)} title={newAcc === 'member' ? 'Invitar miembro' : 'Nueva cuenta'} icon={<UserPlus size={18} />} footer={<><button className="btn btn-g" onClick={() => setNewAcc(false)}>Cancelar</button><button className="btn btn-p" onClick={() => { setNewAcc(false); toast(newAcc === 'member' ? 'Invitación enviada' : 'Cuenta creada') }}>{newAcc === 'member' ? 'Enviar invitación' : 'Crear'}</button></>}>
      <div className="field"><label className="lb">{newAcc === 'member' ? 'Correo' : 'Nombre de la cuenta'}</label><input className="input" autoFocus /></div></Modal>
  </>
}

function Simple({ k }) {
  const toast = useToast(); const [flows] = useStore('flows', [])
  const [cfg, setCfg] = useStore('cfg_' + k, {})
  const set = (a, b) => setCfg({ ...cfg, [a]: b })
  const C = ({ title, sub, children }) => <div className="card" style={{ padding: 18, animation: 'pop .3s' }}><b style={{ fontSize: 14 }}>{title}</b><div className="small muted" style={{ marginBottom: 16 }}>{sub}</div>{children}</div>
  const Row = ({ t, d, a }) => <div className="row" style={{ padding: '11px 0', borderBottom: '1px solid var(--border)' }}><div><b>{t}</b>{d && <div className="small muted">{d}</div>}</div><span className="sp" /><Switch on={!!cfg[a]} onChange={v => { set(a, v); toast('Preferencia guardada') }} /></div>
  if (k === 'support') return <C title="Acceso de soporte" sub="Permite que el equipo de soporte vea tu cuenta para ayudarte"><Row t="Permitir acceso temporal" d="El acceso expira automáticamente en 48 horas" a="on" /></C>
  if (k === 'translations') return <C title="Traducciones de flujo" sub="Traduce automáticamente los mensajes según el idioma del contacto"><Row t="Traducción automática" d="Detecta el idioma del cliente" a="auto" /><div className="field" style={{ marginTop: 14 }}><label className="lb">Idioma base</label><select className="input" value={cfg.lang || 'Español'} onChange={e => set('lang', e.target.value)}>{['Español', 'Portugués', 'Inglés'].map(l => <option key={l}>{l}</option>)}</select></div></C>
  if (k === 'ai') return <C title="Uso de Aria AI" sub="Consumo de tokens de los bloques de IA y agentes en este ciclo">{[['Bloques de IA', 0], ['Agentes de IA', 0], ['Generación de flujos', 0]].map(([l, v]) => <div key={l} style={{ marginBottom: 14 }}><div className="row small"><b>{l}</b><span className="sp" />{v} tokens</div><div className="progress" style={{ marginTop: 6 }}><div style={{ width: '2%' }} /></div></div>)}</C>
  if (k === 'stdflows') return <C title="Flujos estándar" sub="Flujos que se disparan automáticamente ante eventos">{['Primer mensaje de un contacto nuevo', 'Fuera del horario de trabajo', 'Venta aprobada', 'Pago pendiente'].map(ev => <div key={ev} className="field"><label className="lb">{ev}</label><select className="input" value={cfg[ev] || ''} onChange={e => { set(ev, e.target.value); toast('Flujo asignado') }}><option value="">Ninguno</option>{flows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>)}</C>
  if (k === 'mass') return <C title="Envíos masivos" sub="Protege tu número con límites de envío"><Row t="Intervalo aleatorio entre mensajes" d="Simula comportamiento humano" a="rand" /><Row t="Pausar fuera del horario de trabajo" a="hours" /><div className="field" style={{ marginTop: 14 }}><label className="lb">Máximo de envíos por hora: {cfg.max || 200}</label><input type="range" min="50" max="1000" step="50" value={cfg.max || 200} onChange={e => set('max', e.target.value)} style={{ width: '100%', accentColor: '#8b5cf6' }} /></div></C>
  if (k === 'integrations') return <C title="Integraciones" sub="Conecta AriaBot con tus plataformas de venta"><div className="grid g3">{['Hotmart', 'Kiwify', 'Shopify', 'Mercado Pago', 'Stripe', 'Google Sheets', 'OpenAI', 'Gemini', 'Zapier'].map(n => <div key={n} className="card lift row" style={{ padding: 12, background: 'var(--card2)' }}><div className="kpi-ic" style={{ background: 'var(--psoft)', color: 'var(--p)', width: 32, height: 32, fontWeight: 800 }}>{n[0]}</div><b>{n}</b><span className="sp" /><Switch on={!!cfg[n]} onChange={v => { set(n, v); toast(v ? n + ' conectado' : n + ' desconectado', v ? 'ok' : 'info') }} /></div>)}</div></C>
  if (k === 'tracking') return <C title="Seguimiento" sub="Atribución de ventas por UTM y origen"><Row t="Capturar UTMs del enlace de WhatsApp" a="utm" /><Row t="Enviar eventos de compra al Pixel" a="pixel" /><Row t="Registrar origen del anuncio (CTWA)" a="ctwa" /></C>
  if (k === 'mcp') return <C title="Herramientas MCP" sub="Conecta tu cuenta a asistentes de IA externos"><label className="lb">URL del servidor MCP</label><div className="row"><input className="input" readOnly value="https://mcp.ariabot.app/v1/13120" /><button className="btn btn-p" onClick={() => { navigator.clipboard?.writeText('https://mcp.ariabot.app/v1/13120'); toast('URL copiada') }}><Copy size={13} />Copiar</button></div><Row t="Permitir lectura de contactos" a="read" /><Row t="Permitir crear ventas" a="write" /></C>
  return null
}

export default function Settings() {
  const [sp, setSp] = useSearchParams(); const tab = sp.get('tab') || 'accounts'; const [col, setCol] = useState(false)
  const cur = NAV.flatMap(n => n[1]).find(x => x[0] === tab) || NAV[0][1][0]
  return <div className="page">
    <div className="small muted bold" style={{ fontSize: 10 }}>CONFIGURACIÓN</div><h1 style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{cur[1]}</h1><p className="small muted" style={{ marginBottom: 18 }}>{tab === 'accounts' ? 'Datos de la empresa seleccionada en el menú lateral.' : 'Ajustes de ' + cur[1].toLowerCase()}</p>
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      <div className="settings-nav" style={{ width: col ? 44 : 190, flexShrink: 0, transition: 'width .25s', position: 'relative', overflow: 'hidden' }}>
        <button className="icon-btn" style={{ position: 'absolute', right: 0, top: 0, width: 22, height: 22 }} onClick={() => setCol(!col)}><ChevronLeft size={13} style={{ transform: col ? 'rotate(180deg)' : null, transition: '.25s' }} /></button>
        {NAV.map(([s, items]) => <div key={s} style={{ marginBottom: 12 }}><div className="small muted bold" style={{ fontSize: 9.5, margin: '0 9px 6px', opacity: col ? 0 : 1 }}>{s}</div>
          {items.map(([k, l, Ic]) => <button key={k} title={l} className={tab === k ? 'on' : ''} onClick={() => setSp({ tab: k })}><Ic size={14} style={{ flexShrink: 0 }} />{!col && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l}</span>}</button>)}</div>)}</div>
      <div style={{ flex: 1, minWidth: 0 }} key={tab}>{tab === 'accounts' ? <Company /> : CRUD[tab] ? <Crud k={tab} /> : <Simple k={tab} />}</div></div>
  </div>
}
