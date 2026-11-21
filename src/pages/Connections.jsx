import { useState, useEffect, useRef } from 'react'
import { Plug, Plus, Search, Trash2, QrCode, Loader2, CircleCheck, Smartphone, TriangleAlert, Cloud, Pencil, Globe, Lock, ScanLine, ShieldCheck, Check, CircleAlert, Info, ChevronDown, Phone, Archive, ShieldAlert, X, SignalHigh, Unplug } from 'lucide-react'
import { useStore, useToast, uid, nowStr } from '../ui'
import { LModal, LSelect, Toggle } from './leona'

function FakeQR({ seed }) {
  const cells = []; let s = seed
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) { s = (s * 9301 + 49297) % 233280; const corner = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17); if (!corner && s / 233280 > .52) cells.push(<rect key={x + '-' + y} x={x} y={y} width="1" height="1" />) }
  const eye = (x, y) => <g key={x + 'e' + y}><rect x={x} y={y} width="7" height="7" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" /></g>
  return <svg viewBox="-1 -1 27 27" width="200" height="200" style={{ background: '#fff', borderRadius: 10, padding: 7 }} fill="#111">{cells}{eye(0, 0)}{eye(18, 0)}{eye(0, 18)}</svg>
}

const CUR = [['auto', 'Automática — detectar con IA'], ['PEN', 'Sol peruano (PEN)'], ['USD', 'Dólar (USD)'], ['MXN', 'Peso mexicano (MXN)'], ['COP', 'Peso colombiano (COP)'], ['CLP', 'Peso chileno (CLP)'], ['ARS', 'Peso argentino (ARS)'], ['BRL', 'Real (BRL)'], ['EUR', 'Euro (EUR)']]
const curLbl = c => c === 'auto' ? 'Moneda automática' : 'Moneda ' + c
const MAX_API = 3
const SEED = () => [
  { id: uid(), type: 'qr', name: 'ss', phone: '', status: 'off', verified: true, created: nowStr(), cur: 'auto' },
  { id: uid(), type: 'api', name: 'Shop Online', phone: '+51 900 283 142', status: 'on', waba: 'APPROVED', tier: 'TIER_250', calls: false, free: true, reg: true, cur: 'auto', days: 5, created: nowStr() },
  { id: uid(), type: 'api', name: 'Impulso Digital', phone: '+51 930 238 820', status: 'banned', waba: 'REJECTED', tier: 'UNKNOWN', calls: false, free: true, reg: true, cur: 'auto', days: 5, created: nowStr() },
]
const okProxy = v => /^(https?|socks5):\/\/([^:@\s]+:[^@\s]+@)?[\w.-]+:\d{2,5}$/.test(v.trim()) || /^[\w.-]+:\d{2,5}(:[^:\s]+:[^:\s]+)?$/.test(v.trim())

