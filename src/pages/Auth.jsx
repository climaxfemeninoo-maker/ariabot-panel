import { useState, useEffect } from 'react'
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, Sun, Moon } from 'lucide-react'
import { useStore, useToast } from '../ui'

/* Medidas de las capturas de referencia. zoom .8 sobre tarjeta/copy/toggle => escala de pantalla 1.125*.8 = .9 (calibrado) */
const CSS = `
.la-page{position:fixed;inset:0;z-index:1000;overflow-y:auto;font-family:Inter,system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:19px 13px}
.la-card,.la-copy,.la-toggle{zoom:.8}
.la-page.top{justify-content:flex-start;padding-top:5px}
.la-page *{box-sizing:border-box}
.la-toggle{position:fixed;top:14px;right:17px;width:44px;height:44px;border-radius:10px;display:grid;place-items:center;cursor:pointer;z-index:2;transition:.2s}
.la-card{position:relative;width:100%;overflow:hidden;flex-shrink:0}
.la-copy{flex-shrink:0}
.la-logo{display:block;margin:0 auto;position:relative;z-index:1}
.la-h{text-align:center;font-weight:700;letter-spacing:-.01em;position:relative;z-index:1}
.la-sub{text-align:center;position:relative;z-index:1}
.la-field{position:relative;display:flex;align-items:center}
.la-ic{position:absolute;display:flex;pointer-events:none}
.la-in{width:100%;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s}
.la-eye{position:absolute;display:flex;background:none;border:none;cursor:pointer;padding:4px}
.la-btn{width:100%;border:none;cursor:pointer;color:#fff;font-family:inherit;transition:background .15s,transform .1s}
.la-btn:active{transform:scale(.995)}
.la-link{background:none;border:none;cursor:pointer;padding:0;font-family:inherit}
.la-link:hover{text-decoration:underline}

/* ---------- LOGIN (estilo violeta) ---------- */
.lv .la-toggle{background:#100e1e;border:1px solid #262240}
.lv .la-card{max-width:524px;border-radius:18px;padding:39px 38px 35px}
.lv .la-logo{height:65px}
.lv .la-h{font-size:27.6px;line-height:33px;margin-top:29px}
.lv .la-sub{font-size:16.4px;line-height:24px;margin-top:12px}
.lv .la-field{margin-top:20px}
.lv .la-field.first{margin-top:28px}
.lv .la-ic{left:17px}
.lv .la-in{height:49px;border-radius:11px;padding:0 46px 0 48px;font-size:16.6px}
.lv .la-eye{right:13px}
.lv .la-row{display:flex;align-items:center;justify-content:space-between;margin-top:23px;font-size:16.5px}
.lv .la-row label{display:flex;align-items:center;gap:11px;cursor:pointer}
.lv .la-row input{width:17px;height:17px;margin:0;cursor:pointer}
.lv .la-row .la-link{font-size:16.4px;font-weight:500}
.lv .la-btn{height:46.5px;border-radius:11px;font-size:17.1px;font-weight:700;margin-top:21px}
.lv .la-div{height:1px;margin-top:28px}
.lv .la-foot{text-align:center;font-size:16.4px;line-height:22px;margin-top:28px}
.lv .la-foot .la-link{font-size:16.4px;font-weight:500}
.lv .la-copy{font-size:14.1px;margin-top:38px;text-align:center}
.lv .la-btn{background:#8b5cf6}.lv .la-btn:hover{background:#7c3aed}
/* login oscuro */
html.dark .lv{background:radial-gradient(1000px 520px at 50% -8%,rgba(91,56,176,.22),transparent 70%),#110f20;color:#fff}
html.dark .lv .la-toggle{color:#f59e0b}
html.dark .lv .la-card{background:#1c1736;border:1px solid rgba(255,255,255,.045);box-shadow:0 12px 32px rgba(0,0,0,.22)}
html.dark .lv .la-card:before{content:'';position:absolute;top:0;left:26%;width:50%;height:1px;background:linear-gradient(90deg,transparent,rgba(216,206,255,.75),transparent)}
html.dark .lv .la-card:after{content:'';position:absolute;top:-80px;right:-10px;width:270px;height:210px;background:radial-gradient(closest-side,rgba(139,108,246,.2),transparent);pointer-events:none}
html.dark .lv .la-sub,html.dark .lv .la-foot{color:#d6d3e6}
html.dark .lv .la-ic,html.dark .lv .la-eye{color:#8f89ad}
html.dark .lv .la-in{background:#241e42;border:1px solid rgba(255,255,255,.04);color:#fff;color-scheme:dark}
html.dark .lv .la-in::placeholder{color:#9b95b9}
html.dark .lv .la-in:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.18)}
html.dark .lv .la-in:-webkit-autofill{-webkit-box-shadow:0 0 0 100px #241e42 inset;-webkit-text-fill-color:#fff}
html.dark .lv .la-row label{color:#e6e3f1}
html.dark .lv .la-row input{color-scheme:dark}
html.dark .lv .la-link{color:#a78bfa}
html.dark .lv .la-div{background:rgba(228,225,244,.85)}
html.dark .lv .la-copy{color:#9b96b3}
/* login claro */
html:not(.dark) .lv{background:radial-gradient(900px 420px at 50% -10%,rgba(167,139,250,.14),transparent 70%),radial-gradient(rgba(124,58,237,.05) 1px,transparent 1.2px) 0 0/22px 22px,#fff;color:#111827}
html:not(.dark) .lv .la-toggle{background:#fff;border:1px solid #e5e7eb;color:#374151}
html:not(.dark) .lv .la-card{background:#f9fafb;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(17,24,39,.04)}
html:not(.dark) .lv .la-card:after{content:'';position:absolute;top:-70px;left:-50px;width:230px;height:160px;background:radial-gradient(closest-side,rgba(167,139,250,.28),transparent);pointer-events:none}
html:not(.dark) .lv .la-logo{filter:drop-shadow(0 9px 10px rgba(17,24,39,.28))}
html:not(.dark) .lv .la-h{color:#111827}
html:not(.dark) .lv .la-sub,html:not(.dark) .lv .la-foot{color:#6b7280}
html:not(.dark) .lv .la-ic,html:not(.dark) .lv .la-eye{color:#6b7280}
html:not(.dark) .lv .la-in{background:#e9f0fe;border:1px solid #dbe4f5;color:#111827}
html:not(.dark) .lv .la-in::placeholder{color:#8a93a6}
html:not(.dark) .lv .la-in:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.15)}
html:not(.dark) .lv .la-row label{color:#4b5563}
html:not(.dark) .lv .la-link{color:#8b5cf6}
html:not(.dark) .lv .la-div{background:#e5e7eb}
html:not(.dark) .lv .la-copy{color:#6b7280}

/* ---------- REGISTRO / OLVIDÉ (estilo gris) ---------- */
.gv .la-card{max-width:600px;border-radius:11px;padding:39px 38px 44px}
.gv .la-logo{height:75px}
.gv .la-h{font-size:28.8px;line-height:34px;margin-top:39px}
.gv .la-sub{font-size:18.7px;line-height:29px;margin-top:9px}
.gv .la-ic{left:17px}
.gv .la-in{height:56px;border-radius:9px;padding:0 48px 0 46px;font-size:18.7px}
.gv .la-eye{right:14px}
.gv .la-btn{height:56px;border-radius:9px;font-size:16.3px;font-weight:600;background:#9333ea}
.gv .la-btn:hover{background:#7e22ce}
.gv .la-lb{display:block;font-size:16.4px;font-weight:600;line-height:20px;margin:29px 0 12px}
.gv .la-lb.first{margin-top:39px}
.gv .la-lb span{color:#ef4444}
.gv .la-hint{font-size:14px;line-height:17px;margin-top:9px}
.gv .la-hint + .la-lb{margin-top:31px}
.gv .la-foot{text-align:center;font-size:16.7px;line-height:22px;margin-top:29px}
.gv .la-foot .la-link{font-size:16.7px;font-weight:600;color:#9333ea}
.gv .la-back{display:flex;align-items:center;justify-content:center;gap:6px;margin:30px auto 0;font-size:16.5px;font-weight:500}
.gv .la-copy{font-size:15.5px;margin:40px 0 20px;text-align:center}
.gv.reg .la-card{padding-bottom:41px}
.gv.reg .la-btn{margin-top:28px}
.gv.fp{padding-bottom:43px}
.gv.fp .la-field{margin-top:38px}
.gv.fp .la-btn{margin-top:29px}
/* gris oscuro */
html.dark .gv{background:#111827;color:#fff}
html.dark .gv .la-toggle{background:#1f2937;border:1px solid #1f2937;color:#e5e7eb}
html.dark .gv .la-card{background:#1f2937;border:1px solid #374151}
html.dark .gv .la-sub{color:#d1d5db}
html.dark .gv .la-lb{color:#e5e7eb}
html.dark .gv .la-ic,html.dark .gv .la-eye{color:#9ca3af}
html.dark .gv .la-in{background:#374151;border:1px solid #4b5563;color:#fff;color-scheme:dark}
html.dark .gv .la-in::placeholder{color:#9ca3af}
html.dark .gv .la-in:focus{border-color:#a855f7;box-shadow:0 0 0 2px #a855f7}
html.dark .gv .la-in:-webkit-autofill{-webkit-box-shadow:0 0 0 100px #374151 inset;-webkit-text-fill-color:#fff}
html.dark .gv .la-hint{color:#9ca3af}
html.dark .gv .la-foot{color:#e5e7eb}
html.dark .gv .la-back{color:#c084fc}
html.dark .gv .la-copy{color:#9ca3af}
/* gris claro */
html:not(.dark) .gv{background:#fff;color:#111827}
html:not(.dark) .gv .la-toggle{background:#fff;border:1px solid #e5e7eb;color:#374151}
html:not(.dark) .gv .la-card{background:#fff;border:1px solid #f1f1f3;box-shadow:0 10px 25px -5px rgba(17,24,39,.1),0 4px 8px -4px rgba(17,24,39,.06)}
html:not(.dark) .gv .la-h{color:#111827}
html:not(.dark) .gv .la-sub{color:#4b5563}
html:not(.dark) .gv .la-lb{color:#374151}
html:not(.dark) .gv .la-ic,html:not(.dark) .gv .la-eye{color:#9ca3af}
html:not(.dark) .gv .la-in{background:#fff;border:1px solid #e5e7eb;color:#111827}
html:not(.dark) .gv .la-in::placeholder{color:#9ca3af}
html:not(.dark) .gv .la-in:focus{border-color:#a855f7;box-shadow:0 0 0 2px #a855f7}
html:not(.dark) .gv .la-hint{color:#6b7280}
html:not(.dark) .gv .la-foot{color:#374151}
html:not(.dark) .gv .la-back{color:#9333ea}
html:not(.dark) .gv .la-copy{color:#6b7280}
@media(max-width:560px){.lv .la-card,.gv .la-card{padding-left:22px;padding-right:22px}}
`

