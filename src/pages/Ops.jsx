import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plug, Plus, Search, CreditCard, Trash2, RefreshCw, Power, QrCode, Webhook, Copy, Zap, Send, HelpCircle, Smartphone, ShieldCheck, Loader2, CheckCircle2, Play, Pause, Globe } from 'lucide-react'
import { useStore, Modal, Select, Empty, PageHead, useToast, uid, Confirm, Menu, nowStr } from '../ui'

export function SubInactive() {
  const nav = useNavigate()
  return <div className="card" style={{ padding: '14px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card2)' }}>
    <CreditCard size={16} className="muted" /><div><div className="bold" style={{ fontSize: 13.5, opacity: .8 }}>Suscripción inactiva</div><div className="small" style={{ marginTop: 3, opacity: .85 }}>Su suscripción está inactiva. Contrate un plan para empezar a usar el servicio.</div></div>
    <span className="sp" /><button className="btn btn-p" onClick={() => nav('/billing')}>Contratar ahora</button></div>
}

function FakeQR({ seed }) {
  const cells = []; let s = seed
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) { s = (s * 9301 + 49297) % 233280; const corner = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17); if (!corner && s / 233280 > .52) cells.push(<rect key={x + '-' + y} x={x} y={y} width="1" height="1" />) }
  const eye = (x, y) => <g key={x + 'e' + y}><rect x={x} y={y} width="7" height="7" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" /></g>
  return <svg viewBox="-1 -1 27 27" width="190" height="190" style={{ background: '#fff', borderRadius: 8, padding: 6 }} fill="#111">{cells}{eye(0, 0)}{eye(18, 0)}{eye(0, 18)}</svg>
}

