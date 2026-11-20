import { useState, useRef } from 'react'
import { CircleUserRound, User, Lock, Eye, EyeOff, Mail, Phone, Save, ShieldCheck, Moon, Sun, Building, ChevronDown, Check } from 'lucide-react'
import { useStore, useToast } from '../ui'
import { LSelect } from './leona'
import { useTheme } from '../App'

const LANGS = [['pt-BR', 'Portugués (Brasil)', 'br'], ['en-US', 'Inglés (Estados Unidos)', 'us'], ['es-LA', 'Español (Latinoamérica)', 'mx']]
const flag = c => <img src={`https://flagcdn.com/w40/${c}.png`} alt="" style={{ width: 17, height: 12, borderRadius: 1.5, objectFit: 'cover' }} onError={e => e.currentTarget.style.visibility = 'hidden'} />

export default function Profile() {
  const toast = useToast()
  const PDEF = { name: 'Pablo Monja Suclupe', email: 'k4el.ux@gmail.com', phone: '+994181027', avatar: '' }
  const [pRaw, setP] = useStore('profile', PDEF); const p = { ...PDEF, ...pRaw }
  const [tab, setTab] = useState('data'); const file = useRef()
  const [f, setF] = useState(p)
  const ini = (p.name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const upload = e => {
    const x = e.target.files[0]; e.target.value = ''; if (!x) return
    if (!/image\/(jpeg|png|webp)/.test(x.type)) return toast('Formato no permitido: use JPEG, PNG o WebP', 'err')
    if (x.size > 5 * 1024 * 1024) return toast('La imagen supera 5 MB', 'err')
    const r = new FileReader(); r.onload = () => { setP(v => ({ ...v, avatar: r.result })); toast('Foto actualizada') }; r.readAsDataURL(x)
  }
  return <div className="lp" style={{ paddingTop: 22 }}>
    <div className="lp-hd" style={{ paddingBottom: 18, borderBottom: '1px solid var(--border2)' }}><CircleUserRound size={22} strokeWidth={1.9} style={{ marginLeft: 2 }} /><div><h1 style={{ fontSize: 19.5 }}>Mi perfil</h1><p>Administra tus datos personales y preferencias</p></div></div>
    <div className="pf-top">
      <div className="pf-av" onClick={() => file.current.click()} title="Cambiar foto">{p.avatar ? <img src={p.avatar} alt="" /> : ini}</div>
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={upload} />
      <div><div style={{ fontSize: 19.5, fontWeight: 700 }}>{p.name}</div><div style={{ fontSize: 13.3, color: 'var(--soft)', marginTop: 4 }}>{p.email}</div>
        <div style={{ fontSize: 11.3, color: 'var(--soft)', marginTop: 8 }}>JPEG, PNG o WebP. Máximo 5 MB.</div>
        <span className="pf-on"><i />En línea</span></div>
    </div>
    <div className="pf-tabs">{[['data', 'Datos personales', User], ['sec', 'Seguridad', Lock], ['pref', 'Preferencias', Eye]].map(([k, l, Ic]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}><Ic size={15} />{l}</button>)}</div>
    {tab === 'data' && <div className="pf-card">
      <h3>Datos personales</h3><div className="sd">Mantén tus datos actualizados</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 15px' }}>
        <div><label className="pf-lb">Nombre completo</label><div className="pf-in"><User size={15} /><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div></div>
        <div><label className="pf-lb">Correo electrónico</label><div className="pf-in"><Mail size={15} /><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div></div>
      </div>
      <label className="pf-lb">WhatsApp personal</label><div className="pf-in"><Phone size={15} /><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/[^\d+ ]/g, '') })} /></div>
      <div style={{ fontSize: 13.3, color: '#94a3b8', marginTop: 8 }}>Número personal (no se usa en automatizaciones)</div>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 15, paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="lb2 p" onClick={() => { if (!f.name.trim() || !/\S+@\S+\.\S+/.test(f.email)) return toast('Revise el nombre y el correo', 'err'); setP(v => ({ ...v, ...f, name: f.name.trim() })); toast('Datos guardados') }}><Save size={15} />Guardar</button></div>
    </div>}
    {tab === 'sec' && <Security />}
    {tab === 'pref' && <Prefs />}
  </div>
}

