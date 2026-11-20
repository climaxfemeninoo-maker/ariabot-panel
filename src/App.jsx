import { useState, useEffect, useRef } from 'react'
import { Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, MessageSquare, Kanban as KanbanIc, Users, Workflow, Bot, Plug, Webhook, Send, Megaphone, CreditCard, Settings as Cog, CircleHelp, PanelLeftClose, PanelLeftOpen, ChevronsUpDown, ChevronDown, Sun, Moon, Bell, HelpCircle, UserPlus, Plus, Check, LogOut, User, Building2, Menu as MenuIcon, MessagesSquare, QrCode, Sparkles, Copy } from 'lucide-react'
import { SendIcon, MegaphoneIcon } from './icons'
import { NewAccountModal } from './pages/SettingsParts'
import { TokensModal } from './pages/Billing'
import { Rewards } from './pages/Huella'
import { NotifPanel } from './pages/Notifs'
import { Logo, Modal, useStore, useOutside, useToast, uid } from './ui'
import Dashboard from './pages/Dashboard'
import Chats from './pages/Chats'
import Kanban from './pages/Kanban'
import Contacts from './pages/Contacts'
import Flows, { FlowEditor } from './pages/Flows'
import Agents from './pages/Agents'
import Mass from './pages/Mass'
import Profile from './pages/Profile'
import Connections from './pages/Connections'
import Webhooks from './pages/Webhooks'
import Facebook from './pages/Facebook'
import Billing from './pages/Billing'
import Settings from './pages/Settings'
import Tutorials from './pages/Tutorials'

const NAV = [
  ['PRINCIPAL', [['/welcome', 'Dashboard', LayoutGrid], ['/chats', 'Chats en vivo', MessageSquare], ['/crms', 'Kanban', KanbanIc], ['/customers', 'Contactos', Users]]],
  ['OPERACIONES', [['/flows', 'Flujos', Workflow], ['/agentes', 'Agentes de IA', Bot], ['/connections', 'Conexiones', Plug], ['/settings/inbound-webhooks', 'Webhooks de entrada', Webhook], ['/mass-dispatches', 'Envíos masivos', SendIcon], ['/facebook/campaigns', 'Facebook', MegaphoneIcon]]],
  ['GESTIÓN', [['/billing', 'Cobros y suscripciones', CreditCard], ['/settings', 'Configuración', Cog], ['/tutoriales', 'Tutoriales', CircleHelp]]],
]

export function useTheme() {
  const [theme, setTheme] = useStore('theme', 'dark')
  useEffect(() => { document.documentElement.className = theme }, [theme])
  return [theme, () => setTheme(t => t === 'dark' ? 'light' : 'dark')]
}