export function Connections() {
  const toast = useToast()
  const [conns, setConns] = useStore('connections', [])
  const [q, setQ] = useState(''); const [st, setSt] = useState('all'); const [mod, setMod] = useState(null); const [form, setForm] = useState({ name: '', type: 'qr' }); const [del, setDel] = useState(null)
  const [step, setStep] = useState(0); const [seed, setSeed] = useState(7)
  useEffect(() => { if (step !== 1) return; const t = setTimeout(() => setStep(2), 4500); const r = setInterval(() => setSeed(s => s + 13), 1500); return () => { clearTimeout(t); clearInterval(r) } }, [step])
  const on = conns.filter(c => c.on).length
  const rows = conns.filter(c => (c.name + c.phone).toLowerCase().includes(q.toLowerCase()) && (st === 'all' || (st === 'on') === c.on))
  const finish = () => { setConns(c => [...c, { id: uid(), name: form.name, type: form.type, phone: '+51 9' + Math.floor(Math.random() * 1e8), on: true, created: nowStr() }]); setMod(null); setStep(0); setForm({ name: '', type: 'qr' }); toast('Conexión creada y conectada') }
  return <div className="page">
    <PageHead icon={<Plug size={18} />} title="Conexiones"><button className="btn btn-p" onClick={() => setMod('new')}><Plus size={14} />Nueva conexión</button></PageHead>
    <SubInactive />
    <div className="grid g2" style={{ marginBottom: 14 }}>{[['Conectadas', on, '#22c55e'], ['Desconectadas', conns.length - on, '#ef4444']].map(([l, v, c]) => <div key={l} className="card lift row" style={{ padding: '12px 16px' }}><div><div className="small" style={{ opacity: .8 }}>{l}</div><div className="bold" style={{ fontSize: 20 }}>{v}</div></div><span className="sp" /><span style={{ width: 24, height: 24, borderRadius: 6, background: c + '22', display: 'grid', placeItems: 'center' }}><span style={{ width: 8, height: 8, borderRadius: 8, background: c, boxShadow: `0 0 10px ${c}`, animation: 'pulse 2s infinite' }} /></span></div>)}</div>
    <div className="row" style={{ marginBottom: 12 }}><div className="search sp"><Search size={13} /><input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o número de instancia" /></div><Select right value={st} onChange={setSt} width={170} options={[{ value: 'all', label: 'Todos los estados' }, { value: 'on', label: 'Conectadas' }, { value: 'off', label: 'Desconectadas' }]} /></div>
    <div className="card" style={{ minHeight: 280 }}>{rows.length ? <div className="grid g3 stagger" style={{ padding: 14 }}>{rows.map(c => <div key={c.id} className="card lift" style={{ padding: 14, background: 'var(--card2)' }}>
      <div className="row"><div style={{ width: 38, height: 38, borderRadius: 10, background: '#22c55e22', color: '#22c55e', display: 'grid', placeItems: 'center' }}><Smartphone size={18} /></div><div><b>{c.name}</b><div className="small muted">{c.phone}</div></div><span className="sp" />
        <Menu right trigger={<button className="icon-btn"><RefreshCw size={13} /></button>} items={[{ icon: <Power size={13} />, label: c.on ? 'Desconectar' : 'Reconectar', onClick: () => { setConns(x => x.map(y => y.id === c.id ? { ...y, on: !y.on } : y)); toast(c.on ? 'Desconectada' : 'Reconectada', 'info') } }, '-', { icon: <Trash2 size={13} />, label: 'Eliminar', danger: true, onClick: () => setDel(c.id) }]} /></div>
      <div className="row" style={{ marginTop: 12 }}><span className={'badge ' + (c.on ? 'b-green' : 'b-red')}>● {c.on ? 'CONECTADA' : 'DESCONECTADA'}</span><span className="badge b-gray">{c.type === 'qr' ? 'QR CODE' : 'API OFICIAL'}</span></div>
      <div className="small muted" style={{ marginTop: 8 }}>Creada {c.created}</div></div>)}</div>
      : <div style={{ paddingTop: 50 }}><Empty icon={<Plug size={30} />} title="No hay conexiones" text="Cree su primera conexión para empezar" action={<button className="btn btn-p" onClick={() => setMod('new')}><Plus size={14} />Crear primera conexión</button>} /></div>}</div>
    <Modal open={mod === 'new'} onClose={() => { setMod(null); setStep(0) }} title="Nueva conexión" sub={step ? 'Escanea el código con WhatsApp' : 'Conecta un número de WhatsApp'} icon={<Plug size={18} />}
      footer={step === 0 ? <><button className="btn btn-g" onClick={() => setMod(null)}>Cancelar</button><button className="btn btn-p" disabled={!form.name} onClick={() => setStep(1)}>Continuar</button></> : step === 2 ? <button className="btn btn-p" onClick={finish}>Finalizar</button> : null}>
      {step === 0 && <><div className="field"><label className="lb">Nombre de la conexión</label><input className="input" autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="WhatsApp ventas" /></div>
        <label className="lb">Tipo</label><div className="grid g2">{[['qr', 'QR Code', 'Escanea con tu celular', QrCode], ['api', 'API Oficial', 'WhatsApp Cloud API de Meta', ShieldCheck]].map(([k, t, d, Ic]) => <div key={k} className="card lift" style={{ padding: 14, cursor: 'pointer', borderColor: form.type === k ? 'var(--p)' : undefined, boxShadow: form.type === k ? '0 0 0 3px var(--psoft)' : undefined }} onClick={() => setForm({ ...form, type: k })}><Ic size={20} color="#8b5cf6" /><div className="bold" style={{ marginTop: 8 }}>{t}</div><div className="small muted">{d}</div></div>)}</div></>}
      {step === 1 && <div style={{ textAlign: 'center' }}><div style={{ display: 'inline-block', animation: 'pop .3s' }} key={seed}><FakeQR seed={seed} /></div>
        <ol className="small muted" style={{ textAlign: 'left', margin: '14px auto 0', maxWidth: 300, lineHeight: 1.8 }}><li>Abre WhatsApp en tu celular</li><li>Toca Menú › Dispositivos vinculados</li><li>Apunta tu celular a esta pantalla</li></ol>
        <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}><Loader2 size={14} className="spin" color="#8b5cf6" /><span className="small">Esperando lectura…</span></div></div>}
      {step === 2 && <div className="empty"><CheckCircle2 size={54} color="#22c55e" style={{ animation: 'pop .4s' }} /><h3>¡Conectado!</h3><p>Tu número quedó vinculado correctamente.</p></div>}</Modal>
    <Confirm open={!!del} onClose={() => setDel(null)} onOk={() => { setConns(c => c.filter(x => x.id !== del)); toast('Conexión eliminada') }} title="Eliminar conexión" />
  </div>
}

