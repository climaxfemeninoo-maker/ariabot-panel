import { useState, useRef } from 'react'
import { X, Plus, Trash2, ChevronUp, ChevronDown, Upload, ShieldCheck, RefreshCw, Copy, ClipboardPaste, Eraser, Type, Image as ImgI, Mic, Video, FileText, Timer, Pause, MousePointerClick, CreditCard, Tag, CalendarClock, Sparkles, Check, Search } from 'lucide-react'
import { useStore, useToast, uid } from '../ui'
import { LSelect, Toggle } from './leona'
import { MI } from './mdIcons'

/* ---------- utilidades ---------- */
const VARS = ['{nombre}', '{telefono}', '{email}', '{origen}', '{fecha}', '{precio}']
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export const waFmt = s => esc(s).replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/_([^_\n]+)_/g, '<i>$1</i>').replace(/~([^~\n]+)~/g, '<s>$1</s>').replace(/\n/g, '<br/>')
const readFile = (f, cb) => { const r = new FileReader(); r.onload = () => cb({ name: f.name, url: r.result, size: f.size, type: f.type }); r.readAsDataURL(f) }
const SYN = [[/¡Hola!/g, '¡Hola, qué tal!'], [/Te presento/g, 'Te comparto'], [/Disfruta/g, 'Aprovecha'], [/deliciosas/g, 'riquísimas'], [/fáciles/g, 'sencillas'], [/Gracias/g, 'Muchas gracias'], [/ahora/g, 'en este momento']]
const vary = (t, n) => { let x = t; SYN.forEach(([a, b], i) => { if ((i + n) % 3 !== 0) x = x.replace(a, b) }); return n % 2 ? x.replace(/\n\n/, '\n\n✨ ').trim() : x }

/* ---------- carcasa vertical ---------- */
function Shell({ color, icon, title, sub, onClose, onOk, ok = true, okLabel = 'Aplicar cambios', width = 640, children }) {
  const t0 = useRef(Date.now())
  return <div className="lm-ov" onMouseDown={e => e.target === e.currentTarget && Date.now() - t0.current > 450 && onClose()}>
    <div className="ne" style={{ maxWidth: width, '--nc': color }}>
      <div className="ne-h"><span className="ne-ic">{icon}</span><div style={{ minWidth: 0 }}><h2>{title}</h2>{sub && <p>{sub}</p>}</div><button className="x" onClick={onClose}><X size={19} /></button></div>
      <div className="ne-b">{children}</div>
      <div className="ne-f"><button className="ne-cancel" onClick={onClose}>Cancelar</button><button className="ne-ok" disabled={!ok} onClick={onOk}>{okLabel}</button></div>
    </div></div>
}
const Sec = ({ t, dot, right, children, className = '' }) => <div className={'ne-sec ' + className}>{t && <div className="ne-st"><i style={{ background: dot }} />{t}{right}</div>}{children}</div>
const Lb = ({ children, right }) => <div className="ne-lb"><span>{children}</span>{right}</div>
const Count = ({ v, max }) => <small className={'ne-cnt' + ((v || '').length > max ? ' bad' : '')}>{(v || '').length}/{max} caracteres</small>
const Sw = ({ on, set, t, d, icon }) => <div className={'ne-sw' + (on ? ' on' : '')}>{icon && <span className="ne-swi">{icon}</span>}<div style={{ flex: 1, minWidth: 0 }}><b>{t}</b>{d && <small>{d}</small>}</div><Toggle on={!!on} onChange={set} /></div>
const VarChips = ({ onPick }) => <div className="ne-vars">{VARS.map(v => <button key={v} type="button" onClick={() => onPick(v)}>{v}</button>)}</div>

function Bubble({ items, header, footer, buttons }) {
  return <div className="ne-pv"><div className="ne-pvh">Vista previa</div><div className="ne-pvb wa-bg">
    {(items.length || header || buttons?.length) ? <div className="ne-bub">
      {header?.type === 'image' && header.img && <img src={header.img} alt="" />}
      {header?.type === 'text' && header.text && <b className="hd">{header.text}</b>}
      {items.map(a => <div key={a.id} className="it">
        {a.type === 'image' && (a.file?.url ? <img src={a.file.url} alt="" /> : <div className="ph"><ImgI size={22} />Imagen</div>)}
        {a.type === 'video' && <div className="ph"><Video size={22} />{a.file?.name || 'Video'}</div>}
        {a.type === 'audio' && <div className="ph au"><Mic size={18} /><span className="wave" />{a.file?.name || 'Audio'}</div>}
        {a.type === 'file' && <div className="ph"><FileText size={20} />{a.file?.name || 'Documento'}</div>}
        {a.type === 'delay' && <div className="dl">⏳ Pausa de {a.sec || 3} s</div>}
        {a.text && a.type !== 'delay' && <div className="tx" dangerouslySetInnerHTML={{ __html: waFmt(a.text) }} />}
      </div>)}
      {footer && <small className="ft">{footer}</small>}
      <span className="tm">12:30 ✓✓</span>
    </div> : <div className="ne-pv0">Agrega contenido para ver la vista previa</div>}
    {buttons?.length > 0 && <div className="ne-bbs">{buttons.map((b, i) => <div key={i}>{b || 'Botón'}</div>)}</div>}
  </div></div>
}