function Sidebar({ col, setCol, mopen, setMopen }) {
  const [theme, toggle] = useTheme()
  const [, setAuthed] = useStore('authed', false)
  const [companies, setCompanies] = useStore('companies', [{ id: 'c1', name: 'Empresa Pablo Monja Suclupe' }])
  const [cur, setCur] = useStore('company', 'c1')
  const [contacts] = useStore('contacts', [])
  const [ddOpen, setDd] = useState(false); const [newCo, setNewCo] = useState(false); const [coName, setCoName] = useState('')
  const [modal, setModal] = useState(null); const [notifOpen, setNotif] = useState(false); const [userOpen, setUser] = useState(false)
  const ref = useRef(); const nref = useRef(); const uref = useRef()
  useOutside(ref, () => setDd(false)); useOutside(nref, () => setNotif(false)); useOutside(uref, () => setUser(false))
  const toast = useToast(); const nav = useNavigate()
  const company = companies.find(c => c.id === cur) || companies[0]
  const [notifs, setNotifs] = useStore('notifs', [
    { id: 1, t: 'Bienvenido a Leona', d: 'Configura tu primera conexión de WhatsApp para empezar.', r: false },
    { id: 2, t: 'Nuevo tutorial disponible', d: 'Aprende a crear flujos con IA en 5 minutos.', r: false }])
  const [nl] = useStore('notif_list', [])
  const unread = nl.filter(n => !n.r).length
  return <aside className={'side' + (col ? ' col' : '') + (mopen ? ' mopen' : '')}>
    <div className="side-top"><NavLink to="/welcome" className="logo"><img src={theme === 'dark' ? '/leona-white.png' : '/leona-color.png'} alt="Leona" /></NavLink>
      <button className="collapse" onClick={() => setCol(!col)} title="Contraer menú">{col ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button></div>
    <div ref={ref} className="co-wrap" style={{ position: 'relative' }}>
      <div className="company" onClick={() => setDd(!ddOpen)}>
        {col ? <Building2 size={16} /> : <><div style={{ flex: 1, minWidth: 0 }}><div className="n">{company.name}</div><div className="s">Leads: {contacts.length}</div></div><ChevronDown size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} /></>}
      </div>
      {ddOpen && <div className="dd-menu" style={{ left: 6, right: 6, top: 'calc(100% - 2px)', minWidth: 200 }}>
        <div className="small muted" style={{ padding: '6px 9px' }}>Empresas</div>
        {companies.map(c => <button key={c.id} className={'dd-item' + (c.id === cur ? ' on' : '')} onClick={() => { setCur(c.id); setDd(false); toast('Empresa cambiada a ' + c.name) }}><Building2 size={14} />{c.name}{c.id === cur && <Check size={13} style={{ marginLeft: 'auto' }} />}</button>)}
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
        <button className="dd-item" onClick={() => { setNewCo(true); setDd(false) }}><Plus size={14} />Nueva empresa</button>
      </div>}
    </div>
    <nav className="nav">
      {NAV.map(([sec, items]) => <div key={sec}><div className="nav-sec">{sec}</div>
        {items.map(([to, label, Ic]) => <NavLink key={to} to={to} end={to === '/settings'} title={label} onClick={() => setMopen(false)}><Ic size={16} strokeWidth={1.9} /><span>{label}</span></NavLink>)}</div>)}
    </nav>
    <div className="side-bottom">
      <div className="tokens" onClick={() => setModal('tokens')}>0 tokens Leona</div>
      <div className="duo"><button className="bg-amber" onClick={() => setModal('support')}><CircleHelp size={13} /><span>Soporte</span></button>
        <button className="bg-purple" onClick={() => setModal('aff')}><UserPlus size={13} /><span>Afiliación</span></button></div>
      <div className="theme-row" onClick={toggle} title="Ctrl+M">
        {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} />}
        <div><div className="t">{theme === 'dark' ? 'Claro' : 'Oscuro'}</div><div className="k">Ctrl+M · ⌘M</div></div>
        <div className="bell" ref={nref} onClick={e => { e.stopPropagation(); setNotif(!notifOpen) }}><Bell size={16} />{unread > 0 && <span className="dot-badge" />}
          {notifOpen && <NotifPanel />}</div>
      </div>
      <div className="user" ref={uref} onClick={() => setUser(!userOpen)}>
        <div className="avatar">PM</div><div className="info" style={{ minWidth: 0 }}><div className="n">Pablo Monja Suclupe</div><div className="e">k4el.ux@gmail.com</div></div><ChevronDown size={15} className="chev" style={{ marginLeft: 'auto', color: 'var(--muted)' }} />
        {userOpen && <div className="dd-menu" style={{ top: 'auto', bottom: 'calc(100% + 6px)', left: 0, right: 0 }} onClick={e => e.stopPropagation()}>
          <button className="dd-item" onClick={() => { nav('/profile'); setUser(false) }}><User size={14} />Mi perfil</button>
          <button className="dd-item" onClick={() => { nav('/billing'); setUser(false) }}><CreditCard size={14} />Facturación</button>
          <button className="dd-item" onClick={() => { toggle(); setUser(false) }}>{theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}Cambiar tema</button>
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <button className="dd-item danger" onClick={() => { setUser(false); setAuthed(false); toast('Sesión cerrada', 'info') }}><LogOut size={14} />Cerrar sesión</button>
        </div>}
      </div>
    </div>
    <NewAccountModal open={newCo} onClose={() => setNewCo(false)} />
    <TokensModal open={modal === 'tokens'} onClose={() => setModal(null)} />
    <Modal open={modal === 'support'} onClose={() => setModal(null)} title="Soporte" sub="¿En qué podemos ayudarte?" icon={<HelpCircle size={18} />}
      footer={<><button className="btn btn-g" onClick={() => setModal(null)}>Cerrar</button><button className="btn btn-p" onClick={() => { setModal(null); toast('Mensaje enviado a soporte') }}>Enviar</button></>}>
      <div className="field"><label className="lb">Asunto</label><input className="input" placeholder="Describe brevemente el problema" /></div>
      <div className="field"><label className="lb">Mensaje</label><textarea className="input" placeholder="Cuéntanos más detalles…" /></div></Modal>
    <Modal open={modal === 'aff'} onClose={() => setModal(null)} title="Programa de afiliación" sub="Gana hasta 40% de comisión recurrente" icon={<UserPlus size={18} />}>
      <div className="grid g3" style={{ marginBottom: 14 }}>{[['Clics', 0], ['Registros', 0], ['Comisión', 'PEN 0,00']].map(([a, b]) => <div key={a} className="card" style={{ padding: 12 }}><div className="small muted">{a}</div><div className="bold" style={{ fontSize: 16 }}>{b}</div></div>)}</div>
      <label className="lb">Tu enlace de afiliado</label>
      <div className="row"><input className="input" readOnly value="https://leona.app/r/pablo-monja" /><button className="btn btn-p" onClick={() => { navigator.clipboard?.writeText('https://leona.app/r/pablo-monja'); toast('Enlace copiado') }}><Copy size={13} />Copiar</button></div></Modal>
  </aside>
}

