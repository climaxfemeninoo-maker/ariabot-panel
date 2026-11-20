import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, Users, UserPlus, LifeBuoy, Languages, Sparkles, Workflow, Send, Zap, FileText, Braces, ListPlus, Tags, Puzzle, Activity, Package, Server, ChevronLeft, Plus, Save, LogOut, Trash2, Pencil, Clock, Copy, Store, Building, CalendarClock, Bell , Headphones, MessageCircle, AtSign, Database, Tag, Plug, Radar, Bot, Network, PowerOff, Search, Briefcase, Info } from 'lucide-react'
import { useStore, Modal, Empty, useToast, uid, Switch, Confirm } from '../ui'
import { LModal, LSelect, Toggle } from './leona'
import { SendIcon } from '../icons'
import { NewAccountModal, InviteMemberModal, Team, Invites, SupportAccess, Translations, AiUsage, StdFlows, QuickReplies } from './SettingsParts'
import { Templates, GlobalVars, CustomFields, Tags as TagsPage, Integrations, Tracking, Products, Mcp } from './SettingsParts2'

const NAV = [['CUENTA', [['accounts', 'Empresa', Building2], ['team', 'Equipo', Users], ['invites', 'Invitaciones a la plataforma', UserPlus], ['support', 'Acceso de soporte', Headphones], ['translations', 'Traducciones de flujo', Languages], ['ai', 'Uso de Leona AI', Sparkles]]],
['AUTOMATIZACIÓN', [['stdflows', 'Flujos estándar', Zap], ['mass', 'Envíos masivos', SendIcon], ['quick', 'Respuestas rápidas', MessageCircle], ['templates', 'Templates de WhatsApp', FileText], ['vars', 'Variables globales', AtSign], ['fields', 'Campos personalizados', Database], ['tags', 'Etiquetas', Tag]]],
['INTEGRACIONES', [['integrations', 'Integraciones', Plug], ['tracking', 'Seguimiento', Radar], ['products', 'Productos', Package], ['mcp', 'Herramientas MCP', Bot]]]]

const CRUD = {
  quick: ['Respuestas rápidas', 'Atajos para responder más rápido en el chat', [['short', 'Atajo', '/precio'], ['text', 'Mensaje', 'El precio es…', 'area']]],
  templates: ['Templates de WhatsApp', 'Plantillas aprobadas por Meta para iniciar conversaciones', [['name', 'Nombre', 'bienvenida_1'], ['cat', 'Categoría', 'MARKETING'], ['text', 'Contenido', 'Hola {{1}}, …', 'area']]],
  vars: ['Variables globales', 'Valores reutilizables en todos tus flujos', [['key', 'Clave', 'link_pago'], ['text', 'Valor', 'https://…']]],
  fields: ['Campos personalizados', 'Datos extra que guardas en cada contacto', [['name', 'Nombre del campo', 'fecha_compra'], ['type', 'Tipo', 'Texto']]],
  tags: ['Etiquetas', 'Organiza a tus contactos por etiquetas', [['name', 'Etiqueta', 'Comprador'], ['color', 'Color', '#005ae3', 'color']]],
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
  return <div className="card" style={{ padding: 18 }}><div className="row" style={{ marginBottom: 14 }}><div><b style={{ fontSize: 14 }}>{title}</b><div className="small muted">{sub}</div></div><span className="sp" /><button className="btn btn-p" onClick={() => setForm(Object.fromEntries(fields.map(f => [f[0], f[3] === 'color' ? '#005ae3' : ''])))}><Plus size={14} />{k === 'invites' ? 'Invitar' : 'Agregar'}</button></div>
    {items.length ? <div className="tbl-wrap"><table className="tbl"><thead><tr>{fields.map(f => <th key={f[0]}>{f[1]}</th>)}<th /></tr></thead><tbody>{items.map(it => <tr key={it.id}>{fields.map(f => <td key={f[0]} style={{ whiteSpace: 'normal', maxWidth: 320 }}>{f[3] === 'color' ? <span className="badge" style={{ background: it[f[0]] + '22', color: it[f[0]], border: '1px solid ' + it[f[0]] + '55' }}>{it.name}</span> : it[f[0]]}</td>)}
      <td style={{ width: 80 }}>{it.id !== 'me' && <div className="row" style={{ gap: 2 }}><button className="icon-btn" onClick={() => setForm(it)}><Pencil size={13} /></button><button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => setDel(it.id)}><Trash2 size={13} /></button></div>}</td></tr>)}</tbody></table></div>
      : <div style={{ border: '1px dashed var(--border)', borderRadius: 8 }}><Empty icon={<Plus size={24} />} title={'Sin ' + title.toLowerCase()} text="Agrega el primero con el botón de arriba." /></div>}
    <Modal open={!!form} onClose={() => setForm(null)} title={(form?.id ? 'Editar · ' : 'Nuevo · ') + title} footer={<><button className="btn btn-g" onClick={() => setForm(null)}>Cancelar</button><button className="btn btn-p" onClick={save}>Guardar</button></>}>
      {form && fields.map(([fk, l, ph, t]) => <div className="field" key={fk}><label className="lb">{l}</label>{t === 'area' ? <textarea className="input" value={form[fk]} placeholder={ph} onChange={e => setForm({ ...form, [fk]: e.target.value })} /> : t === 'color' ? <input type="color" value={form[fk]} onChange={e => setForm({ ...form, [fk]: e.target.value })} style={{ width: 60, height: 34, border: 'none', background: 'none' }} /> : <input className="input" value={form[fk]} placeholder={ph} onChange={e => setForm({ ...form, [fk]: e.target.value })} />}</div>)}</Modal>
    <Confirm open={!!del} onClose={() => setDel(null)} onOk={() => setItems(i => i.filter(x => x.id !== del))} />
  </div>
}