/* ---------- 1. Contenido ---------- */
const ADD = [['text', 'Texto', Type, '#3b82f6'], ['delay', 'Intervalo', Timer, '#f59e0b'], ['image', 'Imagen', ImgI, '#10b981'], ['audio', 'Audio', Mic, '#8b5cf6'], ['video', 'Video', Video, '#ef4444'], ['file', 'Doc', FileText, '#f97316']]
export function ContentEditor({ node, onClose, onSave }) {
  const toast = useToast()
  const [acts, setActs] = useState(JSON.parse(JSON.stringify(node.actions || [])))
  const [cf, setCf] = useState({ ab: false, variants: {}, ...(node.cfg || {}) }); const [vi, setVi] = useState(0)
  const focus = useRef(null); const file = useRef(); const pick = useRef(null)
  const txtOf = a => vi ? (cf.variants[vi]?.[a.id] ?? a.text) : a.text
  const setTxt = (a, t) => vi ? setCf(c => ({ ...c, variants: { ...c.variants, [vi]: { ...(c.variants[vi] || {}), [a.id]: t } } })) : setActs(x => x.map(y => y.id === a.id ? { ...y, text: t } : y))
  const up = (id, p) => setActs(x => x.map(y => y.id === id ? { ...y, ...p } : y))
  const add = t => { const a = { id: uid(), type: t, text: '', ...(t === 'delay' ? { sec: 3 } : {}) }; setActs(x => [...x, a]); if (['image', 'audio', 'video', 'file'].includes(t)) { pick.current = a.id; setTimeout(() => { file.current.accept = { image: 'image/*', audio: 'audio/*', video: 'video/*', file: '*' }[t]; file.current.click() }, 30) } }
  const mv = (i, d) => setActs(x => { const y = [...x]; const j = i + d; if (j < 0 || j >= y.length) return x; [y[i], y[j]] = [y[j], y[i]]; return y })
  const texts = acts.filter(a => a.type !== 'delay').map(txtOf).filter(Boolean).join('\n\n')
  const view = acts.map(a => ({ ...a, text: txtOf(a) }))
  return <Shell color="#3b82f6" icon={<MI n="books" size={22} />} title="Editar contenido" sub="Mensajes que recibirá el contacto en este paso" onClose={onClose}
    ok={acts.length > 0} onOk={() => onSave({ ...node, actions: acts, cfg: cf, desc: '' })} width={680}>
    <input ref={file} type="file" hidden onChange={e => { const f = e.target.files[0]; if (!f) return; if (f.size > 16e6) return toast('Archivo demasiado grande (máx. 16MB)', 'err'); readFile(f, r => up(pick.current, { file: r })); e.target.value = '' }} />
    <Lb>Variables</Lb><VarChips onPick={v => { const a = acts.find(x => x.id === focus.current) || [...acts].reverse().find(x => x.type !== 'delay'); if (!a) return toast('Agrega un texto primero', 'info'); setTxt(a, (txtOf(a) || '') + v) }} />
    <div className="ne-add">{ADD.map(([t, l, I, c]) => <button key={t} style={{ '--k': c }} onClick={() => add(t)}><I size={16} />{l}</button>)}</div>
    <div className="ne-tools">
      <button disabled={!texts} onClick={() => { navigator.clipboard?.writeText(texts); toast('Textos copiados') }}><Copy size={14} />Copiar textos</button>
      <button onClick={async () => { try { const t = await navigator.clipboard.readText(); if (!t) return; setActs(x => [...x, ...t.split(/\n{2,}/).map(s => ({ id: uid(), type: 'text', text: s.trim() })).filter(a => a.text)]); toast('Textos pegados') } catch { toast('Permite el acceso al portapapeles', 'err') } }}><ClipboardPaste size={14} />Pegar textos</button>
      <button disabled={!acts.some(a => a.text)} onClick={() => { setActs(x => x.map(a => ({ ...a, text: '' }))); setCf(c => ({ ...c, variants: {} })) }}><Eraser size={14} />Vaciar textos</button></div>
    <Sec className="ne-ab">
      <div className="ne-abh"><ShieldCheck size={19} /><div style={{ flex: 1 }}><b>Anti-Baneo con variaciones</b><small>Cada cliente recibe una versión distinta de este bloque.</small></div>
        {cf.ab && <button title="Generar variaciones automáticamente" className="ne-regen" onClick={() => { const v = {}; for (let n = 1; n <= 10; n++) { v[n] = {}; acts.forEach(a => { if (a.text) v[n][a.id] = vary(a.text, n) }) } setCf(c => ({ ...c, variants: v })); toast('10 variaciones generadas') }}><RefreshCw size={15} /></button>}
        <Toggle on={cf.ab} onChange={v => { setCf(c => ({ ...c, ab: v })); if (!v) setVi(0) }} /></div>
      {cf.ab && <><div className="ne-vi">{['Original', ...Array.from({ length: 10 }, (_, i) => i + 1)].map((l, i) => <button key={i} className={(vi === i ? 'on' : '') + (i && cf.variants[i] && Object.keys(cf.variants[i]).length ? ' has' : '')} onClick={() => setVi(i)}>{l}</button>)}</div>
        <small className="ne-hint">Selecciona una variación y edita los textos. Lo que no cambies se toma del original.</small></>}
    </Sec>
    {acts.length === 0 && <div className="ne-empty"><MI n="books" size={30} color="#3b82f6" /><b>Sin contenido todavía</b><span>Usa los botones de arriba para agregar textos, imágenes, audios, videos o pausas.</span></div>}
    {acts.map((a, i) => { const [, l, I, c] = ADD.find(x => x[0] === a.type) || ADD[0]
      return <div key={a.id} className="ne-item" style={{ '--k': c }}>
        <div className="ne-ih"><I size={15} /><b>{l}</b>{vi > 0 && a.type !== 'delay' && <em>Variación {vi}</em>}<span className="r"><button disabled={!i} onClick={() => mv(i, -1)}><ChevronUp size={17} /></button><button disabled={i === acts.length - 1} onClick={() => mv(i, 1)}><ChevronDown size={17} /></button><button className="del" onClick={() => setActs(x => x.filter(y => y.id !== a.id))}><Trash2 size={16} /></button></span></div>
        {a.type === 'delay' ? <div className="ne-row"><input className="ne-in" type="number" min="1" max="300" value={a.sec} onChange={e => up(a.id, { sec: Math.max(1, Math.min(300, +e.target.value || 1)) })} style={{ width: 110 }} /><span className="ne-u">segundos escribiendo…</span></div>
          : <>{a.type !== 'text' && <div className="ne-media">{a.file ? (a.type === 'image' ? <img src={a.file.url} alt="" /> : <div className="fn"><I size={18} />{a.file.name}</div>) : <div className="fn mu"><I size={18} />Sin archivo</div>}
              <button onClick={() => { pick.current = a.id; file.current.accept = { image: 'image/*', audio: 'audio/*', video: 'video/*', file: '*' }[a.type]; file.current.click() }}><Upload size={14} />{a.file ? 'Cambiar' : 'Subir'}</button></div>}
            <textarea className="ne-in ne-ta" rows={a.type === 'text' ? 5 : 3} value={txtOf(a) || ''} onFocus={() => focus.current = a.id} onChange={e => setTxt(a, e.target.value)} placeholder={a.type === 'text' ? 'Escribe el mensaje… usa *negrita*, _cursiva_ y ~tachado~' : 'Descripción (opcional)'} /></>}
      </div> })}
    <Bubble items={view} />
  </Shell>
}

