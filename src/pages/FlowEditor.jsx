import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Pause, Play, Languages, Archive, LayoutGrid, Search, ZoomIn, ZoomOut, Maximize2, RotateCcw, MessageSquare, FileText, Tag, CreditCard, List, Save, MessageCircle, Bell, GitBranch, Share2, Target, Clock, Building2, Globe, Bot, Kanban, SlidersHorizontal, DollarSign, Wallet, PhoneCall, Sparkles, Copy, Trash2, X, Send, Image, Video, Mic, User, File, Sticker, GripVertical, Bold, Italic, Strikethrough, Smile, Code, WandSparkles, Upload, Link2, Repeat, CirclePlay, Workflow } from 'lucide-react'
import { useStore, useToast, uid, nowStr, useOutside } from '../ui'
import { LModal, LSelect, Toggle } from './leona'

export const FB = {
  inicio: ['Início', '#16a34a', CirclePlay, 'Nodo de inicio del flujo', ['#22c55e', '#16a34a']],
  mensaje: ['Mensaje', '#3b82f6', MessageSquare, 'Envía texto, imagen, audio o video'],
  template: ['Template WhatsApp', '#2563eb', FileText, 'Envía una plantilla aprobada por Meta'],
  etiquetas: ['Etiquetas', '#818cf8', Tag, 'Añadir o quitar etiquetas del cliente'],
  pix: ['Botón PIX', '#22c55e', CreditCard, 'Botón de pago rápido con QR'],
  menu: ['Menú', '#a855f7', List, 'Opciones para que el cliente elija'],
  carrusel: ['Carrusel', '#0ea5e9', LayoutGrid, 'Tarjetas deslizables con botones'],
  esperar: ['Esperar respuesta', '#f97316', Save, 'Pausa hasta que el cliente responda'],
  controlador: ['Controlador de chat', '#94a3b8', MessageCircle, 'Abre o cierra la atención'],
  notificacion: ['Notificación', '#14b8a6', Bell, 'Avisa al equipo por WhatsApp o correo'],
  condicional: ['Condicional', '#38bdf8', GitBranch, 'Divide el flujo según condiciones'],
  distribuidor: ['Distribuidor', '#f59e0b', GitBranch, 'Reparte leads entre caminos (A/B)'],
  conexion: ['Conexión de flujo', '#f43f5e', Share2, 'Redirige a otro flujo'],
  pixel: ['Pixel', '#eab308', Target, 'Dispara eventos en herramientas de anuncios'],
  intervalo: ['Intervalo inteligente', '#06b6d4', Clock, 'Espera un tiempo antes de continuar'],
  departamento: ['Departamento', '#8b5cf6', Building2, 'Transfiere a un departamento'],
  integracion: ['Integración', '#3b82f6', Globe, 'Webhook / API externa'],
  ia: ['Bloque de IA', '#10b981', Bot, 'Respuestas inteligentes con GPT o Gemini'],
  agente: ['Agente de IA', '#d97706', Bot, 'Un agente responde dudas y cierra la venta'],
  kanban: ['Kanban', '#a855f7', Kanban, 'Mueve el lead a una columna del tablero'],
  manipulador: ['Manipulador', '#f97316', SlidersHorizontal, 'Actualiza datos del contacto'],
  venta: ['Venta aprobada', '#4ade80', DollarSign, 'Registra la venta en el dashboard'],
  pago: ['Pago', '#a78bfa', CreditCard, 'Genera un cobro y continúa el flujo'],
  ariapay: ['Leona Pay', '#6366f1', Wallet, 'Cobro integrado con estados de pago'],
  llamar: ['Llamar', '#14b8a6', PhoneCall, 'Realiza una llamada de voz'],
  kie: ['Integración Kie.ai', '#d946ef', Sparkles, 'Genera imágenes o videos con IA'],
}
const B = t => FB[t] || FB.mensaje
const NW = 260, NH = 150, OUTY = 108
const newNode = (type, x, y) => ({ id: uid(), type, x, y, title: B(type)[0], desc: '', actions: [], stats: [0, 0, 0] })

const ACT = {
  text: ['Texto', MessageSquare, '#3b82f6', 'Mensaje de texto'], image: ['Imagen', Image, '#22c55e'], video: ['Vídeo', Video, '#a855f7'], audio: ['Audio', Mic, '#f97316'],
  delay: ['Intervalo', Clock, '#06b6d4', 'Retraso entre mensajes'], contact: ['Contacto', User, '#ec4899'], file: ['Archivo', File, '#6366f1'], sticker: ['Sticker', Sticker, '#f59e0b'],
}
const actBlank = t => ({ id: uid(), type: t, text: '', src: 'file', url: '', caption: '', file: null, typing: 3, rec: 6, voice: true, once: false, del: false, delTag: '', mode: 'normal', min: 0, max: 120, cname: '', cphone: '', ai: '' })

function Editor({ value, onChange, ph, magic, rows }) {
  const ta = useRef()
  const wrap = (a, b = a) => { const el = ta.current, s = el.selectionStart, e = el.selectionEnd; onChange(value.slice(0, s) + a + value.slice(s, e) + b + value.slice(e)); requestAnimationFrame(() => { el.focus(); el.selectionStart = s + a.length; el.selectionEnd = e + a.length }) }
  return <div className="fe-ed"><textarea ref={ta} value={value} onChange={e => onChange(e.target.value)} placeholder={ph} style={rows ? { minHeight: rows } : null} />
    <div className="tb"><button onClick={() => wrap('*')}><Bold size={16} /></button><button onClick={() => wrap('_')}><Italic size={16} /></button><button onClick={() => wrap('~')}><Strikethrough size={16} /></button>
      <button onClick={() => wrap('😊', '')}><Smile size={16} /></button><button onClick={() => wrap('{', '}')}><Code size={16} /></button>
      {magic && <><span style={{ width: 1, height: 18, background: 'var(--border2)', margin: '0 3px' }} /><button onClick={magic}><WandSparkles size={16} color="#a78bfa" /></button></>}</div></div>
}
const Range = ({ label, v, max, set, unit = 's' }) => <><div style={{ display: 'flex', fontSize: 13.3, color: 'var(--soft)', marginTop: 15 }}><span>{label}</span><b style={{ margin: '0 auto', color: 'var(--text)' }}>{v} {unit}</b><span>{max} {unit}</span></div>
  <input type="range" className="fe-rng" min="0" max={max} value={v} onChange={e => set(+e.target.value)} style={{ marginTop: 9, background: `linear-gradient(90deg,#22d3ee ${v / max * 100}%,#374151 0)` }} /></>