function useTheme() {
  const [theme, setTheme] = useStore('theme', 'dark')
  useEffect(() => { document.documentElement.className = theme }, [theme])
  return [theme, () => setTheme(t => t === 'dark' ? 'light' : 'dark')]
}

function Field({ icon, type = 'text', value, onChange, placeholder, eye, onEye, first, iconSize }) {
  return <div className={'la-field' + (first ? ' first' : '')}>
    <span className="la-ic">{icon}</span>
    <input className="la-in" type={type} value={value} onChange={onChange} placeholder={placeholder} />
    {onEye && <button type="button" className="la-eye" onClick={onEye} aria-label="Mostrar senha">{eye ? <EyeOff size={iconSize} /> : <Eye size={iconSize} />}</button>}
  </div>
}

export default function Auth({ onAuth }) {
  const [theme, toggle] = useTheme()
  const toast = useToast()
  const [view, setView] = useState('login')
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('')
  const [name, setName] = useState(''); const [wa, setWa] = useState(''); const [remember, setRemember] = useState(false)
  const [showPw, setShowPw] = useState(false); const [showPw2, setShowPw2] = useState(false)
  const go = v => { setView(v); setShowPw(false); setShowPw2(false) }

  const login = e => { e.preventDefault(); if (!email || !pw) return toast('Informe e-mail e senha', 'err'); onAuth(name || email) }
  const register = e => {
    e.preventDefault()
    if (!name || !email || !pw) return toast('Preencha os campos obrigatórios', 'err')
    if (pw.length < 6) return toast('A senha deve ter pelo menos 6 caracteres', 'err')
    if (pw !== pw2) return toast('As senhas não coincidem', 'err')
    onAuth(name)
  }
  const recover = e => { e.preventDefault(); if (!email) return toast('Digite seu e-mail', 'err'); toast('Instruções enviadas para seu e-mail'); go('login') }

  const logo = theme === 'dark' ? '/leona-white.png' : '/leona-color.png'
  const isLogin = view === 'login'
  const cls = isLogin ? 'lv' : view === 'register' ? 'gv reg' : 'gv fp'
  const is = isLogin ? 17 : 18

  return <div className={'la-page ' + cls + (view === 'register' ? ' top' : '')}>
    <style>{CSS}</style>
    {view !== 'forgot' && <button className="la-toggle" onClick={toggle} title="Tema" aria-label="Cambiar tema">{theme === 'dark' ? <Sun size={isLogin ? 18 : 17} /> : <Moon size={17} />}</button>}

    <form className="la-card" onSubmit={isLogin ? login : view === 'register' ? register : recover} noValidate>
      <img className="la-logo" src={logo} alt="Leona" />

      {isLogin && <>
        <h1 className="la-h">Bem-vindo!</h1>
        <p className="la-sub">Informe suas credenciais para entrar</p>
        <Field first iconSize={is} icon={<Mail size={is} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu e-mail" />
        <Field iconSize={is} icon={<Lock size={is} />} type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Digite sua senha" eye={showPw} onEye={() => setShowPw(!showPw)} />
        <div className="la-row">
          <label><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />Lembrar-me</label>
          <button type="button" className="la-link" onClick={() => go('forgot')}>Esqueci minha senha</button>
        </div>
        <button className="la-btn" type="submit">Entrar</button>
        <div className="la-div" />
        <p className="la-foot">É novo por aqui? <button type="button" className="la-link" onClick={() => go('register')}>Crie uma conta agora</button></p>
      </>}

      {view === 'register' && <>
        <h1 className="la-h">Crie sua conta</h1>
        <p className="la-sub">Preencha os dados abaixo para começar</p>
        <label className="la-lb first">Nome completo <span>*</span></label>
        <Field iconSize={is} icon={<User size={is} />} value={name} onChange={e => setName(e.target.value)} placeholder="Digite seu nome completo" />
        <label className="la-lb">E-mail <span>*</span></label>
        <Field iconSize={is} icon={<Mail size={is} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu e-mail" />
        <label className="la-lb">WhatsApp Pessoal</label>
        <Field iconSize={is} icon={<Phone size={is} />} value={wa} onChange={e => setWa(e.target.value)} placeholder="Ex: 5511999999999" />
        <div className="la-hint">Número pessoal (não utilizado nas automações)</div>
        <label className="la-lb">Senha <span>*</span></label>
        <Field iconSize={is} icon={<Lock size={is} />} type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Digite sua senha (mínimo 6 caracteres)" eye={showPw} onEye={() => setShowPw(!showPw)} />
        <div className="la-hint">A senha deve ter pelo menos 6 caracteres</div>
        <label className="la-lb">Confirmar senha <span>*</span></label>
        <Field iconSize={is} icon={<Lock size={is} />} type={showPw2 ? 'text' : 'password'} value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Confirme sua senha" eye={showPw2} onEye={() => setShowPw2(!showPw2)} />
        <button className="la-btn" type="submit">Criar conta</button>
        <p className="la-foot">Já tem uma conta? <button type="button" className="la-link" onClick={() => go('login')}>Faça login</button></p>
      </>}

      {view === 'forgot' && <>
        <h1 className="la-h">Esqueceu sua senha?</h1>
        <p className="la-sub">Digite seu email e enviaremos instruções para redefinir sua senha</p>
        <Field iconSize={is} icon={<Mail size={is} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu e-mail" />
        <button className="la-btn" type="submit">Enviar instruções</button>
        <button type="button" className="la-link la-back" onClick={() => go('login')}><ArrowLeft size={16} />Voltar para o login</button>
      </>}
    </form>

    {isLogin && <div className="la-copy">© 2026 Leona Flow. Todos os direitos reservados.</div>}
    {view === 'register' && <div className="la-copy">© 2025 Leona AI. Todos os direitos reservados.</div>}
  </div>
}
