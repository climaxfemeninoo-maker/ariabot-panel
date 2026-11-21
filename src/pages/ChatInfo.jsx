import { useState } from 'react'
import { Info, Clock, Timer, Workflow, Megaphone, Brain, DollarSign, CirclePlus, ReceiptText, StickyNote, ChevronDown, Pencil, Check, X, Trash2, Ban, Pause, Play, Power, RotateCcw, UserCheck, User, Phone, Mail, MessageCircle, Plus } from 'lucide-react'
import { useStore, useToast, uid } from '../ui'
import { LSelect } from './leona'

const COLORS = ['#005ae3', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444']
const CURS = ['PEN', 'USD', 'MXN', 'COP', 'CLP', 'ARS', 'BRL', 'EUR']
const fmtDate = ts => { const d = new Date(ts); return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '') + ', ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false }) }
const dur = ts => { const m = Math.max(1, Math.floor((Date.now() - ts) / 6e4)); const d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60; return d ? `${d}d ${h}h` : h ? `${h}h ${mm}m` : `${mm}m` }
const n2 = v => Number(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

/* Botones de la cabecera del chat: Bloquear · Pausar · Finalizar */
export function ChatActions({ c, upd, move, compact }) {
  const toast = useToast()
  return <div className={'ci-acts' + (compact ? ' sm' : '')}>
    {c.status === 'espera' && <button className="ci-ab at" onClick={() => move('atencion', 'Chat asignado a ti')}><UserCheck size={15} />{!compact && 'Atender'}</button>}
    <button className={'ci-ab bl' + (c.blocked ? ' on' : '')} onClick={() => { upd(x => ({ ...x, blocked: !x.blocked })); toast(c.blocked ? 'Contacto desbloqueado' : 'Contacto bloqueado', 'info') }}><Ban size={15} />{!compact && (c.blocked ? 'Desbloquear' : 'Bloquear')}</button>
    {c.status !== 'resueltos' && <button className={'ci-ab pa' + (c.paused ? ' on' : '')} onClick={() => { upd(x => ({ ...x, paused: !x.paused })); toast(c.paused ? 'Automatización reanudada' : 'Automatización pausada en este chat', 'info') }}>{c.paused ? <Play size={15} /> : <Pause size={15} />}{!compact && (c.paused ? 'Reanudar' : 'Pausar')}</button>}
    {c.status !== 'resueltos' ? <button className="ci-ab fi" onClick={() => move('resueltos', 'Chat finalizado')}><Power size={15} />{!compact && 'Finalizar'}</button>
      : <button className="ci-ab at" onClick={() => move('espera', 'Chat reabierto')}><RotateCcw size={15} />{!compact && 'Reabrir'}</button>}
  </div>
}

function Sec({ icon, title, children, open: o = true, right }) {
  const [open, setOpen] = useState(o)
  return <div className="ci-sec">
    <button className="ci-sh" onClick={() => setOpen(!open)}>{icon}<b>{title}</b>{right}<ChevronDown size={16} className={'ci-cv' + (open ? ' up' : '')} /></button>
    {open && <div className="ci-sb">{children}</div>}
  </div>
}

/* Panel derecho del chat */
export function ChatInfo({ c, upd, onClose }) {
  const toast = useToast()
  const [, setSales] = useStore('sales', [])
  const [flows] = useStore('flows', [])
  const [ed, setEd] = useState(null)
  const [form, setForm] = useState(null)
  const [note, setNote] = useState('')
  const created = c.created || c.msgs?.[0]?.ts || c.last || Date.now()
  const flow = c.flow || flows.find(f => f.status === 'activo')?.name
  const pays = c.sales || []
  const total = pays.reduce((a, p) => a + (+p.value || 0), 0)
  const imgs = (c.msgs || []).filter(m => m.img)
  const save = () => {
    const v = parseFloat(String(form.value).replace(',', '.'))
    if (!(v > 0)) return toast('Ingresa un monto válido', 'err')
    const p = { id: uid(), value: v, cur: form.cur, method: form.method.trim(), op: form.op.trim(), proof: form.proof || '', ts: Date.now(), chat: c.id, name: c.name }
    upd(x => ({ ...x, sales: [...(x.sales || []), p] }))
    setSales(s => [...(Array.isArray(s) ? s : []), { ...p, date: new Date().toISOString(), source: 'manual' }])
    setForm(null); toast('Venta registrada y enviada a Meta')
  }
  return <aside className="ci">
    {onClose && <button className="ci-x" onClick={onClose}><X size={18} /></button>}
    <div className="ci-hd">
      <span className="ci-av" style={{ background: COLORS[c.name.length % 6] }}>{c.name[0]?.toUpperCase()}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="ci-nm"><b>{c.name}</b><button title="Editar contacto" onClick={() => setEd({ name: c.name, phone: (c.phone || '').replace(/[^\d]/g, ''), email: c.email || '', conn: c.conn || '', extra: c.extra || [] })}><Pencil size={14} /></button></div>
        <div className="ci-ph">{(c.phone || '').replace(/[^\d]/g, '')}</div>
        {(c.blocked || c.paused) && <div className="ci-flags">{c.blocked && <span className="r"><Ban size={11} />Bloqueado</span>}{c.paused && <span className="o"><Pause size={11} />Automatización pausada</span>}</div>}
      </div>
    </div>

    <Sec icon={<Info size={15} className="ci-ic" />} title="Info Ticket">
      <div className="ci-g2">
        <div className="ci-box"><Clock size={14} /><div><small>Creado</small><b className="nw">{fmtDate(created)}</b></div></div>
        <div className="ci-box"><Timer size={14} /><div><small>Duración</small><b>{dur(created)}</b></div></div>
      </div>
      <div className="ci-box"><Workflow size={15} /><div><small>Flujo</small><b>{flow ? flow.toUpperCase() : 'Sin flujo asignado'}</b></div></div>
      <div className="ci-box"><span className="ci-emo">📢</span><div><small>Origen</small><b>{c.origin ? <>Anuncio: <a href={c.origin} target="_blank" rel="noreferrer">{c.origin.replace(/^https?:\/\//, '')}</a></> : 'Mensaje directo'}</b></div></div>
    </Sec>

    <Sec icon={<Brain size={15} className="ci-ic" />} title="Memoria IA">
      <div className="ci-mem">
        <div className="ci-mt"><DollarSign size={16} />DATOS DE VENTA</div>
        <div className="ci-tot"><div><small>TOTAL CONFIRMADO</small><span>{pays.length} pago{pays.length !== 1 ? 's' : ''} registrado{pays.length !== 1 ? 's' : ''}</span></div><b>{n2(total)}</b></div>
        {form ? <div className="ci-form">
          <b>Registrar venta manual</b>
          <p>Ingresa el monto real. Se sumará a tus métricas y se enviará a Meta.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="ci-fl" style={{ flex: 1, minWidth: 0 }}><label className="ci-lb">Monto real</label><input autoFocus inputMode="decimal" className="ci-in" value={form.value} onChange={e => setForm({ ...form, value: e.target.value.replace(/[^\d.,]/g, '') })} placeholder="0.00" /></div>
            <div className="ci-fl" style={{ width: 88 }}><label className="ci-lb">Moneda</label><LSelect className="l-in ct-in" value={form.cur} onChange={v => setForm({ ...form, cur: v })} options={CURS.map(x => ({ value: x, label: x }))} /></div>
          </div>
          <div><label className="ci-lb">Método de pago</label><input className="ci-in" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} placeholder="Yape, Plin, transferencia…" />
            <div className="ci-chips">{['Yape', 'Plin', 'Transferencia', 'Efectivo', 'Tarjeta'].map(m => <button key={m} className={form.method === m ? 'on' : ''} onClick={() => setForm({ ...form, method: m })}>{m}</button>)}</div></div>
          <div className="ci-fa"><button onClick={() => setForm(null)}>Cancelar</button><button className="go" onClick={save}><span className="fb">f</span>Registrar y enviar a Meta</button></div>
        </div> : <button className="ci-reg" onClick={() => setForm({ value: '', cur: 'PEN', method: '', op: '', proof: '' })}><CirclePlus size={17} />Registrar venta manual</button>}
        {pays.length ? <div className="ci-pays">{pays.slice().reverse().map(p => <div key={p.id} className="ci-pay">
          <ReceiptText size={15} /><div style={{ flex: 1, minWidth: 0 }}><b>{p.cur} {n2(p.value)}</b><small>{[p.method, p.op && '#' + p.op, fmtDate(p.ts)].filter(Boolean).join(' · ')}</small></div>
          <button title="Eliminar" onClick={() => { upd(x => ({ ...x, sales: x.sales.filter(y => y.id !== p.id) })); setSales(s => (Array.isArray(s) ? s : []).filter(y => y.id !== p.id)); toast('Pago eliminado', 'info') }}><Trash2 size={13} /></button></div>)}</div>
          : !form && <div className="ci-none"><ReceiptText size={18} />No hay pagos activos en este chat.</div>}
      </div>
    </Sec>

    <Sec icon={<StickyNote size={15} className="ci-ic" />} title={`Notas (${(c.notes || []).length})`}>
      <textarea className="ci-note" value={note} onChange={e => setNote(e.target.value)} placeholder="Agregar nota..." onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && note.trim()) { e.preventDefault(); upd(x => ({ ...x, notes: [{ id: uid(), x: note.trim(), ts: Date.now() }, ...(x.notes || [])] })); setNote('') } }} />
      {note.trim() && <button className="ci-addn" onClick={() => { upd(x => ({ ...x, notes: [{ id: uid(), x: note.trim(), ts: Date.now() }, ...(x.notes || [])] })); setNote(''); toast('Nota agregada') }}>+ Agregar nota</button>}
      {(c.notes || []).length ? (c.notes || []).map(n => <div key={n.id} className="ci-nt"><p>{n.x}</p><div><small>{fmtDate(n.ts)} · Pablo Monja</small><button onClick={() => upd(x => ({ ...x, notes: x.notes.filter(y => y.id !== n.id) }))}><Trash2 size={12} /></button></div></div>)
        : <div className="ci-empty">Sin notas registradas</div>}
    </Sec>
    {ed && <ContactEdit v={ed} onClose={() => setEd(null)} onSave={v => { upd(x => ({ ...x, name: v.name.trim(), phone: '+' + v.phone, email: v.email, conn: v.conn, extra: v.extra.filter(f => f.k.trim()) })); setEd(null); toast('Contacto actualizado') }} />}
  </aside>
}

function ContactEdit({ v: init, onClose, onSave }) {
  const [v, setV] = useState(init); const [conns] = useStore('wa_conns', [])
  const set = p => setV(x => ({ ...x, ...p }))
  const ok = v.name.trim() && v.phone.replace(/\D/g, '').length >= 8
  return <div className="lm-ov" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="lm ce">
    <div className="ce-h"><Pencil size={19} /><b>Editar contacto</b><button onClick={onClose}><X size={19} /></button></div>
    <div className="ce-b">
      <p className="ce-d">Agrega o edita la información de contacto. El número debe incluir el código de país sin el signo +.</p>
      <label className="ce-l"><span className="ic" style={{ '--k': '#8b5cf6' }}><User size={14} /></span>Nombre</label>
      <input className="ce-in" autoFocus value={v.name} onChange={e => set({ name: e.target.value })} placeholder="Nombre del contacto" />
      <label className="ce-l"><span className="ic" style={{ '--k': '#22c55e' }}><Phone size={14} /></span>Número de WhatsApp</label>
      <input className="ce-in" inputMode="numeric" value={v.phone} onChange={e => set({ phone: e.target.value.replace(/\D/g, '') })} placeholder="51999999999" />
      {v.phone && v.phone.length < 8 && <small className="ce-err">El número debe tener al menos 8 dígitos con el código de país.</small>}
      <label className="ce-l"><span className="ic" style={{ '--k': '#3b82f6' }}><Mail size={14} /></span>Email</label>
      <input className="ce-in" type="email" value={v.email} onChange={e => set({ email: e.target.value })} placeholder="correo@ejemplo.com" />
      <label className="ce-l"><span className="ic" style={{ '--k': '#22c55e' }}><MessageCircle size={14} /></span>Conexión origen</label>
      <LSelect className="l-in ct-in ce-in" value={v.conn} onChange={x => set({ conn: x })} placeholder="Sin conexión" options={[{ value: '', label: 'Sin conexión' }, ...(Array.isArray(conns) ? conns : []).filter(x => !x.archived).map(x => ({ value: x.id, label: x.name + (x.phone ? ' · ' + x.phone : '') }))]} />
      <label className="ce-l"><span className="ic" style={{ '--k': '#f59e0b' }}><Plus size={14} /></span>Información adicional</label>
      {v.extra.map((f, i) => <div key={i} className="ce-kv"><input className="ce-in" value={f.k} onChange={e => set({ extra: v.extra.map((y, j) => j === i ? { ...y, k: e.target.value } : y) })} placeholder="Nombre del campo" />
        <input className="ce-in" value={f.v} onChange={e => set({ extra: v.extra.map((y, j) => j === i ? { ...y, v: e.target.value } : y) })} placeholder="Valor" />
        <button title="Quitar" onClick={() => set({ extra: v.extra.filter((_, j) => j !== i) })}><Trash2 size={17} /></button></div>)}
      <button className="ce-add" onClick={() => set({ extra: [...v.extra, { k: '', v: '' }] })}>+ Agregar información</button>
    </div>
    <div className="ce-f"><button className="ce-c" onClick={onClose}>Cancelar</button><button className="ce-s" disabled={!ok} onClick={() => onSave(v)}>Guardar</button></div>
  </div></div>
}