function DelTag({ a, set, tags }) {
  return <><div className="fe-sep" /><div style={{ display: 'flex', alignItems: 'center' }}><b style={{ fontSize: 13.3, color: a.del ? 'var(--text)' : 'var(--soft)', fontWeight: a.del ? 700 : 500 }}>Eliminar mensaje al aplicar etiqueta</b><span style={{ marginLeft: 'auto' }}><Toggle on={a.del} onChange={v => set({ del: v })} /></span></div>
    <div className="fe-small" style={{ marginTop: 4 }}>Cuando se agregue la etiqueta seleccionada al chat, este mensaje se eliminará en WhatsApp.<br />Nota: para tiempos muy largos, la eliminación puede no funcionar.</div>
    {a.del && <><div className="fe-lb" style={{ marginTop: 14 }}>Etiqueta que activa la eliminación</div><LSelect className="l-in" value={a.delTag} onChange={v => set({ delTag: v })} placeholder="Buscar etiqueta..." options={tags.map(t => ({ value: t, label: t }))} /></>}</>
}
function Media({ a, set, kind, tags }) {
  const toast = useToast(); const L = { image: ['2MB', 'JPG preferible; también PNG, WebP, HEIC, HEIF', 'image/*', 2, 'Enviar imagen'], video: ['5MB', 'MP4 recomendado en WhatsApp; en la subida de archivo también: WebM, OGG, MOV, M4V', 'video/*', 5, 'Enviar vídeo'], audio: ['', 'Formatos admitidos: MP3 y OGG. Máximo 16MB', 'audio/*', 16, 'Enviar audio'], file: ['100MB', 'PDF, DOCX, XLSX, ZIP y otros', '*', 100, 'Enviar archivo'], sticker: ['100KB', 'WebP 512×512 recomendado', 'image/webp,image/png', .1, 'Enviar sticker'] }[kind]
  const Ic = ACT[kind][1]
  const pick = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = L[2]; i.onchange = () => { const f = i.files[0]; if (!f) return; if (f.size > L[3] * 1048576) return toast('El archivo supera el tamaño máximo', 'err'); set({ file: { name: f.name, size: f.size } }) }; i.click() }
  const tabs = [['file', 'Archivo', Upload], ['url', 'URL', Link2], ...(kind === 'audio' ? [['ai', 'IA', WandSparkles]] : [])]
  return <>
    {!['sticker', 'file'].includes(kind) || true ? <div className="fe-seg">{tabs.map(([k, l, I]) => <button key={k} className={a.src === k ? 'on' : ''} onClick={() => set({ src: k })}><I size={15} />{l}</button>)}</div> : null}
    {kind === 'video' && <><div className="fe-seg sm" style={{ marginBottom: 10 }}>{[['normal', 'Normal', Video], ['auto', 'Autoplay', Repeat], ['msg', 'Video mensaje', MessageCircle]].map(([k, l, I]) => <button key={k} className={a.mode === k ? 'on' : ''} onClick={() => set({ mode: k })}><I size={13} />{l}</button>)}</div>
      <div className="fe-small" style={{ marginBottom: 14 }}>Normal: envío estándar. Autoplay: comportamiento visual de bucle/reproducción automática en WhatsApp. Vídeo msg.: formato de mensaje de vídeo de la app.</div></>}
    {a.src === 'file' && <div className="fe-drop"><span className="ic"><Ic size={30} /></span>{a.file ? <><b style={{ color: 'var(--text)' }}>{a.file.name}</b><small>{(a.file.size / 1024).toFixed(0)} KB</small></> : <>{L[0] && <b>Tamaño máximo permitido: {L[0]}</b>}<small style={kind === 'audio' ? { fontSize: 13.3 } : null}>{L[1]}</small>
      {kind === 'audio' && <small style={{ color: '#fb923c' }}>Para enviar como grabado en la API oficial, el audio debe ser .ogg con codec Opus. <u>Convierte tu audio aquí</u></small>}</>}<button className="bt" onClick={pick}>{a.file ? 'Cambiar archivo' : L[4]}</button></div>}
    {a.src === 'url' && <><div className="fe-lb">URL del medio *</div><Editor value={a.url} onChange={v => set({ url: v })} ph="https://ejemplo.com/imagen.jpg o {imagen_producto}" rows={90} />
      <div className="fe-small" style={{ marginTop: 8 }}>Pegue una URL pública o use variables del sistema (como <code>{'{nome_campo}'}</code>, <code>{'{nome}'}</code>). La URL se resuelve al ejecutar el flujo.</div>
      {['image', 'video'].includes(kind) && <><div className="fe-lb" style={{ marginTop: 16 }}>Leyenda</div><Editor value={a.caption} onChange={v => set({ caption: v })} ph="Leyenda (opcional)..." rows={90} /></>}</>}
    {a.src === 'ai' && <div style={{ border: '1.5px dashed var(--border2)', borderRadius: 9, padding: '16px 17px' }}>
      <div style={{ textAlign: 'center' }}><span style={{ width: 68, height: 68, borderRadius: 9, background: '#6b21a8', display: 'inline-grid', placeItems: 'center', color: '#d8b4fe' }}><Mic size={30} /></span><div style={{ fontSize: 13.3, fontWeight: 700, marginTop: 10 }}>Generar audio con IA <WandSparkles size={14} color="#a78bfa" /></div></div>
      <div className="fe-lb" style={{ marginTop: 14 }}>Voz / Clave IA<span style={{ marginLeft: 'auto', fontSize: 12, color: '#c084fc' }}>Administrar claves</span></div>
      <div className="fe-help" style={{ marginTop: 0, fontSize: 13.3 }}>No hay claves ElevenLabs registradas.</div>
      <div className="fe-lb" style={{ marginTop: 14 }}>Voz</div><select className="l-in" style={{ height: 37 }} disabled><option>Selecciona la voz...</option></select>
      <div className="fe-lb" style={{ marginTop: 14 }}>Modelo de voz</div><select className="l-in" style={{ height: 37 }} defaultValue="v2"><option value="v3">Eleven v3, más expresivo</option><option value="v2">Multilingual v2, más natural</option><option value="turbo">Turbo v2.5, más rápido</option><option value="flash">Flash v2.5, el más rápido</option></select>
      <div className="fe-small" style={{ marginTop: 7 }}>Eleven v3 es el más expresivo (admite etiquetas como [whispers] y [laughs]). Multilingual v2 suena natural en portugués. Turbo y Flash son más rápidos.</div>
      <div className="fe-lb" style={{ marginTop: 14 }}>Texto para convertir</div><Editor value={a.ai} onChange={v => set({ ai: v })} ph="Escribe el texto que se transformará en audio..." rows={90} />
      <div className="fe-small" style={{ marginTop: 7 }}>Ejemplo: Hola {'{nombre}'}, tu pedido {'{pedido}'} fue aprobado y se entregará en {'{ciudad}'}.</div></div>}
    {['image', 'video', 'audio'].includes(kind) && <div className="fe-once"><label><input type="checkbox" checked={a.once} onChange={e => set({ once: e.target.checked })} style={{ width: 16, height: 16 }} />Enviar en visualización única</label><p>La visualización única es una función de WhatsApp Web y Mobile; aún no está disponible en la API oficial</p></div>}
    {kind === 'audio' && <><Range label='Retraso de "grabando"' v={a.rec} max={120} set={v => set({ rec: v })} /><div className="fe-help">Tiempo que WhatsApp mostrará "grabando" antes de enviar el audio.</div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.3, fontWeight: 600, marginTop: 13, cursor: 'pointer' }}><input type="checkbox" checked={a.voice} onChange={e => set({ voice: e.target.checked })} style={{ width: 16, height: 16 }} />Enviar como nota de voz</label></>}
    <DelTag a={a} set={set} tags={tags} />
  </>
}

