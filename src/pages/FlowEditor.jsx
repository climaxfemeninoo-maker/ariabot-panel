import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Pause, Play, Languages, Archive, LayoutGrid, Search, ZoomIn, ZoomOut, Maximize2, RotateCcw, MessageSquare, FileText, Tag, CreditCard, List, Save, MessageCircle, Bell, GitBranch, Share2, Target, Clock, Building2, Globe, Bot, Kanban, SlidersHorizontal, DollarSign, Wallet, PhoneCall, Sparkles, Copy, Trash2, X, Send, Image, Video, Mic, User, File, Sticker, GripVertical, Bold, Italic, Strikethrough, Smile, Code, WandSparkles, Upload, Link2, Repeat, CirclePlay, Workflow, TriangleAlert, Plus, Square, KeyRound, ChevronDown, Check, History, Paperclip, MoreHorizontal, Files, Component, BrainCircuit, Split, Hourglass, Ticket, Pointer, MessageSquareText, ChevronRight } from 'lucide-react'
import { useStore, useToast, uid, nowStr, useOutside } from '../ui'
import { LModal, LSelect, Toggle } from './leona'
import { PickBtn } from './flowPickers'
import { MI } from './mdIcons'
import { CUSTOM_ED } from './nodeEditors'
import { StartModal, startMatches } from './flowNodes'
import { NODE_DEF, ESPERAR_OUTS, GenericNodeModal, CarouselModal, carOuts } from './flowNodes'

export const FB = {
  inicio: ['Início', '#16a34a', CirclePlay, 'Nodo de inicio del flujo', ['#22c55e', '#16a34a']],
  mensaje: ['Mensaje', '#3b82f6', MessageSquare, 'Envía texto, imagen, audio o video', ['#3b82f6', '#2563eb']],
  template: ['Template WhatsApp', '#2563eb', FileText, 'Envía una plantilla aprobada por Meta', ['#2563eb', '#1d4ed8']],
  etiquetas: ['Etiquetas', '#6366f1', Tag, 'Añadir etiquetas al cliente', ['#6366f1', '#4f46e5']],
  pix: ['Botón PIX', '#10b981', CreditCard, 'Enviar botón de pago PIX', ['#10b981', '#059669']],
  menu: ['Menú', '#a855f7', List, 'Opciones para que el cliente elija', ['#a855f7', '#9333ea']],
  carrusel: ['Carrusel', '#0ea5e9', LayoutGrid, 'Tarjetas con imagen y botones'],
  esperar: ['Esperar respuesta', '#f97316', Save, 'Esperar la respuesta del cliente.'],
  controlador: ['Controlador de chat', '#94a3b8', MessageCircle, 'Cambiar el estado del chat'],
  notificacion: ['Notificación', '#14b8a6', Bell, 'Enviar notificación por WhatsApp'],
  condicional: ['Condicional', '#38bdf8', GitBranch, 'Dividir el flujo según reglas'],
  distribuidor: ['Distribuidor', '#f59e0b', GitBranch, 'Distribuir contactos entre salidas'],
  conexion: ['Conexión de flujo', '#f43f5e', Share2, 'Redirigir a otro flujo'],
  pixel: ['Pixel', '#eab308', Target, 'Disparar eventos en herramientas de anuncios (Facebook Ads, etc.)'],
  intervalo: ['Intervalo inteligente', '#06b6d4', Clock, 'Espera de 01 minuto'],
  departamento: ['Departamento', '#8b5cf6', Building2, 'Asignar departamento al chat'],
  integracion: ['Integración', '#3b82f6', Globe, 'Realizar peticiones HTTP (POST/PUT/GET) a APIs externas'],
  ia: ['Bloque de IA', '#10b981', Bot, 'Integración con GPT y Gemini para respuestas inteligentes'],
  agente: ['Agente de IA', '#d97706', Bot, 'Entregar o retomar la conversación'],
  kanban: ['Kanban', '#a855f7', Kanban, 'Crear o mover tarjeta en el Kanban seleccionado'],
  manipulador: ['Manipulador', '#f97316', SlidersHorizontal, 'Actualizar la fecha de creación del contacto en la base o guardar un campo personalizado'],
  venta: ['Venta aprobada', '#4ade80', DollarSign, ''],
  pago: ['Pago', '#a78bfa', CreditCard, 'Genera un cobro y continúa el flujo'],
  ariapay: ['Leona Pay', '#6366f1', Wallet, 'BRL · 100,00'],
  llamar: ['Llamar', '#14b8a6', PhoneCall, '8s'],
  kie: ['Integración Kie.ai', '#d946ef', Sparkles, 'Bloque nativo para generación de audio, imagen y video (Veo)'],
}
Object.assign(FB, {
  mensaje: ['Contenido', '#3b82f6', Files, 'Envía textos, imágenes, audios o videos', ['#60a5fa', '#2563eb']],
  botones: ['Mensajes API', '#8b5cf6', Component, 'Mensaje con botones de respuesta (API oficial)', ['#a78bfa', '#7c3aed']],
  agente: ['Agente IA', '#10b981', BrainCircuit, 'IA responde consultas o avanza por un camino', ['#34d399', '#059669']],
  seguimiento: ['Seguimiento', '#f97316', Clock, 'Reenvía mensajes si el cliente no responde', ['#fb923c', '#ea580c']],
  conexion: ['Activar Flujo', '#7c3aed', Split, 'Activa otro flujo para el contacto', ['#a78bfa', '#6d28d9']],
  copiar: ['Botón Copiar', '#0d9488', Copy, 'Envía un botón para copiar un texto', ['#2dd4bf', '#0f766e']],
  intervalo: ['Espera', '#06b6d4', Hourglass, 'Espera un tiempo antes de continuar', ['#67e8f9', '#0891b2']],
  notificacion: ['Notificación', '#f59e0b', Bell, 'Avisa al equipo cuando un cliente llega aquí', ['#fcd34d', '#f59e0b']],
  ticket: ['Ticket', '#6366f1', Ticket, 'Asigna el chat a un agente del equipo', ['#f8fafc', '#eef2f7']],
  pais: ['Código de país', '#0891b2', Globe, 'Divide el flujo según el país del número', ['#0284c7', '#06b6d4']],
})
FB.botones[0] = 'Mensajes API'; FB.botones[1] = '#0f8f6e'; FB.etiquetas = ['Etiquetas', '#6366f1', Tag, 'Agrega o quita etiquetas del ticket', ['#818cf8', '#4f46e5']]
const NVI = { etiquetas: 'tag', mensaje: 'books', botones: 'touch', seguimiento: 'clock', conexion: 'split', copiar: 'copy', intervalo: 'hourglass', notificacion: 'bell', ticket: 'ticket', pais: 'globe', agente: 'spark' }
export const paisCodes = t => (t || '').split(',').map(x => x.trim().match(/^\+?(\d{1,4})\s*(.*)$/)).filter(Boolean).map(m => [m[1], m[2] || ''])
const B = t => FB[t] || FB.mensaje
const NV = { etiquetas: 1, pais: 1, mensaje: 1, botones: 1, agente: 1, seguimiento: 1, conexion: 1, copiar: 1, intervalo: 1, notificacion: 1, ticket: 1 }
const PAL = ['mensaje', 'seguimiento', 'agente', 'conexion', 'copiar', 'intervalo', 'notificacion', 'ticket', 'pais', 'botones', 'etiquetas']
const ROUND = { venta: ['#22c55e', 'Venta aprobada'], llamar: ['#14b8a6', 'Llamar'], agente: ['#10b981', 'Agente IA'] }
const NW = 260, NH = 150, OUTY = 108
export const nodeOuts = (n, tpls = []) => {
  if (n.type === 'template') { const t = n.tpl || {}; return [{ k: 'reply', l: 'Resposta livre', c: 'or', pc: '#d97706' }, { k: 'timeout', l: 'Timeout sem clique', s: `${t.timeout || 60} ${({ m: 'minutes', h: 'hours', d: 'days' })[t.unit || 'm']}`, c: 'gr', pc: '#6b7280' }, { k: 'fail', l: 'Falha de entrega', c: 'rd', pc: '#dc2626' }] }
  if (n.type === 'menu') { const m = n.menu || {}; const o = (m.mode === 'buttons' ? m.buttons : m.options) || []; return [...o.map((x, i) => ({ k: 'o' + x.id, l: `${i + 1}. ${x.title || 'Opción sin título'}`, c: 'pu', pc: '#005ae3' })), ...(+m.exp > 0 ? [{ k: 'timeout', l: 'Sin respuesta', s: `${m.exp} ${({ m: 'minutos', h: 'horas', d: 'días' })[m.unit || 'd']}`, c: 'gr', pc: '#6b7280' }] : [])] }
  if (n.type === 'carrusel') return carOuts(n.cfg || {})
  if (n.type === 'esperar') return ESPERAR_OUTS(n.cfg || {})
  const d = NODE_DEF[n.type]; if (d && d.outs) return d.outs(n.cfg || {})
  return null
}
const newNode = (type, x, y) => ({ id: uid(), type, x, y, title: B(type)[0], desc: '', actions: [], stats: [0, 0, 0] })

const ACT = {
  text: ['Texto', MessageSquare, '#3b82f6', 'Mensaje de texto'], image: ['Imagen', Image, '#22c55e'], video: ['Vídeo', Video, '#1a73f0'], audio: ['Audio', Mic, '#f97316'],
  delay: ['Intervalo', Clock, '#06b6d4', 'Retraso entre mensajes'], contact: ['Contacto', User, '#ec4899'], file: ['Archivo', File, '#639cf1'], sticker: ['Sticker', Sticker, '#f59e0b'],
}
const actBlank = t => ({ id: uid(), type: t, text: '', src: 'file', url: '', caption: '', file: null, typing: 3, rec: 6, voice: true, once: false, del: false, delTag: '', mode: 'normal', min: 0, max: 120, cname: '', cphone: '', ai: '', fname: '' })

function Editor({ value, onChange, ph, magic, rows }) {
  const ta = useRef()
  const wrap = (a, b = a) => { const el = ta.current, s = el.selectionStart, e = el.selectionEnd; onChange(value.slice(0, s) + a + value.slice(s, e) + b + value.slice(e)); requestAnimationFrame(() => { el.focus(); el.selectionStart = s + a.length; el.selectionEnd = e + a.length }) }
  return <div className="fe-ed"><textarea ref={ta} value={value} onChange={e => onChange(e.target.value)} placeholder={ph} style={rows ? { minHeight: rows } : null} />
    <div className="tb"><button onClick={() => wrap('*')}><Bold size={16} /></button><button onClick={() => wrap('_')}><Italic size={16} /></button><button onClick={() => wrap('~')}><Strikethrough size={16} /></button>
      <PickBtn kind="emoji" title="Emojis" onPick={x => wrap(x, '')}><Smile size={16} /></PickBtn><PickBtn kind="var" title="Variable" onPick={x => wrap(x, '')}><Code size={16} /></PickBtn>
      {magic && <><span style={{ width: 1, height: 18, background: 'var(--border2)', margin: '0 3px' }} /><button onClick={magic}><WandSparkles size={16} color="#4d94ff" /></button></>}</div></div>
}
const Range = ({ label, v, max, set, unit = 's' }) => <><div style={{ display: 'flex', fontSize: 13.3, color: 'var(--soft)', marginTop: 15 }}><span>{label}</span><b style={{ margin: '0 auto', color: 'var(--text)' }}>{v} {unit}</b><span>{max} {unit}</span></div>
  <input type="range" className="fe-rng" min="0" max={max} value={v} onChange={e => set(+e.target.value)} style={{ marginTop: 9, background: `linear-gradient(90deg,#22d3ee ${v / max * 100}%,#374151 0)` }} /></>