export default function Connections() {
  const toast = useToast()
  const [conns, setConns] = useStore('wa_conns', SEED)
  const [q, setQ] = useState(''); const [st, setSt] = useState('all')
  const [mod, setMod] = useState(null); const [del, setDel] = useState(null)
  const [seed, setSeed] = useState(7)
  const upd = (id, p) => setConns(cs => cs.map(c => c.id === id ? { ...c, ...p } : c))
  const isOn = c => c.status === 'on'
  const on = conns.filter(isOn).length
  const apis = conns.filter(c => c.type === 'api' && !c.archived)
  const rows = conns.filter(c => !c.archived && (c.name + (c.phone || '')).toLowerCase().includes(q.toLowerCase()) && (st === 'all' || (st === 'on' ? isOn(c) : st === 'off' ? c.status === 'off' : c.status === 'banned')))
  useEffect(() => { if (mod?.t !== 'qr' || mod.step !== 1) return; const t = setTimeout(() => setMod(m => m && { ...m, step: 2 }), 5000); const r = setInterval(() => setSeed(s => s + 13), 1500); return () => { clearTimeout(t); clearInterval(r) } }, [mod?.t, mod?.step])
  const qrDone = id => { upd(id, { status: 'on', phone: conns.find(c => c.id === id)?.phone || '+51 9' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0'), connected: nowStr() }); setMod(null); toast('WhatsApp conectado') }

  return <div className="lp">
    <div className="lp-hd" style={{ alignItems: 'center' }}><Plug size={21} strokeWidth={2} style={{ marginTop: 0, marginLeft: 4 }} /><h1 style={{ marginTop: 0, fontSize: 19.5 }}>Conexiones</h1>
      <div className="r" style={{ gap: 10 }}>
        <button className="cn-btn" onClick={() => setMod({ t: 'new', name: '', type: 'qr', cur: 'auto' })}><Plus size={14} />Nueva conexión</button></div></div>
    <div className="cn-stats">
      <div className="cn-st"><div><span>Conectadas</span><b>{on}</b></div><span className="cn-dot" style={{ background: 'rgba(34,197,94,.14)' }}><i style={{ background: '#22c55e' }} /></span></div>
      <div className="cn-st"><div><span>Desconectadas</span><b>{conns.filter(c => !c.archived).length - on}</b></div><span className="cn-dot" style={{ background: 'rgba(239,68,68,.14)' }}><i style={{ background: '#ef4444' }} /></span></div>
    </div>
    <div style={{ display: 'flex', gap: 11, marginTop: 12 }}>
      <div className="lp-srch" style={{ flex: 1 }}><Search size={15} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o número de instancia" style={{ fontWeight: 500 }} /></div>
      <LSelect className="l-in ct-in" value={st} onChange={setSt} bold style={{ width: 196 }} options={[['all', 'Todos los estados'], ['on', 'Conectadas'], ['off', 'Sin conectar'], ['banned', 'Baneadas por Meta']].map(([value, label]) => ({ value, label }))} />
    </div>
    <div className="cn-panel">
      {rows.length ? <div className="wc-grid">{rows.map(c => c.type === 'qr' ? <QrCard key={c.id} c={c} onQR={() => setMod({ t: 'qr', id: c.id, step: 1 })} onProxy={() => setMod({ t: 'proxy', id: c.id, name: c.name, proxy: c.proxy || '' })} onEdit={() => setMod({ t: 'edit', id: c.id, name: c.name, cur: c.cur || 'auto', qr: true })} onDel={() => setDel(c)} onOff={() => { upd(c.id, { status: 'off' }); toast('Sesión desconectada', 'info') }} />
        : <ApiCard key={c.id} c={c} onEdit={() => setMod({ t: 'edit', id: c.id, name: c.name, cur: c.cur || 'auto' })} onManage={() => setMod({ t: 'cloud', focus: c.id })} />)}</div>
        : <div className="cn-empty"><Plug size={40} strokeWidth={2} className="big" /><h3>No hay conexiones</h3><p>{conns.length ? 'Ninguna conexión coincide con la búsqueda' : 'Cree su primera conexión para empezar'}</p>
          <button className="cn-btn" style={{ marginTop: 19, height: 30 }} onClick={() => setMod({ t: 'new', name: '', type: 'qr', cur: 'auto' })}><Plus size={14} />Crear conexión</button></div>}
    </div>

    {/* Nueva conexión */}
    {mod?.t === 'new' && <LModal open onClose={() => setMod(null)} title="Nueva conexión" desc="Conecte un número de WhatsApp" icon={<Plug size={19} />} width={540} bodyStyle={{ overflow: 'visible' }}
      footer={<><button className="lb2 g" onClick={() => setMod(null)}>Cancelar</button><button className="lb2 p" disabled={!mod.name.trim() || (mod.type === 'api' && apis.length >= MAX_API)} onClick={() => {
        const c = mod.type === 'qr' ? { id: uid(), type: 'qr', name: mod.name.trim(), phone: '', status: 'off', verified: true, cur: mod.cur, created: nowStr() }
          : { id: uid(), type: 'api', name: mod.name.trim(), phone: '+51 9' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0'), status: 'on', waba: 'APPROVED', tier: 'TIER_250', calls: false, free: true, reg: true, cur: mod.cur, days: 0, created: nowStr() }
        setConns(x => [...x, c]); toast(mod.type === 'qr' ? 'Conexión creada · genera el QR para vincular' : 'API Oficial conectada'); setMod(mod.type === 'qr' ? { t: 'qr', id: c.id, step: 1 } : null) }}>Continuar</button></>}>
      <div className="wc-types">{[['qr', 'WhatsApp Directo', 'Vincula tu celular escaneando un QR', Smartphone, '#22c55e', ['Listo en 1 minuto', 'Usa tu número actual', 'Proxy opcional por número']], ['api', 'Meta Cloud API', 'API oficial en servidores de Meta', Cloud, '#1d8cf8', ['Sin riesgo de desconexión', 'Plantillas aprobadas', `${apis.length}/${MAX_API} cupos usados`]]].map(([k, t, d, Ic, col, feats]) =>
        <button key={k} className={mod.type === k ? 'on' : ''} disabled={k === 'api' && apis.length >= MAX_API} onClick={() => setMod({ ...mod, type: k })} style={{ '--c': col }}><span className="ic"><Ic size={20} fill={k === 'api' ? '#fff' : 'none'} /></span><b>{t}</b><small>{d}</small>
          <ul>{feats.map(f => <li key={f}><Check size={12} strokeWidth={3} />{f}</li>)}</ul>{mod.type === k && <i><Check size={12} strokeWidth={3} /></i>}</button>)}</div>
      {apis.length >= MAX_API && <div className="wc-warn"><CircleAlert size={15} />Alcanzaste el límite de {MAX_API} APIs principales. Archiva una para liberar cupo.</div>}
      <div className="wc-fl" style={{ marginTop: 20 }}><label>Nombre de la conexión</label><input autoFocus value={mod.name} onChange={e => setMod({ ...mod, name: e.target.value })} placeholder="Ej.: Ventas Colombia" /></div>
      <div className="wc-hint">Ejemplo: Ventas Colombia, Soporte o Tienda principal</div>
      <div className="wc-fl" style={{ marginTop: 16 }}><label>Moneda de las ventas</label><LSelect className="l-in ct-in" value={mod.cur} onChange={v => setMod({ ...mod, cur: v })} options={CUR.map(([value, label]) => ({ value, label }))} /></div>
      <div className="wc-hint">{mod.cur === 'auto' ? 'La IA detectará la moneda de cada comprobante automáticamente.' : 'Todas las ventas de esta conexión se registrarán en ' + mod.cur + '.'}</div>
    </LModal>}

    {/* QR */}
    {mod?.t === 'qr' && <LModal open onClose={() => setMod(null)} title="Vincular WhatsApp" desc={conns.find(c => c.id === mod.id)?.name} icon={<QrCode size={19} />} footer={mod.step === 2 ? <button className="lb2 p" onClick={() => qrDone(mod.id)}>Finalizar</button> : <button className="lb2 g" onClick={() => setMod(null)}>Cancelar</button>}>
      {mod.step === 1 ? <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}><div key={seed} style={{ animation: 'pop .3s' }}><FakeQR seed={seed} /></div>
        <div><ol className="wc-steps"><li>Abre <b>WhatsApp</b> en tu celular</li><li>Toca <b>Menú › Dispositivos vinculados</b></li><li>Toca <b>Vincular un dispositivo</b></li><li>Apunta tu celular a esta pantalla</li></ol>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16, fontSize: 13, fontWeight: 600 }}><Loader2 size={15} className="spin" color="#22c55e" />Esperando lectura…</div>
          {conns.find(c => c.id === mod.id)?.proxy && <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, fontSize: 12, color: 'var(--soft)' }}><Globe size={13} />Usando tu proxy</div>}</div></div>
        : <div style={{ textAlign: 'center', padding: '14px 0' }}><CircleCheck size={56} color="#22c55e" /><div style={{ fontSize: 17, fontWeight: 700, marginTop: 10 }}>¡Conectado!</div><div style={{ fontSize: 13, color: 'var(--soft)', marginTop: 5 }}>Tu número quedó vinculado correctamente.</div></div>}
    </LModal>}

    {/* Editar */}
    {mod?.t === 'edit' && <LModal open onClose={() => setMod(null)} title={mod.qr ? 'Editar conexión' : 'Editar API Oficial'} icon={<Pencil size={18} />} width={470} bodyStyle={{ overflow: 'visible' }}
      footer={<><button className="lb2 g" onClick={() => setMod(null)}>Cancelar</button><button className="lb2 p" disabled={!mod.name.trim()} onClick={() => { upd(mod.id, { name: mod.name.trim(), cur: mod.cur }); setMod(null); toast('Cambios guardados') }}>Guardar cambios</button></>}>
      <div className="wc-fl"><label>{mod.qr ? 'Nombre de la conexión' : 'Nombre de la API'}</label><input autoFocus value={mod.name} onChange={e => setMod({ ...mod, name: e.target.value })} /></div>
      <div className="wc-hint">Ejemplo: Ventas Colombia, Soporte o Tienda principal</div>
      <div className="wc-fl" style={{ marginTop: 16 }}><label>Moneda de las ventas</label><LSelect className="l-in ct-in" value={mod.cur} onChange={v => setMod({ ...mod, cur: v })} options={CUR.map(([value, label]) => ({ value, label }))} /></div>
      <div className="wc-hint">{mod.cur === 'auto' ? 'La IA detectará la moneda de cada comprobante automáticamente.' : 'Todas las ventas de esta conexión se registrarán en ' + mod.cur + '.'}</div>
    </LModal>}

    {/* Proxy */}
    {mod?.t === 'proxy' && <LModal open onClose={() => setMod(null)} title="Proxy de la conexión" desc={mod.name} icon={<span className="wc-pxi"><Globe size={19} /><Lock size={10} /></span>} width={560}
      footer={<><button className="lb2 g" disabled={!okProxy(mod.proxy)} onClick={() => { setMod({ ...mod, testing: true }); setTimeout(() => { setMod(m => m && { ...m, testing: false, tested: true }); toast('Proxy respondió correctamente') }, 1300) }}>{mod.testing ? <Loader2 size={14} className="spin" /> : null}Probar</button>
        {conns.find(c => c.id === mod.id)?.proxy && <button className="lb2 d" onClick={() => { upd(mod.id, { proxy: '' }); setMod(null); toast('Proxy eliminado', 'info') }}>Quitar</button>}
        <button className="lb2 p" disabled={!okProxy(mod.proxy)} onClick={() => { upd(mod.id, { proxy: mod.proxy.trim() }); setMod(null); toast('Proxy guardado') }}>Guardar</button></>}>
      <div className="wc-info">Este número se conectará a WhatsApp <b>a través de tu proxy</b> en lugar de la IP de Nubify. Ayuda a reducir bloqueos, sobre todo con números nuevos o virtuales.
        <ul><li>Usa una IP <b>residencial o móvil</b>, fija (que no cambie en cada conexión).</li><li>Que sea <b>del mismo país</b> del número.</li><li>Usa <b>un proxy por número</b>; no lo compartas entre varias líneas.</li></ul></div>
      <label className="l-lbl" style={{ marginTop: 18, fontWeight: 700 }}>Proxy</label>
      <input className={'l-in ct-in' + (mod.proxy && !okProxy(mod.proxy) ? ' bad' : '')} value={mod.proxy} onChange={e => setMod({ ...mod, proxy: e.target.value, tested: false })} placeholder="http://usuario:clave@host:puerto" />
      {mod.proxy && !okProxy(mod.proxy) && <div className="wc-hint" style={{ color: '#ef4444' }}>Formato no válido.</div>}
      {mod.tested && <div className="wc-hint" style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 5 }}><CircleCheck size={13} />Conexión exitosa · 142 ms</div>}
      <div className="wc-hint">También acepta https://, socks5:// y el formato host:puerto:usuario:clave de tu proveedor.</div>
      <div className="wc-hint" style={{ marginTop: 12 }}>El proxy se usará cuando generes el QR. Lo ideal es configurarlo antes de escanearlo.</div>
    </LModal>}

    {/* Cloud API */}
    {mod?.t === 'cloud' && <LModal open onClose={() => setMod(null)} title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Cloud size={20} color="#1d8cf8" fill="#1d8cf8" />{mod.focus ? (conns.find(c => c.id === mod.focus)?.name || 'API Oficial') : 'WhatsApp Cloud API (Oficial)'}</span>} desc={mod.focus ? 'Estado de este número en Meta Cloud API' : undefined} width={640} bodyStyle={{ padding: '18px 22px 6px', maxHeight: '72vh', overflowY: 'auto' }}
      footer={<button className="wc-close" onClick={() => setMod(null)}>Cerrar</button>}>
      <div className="wc-cap"><b>Capacidad de Cloud API</b><div><Cloud size={18} color="#1d8cf8" fill="#1d8cf8" /><span><b>{apis.length}/{MAX_API}</b><small>APIs principales</small></span></div><div className="bar"><i style={{ width: apis.length / MAX_API * 100 + '%' }} /></div></div>
      {apis.filter(c => !mod.focus || c.id === mod.focus).map(c => <ApiPanel key={c.id} c={c} focus={false} upd={p => upd(c.id, p)} toast={toast} onArchive={() => { upd(c.id, { archived: true }); toast('API archivada · cupo liberado'); if (mod.focus) setMod(null) }} />)}
      <p className="wc-foot">Los mensajes de los clientes llegarán automáticamente a tus chats. Puedes enviar mensajes usando plantillas aprobadas o responder dentro de la ventana de 24 horas.</p>
      {!mod.focus && <div style={{ textAlign: 'center', margin: '18px 0 14px' }}><button className="wc-cta" disabled={apis.length >= MAX_API} onClick={() => setMod({ t: 'new', name: '', type: 'api', cur: 'auto' })}><Cloud size={17} fill="#fff" />Conectar API principal</button>
        {apis.length >= MAX_API && <div className="wc-hint" style={{ textAlign: 'center' }}>Cupo completo · archiva una API para conectar otra</div>}</div>}
    </LModal>}

    <LModal open={!!del} onClose={() => setDel(null)} title="Eliminar conexión" icon={<TriangleAlert size={21} color="#ef4444" />} width={482} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55 }}>¿Eliminar la conexión "{del?.name}"? Esta acción no se puede deshacer.</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 13 }}>
        <button className="lb2 g" onClick={() => setDel(null)}>Cancelar</button>
        <button className="lb2 d" onClick={() => { setConns(c => c.filter(x => x.id !== del.id)); setDel(null); toast('Conexión eliminada') }}>Eliminar</button></div>
    </LModal>
  </div>
}

