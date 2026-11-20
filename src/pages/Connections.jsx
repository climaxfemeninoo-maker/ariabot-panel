import { useState, useEffect } from 'react'
import { Plug, Plus, Search, Trash2, Power, QrCode, ShieldCheck, Loader2, CircleCheck, Smartphone, MoreVertical, TriangleAlert } from 'lucide-react'
import { useStore, useToast, uid, Menu, nowStr } from '../ui'
import { LModal, LSelect } from './leona'

function FakeQR({ seed }) {
  const cells = []; let s = seed
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) { s = (s * 9301 + 49297) % 233280; const corner = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17); if (!corner && s / 233280 > .52) cells.push(<rect key={x + '-' + y} x={x} y={y} width="1" height="1" />) }
  const eye = (x, y) => <g key={x + 'e' + y}><rect x={x} y={y} width="7" height="7" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" /></g>
  return <svg viewBox="-1 -1 27 27" width="190" height="190" style={{ background: '#fff', borderRadius: 8, padding: 6 }} fill="#111">{cells}{eye(0, 0)}{eye(18, 0)}{eye(0, 18)}</svg>
}

export default function Connections() {
  const toast = useToast()
  const [conns, setConns] = useStore('connections', [])
  const [q, setQ] = useState(''); const [st, setSt] = useState('all')
  const [mod, setMod] = useState(false); const [form, setForm] = useState({ name: '', type: 'qr' }); const [del, setDel] = useState(null)
  const [step, setStep] = useState(0); const [seed, setSeed] = useState(7)
  useEffect(() => { if (step !== 1) return; const t = setTimeout(() => setStep(2), 4500); const r = setInterval(() => setSeed(s => s + 13), 1500); return () => { clearTimeout(t); clearInterval(r) } }, [step])
  const on = conns.filter(c => c.on && !c.restricted).length
  const rows = conns.filter(c => (c.name + (c.phone || '')).toLowerCase().includes(q.toLowerCase()) && (st === 'all' || (st === 'on' ? c.on && !c.restricted : st === 'off' ? !c.on : c.restricted)))
  const close = () => { setMod(false); setStep(0); setForm({ name: '', type: 'qr' }) }
  const finish = () => { setConns(c => [...c, { id: uid(), name: form.name.trim(), type: form.type, phone: '+51 9' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0'), on: true, created: nowStr() }]); close(); toast('Conexión creada y conectada') }
  return <div className="lp">
    <div className="lp-hd" style={{ alignItems: 'center' }}><Plug size={21} strokeWidth={2} style={{ marginTop: 0, marginLeft: 4 }} /><h1 style={{ marginTop: 0, fontSize: 19.5 }}>Conexiones</h1>
      <div className="r"><button className="cn-btn" onClick={() => setMod(true)}><Plus size={14} />Nueva conexión</button></div></div>
    <div className="cn-stats">
      <div className="cn-st"><div><span>Conectadas</span><b>{on}</b></div><span className="cn-dot" style={{ background: 'rgba(34,197,94,.14)' }}><i style={{ background: '#22c55e' }} /></span></div>
      <div className="cn-st"><div><span>Desconectadas</span><b>{conns.length - on}</b></div><span className="cn-dot" style={{ background: 'rgba(239,68,68,.14)' }}><i style={{ background: '#ef4444' }} /></span></div>
    </div>
    <div style={{ display: 'flex', gap: 11, marginTop: 12 }}>
      <div className="lp-srch" style={{ flex: 1 }}><Search size={15} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o número de instancia" style={{ fontWeight: 500 }} /></div>
      <LSelect className="l-in ct-in" value={st} onChange={setSt} bold style={{ width: 196 }} options={[['all', 'Todos los estados'], ['on', 'Conectadas'], ['off', 'Desconectadas'], ['restricted', 'Restringidas']].map(([value, label]) => ({ value, label }))} />
    </div>
    <div className="cn-panel">
      {rows.length ? <div className="cn-grid">{rows.map(c => <div key={c.id} className="cn-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ width: 38, height: 38, borderRadius: 9, background: c.on ? 'rgba(34,197,94,.14)' : 'rgba(239,68,68,.14)', color: c.on ? '#22c55e' : '#ef4444', display: 'grid', placeItems: 'center' }}><Smartphone size={18} /></span>
          <div style={{ minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{c.phone}</div></div>
          <span style={{ marginLeft: 'auto' }}><Menu right trigger={<button className="ch-ib" style={{ width: 28, height: 28 }}><MoreVertical size={15} /></button>} items={[
            { icon: <Power size={13} />, label: c.on ? 'Desconectar' : 'Reconectar', onClick: () => { setConns(x => x.map(y => y.id === c.id ? { ...y, on: !y.on } : y)); toast(c.on ? 'Conexión desconectada' : 'Conexión reconectada', 'info') } },
            '-', { icon: <Trash2 size={13} />, label: 'Eliminar', danger: true, onClick: () => setDel(c) }]} /></span>
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 13 }}>
          <span className="fl-bd" style={c.on ? { color: '#22c55e', background: 'rgba(34,197,94,.1)', borderColor: 'rgba(34,197,94,.35)' } : { color: '#ef4444', background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.35)' }}><i />{c.on ? 'CONECTADA' : 'DESCONECTADA'}</span>
          <span className="kb-badge" style={{ marginLeft: 0, display: 'inline-flex', alignItems: 'center' }}>{c.type === 'qr' ? 'QR CODE' : 'API OFICIAL'}</span></div>
        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 10 }}>Creada {c.created}</div>
      </div>)}</div>
        : <div className="cn-empty"><Plug size={40} strokeWidth={2} className="big" /><h3>No hay conexiones</h3><p>{conns.length ? 'Ninguna conexión coincide con la búsqueda' : 'Cree su primera conexión para empezar'}</p>
          {!conns.length && <button className="cn-btn" style={{ marginTop: 19, height: 30 }} onClick={() => setMod(true)}><Plus size={14} />Crear primera conexión</button>}</div>}
    </div>

    <LModal open={mod} onClose={close} title="Nueva conexión" desc={step ? 'Escanee el código con WhatsApp' : 'Conecte un número de WhatsApp'} icon={<Plug size={19} />}
      footer={step === 0 ? <><button className="lb2 g" onClick={close}>Cancelar</button><button className="lb2 p" disabled={!form.name.trim()} onClick={() => setStep(form.type === 'qr' ? 1 : 2)}>Continuar</button></> : step === 2 ? <button className="lb2 p" onClick={finish}>Finalizar</button> : null}>
      {step === 0 && <>
        <label className="l-lbl">Nombre de la conexión</label>
        <input className="l-in ct-in" autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej.: WhatsApp ventas" />
        <label className="l-lbl" style={{ marginTop: 18 }}>Tipo</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{[['qr', 'QR Code', 'Escanee con su celular', QrCode], ['api', 'API Oficial', 'WhatsApp Cloud API de Meta', ShieldCheck]].map(([k, t, d, Ic]) =>
          <button key={k} onClick={() => setForm({ ...form, type: k })} style={{ textAlign: 'left', padding: 14, borderRadius: 8, border: '1px solid ' + (form.type === k ? 'var(--p)' : 'var(--border)'), background: form.type === k ? 'rgba(0,90,227,.1)' : 'var(--card)' }}>
            <Ic size={20} color="#005ae3" /><div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>{t}</div><div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{d}</div></button>)}</div>
      </>}
      {step === 1 && <div style={{ textAlign: 'center' }}><div key={seed} style={{ display: 'inline-block', animation: 'pop .3s' }}><FakeQR seed={seed} /></div>
        <ol style={{ textAlign: 'left', margin: '14px auto 0', maxWidth: 300, lineHeight: 1.8, fontSize: 12.5, color: '#94a3b8' }}><li>Abra WhatsApp en su celular</li><li>Toque Menú › Dispositivos vinculados</li><li>Apunte su celular a esta pantalla</li></ol>
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', alignItems: 'center', marginTop: 10, fontSize: 12.5 }}><Loader2 size={14} className="spin" color="#005ae3" />Esperando lectura…</div></div>}
      {step === 2 && <div style={{ textAlign: 'center', padding: '14px 0' }}><CircleCheck size={54} color="#22c55e" /><div style={{ fontSize: 16, fontWeight: 700, marginTop: 10 }}>¡Conectado!</div><div style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>Su número quedó vinculado correctamente.</div></div>}
    </LModal>
    <LModal open={!!del} onClose={() => setDel(null)} title="Eliminar conexión" icon={<TriangleAlert size={21} color="#ef4444" />} width={482} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55 }}>¿Eliminar la conexión "{del?.name}"? Esta acción no se puede deshacer.</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 13 }}>
        <button className="lb2 g" onClick={() => setDel(null)}>Cancelar</button>
        <button className="lb2 d" onClick={() => { setConns(c => c.filter(x => x.id !== del.id)); setDel(null); toast('Conexión eliminada') }}>Eliminar</button></div>
    </LModal>
  </div>
}