function DualRange({ min, max, limit, onChange }) {
  const ref = useRef(); const pct = v => v / limit * 100
  const drag = which => e => { e.preventDefault(); const el = ref.current; const mv = ev => { const r = el.getBoundingClientRect(); const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left; let v = Math.round(Math.max(0, Math.min(1, x / r.width)) * limit)
      if (which === 'min') onChange(Math.min(v, max), max); else onChange(min, Math.max(v, min)) }
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up) }; addEventListener('pointermove', mv); addEventListener('pointerup', up) }
  const key = which => e => { const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0; if (!d) return; e.preventDefault(); if (which === 'min') onChange(Math.max(0, Math.min(min + d, max)), max); else onChange(min, Math.min(limit, Math.max(max + d, min))) }
  return <div className="dr" ref={ref} onPointerDown={e => { if (e.target !== e.currentTarget && !e.target.classList.contains('dr-tr')) return; const r = ref.current.getBoundingClientRect(); const v = Math.round((e.clientX - r.left) / r.width * limit); Math.abs(v - min) < Math.abs(v - max) ? onChange(Math.min(v, max), max) : onChange(min, Math.max(v, min)) }}>
    <div className="dr-tr" /><div className="dr-fl" style={{ left: pct(min) + '%', width: pct(max - min) + '%' }} />
    <button className="dr-th" style={{ left: pct(min) + '%' }} onPointerDown={drag('min')} onKeyDown={key('min')} aria-label="Mínimo" /><button className="dr-th" style={{ left: pct(max) + '%' }} onPointerDown={drag('max')} onKeyDown={key('max')} aria-label="Máximo" /></div>
}
function DelTag({ a, set, tags }) {
  return <><div className="fe-sep" /><div style={{ display: 'flex', alignItems: 'center' }}><b style={{ fontSize: 13.3, color: a.del ? 'var(--text)' : 'var(--soft)', fontWeight: a.del ? 700 : 500 }}>Eliminar mensaje al aplicar etiqueta</b><span style={{ marginLeft: 'auto' }}><Toggle on={a.del} onChange={v => set({ del: v })} /></span></div>
    <div className="fe-small" style={{ marginTop: 4 }}>Cuando se agregue la etiqueta seleccionada al chat, este mensaje se eliminará en WhatsApp.<br />Nota: para tiempos muy largos, la eliminación puede no funcionar.</div>
    {a.del && <><div className="fe-lb" style={{ marginTop: 14 }}>Etiqueta que activa la eliminación</div><LSelect className="l-in" value={a.delTag} onChange={v => set({ delTag: v })} placeholder="Buscar etiqueta..." options={tags.map(t => ({ value: t, label: t }))} /></>}</>
}
function Media({ a, set, kind, tags }) {
  const toast = useToast(); const L = { image: ['2MB', 'JPG preferible; también PNG, WebP, HEIC, HEIF', 'image/*', 2, 'Enviar imagen'], video: ['5MB', 'MP4 recomendado en WhatsApp; en la subida de archivo también: WebM, OGG, MOV, M4V', 'video/*', 5, 'Enviar vídeo'], audio: ['', 'Formatos admitidos: MP3 y OGG. Máximo 16MB', 'audio/*', 16, 'Enviar audio'], file: ['30MB', 'PDF, DOC, DOCX, TXT, XLS, XLSX', '.pdf,.doc,.docx,.txt,.xls,.xlsx', 30, 'Enviar archivo'], sticker: ['2MB', 'JPG, JPEG, PNG, WebP', 'image/jpeg,image/png,image/webp', 2, 'Enviar sticker'] }[kind]
  const Ic = ACT[kind][1]
  const pick = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = L[2]; i.onchange = () => { const f = i.files[0]; if (!f) return; if (f.size > L[3] * 1048576) return toast('El archivo supera el tamaño máximo', 'err'); set({ file: { name: f.name, size: f.size }, fname: a.fname || f.name }) }; i.click() }
  const tabs = [['file', 'Archivo', Upload], ['url', 'URL', Link2], ...(kind === 'audio' ? [['ai', 'IA', WandSparkles]] : [])]
  return <>
    {['file', 'sticker'].includes(kind) && <><div className="fe-lb">{kind === 'file' ? 'Nombre del archivo *' : 'Nombre del sticker *'}</div><input className="fe-gin" style={{ marginBottom: 15 }} value={a.fname} onChange={e => set({ fname: e.target.value })} placeholder={kind === 'file' ? 'Ej.: documento.pdf' : 'Ej.: emoji_feliz'} /></>}
    <div className="fe-seg">{tabs.map(([k, l, I]) => <button key={k} className={a.src === k ? 'on' : ''} onClick={() => set({ src: k })}><I size={15} />{l}</button>)}</div>
    {kind === 'video' && <><div className="fe-seg sm" style={{ marginBottom: 10 }}>{[['normal', 'Normal', Video], ['auto', 'Autoplay', Repeat], ['msg', 'Video mensaje', MessageCircle]].map(([k, l, I]) => <button key={k} className={a.mode === k ? 'on' : ''} onClick={() => set({ mode: k })}><I size={13} />{l}</button>)}</div>
      <div className="fe-small" style={{ marginBottom: 14 }}>Normal: envío estándar. Autoplay: comportamiento visual de bucle/reproducción automática en WhatsApp. Vídeo msg.: formato de mensaje de vídeo de la app.</div></>}
    {a.src === 'file' && <div className={'fe-drop' + (kind === 'file' ? ' ind' : '')}><span className="ic"><Ic size={30} /></span>{a.file ? <><b style={{ color: 'var(--text)' }}>{a.file.name}</b><small>{(a.file.size / 1024).toFixed(0)} KB</small></> : <>{L[0] && <b>Tamaño máximo permitido: {L[0]}</b>}<small style={kind === 'audio' ? { fontSize: 13.3 } : null}>{L[1]}</small>
      {kind === 'audio' && <small style={{ color: '#fb923c' }}>Para enviar como grabado en la API oficial, el audio debe ser .ogg con codec Opus. <u>Convierte tu audio aquí</u></small>}</>}<button className="bt" onClick={pick}>{a.file ? 'Cambiar archivo' : L[4]}</button></div>}
    {a.src === 'url' && <><div className="fe-lb">{kind === 'file' ? 'URL del documento *' : 'URL del medio *'}</div><Editor value={a.url} onChange={v => set({ url: v })} ph={kind === 'file' ? 'https://ejemplo.com/archivo.pdf o {documento_url}' : 'https://ejemplo.com/imagen.jpg o {imagen_producto}'} rows={90} />
      <div className="fe-small" style={{ marginTop: 8 }}>Pegue una URL pública o use variables del sistema (como <code>{'{nome_campo}'}</code>, <code>{'{nome}'}</code>). La URL se resuelve al ejecutar el flujo.</div>
      {['image', 'video'].includes(kind) && <><div className="fe-lb" style={{ marginTop: 16 }}>Leyenda</div><Editor value={a.caption} onChange={v => set({ caption: v })} ph="Leyenda (opcional)..." rows={90} /></>}</>}
    {a.src === 'ai' && <div style={{ border: '1.5px dashed var(--border2)', borderRadius: 9, padding: '16px 17px' }}>
      <div style={{ textAlign: 'center' }}><span style={{ width: 68, height: 68, borderRadius: 9, background: '#2157a8', display: 'inline-grid', placeItems: 'center', color: '#93c5fd' }}><Mic size={30} /></span><div style={{ fontSize: 13.3, fontWeight: 700, marginTop: 10 }}>Generar audio con IA <WandSparkles size={14} color="#4d94ff" /></div></div>
      <div className="fe-lb" style={{ marginTop: 14 }}>Voz / Clave IA<span style={{ marginLeft: 'auto', fontSize: 12, color: '#60a5fa' }}>Administrar claves</span></div>
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
          {a.showAi && <><div className="fe-lb" style={{ marginTop: 14 }}>IA<span style={{ marginLeft: 'auto', fontSize: 12, color: '#60a5fa' }}>Administrar claves</span></div><LSelect className="l-in" bold value={a.aiKey || ''} onChange={v => set(i, { aiKey: v })} placeholder="Selecciona una IA..." options={[]} /></>}
          <Range label='Retraso de "escribiendo"' v={a.typing} max={60} set={v => set(i, { typing: v })} /><div className="fe-help">Tiempo que WhatsApp mostrará "escribiendo" antes de enviar este mensaje.</div><DelTag a={a} set={p => set(i, p)} tags={tagNames} /></>}
        {['image', 'video', 'audio', 'file', 'sticker'].includes(a.type) && <Media a={a} set={p => set(i, p)} kind={a.type} tags={tagNames} />}
        {a.type === 'delay' && <><div className="fe-lb" style={{ color: 'var(--text)' }}>Retraso entre mensajes</div>
          <div style={{ display: 'flex', fontSize: 13.3, color: 'var(--soft)' }}><span>0 s</span><b style={{ margin: '0 auto', color: 'var(--text)' }}>{a.min} - {a.max} s</b><span>120 s</span></div>
          <DualRange min={a.min} max={a.max} limit={120} onChange={(mn, mx) => set(i, { min: mn, max: mx })} />
          <div className="fe-small" style={{ marginTop: 9 }}>El retraso se elige al azar entre el mínimo y el máximo configurados</div></>}
        {a.type === 'contact' && <><div className="fe-help" style={{ marginTop: 0, marginBottom: 14 }}>Puedes usar variables como {'{instance_number}'}, {'{instance_name}'}, {'{full_name}'}, {'{phone_number}'} y campos del contacto. Las mismas que en el texto del mensaje. Se resuelven al enviar el flujo.</div>
          <div className="fe-lb">Nombre del contacto *</div><input className="fe-gin" value={a.cname} onChange={e => set(i, { cname: e.target.value })} placeholder="Ej.: Juan Pérez" />
          <div className="fe-lb" style={{ marginTop: 17 }}>Teléfono *</div><input className="fe-gin" value={a.cphone} onChange={e => set(i, { cphone: e.target.value })} placeholder="Ej.: 34 612 345 678" /><DelTag a={a} set={p => set(i, p)} tags={tagNames} /></>}
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
      <div style={{ display: 'flex', gap: 13, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}><I size={20} color="#4d94ff" style={{ marginTop: 3 }} /><div><b style={{ fontSize: 16.5 }}>{node.type === 'inicio' ? 'Inicio' : B(node.type)[0]}</b><div style={{ fontSize: 13, color: 'var(--soft)', marginTop: 2 }}>{node.type === 'inicio' ? 'Nodo de inicio del flujo' : B(node.type)[3]}</div></div></div>
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
  const fill = s => (s || '').replace(/\{(full_name|first_name|nome|nombre)\}/g, 'Cliente').replace(/\{phone_number\}/g, '+51999999999').replace(/\{saludo\}/g, 'Buenas noches')
  const say = (x, f = 'bot') => setMsgs(m => [...m, { f, x }])
  const next = (id, port = 'main') => { const e = flow.edges.find(x => x.from === id && (x.port || 'main') === port); return e && flow.nodes.find(n => n.id === e.to) }
  const wait = ms => new Promise(r => setTimeout(r, ms))
  const run = async start => {
    let cur = start; const seen = new Set()
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id); onStep(cur.id)
      for (const a of cur.actions || []) { await wait(450); const m = a.type === 'text' ? fill(a.text) : a.type === 'delay' ? null : a.type === 'contact' ? `👤 ${a.cname || 'Contacto'} · ${a.cphone}` : `[${ACT[a.type][0]}${a.fname ? ': ' + a.fname : a.file ? ': ' + a.file.name : a.url ? ': ' + a.url : ''}]${a.caption ? '\n' + fill(a.caption) : ''}`; if (m) say(m) }
      await wait(300)
      if (cur.type === 'menu') { const m = cur.menu || {}; const o = (m.mode === 'buttons' ? m.buttons : m.options) || []; say(fill(m.text || 'Menú') + '\n\n' + o.map((x, i) => `${i + 1}. ${x.title}`).join('\n') + (m.btn ? `\n[${m.btn}]` : '')); setState({ id: cur.id, kind: 'menu', o }); return }
      if (cur.type === 'template') { say(`[Template: ${cur.tpl?.name || 'sin seleccionar'}]`); setState({ id: cur.id, kind: 'tpl' }); return }
      const cf = cur.cfg || {}
      if (cur.type === 'esperar') { if (cf.msg) say(fill(cf.msg)); say('Esperando respuesta…', 'sys'); setState({ id: cur.id, kind: 'wait' }); return }
      if (cur.type === 'carrusel') { const o = []; (cf.cards || []).forEach(k => k.buttons.forEach(b => b.type === 'reply' && o.push(b))); say(fill(cf.intro || 'Elige una opción abajo') + '\n\n' + (cf.cards || []).map((k, i) => `🖼 ${i + 1}. ${fill(k.text)} [${k.buttons.map(b => b.title).join(' | ')}]`).join('\n')); setState({ id: cur.id, kind: 'car', o }); return }
      if (cur.type === 'conexion') { const f = (JSON.parse(localStorage.getItem('aria_flows') || '[]')).find(x => x.id === cf.flow); say('▸ Redirigido a ' + (f ? f.name : 'otro flujo'), 'sys'); break }
      if (cur.type === 'agente') { say((cf.act || 'give') === 'take' ? '▸ Conversación devuelta al flujo' : '▸ Chat entregado al agente de IA', 'sys'); if ((cf.act || 'give') === 'give') break }
      const portOf = { integracion: 'success', ia: 'success', kie: 'success', ariapay: 'payment_approved', condicional: 'true' }
      if (cur.type === 'notificacion') say(`▸ Notificación a ${cf.phone ? cf.phone.cc + ' ' + cf.phone.n : '—'}: ${fill(cf.msg || '')}`, 'sys')
      if (['pago', 'ariapay'].includes(cur.type)) say(`💳 Cobro ${cf.method || 'PIX'} · ${cf.cur || 'BRL'} ${cf.noAmount ? '(sin monto)' : cf.value || '100,00'}`)
      if (cur.type === 'distribuidor') { const os = cf.outs || []; const pk = os.length ? os[Math.floor(Math.random() * os.length)] : null; say('▸ Distribuidor → ' + (pk ? pk.name : 'sin salidas'), 'sys'); cur = pk ? next(cur.id, 'o' + pk.id) : null; continue }
      if (portOf[cur.type]) { if (!['pago', 'ariapay'].includes(cur.type)) say(`▸ ${cur.title}`, 'sys'); cur = next(cur.id, portOf[cur.type]); continue }
      if (cur.type === 'pix') say(`💳 PIX${cur.pix?.amount ? ' · R$ ' + cur.pix.amount : ''}\n${cur.pix?.key || 'Clave sin configurar'}${cur.pix?.text ? '\n' + fill(cur.pix.text) : ''}`)
      else if (cur.type === 'etiquetas') say(`▸ ${cur.tagMode === 'remove' ? 'Etiquetas quitadas' : 'Etiquetas añadidas'}: ${(cur.tags || []).join(', ') || '—'}`, 'sys')
      else if (!['inicio', 'mensaje', 'notificacion'].includes(cur.type)) say(`▸ ${cur.title}${cur.desc && !['venta'].includes(cur.type) ? ' · ' + cur.desc : ''}`, 'sys')
      cur = next(cur.id)
    }
    onStep(null); setState('done'); say('Fin del flujo', 'sys')
  }
  const send = () => {
    if (!txt.trim()) return; const t = txt.trim(); say(t, 'me'); setTxt('')
    if (state && state !== 'done') { let port = 'main'
      if (state.kind === 'menu') { const i = state.o.findIndex((x, i) => String(i + 1) === t || x.title.toLowerCase() === t.toLowerCase()); if (i < 0) { say('Opción no válida, responde con el número de una opción.', 'sys'); return } port = 'o' + state.o[i].id }
      if (state.kind === 'tpl') port = 'reply'
      if (state.kind === 'car') { const b = state.o.find(x => x.title.toLowerCase() === t.toLowerCase()); port = b ? 'b' + b.id : 'fallback' }
      const n = next(state.id, port); setState(null); if (n) run(n); else { setState('done'); onStep(null); say('Fin del flujo', 'sys') } }
    else if (!state) { const st = flow.nodes.find(n => n.type === 'inicio') || flow.nodes[0]; if (st && st.type === 'inicio' && st.cfg && !startMatches(st.cfg, t, !msgs.some(m => m.f === 'me'))) { say(st.cfg.on === false ? 'El activador está pausado.' : 'Este mensaje no coincide con el activador del flujo.', 'sys'); return } run(st) }
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
  const [view, setView] = useState({ x: 0, y: 0, k: 1 }); const [ready, setReady] = useState(false); const [boot, setBoot] = useState(true); const clickRef = useRef(null); const [hovE, setHovE] = useState(null)
  useEffect(() => { const t = setTimeout(() => setBoot(false), 950); return () => clearTimeout(t) }, [])
  const [panel, setPanel] = useState(null); const [pq, setPq] = useState(''); const [sel, setSel] = useState(null); const [run, setRun] = useState(null)
  const [link, setLink] = useState(null); const [edit, setEdit] = useState(null); const [rename, setRename] = useState(false); const [modal, setModal] = useState(null)
  const box = useRef(); const act = useRef(null); const world = useRef(); const [ports, setPorts] = useState({}); const [del, setDel] = useState(null)
  useLayoutEffect(() => { if (!world.current) return; const wr = world.current.getBoundingClientRect(); const k = view.k; const m = {}
    world.current.querySelectorAll('[data-port]').forEach(el => { const r = el.getBoundingClientRect(); m[el.dataset.port] = { x: (r.left + r.width / 2 - wr.left) / k, y: (r.top + r.height / 2 - wr.top) / k } })
    if (JSON.stringify(m) !== JSON.stringify(ports)) setPorts(m) })
  const [savedAt, setSavedAt] = useState(() => new Date())
  const setFlow = useCallback(fn => { setFlows(fs => fs.map(f => f.id === id ? { ...fn(f), updated: nowStr() } : f)); setSavedAt(new Date()) }, [id, setFlows])
  const toWorld = (cx, cy) => { const r = box.current.getBoundingClientRect(); return { x: (cx - r.left - view.x) / view.k, y: (cy - r.top - view.y) / view.k } }
  const fitRef = useRef(); useEffect(() => { fitRef.current = fit })
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
    const n = newNode(type, x, y)
    setFlow(f => ({ ...f, nodes: [...f.nodes, n] })); setSel(n.id); setPanel(null); setTimeout(() => setEdit({ ...n, __new: true }), 260)
    const r = box.current.getBoundingClientRect(); setView(v => ({ ...v, x: r.width / 2 - (x + NW / 2) * v.k, y: r.height / 2 - (y + NH / 2) * v.k })); toast(B(type)[0] + ' agregado') }
  function removeNode(nid) { const nn = flow.nodes.find(n => n.id === nid); if (!nn || nn.type === 'inicio') return; setDel(nn) }
  function doRemove(nid) { setFlow(f => ({ ...f, nodes: f.nodes.filter(n => n.id !== nid), edges: f.edges.filter(e => e.from !== nid && e.to !== nid) })); setSel(null); setDel(null) }
  const nodeMap = Object.fromEntries(flow.nodes.map(n => [n.id, n]))
  const path = (a, b) => { const dx = Math.max(50, Math.abs(b.x - a.x) / 2); return `M${a.x},${a.y} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}` }
  const st = flow.status
  const xs = flow.nodes.map(n => n.x), ys = flow.nodes.map(n => n.y); const mmX = Math.min(...xs, 0) - 200, mmY = Math.min(...ys, 0) - 150, mmW = Math.max(...xs.map(x => x + NW), 600) + 200 - mmX, mmH = Math.max(...ys.map(y => y + NH), 400) + 150 - mmY
  return <div className="fe">
    <div className="fe-head"><button style={{ color: 'var(--text)', display: 'grid', marginRight: 8 }} onClick={() => nav('/flows')}><ArrowLeft size={17} /></button>
      {rename !== false ? <div className="fe-ren"><input className="l-in" autoFocus value={rename} onChange={e => setRename(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && rename.trim()) { setFlow(f => ({ ...f, name: rename.trim() })); setRename(false); toast('Nombre actualizado') } if (e.key === 'Escape') setRename(false) }} />
          <button className="ok" title="Guardar" disabled={!rename.trim()} onClick={() => { setFlow(f => ({ ...f, name: rename.trim() })); setRename(false); toast('Nombre actualizado') }}><Check size={16} /></button><button className="no" title="Cancelar" onClick={() => setRename(false)}><X size={16} /></button></div>
        : <><h2>{flow.name}</h2><button style={{ color: 'var(--muted)', display: 'grid', marginLeft: 8 }} onClick={() => setRename(flow.name)}><Pencil size={15} /></button></>}
      <span style={{ marginLeft: 'auto' }} />
      <span className="fe-saved"><Clock size={14} />Guardado a las <b>{savedAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</b></span>
      <button className={'fe-hb ai' + (modal === 'ai' ? ' on' : '')} onClick={() => setModal(modal === 'ai' ? null : 'ai')}><i><img src="/leona-mark.png" alt="" /></i>LeonaAI</button>
      <button className="fe-hb" onClick={() => addNode('ariapay')}>LeonaPay</button>
      <button className="fe-hb" onClick={() => { setFlow(f => ({ ...f, status: st === 'activo' ? 'pausado' : 'activo' })); toast(st === 'activo' ? 'Flujo pausado' : 'Flujo activado') }}>{st === 'activo' ? <><Pause size={14} />Pausar</> : <><Play size={14} />Activar</>}</button>
      <button className="fe-hb" onClick={() => setModal('tr')}><Languages size={14} />Traducir</button>
      <button className="fe-hb" onClick={() => { setFlow(f => ({ ...f, status: 'archivado' })); toast('Flujo archivado'); nav('/flows') }}><Archive size={14} />Archivar</button>
    </div>
    <div className="fe-wrap">
      {boot && <div className="fe-skel">{(() => { const W = 120, H = 54, cx = c => c * 180, ry = r => [45, 180, 315][r]
        const N = [[0, 1, '#22a35a'], [1, 1, '#2f5fc4'], [2, 1, '#2a6f9e'], [3, 0, '#28468c'], [4, 0, '#6366f1'], [5, 0, '#14b8a6'], [6, 0, '#10b981'], [3, 1, '#f97316'], [4, 1, '#f43f5e'], [5, 1, '#06b6d4'], [6, 1, '#4ade80'], [3, 2, '#f97316'], [4, 2, '#a855f7'], [5, 2, '#3b82f6'], [6, 2, '#94a3b8']]
        const out = (c, r) => [cx(c) + W, ry(r)], inn = (c, r) => [cx(c), ry(r)]
        const cv = ([x1, y1], [x2, y2]) => { const d = Math.max(30, (x2 - x1) / 2); return `M${x1},${y1} C${x1 + d},${y1} ${x2 - d},${y2} ${x2},${y2}` }
        const E = [[0, 1, 1, 1], [1, 1, 2, 1], [2, 1, 3, 0], [2, 1, 3, 1], [2, 1, 3, 2], ...[0, 1, 2].flatMap(r => [[3, r, 4, r], [4, r, 5, r], [5, r, 6, r]])]
        const D = [[4, 0, 4, 1], [5, 0, 5, 1], [6, 0, 6, 1], [5, 1, 5, 2], [6, 1, 6, 2]]
        return <svg viewBox="-20 0 1260 370" preserveAspectRatio="xMidYMid meet">
          {E.map(([a, b, c, d], k) => <path key={'e' + k} className="sk-e" style={{ animationDelay: k * .03 + 's' }} d={cv(out(a, b), inn(c, d))} />)}
          {D.map(([a, b, c, d], k) => <path key={'d' + k} className="sk-e" d={`M${out(a, b)[0]},${out(a, b)[1]} L${inn(c, d)[0]},${inn(c, d)[1]}`} />)}
          {N.map(([c, r, col], k) => <g key={k} className="sk-n" style={{ animationDelay: (c * .07 + r * .03) + 's' }} transform={`translate(${cx(c)},${ry(r) - H / 2})`}>
            <rect width={W} height={H} rx="7" className="bx" /><path d={`M0,7 a7,7 0 0 1 7,-7 h${W - 14} a7,7 0 0 1 7,7 v2 h-${W} z`} fill={col} />
            <rect x="14" y="20" width="74" height="6" rx="3" className="ln" /><rect x="14" y="33" width="48" height="6" rx="3" className="ln" />
            <circle cx="0" cy={H / 2} r="3.5" className="pt" /><circle cx={W} cy={H / 2} r="3.5" className="pt" /></g>)}
        </svg> })()}</div>}
      <div className="fe-cv" ref={box} style={{ backgroundSize: `${45 * view.k}px ${45 * view.k}px`, backgroundPosition: `${view.x}px ${view.y}px` }}
        onMouseDown={e => { if (e.target === box.current || e.target.tagName === 'svg') { act.current = { t: 'pan', sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y }; box.current.classList.add('panning'); setSel(null); if (panel === 'tools') setPanel(null) } }}>
        <div ref={world} className={'fe-world' + (boot ? ' boot' : ' in')} style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${view.x}px,${view.y}px) scale(${view.k})`, transformOrigin: '0 0' }}>
          <svg style={{ position: 'absolute', overflow: 'visible', left: 0, top: 0, width: 1, height: 1 }}>
            {flow.edges.map(e => { const a = nodeMap[e.from], b = nodeMap[e.to]; if (!a || !b) return null; const pp = ports[e.from + '|' + (e.port || 'main')]; if (!pp) return null; const d = path(pp, ports[b.id + '|in'] || { x: b.x - 8, y: b.y + 34 })
              const b2 = ports[b.id + '|in'] || { x: b.x - 8, y: b.y + 34 }; const mx = (pp.x + b2.x) / 2, my = (pp.y + b2.y) / 2
              return <g key={e.id} className={'fe-eg' + (hovE === e.id ? ' hov' : '')} onMouseEnter={() => setHovE(e.id)} onMouseLeave={() => setHovE(h => h === e.id ? null : h)}>
                <path d={d} stroke="transparent" strokeWidth="22" fill="none" style={{ pointerEvents: 'stroke' }} /><path className={'fe-edge' + (st === 'activo' || run === e.from ? ' anim' : '')} style={{ stroke: e.port === 'fail' ? '#dc2626' : e.port === 'timeout' ? '#6b7280' : e.port === 'reply' ? '#d97706' : undefined }} d={d} />
                {hovE === e.id && <g className="fe-ex" transform={`translate(${mx},${my})`} onMouseDown={ev => ev.stopPropagation()} onClick={ev => { ev.stopPropagation(); setFlow(f => ({ ...f, edges: f.edges.filter(x => x.id !== e.id) })); setHovE(null); toast('Conexión eliminada', 'info') }}><circle r="26" className="gl" /><circle r="17" className="bt" /><path d="M-6,-6 L6,6 M6,-6 L-6,6" /></g>}</g> })}
            {link && <path className="fe-edge anim" d={path({ x: link.sx, y: link.sy }, { x: link.x, y: link.y })} />}
          </svg>
          {flow.nodes.map(n => { const [, c, I, dd, g] = B(n.type); const outs = nodeOuts(n); const tpl = n.type === 'template'
            const startLink = (e, k) => { e.stopPropagation(); const pp = ports[n.id + '|' + k] || { x: n.x + NW, y: n.y + OUTY }; setLink({ from: n.id, port: k, sx: pp.x, sy: pp.y, x: pp.x, y: pp.y }); act.current = { t: 'link' } }
            const desc = n.desc || (['inicio', 'mensaje', 'menu', 'template'].includes(n.type) ? '' : n.type === 'carrusel' ? '📝 Elige una opción abajo' : dd)
            const P = (k, pc, st) => <span className="fe-port out" data-port={n.id + '|' + k} style={{ background: pc, ...st }} onMouseDown={e => startLink(e, k)} />
            const nodeEv = { onMouseDown: e => { e.stopPropagation(); setSel(n.id); clickRef.current = { x: e.clientX, y: e.clientY } }, onDoubleClick: () => setEdit(n), onClick: e => { const c0 = clickRef.current; if (!c0 || Math.hypot(e.clientX - c0.x, e.clientY - c0.y) > 4 || e.target.closest('.fe-port,.acts,button')) return; setEdit(n) },
              onMouseUp: () => { if (link && link.from !== n.id && n.type !== 'inicio') { setFlow(f => ({ ...f, edges: [...f.edges.filter(x => !(x.from === link.from && (x.port || 'main') === (link.port || 'main'))), { id: uid(), from: link.from, port: link.port, to: n.id }] })); toast('Bloques conectados') } } }
            const drag = e => { e.stopPropagation(); setSel(n.id); act.current = { t: 'node', id: n.id, sx: e.clientX, sy: e.clientY, nx: n.x, ny: n.y } }
            const acts = <span className="acts">
              {n.type !== 'inicio' && <><button title="Duplicar" onMouseDown={e => e.stopPropagation()} onClick={() => setFlow(f => ({ ...f, nodes: [...f.nodes, { ...JSON.parse(JSON.stringify(n)), id: uid(), x: n.x + 40, y: n.y + 40 }] }))}><Copy size={17} /></button>
                <button title="Eliminar" onMouseDown={e => e.stopPropagation()} onClick={() => removeNode(n.id)}><Trash2 size={17} /></button></>}</span>
            const stats = <div className="fe-ns"><div><span>ENTRADAS</span><b>{n.stats[0]}</b></div><div><span>AVANCES</span><b>{n.stats[1]}</b></div><div><span>TASA</span><b>{n.stats[2]}%</b></div></div>
            if (n.type === 'inicio') return <div key={n.id} className={'fe-start' + (sel === n.id ? ' sel' : '') + (run === n.id ? ' run' : '')} style={{ left: n.x, top: n.y }} {...nodeEv}>
              <div className="h" onMouseDown={drag}><Play size={18} fill="#fff" />{n.title && n.title !== 'Início' ? n.title : 'Inicio del Flujo'}</div>
              <div className="b">{n.desc || 'Aquí comienza tu flujo de conversación'}</div>{P('main', undefined, { top: '50%', marginTop: -13, right: -14 })}</div>
            if (NV[n.type]) { const cf = n.cfg || {}; const cls = 'nv nv-' + n.type + (sel === n.id ? ' sel' : '') + (run === n.id ? ' run' : '')
              const ic = NVI[n.type]
              const A = <span className="acts">{n.type !== 'inicio' && <><button title="Duplicar" onMouseDown={e => e.stopPropagation()} onClick={() => setFlow(f => ({ ...f, nodes: [...f.nodes, { ...JSON.parse(JSON.stringify(n)), id: uid(), x: n.x + 40, y: n.y + 40 }] }))}><MI n="copy" size={22} /></button><button title="Eliminar" onMouseDown={e => e.stopPropagation()} onClick={() => removeNode(n.id)}><MI n="del" size={22} /></button></>}</span>
              const Hd = () => <div className="nv-h" onMouseDown={drag}><MI n={ic} size={26} /><b>{FB[n.type][0]}</b>{A}</div>
              const In = st => <span className="fe-port in" data-port={n.id + '|in'} style={st} />
              const Out = (k = 'main', st) => P(k, undefined, { top: '50%', marginTop: -14, right: -16, ...st })
              if (n.type === 'agente') { const paths = (cf.act || 'give') === 'give' ? (cf.paths || '').split(',').map(x => x.trim()).filter(Boolean) : []
                return <div key={n.id} className={'nv-ag' + (sel === n.id ? ' sel' : '') + (run === n.id ? ' run' : '')} style={{ left: n.x, top: n.y }} {...nodeEv}>
                  <div className="circ" onMouseDown={drag}><span className="halo" /><span className="core"><MI n="spark" size={44} /><b>Agente IA</b></span><span className="fe-port in2" />{In()}{(cf.act || 'give') === 'take' && Out()}</div>
                  {A}
                  <div className="cap">IA responde consultas o avanza por un camino</div>
                  {paths.length > 0 && <div className="outs">{paths.map((p, i) => { const pay = /pago|\$|pay|cobro/i.test(p); return <div key={i} className={'op' + (pay ? ' pay' : '')}><i />{pay && <span className="cd">💳</span>}{p}{pay && <MI n="clip" size={20} color="#9ca3af" />}{Out('p' + i, { right: -17 })}</div> })}</div>}
                </div> }
              const mute = t => <span className="nv-mu">{t}</span>
              let bd, outs = null
              if (n.type === 'mensaje') bd = <div className="nv-b">{(n.actions || []).length ? n.actions.slice(0, 5).map(a => { const t = a.type; const m = { text: ['chat', '#3b82f6'], image: ['image', '#10b981'], video: ['video', '#8b5cf6'], audio: ['mic', '#f97316'], file: ['file', '#64748b'], delay: ['hourglass', '#06b6d4'] }[t] || ['chat', '#3b82f6']
                return <div key={a.id} className="nv-it"><MI n={m[0]} size={24} color={m[1]} /><span>{t === 'text' ? a.text : t === 'delay' ? `${a.sec || a.time || 3} segundos` : a.file?.name || a.name || ''}</span></div> })
                : <div className="nv-it"><MI n="image" size={24} color="#10b981" /><span /></div>}</div>
              else if (n.type === 'botones') { const btns = (cf.buttons || '').split(',').map(x => x.trim()).filter(Boolean)
                bd = <div className="nv-b"><span className="nv-tag">QR + API OFICIAL · CONTINÚA AUTOMÁTICO</span><div className="nv-tx">{cf.text || mute('Escribe el mensaje…')}</div>{btns.map((b, i) => <div key={i} className="nv-bt">{b}</div>)}</div> }
              else if (n.type === 'seguimiento') { const ts = (cf.times || '').split(',').map(x => parseInt(x)).filter(x => x > 0)
                bd = <div className="nv-b"><div className="nv-lb">Configuración de tiempos:</div>{ts.length ? ts.map((t, i) => <div key={i} className="nv-tm">Tiempo {i + 1} ({t >= 1440 ? +(t / 1440).toFixed(1) + 'd' : t >= 60 ? +(t / 60).toFixed(1) + 'h' : t + 'min'})<em>{i + 1}</em></div>) : <div className="nv-tm em">Sin tiempos</div>}</div> }
              else if (n.type === 'conexion') bd = <div className="nv-b"><div className="nv-chip pu"><MI n="split" size={22} color="#7c3aed" /><span>{(n.desc || '').replace(/^→\s*/, '') || 'Seleccione un flujo'}</span></div></div>
              else if (n.type === 'copiar') bd = <div className="nv-b dk"><div className="nv-cap">SÓLO BUSINESS · QR · CONTINÚA AUTOMÁTICO</div><div className="nv-ct">{cf.text || mute('Mensaje')}</div><div className="nv-cb"><MI n="copy" size={22} />{cf.btn || 'Copiar'}</div><div className="nv-cs">Copia: {cf.copy || '—'}</div></div>
              else if (n.type === 'intervalo') bd = <div className="nv-b"><div className="nv-chip cy"><MI n="hourglass" size={22} color="#0e7490" /><span>{(() => { const [v, u] = cf.time || [1, 'minutes']; return v + ' ' + ({ seconds: 'segundos', minutes: 'minutos', hours: 'horas', days: 'días' })[u] })()}</span></div></div>
              else if (n.type === 'notificacion') bd = <div className="nv-b nt"><div className="nv-l1">{cf.name || cf.phone?.n ? `WhatsApp → ${cf.name || '+' + cf.phone.n}` : mute('Sin configurar')}</div><div className="nv-l2">🔔 {cf.msg || 'Mensaje de la notificación'}</div></div>
              else if (n.type === 'etiquetas') bd = <div className="nv-b">{(cf.add || []).length + (cf.remove || []).length ? <div className="nv-tags">{(cf.add || []).map(t => <span key={'a' + t} className="ad">+ {t}</span>)}{(cf.remove || []).map(t => <span key={'r' + t} className="rm">− {t}</span>)}</div> : <div className="nv-chip in">{mute('Sin etiquetas')}</div>}</div>
              else if (n.type === 'ticket') bd = <div className="nv-b"><div className="nv-chip in">{cf.who ? '+' + cf.who : mute('+ Asignar')}</div></div>
              else if (n.type === 'pais') { const cs = paisCodes(cf.codes)
                bd = <div className="nv-b">{cs.map(([cd, nm], i) => <div key={i} className="nv-pr"><b>+{cd}</b><span>{nm}</span>{Out('c' + cd, { right: -30 })}</div>)}<div className="nv-pr ot"><b>Otros países</b>{Out('otros', { right: -30 })}</div></div>; outs = true }
              const hasOut = !outs && n.type !== 'conexion'
              return <div key={n.id} className={cls} style={{ left: n.x, top: n.y }} {...nodeEv}><Hd />{bd}{In()}
                {hasOut && (n.type === 'seguimiento' ? P('main', undefined, { top: 'auto', bottom: -16, right: 'auto', left: '50%', marginLeft: -14, marginTop: 0, background: 'linear-gradient(145deg,#10b981,#059669)' }) : Out())}</div> }
            if (ROUND[n.type]) { const [cc, lbl] = ROUND[n.type]; const cf = n.cfg || {}
              return <div key={n.id} className={'fe-rn' + (sel === n.id ? ' sel' : '') + (run === n.id ? ' run' : '')} style={{ left: n.x, top: n.y, '--c': cc }} {...nodeEv}>
                <div className={'circ ' + n.type} onMouseDown={drag}><I size={34} strokeWidth={2} /><b>{n.type === 'llamar' ? `${lbl} ${cf.ring || 8}s` : lbl}</b>
                  <span className="fe-port in" data-port={n.id + '|in'} />{outs && outs.length === 0 ? null : P('main', undefined, { top: '50%', marginTop: -13, right: -14 })}{acts}</div><div className="cap">{n.desc || ({ agente: 'IA responde consultas o avanza por un camino', venta: 'Registra la venta en el dashboard', llamar: 'Realiza una llamada de voz' })[n.type]}</div></div> }
            const rows = outs || []; const pp = rows.filter(o => o.k === 'success' || o.k === 'failure'); const lr = rows.filter(o => !pp.includes(o))
            let body
            if (n.type === 'esperar') { const [m, to] = rows
              body = <><div className="fe-row or" style={{ marginTop: 8 }}>{desc || 'Esperar la respuesta del cliente.'}{P(m.k, '#6b7280')}</div>
                {to && <><div className="fe-or">si no responde</div><div className="fe-row or2">{to.s}{P(to.k, '#6b7280')}</div></>}</> }
            else if (n.type === 'carrusel') { const cf = n.cfg || {}; const cards = cf.cards || [{ text: '', buttons: [{ title: 'Opción A', type: 'reply' }] }]
              body = <><div className="fe-row bl" style={{ marginTop: 8 }}>📝 {cf.intro || 'Elige una opción abajo'}<small>Tarjetas: {cards.length} · {cf.exp ? cf.exp + ' ' + ({ seconds: 's', minutes: 'min', hours: 'h', days: 'd' })[cf.unit || 'days'] : '2 d'} · Botones REPLY: {cards.reduce((a, k) => a + (k.buttons || []).filter(b => (b.type || 'reply') === 'reply').length, 0)}</small></div>
                {cards.map((k, i) => <div key={i} className="fe-card"><div className="th">{k.img ? <img src={k.img} alt="" /> : i + 1}</div><span>{k.text || 'Sin texto en la tarjeta'}</span></div>)}
                {lr.map(o => <div key={o.k} className={'fe-row ' + (o.k.startsWith('b') ? 'bl' : o.c)}>{o.k.startsWith('b') ? 'Respuesta al botón' : o.l}{o.k.startsWith('b') && <small>{o.s}</small>}{P(o.k, o.pc)}</div>)}</> }
            else if (n.type === 'ariapay') body = <><div className="fe-pill">{desc}</div>{lr.map(o => <div key={o.k} className="fe-lr">{o.l}{P(o.k, o.pc)}</div>)}</>
            else if (outs && !pp.length) body = <>{desc && !['menu', 'template'].includes(n.type) && <div className="fe-nd" style={{ fontSize: 13, paddingTop: 6 }}>{desc}</div>}
              <div style={{ paddingTop: 4, minHeight: outs.length ? 0 : 34 }}>{outs.map(o => <div key={o.k} className={'fe-row ' + o.c}>{o.l}{o.s && <small>{o.s}</small>}{P(o.k, o.pc)}</div>)}</div></>
            else if (outs) body = <><div className="fe-nd" style={{ fontSize: 13, paddingTop: 6, minHeight: 34 }}>{desc}</div>
              {lr.map(o => <div key={o.k} className={'fe-row ' + o.c}>{o.l}{P(o.k, o.pc)}</div>)}
              <div className="fe-pp">{pp.map(o => P(o.k, o.pc, { position: 'relative', right: 'auto' }))}</div></>
            else body = <><div className="fe-items">{n.type === 'mensaje' ? ((n.actions || []).length ? n.actions.slice(0, 4).map(a => { const [l, AI, ac] = ACT[a.type] || ACT.text; return <div key={a.id} className="fe-it"><AI size={18} color={ac} /><span>{a.type === 'text' ? (a.text || 'Mensaje vacío') : a.type === 'delay' ? `Esperar ${a.sec || a.time || 3}s` : (a.file?.name || a.name || '')}</span></div> }) : <div className="fe-it em"><MessageSquare size={18} color="#3b82f6" /><span>Sin mensajes · clic para editar</span></div>)
              : <div className="fe-chip" style={{ '--c': c }}><I size={16} /><span>{desc || 'Clic para configurar'}</span></div>}{(n.actions || []).length > 4 && <small className="fe-more">+{n.actions.length - 4} más</small>}</div>{P('main', undefined, {})}</>
            return <div key={n.id} className={'fe-node' + (sel === n.id ? ' sel' : '') + (run === n.id ? ' run' : '')} style={{ left: n.x, top: n.y, borderColor: c }} {...nodeEv}>
            <div className={'fe-nh' + (tpl ? ' sm' : '')} style={{ background: `linear-gradient(120deg,${g ? g[1] : c} 0%,${c} 45%,color-mix(in srgb,${g ? g[0] : c} 62%,#fff) 100%)` }} onMouseDown={drag}>
              {!tpl && <span className="ic">{n.type === 'ariapay' ? <img src="/leona-mark.png" alt="" style={{ width: 26, height: 26 }} /> : <I size={20} />}</span>}<b>{n.title}</b>{acts}</div>
            {tpl && <div className="fe-box"><b>{n.tpl?.name || 'Template não selecionado'}</b><span>Template Meta HSM · Quick Reply</span></div>}
            {body}
            {n.type !== 'inicio' && <span className="fe-port in" data-port={n.id + '|in'} />}
          </div> })}
        </div>
      </div>
      <div className="fe-tools"><button className={'fe-tb' + (panel === 'tools' ? ' p' : '')} onClick={() => setPanel(panel === 'tools' ? null : 'tools')}><LayoutGrid size={16} />Herramientas</button>
        <button className={'fe-tb' + (panel === 'sim' ? ' p' : '')} onClick={() => setPanel(panel === 'sim' ? null : 'sim')}><Play size={14} fill="currentColor" />Simular</button></div>
      {panel === 'tools' && <div className="fe-pal"><div className="s"><div><Search size={16} color="#8f8a9e" /><input autoFocus value={pq} onChange={e => setPq(e.target.value)} placeholder="Buscar bloques..." /></div></div>
        <div className="l">{PAL.map(k => [k, FB[k]]).filter(([k, b]) => b[0].toLowerCase().includes(pq.toLowerCase())).map(([k, [l, c, I]]) => <button key={k} className="fe-pi" title={B(k)[3]} onClick={() => addNode(k)}><MI n={NVI[k]} size={21} color={k === 'ticket' ? '#6366f1' : k === 'notificacion' ? '#f59e0b' : c} />{l}</button>)}</div></div>}
      {panel === 'sim' && <Simulator flow={flow} onClose={() => { setPanel(null); setRun(null) }} onStep={nid => { setRun(nid); if (nid) setFlow(f => ({ ...f, nodes: f.nodes.map(n => n.id === nid ? { ...n, stats: [n.stats[0] + 1, n.stats[1] + 1, 100] } : n) })) }} />}
      <div className="fe-zoom"><button onClick={() => setView(v => ({ ...v, k: Math.max(.25, v.k * .85) }))}><ZoomOut size={16} /></button><button onClick={() => setView(v => ({ ...v, k: Math.min(2.5, v.k * 1.15) }))}><ZoomIn size={16} /></button><i /><button title="Ajustar a la pantalla" onClick={fit}><Maximize2 size={15} /></button><button title="Ordenar bloques automáticamente" onClick={() => { setFlow(f => autoLayout(f)); setTimeout(() => fitRef.current && fitRef.current(), 120); toast('Bloques ordenados') }}><Workflow size={15} /></button><button onClick={() => setView({ x: 0, y: 0, k: 1 })}><RotateCcw size={15} /></button></div>
      <div className="fe-mm"><svg width="100%" height="100%" viewBox={`${mmX} ${mmY} ${mmW} ${mmH}`} preserveAspectRatio="xMidYMid meet" style={{ background: 'var(--mmbg,#12161f)', display: 'block' }}>
        {flow.nodes.map(n => <rect key={n.id} x={n.x} y={n.y} width={NW} height={NH} fill={sel === n.id ? '#005ae3' : n.type === 'inicio' ? '#10b981' : B(n.type)[1]} />)}
        {box.current && <rect x={-view.x / view.k} y={-view.y / view.k} width={box.current.clientWidth / view.k} height={box.current.clientHeight / view.k} fill="rgba(0,90,227,.06)" stroke="#005ae3" strokeWidth={mmW / 140} />}
      </svg></div>
    </div>
    {del && <LModal open onClose={() => setDel(null)} title="Eliminar nodo" icon={<TriangleAlert size={21} color="#ef4444" />} width={472} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55, color: 'var(--soft)' }}>¿Seguro que desea eliminar el nodo "{del.title}"?</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 22, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}><button className="lb2 g" onClick={() => setDel(null)}>Cancelar</button><button className="lb2 d" onClick={() => { doRemove(del.id); toast('Nodo eliminado') }}>Eliminar</button></div></LModal>}
    {edit && CUSTOM_ED[edit.type] && (() => { const E = CUSTOM_ED[edit.type]; const save = ({ __new, ...n }) => { setFlow(f => ({ ...f, nodes: f.nodes.map(x => x.id === n.id ? n : x), edges: f.edges.filter(e => e.from !== n.id || (nodeOuts(n) ? nodeOuts(n).some(o => o.k === (e.port || 'main')) : !e.port || e.port === 'main')) })); setEdit(null); toast('Nodo guardado') }
      return <E node={edit} flowId={flow.id} isNew={!!edit.__new} onClose={() => setEdit(null)} onSave={save} /> })()}
    {edit && !CUSTOM_ED[edit.type] && ['template', 'pix', 'menu'].includes(edit.type) && (() => { const save = n => { setFlow(f => ({ ...f, nodes: f.nodes.map(x => x.id === n.id ? n : x), edges: f.edges.filter(e => e.from !== n.id || !e.port || e.port === 'main' || (nodeOuts(n) || []).some(o => o.k === e.port)) })); setEdit(null); toast('Nodo guardado') }
      const M = { template: TemplateModal, etiquetas: TagsModal, pix: PixModal, menu: MenuModal }[edit.type]; return <M node={edit} onClose={() => setEdit(null)} onSave={save} /> })()}
    {edit && !CUSTOM_ED[edit.type] && !['template', 'pix', 'menu'].includes(edit.type) && (edit.type === 'mensaje' ? <MessageModal node={edit} onClose={() => setEdit(null)} onSave={n => { setFlow(f => ({ ...f, nodes: f.nodes.map(x => x.id === n.id ? n : x) })); setEdit(null); toast('Mensaje guardado') }} />
      : (() => { const save = n => { setFlow(f => ({ ...f, nodes: f.nodes.map(x => x.id === n.id ? n : x), edges: f.edges.filter(e => e.from !== n.id || (nodeOuts(n) ? (nodeOuts(n).some(o => o.k === (e.port || 'main'))) : !e.port || e.port === 'main')) })); setEdit(null); toast('Nodo guardado') }
        const [, c, I] = B(edit.type)
        if (edit.type === 'inicio') return <StartModal node={edit} flowName={flow.name} onClose={() => setEdit(null)} onSave={save} />
        if (edit.type === 'carrusel') return <CarouselModal node={edit} onClose={() => setEdit(null)} onSave={save} />
        if (NODE_DEF[edit.type]) return <GenericNodeModal node={edit} def={NODE_DEF[edit.type]} color={c} icon={<I size={20} />} flowId={flow.id} onClose={() => setEdit(null)} onSave={save} />
        return <NodeModal node={edit} onClose={() => setEdit(null)} onSave={save} /> })())}
    {modal === 'tr' && <TranslateModal flow={flow} onClose={() => setModal(null)} />}
    {modal === 'ai' && <AiPanel flow={flow} onLayout={() => { setFlow(f => autoLayout(f)); setTimeout(() => fitRef.current && fitRef.current(), 120) }} onClose={() => setModal(null)} onGen={types => { const base = flow.nodes.length ? Math.max(...flow.nodes.map(n => n.y)) + 220 : 100; const ns = types.map((t, i) => newNode(t, 80 + i * 330, base + (i % 2) * 60)); const last = flow.nodes.length ? flow.nodes[flow.nodes.length - 1] : null
      setFlow(f => ({ ...f, nodes: [...f.nodes, ...ns], edges: [...f.edges, ...(last ? [{ id: uid(), from: last.id, to: ns[0].id }] : []), ...ns.slice(1).map((n, i) => ({ id: uid(), from: ns[i].id, to: n.id }))] })); setModal(null); setReady(false); toast('Flujo generado con LeonaAI') }} />}
  </div>
}