function QrCard({ c, onQR, onProxy, onEdit, onDel, onOff }) {
  const on = c.status === 'on'
  return <div className="wc-card">
    <div className="wc-top"><span className="wc-pill g"><Smartphone size={15} />WHATSAPP DIRECTO</span><span className={'wc-st ' + (on ? 'on' : 'off')}><i />{on ? 'CONECTADO' : 'SIN CONECTAR'}</span></div>
    <div className="wc-id"><span className="wc-av g">{on ? <SignalHigh size={24} /> : <span className="sig"><SignalHigh size={24} /><b>!</b></span>}</span>
      <div className="nm"><b>{c.name}{c.verified && <span className="vf"><Check size={11} strokeWidth={3.5} /></span>}</b>{on && <small>{c.phone}</small>}</div>
      <div className="wc-acts"><button title={c.proxy ? 'Proxy activo' : 'Configurar proxy'} className={c.proxy ? 'px' : ''} onClick={onProxy}><Globe size={18} /><Lock size={9} className="lk" /></button><button title="Editar" onClick={onEdit}><Pencil size={17} /></button><button title="Eliminar" onClick={onDel}><Trash2 size={17} /></button></div></div>
    <div className="wc-line"><Smartphone size={16} /><span>{on ? 'Sesión activa · ' + (c.phone || '') : 'Sesión por QR · depende del dispositivo'}</span></div>
    <div className="wc-meta">{c.proxy ? <span className="ok"><Globe size={12} />Proxy activo</span> : <span><Globe size={12} />Sin proxy</span>}<span>{curLbl(c.cur || 'auto')}</span></div>
    {on ? <button className="wc-big gray" onClick={onOff}><Unplug size={18} />Desconectar sesión</button> : <button className="wc-big green" onClick={onQR}><ScanLine size={20} />Generar QR</button>}
  </div>
}