function MessageModal({ node, onClose, onSave }) {
  const [acts, setActs] = useState(node.actions || []); const [tags] = useStore('tags', []); const [contacts] = useStore('contacts', [])
  const tagNames = [...new Set([...tags.map(t => t.name), ...contacts.flatMap(c => c.tags || [])])]
  const set = (i, p) => setActs(x => x.map((a, j) => j === i ? { ...a, ...p } : a))
  const drag = useRef(null)
  return <div className="lm-ov" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="lm" style={{ maxWidth: 546, height: acts.length ? '92vh' : 'auto' }}>
    <div className="fe-mh"><span className="ic" style={{ background: '#3b82f6' }}><MessageSquare size={20} /></span><h2>Editar mensaje</h2><button style={{ marginLeft: 'auto', color: 'var(--muted)', display: 'grid' }} onClick={onClose}><X size={19} /></button></div>
    <div className="lm-b" style={{ padding: '24px 22px 0', flex: 1 }}>
      {acts.length === 0 && <div style={{ border: '1px solid var(--border)', borderRadius: 7, padding: '18px 20px', textAlign: 'center', color: 'var(--soft)', fontSize: 13.3, lineHeight: 1.5 }}><MessageSquare size={28} style={{ color: 'var(--soft)', marginBottom: 7 }} /><br />Ninguna acción configurada. Añada mensajes de texto o multimedia.</div>}
      {acts.map((a, i) => { const [l, I, c, t2] = ACT[a.type]; return <div key={a.id} className="fe-blk" draggable onDragStart={() => drag.current = i} onDragOver={e => e.preventDefault()} onDrop={() => { const f = drag.current; if (f == null || f === i) return; setActs(x => { const y = [...x]; const [m] = y.splice(f, 1); y.splice(i, 0, m); return y }) }}>
        <div className="fe-bh"><I size={16} color={c} />{t2 || l}<span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}><button style={{ cursor: 'grab' }} title="Arrastrar"><GripVertical size={16} /></button><button onClick={() => setActs(x => x.filter((_, j) => j !== i))}><Trash2 size={16} /></button></span></div>
        {a.type === 'text' && <><div className="fe-lb">Contenido del mensaje *</div><Editor value={a.text} onChange={v => set(i, { text: v })} ph="Escriba el contenido del mensaje..." magic={() => set(i, { showAi: !a.showAi })} />
          {a.showAi && <><div className="fe-lb" style={{ marginTop: 14 }}>IA<span style={{ marginLeft: 'auto', fontSize: 12, color: '#c084fc' }}>Administrar claves</span></div><LSelect className="l-in" bold value={a.aiKey || ''} onChange={v => set(i, { aiKey: v })} placeholder="Selecciona una IA..." options={[]} /></>}
          <Range label='Retraso de "escribiendo"' v={a.typing} max={60} set={v => set(i, { typing: v })} /><div className="fe-help">Tiempo que WhatsApp mostrará "escribiendo" antes de enviar este mensaje.</div><DelTag a={a} set={p => set(i, p)} tags={tagNames} /></>}
        {['image', 'video', 'audio', 'file', 'sticker'].includes(a.type) && <Media a={a} set={p => set(i, p)} kind={a.type} tags={tagNames} />}
        {a.type === 'delay' && <><div className="fe-lb" style={{ color: 'var(--text)' }}>Retraso entre mensajes</div>
          <div style={{ display: 'flex', fontSize: 13.3, color: 'var(--soft)' }}><span>0 s</span><b style={{ margin: '0 auto', color: 'var(--text)' }}>{a.min} - {a.max} s</b><span>120 s</span></div>
          <div className="fe-dual" style={{ marginTop: 9 }}><div style={{ position: 'absolute', top: 7, left: 0, right: 0, height: 7, borderRadius: 7, background: `linear-gradient(90deg,#374151 ${a.min / 1.2}%,#22d3ee ${a.min / 1.2}% ${a.max / 1.2}%,#374151 ${a.max / 1.2}%)` }} />
            <input type="range" className="fe-rng" min="0" max="120" value={a.min} onChange={e => set(i, { min: Math.min(+e.target.value, a.max) })} /><input type="range" className="fe-rng" min="0" max="120" value={a.max} onChange={e => set(i, { max: Math.max(+e.target.value, a.min) })} /></div>
          <div className="fe-small" style={{ marginTop: 9 }}>El retraso se elige al azar entre el mínimo y el máximo configurados</div></>}
        {a.type === 'contact' && <><div className="fe-help" style={{ marginTop: 0, marginBottom: 14 }}>Puedes usar variables como {'{instance_number}'}, {'{instance_name}'}, {'{full_name}'}, {'{phone_number}'} y campos del contacto. Las mismas que en el texto del mensaje. Se resuelven al enviar el flujo.</div>
          <div className="fe-lb">Nombre del contacto *</div><input className="l-in" style={{ height: 40, background: '#374151' }} value={a.cname} onChange={e => set(i, { cname: e.target.value })} placeholder="Ej.: Juan Pérez" />
          <div className="fe-lb" style={{ marginTop: 14 }}>Teléfono del contacto *</div><input className="l-in" style={{ height: 40, background: '#374151' }} value={a.cphone} onChange={e => set(i, { cphone: e.target.value })} placeholder="Ej.: +51999999999" /></>}
      </div> })}
      <div style={{ fontSize: 15, fontWeight: 700, margin: acts.length ? '6px 0 14px' : '27px 0 14px' }}>Añadir contenido</div>
      <div className="fe-add">{Object.entries(ACT).map(([k, [l, I, c]]) => <button key={k} onClick={() => setActs(x => [...x, actBlank(k)])}><i style={{ background: c + '55', color: c }}><I size={17} /></i>{l}</button>)}</div>
    </div>
    <div style={{ margin: '0 22px', borderTop: '1px solid var(--border)', padding: '14px 0 22px', display: 'flex', justifyContent: 'flex-end', gap: 11, marginTop: 17 }}>
      <button className="lb2 g" onClick={onClose}>Cancelar</button><button className="lb2 p" onClick={() => onSave({ ...node, actions: acts, desc: acts.find(a => a.text)?.text || (acts.length ? acts.map(a => ACT[a.type][0]).join(' · ') : '') })}>Guardar</button></div>
  </div></div>
}