const AI_SUG = ['Armar bienvenida con menú de opciones', 'Agregar cobro PIX después de elegir el plan', 'Reorganizar el canvas y conectar los caminos que faltan', 'Crea una imagen de portada para el mensaje de bienvenida']
export function autoLayout(f) {
  const out = {}; f.edges.forEach(e => (out[e.from] = out[e.from] || []).push(e.to))
  const start = f.nodes.find(n => n.type === 'inicio') || f.nodes[0]; if (!start) return f
  const depth = { [start.id]: 0 }; const q = [start.id]
  while (q.length) { const id = q.shift(); (out[id] || []).forEach(t => { if (depth[t] == null) { depth[t] = depth[id] + 1; q.push(t) } }) }
  const H = n => 230 + (nodeOuts(n) || []).length * 50 + (n.type === 'carrusel' ? 160 : n.type === 'template' ? 60 : 0)
  const cols = {}; f.nodes.filter(n => depth[n.id] != null).forEach(n => (cols[depth[n.id]] = cols[depth[n.id]] || []).push(n))
  const pos = {}; let bottom = 0; Object.entries(cols).forEach(([d, ns]) => { let y = 0; ns.forEach(n => { pos[n.id] = { x: +d * 360, y }; y += H(n) + 40 }); bottom = Math.max(bottom, y) })
  const loose = f.nodes.filter(n => depth[n.id] == null); let row = 0, rowH = 0
  loose.forEach((n, i) => { const c = i % 6; if (c === 0 && i) { row += rowH + 60; rowH = 0 } pos[n.id] = { x: c * 360, y: bottom + 120 + row }; rowH = Math.max(rowH, H(n)) })
  return { ...f, nodes: f.nodes.map(n => ({ ...n, ...pos[n.id] })) }
}
function AiPanel({ flow, onClose, onGen, onLayout }) {
  const nav = useNavigate(); const toast = useToast()
  const [tokR] = useStore('tokens', {}); const bal = +(tokR && tokR.balance) || 0
  const [threads, setThreads] = useStore('ai_threads_' + flow.id, [])
  const [cur, setCur] = useState(null); const [txt, setTxt] = useState(''); const [hist, setHist] = useState(false); const [busy, setBusy] = useState(false); const [rec, setRec] = useState(false)
  const th = threads.find(t => t.id === cur); const msgs = th ? th.msgs : []
  const end = useRef(); useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length, busy])
  const plan = s => { s = s.toLowerCase(); const types = ['mensaje']; if (/bienven|men[uú]|opcion/.test(s)) types.push('menu'); if (/pregunt|respond|espera/.test(s)) types.push('esperar'); if (/agente|duda|\bia\b/.test(s)) types.push('agente'); if (/etiquet/.test(s)) types.push('etiquetas'); if (/kanban|crm/.test(s)) types.push('kanban'); if (/pix/.test(s)) types.push('pix'); else if (/pag|cobr|link/.test(s)) types.push('pago'); if (/venta|compr/.test(s)) types.push('venta'); if (types.length === 1) types.push('esperar', 'agente'); return types }
  const send = q => { q = (q ?? txt).trim(); if (!q || bal <= 0 || busy) return; setTxt('')
    let id = cur; const um = { r: 'u', t: q }
    if (!th) { id = uid(); setThreads(ts => [{ id, title: q.slice(0, 48), at: Date.now(), msgs: [um] }, ...ts]); setCur(id) } else setThreads(ts => ts.map(t => t.id === id ? { ...t, msgs: [...t.msgs, um] } : t))
    setBusy(true); setTimeout(() => { const types = plan(q); if (/reorganiz/.test(q.toLowerCase())) onLayout(); else if (!/imagen|portada/.test(q.toLowerCase())) onGen(types)
      const a = /reorganiz/.test(q.toLowerCase()) ? 'Reorganicé el canvas: alineé los bloques por columnas y revisé las conexiones que faltaban.' : /imagen|portada/.test(q.toLowerCase()) ? 'Generar imágenes requiere la integración de imagen activa. Configúrala en Integraciones y lo intento de nuevo.' : `Listo. Agregué ${types.length} bloques al canvas: ${types.map(t => FB[t][0]).join(' → ')}. Revisa cada bloque y ajusta los textos.`
      setThreads(ts => ts.map(t => t.id === id ? { ...t, msgs: [...t.msgs, { r: 'a', t: a }] } : t)); setBusy(false) }, 1400) }
  return <div className="ai-pn">
    <div className="ai-h"><span className="av"><img src="/leona-mark.png" alt="" /></span><div style={{ minWidth: 0, flex: 1 }}><b>{th ? th.title : 'Nuevo hilo en este flujo'}</b><small>{bal > 0 ? `${bal.toLocaleString('es')} tokens Leona disponibles` : 'Pausa por tokens Leona'}</small></div>
      <span className={'tk' + (bal > 0 ? ' ok' : '')} title="Saldo de tokens Leona">{bal > 999 ? Math.floor(bal / 1000) + 'k' : bal}</span>
      <button title="Historial" onClick={() => setHist(!hist)}><History size={18} /></button><button title="Nuevo hilo" onClick={() => { setCur(null); setHist(false) }}><Plus size={19} /></button><button title="Cerrar" onClick={onClose}><X size={19} /></button></div>
    {hist && <div className="ai-hist"><div className="t">Hilos de este flujo</div>{threads.length ? threads.map(t => <button key={t.id} className={t.id === cur ? 'on' : ''} onClick={() => { setCur(t.id); setHist(false) }}><MessageCircle size={15} /><span>{t.title}</span><small>{new Date(t.at).toLocaleDateString('es-PE')}</small></button>) : <div className="e">Aún no hay hilos.</div>}</div>}
    <div className="ai-b">
      {!th && <><h3>¿Qué quieres construir en este flujo?</h3><p>Cuéntanos el resultado que buscas. Lo armamos en el canvas en tiempo real.</p>
        {AI_SUG.map(x => <button key={x} className="ai-s" onClick={() => bal > 0 ? send(x) : setTxt(x)}>{x}</button>)}</>}
      {msgs.map((m, i) => <div key={i} className={'ai-m ' + m.r}>{m.r === 'a' && <span className="av"><img src="/leona-mark.png" alt="" /></span>}<div>{m.t}</div></div>)}
      {busy && <div className="ai-m a"><span className="av"><img src="/leona-mark.png" alt="" /></span><div className="dots"><i /><i /><i /></div></div>}
      {bal <= 0 && <div className="ai-pause"><b>Pausa por tokens Leona</b><p>Paré aquí para no dejar el trabajo a medias sin saldo. Agrega tokens Leona y seguimos desde este punto.</p><p>Saldo actual: {bal}</p>
        <div className="r"><button className="a" onClick={() => nav('/billing')}>Agregar tokens Leona</button><button disabled>Continuar desde donde paramos</button><button className="n" onClick={() => { setCur(null); setTxt('') }}>Empezar otro tema</button></div></div>}
      <div ref={end} /></div>
    <div className="ai-f"><div className="box"><textarea value={txt} disabled={bal <= 0} onChange={e => setTxt(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder={bal > 0 ? 'Describe lo que quieres construir…' : 'Agrega tokens Leona para continuar este hilo'} />
      <div className="r"><button title="Adjuntar" disabled={bal <= 0} onClick={() => toast('Adjunta imágenes o PDF para dar contexto', 'info')}><Paperclip size={17} /></button><button title="Dictar" disabled={bal <= 0} className={rec ? 'rec' : ''} onClick={() => { setRec(!rec); if (rec) setTxt(t => t + (t ? ' ' : '') + 'Armar bienvenida con menú de opciones') }}><Mic size={17} /></button>
        <span style={{ marginLeft: 'auto' }} /><button title="Más"><MoreHorizontal size={17} /></button><button className="snd" disabled={bal <= 0 || !txt.trim() || busy} onClick={() => send()}><Send size={16} /></button></div></div></div>
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

/* ======================= Editores de nodos ======================= */
function NModal({ title, icon, grad, width = 546, children, onClose, footer, tall }) {
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  return <div className="lm-ov" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="lm" style={{ maxWidth: width, maxHeight: '94vh' }}>
    <div className="fe-mh"><span className="ic" style={{ background: grad }}>{icon}</span><h2>{title}</h2><button style={{ marginLeft: 'auto', color: 'var(--muted)', display: 'grid' }} onClick={onClose}><X size={19} /></button></div>
    <div className="lm-b" style={{ padding: '20px 24px 0', overflowY: 'auto' }}>{children}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 18, padding: '14px 0 20px', display: 'flex', justifyContent: 'flex-end', gap: 11 }}>{footer}</div></div>
  </div></div>
}
const Foot = ({ onClose, onOk, ok = true }) => <><button className="lb2 g" onClick={onClose}>Cancelar</button><button className="lb2 p" disabled={!ok} onClick={onOk}>Guardar</button></>