function ApiCard({ c, onEdit, onManage }) {
  const ban = c.status === 'banned'
  return <div className={'wc-card' + (ban ? ' ban' : '')}>
    <div className="wc-top"><span className="wc-pill b"><Cloud size={15} fill="currentColor" />META CLOUD API</span><span className={'wc-st ' + (ban ? 'off' : 'on')}><i />{ban ? 'BANEADO' : 'CONECTADO'}</span></div>
    <div className="wc-id"><span className="wc-av b"><Cloud size={24} fill="#fff" /></span>
      <div className="nm"><b>{c.name}</b><small>{c.phone} · {curLbl(c.cur || 'auto')}</small></div>
      <div className="wc-acts"><button title="Editar" onClick={onEdit}><Pencil size={17} /></button></div></div>
    {ban ? <div className="wc-line red"><ShieldAlert size={16} /><span>Meta desactivó este WABA · envíos detenidos</span></div>
      : <div className="wc-line"><ShieldCheck size={16} /><span>WABA aprobado · opera en servidores de Meta</span></div>}
    <div className="wc-meta">{ban ? <span className="bad">WABA: {c.waba}</span> : <span className="ok"><CircleCheck size={12} />Sin límite diario</span>}<span className={ban ? 'bad' : 'tier'}>{c.tier}</span></div>
    {ban ? <button className="wc-big red" onClick={onManage}>Ver baneo y cómo apelar</button> : <button className="wc-big blue" onClick={onManage}>Administrar API Oficial</button>}
  </div>
}

