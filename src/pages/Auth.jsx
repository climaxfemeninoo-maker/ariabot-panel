import { useState, useEffect } from 'react'
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, Sun, Moon } from 'lucide-react'
import { useStore, useToast } from '../ui'

function useTheme() {
  const [theme, setTheme] = useStore('theme', 'dark')
  useEffect(() => { document.documentElement.className = theme }, [theme])
  return [theme, () => setTheme(t => t === 'dark' ? 'light' : 'dark')]
}

function Logo({ theme, size = 54 }) {
  const col = theme === 'dark' ? '#fff' : '#7c3aed'
  return <svg height={size} viewBox="0 0 230 56" style={{ display: 'block', margin: '0 auto' }} aria-label="Leona">
    <defs>
      <linearGradient id="leoG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={theme === 'dark' ? '#c4b5fd' : '#a855f7'} />
        <stop offset="1" stopColor={theme === 'dark' ? '#ffffff' : '#6d28d9'} />
      </linearGradient>
    </defs>
    {/* LE */}
    <text x="0" y="42" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="46" letterSpacing="-1" fill={col}>LE</text>
    {/* lioness medallion as the O */}
    <g transform="translate(74,6)">
      <circle cx="22" cy="22" r="22" fill="url(#leoG)" />
      <circle cx="22" cy="22" r="22" fill="none" stroke={theme === 'dark' ? '#fff' : '#6d28d9'} strokeWidth="1.5" opacity=".5" />
      {/* ears */}
      <circle cx="12" cy="7" r="6" fill={theme === 'dark' ? '#6d28d9' : '#ede9fe'} />
      <circle cx="32" cy="7" r="6" fill={theme === 'dark' ? '#6d28d9' : '#ede9fe'} />
      {/* face */}
      <path d="M22 10c8 0 13 6 13 14 0 7-6 13-13 13S9 31 9 24c0-8 5-14 13-14z" fill={theme === 'dark' ? '#3b1d73' : '#4c1d95'} opacity=".55" />
      {/* eyes + muzzle */}
      <circle cx="16" cy="22" r="2.4" fill="#fff" />
      <circle cx="28" cy="22" r="2.4" fill="#fff" />
      <path d="M18 29c2 2 6 2 8 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="27" r="1.6" fill="#fff" />
    </g>
    {/* NA */}
    <text x="124" y="42" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="46" letterSpacing="-1" fill={col}>NA</text>
  </svg>
}

function Field({ icon, type = 'text', value, onChange, placeholder, eye, onEye }) {
  return <div className="auth-field">
    <span className="auth-ic">{icon}</span>
    <input className="auth-input" type={type} value={value} onChange={onChange} placeholder={placeholder} />
    {onEye && <button type="button" className="auth-eye" onClick={onEye}>{eye ? <EyeOff size={17} /> : <Eye size={17} />}</button>}
  </div>
}

export default function Auth({ onAuth }) {
  const [theme, toggle] = useTheme()
  const toast = useToast()
  const [view, setView] = useState('login')
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('')
  const [name, setName] = useState(''); const [wa, setWa] = useState(''); const [remember, setRemember] = useState(false)
  const [showPw, setShowPw] = useState(false); const [showPw2, setShowPw2] = useState(false)

  const login = e => { e?.preventDefault(); if (!email || !pw) return toast('Informe e-mail e senha', 'err'); onAuth(name || email) }
  const register = e => {
    e?.preventDefault()
    if (!name || !email || !pw) return toast('Preencha os campos obrigatórios', 'err')
    if (pw.length < 6) return toast('A senha deve ter pelo menos 6 caracteres', 'err')
    if (pw !== pw2) return toast('As senhas não coincidem', 'err')
    onAuth(name)
  }
  const recover = e => { e?.preventDefault(); if (!email) return toast('Digite seu e-mail', 'err'); toast('Instruções enviadas para seu e-mail'); setView('login') }

  return <div className={'auth-wrap ' + (view === 'register' ? 'top' : '')}>
    <button className="auth-theme" onClick={toggle} title="Tema">{theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}</button>

    <div className="auth-box">
      <form className="auth-card" onSubmit={view === 'login' ? login : view === 'register' ? register : recover}>
        <div className="auth-logo"><Logo theme={theme} size={view === 'register' ? 48 : 54} /></div>

        {view === 'login' && <>
          <h1 className="auth-h">Bem-vindo!</h1>
          <p className="auth-sub">Informe suas credenciais para entrar</p>
          <Field icon={<Mail size={16} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu e-mail" />
          <Field icon={<Lock size={16} />} type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Digite sua senha" eye={showPw} onEye={() => setShowPw(!showPw)} />
          <div className="auth-row">
            <label className="auth-check"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />Lembrar-me</label>
            <button type="button" className="auth-link" onClick={() => setView('forgot')}>Esqueci minha senha</button>
          </div>
          <button className="auth-btn" type="submit">Entrar</button>
          <div className="auth-divider" />
          <p className="auth-foot">É novo por aqui? <button type="button" className="auth-link" onClick={() => setView('register')}>Crie uma conta agora</button></p>
        </>}

        {view === 'register' && <>
          <h1 className="auth-h">Crie sua conta</h1>
          <p className="auth-sub">Preencha os dados abaixo para começar</p>
          <label className="auth-lb">Nome completo <span>*</span></label>
          <Field icon={<User size={16} />} value={name} onChange={e => setName(e.target.value)} placeholder="Digite seu nome completo" />
          <label className="auth-lb">E-mail <span>*</span></label>
          <Field icon={<Mail size={16} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu e-mail" />
          <label className="auth-lb">WhatsApp Pessoal</label>
          <Field icon={<Phone size={16} />} value={wa} onChange={e => setWa(e.target.value)} placeholder="Ex: 5511999999999" />
          <div className="auth-hint">Número pessoal (não utilizado nas automações)</div>
          <label className="auth-lb">Senha <span>*</span></label>
          <Field icon={<Lock size={16} />} type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Digite sua senha (mínimo 6 caracteres)" eye={showPw} onEye={() => setShowPw(!showPw)} />
          <div className="auth-hint">A senha deve ter pelo menos 6 caracteres</div>
          <label className="auth-lb">Confirmar senha <span>*</span></label>
          <Field icon={<Lock size={16} />} type={showPw2 ? 'text' : 'password'} value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Confirme sua senha" eye={showPw2} onEye={() => setShowPw2(!showPw2)} />
          <button className="auth-btn" type="submit" style={{ marginTop: 18 }}>Criar conta</button>
          <p className="auth-foot">Já tem uma conta? <button type="button" className="auth-link" onClick={() => setView('login')}>Faça login</button></p>
        </>}

        {view === 'forgot' && <>
          <h1 className="auth-h">Esqueceu sua senha?</h1>
          <p className="auth-sub">Digite seu email e enviaremos instruções para redefinir sua senha</p>
          <Field icon={<Mail size={16} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu e-mail" />
          <button className="auth-btn" type="submit" style={{ marginTop: 6 }}>Enviar instruções</button>
          <p className="auth-foot"><button type="button" className="auth-link" onClick={() => setView('login')}><ArrowLeft size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Voltar para o login</button></p>
        </>}
      </form>
      {view === 'login' && <div className="auth-copy">© 2026 Leona Flow. Todos os direitos reservados.</div>}
      {view === 'register' && <div className="auth-copy">© 2025 Leona AI. Todos os direitos reservados.</div>}
    </div>
  </div>
}