function TemplateModal({ node, onClose, onSave }) {
  const [tpls] = useStore('wa_templates', []); const ok = tpls.filter(t => t.status === 'APROBADO')
  const [t, setT] = useState({ id: '', name: '', timeout: 60, unit: 'm', ...(node.tpl || {}) })
  return <NModal title="Editar" icon={<MessageSquare size={20} />} grad="#2563eb" width={516} onClose={onClose} footer={<Foot onClose={onClose} onOk={() => onSave({ ...node, tpl: t, desc: '' })} />}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 600, marginBottom: 15 }}><FileText size={16} color="#34d399" />Template WhatsApp (Meta)</div>
    <div className="fe-lb" style={{ fontSize: 12.5 }}>Template aprovado</div>
    <LSelect className="l-in" bold value={t.id} onChange={v => setT({ ...t, id: v, name: ok.find(x => x.id === v)?.name || '' })} placeholder={ok.length ? 'Selecione um template' : 'Selecione um template'} options={ok.map(x => ({ value: x.id, label: x.name }))} style={{ background: 'var(--in2)' }} />
    {!ok.length && <div className="fe-small" style={{ marginTop: 6 }}>Ningún template aprobado. Créelo en Configuración › Templates de WhatsApp.</div>}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 15 }}>
      <div><div className="fe-lb" style={{ fontSize: 12.5 }}>Timeout de resposta</div><input className="l-in" type="number" min="1" style={{ height: 41, background: 'var(--in2)', fontWeight: 700 }} value={t.timeout} onChange={e => setT({ ...t, timeout: Math.max(1, +e.target.value || 1) })} /></div>
      <div><div className="fe-lb" style={{ fontSize: 12.5 }}>Unidade</div><LSelect className="l-in" bold value={t.unit} onChange={v => setT({ ...t, unit: v })} options={[['m', 'Minutos'], ['h', 'Horas'], ['d', 'Días']].map(([value, label]) => ({ value, label }))} /></div></div>
  </NModal>
}

