import { useState, useEffect } from 'react'
import { Plus, CircleHelp, Play, Pause, Trash2, CreditCard } from 'lucide-react'
import { useStore, useToast, uid, nowStr } from '../ui'
import { LModal, LSelect } from './leona'
import { SendIcon } from '../icons'

const Globe = () => <span style={{ fontSize: 13 }}>🌎</span>

export default function Mass() {
  const toast = useToast()
  const [list, setList] = useStore('mass', []); const [flows] = useStore('flows', []); const [contacts] = useStore('contacts', [])
  const [quota] = useStore('mass_quota', 0); const [extra, setExtra] = useStore('mass_extra', 0)
  const [form, setForm] = useState(null); const [buy, setBuy] = useState(null)
  useEffect(() => {
    if (!list.some(m => m.status === 'running')) return
    const t = setInterval(() => setList(l => l.map(m => m.status !== 'running' ? m : m.sent + 1 >= m.total ? { ...m, sent: m.total, status: 'done' } : { ...m, sent: m.sent + Math.max(1, Math.ceil(m.total / 20)) })), 500)
    return () => clearInterval(t)
  }, [list, setList])
  const used = list.reduce((a, m) => a + m.sent, 0)
  const left = Math.max(0, quota + extra - used)
  const open = () => setForm({ name: '', flow: '', total: String(contacts.length || '') })
  const start = () => {
    if (!form.name.trim() || !form.flow) return toast('Complete el nombre y el flujo', 'err')
    const total = Math.max(1, +form.total || contacts.length || 0)
    if (total > left) return toast(`No tiene envíos suficientes: quedan ${left}. Compre envíos extra.`, 'err')
    setList(l => [{ ...form, id: uid(), total, sent: 0, status: 'running', created: nowStr() }, ...l]); setForm(null); toast('Envío masivo iniciado')
  }
  const k = [['RESTANTES', left, true], [<>{used} <i style={{ fontSize: 13, fontWeight: 400, fontStyle: 'normal', color: '#94a3b8' }}>/ {quota + extra}</i></>, 'USADOS EN EL CICLO'], [list.filter(m => m.status === 'running').length, 'EN CURSO'], [list.filter(m => m.status === 'done').length, 'COMPLETADOS']]
  return <div className="lp" style={{ paddingTop: 22 }}>
    <div className="lp-hd"><SendIcon size={22} strokeWidth={1.9} style={{ marginLeft: 3, marginTop: 13 }} />
      <div><h1 style={{ fontSize: 19.5 }}>Envíos masivos</h1><p style={{ marginTop: 6 }}>Envíe un flujo a muchos contactos a la vez, con cuota por ciclo de suscripción.</p></div>
      <div className="r" style={{ marginTop: 6 }}><button className="ms-dim" onClick={open}><Plus size={15} />Nuevo envío masivo</button></div></div>
    <div className="kb-stats" style={{ gap: 8, marginTop: 23 }}>
      <div className="kb-st"><b>{left}</b><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>RESTANTES <CircleHelp size={13} /></span></div>
      {k.slice(1).map(([v, l]) => <div key={l} className="kb-st"><b>{v}</b><span>{l}</span></div>)}
    </div>
    <div className="ms-buy">
      <h3>Comprar envíos extra</h3><div className="sd">Paquete cerrado. Entra en el saldo extra y no cambia la cuota gratis del mes.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 13 }}>
        {[[1000, '29.90'], [10000, '90.00']].map(([n, p]) => <div key={n} className="ms-pk"><b>{n.toLocaleString('en-US')} envíos extra</b><div className="pr">BRL {p}</div>
          <div className="bt"><button className="ms-b1" onClick={() => setBuy({ n, p, m: 'pix' })}><small>BR</small>Pix o tarjeta</button><button className="ms-b2" onClick={() => setBuy({ n, p, m: 'paddle' })}><Globe />Paddle (internacional)</button></div></div>)}
      </div>
      <div className="sd" style={{ marginTop: 18, color: '#94a3b8', opacity: 1 }}>Lo que sobre sigue el mes que viene. Lo que ya se usó no vuelve.</div>
    </div>
    {list.length === 0 ? <div className="ms-empty"><SendIcon size={48} strokeWidth={1.9} className="big" /><h3>Aún no hay envíos masivos</h3><p>Cree el primer envío masivo para disparar un flujo a muchos contactos a la vez.</p>
      <button className="ms-dim" style={{ marginTop: 23 }} onClick={open}><Plus size={15} />Nuevo envío masivo</button></div>
      : <div className="lp-card" style={{ marginTop: 19, flex: 'none' }}>{list.map(m => <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
        <span className="wh-ib" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,90,227,.15)', color: '#005ae3' }}><SendIcon size={16} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><b style={{ fontSize: 13.5 }}>{m.name}</b>
            <span className="fl-bd" style={m.status === 'done' ? { color: '#22c55e', background: 'rgba(34,197,94,.1)', borderColor: 'rgba(34,197,94,.35)' } : m.status === 'paused' ? { color: '#f59e0b', background: 'rgba(245,158,11,.1)', borderColor: 'rgba(245,158,11,.4)' } : { color: '#4d94ff', background: 'rgba(0,90,227,.1)', borderColor: 'rgba(0,90,227,.4)' }}><i />{m.status === 'done' ? 'COMPLETADO' : m.status === 'paused' ? 'PAUSADO' : 'EN CURSO'}</span></div>
          <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>{flows.find(f => f.id === m.flow)?.name || 'Flujo eliminado'} · {m.created}</div>
          <div className="bl-bar" style={{ height: 5, marginTop: 8 }}><div style={{ width: m.sent / m.total * 100 + '%', height: '100%', background: 'var(--p)', transition: 'width .4s' }} /></div></div>
        <b style={{ fontSize: 12.5, width: 80, textAlign: 'right' }}>{m.sent}/{m.total}</b>
        {m.status !== 'done' && <button className="ch-ib" onClick={() => setList(l => l.map(x => x.id === m.id ? { ...x, status: x.status === 'paused' ? 'running' : 'paused' } : x))}>{m.status === 'paused' ? <Play size={15} /> : <Pause size={15} />}</button>}
        <button className="ch-ib" onClick={() => setList(l => l.filter(x => x.id !== m.id))}><Trash2 size={15} color="#ef4444" /></button>
      </div>)}</div>}

    <LModal open={!!form} onClose={() => setForm(null)} title="Nuevo envío masivo" desc={`Envíos disponibles: ${left}`} icon={<SendIcon size={19} />} bodyStyle={{ overflow: 'visible' }}
      footer={<><button className="lb2 g" onClick={() => setForm(null)}>Cancelar</button><button className="lb2 p" onClick={start}>Iniciar envío</button></>}>
      {form && <>
        <label className="l-lbl">Nombre de la campaña</label><input className="l-in ct-in" autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej.: Promo fin de mes" />
        <label className="l-lbl" style={{ marginTop: 16 }}>Flujo</label><LSelect className="l-in ct-in" value={form.flow} onChange={v => setForm({ ...form, flow: v })} placeholder="Seleccione un flujo" options={flows.map(f => ({ value: f.id, label: f.name }))} />
        <label className="l-lbl" style={{ marginTop: 16 }}>Destinatarios</label><input className="l-in ct-in" type="number" min="1" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} placeholder={String(contacts.length)} />
        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>{contacts.length} contactos guardados.</div>
      </>}
    </LModal>
    <LModal open={!!buy} onClose={() => setBuy(null)} title="Comprar envíos extra" icon={<CreditCard size={19} />}
      footer={<><button className="lb2 g" onClick={() => setBuy(null)}>Cancelar</button><button className="lb2 p" onClick={() => { setExtra(x => x + buy.n); setBuy(null); toast(`${buy.n.toLocaleString('es-PE')} envíos extra agregados`) }}>Ir para o pagamento</button></>}>
      {buy && <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--soft)' }}>Va a comprar <b style={{ color: 'var(--text)' }}>{buy.n.toLocaleString('en-US')} envíos extra</b> por <b style={{ color: 'var(--text)' }}>BRL {buy.p}</b> con {buy.m === 'pix' ? 'Pix o tarjeta' : 'Paddle (internacional)'}.</p>}
    </LModal>
  </div>
}