const DCOL = [['#3b82f6', 'Azul'], ['#10b981', 'Verde'], ['#005ae3', 'Morado'], ['#f97316', 'Naranja'], ['#ef4444', 'Rojo'], ['#f59e0b', 'Amarillo'], ['#6b7280', 'Gris']]
const TZ = ['Lima (America/Lima)', 'Brasília (America/Sao_Paulo)', 'Ciudad de México (America/Mexico_City)', 'Bogotá (America/Bogota)', 'Santiago (America/Santiago)', 'Buenos Aires (America/Argentina/Buenos_Aires)', 'Caracas (America/Caracas)', 'La Paz (America/La_Paz)', 'Guayaquil (America/Guayaquil)', 'Madrid (Europe/Madrid)', 'Nueva York (America/New_York)']
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function Company() {
  const toast = useToast(); const [tab, setTab] = useState('data')
  const CODEF = { name: 'Empresa Pablo Monja Suclupe', desc: 'Empresa criada automaticamente', slug: 'empresa-pablo-monja-suclupe', tz: 'Brasília (America/Sao_Paulo)', notif: true }
  const [coRaw, setCo] = useStore('companyData', CODEF); const co = { ...CODEF, ...coRaw }
  const [companies, setCompanies] = useStore('companies', [{ id: 'c1', name: 'Empresa Pablo Monja Suclupe' }]); const [curCo] = useStore('company', 'c1')
  const [f, setF] = useState(co)
  const [deps, setDeps] = useStore('departments', []); const [dq, setDq] = useState(''); const [dm, setDm] = useState(null); const [dd, setDd] = useState(null)
  const [hrs, setHrs] = useStore('work_hours', { on: false, wa: '', days: DAYS.map((d, i) => ({ d, on: i < 5, from: '09:00', to: '18:00' })) })
  const [h, setH] = useState(hrs); const dirty = JSON.stringify(h) !== JSON.stringify(hrs)
  const [conns] = useStore('connections', [])
  const [mod, setMod] = useState(null); const [mv, setMv] = useState(''); const [leave, setLeave] = useState(false)
  const saveCo = () => { if (!f.name.trim()) return toast('El nombre de la empresa es obligatorio', 'err'); setCo({ ...f, name: f.name.trim() }); setCompanies(cs => cs.map(c => c.id === curCo ? { ...c, name: f.name.trim() } : c)); toast('Empresa guardada') }
  const dlist = deps.filter(d => d.name.toLowerCase().includes(dq.toLowerCase()))
  return <>
    <div className="st-tabs">
      {[['data', 'Datos corporativos', Building2], ['deps', 'Departamentos', Network], ['hours', 'Horarios de trabajo', Clock]].map(([k, l, Ic]) => <button key={k} className={'st-tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}><Ic size={14} />{l}</button>)}
      <button className="lp-btn p" style={{ marginLeft: 'auto', marginBottom: -1 }} onClick={() => { setMv(''); setMod('account') }}><Plus size={16} />Nueva cuenta</button>
    </div>
    {tab === 'data' && <div className="st-card">
      <div style={{ display: 'flex' }}><div><h3>Datos de la empresa<span className="st-act">Activa</span></h3><div className="sd">Información mostrada a sus clientes y en informes</div></div>
        <button style={{ marginLeft: 'auto', color: '#ef4444', alignSelf: 'flex-start', marginTop: 6 }} title="Desactivar empresa" onClick={() => toast('No puede desactivar la empresa principal', 'err')}><PowerOff size={17} /></button></div>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 3 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 15px' }}>
        <div><label className="pf-lb">Nombre de la empresa <span style={{ color: '#ef4444' }}>*</span></label><div className="st-in"><Building2 size={15} /><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div></div>
        <div><label className="pf-lb">Descripción</label><div className="st-in"><Building2 size={15} /><input value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} /></div></div>
        <div><label className="pf-lb">Slug</label><div className="st-in"><input style={{ paddingLeft: 12, fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 400, fontSize: 12.5 }} value={f.slug} onChange={e => setF({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} /></div></div>
        <div><label className="pf-lb">Zona horaria</label><LSelect className="l-in ct-in" bold value={f.tz} onChange={v => setF({ ...f, tz: v })} options={TZ.map(t => ({ value: t, label: t }))} />
          <div style={{ fontSize: 11.5, lineHeight: 1.45, color: '#94a3b8', marginTop: 7 }}>Define la zona horaria usada en el panel, filtros, condiciones de flujo, intervalo inteligente, horario comercial y variables de fecha/hora.</div></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 14 }}><div><div style={{ fontSize: 13.3, fontWeight: 600 }}>Notificaciones por correo de instancias</div><div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 5 }}>Envía un correo al propietario cuando una instancia se desconecta o queda restringida (API Oficial). Disponible con más de 4 instancias; activo por defecto.</div></div>
        <span style={{ marginLeft: 'auto' }}><Toggle on={f.notif} onChange={v => setF({ ...f, notif: v })} /></span></div>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 23, paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}><button className="lp-btn p" onClick={saveCo}><Save size={15} />Guardar empresa</button></div>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 0, paddingTop: 23, display: 'flex', alignItems: 'flex-start' }}>
        <div><div style={{ fontSize: 13.3, fontWeight: 600 }}>Miembros del equipo</div><div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 5 }}>Invite o cree usuarios para la empresa actual.</div></div>
        <button className="lp-btn p" style={{ marginLeft: 'auto', marginTop: -2 }} onClick={() => { setMv(''); setMod('member') }}><Plus size={16} />Invitar miembro</button></div>
      <button className="lp-btn" style={{ color: '#ef4444', marginTop: 5 }} onClick={() => setLeave(true)}><LogOut size={15} />Salir de la empresa</button>
    </div>}
    {tab === 'deps' && <>
      <div style={{ display: 'flex', gap: 15, marginTop: 24 }}><div className="lp-srch" style={{ flex: 1 }}><Search size={15} /><input value={dq} onChange={e => setDq(e.target.value)} placeholder="Buscar por nombre del departamento" style={{ fontWeight: 500 }} /></div>
        <button className="lp-btn p" onClick={() => setDm({ name: '', color: DCOL[0][0] })}><Plus size={16} />Nuevo departamento</button></div>
      <div className="st-card" style={{ marginTop: 15 }}><h3>Departamentos activos</h3><div className="sd">Configure sectores de distribución automática de contactos</div>
        {deps.length === 0 ? <div style={{ marginTop: 17, border: '1px dashed var(--border)', borderRadius: 5, height: 218, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
          <Briefcase size={37} color="#94a3b8" strokeWidth={1.9} /><div style={{ fontSize: 13.3, fontWeight: 700, marginTop: 13 }}>No hay departamentos</div><div style={{ fontSize: 13.3, color: '#94a3b8', marginTop: 6 }}>Cree su primer departamento para organizarse</div>
          <button className="lp-btn p" style={{ marginTop: 14 }} onClick={() => setDm({ name: '', color: DCOL[0][0] })}><Plus size={16} />Crear primer departamento</button></div>
          : <div style={{ marginTop: 17 }}>{dlist.map(d => <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span className="st-dep" style={{ background: d.color }}><i />{d.name}</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}><button className="ch-ib" onClick={() => setDm(d)}><Pencil size={14} /></button><button className="ch-ib" onClick={() => setDd(d)}><Trash2 size={14} color="#ef4444" /></button></span></div>)}
            {dlist.length === 0 && <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Ningún departamento coincide con la búsqueda.</div>}</div>}
      </div></>}
    {tab === 'hours' && <div className="st-card">
      <div style={{ display: 'flex' }}><div><h3>Horarios de atención</h3><div className="sd">Defina las escalas comerciales semanales de la empresa</div></div>
        <button className="lp-btn p" style={{ marginLeft: 'auto', opacity: dirty ? 1 : .55, cursor: dirty ? 'pointer' : 'default' }} onClick={() => { if (!dirty) return; if (h.on && !h.wa) return toast('Seleccione el WhatsApp', 'err'); setHrs(h); toast('Horarios guardados') }}><Save size={15} />Guardar</button></div>
      <div className="pf-hint" style={{ marginTop: 6, height: 45 }}><Info size={17} />Los cambios se confirman con el botón&nbsp;<b>Guardar</b>&nbsp;arriba.</div>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 5, padding: '16px 15px', marginTop: 20 }}>
        <div><div style={{ fontSize: 13.3, fontWeight: 600 }}>Estado</div><div style={{ fontSize: 13.3, color: 'var(--soft)', marginTop: 4 }}>{h.on ? 'Horarios de atención activados' : 'Horarios de atención desactivados'}</div></div>
        <span style={{ marginLeft: 'auto' }}><Toggle on={h.on} onChange={v => setH({ ...h, on: v })} /></span></div>
      <div style={{ fontSize: 13.3, fontWeight: 600, marginTop: 23 }}>WhatsApp *</div><div style={{ fontSize: 13.3, color: 'var(--soft)', marginTop: 9 }}>Seleccione el WhatsApp para configurar esta instancia</div>
      <div style={{ marginTop: 10 }}><LSelect className="l-in ct-in" value={h.wa} onChange={v => setH({ ...h, wa: v })} placeholder={conns.length ? 'Seleccione...' : 'No hay conexiones disponibles'} options={conns.map(c => ({ value: c.id, label: c.name }))} style={{ height: 24 }} /></div>
      {h.on && <div style={{ marginTop: 22 }}>{h.days.map((x, i) => { const set = p => setH({ ...h, days: h.days.map((y, j) => j === i ? { ...y, ...p } : y) })
        return <div key={x.d} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: '1px solid var(--border)' }}><Toggle on={x.on} onChange={v => set({ on: v })} /><b style={{ width: 90, fontSize: 13 }}>{x.d}</b>
          {x.on ? <><input type="time" className="l-in" style={{ width: 120, height: 32 }} value={x.from} onChange={e => set({ from: e.target.value })} /><span style={{ color: '#94a3b8' }}>a</span><input type="time" className="l-in" style={{ width: 120, height: 32 }} value={x.to} onChange={e => set({ to: e.target.value })} /></> : <span style={{ fontSize: 12.5, color: '#94a3b8' }}>Cerrado</span>}</div> })}</div>}
    </div>}

    {dm && <LModal open onClose={() => setDm(null)} title={dm.id ? 'Editar departamento' : 'Nuevo departamento'} desc="Configure un nuevo sector de atención" width={495} bodyStyle={{ padding: '21px 24px 0', overflow: 'visible' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
        <div><label className="l-lbl" style={{ color: 'var(--text)' }}>Nombre del departamento</label><input className="l-in ct-in" autoFocus value={dm.name} onChange={e => setDm({ ...dm, name: e.target.value })} /></div>
        <div><label className="l-lbl" style={{ color: 'var(--text)' }}>Color del departamento</label><LSelect className="l-in ct-in" bold value={dm.color} onChange={v => setDm({ ...dm, color: v })} options={DCOL.map(([c, l]) => ({ value: c, label: l, dot: c }))} /></div></div>
      <label className="l-lbl" style={{ color: 'var(--text)', marginTop: 16 }}>Vista previa</label>
      <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '15px 17px' }}><span className="st-dep" style={{ background: dm.color }}><i />{dm.name || 'Nombre del departamento'}</span></div>
      <div style={{ borderTop: '1px solid var(--border2)', marginTop: 23, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 11 }}>
        <button className="lb2 g" onClick={() => setDm(null)}>Cancelar</button>
        <button className="lb2 p" style={{ background: '#005ae3' }} disabled={!dm.name.trim()} onClick={() => { if (dm.id) setDeps(x => x.map(d => d.id === dm.id ? { ...dm, name: dm.name.trim() } : d)); else setDeps(x => [...x, { ...dm, id: uid(), name: dm.name.trim() }]); toast(dm.id ? 'Departamento actualizado' : 'Departamento creado'); setDm(null) }}>Guardar</button></div>
    </LModal>}
    <LModal open={!!dd} onClose={() => setDd(null)} title="Eliminar departamento" width={482} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55 }}>¿Eliminar el departamento "{dd?.name}"?</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 13 }}><button className="lb2 g" onClick={() => setDd(null)}>Cancelar</button><button className="lb2 d" onClick={() => { setDeps(x => x.filter(d => d.id !== dd.id)); setDd(null); toast('Departamento eliminado') }}>Eliminar</button></div>
    </LModal>
    <NewAccountModal open={mod === 'account'} onClose={() => setMod(null)} />
    <InviteMemberModal open={mod === 'member'} onClose={() => setMod(null)} />
    <LModal open={leave} onClose={() => setLeave(false)} title="Salir de la empresa" width={482} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55 }}>Usted es el propietario de esta empresa. Transfiera la propiedad a otro miembro antes de salir.</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end' }}><button className="lb2 g" onClick={() => setLeave(false)}>Entendido</button></div>
    </LModal>
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
  if (k === 'ai') return <C title="Uso de Leona AI" sub="Consumo de tokens de los bloques de IA y agentes en este ciclo">{[['Bloques de IA', 0], ['Agentes de IA', 0], ['Generación de flujos', 0]].map(([l, v]) => <div key={l} style={{ marginBottom: 14 }}><div className="row small"><b>{l}</b><span className="sp" />{v} tokens</div><div className="progress" style={{ marginTop: 6 }}><div style={{ width: '2%' }} /></div></div>)}</C>
  if (k === 'stdflows') return <C title="Flujos estándar" sub="Flujos que se disparan automáticamente ante eventos">{['Primer mensaje de un contacto nuevo', 'Fuera del horario de trabajo', 'Venta aprobada', 'Pago pendiente'].map(ev => <div key={ev} className="field"><label className="lb">{ev}</label><select className="input" value={cfg[ev] || ''} onChange={e => { set(ev, e.target.value); toast('Flujo asignado') }}><option value="">Ninguno</option>{flows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>)}</C>
  if (k === 'mass') return <C title="Envíos masivos" sub="Protege tu número con límites de envío"><Row t="Intervalo aleatorio entre mensajes" d="Simula comportamiento humano" a="rand" /><Row t="Pausar fuera del horario de trabajo" a="hours" /><div className="field" style={{ marginTop: 14 }}><label className="lb">Máximo de envíos por hora: {cfg.max || 200}</label><input type="range" min="50" max="1000" step="50" value={cfg.max || 200} onChange={e => set('max', e.target.value)} style={{ width: '100%', accentColor: '#005ae3' }} /></div></C>
  if (k === 'integrations') return <C title="Integraciones" sub="Conecta Leona con tus plataformas de venta"><div className="grid g3">{['Hotmart', 'Kiwify', 'Shopify', 'Mercado Pago', 'Stripe', 'Google Sheets', 'OpenAI', 'Gemini', 'Zapier'].map(n => <div key={n} className="card lift row" style={{ padding: 12, background: 'var(--card2)' }}><div className="kpi-ic" style={{ background: 'var(--psoft)', color: 'var(--p)', width: 32, height: 32, fontWeight: 800 }}>{n[0]}</div><b>{n}</b><span className="sp" /><Switch on={!!cfg[n]} onChange={v => { set(n, v); toast(v ? n + ' conectado' : n + ' desconectado', v ? 'ok' : 'info') }} /></div>)}</div></C>
  if (k === 'tracking') return <C title="Seguimiento" sub="Atribución de ventas por UTM y origen"><Row t="Capturar UTMs del enlace de WhatsApp" a="utm" /><Row t="Enviar eventos de compra al Pixel" a="pixel" /><Row t="Registrar origen del anuncio (CTWA)" a="ctwa" /></C>
  if (k === 'mcp') return <C title="Herramientas MCP" sub="Conecta tu cuenta a asistentes de IA externos"><label className="lb">URL del servidor MCP</label><div className="row"><input className="input" readOnly value="https://mcp.ariabot.app/v1/13120" /><button className="btn btn-p" onClick={() => { navigator.clipboard?.writeText('https://mcp.ariabot.app/v1/13120'); toast('URL copiada') }}><Copy size={13} />Copiar</button></div><Row t="Permitir lectura de contactos" a="read" /><Row t="Permitir crear ventas" a="write" /></C>
  return null
}