export function Webhooks() {
  const toast = useToast()
  const [hooks, setHooks] = useStore('webhooks', []); const [flows] = useStore('flows', [])
  const [q, setQ] = useState(''); const [form, setForm] = useState(null); const [del, setDel] = useState(null)
  const used = hooks.reduce((a, h) => a + h.calls, 0)
  const save = () => { if (!form.name) return toast('Ponle un nombre', 'err'); setHooks(h => form.id ? h.map(x => x.id === form.id ? form : x) : [...h, { ...form, id: uid(), token: uid() + uid(), calls: 0, created: nowStr() }]); setForm(null); toast('Webhook guardado') }
  const url = h => `https://api.ariabot.app/hooks/${h.token}`
  return <div className="page">
    <PageHead icon={<Webhook size={18} />} title="Webhooks" sub="Administre varios webhooks, cada uno con su conexión y mapeo."><button className="btn btn-p" onClick={() => setForm({ name: '', flow: '', source: 'Hotmart', phoneField: 'buyer.phone', nameField: 'buyer.name' })}><Plus size={14} />Nuevo webhook</button></PageHead>
    <div className="row" style={{ marginBottom: 14 }}><div className="search" style={{ width: 330 }}><Search size={13} /><input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar webhook por nombre..." /></div><span className="sp" />
      <div className="card" style={{ padding: '7px 12px', background: 'var(--card2)' }}><div className="row small"><CreditCard size={13} className="muted" /><b>Consumo: {used.toLocaleString('es-PE')}</b><span className="muted">/ 30.000</span></div><div className="small muted" style={{ textAlign: 'right' }}>{(used / 300).toFixed(1)}%</div></div></div>
    <div className="card">{hooks.filter(h => h.name.toLowerCase().includes(q.toLowerCase())).length ? <div className="tbl-wrap" style={{ border: 'none' }}><table className="tbl"><thead><tr>{['Nombre', 'Origen', 'URL', 'Flujo', 'Llamadas', 'Creado', ''].map(t => <th key={t}>{t}</th>)}</tr></thead>
      <tbody>{hooks.filter(h => h.name.toLowerCase().includes(q.toLowerCase())).map(h => <tr key={h.id}><td className="bold">{h.name}</td><td><span className="badge b-violet">{h.source}</span></td>
        <td><div className="row"><code className="small muted" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{url(h)}</code><button className="icon-btn" onClick={() => { navigator.clipboard?.writeText(url(h)); toast('URL copiada') }}><Copy size={12} /></button></div></td>
        <td>{flows.find(f => f.id === h.flow)?.name || '—'}</td><td>{h.calls}</td><td className="muted">{h.created}</td>
        <td><div className="row" style={{ gap: 2 }}><button className="btn btn-g btn-sm" onClick={() => { setHooks(x => x.map(y => y.id === h.id ? { ...y, calls: y.calls + 1 } : y)); toast('Evento de prueba recibido ✓') }}><Zap size={11} />Probar</button><button className="icon-btn" onClick={() => setForm(h)}><RefreshCw size={13} /></button><button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => setDel(h.id)}><Trash2 size={13} /></button></div></td></tr>)}</tbody></table></div>
      : <Empty icon={<Webhook size={30} />} title="No hay webhooks registrados" text="Cree el primer webhook para comenzar." action={<button className="btn btn-p" onClick={() => setForm({ name: '', flow: '', source: 'Hotmart', phoneField: 'buyer.phone', nameField: 'buyer.name' })}><Plus size={14} />Crear webhook</button>} />}</div>
    <Modal lg open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Editar webhook' : 'Nuevo webhook'} sub="Recibe eventos de plataformas externas y dispara un flujo" icon={<Webhook size={18} />} footer={<><button className="btn btn-g" onClick={() => setForm(null)}>Cancelar</button><button className="btn btn-p" onClick={save}>Guardar</button></>}>
      {form && <><div className="grid g2"><div className="field"><label className="lb">Nombre</label><input className="input" autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Compra aprobada Hotmart" /></div>
        <div className="field"><label className="lb">Origen</label><select className="input" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>{['Hotmart', 'Kiwify', 'Shopify', 'Stripe', 'Mercado Pago', 'Personalizado'].map(s => <option key={s}>{s}</option>)}</select></div></div>
        <div className="field"><label className="lb">Flujo a disparar</label><select className="input" value={form.flow} onChange={e => setForm({ ...form, flow: e.target.value })}><option value="">Seleccione un flujo</option>{flows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        <label className="lb">Mapeo de campos</label><div className="grid g2"><div className="field"><span className="small muted">Teléfono</span><input className="input" value={form.phoneField} onChange={e => setForm({ ...form, phoneField: e.target.value })} /></div><div className="field"><span className="small muted">Nombre</span><input className="input" value={form.nameField} onChange={e => setForm({ ...form, nameField: e.target.value })} /></div></div></>}</Modal>
    <Confirm open={!!del} onClose={() => setDel(null)} onOk={() => { setHooks(h => h.filter(x => x.id !== del)); toast('Webhook eliminado') }} title="Eliminar webhook" />
  </div>
}