/* ---------- 2. Mensajes API (botones) ---------- */
export function ButtonsEditor({ node, onClose, onSave }) {
  const c0 = node.cfg || {}; const toast = useToast(); const f = useRef()
  const [c, setC] = useState({ ab: false, header: { type: 'none', text: '', img: '' }, text: '', footer: '', btns: c0.btns || (c0.buttons ? c0.buttons.split(',').map(x => x.trim()).filter(Boolean) : ['']), ...c0 })
  const set = p => setC(x => ({ ...x, ...p })); const btns = c.btns
  const ok = c.text.trim() && c.text.length <= 1024 && (c.footer || '').length <= 60 && btns.some(b => b.trim()) && btns.every(b => b.length <= 20)
  return <Shell color="#0f8f6e" icon={<MI n="touch" size={22} />} title="Editar mensaje con botones" sub="Mensaje interactivo con botones de respuesta rápida" onClose={onClose} ok={ok}
    onOk={() => { const b = btns.map(x => x.trim()).filter(Boolean); onSave({ ...node, cfg: { ...c, btns: b, buttons: b.join(', ') }, desc: c.text }) }}>
    <span className="ne-pill"><MI n="touch" size={17} color="#a78bfa" />Botones de respuesta</span>
    <Sw on={c.ab} set={v => set({ ab: v })} icon={<ShieldCheck size={17} />} t="Anti-Baneo con variaciones" d="La IA reescribe los textos de este bloque para no enviar siempre lo mismo." />
    <Lb>Tipo de header</Lb>
    <LSelect className="l-in ct-in ne-in" value={c.header.type} onChange={v => set({ header: { ...c.header, type: v } })} options={[['none', 'Sin header'], ['text', 'Texto'], ['image', 'Imagen']].map(([value, label]) => ({ value, label }))} />
    {c.header.type === 'text' && <><input className="ne-in" style={{ marginTop: 10 }} maxLength={60} value={c.header.text} onChange={e => set({ header: { ...c.header, text: e.target.value } })} placeholder="Título del mensaje" /><Count v={c.header.text} max={60} /></>}
    {c.header.type === 'image' && <><input ref={f} type="file" accept="image/png,image/jpeg" hidden onChange={e => { const x = e.target.files[0]; if (!x) return; if (x.size > 5e6) return toast('Máximo 5MB', 'err'); readFile(x, r => set({ header: { ...c.header, img: r.url } })); e.target.value = '' }} />
      <button className="ne-drop" onClick={() => f.current.click()}>{c.header.img ? <img src={c.header.img} alt="" /> : <Upload size={26} />}<div><b>{c.header.img ? 'Cambiar imagen del header' : 'Subir imagen para header'}</b><small>JPG, PNG (máx. 5MB)</small></div></button></>}
    <Lb right={<small className="ne-cnt">{c.text.length}/1024</small>}>Body (mensaje principal) *</Lb>
    <textarea className="ne-in ne-ta" rows={5} value={c.text} onChange={e => set({ text: e.target.value })} placeholder="🎉 *¡Estás aprovechando la promoción vigente!*" />
    <VarChips onPick={v => set({ text: c.text + v })} />
    <Lb right={<small className="ne-cnt">{(c.footer || '').length}/60</small>}>Footer (opcional)</Lb>
    <input className="ne-in" maxLength={60} value={c.footer} onChange={e => set({ footer: e.target.value })} placeholder="Ej.: Responde con un botón" />
    <div className="ne-div" />
    <Lb>Botones de respuesta (máx. 3)</Lb>
    {btns.map((b, i) => <div key={i} className="ne-row"><span className="ne-n">{i + 1}</span><input className="ne-in" maxLength={20} value={b} onChange={e => set({ btns: btns.map((x, j) => j === i ? e.target.value : x) })} placeholder={'Botón ' + (i + 1)} /><small className="ne-cnt in">{b.length}/20</small>
      <button className="ne-del" disabled={btns.length === 1} onClick={() => set({ btns: btns.filter((_, j) => j !== i) })}><Trash2 size={17} /></button></div>)}
    {btns.length < 3 && <button className="ne-link" onClick={() => set({ btns: [...btns, ''] })}><Plus size={16} />Agregar botón</button>}
    <Bubble items={[{ id: 'b', type: 'text', text: c.text }]} header={c.header} footer={c.footer} buttons={btns.filter(x => x.trim())} />
  </Shell>
}

