import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { X, ChevronDown, Check, CheckCircle2, AlertCircle, Info, Bot, CircleCheck, CircleX } from 'lucide-react'

/* ---------- persistent store ---------- */
const listeners = new Set()
export function load(key, def) {
  try { const v = localStorage.getItem('aria_' + key); if (v) return JSON.parse(v); localStorage.setItem('aria_' + key, JSON.stringify(def)); return def } catch { return def }
}
const cache = {}
export function useStore(key, def) {
  const [v, setV] = useState(() => key in cache ? cache[key] : (cache[key] = load(key, typeof def === 'function' ? def() : def)))
  useEffect(() => {
    const fn = (k, val) => { if (k === key) setV(val) }
    listeners.add(fn); return () => listeners.delete(fn)
  }, [key])
  const set = useCallback(upd => {
    const prev = key in cache ? cache[key] : load(key, typeof def === 'function' ? def() : def)
    const next = typeof upd === 'function' ? upd(prev) : upd
    cache[key] = next
    try { localStorage.setItem('aria_' + key, JSON.stringify(next)) } catch {}
    listeners.forEach(l => l(key, next))
  }, [key])
  return [v, set]
}
export const uid = () => Math.random().toString(36).slice(2, 9)
export const nowStr = () => new Date().toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
export const money = (n, cur = 'PEN') => `${cur} ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',')}`

export function downloadCSV(name, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = name; a.click()
}

/* ---------- toasts ---------- */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }) {
  const [list, setList] = useState([])
  const push = useCallback((msg, type = 'ok') => {
    const id = uid(); setList(l => [...l, { id, msg, type }])
    setTimeout(() => setList(l => l.filter(t => t.id !== id)), 4000)
  }, [])
  const close = id => setList(l => l.filter(t => t.id !== id))
  return <ToastCtx.Provider value={push}>{children}
    <div className="toasts">{list.map(t => <div key={t.id} role="status" className={'toast ' + t.type}>
      {t.type === 'ok' ? <CircleCheck size={21} color="#16a34a" strokeWidth={1.9} /> : t.type === 'err' ? <CircleX size={21} color="#dc2626" strokeWidth={1.9} /> : <Info size={21} color="#004fc7" strokeWidth={1.9} />}<span className="tx">{t.msg}</span><button className="x" aria-label="Cerrar" onClick={() => close(t.id)}><X size={16} /></button></div>)}</div>
  </ToastCtx.Provider>
}

/* ---------- modal ---------- */
export function Modal({ open, onClose, title, sub, icon, children, footer, lg }) {
  useEffect(() => {
    if (!open) return
    const k = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className={'modal' + (lg ? ' lg' : '')}>
      <div className="modal-h">{icon && <div style={{ color: 'var(--p)', marginTop: 2 }}>{icon}</div>}
        <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
        <button className="icon-btn x" onClick={onClose}><X size={16} /></button></div>
      <div className="modal-b">{children}</div>
      {footer && <div className="modal-f">{footer}</div>}
    </div></div>
}

export function Confirm({ open, onClose, onOk, title = '¿Eliminar?', text = 'Esta acción no se puede deshacer.', ok = 'Eliminar' }) {
  return <Modal open={open} onClose={onClose} title={title} icon={<AlertCircle size={18} color="#ef4444" />}
    footer={<><button className="btn btn-g" onClick={onClose}>Cancelar</button><button className="btn btn-d" onClick={() => { onOk(); onClose() }}>{ok}</button></>}>
    <p className="muted" style={{ fontSize: 12.5 }}>{text}</p></Modal>
}

/* ---------- dropdown ---------- */
export function useOutside(ref, fn) {
  useEffect(() => {
    const h = e => ref.current && !ref.current.contains(e.target) && fn()
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [ref, fn])
}
export function Select({ value, options, onChange, prefix, right, width }) {
  const [open, setOpen] = useState(false); const r = useRef()
  useOutside(r, () => setOpen(false))
  const cur = options.find(o => (o.value ?? o) === value)
  return <div className={'dd' + (open ? ' open' : '')} ref={r}>
    <button className="dd-btn" style={{ minWidth: width }} onClick={() => setOpen(!open)}>{prefix}<span>{cur?.label ?? cur}</span><ChevronDown size={13} /></button>
    {open && <div className={'dd-menu' + (right ? ' right' : '')}>{options.map(o => {
      const v = o.value ?? o; return <button key={v} className={'dd-item' + (v === value ? ' on' : '')} onClick={() => { onChange(v); setOpen(false) }}>
        {o.icon}{o.label ?? o}{v === value && <Check size={13} style={{ marginLeft: 'auto' }} />}</button>
    })}</div>}
  </div>
}
export function Menu({ trigger, items, right, up }) {
  const [open, setOpen] = useState(false); const r = useRef()
  useOutside(r, () => setOpen(false))
  return <div className="dd" ref={r} onClick={e => e.stopPropagation()}>
    <div onClick={() => setOpen(!open)}>{trigger}</div>
    {open && <div className={'dd-menu' + (right ? ' right' : '')} style={up ? { top: 'auto', bottom: 'calc(100% + 5px)' } : null}>
      {items.map((it, i) => it === '-' ? <div key={i} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} /> :
        <button key={i} className={'dd-item' + (it.danger ? ' danger' : '')} onClick={() => { it.onClick?.(); setOpen(false) }}>{it.icon}{it.label}</button>)}
    </div>}
  </div>
}

export const Switch = ({ on, onChange }) => <button className={'sw' + (on ? ' on' : '')} onClick={() => onChange(!on)} />
export const Empty = ({ icon, title, text, action }) => <div className="empty"><div className="ei">{icon}</div><h3>{title}</h3>{text && <p>{text}</p>}{action}</div>
export function PageHead({ icon, title, sub, children }) {
  return <div className="ph">{icon && <div className="ph-ic">{icon}</div>}<div><h1>{title}</h1>{sub && <p>{sub}</p>}</div><div className="actions">{children}</div></div>
}

/* ---------- brand ---------- */
export function Logo({ h = 26, light }) {
  return <svg height={h} viewBox="0 0 150 34" style={{ display: 'block' }}>
    <defs><linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#60a5fa" /><stop offset="1" stopColor="#004fc7" /></linearGradient></defs>
    <rect x="1" y="3" width="28" height="28" rx="8" fill="url(#lg1)" />
    <rect x="7" y="11" width="16" height="12" rx="4" fill="#fff" />
    <circle cx="12" cy="17" r="1.8" fill="#004fc7" /><circle cx="18" cy="17" r="1.8" fill="#004fc7" />
    <rect x="13.6" y="6" width="2.8" height="5" rx="1.4" fill="#fff" />
    <text x="36" y="25" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="20" letterSpacing="-.5" fill={light ? '#fff' : 'currentColor'}>Aria<tspan fill="#1a73f0">Bot</tspan></text>
  </svg>
}
export const BotMark = ({ size = 22 }) => <Bot size={size} />