function MobileNav({ onMenu }) {
  const loc = useLocation(); const on = p => loc.pathname.startsWith(p)
  return <nav className="mb-nav">
    <NavLink to="/welcome" title="Dashboard"><span className="sq" style={{ background: on('/welcome') ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'transparent', color: on('/welcome') ? '#fff' : '#8f8a9e' }}><LayoutGrid size={15} fill="currentColor" /></span></NavLink>
    <NavLink to="/facebook/campaigns" title="Facebook"><span className="sq" style={{ background: '#1d4ed8', fontWeight: 800, fontSize: 15, fontFamily: 'Arial,sans-serif', opacity: on('/facebook') ? 1 : .85 }}>f</span></NavLink>
    <NavLink to="/chats" title="Chats"><MessagesSquare size={24} strokeWidth={1.7} color={on('/chats') ? '#fff' : '#8f8a9e'} /></NavLink>
    <NavLink to="/connections" title="Conexiones"><QrCode size={22} strokeWidth={1.7} color={on('/connections') ? '#fff' : '#8f8a9e'} /></NavLink>
    <button onClick={onMenu} title="Menú"><MenuIcon size={23} strokeWidth={1.7} /></button>
  </nav>
}

export default function App() {
  const [col, setCol] = useStore('sidecol', false)
  const [mopen, setMopen] = useState(false)
  const [, toggle] = useTheme()
  const loc = useLocation()
  useEffect(() => {
    const k = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') { e.preventDefault(); toggle() } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [toggle])
  const full = /\/flows\/.+\/edit/.test(loc.pathname) || loc.pathname === '/chats'
  if (loc.pathname === '/rewards') return <Rewards />
  return <div className="app">
    <button className="mob-btn" onClick={() => setMopen(!mopen)}><MenuIcon size={18} /></button>
    <Sidebar col={col && !(typeof window !== 'undefined' && window.innerWidth <= 760)} setCol={setCol} mopen={mopen} setMopen={setMopen} />
    {mopen && <div onClick={() => setMopen(false)} style={{ position: 'fixed', inset: 0, zIndex: 85, background: 'rgba(0,0,0,.55)' }} />}
    <main className="main" style={full ? { overflow: 'hidden' } : null}>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" />} />
        <Route path="/welcome" element={<Dashboard />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/crms" element={<Kanban />} />
        <Route path="/crms/:id" element={<Kanban />} />
        <Route path="/customers" element={<Contacts />} />
        <Route path="/flows" element={<Flows />} />
        <Route path="/flows/:id/edit" element={<FlowEditor />} />
        <Route path="/agentes" element={<Agents />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/settings/inbound-webhooks" element={<Webhooks />} />
        <Route path="/settings/inbound-webhooks/:id" element={<Webhooks />} />
        <Route path="/mass-dispatches" element={<Mass />} />
        <Route path="/facebook/campaigns" element={<Facebook />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/billing/:sub" element={<Billing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/tutoriales" element={<Tutorials />} />
        <Route path="*" element={<Navigate to="/welcome" />} />
      </Routes>
    </main>
    <MobileNav onMenu={() => setMopen(true)} />
  </div>
}