/* ---------- 3. Agente IA ---------- */
const RT = [['text', 'Texto', Type], ['pay', 'Pago', CreditCard], ['image', 'Imagen', ImgI]]
const CURS = ['auto', 'PEN', 'USD', 'MXN', 'COP', 'CLP', 'ARS', 'BRL', 'EUR']
export function AgentEditor({ node, onClose, onSave }) {
  const c0 = node.cfg || {}; const toast = useToast(); const f = useRef()
  const [c, setC] = useState({ own: true, prompt: '', routes: c0.routes || (c0.paths ? c0.paths.split(',').map(x => x.trim()).filter(Boolean).map(v => ({ id: uid(), t: /pago|\$/i.test(v) ? 'pay' : 'text', v, amount: (v.match(/\d+(\.\d+)?/) || [''])[0] })) : []), fallback: true, flows: false, audio: false, ...c0 })
  const [media, setMedia] = useStore('ai_media', [])
  const set = p => setC(x => ({ ...x, ...p })); const upR = (id, p) => set({ routes: c.routes.map(r => r.id === id ? { ...r, ...p } : r) })
  const lbl = r => r.t === 'pay' ? `Pago ${r.cur && r.cur !== 'auto' ? r.cur + ' ' : '$'}${r.amount || ''}`.trim() : r.t === 'image' ? 'Imagen' : r.v
  return <Shell color="#10b981" icon={<MI n="spark" size={22} />} title="Editar Agente IA" sub="La IA responde y decide por qué camino seguir" onClose={onClose} okLabel="Guardar"
    onOk={() => { const paths = c.routes.map(lbl).filter(Boolean); onSave({ ...node, cfg: { ...c, act: 'give', paths: paths.join(', ') }, desc: 'IA responde consultas o avanza por un camino' }) }}>
    <Sec t="Prompt independiente de este agente" dot="#a855f7">
      <Sw on={c.own} set={v => set({ own: v })} t="Usar un prompt independiente" d="Estas instrucciones solo se aplican a este agente." />
      {c.own && <><textarea className="ne-in ne-ta" rows={8} maxLength={10000} value={c.prompt} onChange={e => set({ prompt: e.target.value })} placeholder={'Actúa como un experto en ventas.\nResponde con claridad, naturalidad y de forma breve.\nUsa emojis y *negritas* en frases clave.\nSiempre pide la foto o captura del pago.'} />
        <small className="ne-cnt">{c.prompt.length.toLocaleString('es-PE')} / 10,000 caracteres</small></>}
    </Sec>
    <Sec t="Caminos de ruteo" dot="#3b82f6" right={<button className="ne-add2" onClick={() => set({ routes: [...c.routes, { id: uid(), t: 'text', v: '' }] })}><Plus size={14} />Agregar camino</button>}>
      <p className="ne-p">La IA decidirá por cuál opción continuar el flujo. Cada camino crea una salida en el nodo.</p>
      {!c.routes.length && <div className="ne-empty sm">Sin caminos: el agente atiende la conversación sin desviar el flujo.</div>}
      {c.routes.map((r, i) => <div key={r.id} className="ne-route">
        <div className="ne-row"><span className="ne-n">{i + 1}</span>
          <LSelect className="l-in ct-in ne-in" style={{ width: 150, flexShrink: 0 }} value={r.t} onChange={v => upR(r.id, { t: v })} options={RT.map(([value, label]) => ({ value, label }))} />
          {r.t === 'text' && <input className="ne-in" value={r.v || ''} onChange={e => upR(r.id, { v: e.target.value })} placeholder="Ej.: yape" />}
          {r.t === 'image' && <input className="ne-in" value={r.v || ''} onChange={e => upR(r.id, { v: e.target.value })} placeholder="Instrucción para validar la imagen" />}
          {r.t === 'pay' && <input className="ne-in" inputMode="decimal" style={{ width: 110 }} value={r.amount || ''} onChange={e => upR(r.id, { amount: e.target.value.replace(/[^\d.]/g, '') })} placeholder="Monto" />}
          <button className="ne-del" onClick={() => set({ routes: c.routes.filter(x => x.id !== r.id) })}><Trash2 size={16} /></button></div>
        {r.t === 'pay' && <div className="ne-pay">
          <div className="ne-row"><LSelect className="l-in ct-in ne-in" style={{ width: 200, flexShrink: 0 }} value={r.cur || 'auto'} onChange={v => upR(r.id, { cur: v })} options={CURS.map(x => ({ value: x, label: x === 'auto' ? 'Moneda automática' : x }))} />
            <input className="ne-in" value={r.holder || ''} onChange={e => upR(r.id, { holder: e.target.value })} placeholder="Titular del comprobante" /></div>
          <Lb>Validación opcional</Lb>
          <div className="ne-row wrap"><input className="ne-in" style={{ width: 170 }} value={r.ident || ''} onChange={e => upR(r.id, { ident: e.target.value })} placeholder="Identificador" />
            {[['conf', 'Confirmado'], ['date', 'Fecha'], ['reuse', 'Reuso']].map(([k, l]) => <label key={k} className={'ne-mini' + (r[k] ? ' on' : '')}><Toggle on={!!r[k]} onChange={v => upR(r.id, { [k]: v })} />{l}</label>)}</div>
        </div>}
      </div>)}
    </Sec>
    <Sec t="Comportamiento" dot="#22c55e">
      <Sw on={c.fallback} set={v => set({ fallback: v })} t="Responder si no coincide" d="La IA responde cuando ninguna opción aplica." />
      <Sw on={c.flows} set={v => set({ flows: v })} t="Activar otros flujos" d="Verifica activadores antes de responder." />
      <Sw on={c.audio} set={v => set({ audio: v })} t="Responder con audio cuando el cliente envía audio" d="Solo se activa si el mensaje del cliente es de voz." />
    </Sec>
    <Sec t="Biblioteca de media" dot="#f59e0b" right={<span className="ne-badge">Todos los nodos IA</span>}>
      <p className="ne-p">Archivos que la IA puede enviar al cliente cuando sea relevante.</p>
      <input ref={f} type="file" hidden onChange={e => { const x = e.target.files[0]; if (!x) return; if (x.size > 4e6) return toast('Máximo 4MB por archivo en esta vista', 'err'); readFile(x, r => setMedia(m => [...(Array.isArray(m) ? m : []), { id: uid(), name: r.name, url: r.type.startsWith('image') ? r.url : '', type: r.type }])); e.target.value = '' }} />
      <button className="ne-btn2" onClick={() => f.current.click()}><Upload size={15} />Subir archivo</button>
      {(Array.isArray(media) ? media : []).length ? <div className="ne-media-l">{media.map(m => <div key={m.id}>{m.url ? <img src={m.url} alt="" /> : <FileText size={20} />}<span>{m.name}</span><button onClick={() => setMedia(x => x.filter(y => y.id !== m.id))}><Trash2 size={14} /></button></div>)}</div>
        : <div className="ne-empty sm">Sin archivos. Sube archivos para que la IA pueda enviarlos.</div>}
    </Sec>
  </Shell>
}