export default function Settings() {
  const [sp, setSp] = useSearchParams(); const tab = sp.get('tab') || 'accounts'; const [col, setCol] = useState(false)
  const cur = NAV.flatMap(n => n[1]).find(x => x[0] === tab) || NAV[0][1][0]
  const SUB = { accounts: 'Datos de la empresa seleccionada en el menú lateral.', team: 'Administre los miembros, funciones y permisos de su equipo.', invites: 'Invite personas a la plataforma Leona.', support: 'Vea y revoque accesos temporales aprobados para el equipo de soporte.', translations: 'Solo el traductor de flujo: original, copia, reservado, usado y devuelto.', ai: 'Cargos de las conversaciones de Leona, agrupados por sesión. No se mezcla con el traductor.', stdflows: 'Defina los flujos estándar de cada conexión de WhatsApp.', quick: 'Administre y organice las respuestas rápidas de su empresa.', templates: 'Administre templates oficiales de Meta por WABA.', vars: 'Administre variables que puede usar en todos sus flujos.', fields: 'Gestione campos personalizados y variables del sistema BOT para sus contactos.', tags: 'Organice y clasifique ítems con etiquetas. CRUD completo próximamente.', integrations: 'Conecta emisores de comprobantes, seguimiento de ventas y otros servicios a tu cuenta.', products: 'Registre productos con rango de precio y valor predeterminado para ventas e integraciones.', mcp: 'Conecte y gestione su servidor MCP.' }
  const PAGES = { team: Team, invites: Invites, support: SupportAccess, translations: Translations, ai: AiUsage, stdflows: StdFlows, quick: QuickReplies, templates: Templates, vars: GlobalVars, fields: CustomFields, tags: TagsPage, integrations: Integrations, products: Products, mcp: Mcp }
  if (tab === 'tracking') return <Tracking onBack={() => history.length > 1 ? history.back() : setSp({ tab: 'integrations' })} />
  const P = PAGES[tab]
  return <div className="st-page">
    <div className="st-cap">CONFIGURACIÓN</div><h1 style={{ fontSize: 18.3, fontWeight: 700, marginTop: 9 }}>{cur[1]}</h1><p style={{ fontSize: 13.3, color: 'var(--soft)', marginTop: 6 }}>{SUB[tab] || 'Ajustes de ' + cur[1].toLowerCase() + ' de la empresa seleccionada.'}</p>
    <div className="st-wrap">
      <div className={'st-nav' + (col ? ' col' : '')}>
        <button className="cl" onClick={() => setCol(!col)} title={col ? 'Expandir' : 'Contraer'}><ChevronLeft size={12} style={{ transform: col ? 'rotate(180deg)' : '' }} /></button>
        {NAV.map(([s, items], si) => <div key={s} style={{ marginTop: si ? 21 : 0 }}><div className="sec" style={{ opacity: col ? 0 : 1 }}>{s}</div>
          {items.map(([k, l, Ic]) => <button key={k} title={l} className={'it' + (tab === k ? ' on' : '')} onClick={() => setSp({ tab: k })}><Ic size={15} style={{ flexShrink: 0 }} />{!col && <span>{l}</span>}</button>)}</div>)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }} key={tab}>{tab === 'accounts' ? <Company /> : P ? <P /> : CRUD[tab] ? <Crud k={tab} /> : <Simple k={tab} />}</div></div>
  </div>
}