export function Mass() {
  const toast = useToast()
  const [list, setList] = useStore('mass', []); const [flows] = useStore('flows', []); const [contacts] = useStore('contacts', []); const [quota, setQuota] = useStore('massQuota', 1000)
  const [form, setForm] = useState(null); const [buy, setBuy] = useState(null)
  useEffect(() => {
    if (!list.some(m => m.status === 'running')) return
    const t = setInterval(() => setList(l => l.map(m => m.status !== 'running' ? m : m.sent + 1 >= m.total ? { ...m, sent: m.total, status: 'done' } : { ...m, sent: m.sent + Math.max(1, Math.ceil(m.total / 20)) })), 400)
    return () => clearInterval(t)
  }, [list, setList])
  const usedC = list.reduce((a, m) => a + m.sent, 0)
  const start = () => { if (!form.name || !form.flow) return toast('Completa nombre y flujo', 'err'); const total = Math.max(+form.total || contacts.length || 50, 1); if (total > quota - usedC) return toast('No tienes envíos suficientes', 'err')
    setList(l => [{ ...form, id: uid(), total, sent: 0, status: 'running', created: nowStr() }, ...l]); setForm(null); toast('Envío masivo iniciado 🚀') }
  return <div className="page">
    <PageHead icon={<Send size={18} />} title="Envíos masivos" sub="Envíe un flujo a muchos contactos a la vez, con cuota por ciclo de suscripción."><button className="btn btn-p" onClick={() => setForm({ name: '', flow: '', total: contacts.length || 50, delay: 5 })}><Plus size={14} />Nuevo envío masivo</button></PageHead>
    <div className="grid g4 stagger" style={{ marginBottom: 14 }}>{[['RESTANTES', quota - usedC, true], ['USADOS EN EL CICLO', `${usedC} / ${quota}`], ['EN CURSO', list.filter(m => m.status === 'running').length], ['COMPLETADOS', list.filter(m => m.status === 'done').length]].map(([l, v, h]) => <div key={l} className="card lift" style={{ padding: '12px 14px' }}><div className="bold" style={{ fontSize: 17 }}>{v}</div><div className="small muted row" style={{ fontSize: 9.5, letterSpacing: '.04em', marginTop: 4 }}>{l}{h && <HelpCircle size={11} />}</div></div>)}</div>
    <div className="card" style={{ padding: 16, marginBottom: 18 }}><b>Comprar envíos extra</b><div className="small muted" style={{ margin: '3px 0 12px' }}>Paquete cerrado. Entra en el saldo extra y no cambia la cuota gratis del mes.</div>
      <div className="grid g2">{[[1000, '29,90'], [10000, '90,00']].map(([n, p]) => <div key={n} className="card" style={{ padding: 14, background: 'var(--card2)' }}><div className="small bold">{n.toLocaleString('es-PE')} envíos extra</div><div className="bold" style={{ fontSize: 16, margin: '4px 0 12px' }}>PEN {p}</div>
        <div className="grid g2"><button className="btn btn-p" onClick={() => setBuy([n, p])}>Yape o tarjeta</button><button className="btn btn-g" onClick={() => setBuy([n, p])}><Globe size={13} color="#38bdf8" />Paddle (internacional)</button></div></div>)}</div>
      <div className="small muted" style={{ marginTop: 10 }}>Lo que sobre sigue el mes que viene. Lo que ya se usó no vuelve.</div></div>
    <div className="card">{list.length ? <div style={{ padding: 6 }}>{list.map(m => <div key={m.id} className="row" style={{ padding: 12, borderBottom: '1px solid var(--border)', animation: 'fadeIn .3s' }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--psoft)', color: 'var(--p)', display: 'grid', placeItems: 'center' }}><Send size={16} /></div>
      <div style={{ flex: 1 }}><div className="row"><b>{m.name}</b><span className={'badge ' + (m.status === 'done' ? 'b-green' : m.status === 'paused' ? 'b-amber' : 'b-violet')}>{m.status === 'done' ? 'COMPLETADO' : m.status === 'paused' ? 'PAUSADO' : 'EN CURSO'}</span></div>
        <div className="small muted">{flows.find(f => f.id === m.flow)?.name} · {m.created}</div><div className="progress" style={{ marginTop: 7 }}><div style={{ width: m.sent / m.total * 100 + '%' }} /></div></div>
      <div className="small bold" style={{ width: 80, textAlign: 'right' }}>{m.sent}/{m.total}</div>
      {m.status !== 'done' && <button className="icon-btn" onClick={() => setList(l => l.map(x => x.id === m.id ? { ...x, status: x.status === 'paused' ? 'running' : 'paused' } : x))}>{m.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}</button>}
      <button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => setList(l => l.filter(x => x.id !== m.id))}><Trash2 size={14} /></button></div>)}</div>
      : <Empty icon={<Send size={30} />} title="Aún no hay envíos masivos" text="Cree el primer envío masivo para disparar un flujo a muchos contactos a la vez." action={<button className="btn btn-p" onClick={() => setForm({ name: '', flow: '', total: contacts.length || 50, delay: 5 })}><Plus size={14} />Nuevo envío masivo</button>} />}</div>
    <Modal open={!!form} onClose={() => setForm(null)} title="Nuevo envío masivo" icon={<Send size={18} />} footer={<><button className="btn btn-g" onClick={() => setForm(null)}>Cancelar</button><button className="btn btn-p" onClick={start}><Send size={13} />Iniciar envío</button></>}>
      {form && <><div className="field"><label className="lb">Nombre de la campaña</label><input className="input" autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Promo Black Friday" /></div>
        <div className="field"><label className="lb">Flujo</label><select className="input" value={form.flow} onChange={e => setForm({ ...form, flow: e.target.value })}><option value="">Seleccione un flujo</option>{flows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        <div className="grid g2"><div className="field"><label className="lb">Destinatarios</label><input className="input" type="number" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} /></div><div className="field"><label className="lb">Intervalo (seg)</label><input className="input" type="number" value={form.delay} onChange={e => setForm({ ...form, delay: e.target.value })} /></div></div></>}</Modal>
    <Modal open={!!buy} onClose={() => setBuy(null)} title="Confirmar compra" icon={<CreditCard size={18} />} footer={<><button className="btn btn-g" onClick={() => setBuy(null)}>Cancelar</button><button className="btn btn-p" onClick={() => { setQuota(q => q + buy[0]); setBuy(null); toast('Envíos agregados a tu saldo (demo)') }}>Pagar PEN {buy?.[1]}</button></>}>
      <p>Vas a comprar <b>{buy?.[0].toLocaleString('es-PE')} envíos extra</b> por <b>PEN {buy?.[1]}</b>.</p></Modal>
  </div>
}
