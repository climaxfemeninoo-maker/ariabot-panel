import { useState } from 'react'
import { Info, Clock, Timer, Workflow, Megaphone, Brain, DollarSign, CirclePlus, ReceiptText, StickyNote, ChevronDown, Pencil, Check, X, Trash2, Ban, Pause, Play, Power, RotateCcw, UserCheck } from 'lucide-react'
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
        {ed != null ? <div className="ci-ed"><input autoFocus value={ed} onChange={e => setEd(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && ed.trim()) { upd(x => ({ ...x, name: ed.trim() })); setEd(null) } if (e.key === 'Escape') setEd(null) }} />
          <button onClick={() => { if (ed.trim()) { upd(x => ({ ...x, name: ed.trim() })); toast('Nombre actualizado') } setEd(null) }}><Check size={15} /></button></div>
          : <div className="ci-nm"><b>{c.name}</b><button title="Editar nombre" onClick={() => setEd(c.name)}><Pencil size={14} /></button></div>}
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
      <div className="ci-box"><Megaphone size={14} color="#ec4899" /><div><small>Origen</small><b>{c.origin ? <>Anuncio: <a href={c.origin} target="_blank" rel="noreferrer">{c.origin.replace(/^https?:\/\//, '')}</a></> : 'Mensaje directo'}</b></div></div>
    </Sec>

    <Sec icon={<Brain size={15} className="ci-ic" />} title="Memoria IA">
      <div className="ci-mem">
        <div className="ci-mt"><DollarSign size={16} />DATOS DE VENTA</div>
        <div className="ci-tot"><div><small>TOTAL CONFIRMADO</small><span>{pays.length} pago{pays.length !== 1 ? 's' : ''} registrado{pays.length !== 1 ? 's' : ''}</span></div><b>{n2(total)}</b></div>
        {form ? <div className="ci-form">
          <b>Registrar venta manual</b>
          <p>Ingresa el monto real de la venta. Al confirmar, se registrará en las métricas y se enviará a Meta. El comprobante es opcional.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="ci-fl" style={{ flex: 1, minWidth: 0 }}><label className="ci-lb">Monto real</label><input autoFocus inputMode="decimal" className="ci-in" value={form.value} onChange={e => setForm({ ...form, value: e.target.value.replace(/[^\d.,]/g, '') })} placeholder="0.00" /></div>
            <div className="ci-fl" style={{ width: 88 }}><label className="ci-lb">Moneda</label><LSelect className="l-in ct-in" value={form.cur} onChange={v => setForm({ ...form, cur: v })} options={CURS.map(x => ({ value: x, label: x }))} /></div>
          </div>
          <div><label className="ci-lb">Método de pago</label><input className="ci-in" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} placeholder="Yape, Plin, transferencia…" /></div>
          <div><label className="ci-lb">N° de operación <i style={{ textTransform: 'none', fontStyle: 'normal', letterSpacing: 0 }}>(opcional)</i></label><input className="ci-in" value={form.op} onChange={e => setForm({ ...form, op: e.target.value })} placeholder="Ej.: 00123456" /></div>
          <div><label className="ci-lb">Comprobante <i style={{ textTransform: 'none', fontStyle: 'normal', letterSpacing: 0 }}>(opcional)</i></label><LSelect className="l-in ct-in ci-in" value={form.proof} onChange={v => setForm({ ...form, proof: v })} options={[{ value: '', label: 'Sin comprobante' }, ...imgs.map((m, i) => ({ value: m.img, label: 'Imagen ' + (i + 1) + ' · ' + m.t }))]} /></div>
          {!imgs.length && <small className="ci-hint">Puedes registrar esta venta sin adjuntar un comprobante.</small>}
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
  </aside>
}