/* ---------- 4. Seguimiento ---------- */
const SADD = [['text', 'Texto', Type], ['image', 'Imagen', ImgI], ['audio', 'Audio', Mic], ['video', 'Video', Video], ['delay', 'Pausa', Pause], ['file', 'Archivo', FileText], ['btn', 'Botones', MousePointerClick]]
export function FollowEditor({ node, onClose, onSave }) {
  const c0 = node.cfg || {}; const toast = useToast(); const f = useRef(); const pick = useRef()
  const [tags] = useStore('tags', [])
  const [seq, setSeq] = useState(c0.seq || (c0.times ? c0.times.split(',').map(t => ({ id: uid(), min: parseInt(t) || 30, price: '', tag: '', items: c0.msg ? [{ id: uid(), type: 'text', text: c0.msg }] : [] })) : [{ id: uid(), min: 30, price: '', tag: '', items: [] }]))
  const [opt, setOpt] = useState({ hours: false, from: '08:00', to: '21:00', ab: false, resume: false, ...(c0.opt || {}) })
  const [cur, setCur] = useState(seq[0]?.id)
  const s = seq.find(x => x.id === cur) || seq[0]; const si = seq.indexOf(s)
  const upS = p => setSeq(x => x.map(y => y.id === s.id ? { ...y, ...p } : y))
  const upI = (id, p) => upS({ items: s.items.map(it => it.id === id ? { ...it, ...p } : it) })
  const addI = t => { const it = { id: uid(), type: t, text: '', ...(t === 'delay' ? { sec: 5 } : t === 'btn' ? { btns: ['', ''] } : {}) }; upS({ items: [...s.items, it] }); if (['image', 'audio', 'video', 'file'].includes(t)) { pick.current = it.id; setTimeout(() => { f.current.accept = { image: 'image/*', audio: 'audio/*', video: 'video/*', file: '*' }[t]; f.current.click() }, 30) } }
  const mvS = (i, d) => setSeq(x => { const y = [...x]; const j = i + d; if (j < 0 || j >= y.length) return x; [y[i], y[j]] = [y[j], y[i]]; return y })
  const mvI = (i, d) => { const y = [...s.items]; const j = i + d; if (j < 0 || j >= y.length) return; [y[i], y[j]] = [y[j], y[i]]; upS({ items: y }) }
  const ok = seq.length && seq.every(x => x.min > 0 && x.items.length)
  return <Shell color="#f97316" icon={<MI n="clock" size={22} />} title="Editar seguimiento" sub="Organiza cuándo y qué recibirá el contacto si no responde." onClose={onClose} ok={ok} width={700}
    onOk={() => onSave({ ...node, cfg: { seq, opt, times: seq.map(x => x.min).join(', ') }, desc: seq.map(x => x.min).join(', ') })}>
    <input ref={f} type="file" hidden onChange={e => { const x = e.target.files[0]; if (!x) return; if (x.size > 16e6) return toast('Archivo demasiado grande', 'err'); readFile(x, r => upI(pick.current, { file: r })); e.target.value = '' }} />
    <Sec t="Secuencia" dot="#f97316" right={<button className="ne-add2" onClick={() => { const n = { id: uid(), min: 60, price: '', tag: '', items: [] }; setSeq(x => [...x, n]); setCur(n.id) }}><Plus size={14} />Agregar seguimiento</button>}>
      <p className="ne-p">El orden define qué mensaje sale primero. Cada tiempo se cuenta desde el seguimiento anterior.</p>
      <div className="ne-seq">{seq.map((x, i) => <div key={x.id} className={'ne-sq' + (x.id === s.id ? ' on' : '')} onClick={() => setCur(x.id)}>
        <span className="n">{i + 1}</span><div style={{ flex: 1, minWidth: 0 }}><b>Seguimiento {i + 1}</b><small><Timer size={12} />{x.min} min · {x.items.length} elem.{x.price ? ' · 🏷 ' + x.price : ''}</small></div>
        <span className="r" onClick={e => e.stopPropagation()}><button disabled={!i} onClick={() => mvS(i, -1)}><ChevronUp size={15} /></button><button disabled={i === seq.length - 1} onClick={() => mvS(i, 1)}><ChevronDown size={15} /></button><button className="del" disabled={seq.length === 1} onClick={() => { setSeq(y => y.filter(z => z.id !== x.id)); if (x.id === s.id) setCur(seq[i ? i - 1 : 1]?.id) }}><Trash2 size={14} /></button></span></div>)}</div>
    </Sec>
    {s && <Sec t={'Mensaje programado · Seguimiento ' + (si + 1)} dot="#3b82f6">
      <div className="ne-row">
        <div style={{ flex: 1 }}><Lb>Enviar después de</Lb><div className="ne-inw"><Timer size={16} /><input type="number" min="1" value={s.min} onChange={e => upS({ min: Math.max(1, +e.target.value || 1) })} /><span>min</span></div><small className="ne-cnt">Minutos desde el seguimiento anterior</small></div>
        <div style={{ flex: 1 }}><Lb>Precio para este momento</Lb><div className="ne-inw"><Tag size={16} /><input value={s.price} onChange={e => upS({ price: e.target.value })} placeholder="Opcional" /></div><small className="ne-cnt">Disponible como {'{precio}'}</small></div>
      </div>
      <Lb>Etiqueta al completar</Lb>
      <LSelect className="l-in ct-in ne-in" value={s.tag} onChange={v => upS({ tag: v })} placeholder="Selecciona una etiqueta" options={[{ value: '', label: 'Sin etiqueta' }, ...(Array.isArray(tags) ? tags : []).map(t => ({ value: t.name, label: t.name, dot: t.color }))]} />
      <small className="ne-cnt">Se agrega al terminar de enviar este seguimiento y reemplaza la del anterior.</small>
      <Lb>Contenido</Lb>
      <div className="ne-add sm">{SADD.map(([t, l, I]) => <button key={t} onClick={() => addI(t)}><I size={15} />{l}</button>)}</div>
      {!s.items.length && <div className="ne-empty sm">Agrega al menos un elemento para este seguimiento.</div>}
      {s.items.map((it, i) => { const [, l, I] = SADD.find(x => x[0] === it.type) || SADD[0]
        return <div key={it.id} className="ne-item" style={{ '--k': '#f97316' }}>
          <div className="ne-ih"><span className="ne-n sm">{i + 1}</span><I size={15} /><b>{l}</b><span className="r"><button disabled={!i} onClick={() => mvI(i, -1)}><ChevronUp size={16} /></button><button disabled={i === s.items.length - 1} onClick={() => mvI(i, 1)}><ChevronDown size={16} /></button><button className="del" onClick={() => upS({ items: s.items.filter(y => y.id !== it.id) })}><Trash2 size={15} /></button></span></div>
          {it.type === 'delay' ? <div className="ne-row"><input className="ne-in" type="number" min="1" value={it.sec} onChange={e => upI(it.id, { sec: Math.max(1, +e.target.value || 1) })} style={{ width: 110 }} /><span className="ne-u">segundos</span></div>
            : <>{['image', 'audio', 'video', 'file'].includes(it.type) && <div className="ne-media">{it.file ? (it.type === 'image' ? <img src={it.file.url} alt="" /> : <div className="fn"><I size={18} />{it.file.name}</div>) : <div className="fn mu"><I size={18} />Sin archivo</div>}<button onClick={() => { pick.current = it.id; f.current.click() }}><Upload size={14} />{it.file ? 'Cambiar' : 'Subir'}</button></div>}
              <textarea className="ne-in ne-ta" rows={3} value={it.text} onChange={e => upI(it.id, { text: e.target.value })} placeholder={it.type === 'text' || it.type === 'btn' ? '¿Sigues interesado? 😊 La promo de {precio} termina hoy.' : 'Descripción (opcional)'} />
              {it.type === 'btn' && <div className="ne-row wrap" style={{ marginTop: 8 }}>{it.btns.map((b, j) => <input key={j} className="ne-in" style={{ flex: 1, minWidth: 120 }} maxLength={20} value={b} onChange={e => upI(it.id, { btns: it.btns.map((x, k) => k === j ? e.target.value : x) })} placeholder={'Botón ' + (j + 1)} />)}{it.btns.length < 3 && <button className="ne-link" onClick={() => upI(it.id, { btns: [...it.btns, ''] })}><Plus size={14} />Botón</button>}</div>}</>}
        </div> })}
      <Lb>Variables</Lb><VarChips onPick={v => { const last = [...s.items].reverse().find(x => x.type !== 'delay'); if (!last) return toast('Agrega un texto primero', 'info'); upI(last.id, { text: (last.text || '') + v }) }} />
    </Sec>}
    <Sec t="Configuración del nodo" dot="#64748b">
      <p className="ne-p">Estas opciones se aplican a todos los seguimientos.</p>
      <Sw on={opt.hours} set={v => setOpt({ ...opt, hours: v })} icon={<CalendarClock size={17} />} t="Horario de envío" d="Controla en qué horas pueden salir los seguimientos." />
      {opt.hours && <div className="ne-row" style={{ margin: '-2px 0 10px 4px' }}><span className="ne-u">Desde</span><input className="ne-in" type="time" style={{ width: 130 }} value={opt.from} onChange={e => setOpt({ ...opt, from: e.target.value })} /><span className="ne-u">hasta</span><input className="ne-in" type="time" style={{ width: 130 }} value={opt.to} onChange={e => setOpt({ ...opt, to: e.target.value })} /></div>}
      <Sw on={opt.ab} set={v => setOpt({ ...opt, ab: v })} icon={<ShieldCheck size={17} />} t="Anti-Baneo con variaciones" d="La IA reescribe los textos para no enviar siempre lo mismo." />
      <Sw on={opt.resume} set={v => setOpt({ ...opt, resume: v })} icon={<RefreshCw size={16} />} t="Continuar donde quedó" d="Si el cliente responde y vuelve a callar, retoma desde el siguiente seguimiento." />
    </Sec>
  </Shell>
}