function NodeModal({ node, onClose, onSave }) {
  const [n, setN] = useState(node); const [, c, I] = B(node.type)
  const info = node.type === 'inicio' ? 'Este nó marca o início do fluxo. Não executa nenhuma ação específica.' : B(node.type)[3] + '. La configuración avanzada de este bloque se completa al conectar el servicio.'
  return <div className="lm-ov" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="lm" style={{ maxWidth: 540 }}>
    <div className="fe-mh"><span className="ic" style={{ background: node.type === 'inicio' ? '#22c55e' : c }}><I size={20} /></span><h2>Editar {node.type === 'inicio' ? 'inicio' : B(node.type)[0].toLowerCase()}</h2><button style={{ marginLeft: 'auto', color: 'var(--muted)', display: 'grid' }} onClick={onClose}><X size={19} /></button></div>
    <div style={{ padding: '18px 25px 0' }}>
      <div style={{ display: 'flex', gap: 13, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}><I size={20} color="#a78bfa" style={{ marginTop: 3 }} /><div><b style={{ fontSize: 16.5 }}>{node.type === 'inicio' ? 'Inicio' : B(node.type)[0]}</b><div style={{ fontSize: 13, color: 'var(--soft)', marginTop: 2 }}>{node.type === 'inicio' ? 'Nodo de inicio del flujo' : B(node.type)[3]}</div></div></div>
      <div className="fe-lb" style={{ marginTop: 20 }}>Nombre *</div><input className="l-in" style={{ height: 41, background: 'var(--in2)', fontWeight: 700 }} value={n.title} onChange={e => setN({ ...n, title: e.target.value })} />
      <div className="fe-lb" style={{ marginTop: 17 }}>Descripción</div><textarea className="l-in" style={{ height: 82, padding: '11px 13px', background: 'var(--in2)', resize: 'vertical' }} value={n.desc} onChange={e => setN({ ...n, desc: e.target.value })} placeholder="Descripción opcional del nodo" />
      <div style={{ border: '1px solid var(--border)', borderRadius: 7, padding: '13px 14px', fontSize: 13.3, color: 'var(--soft)', lineHeight: 1.5, marginTop: 33 }}>{info}</div>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 17, padding: '13px 0 22px', display: 'flex', justifyContent: 'flex-end', gap: 11 }}>
        <button className="lb2 g" onClick={onClose}>Cancelar</button><button className="lb2 p" disabled={!n.title.trim()} onClick={() => onSave(n)}>Guardar</button></div>
    </div></div></div>
}

