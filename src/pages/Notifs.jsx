import { useState } from 'react'
import { Bell, Volume2, VolumeX, ChevronDown, Check, Trash2 } from 'lucide-react'
import { useStore, useToast } from '../ui'
import { Toggle } from './leona'

export function playPing(vol) {
  try { const c = new (window.AudioContext || window.webkitAudioContext)(); const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.value = vol * .25; o.connect(g); g.connect(c.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + .35); o.stop(c.currentTime + .36) } catch { }
}

export function NotifPanel({ style }) {
  const toast = useToast()
  const [list, setList] = useStore('notif_list', [])
  const [cfg, setCfg] = useStore('notif_cfg', { device: false, vol: 50, msgs: true, sales: true, conns: true })
  const [adv, setAdv] = useState(false)
  const setDevice = async v => {
    if (v && 'Notification' in window && Notification.permission !== 'granted') {
      const r = await Notification.requestPermission().catch(() => 'denied')
      if (r !== 'granted') return toast('El navegador bloqueó las notificaciones', 'err')
    }
    setCfg({ ...cfg, device: v }); toast(v ? 'Notificaciones del dispositivo activadas' : 'Notificaciones del dispositivo desactivadas')
  }
  const a = typeof document !== 'undefined' && document.querySelector('aside.side')?.getBoundingClientRect()
  const W = Math.min(345, innerWidth - 16); const left = Math.max(8, Math.min((a ? a.right : 240) + 10, innerWidth - W - 8))
  return <div className="nt-pop" style={{ position: 'fixed', left, bottom: 14, width: W, ...style }} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
    <div className="nt-h"><Bell size={16} color="#4d94ff" />Notificaciones
      {list.length > 0 && <><button title="Marcar todo leído" onClick={() => setList(l => l.map(x => ({ ...x, r: true })))}><Check size={15} /></button><button title="Borrar todo" onClick={() => setList([])}><Trash2 size={14} /></button></>}</div>
    <div className="nt-body">{list.length === 0 ? <div className="nt-empty"><Bell size={30} strokeWidth={1.8} /><span>Sin notificaciones</span></div>
      : list.map(n => <div key={n.id} className={'nt-it' + (n.r ? '' : ' un')} onClick={() => setList(l => l.map(x => x.id === n.id ? { ...x, r: true } : x))}><i /><div><b>{n.t}</b><p>{n.d}</p></div></div>)}</div>
    <div className="nt-f">
      <div className="nt-row"><span>Recibir en el dispositivo</span><em style={{ color: cfg.device ? '#4d94ff' : '#94a3b8' }}>{cfg.device ? 'Activado' : 'Activar'}</em><Toggle on={cfg.device} onChange={setDevice} /></div>
      <div className="nt-row" style={{ gap: 10, marginTop: 12 }}>
        <button style={{ display: 'grid', color: 'var(--soft)' }} onClick={() => { setCfg({ ...cfg, vol: cfg.vol ? 0 : 50 }) }}>{cfg.vol ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
        <input type="range" className="nt-rng" min="0" max="100" value={cfg.vol} style={{ background: `linear-gradient(90deg,#005ae3 ${cfg.vol}%,var(--border2) 0)` }} onChange={e => setCfg({ ...cfg, vol: +e.target.value })} onMouseUp={() => playPing(cfg.vol / 100)} onTouchEnd={() => playPing(cfg.vol / 100)} />
        <small>{cfg.vol}%</small></div>
      <button className="nt-row nt-adv" onClick={() => setAdv(!adv)}><span>Avanzado</span><ChevronDown size={16} style={{ marginLeft: 'auto', transform: adv ? 'rotate(180deg)' : '', transition: '.2s' }} /></button>
      {adv && [['msgs', 'Mensajes nuevos en Chats'], ['sales', 'Ventas registradas'], ['conns', 'Conexiones desconectadas']].map(([k, l]) => <div key={k} className="nt-row" style={{ marginTop: 10, fontSize: 12.5 }}><span style={{ color: 'var(--soft)' }}>{l}</span><span style={{ marginLeft: 'auto' }}><Toggle on={cfg[k]} onChange={v => setCfg({ ...cfg, [k]: v })} /></span></div>)}
    </div>
  </div>
}
