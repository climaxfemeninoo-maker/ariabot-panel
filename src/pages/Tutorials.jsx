import { useState, useEffect } from 'react'
import { PlayCircle, Play, Search, Check, Clock, Pause } from 'lucide-react'
import { useStore, Modal, PageHead } from '../ui'

const V = [['Primeros pasos en AriaBot', 'Inicio', '4:12'], ['Conecta tu WhatsApp por QR', 'Conexiones', '3:05'], ['Crea tu primer flujo de ventas', 'Flujos', '8:40'], ['Bloque de IA: respuestas inteligentes', 'Flujos', '6:22'], ['Configura un agente de IA que vende', 'Agentes', '9:15'], ['Kanban: organiza tu pipeline', 'CRM', '5:10'], ['Webhooks con Hotmart y Kiwify', 'Integraciones', '7:48'], ['Envíos masivos sin bloqueos', 'Envíos', '6:01'], ['Mide tu ROAS con Meta Ads', 'Facebook', '10:30']]
const G = ['#7c3aed,#c026d3', '#0ea5e9,#6366f1', '#16a34a,#0d9488', '#ea580c,#db2777', '#8b5cf6,#2563eb', '#db2777,#9333ea', '#ca8a04,#ea580c', '#0891b2,#7c3aed', '#2563eb,#0ea5e9']

export default function Tutorials() {
  const [cat, setCat] = useState('Todos'); const [q, setQ] = useState(''); const [open, setOpen] = useState(null); const [seen, setSeen] = useStore('seen', [])
  const [prog, setProg] = useState(0); const [playing, setPlaying] = useState(true)
  useEffect(() => { if (open == null || !playing) return; const t = setInterval(() => setProg(p => { if (p >= 100) { setSeen(s => s.includes(open) ? s : [...s, open]); return 100 } return p + 1 }), 120); return () => clearInterval(t) }, [open, playing, setSeen])
  const cats = ['Todos', ...new Set(V.map(v => v[1]))]
  const list = V.map((v, i) => [...v, i]).filter(v => (cat === 'Todos' || v[1] === cat) && v[0].toLowerCase().includes(q.toLowerCase()))
  return <div className="page">
    <PageHead icon={<PlayCircle size={18} />} title="Tutoriales" sub="Aprende a vender más con AriaBot paso a paso"><div className="search" style={{ width: 260 }}><Search size={13} /><input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar tutorial…" /></div></PageHead>
    <div className="card row" style={{ padding: 14, marginBottom: 16 }}><b>Tu progreso</b><div className="progress sp"><div style={{ width: seen.length / V.length * 100 + '%' }} /></div><span className="small bold">{seen.length}/{V.length}</span></div>
    <div className="row" style={{ marginBottom: 16, flexWrap: 'wrap' }}>{cats.map(c => <button key={c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}</div>
    <div className="grid g3 stagger" key={cat + q}>{list.map(([t, c, d, i]) => <div key={i} className="card lift vid" onClick={() => { setOpen(i); setProg(0); setPlaying(true) }}>
      <div className="th" style={{ background: `linear-gradient(135deg,${G[i]})` }}><div style={{ position: 'absolute', fontSize: 64, fontWeight: 900, color: '#fff', opacity: .12, right: 14, bottom: -10 }}>{String(i + 1).padStart(2, '0')}</div><div className="play" style={{ zIndex: 1 }}><Play size={20} fill="#fff" /></div>
        <span className="badge" style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.6)', color: '#fff', zIndex: 1 }}><Clock size={10} />{d}</span>{seen.includes(i) && <span className="badge b-green" style={{ position: 'absolute', top: 8, left: 8, zIndex: 1, background: '#16a34a', color: '#fff' }}><Check size={10} />VISTO</span>}</div>
      <div style={{ padding: 12 }}><span className="badge b-violet">{c}</span><div className="bold" style={{ marginTop: 7 }}>{t}</div></div></div>)}</div>
    <Modal lg open={open != null} onClose={() => setOpen(null)} title={V[open]?.[0]} sub={V[open]?.[1] + ' · ' + V[open]?.[2]} icon={<PlayCircle size={18} />}>
      {open != null && <><div style={{ aspectRatio: '16/9', borderRadius: 8, background: `linear-gradient(135deg,${G[open]})`, display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <button className="play" style={{ width: 64, height: 64, borderRadius: 50, background: 'rgba(255,255,255,.2)', display: 'grid', placeItems: 'center', color: '#fff' }} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={26} /> : <Play size={26} fill="#fff" />}</button>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: 'rgba(255,255,255,.25)' }}><div style={{ height: '100%', width: prog + '%', background: '#fff', transition: 'width .12s linear' }} /></div></div>
        <p className="small muted" style={{ marginTop: 12 }}>{prog >= 100 ? '✅ Tutorial completado.' : 'Vista previa del tutorial. Al terminar se marcará como visto.'}</p></>}</Modal>
  </div>
}