const LANGS = [['de', 'Deutsch (Deutschland) EUR'], ['en', 'English (United States) USD'], ['es', 'Español (España) EUR'], ['es-MX', 'Español (México) MXN'], ['es-PE', 'Español (Perú) PEN'], ['fr', 'Français (France) EUR'], ['it', 'Italiano (Italia) EUR'], ['pt', 'Português (Brasil) BRL']]
function TranslateModal({ flow, onClose }) {
  const toast = useToast(); const [lang, setLang] = useState('de'); const [o, setO] = useState({ audio: false, image: true, pdf: false })
  const all = flow.nodes.flatMap(n => n.actions || [])
  const words = flow.nodes.reduce((a, n) => a + (n.title + ' ' + (n.desc || '') + ' ' + (n.actions || []).map(x => x.text + ' ' + x.caption).join(' ')).trim().split(/\s+/).length, 0)
  const t = Math.max(4, Math.ceil(words / 5)), au = o.audio ? all.filter(a => a.type === 'audio').length * 30 : 0, im = o.image ? all.filter(a => a.type === 'image').length * 10 : 0, pd = o.pdf ? all.filter(a => a.type === 'file').length * 20 : 0
  return <LModal open onClose={onClose} title="Traducir flujo" icon={<Languages size={20} />} width={472} bodyStyle={{ padding: '16px 22px 0' }}>
    <div style={{ fontSize: 13.3, color: 'var(--soft)' }}>{flow.name}</div>
    <div className="fe-lb" style={{ marginTop: 16, fontWeight: 500 }}>Idioma del embudo</div>
    <LSelect className="l-in" bold value={lang} onChange={setLang} options={LANGS.map(([value, label]) => ({ value, label: value.slice(0, 2).toUpperCase() + '  ' + label }))} />
    {[['text', 'Texto (siempre incluido)'], ['audio', 'Audio'], ['image', 'Imagen'], ['pdf', 'PDF']].map(([k, l]) => <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.3, marginTop: 17, cursor: k === 'text' ? 'default' : 'pointer', color: 'var(--soft)' }}><input type="checkbox" disabled={k === 'text'} checked={k === 'text' || o[k]} onChange={e => setO({ ...o, [k]: e.target.checked })} style={{ width: 15, height: 15 }} />{l}</label>)}
    <div className="fe-small" style={{ marginTop: 17 }}>Títulos de botón/opción, PIX y venta registrada con BRL no se convierten. Ajusta esos valores a {LANGS.find(x => x[0] === lang)[1].split(' ').pop()} en la copia.</div>
    <div style={{ border: '1px solid var(--border)', borderRadius: 7, padding: '12px 13px', marginTop: 14 }}><b style={{ fontSize: 13.3 }}>{t + au + im + pd} tokens</b><div style={{ fontSize: 13.3, color: 'var(--soft)', marginTop: 5 }}>Texto {t} · Audio {au} · Imagen {im} · PDF {pd}</div></div>
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 18, padding: '15px 0 16px', display: 'flex', justifyContent: 'flex-end', gap: 11 }}>
      <button className="lb2 g" onClick={onClose}>Cancelar</button><button className="lb2 p" onClick={() => { onClose(); toast('Necesitas créditos para traducir: redirigiendo a la compra de tokens', 'info') }}>Comprar créditos</button></div>
  </LModal>
}