function TagsModal({ node, onClose, onSave }) {
  const [store, setStore] = useStore('tags', []); const [contacts] = useStore('contacts', [])
  const all = [...new Set([...store.map(t => t.name), ...contacts.flatMap(c => c.tags || [])])]
  const [tags, setTags] = useState(node.tags || []); const [add, setAdd] = useState(node.tagMode !== 'remove'); const [q, setQ] = useState('')
  const sug = all.filter(t => !tags.includes(t) && t.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
  const pick = t => { t = t.trim(); if (!t) return; if (!all.includes(t)) setStore(x => [...x, { id: uid(), name: t, color: '#005ae3' }]); if (!tags.includes(t)) setTags([...tags, t]); setQ('') }
  return <NModal title="Editar etiquetas" icon={<Tag size={20} />} grad="#639cf1" width={514} onClose={onClose}
    footer={<Foot onClose={onClose} onOk={() => onSave({ ...node, tags, tagMode: add ? 'add' : 'remove', desc: tags.length ? `${add ? 'Añadir' : 'Quitar'} etiquetas: ${tags.join(', ')}` : '' })} />}>
    <div className="fe-lb" style={{ fontWeight: 600 }}>Etiquetas</div>
    <div style={{ position: 'relative' }}><div className="fe-vin" style={{ alignItems: 'center', flexWrap: 'wrap', gap: 6, padding: tags.length ? '6px 10px' : 0, minHeight: 41 }}>
      {!tags.length && <Tag size={15} color="#8f8a9e" style={{ marginLeft: 14 }} />}
      {tags.map(t => <span key={t} className="ct-tag" style={{ margin: 0 }}>{t}<button style={{ marginLeft: 5, display: 'grid', color: '#94a3b8', width: 'auto', border: 'none' }} onClick={() => setTags(tags.filter(x => x !== t))}><X size={11} /></button></span>)}
      <input style={{ height: 38, paddingLeft: tags.length ? 4 : 10, fontSize: 13.3 }} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), pick(q))} placeholder={tags.length ? '' : 'Escriba para buscar o crear una etiqueta'} /></div>
      {q && <div className="l-selm">{!all.includes(q.trim()) && <button className="l-opt" onClick={() => pick(q)}><Plus size={14} />Crear "{q.trim()}"</button>}{sug.map(t => <button key={t} className="l-opt" onClick={() => pick(t)}>{t}</button>)}</div>}</div>
    <div className="fe-small" style={{ marginTop: 6 }}>Pulse Enter para crear una etiqueta nueva o elegir una existente</div>
    <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0 20px', fontSize: 13.3 }}><span style={{ color: add ? 'var(--soft)' : 'var(--text)', fontWeight: add ? 400 : 700, flex: 1 }}>Quitar etiquetas</span><Toggle on={add} onChange={setAdd} /><span style={{ color: add ? 'var(--text)' : 'var(--soft)', fontWeight: add ? 700 : 400, flex: 1, textAlign: 'right' }}>Añadir etiquetas</span></div>
    <div className="fe-how"><Tag size={18} color="var(--soft)" style={{ flexShrink: 0, marginTop: 2 }} /><div><b>Cómo funciona</b><p>{add ? 'Este nodo añade las etiquetas seleccionadas a los clientes mientras se ejecuta el flujo.' : 'Este nodo quita las etiquetas seleccionadas de los clientes mientras se ejecuta el flujo.'}</p></div></div>
  </NModal>
}

