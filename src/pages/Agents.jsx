import { useState, useRef, useEffect } from 'react'
import { Bot, Download, Cpu, Sparkles, Plus, Trash2, Pencil, MessageSquare, Send, Play, Mic, Volume2, Copy } from 'lucide-react'
import { useStore, Modal, Menu, Empty, PageHead, useToast, uid, Confirm, Switch } from '../ui'

const MODELS = [['GPT-4o mini', 'Rápido y económico', 1], ['GPT-4.1', 'Razonamiento avanzado', 4], ['Gemini 2.5 Flash', 'Respuestas veloces multimodales', 1], ['Claude Sonnet', 'Conversaciones naturales y precisas', 3]]
const VOICES = [['Sofía', 'Femenina · Latam', 'es-MX', 1.05], ['Mateo', 'Masculina · Latam', 'es-US', .95], ['Lucía', 'Femenina · España', 'es-ES', 1.1], ['Diego', 'Masculina · Neutra', 'es-ES', .9]]
const blank = { name: '', model: 'GPT-4o mini', prompt: '', voice: 'Sofía', active: true, temp: 0.7 }

export default function Agents() {
  const toast = useToast()
  const [agents, setAgents] = useStore('agents', [])
  const [tab, setTab] = useState('Agentes'); const [form, setForm] = useState(null); const [del, setDel] = useState(null)
  const [models, setModels] = useState(false); const [ai, setAi] = useState(false); const [aiTxt, setAiTxt] = useState(''); const [gen, setGen] = useState(false); const [test, setTest] = useState(null)
  const file = useRef()
  const save = () => { if (!form.name.trim()) return toast('Ponle un nombre al agente', 'err'); setAgents(a => form.id ? a.map(x => x.id === form.id ? form : x) : [...a, { ...form, id: uid() }]); toast(form.id ? 'Agente actualizado' : 'Agente creado'); setForm(null) }
  const speak = v => { try { const u = new SpeechSynthesisUtterance(`Hola, soy ${v[0]}, tu asistente de ventas. ¿En qué te puedo ayudar hoy?`); u.lang = v[2]; u.rate = v[3]; speechSynthesis.cancel(); speechSynthesis.speak(u) } catch { toast('Tu navegador no soporta voz', 'err') } }
  const generate = () => { setGen(true); setTimeout(() => { setGen(false); setAi(false); setForm({ ...blank, name: 'Asesor de ventas', prompt: `Eres un asesor de ventas amable y persuasivo. ${aiTxt}\n\nObjetivo: resolver dudas, generar confianza y enviar el link de pago cuando el cliente esté listo. Responde siempre en mensajes cortos y con emojis moderados.` }); setAiTxt('') }, 1400) }
  return <div className="page">
    <PageHead icon={<Bot size={18} />} title="Agentes de IA" sub="Atendente en WhatsApp que saca dudas y dispara el flujo">
      <button className="btn btn-g" onClick={() => file.current.click()}><Download size={14} />Importar</button><input ref={file} type="file" accept=".json" hidden onChange={e => { const f = e.target.files[0]; f && f.text().then(t => { try { setAgents(a => [...a, { ...JSON.parse(t), id: uid() }]); toast('Agente importado') } catch { toast('Archivo inválido', 'err') } }) }} />
      <button className="btn btn-g" onClick={() => setModels(true)}>Modelos</button>
      <button className="btn btn-g" onClick={() => setAi(true)}><Sparkles size={14} />Crear con IA</button>
      <button className="btn btn-p" onClick={() => setForm(blank)}><Plus size={14} />Nuevo agente</button></PageHead>
    <div className="row" style={{ marginBottom: 14 }}>{['Agentes', 'Voces'].map(t => <button key={t} className={'chip' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === 'Agentes' ? agents.length ? <div className="grid g3 stagger">{agents.map(a => <div key={a.id} className="card lift" style={{ padding: 16 }}>
      <div className="row"><div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#1a73f0,#639cf1)', display: 'grid', placeItems: 'center', color: '#fff' }}><Bot size={20} /></div>
        <div><b>{a.name}</b><div className="small muted">{a.model}</div></div><span className="sp" /><Switch on={a.active} onChange={v => { setAgents(x => x.map(y => y.id === a.id ? { ...y, active: v } : y)); toast(v ? 'Agente activado' : 'Agente pausado', 'info') }} /></div>
      <p className="small muted" style={{ margin: '12px 0', minHeight: 44, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.prompt || 'Sin instrucciones'}</p>
      <div className="row"><span className="badge b-violet"><Mic size={10} />{a.voice}</span><span className={'badge ' + (a.active ? 'b-green' : 'b-gray')}>{a.active ? 'ACTIVO' : 'PAUSADO'}</span><span className="sp" />
        <button className="btn btn-o btn-sm" onClick={() => setTest(a)}><MessageSquare size={12} />Probar</button>
        <Menu right trigger={<button className="icon-btn"><Pencil size={13} /></button>} items={[{ icon: <Pencil size={13} />, label: 'Editar', onClick: () => setForm(a) }, { icon: <Copy size={13} />, label: 'Duplicar', onClick: () => setAgents(x => [...x, { ...a, id: uid(), name: a.name + ' (copia)' }]) }, { icon: <Download size={13} />, label: 'Exportar', onClick: () => { const l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([JSON.stringify(a)])); l.download = a.name + '.json'; l.click() } }, '-', { icon: <Trash2 size={13} />, label: 'Eliminar', danger: true, onClick: () => setDel(a.id) }]} /></div>
    </div>)}</div> : <div className="card"><Empty icon={<Bot size={30} />} title="Ningún agente todavía" text="Crea el primero para empezar." action={<button className="btn btn-p" onClick={() => setForm(blank)}><Plus size={14} />Crear el primer agente</button>} /></div>
      : <div className="grid g4 stagger">{VOICES.map(v => <div key={v[0]} className="card lift" style={{ padding: 16 }}><div className="row"><div style={{ width: 38, height: 38, borderRadius: 50, background: 'var(--psoft)', color: 'var(--p)', display: 'grid', placeItems: 'center' }}><Volume2 size={17} /></div><div><b>{v[0]}</b><div className="small muted">{v[1]}</div></div></div>
        <div className="row" style={{ gap: 2, margin: '14px 0', height: 26, alignItems: 'center' }}>{Array.from({ length: 28 }, (_, i) => <span key={i} style={{ flex: 1, borderRadius: 2, background: 'var(--p)', opacity: .5, height: 4 + Math.abs(Math.sin(i * 1.7 + v[0].length)) * 20 }} />)}</div>
        <button className="btn btn-g btn-sm" style={{ width: '100%' }} onClick={() => speak(v)}><Play size={12} />Escuchar muestra</button></div>)}</div>}

    <Modal lg open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Editar agente' : 'Nuevo agente'} sub="Configura la personalidad y el conocimiento del agente" icon={<Bot size={18} />} footer={<><button className="btn btn-g" onClick={() => setForm(null)}>Cancelar</button><button className="btn btn-p" onClick={save}>Guardar agente</button></>}>
      {form && <><div className="grid g2"><div className="field"><label className="lb">Nombre *</label><input className="input" autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Sofía, asesora de ventas" /></div>
        <div className="field"><label className="lb">Modelo</label><select className="input" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })}>{MODELS.map(m => <option key={m[0]}>{m[0]}</option>)}</select></div></div>
        <div className="field"><label className="lb">Instrucciones (prompt)</label><textarea className="input" style={{ minHeight: 140 }} value={form.prompt} onChange={e => setForm({ ...form, prompt: e.target.value })} placeholder="Describe cómo debe comportarse, qué vende, precios, objeciones…" /></div>
        <div className="grid g2"><div className="field"><label className="lb">Voz</label><select className="input" value={form.voice} onChange={e => setForm({ ...form, voice: e.target.value })}>{VOICES.map(v => <option key={v[0]}>{v[0]}</option>)}</select></div>
          <div className="field"><label className="lb">Creatividad: {form.temp}</label><input type="range" min="0" max="1" step=".1" value={form.temp} onChange={e => setForm({ ...form, temp: +e.target.value })} style={{ width: '100%', accentColor: '#005ae3', marginTop: 8 }} /></div></div></>}</Modal>
    <Modal lg open={models} onClose={() => setModels(false)} title="Modelos disponibles" sub="Consumo de tokens por mensaje" icon={<Cpu size={18} />}>
      <div className="grid g2">{MODELS.map(m => <div key={m[0]} className="card lift" style={{ padding: 14 }}><div className="row"><Cpu size={16} color="#005ae3" /><b>{m[0]}</b><span className="sp" /><span className="badge b-violet">{m[2]}x tokens</span></div><div className="small muted" style={{ marginTop: 6 }}>{m[1]}</div></div>)}</div></Modal>
    <Modal open={ai} onClose={() => setAi(false)} title="Crear con IA" sub="Describe tu negocio y generamos el agente" icon={<Sparkles size={18} />} footer={<><button className="btn btn-g" onClick={() => setAi(false)}>Cancelar</button><button className="btn btn-p" onClick={generate} disabled={gen}>{gen ? <><Sparkles size={13} className="spin" />Generando…</> : <><Sparkles size={13} />Generar agente</>}</button></>}>
      <textarea className="input" autoFocus value={aiTxt} onChange={e => setAiTxt(e.target.value)} style={{ minHeight: 120 }} placeholder="Ej: Vendo un ebook de recetas saludables a PEN 29,90. Acepto Yape y tarjeta. Entrego por WhatsApp al instante." /></Modal>
    {test && <TestChat agent={test} onClose={() => setTest(null)} />}
    <Confirm open={!!del} onClose={() => setDel(null)} onOk={() => { setAgents(a => a.filter(x => x.id !== del)); toast('Agente eliminado') }} title="Eliminar agente" />
  </div>
}