/* ---------- 5. Activar flujo ---------- */
export function ActivateEditor({ node, flowId, onClose, onSave }) {
  const [flows] = useStore('flows', []); const [v, setV] = useState((node.cfg || {}).flow || ''); const [q, setQ] = useState('')
  const list = (Array.isArray(flows) ? flows : []).filter(f => f.id !== flowId && f.name.toLowerCase().includes(q.toLowerCase()))
  return <Shell color="#7c3aed" icon={<MI n="split" size={22} />} title="Editar Activar Flujo" sub="Cambia al contacto a otro flujo" width={540} onClose={onClose} ok={!!v} okLabel="Guardar"
    onOk={() => onSave({ ...node, cfg: { ...(node.cfg || {}), flow: v }, desc: '→ ' + (flows.find(f => f.id === v)?.name || '') })}>
    <p className="ne-p">Cuando el contacto llegue a este nodo se activará el flujo seleccionado. El flujo actual se cierra y el nuevo comienza desde su inicio.</p>
    <div className="ne-inw" style={{ marginTop: 6 }}><Search size={16} /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar flujo…" /></div>
    <div className="ne-fl">{list.length ? list.map(f => <button key={f.id} className={v === f.id ? 'on' : ''} onClick={() => setV(f.id)}><MI n="split" size={18} /><span>{f.name}</span><i className={f.status} />{v === f.id && <Check size={17} />}</button>)
      : <div className="ne-empty sm">{q ? 'Ningún flujo coincide' : 'No tienes otros flujos todavía'}</div>}</div>
  </Shell>
}