function VIn({ v, set, ph, area, max }) {
  const El = area ? 'textarea' : 'input'
  return <div className="fe-vin"><El value={v} maxLength={max} onChange={e => set(e.target.value)} placeholder={ph} /><PickBtn kind="var" title="Insertar variable" onPick={x => set(v + x)}><Code size={16} /></PickBtn></div>
}
function PixModal({ node, onClose, onSave }) {
  const [p, setP] = useState({ type: 'random', key: '', name: '', amount: '', text: '', img: '', ...(node.pix || {}) }); const u = (k, v) => setP({ ...p, [k]: v })
  const ph = { random: '123e4567-e89b-12d3-a456-426614174000', cpf: '000.000.000-00', cnpj: '00.000.000/0000-00', email: 'pagos@empresa.com', phone: '+5511999999999' }[p.type]
  const upload = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = () => { const f = i.files[0]; if (f) u('img', f.name) }; i.click() }
  return <NModal title="Editar PIX" icon={<CreditCard size={20} />} grad="#10b981" width={512} onClose={onClose}
    footer={<Foot onClose={onClose} ok={!!p.key.trim()} onOk={() => onSave({ ...node, pix: p, desc: `PIX ${p.amount ? 'R$ ' + p.amount + ' · ' : ''}${p.key.slice(0, 22)}` })} />}>
    <div className="fe-blk" style={{ padding: '17px 17px 20px' }}>
      <div className="fe-lb">Tipo de clave PIX *</div><LSelect className="l-in" bold value={p.type} onChange={v => u('type', v)} options={[['random', 'Clave aleatoria'], ['cpf', 'CPF'], ['cnpj', 'CNPJ'], ['email', 'Correo'], ['phone', 'Teléfono']].map(([value, label]) => ({ value, label }))} />
      <div className="fe-lb" style={{ marginTop: 17 }}>Clave PIX *</div><VIn v={p.key} set={v => u('key', v)} ph={ph} />
      <div className="fe-small" style={{ marginTop: 6 }}>En la integración oficial, el código EMV del pedido usa esta misma clave. Como en el chat en vivo.</div>
      <div className="fe-lb" style={{ marginTop: 17 }}>Destinatario del pago</div><VIn v={p.name} set={v => u('name', v)} ph="Ej.: Leona Solutions" />
      <div className="fe-small" style={{ marginTop: 6 }}>Si está vacío, se usará "Pix" en conexiones estándar.</div><div className="fe-warn" style={{ marginTop: 13 }}>Obligatorio en la integración oficial (WhatsApp Cloud API / Meta).</div>
      <div className="fe-lb" style={{ marginTop: 17 }}>Importe (BRL)</div><VIn v={p.amount} set={v => u('amount', v.replace(/[^\d,.{}a-z_]/gi, ''))} ph="Ej.: 49,90" />
      <div className="fe-warn">Obligatorio cuando el flujo se ejecuta en la integración oficial (WhatsApp Cloud API / Meta).</div>
      <div className="fe-lb" style={{ marginTop: 17 }}>Texto del mensaje (opcional)</div><VIn area v={p.text} set={v => u('text', v)} ph="Ej.: Paga R$ {valor} por Pix como acordamos 👇" max={1024} />
      <div className="fe-warn">Integración oficial Meta: texto libre en la tarjeta Pix. Las conexiones estándar ignoran este campo.</div><div className="fe-small" style={{ textAlign: 'right' }}>{p.text.length}/1024</div>
      <div className="fe-lb" style={{ marginTop: 10 }}>Imagen de la tarjeta (URL o variable)</div><VIn v={p.img} set={v => u('img', v)} ph="https://cdn.ejemplo.com/banner.jpg o {product_image}" />
      <div className="fe-warn">Integración oficial Meta: imagen en la parte superior. Las conexiones estándar la ignoran.</div>
      <button className="lb2 o" style={{ marginTop: 13, height: 39, fontSize: 14 }} onClick={upload}><Upload size={16} />Subir imagen</button>
      <div className="fe-help" style={{ marginTop: 16 }}>Use variables como {'{full_name}'} o campos personalizados. Los valores se resuelven al ejecutar el flujo.</div>
    </div>
    <div className="fe-how"><CreditCard size={14} color="var(--soft)" style={{ flexShrink: 0, marginTop: 3 }} /><div><b>Cómo funciona</b><p>Este nodo envía un botón PIX para que el cliente copie la clave y pague en la app del banco. El mismo bloque sirve para conexiones estándar y para la integración oficial.</p>
      <div className="fe-warn" style={{ fontWeight: 600, marginTop: 9 }}>En conexiones estándar bastan clave y tipo. En la integración oficial (Meta), el importe y el nombre del destinatario son obligatorios en tiempo de ejecución. Complételos arriba para que el envío funcione.</div></div></div>
  </NModal>
}

