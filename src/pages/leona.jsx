import { useEffect, useRef, useState } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { useOutside } from '../ui'

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
  const [open, setOpen] = useState(false); const ref = useRef(); useOutside(ref, () => setOpen(false))
  const cur = options.find(o => o.value === value)
  return <div className="l-sel" ref={ref} style={style}>
    <button type="button" disabled={disabled} className={className + ' l-selb' + (open ? ' open' : '')} style={{ fontWeight: bold ? 600 : 400, color: cur ? (bold ? 'var(--text)' : 'var(--soft)') : '#94a3b8', borderColor: open ? 'var(--p)' : undefined }} onClick={() => setOpen(!open)}>
      {cur?.dot && <span style={{ width: 9, height: 9, borderRadius: '50%', background: cur.dot }} />}
      {renderVal && cur ? renderVal(cur) : <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur ? cur.label : placeholder}</span>}
      <ChevronDown size={15} className="chev" />
    </button>
    {open && <div className="l-selm">
      {options.length === 0 && <div className="l-opt" style={{ color: '#94a3b8', fontWeight: 500 }}>Sin opciones</div>}
      {options.map(o => <button type="button" key={o.value} className={'l-opt' + (o.value === value ? ' on' : '')} onClick={() => { onChange(o.value); setOpen(false) }}>
        {o.dot && <span style={{ width: 12, height: 12, borderRadius: '50%', background: o.dot, flexShrink: 0 }} />}
        {renderOpt ? renderOpt(o) : o.label}{o.value === value && <Check size={15} style={{ marginLeft: 'auto' }} />}
      </button>)}
    </div>}
  </div>
}

export const Toggle = ({ on, onChange }) => <button type="button" className={'l-tg' + (on ? ' on' : '')} onClick={() => onChange(!on)} />
