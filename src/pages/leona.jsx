import { useEffect, useRef, useState } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { createPortal } from 'react-dom'

/* Modal con el estilo de Leona (fondo oscuro, cabecera con borde, pie opcional con fondo) */
export function LModal({ open, onClose, title, desc, icon, width = 479, children, footer, footerBg, center, bodyStyle }) {
  useEffect(() => {
    if (!open) return
    const k = e => e.key === 'Escape' && onClose()
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return <div className="lm-ov" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="lm" style={{ maxWidth: width }}>
      <div className={'lm-h' + (desc ? '' : ' c')}>
        {icon && <span className="ic">{icon}</span>}
        <div style={{ minWidth: 0 }}><h2>{title}</h2>{desc && <p>{desc}</p>}</div>
        <button className="x" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
      </div>
      {children != null && <div className="lm-b" style={bodyStyle}>{children}</div>}
      {footer && <div className={'lm-f' + (footerBg ? ' bg' : '')} style={center ? { justifyContent: 'center' } : null}>{footer}</div>}
    </div>
  </div>
}

/* Select desplegable propio (como los menús de la referencia) */
export function LSelect({ value, onChange, options, placeholder, className = 'l-in', disabled, renderOpt, renderVal, style, bold }) {
  const [open, setOpen] = useState(false); const ref = useRef(); const mref = useRef(); const [pos, setPos] = useState(null)
  useEffect(() => { if (!open) return; const r = ref.current.getBoundingClientRect(); const h = Math.min(262, options.length * 36 + 10); const up = r.bottom + h + 8 > innerHeight && r.top > h + 8
    setPos({ left: r.left, width: r.width, ...(up ? { bottom: innerHeight - r.top + 4 } : { top: r.bottom + 4 }) })
    const out = e => { if (!ref.current?.contains(e.target) && !mref.current?.contains(e.target)) setOpen(false) }
    const sc = e => { if (!mref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', out); addEventListener('scroll', sc, true); addEventListener('resize', sc)
    return () => { document.removeEventListener('mousedown', out); removeEventListener('scroll', sc, true); removeEventListener('resize', sc) } }, [open])
  const cur = options.find(o => o.value === value)
  return <div className="l-sel" ref={ref} style={style}>
    <button type="button" disabled={disabled} className={className + ' l-selb' + (open ? ' open' : '')} style={{ fontWeight: bold ? 600 : 400, color: cur ? (bold ? 'var(--text)' : 'var(--soft)') : '#94a3b8', borderColor: open ? '#005ae3' : undefined }} onClick={() => setOpen(!open)}>
      {cur?.dot && <span style={{ width: 9, height: 9, borderRadius: '50%', background: cur.dot }} />}
      {renderVal && cur ? renderVal(cur) : <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur ? cur.label : placeholder}</span>}
      <ChevronDown size={15} className="chev" />
    </button>
    {open && pos && createPortal(<div ref={mref} className={'l-selm fx' + (document.documentElement.classList.contains('dark') ? ' dk' : '')} style={{ position: 'fixed', '--l': pos.left + 'px', '--t': pos.top != null ? pos.top + 'px' : 'auto', '--b': pos.bottom != null ? pos.bottom + 'px' : 'auto', '--mw': pos.width + 'px', zIndex: 2000 }}>
      {options.length === 0 && <div className="l-opt" style={{ color: '#94a3b8', fontWeight: 500 }}>Sin opciones</div>}
      {options.map(o => <button type="button" key={o.value} className={'l-opt' + (o.value === value ? ' on' : '')} onClick={() => { onChange(o.value); setOpen(false) }}>
        {o.dot && <span style={{ width: 12, height: 12, borderRadius: '50%', background: o.dot, flexShrink: 0 }} />}
        {renderOpt ? renderOpt(o) : o.label}{o.value === value && <Check size={15} style={{ marginLeft: 'auto' }} />}
      </button>)}
    </div>, document.body)}
  </div>
}

export const Toggle = ({ on, onChange }) => <button type="button" className={'l-tg' + (on ? ' on' : '')} onClick={() => onChange(!on)} />