function MenuModal({ node, onClose, onSave }) {
  const [m, setM] = useState({ mode: 'list', text: '', btn: '', exp: 0, unit: 'd', options: [], buttons: [], footer: '', img: false, imgUrl: '', field: '', ...(node.menu || {}) }); const u = p => setM({ ...m, ...p })
  const L = m.mode === 'list'; const key = L ? 'options' : 'buttons'; const list = m[key]
  const maxExp = { m: 44640, h: 744, d: 31 }[m.unit]
  const ok = m.text.trim() && (!L || m.btn.trim()) && list.length > 0 && list.every(o => o.title.trim())
  return <NModal title="Menú" icon={<List size={20} />} grad="#1a73f0" width={512} onClose={onClose}
    footer={<Foot onClose={onClose} ok={ok} onOk={() => onSave({ ...node, menu: m, desc: m.text })} />}>
    <div className="fe-seg" style={{ marginTop: 10 }}><button className={L ? 'on' : ''} onClick={() => u({ mode: 'list' })}><List size={15} />Lista</button><button className={!L ? 'on' : ''} onClick={() => u({ mode: 'buttons' })}><Square size={14} />Botones</button></div>
    {!L && <div className="fe-blk" style={{ padding: '15px 15px', marginBottom: 14 }}><label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.3, cursor: 'pointer' }}><input type="checkbox" checked={m.img} onChange={e => u({ img: e.target.checked })} style={{ width: 15, height: 15 }} /><b>Imagen</b><span style={{ color: 'var(--soft)', marginLeft: -5 }}>(opcional)</span></label>
      {m.img && <input className="l-in" style={{ height: 38, marginTop: 11, background: 'var(--in2)' }} value={m.imgUrl} onChange={e => u({ imgUrl: e.target.value })} placeholder="https://ejemplo.com/imagen.jpg o {imagen_producto}" />}</div>}
    <div className="fe-lb">Mensaje *</div><Editor value={m.text} onChange={v => u({ text: v })} ph={L ? 'Ej.: Seleccione la mejor opción:' : 'Ej.: ¿Es esto lo que quiere?'} />
    {L ? <><div className="fe-lb" style={{ marginTop: 15 }}>Texto del botón *</div><input className="l-in" style={{ height: 41, background: 'var(--in2)' }} maxLength={20} value={m.btn} onChange={e => u({ btn: e.target.value })} placeholder="Ej.: Abrir lista de opciones" /></>
      : <><div className="fe-lb" style={{ marginTop: 15 }}>Pie <span style={{ fontWeight: 400, marginLeft: 4 }}>(opcional)</span></div><input className="l-in" style={{ height: 41, background: 'var(--in2)' }} maxLength={60} value={m.footer} onChange={e => u({ footer: e.target.value })} placeholder="Ej.: Mensaje con botón" /></>}
    <div className="fe-lb" style={{ marginTop: 15, marginBottom: 3 }}>Tiempo de expiración del menú (salida por inactividad)</div>
    <div className="fe-small" style={{ fontSize: 11.5 }}>Se 0, o padrão é 2 dias. Se definir um tempo, a saída por inatividade será exibida no fluxo. Limite máximo: 31 dias no total.</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 9 }}><input className="l-in" type="number" min="0" max={maxExp} style={{ height: 41, background: 'var(--in2)', textAlign: 'center', fontWeight: 700 }} value={m.exp} onChange={e => u({ exp: Math.min(maxExp, Math.max(0, +e.target.value || 0)) })} />
      <LSelect className="l-in" bold value={m.unit} onChange={v => u({ unit: v, exp: Math.min(m.exp, { m: 44640, h: 744, d: 31 }[v]) })} options={[['m', 'Minutos'], ['h', 'Horas'], ['d', 'Días']].map(([value, label]) => ({ value, label }))} /></div>
    <div style={{ display: 'flex', alignItems: 'center', margin: '17px 0 12px' }}><b style={{ fontSize: 13.3 }}>{L ? 'Opciones del menú' : 'Opciones de botones'}</b>
      <button className="lb2 p sm" style={{ marginLeft: 'auto', height: 37 }} disabled={!L ? list.length >= 3 : list.length >= 10} onClick={() => u({ [key]: [...list, { id: uid(), title: '', desc: '' }] })}><Plus size={16} />{L ? 'Añadir opción' : 'Añadir botón'}</button></div>
    {list.length === 0 ? <div style={{ border: '1.5px dashed var(--border2)', borderRadius: 7, padding: '22px 20px', textAlign: 'center', color: 'var(--soft)', fontSize: 13.3, lineHeight: 1.5 }}><List size={28} style={{ marginBottom: 6 }} /><br />{L ? 'Ninguna opción añadida. Haga clic en "Añadir opción" para empezar.' : 'Ningún botón añadido. Haga clic en "Añadir botón" para empezar.'}</div>
      : list.map((o, i) => <div key={o.id} className="fe-opt"><span style={{ width: 22, fontSize: 13, color: 'var(--soft)', textAlign: 'center' }}>{i + 1}</span>
        <input className="l-in" style={{ height: 38, background: 'var(--in2)', flex: 1 }} maxLength={L ? 24 : 20} value={o.title} onChange={e => u({ [key]: list.map(x => x.id === o.id ? { ...x, title: e.target.value } : x) })} placeholder={L ? 'Título de la opción' : 'Texto del botón'} />
        {L && <input className="l-in" style={{ height: 38, background: 'var(--in2)', flex: 1 }} maxLength={72} value={o.desc} onChange={e => u({ [key]: list.map(x => x.id === o.id ? { ...x, desc: e.target.value } : x) })} placeholder="Descripción (opcional)" />}
        <button className="ch-ib" onClick={() => u({ [key]: list.filter(x => x.id !== o.id) })}><Trash2 size={15} /></button></div>)}
    {!L && <div className="fe-small" style={{ marginTop: 6 }}>Máximo 3 botones.</div>}
    <div className="fe-lb" style={{ marginTop: 18 }}>Campo para guardar la respuesta del usuario</div><input className="l-in" style={{ height: 41, background: 'var(--in2)' }} value={m.field} onChange={e => u({ field: e.target.value.replace(/[^a-z0-9_]/gi, '_').toLowerCase() })} placeholder="Ej.: eleccion_menu" />
    <div className="fe-small" style={{ marginTop: 6 }}>Deje en blanco para no guardar la respuesta.</div>
  </NModal>
}