function Simulator({ flow, onClose, onStep }) {
  const [msgs, setMsgs] = useState([]); const [txt, setTxt] = useState(''); const [state, setState] = useState(null); const end = useRef()
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length])
  const fill = s => s.replace(/\{(full_name|first_name|nome|nombre)\}/g, 'Cliente').replace(/\{phone_number\}/g, '+51999999999').replace(/\{saludo\}/g, 'Buenas noches')
  const run = async start => {
    let cur = start; const seen = new Set()
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id); onStep(cur.id)
      for (const a of cur.actions || []) {
        await new Promise(r => setTimeout(r, 450))
        const m = a.type === 'text' ? fill(a.text) : a.type === 'delay' ? null : `[${ACT[a.type][0]}${a.file ? ': ' + a.file.name : a.url ? ': ' + a.url : ''}]${a.caption ? '\n' + fill(a.caption) : ''}`
        if (m) setMsgs(x => [...x, { f: 'bot', x: m }])
      }
      if (cur.type === 'esperar' || cur.type === 'menu') { setState(cur.id); setMsgs(x => [...x, { f: 'sys', x: 'Esperando respuesta…' }]); return }
      if (!['inicio', 'mensaje'].includes(cur.type)) { await new Promise(r => setTimeout(r, 350)); setMsgs(x => [...x, { f: 'sys', x: `▸ ${cur.title}` }]) }
      const e = flow.edges.find(x => x.from === cur.id); cur = e && flow.nodes.find(n => n.id === e.to)
    }
    onStep(null); setState('done'); setMsgs(x => [...x, { f: 'sys', x: 'Fin del flujo' }])
  }
  const send = () => {
    if (!txt.trim()) return; setMsgs(x => [...x, { f: 'me', x: txt }]); setTxt('')
    if (state && state !== 'done') { const e = flow.edges.find(x => x.from === state); setState(null); const n = e && flow.nodes.find(x => x.id === e.to); if (n) run(n); else setMsgs(x => [...x, { f: 'sys', x: 'Fin del flujo' }]) }
    else if (!state) run(flow.nodes.find(n => n.type === 'inicio') || flow.nodes[0])
  }
  return <div className="fe-sim">
    <div className="h"><i><MessageCircle size={19} /></i><div style={{ minWidth: 0, flex: 1 }}><b style={{ fontSize: 14 }}>Simulador</b><div style={{ fontSize: 12, opacity: .85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Prueba local, sin WhatsApp y sin guardar datos</div></div>
      <button title="Reiniciar" onClick={() => { setMsgs([]); setState(null); onStep(null) }}><RotateCcw size={17} /></button><button onClick={onClose}><X size={18} /></button></div>
    <div className="b">{msgs.length === 0 && <div className="m sys">Envía un mensaje para comenzar la prueba.</div>}{msgs.map((m, i) => <div key={i} className={'m ' + m.f}>{m.x}</div>)}<div ref={end} /></div>
    <div className="f"><input value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={state === 'done' ? 'Reinicia para probar de nuevo' : 'Escribe para comenzar...'} /><button onClick={send}><Send size={17} /></button></div>
  </div>
}

export default function FlowEditor() {
  const { id } = useParams(); const nav = useNavigate(); const toast = useToast()
  const [flows, setFlows] = useStore('flows', [])
  const flow = flows.find(f => f.id === id)
  const [view, setView] = useState({ x: 0, y: 0, k: 1 }); const [ready, setReady] = useState(false)
  const [panel, setPanel] = useState(null); const [pq, setPq] = useState(''); const [sel, setSel] = useState(null); const [run, setRun] = useState(null)
  const [link, setLink] = useState(null); const [edit, setEdit] = useState(null); const [rename, setRename] = useState(false); const [modal, setModal] = useState(null)
  const box = useRef(); const act = useRef(null)
  const setFlow = useCallback(fn => setFlows(fs => fs.map(f => f.id === id ? { ...fn(f), updated: nowStr() } : f)), [id, setFlows])
  const toWorld = (cx, cy) => { const r = box.current.getBoundingClientRect(); return { x: (cx - r.left - view.x) / view.k, y: (cy - r.top - view.y) / view.k } }
  const fit = () => { if (!flow?.nodes.length || !box.current) return; const r = box.current.getBoundingClientRect(); const xs = flow.nodes.map(n => n.x), ys = flow.nodes.map(n => n.y)
    const minX = Math.min(...xs) - 60, minY = Math.min(...ys) - 60, w = Math.max(...xs) + NW + 60 - minX, h = Math.max(...ys) + NH + 60 - minY, k = Math.min(1.8, r.width / w, (r.height - 60) / h); setView({ k, x: -minX * k + (r.width - w * k) / 2, y: -minY * k + (r.height - h * k) / 2 + 10 }) }
  useEffect(() => { if (flow && !ready && box.current) { fit(); setReady(true) } })
  useEffect(() => {
    const move = e => { const a = act.current; if (!a) return
      if (a.t === 'pan') setView(v => ({ ...v, x: a.vx + e.clientX - a.sx, y: a.vy + e.clientY - a.sy }))
      if (a.t === 'node') setFlow(f => ({ ...f, nodes: f.nodes.map(n => n.id === a.id ? { ...n, x: a.nx + (e.clientX - a.sx) / view.k, y: a.ny + (e.clientY - a.sy) / view.k } : n) }))
      if (a.t === 'link') setLink(l => l && { ...l, ...toWorld(e.clientX, e.clientY) }) }
    const up = () => { if (act.current?.t === 'link') setLink(null); act.current = null; box.current?.classList.remove('panning') }
    addEventListener('mousemove', move); addEventListener('mouseup', up); return () => { removeEventListener('mousemove', move); removeEventListener('mouseup', up) }
  })
  useEffect(() => { const el = box.current; if (!el) return
    const wheel = e => { e.preventDefault(); const r = el.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top
      setView(v => { const k = Math.min(2.5, Math.max(.25, v.k * (e.deltaY < 0 ? 1.1 : .9))); return { k, x: mx - (mx - v.x) * k / v.k, y: my - (my - v.y) * k / v.k } }) }
    el.addEventListener('wheel', wheel, { passive: false }); return () => el.removeEventListener('wheel', wheel) }, [flow?.id])
  useEffect(() => { const k = e => { if ((e.key === 'Delete') && sel && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) removeNode(sel) }; addEventListener('keydown', k); return () => removeEventListener('keydown', k) })
  if (!flow) return <div className="lp"><div className="fl-empty"><Workflow size={44} className="big" /><h3>Flujo no encontrado</h3><button className="lp-btn p" style={{ marginTop: 18 }} onClick={() => nav('/flows')}>Volver a Flujos</button></div></div>
  const addNode = type => {
    const src = flow.nodes.find(n => n.id === sel) || [...flow.nodes].sort((a, b) => b.x - a.x)[0]
    let x = src ? src.x + NW + 80 : 0, y = src ? src.y : 0
    while (flow.nodes.some(n => Math.abs(n.x - x) < NW && Math.abs(n.y - y) < NH)) y += NH + 40
    const n = newNode(type, x, y); const link = src && !flow.edges.some(e => e.from === src.id)
    setFlow(f => ({ ...f, nodes: [...f.nodes, n], edges: link ? [...f.edges, { id: uid(), from: src.id, to: n.id }] : f.edges })); setSel(n.id); setPanel(null)
    const r = box.current.getBoundingClientRect(); setView(v => ({ ...v, x: r.width / 2 - (x + NW / 2) * v.k, y: r.height / 2 - (y + NH / 2) * v.k })); toast(B(type)[0] + ' agregado') }
  function removeNode(nid) { if (flow.nodes.find(n => n.id === nid)?.type === 'inicio') return; setFlow(f => ({ ...f, nodes: f.nodes.filter(n => n.id !== nid), edges: f.edges.filter(e => e.from !== nid && e.to !== nid) })); setSel(null) }
  const nodeMap = Object.fromEntries(flow.nodes.map(n => [n.id, n]))
  const path = (a, b) => { const dx = Math.max(50, Math.abs(b.x - a.x) / 2); return `M${a.x},${a.y} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}` }
  const st = flow.status
  const xs = flow.nodes.map(n => n.x), ys = flow.nodes.map(n => n.y); const mmX = Math.min(...xs, 0) - 200, mmY = Math.min(...ys, 0) - 150, mmW = Math.max(...xs.map(x => x + NW), 600) + 200 - mmX, mmH = Math.max(...ys.map(y => y + NH), 400) + 150 - mmY
  return <div className="fe">
    <div className="fe-head"><button style={{ color: 'var(--text)', display: 'grid', marginRight: 8 }} onClick={() => nav('/flows')}><ArrowLeft size={17} /></button>
      {rename ? <input className="l-in" autoFocus style={{ width: 260, height: 34, fontWeight: 700 }} defaultValue={flow.name} onBlur={e => { setFlow(f => ({ ...f, name: e.target.value.trim() || f.name })); setRename(false) }} onKeyDown={e => e.key === 'Enter' && e.target.blur()} />
        : <><h2>{flow.name}</h2><button style={{ color: 'var(--muted)', display: 'grid', marginLeft: 8 }} onClick={() => setRename(true)}><Pencil size={15} /></button></>}
      <span style={{ marginLeft: 'auto' }} />
      <button className="fe-hb ai" onClick={() => setModal('ai')}><i><Sparkles size={13} /></i>LeonaAI</button>
      <button className="fe-hb" onClick={() => addNode('ariapay')}>LeonaPay</button>
      <button className="fe-hb" onClick={() => { setFlow(f => ({ ...f, status: st === 'activo' ? 'pausado' : 'activo' })); toast(st === 'activo' ? 'Flujo pausado' : 'Flujo activado') }}>{st === 'activo' ? <><Pause size={14} />Pausar</> : <><Play size={14} />Activar</>}</button>
      <button className="fe-hb" onClick={() => setModal('tr')}><Languages size={14} />Traducir</button>
      <button className="fe-hb" onClick={() => { setFlow(f => ({ ...f, status: 'archivado' })); toast('Flujo archivado'); nav('/flows') }}><Archive size={14} />Archivar</button>
    </div>
    <div className="fe-wrap">
      <div className="fe-cv" ref={box} style={{ backgroundSize: `${45 * view.k}px ${45 * view.k}px`, backgroundPosition: `${view.x}px ${view.y}px` }}
        onMouseDown={e => { if (e.target === box.current || e.target.tagName === 'svg') { act.current = { t: 'pan', sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y }; box.current.classList.add('panning'); setSel(null); if (panel === 'tools') setPanel(null) } }}>
        <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${view.x}px,${view.y}px) scale(${view.k})`, transformOrigin: '0 0' }}>
          <svg style={{ position: 'absolute', overflow: 'visible', left: 0, top: 0, width: 1, height: 1 }}>
            {flow.edges.map(e => { const a = nodeMap[e.from], b = nodeMap[e.to]; if (!a || !b) return null; const d = path({ x: a.x + NW + 8, y: a.y + OUTY }, { x: b.x - 8, y: b.y + 34 })
              return <g key={e.id} style={{ cursor: 'pointer' }} onClick={() => { setFlow(f => ({ ...f, edges: f.edges.filter(x => x.id !== e.id) })); toast('Conexión eliminada', 'info') }}>
                <path d={d} stroke="transparent" strokeWidth="16" fill="none" /><path className={'fe-edge' + (st === 'activo' || run === e.from ? ' anim' : '')} d={d} /></g> })}
            {link && <path className="fe-edge anim" d={path({ x: link.sx, y: link.sy }, link)} />}
          </svg>
          {flow.nodes.map(n => { const [, c, I, , g] = B(n.type); return <div key={n.id} className={'fe-node' + (sel === n.id ? ' sel' : '') + (run === n.id ? ' run' : '')} style={{ left: n.x, top: n.y, borderColor: c }}
            onMouseDown={e => { e.stopPropagation(); setSel(n.id) }} onDoubleClick={() => setEdit(n)}
            onMouseUp={() => { if (link && link.from !== n.id && n.type !== 'inicio') { setFlow(f => ({ ...f, edges: [...f.edges.filter(x => !(x.from === link.from && x.to === n.id)), { id: uid(), from: link.from, to: n.id }] })); toast('Bloques conectados') } }}>
            <div className="fe-nh" style={{ background: g ? `linear-gradient(90deg,${g[0]},${g[1]})` : `linear-gradient(90deg,${c},${c}cc)` }} onMouseDown={e => { e.stopPropagation(); setSel(n.id); act.current = { t: 'node', id: n.id, sx: e.clientX, sy: e.clientY, nx: n.x, ny: n.y } }}>
              <span className="ic"><I size={20} /></span><b>{n.title}</b>
              <span className="acts"><button title="Editar" onMouseDown={e => e.stopPropagation()} onClick={() => setEdit(n)}><Pencil size={12} /></button>
                {n.type !== 'inicio' && <><button title="Duplicar" onMouseDown={e => e.stopPropagation()} onClick={() => setFlow(f => ({ ...f, nodes: [...f.nodes, { ...n, id: uid(), x: n.x + 40, y: n.y + 40 }] }))}><Copy size={12} /></button>
                  <button title="Eliminar" onMouseDown={e => e.stopPropagation()} onClick={() => removeNode(n.id)}><Trash2 size={12} /></button></>}</span></div>
            <div className="fe-ns"><div><span>ENTRADAS</span><b>{n.stats[0]}</b></div><div><span>AVANCES</span><b>{n.stats[1]}</b></div><div><span>TASA</span><b>{n.stats[2]}%</b></div></div>
            <div className="fe-nd">{n.desc || (n.type === 'inicio' ? '' : 'Doble clic para configurar')}</div>
            {n.type !== 'inicio' && <span className="fe-port in" />}
            <span className="fe-port out" style={{ top: OUTY - 8 }} onMouseDown={e => { e.stopPropagation(); const s = { from: n.id, sx: n.x + NW + 8, sy: n.y + OUTY }; setLink({ ...s, x: s.sx, y: s.sy }); act.current = { t: 'link' } }} />
          </div> })}
        </div>
      </div>
      <div className="fe-tools"><button className={'fe-tb' + (panel === 'tools' ? ' p' : '')} onClick={() => setPanel(panel === 'tools' ? null : 'tools')}><LayoutGrid size={16} />Herramientas</button>
        <button className={'fe-tb' + (panel === 'sim' ? ' p' : '')} onClick={() => setPanel(panel === 'sim' ? null : 'sim')}><Play size={14} fill="currentColor" />Simular</button></div>
      {panel === 'tools' && <div className="fe-pal"><div className="s"><div><Search size={16} color="#8f8a9e" /><input autoFocus value={pq} onChange={e => setPq(e.target.value)} placeholder="Buscar bloques..." /></div></div>
        <div className="l">{Object.entries(FB).filter(([k, b]) => k !== 'inicio' && b[0].toLowerCase().includes(pq.toLowerCase())).map(([k, [l, c, I]]) => <button key={k} className="fe-pi" title={B(k)[3]} onClick={() => addNode(k)}><I size={19} color={c} />{l}</button>)}</div></div>}
      {panel === 'sim' && <Simulator flow={flow} onClose={() => { setPanel(null); setRun(null) }} onStep={nid => { setRun(nid); if (nid) setFlow(f => ({ ...f, nodes: f.nodes.map(n => n.id === nid ? { ...n, stats: [n.stats[0] + 1, n.stats[1] + 1, 100] } : n) })) }} />}
      <div className="fe-zoom"><button onClick={() => setView(v => ({ ...v, k: Math.max(.25, v.k * .85) }))}><ZoomOut size={16} /></button><button onClick={() => setView(v => ({ ...v, k: Math.min(2.5, v.k * 1.15) }))}><ZoomIn size={16} /></button><i /><button onClick={fit}><Maximize2 size={15} /></button><button onClick={() => setView({ x: 0, y: 0, k: 1 })}><RotateCcw size={15} /></button></div>
      <div className="fe-mm"><svg width="100%" height="100%" viewBox={`${mmX} ${mmY} ${mmW} ${mmH}`} preserveAspectRatio="xMidYMid meet" style={{ background: '#15121f', display: 'block' }}>
        {flow.nodes.map(n => <rect key={n.id} x={n.x} y={n.y} width={NW} height={NH} fill={sel === n.id ? '#8b5cf6' : n.type === 'inicio' ? '#10b981' : B(n.type)[1]} />)}
        {box.current && <rect x={-view.x / view.k} y={-view.y / view.k} width={box.current.clientWidth / view.k} height={box.current.clientHeight / view.k} fill="rgba(139,92,246,.06)" stroke="#8b5cf6" strokeWidth={mmW / 140} />}
      </svg></div>
    </div>
    {edit && (edit.type === 'mensaje' ? <MessageModal node={edit} onClose={() => setEdit(null)} onSave={n => { setFlow(f => ({ ...f, nodes: f.nodes.map(x => x.id === n.id ? n : x) })); setEdit(null); toast('Mensaje guardado') }} />
      : <NodeModal node={edit} onClose={() => setEdit(null)} onSave={n => { setFlow(f => ({ ...f, nodes: f.nodes.map(x => x.id === n.id ? n : x) })); setEdit(null); toast('Nodo guardado') }} />)}
    {modal === 'tr' && <TranslateModal flow={flow} onClose={() => setModal(null)} />}
    {modal === 'ai' && <AiModal onClose={() => setModal(null)} onGen={types => { const base = flow.nodes.length ? Math.max(...flow.nodes.map(n => n.y)) + 220 : 100; const ns = types.map((t, i) => newNode(t, 80 + i * 330, base + (i % 2) * 60)); const last = flow.nodes.length ? flow.nodes[flow.nodes.length - 1] : null
      setFlow(f => ({ ...f, nodes: [...f.nodes, ...ns], edges: [...f.edges, ...(last ? [{ id: uid(), from: last.id, to: ns[0].id }] : []), ...ns.slice(1).map((n, i) => ({ id: uid(), from: ns[i].id, to: n.id }))] })); setModal(null); setReady(false); toast('Flujo generado con LeonaAI') }} />}
  </div>
}

function AiModal({ onClose, onGen }) {
  const [t, setT] = useState('')
  const gen = () => { const s = t.toLowerCase(); const types = ['mensaje']; if (/pregunt|respond|espera/.test(s)) types.push('esperar'); if (/men[uú]|opcion/.test(s)) types.push('menu'); if (/agente|duda|ia/.test(s)) types.push('agente'); if (/etiquet/.test(s)) types.push('etiquetas'); if (/kanban|crm/.test(s)) types.push('kanban'); if (/pag|cobr|link/.test(s)) types.push('pago'); if (/venta|compr/.test(s)) types.push('venta'); if (types.length === 1) types.push('esperar', 'agente'); onGen(types) }
  return <LModal open onClose={onClose} title="LeonaAI" desc="Describa el flujo y LeonaAI arma los bloques por usted." icon={<Sparkles size={19} />}
    footer={<><button className="lb2 g" onClick={onClose}>Cancelar</button><button className="lb2 p" disabled={!t.trim()} onClick={gen}><Sparkles size={15} />Generar</button></>}>
    <textarea className="l-in" autoFocus style={{ height: 120, padding: 12, resize: 'vertical' }} value={t} onChange={e => setT(e.target.value)} placeholder="Ej.: Saluda al cliente, pregunta qué producto quiere, el agente de IA resuelve dudas y envía el link de pago." />
  </LModal>
}