function ApiPanel({ c, upd, toast, onArchive, focus }) {
  const ban = c.status === 'banned'; const [lim, setLim] = useState(false); const [prev, setPrev] = useState(ban && focus); const [ap, setAp] = useState(ban && focus)
  const known = c.known || 0; const box = useRef()
  useEffect(() => { if (focus) setTimeout(() => box.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 80) }, [])
  return <div className={'wc-ap ' + (ban ? 'ban' : 'ok')} ref={box}>
    <span className="a-big">{ban ? <b>!</b> : <Check size={26} strokeWidth={3.2} />}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="a-tgr"><Toggle on={c.free} onChange={v => { upd({ free: v }); toast(v ? 'Verificación de gratuidad activada' : 'Verificación desactivada', 'info') }} /><b>Verificar gratuidad antes de bloquear</b></div>
      <p className="a-tx">Activada por defecto. Se permite una primera respuesta para comprobar la gratuidad; Meta puede cobrarla. Se continúa cuando Meta confirma gratuidad, incluida la cuota de mensajes de servicio gratuitos. Las 24 horas por sí solas no garantizan gratuidad. Las plantillas aprobadas pueden tener cobro de Meta.</p>
      <div className="a-bdg">{ban ? <span className="r">BANEADO</span> : <span className="g">CONECTADO</span>}<span className="p"><Cloud size={13} fill="currentColor" />PRINCIPAL</span><span className={ban ? 'o' : 'gl'}>WABA: {c.waba}</span></div>
      <div className="a-nm">{c.name}</div><div className="a-ph">{c.phone}</div>
      {ban ? <>
        <div className="a-msg o">⚠️ WABA pendiente de aprobación ({c.waba}). Espera que Meta apruebe tu cuenta.</div>
        <div className="a-msg r">⛔ Meta desactivó este WABA. Los envíos están detenidos. Solicita una revisión en Calidad de la cuenta de Meta y no crees otro portafolio para evadir la restricción.</div>
        <div className="a-row"><span className="a-tier r">{c.tier}</span><button className="a-arch" onClick={onArchive}><Archive size={14} />Archivar y liberar cupo</button></div>
        <div className="wc-col">
          <button className="c-hd" onClick={() => setAp(!ap)}><ShieldAlert size={17} color="#ef4444" /><b>Cómo apelar el baneo</b><ChevronDown size={16} className={'c-cv' + (ap ? ' up' : '')} /></button>
          {ap && <ol className="c-bd c-ol"><li>Entra a <b>Meta Business Suite › Calidad de la cuenta</b>.</li><li>Selecciona el número y toca <b>Solicitar revisión</b>.</li><li>Explica tu modelo de negocio y adjunta pruebas de opt-in de tus clientes.</li><li>La respuesta suele llegar en 24–72 h. No crees otro portafolio mientras tanto.</li>
            <a href="https://business.facebook.com/wa/manage/phone-numbers/" target="_blank" rel="noreferrer" className="c-lnk">Abrir Calidad de la cuenta ↗</a></ol>}
        </div>
      </> : <>
        <div className="wc-col slim"><button className="c-hd" onClick={() => setLim(!lim)}><Info size={14} color="#f59e0b" /><span>Inicio de chats nuevos limitado · Las respuestas funcionan normal</span><ChevronDown size={15} className={'c-cv' + (lim ? ' up' : '')} /></button>
          {lim && <div className="c-bd">Tu número está en <b>{c.tier}</b>: puedes iniciar conversaciones con hasta 250 clientes nuevos cada 24 h. Las respuestas a clientes que te escriben no tienen límite. Mantén buena calidad para subir de nivel automáticamente.</div>}</div>
        <div className="a-row"><span className="a-tier o">{c.tier}</span><span className="a-calls"><Toggle on={c.calls} onChange={v => { upd({ calls: v }); toast(v ? 'Llamadas activadas' : 'Llamadas desactivadas', 'info') }} /><Phone size={14} />Llamadas</span><button className="a-dis" onClick={() => { upd({ status: 'off', archived: true }); toast('API desconectada', 'info') }}>Desconectar</button></div>
      </>}
      <div className="wc-col">
        <button className="c-hd" onClick={() => setPrev(!prev)}><ShieldCheck size={17} color="#22c55e" /><b>Prevención de baneo</b><span className="c-kn">🩺 Conociendo a tus clientes: {known} de 20 conversaciones</span><ChevronDown size={16} className={'c-cv' + (prev ? ' up' : '')} /></button>
        {prev && <div className="c-bd">
          <div className="a-tgr a-sp"><span>Regulación automática de seguimientos {c.reg ? 'activada' : 'desactivada'}</span><Toggle on={c.reg} onChange={v => upd({ reg: v })} /></div>
          <div className="a-bl">🏷️ Conexión nueva ({c.days || 0} días): modo protegido los primeros 14 días (máx. 1 seguimiento sin respuesta).</div>
          <div className="a-tip">💡 Verifica tu negocio en Meta Business: le da identidad real a tu cuenta (menos falsos positivos y apelaciones más fuertes ante Meta).</div>
          <div className="a-kbar"><i style={{ width: known / 20 * 100 + '%' }} /></div></div>}
      </div>
    </div>
  </div>
}