function Pass({ label, ph, v, set }) {
  const [show, setShow] = useState(false)
  return <><label className="pf-lb">{label} *</label><div className="pf-in" style={{ width: 419 }}><input type={show ? 'text' : 'password'} style={{ paddingLeft: 13, fontWeight: 500 }} placeholder={ph} value={v} onChange={e => set(e.target.value)} />
    <button className="eye" onClick={() => setShow(!show)}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></>
}
function Security() {
  const toast = useToast(); const [a, setA] = useState(''); const [b, setB] = useState(''); const [c, setC] = useState('')
  const ok = a && b.length >= 6 && b === c
  return <div className="pf-card">
    <h3>Seguridad</h3><div className="sd">Mantén tu cuenta segura cambiando la contraseña con regularidad</div>
    <div className="pf-hint"><ShieldCheck size={17} />Elige una contraseña segura con al menos 6 caracteres, combinando letras, números y símbolos.</div>
    <Pass label="Contraseña actual" ph="Ingresa tu contraseña actual" v={a} set={setA} />
    <Pass label="Nueva contraseña" ph="Ingresa la nueva contraseña (mín. 6 caracteres)" v={b} set={setB} />
    <Pass label="Confirmar nueva contraseña" ph="Ingresa de nuevo la nueva contraseña" v={c} set={setC} />
    {c && b !== c && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>Las contraseñas no coinciden</div>}
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 17, paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
      <button className="lb2 p" disabled={!ok} onClick={() => { setA(''); setB(''); setC(''); toast('Contraseña actualizada') }}><Lock size={15} />Cambiar contraseña</button></div>
  </div>
}
function Prefs() {
  const toast = useToast(); const [theme, toggle] = useTheme()
  const [lang, setLang] = useStore('lang', 'es-LA')
  const [companies] = useStore('companies', [{ id: 'c1', name: 'Empresa Pablo Monja Suclupe' }]); const [cur, setCur] = useStore('company', 'c1')
  const [open, setOpen] = useState(false)
  const co = companies.find(c => c.id === cur) || companies[0]
  return <div className="pf-card" style={{ paddingBottom: 26 }}>
    <h3>Preferencias visuales</h3><div className="sd">Personaliza tu experiencia</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 15px', overflow: 'visible' }}>
      <div><label className="pf-lb">Tema</label><LSelect className="l-in ct-in" bold value={theme} onChange={v => v !== theme && toggle()} options={[{ value: 'dark', label: 'Oscuro' }, { value: 'light', label: 'Claro' }]} renderOpt={o => <>{o.value === 'dark' ? <Moon size={15} /> : <Sun size={15} />}{o.label}</>} /></div>
      <div><label className="pf-lb">Idioma de la interfaz</label><LSelect className="l-in ct-in" bold value={lang} onChange={v => { setLang(v); toast('Idioma guardado') }} options={LANGS.map(([value, label, c]) => ({ value, label, c }))} renderOpt={o => <>{flag(o.c)}{o.label}</>} renderVal={o => <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>{flag(o.c)}{o.label}</span>} /></div>
    </div>
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, border: '1px solid var(--border)', borderRadius: 5, padding: '0 13px', height: 44, textAlign: 'left' }}>
        <Building size={15} color="#94a3b8" /><span style={{ lineHeight: 1.3 }}><b style={{ display: 'block', fontSize: 13 }}>Mis cuentas</b><span style={{ fontSize: 13, color: '#94a3b8' }}>{co.name} · {companies.length} cuenta(s)</span></span>
        <ChevronDown size={15} style={{ marginLeft: 'auto', color: 'var(--muted)', transform: open ? 'rotate(180deg)' : '', transition: '.2s' }} /></button>
      {open && <div style={{ border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 5px 5px', padding: 5 }}>{companies.map(c => <button key={c.id} className={'l-opt' + (c.id === cur ? ' on' : '')} onClick={() => { setCur(c.id); toast('Cuenta cambiada a ' + c.name) }}><Building size={14} />{c.name}{c.id === cur && <Check size={14} style={{ marginLeft: 'auto' }} />}</button>)}</div>}
    </div>
  </div>
}