/* ---------- 6. Código de país ---------- */
const PAISES = { 51: 'Perú', 52: 'México', 54: 'Argentina', 55: 'Brasil', 56: 'Chile', 57: 'Colombia', 58: 'Venezuela', 591: 'Bolivia', 593: 'Ecuador', 595: 'Paraguay', 598: 'Uruguay', 1: 'Estados Unidos', 34: 'España', 502: 'Guatemala', 503: 'El Salvador', 504: 'Honduras', 505: 'Nicaragua', 506: 'Costa Rica', 507: 'Panamá' }
export function CountryEditor({ node, onClose, onSave }) {
  const c0 = node.cfg || {}
  const [rows, setRows] = useState(c0.list || ((c0.codes || '').split(',').map(x => x.trim().match(/^\+?(\d{1,4})\s*(.*)$/)).filter(Boolean).map(m => ({ id: uid(), cd: m[1], nm: m[2] }))).concat(c0.codes ? [] : [{ id: uid(), cd: '51', nm: 'Perú' }]))
  const up = (id, p) => setRows(x => x.map(r => r.id === id ? { ...r, ...p } : r))
  const valid = rows.filter(r => r.cd)
  const dup = new Set(valid.map(r => r.cd)).size !== valid.length
  return <Shell color="#0891b2" icon={<MI n="globe" size={22} />} title="Editar clasificación por país" sub="Divide el flujo según el país del número" width={560} onClose={onClose} okLabel="Guardar" ok={valid.length > 0 && !dup}
    onOk={() => onSave({ ...node, cfg: { list: valid, codes: valid.map(r => `+${r.cd} ${r.nm || PAISES[r.cd] || ''}`.trim()).join(', ') }, desc: '' })}>
    <p className="ne-p">El contacto continuará por la salida que coincida con el inicio de su número. Si no hay coincidencia, seguirá por "Otros países".</p>
    <div className="ne-row lbls"><span style={{ width: 110 }}>Código</span><span style={{ flex: 1 }}>Nombre de la ruta</span></div>
    {rows.map(r => <div key={r.id} className="ne-row" style={{ marginBottom: 9 }}>
      <div className="ne-inw" style={{ width: 110, flexShrink: 0 }}><b>+</b><input inputMode="numeric" maxLength={4} value={r.cd} onChange={e => { const cd = e.target.value.replace(/\D/g, ''); up(r.id, { cd, nm: r.nm && r.nm !== PAISES[r.cd] ? r.nm : PAISES[cd] || '' }) }} placeholder="51" /></div>
      <input className="ne-in" value={r.nm} onChange={e => up(r.id, { nm: e.target.value })} placeholder="Nombre del país o ruta" />
      <button className="ne-del" onClick={() => setRows(x => x.filter(y => y.id !== r.id))}><Trash2 size={17} /></button></div>)}
    {dup && <small className="ne-cnt bad">Hay códigos repetidos.</small>}
    <button className="ne-link" onClick={() => setRows(x => [...x, { id: uid(), cd: '', nm: '' }])}><Plus size={16} />Agregar país</button>
    <div className="ne-other"><MI n="globe" size={16} />Otros países <small>· salida automática</small></div>
  </Shell>
}