function TestChat({ agent, onClose }) {
  const [msgs, setMsgs] = useState([{ f: 'in', x: `¡Hola! Soy ${agent.name} 👋 ¿En qué te puedo ayudar?` }]); const [t, setT] = useState(''); const [typing, setTyping] = useState(false); const end = useRef()
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [msgs, typing])
  const R = ['¡Claro! Te cuento: el producto tiene acceso inmediato y garantía de 7 días 😊', 'El precio es PEN 29,90. ¿Te envío el link de pago?', 'Aceptamos Yape, Plin y tarjeta 💳', '¡Perfecto! Aquí tienes tu enlace: ariabot.app/pay/demo 🚀']
  const send = () => { if (!t.trim()) return; setMsgs(m => [...m, { f: 'out', x: t }]); setT(''); setTyping(true); setTimeout(() => { setTyping(false); setMsgs(m => [...m, { f: 'in', x: R[Math.floor(m.length / 2) % R.length] }]) }, 1200) }
  return <Modal open onClose={onClose} title={'Probar: ' + agent.name} sub={agent.model} icon={<Bot size={18} />}>
    <div className="msgs" style={{ height: 320, borderRadius: 8, border: '1px solid var(--border)', padding: 12 }}>{msgs.map((m, i) => <div key={i} className={'msg ' + (m.f === 'in' ? 'in' : 'out')} style={{ maxWidth: '80%' }}>{m.x}</div>)}{typing && <div className="msg in typing"><span /><span /><span /></div>}<div ref={end} /></div>
    <div className="row" style={{ marginTop: 10 }}><input className="input" autoFocus value={t} onChange={e => setT(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Escribe como si fueras el cliente…" /><button className="btn btn-p" onClick={send}><Send size={14} /></button></div></Modal>
}