/* ---------- 7. Espera ---------- */
const UN = [['seconds', 'Segundos', 1], ['minutes', 'Minutos', 60], ['hours', 'Horas', 3600], ['days', 'Días', 86400]]
export function WaitEditor({ node, onClose, onSave, isNew }) {
  const [t, setT] = useState((node.cfg || {}).time || [1, 'minutes'])
  const total = t[0] * UN.find(u => u[0] === t[1])[2]; const ok = t[0] > 0 && total <= 31 * 86400
  return <Shell color="#06b6d4" icon={<MI n="hourglass" size={22} />} title={isNew ? 'Nueva espera' : 'Editar espera'} sub="Pausa el flujo y luego continúa solo" width={500} onClose={onClose} ok={ok} okLabel={isNew ? 'Agregar' : 'Guardar'}
    onOk={() => onSave({ ...node, cfg: { ...(node.cfg || {}), kind: 'interval', time: t }, desc: '' })}>
    <p className="ne-p">El flujo se pausará durante el tiempo indicado y luego continuará automáticamente al siguiente nodo.</p>
    <Lb>Tiempo de espera</Lb>
    <div className="ne-row"><div className="ne-inw" style={{ flex: 1 }}><MI n="hourglass" size={18} color="#22d3ee" /><input type="number" min="1" autoFocus value={t[0]} onChange={e => setT([Math.max(0, +e.target.value || 0), t[1]])} /></div>
      <LSelect className="l-in ct-in ne-in" style={{ width: 150 }} value={t[1]} onChange={v => setT([t[0], v])} options={UN.map(([value, label]) => ({ value, label }))} /></div>
    <div className="ne-qk">{[[30, 'seconds', '30 s'], [1, 'minutes', '1 min'], [5, 'minutes', '5 min'], [1, 'hours', '1 h'], [1, 'days', '1 día']].map(([v, u, l]) => <button key={l} className={t[0] === v && t[1] === u ? 'on' : ''} onClick={() => setT([v, u])}>{l}</button>)}</div>
    {!ok && t[0] > 0 && <small className="ne-cnt bad">Máximo 31 días.</small>}
  </Shell>
}

/* ---------- 8. Etiquetas ---------- */
function MultiTag({ tags, value, onChange, ph, color }) {
  const [o, setO] = useState(false)
  return <div className="ne-mt"><button className="ne-in ne-mtb" onClick={() => setO(!o)}>{value.length ? value.map(v => <span key={v} style={{ '--t': color }}>{v}<i onClick={e => { e.stopPropagation(); onChange(value.filter(x => x !== v)) }}><X size={11} /></i></span>) : <em>{ph}</em>}<ChevronDown size={16} className="cv" /></button>
    {o && <div className="ne-mtl" onMouseLeave={() => setO(false)}>{tags.length ? tags.map(t => { const on = value.includes(t.name); return <button key={t.id} className={on ? 'on' : ''} onClick={() => onChange(on ? value.filter(x => x !== t.name) : [...value, t.name])}><i style={{ background: t.color || '#64748b' }} />{t.name}{on && <Check size={15} />}</button> }) : <div className="ne-empty sm">Aún no hay etiquetas. Crea una arriba.</div>}</div>}</div>
}
export function TagsEditor({ node, onClose, onSave, isNew }) {
  const toast = useToast(); const [tags, setTags] = useStore('tags', [])
  const [c, setC] = useState({ add: [], remove: [], ...(node.cfg || {}) }); const [nw, setNw] = useState(null)
  const T = Array.isArray(tags) ? tags : []
  const COL = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899']
  return <Shell color="#6366f1" icon={<Tag size={20} />} title="Configurar etiquetas" sub="Agrega o quita etiquetas del ticket" width={560} onClose={onClose} okLabel={isNew ? 'Agregar nodo' : 'Guardar'} ok={c.add.length + c.remove.length > 0}
    onOk={() => onSave({ ...node, cfg: c, desc: [...c.add.map(x => '+' + x), ...c.remove.map(x => '−' + x)].join(' ') })}>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{nw == null ? <button className="ne-add2" onClick={() => setNw({ name: '', color: COL[T.length % COL.length] })}><Plus size={14} />Crear etiqueta</button>
      : <div className="ne-row" style={{ width: '100%' }}><input className="ne-in" autoFocus value={nw.name} onChange={e => setNw({ ...nw, name: e.target.value })} placeholder="Nombre de la etiqueta" onKeyDown={e => e.key === 'Enter' && document.getElementById('ne-tag-ok')?.click()} />
        <div className="ne-cols">{COL.map(k => <button key={k} className={nw.color === k ? 'on' : ''} style={{ background: k }} onClick={() => setNw({ ...nw, color: k })} />)}</div>
        <button id="ne-tag-ok" className="ne-ok sm" disabled={!nw.name.trim() || T.some(t => t.name.toLowerCase() === nw.name.trim().toLowerCase())} onClick={() => { const t = { id: uid(), name: nw.name.trim(), color: nw.color }; setTags(x => [...(Array.isArray(x) ? x : []), t]); setC(x => ({ ...x, add: [...x.add, t.name] })); setNw(null); toast('Etiqueta creada') }}>Crear</button>
        <button className="ne-del" onClick={() => setNw(null)}><X size={16} /></button></div>}</div>
    <Lb>Etiquetas que se agregarán</Lb>
    <MultiTag tags={T.filter(t => !c.remove.includes(t.name))} value={c.add} onChange={v => setC({ ...c, add: v })} ph="Selecciona una o varias" color="#22c55e" />
    <small className="ne-cnt">Se asignarán al ticket cuando el flujo llegue a este nodo.</small>
    <Lb>Etiquetas que se quitarán</Lb>
    <MultiTag tags={T.filter(t => !c.add.includes(t.name))} value={c.remove} onChange={v => setC({ ...c, remove: v })} ph="Selecciona una o varias" color="#ef4444" />
    <small className="ne-cnt">Se quitarán si están presentes en el ticket.</small>
  </Shell>
}

export const CUSTOM_ED = { mensaje: ContentEditor, botones: ButtonsEditor, agente: AgentEditor, seguimiento: FollowEditor, conexion: ActivateEditor, pais: CountryEditor, intervalo: WaitEditor, etiquetas: TagsEditor }
