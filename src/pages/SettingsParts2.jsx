import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, RefreshCw, AtSign, Pencil, Trash2, Type, Hash, Tag, Package, ArrowLeft, House, ChevronRight, Radar, Link2, Copy, FileText, Sparkles, CreditCard, ChartLine, Bot, Mic, Gem, Receipt, Globe, Zap, CircleHelp as CircleHelpI, BookOpen, ShieldAlert } from 'lucide-react'
import { useStore, useToast, uid } from '../ui'
import { LModal, LSelect, Toggle } from './leona'

const Card = ({ children, style }) => <div className="st-card" style={{ marginTop: 0, padding: '23px 23px 26px', overflow: 'visible', ...style }}>{children}</div>
const Srch = ({ v, set, ph, label = 'Buscar' }) => <div>{label && <label className="tm-lb">{label}</label>}<div className="lp-srch"><Search size={15} /><input value={v} onChange={e => set(e.target.value)} placeholder={ph} style={{ fontWeight: 500 }} /></div></div>
const EmptyIn = ({ ic: Ic, t, d, btn, onClick }) => <div className="sa-empty" style={{ height: 258, marginTop: 17 }}><Ic size={44} strokeWidth={1.9} className="big" /><h3 style={{ fontSize: 16.3 }}>{t}</h3><p>{d}</p>{btn && <button className="lp-btn p" style={{ marginTop: 18 }} onClick={onClick}><Plus size={16} />{btn}</button>}</div>
const Foot = ({ onCancel, onOk, ok, label, disabled }) => <div style={{ borderTop: '1px solid var(--border2)', marginTop: 20, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 11 }}><button className="lb2 g" onClick={onCancel}>Cancelar</button><button className="lb2 p" style={{ background: '#005ae3' }} disabled={disabled} onClick={onOk}>{label}</button></div>
const Lb = ({ children, req, mt = 0 }) => <label className="tm-lb" style={{ marginTop: mt }}>{children}{req && <span style={{ color: '#ef4444' }}> *</span>}</label>
const IN = { background: 'var(--in2)', height: 37 }
const Badge = ({ c = '#4d94ff', children }) => <span className="tm-badge" style={{ color: c, background: c + '22', borderColor: c + '55', fontSize: 13.3, height: 24, borderRadius: 12, fontWeight: 500 }}>{children}</span>
function Tbl({ cols, rows, grid }) {
  return <div style={{ border: '1px solid var(--border)', borderRadius: 5, marginTop: 17, overflow: 'hidden' }}>
    <div style={{ display: 'grid', gridTemplateColumns: grid, alignItems: 'center', height: 33, background: 'var(--deep)', padding: '0 17px', fontSize: 11.5, fontWeight: 600, letterSpacing: '.05em', color: '#94a3b8' }}>{cols.map((c, i) => <span key={i} style={i === cols.length - 1 ? { textAlign: 'right' } : null}>{c}</span>)}</div>
    {rows.map((r, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: grid, alignItems: 'center', minHeight: 49, padding: '0 17px', borderTop: '1px solid var(--border)', fontSize: 13.3 }}>{r.map((c, j) => <span key={j} style={j === r.length - 1 ? { display: 'flex', justifyContent: 'flex-end', gap: 4 } : { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c}</span>)}</div>)}
  </div>
}
const Act = ({ onEdit, onDel }) => <>{onEdit && <button className="ch-ib" style={{ width: 28, height: 28 }} onClick={onEdit}><Pencil size={14} /></button>}{onDel && <button className="ch-ib" style={{ width: 28, height: 28 }} onClick={onDel}><Trash2 size={14} color="#ef4444" /></button>}</>
const CircleHelpIc = () => <CircleHelpI size={15} />
const BookIc = () => <BookOpen size={17} color="#4d94ff" />
const ShieldIc = () => <ShieldAlert size={17} color="#4d94ff" />
const mono = { fontFamily: 'ui-monospace,Menlo,Consolas,monospace', fontWeight: 700, fontSize: 12.5 }

/* ---------------- Templates de WhatsApp ---------------- */
export function Templates() {
  const toast = useToast(); const [conns] = useStore('connections', []); const [tpl, setTpl] = useStore('wa_templates', [])
  const api = conns.filter(c => c.type === 'api'); const [waba, setWaba] = useState(api[0]?.id || ''); const [st, setSt] = useState('all'); const [m, setM] = useState(null)
  const rows = tpl.filter(t => t.waba === waba && (st === 'all' || t.status === st))
  const SC = { APROBADO: '#22c55e', PENDIENTE: '#f59e0b', RECHAZADO: '#ef4444' }
  return <Card style={{ padding: '22px 22px 23px' }}>
    <div style={{ display: 'flex', gap: 8 }}>
      <button className="lp-btn" disabled={!api.length} onClick={() => toast('Templates sincronizados con Meta')}><RefreshCw size={15} />Sincronizar</button>
      <button className="lp-btn p" disabled={!api.length} style={!api.length ? { background: '#1e3a8a', color: '#a99bc4' } : null} onClick={() => setM({ name: '', cat: 'MARKETING', lang: 'es', body: '' })}><Plus size={16} />Crear</button></div>
    <div style={{ display: 'flex', gap: 14, marginTop: 17 }}>
      <div style={{ width: 209 }}><Lb>WABA</Lb><LSelect className="l-in ct-in" disabled={!api.length} value={waba} onChange={setWaba} placeholder="Sin conexión Meta Cloud" options={api.map(c => ({ value: c.id, label: c.name }))} /></div>
      <div style={{ width: 209 }}><Lb>Estado</Lb><LSelect className="l-in ct-in" disabled={!api.length} value={st} onChange={setSt} options={[['all', 'Todos'], ['APROBADO', 'Aprobados'], ['PENDIENTE', 'Pendientes'], ['RECHAZADO', 'Rechazados']].map(([value, label]) => ({ value, label }))} /></div></div>
    {!api.length ? <div style={{ fontSize: 13.3, color: 'var(--soft)', marginTop: 17 }}>Sin conexión Meta Cloud</div>
      : rows.length === 0 ? <div style={{ fontSize: 13.3, color: 'var(--soft)', marginTop: 17 }}>No hay templates en esta WABA.</div>
        : <Tbl grid="1.2fr 140px 90px 2fr 120px 70px" cols={['NOMBRE', 'CATEGORÍA', 'IDIOMA', 'CONTENIDO', 'ESTADO', 'ACCIONES']} rows={rows.map(t => [<span style={mono}>{t.name}</span>, t.cat, t.lang, <span style={{ color: 'var(--soft)' }}>{t.body}</span>, <Badge c={SC[t.status]}>{t.status}</Badge>, <Act onDel={() => setTpl(x => x.filter(y => y.id !== t.id))} />])} />}
    {m && <LModal open onClose={() => setM(null)} title="Nuevo template" desc="Se enviará a Meta para aprobación" bodyStyle={{ overflow: 'visible' }}>
      <Lb req>Nombre</Lb><input className="l-in" style={IN} value={m.name} onChange={e => setM({ ...m, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })} placeholder="bienvenida_1" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div><Lb mt={16}>Categoría</Lb><LSelect className="l-in ct-in" bold value={m.cat} onChange={v => setM({ ...m, cat: v })} options={['MARKETING', 'UTILITY', 'AUTHENTICATION'].map(x => ({ value: x, label: x }))} /></div>
        <div><Lb mt={16}>Idioma</Lb><LSelect className="l-in ct-in" bold value={m.lang} onChange={v => setM({ ...m, lang: v })} options={[['es', 'Español'], ['pt_BR', 'Português (BR)'], ['en_US', 'English (US)']].map(([value, label]) => ({ value, label }))} /></div></div>
      <Lb mt={16} req>Contenido</Lb><textarea className="l-in" style={{ ...IN, height: 100, padding: 12 }} value={m.body} onChange={e => setM({ ...m, body: e.target.value })} placeholder="Hola {{1}}, gracias por su compra." />
      <Foot onCancel={() => setM(null)} disabled={!m.name || !m.body.trim()} label="Enviar a Meta" onOk={() => { setTpl(x => [...x, { ...m, id: uid(), waba, status: 'PENDIENTE' }]); setM(null); toast('Template enviado para aprobación') }} />
    </LModal>}
  </Card>
}

/* ---------------- Variables globales ---------------- */
export function GlobalVars() {
  const toast = useToast(); const [vars, setVars] = useStore('set_vars', []); const [q, setQ] = useState(''); const [m, setM] = useState(null); const [asc, setAsc] = useState(1)
  const rows = vars.filter(v => (v.key + ' ' + (v.desc || '')).toLowerCase().includes(q.toLowerCase())).sort((a, b) => asc * a.key.localeCompare(b.key))
  const okVal = m && (m.type !== 'number' || m.value === '' || !isNaN(+m.value.replace(',', '.')))
  return <Card>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="lp-btn p" onClick={() => setM({ key: '', desc: '', type: 'text', value: '' })}><Plus size={16} />Nueva variable</button></div>
    <div style={{ marginTop: 9 }}><Srch v={q} set={setQ} ph="Buscar por nombre o descripción" /></div>
    {vars.length === 0 ? <EmptyIn ic={AtSign} t="No se encontraron variables" d="Cree su primera variable para comenzar" btn="Crear variable" onClick={() => setM({ key: '', desc: '', type: 'text', value: '' })} />
      : <Tbl grid="1.3fr 1fr 1.7fr 1fr 80px" cols={[<span style={{ cursor: 'pointer', textTransform: 'none' }} onClick={() => setAsc(-asc)}>Nombre ⇅</span>, 'TIPO', 'DESCRIPCIÓN', 'VALOR', 'ACCIONES']}
        rows={rows.map(v => [<span style={mono}>g_{v.key}</span>, <Badge>{v.type === 'number' ? <Hash size={12} /> : <Type size={12} />}{v.type === 'number' ? 'Número' : 'Texto'}</Badge>, v.desc, <span style={{ color: 'var(--soft)' }}>{v.value}</span>, <Act onEdit={() => setM({ ...v })} onDel={() => { setVars(x => x.filter(y => y.id !== v.id)); toast('Variable eliminada') }} />])} />}
    {m && <LModal open onClose={() => setM(null)} title={m.id ? 'Editar variable global' : 'Nueva variable global'} desc="Cree un identificador reutilizable en flujos como {g_ejemplo}." width={482} bodyStyle={{ padding: '22px 25px 0', overflow: 'visible' }}>
      <Lb>Nombre</Lb><input className="l-in" style={IN} autoFocus value={m.key} onChange={e => setM({ ...m, key: e.target.value.replace(/^g_/i, '').replace(/[^A-Za-z0-9_]/g, '_') })} placeholder="Ej.: nombre_01 (el prefijo g_ se agrega automáticamente)" />
      <Lb mt={18}>Descripción</Lb><input className="l-in" style={IN} value={m.desc} onChange={e => setM({ ...m, desc: e.target.value })} placeholder="Describa qué representa esta variable" />
      <Lb mt={18}>Tipo</Lb><LSelect className="l-in ct-in" bold value={m.type} onChange={v => setM({ ...m, type: v })} options={[{ value: 'text', label: 'Texto' }, { value: 'number', label: 'Número' }]} />
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Si cambia el tipo, ajuste el valor (número válido o texto).</div>
      <Lb mt={17}>Valor inicial (opcional)</Lb><input className="l-in" style={{ ...IN, borderColor: okVal ? undefined : '#ef4444' }} value={m.value} onChange={e => setM({ ...m, value: e.target.value })} />
      <Foot onCancel={() => setM(null)} disabled={!m.key || !okVal || vars.some(v => v.key === m.key && v.id !== m.id)} label={m.id ? 'Guardar' : 'Crear'} onOk={() => { setVars(x => m.id ? x.map(y => y.id === m.id ? m : y) : [...x, { ...m, id: uid() }]); toast(m.id ? 'Variable actualizada' : 'Variable creada'); setM(null) }} />
    </LModal>}
  </Card>
}

/* ---------------- Campos personalizados ---------------- */
const CF_DEF = [['ctwa_clid', 'Anúncio: CTWA Click ID'], ['media_url', 'Anúncio: Media URL'], ['source_id', 'Anúncio: Source ID'], ['source_url', 'Anúncio: Source URL'], ['thumbnail_url', 'Anúncio: Thumbnail URL']].map(([name, desc]) => ({ id: name, name, desc, type: 'text', sys: true }))
const SYS = [['full_name', 'Nombre completo del cliente', 'Texto'], ['first_name', 'Primer nombre del cliente', 'Texto'], ['phone_number', 'Número de teléfono del cliente', 'Texto'], ['hora', 'Hora actual en formato HH:mm', 'Texto'], ['data', 'Fecha actual en formato dd/MM', 'Texto'], ['dia', 'Día de la semana actual', 'Texto'], ['response.type', 'Tipo MIME de la última respuesta del cliente (ej.: audio/ogg, image/jpeg)', 'Variable'], ['response.erro', 'Mensaje de error del último HTTP que falló', 'Variable']]
export function CustomFields() {
  const toast = useToast(); const [tab, setTab] = useState('custom'); const [q, setQ] = useState('')
  const [fields, setFields] = useStore('custom_fields', CF_DEF); const [sysd, setSysd] = useStore('sys_field_desc', {}); const [m, setM] = useState(null)
  const custom = fields.filter(f => (f.name + f.desc).toLowerCase().includes(q.toLowerCase()))
  const sys = SYS.map(([name, desc, type]) => ({ name, desc: sysd[name] ?? desc, type })).filter(f => (f.name + f.desc).toLowerCase().includes(q.toLowerCase()))
  const TC = { Texto: '#4d94ff', Variable: '#60a5fa', Número: '#34d399', Fecha: '#f59e0b' }
  return <>
    <div className="st-tabs">{[['custom', 'Personalizados'], ['sys', 'Sistema (BOT)']].map(([k, l]) => <button key={k} className={'st-tab' + (tab === k ? ' on' : '')} onClick={() => { setTab(k); setQ('') }}>{l}</button>)}</div>
    <div style={{ display: 'flex', gap: 13, marginTop: 17 }}><div style={{ flex: 1 }}><Srch label={null} v={q} set={setQ} ph={tab === 'custom' ? 'Buscar campos personalizados...' : 'Buscar campos del sistema...'} /></div>
      {tab === 'custom' && <button className="lp-btn p" onClick={() => setM({ name: '', desc: '', type: 'Texto', isNew: true })}><Plus size={16} />Nuevo campo</button>}</div>
    <div className="st-card" style={{ marginTop: 16 }}><h3>{tab === 'custom' ? 'Campos personalizados activos' : 'Campos del sistema (BOT)'}</h3><div className="sd">{tab === 'custom' ? 'Defina campos adicionales para registrar detalles personalizados en sus leads' : 'Campos globales predefinidos por el sistema. No se pueden eliminar.'}</div>
      <Tbl grid={tab === 'custom' ? '1fr 1.47fr .7fr 110px' : '.7fr 1.85fr .55fr 110px'} cols={['NOMBRE', 'DESCRIPCIÓN', 'TIPO', 'ACCIONES']}
        rows={(tab === 'custom' ? custom.map(f => [f.name, f.desc, f.type === 'text' ? 'Texto' : f.type, f]) : sys.map(f => [f.name, f.desc, f.type, f])).map(([n, d, t, f]) => [<span style={mono}>{n}</span>, d, <Badge c={TC[t] || '#4d94ff'}>{t}</Badge>,
          <Act onEdit={() => setM({ ...f, type: t, isSys: tab === 'sys' })} onDel={tab === 'custom' && !f.sys ? () => { setFields(x => x.filter(y => y.id !== f.id)); toast('Campo eliminado') } : null} />])} />
      {(tab === 'custom' ? custom : sys).length === 0 && <div style={{ padding: 18, textAlign: 'center', fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Sin resultados.</div>}
    </div>
    {m && <LModal open onClose={() => setM(null)} title={m.isNew ? 'Nuevo campo personalizado' : 'Editar descripción del campo'} desc={m.isNew ? 'Se guardará en cada contacto' : 'Actualice la descripción de este campo'} width={489} bodyStyle={{ padding: '22px 25px 0', overflow: 'visible' }}>
      <Lb>Nombre</Lb><input className="l-in" disabled={!m.isNew} style={{ ...IN, opacity: m.isNew ? 1 : .7 }} autoFocus={m.isNew} value={m.name} onChange={e => setM({ ...m, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })} placeholder="ej.: dni" />
      {!m.isNew && <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 6 }}>El nombre del campo no se puede cambiar</div>}
      <Lb mt={17}>Descripción</Lb><input className="l-in" style={{ ...IN, fontWeight: 600 }} autoFocus={!m.isNew} value={m.desc} onChange={e => setM({ ...m, desc: e.target.value })} />
      {m.isNew && <><Lb mt={17}>Tipo</Lb><LSelect className="l-in ct-in" bold value={m.type} onChange={v => setM({ ...m, type: v })} options={['Texto', 'Número', 'Fecha'].map(x => ({ value: x, label: x }))} /></>}
      <Foot onCancel={() => setM(null)} disabled={!m.name || (m.isNew && fields.some(f => f.name === m.name))} label={m.isNew ? 'Crear' : 'Guardar'} onOk={() => {
        if (m.isSys) setSysd({ ...sysd, [m.name]: m.desc }); else if (m.isNew) setFields(x => [...x, { id: uid(), name: m.name, desc: m.desc, type: m.type }]); else setFields(x => x.map(y => y.id === m.id ? { ...y, desc: m.desc } : y))
        toast(m.isNew ? 'Campo creado' : 'Descripción actualizada'); setM(null) }} />
    </LModal>}
  </>
}

/* ---------------- Etiquetas ---------------- */
const TCOL = [['#3b82f6', 'Azul'], ['#ef4444', 'Rojo'], ['#10b981', 'Verde'], ['#f59e0b', 'Ámbar'], ['#005ae3', 'Morado'], ['#f97316', 'Naranja'], ['#06b6d4', 'Cian'], ['#84cc16', 'Lima'], ['#ec4899', 'Rosa'], ['#6b7280', 'Gris'], ['#ffff00', 'Amarillo'], ['#ff00ff', 'Magenta'], ['#000000', 'Negro'], ['#ffffff', 'Blanco']]
const lum = h => { const n = parseInt(h.slice(1), 16); return (((n >> 16) & 255) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114) / 255 }
export function Tags() {
  const toast = useToast(); const [tags, setTags] = useStore('tags', []); const [contacts] = useStore('contacts', []); const [q, setQ] = useState(''); const [m, setM] = useState(null); const [del, setDel] = useState(null)
  const rows = tags.filter(t => t.name.toLowerCase().includes(q.toLowerCase()))
  const cnt = n => contacts.filter(c => (c.tags || []).includes(n)).length
  const isPreset = c => TCOL.some(x => x[0] === c)
  const blank = { name: '', color: '#0000ff', wa: false }
  return <Card>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="lp-btn p" onClick={() => setM(blank)}><Plus size={16} />Nueva etiqueta</button></div>
    <div style={{ marginTop: 9 }}><Srch v={q} set={setQ} ph="Buscar etiquetas..." /></div>
    {tags.length === 0 ? <EmptyIn ic={Tag} t="No hay etiquetas creadas" d="Cree su primera etiqueta para organizarse" btn="Crear primera etiqueta" onClick={() => setM(blank)} />
      : <Tbl grid="1fr 1fr 90px" cols={['NOMBRE', 'CONTACTOS MARCADOS', 'ACCIONES']} rows={rows.map(t => [<span style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 700 }}><i style={{ width: 9, height: 9, borderRadius: '50%', background: t.color, display: 'inline-block' }} />{t.name}</span>, <b style={{ fontWeight: 600 }}>{cnt(t.name)} contactos</b>, <Act onEdit={() => setM({ ...t })} onDel={() => setDel(t)} />])} />}
    {m && <LModal open onClose={() => setM(null)} title={m.id ? 'Editar etiqueta' : 'Nueva etiqueta'} desc="Añada una nueva etiqueta de identificación" width={480} bodyStyle={{ padding: '22px 23px 0', overflow: 'visible' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
        <div><Lb>Nombre de la etiqueta</Lb><input className="l-in" style={IN} autoFocus value={m.name} onChange={e => setM({ ...m, name: e.target.value })} placeholder="Escriba el nombre de la etiqueta" /></div>
        <div><Lb>Color de la etiqueta</Lb><LSelect className="l-in ct-in" bold value={isPreset(m.color) ? m.color : 'custom'} onChange={v => setM({ ...m, color: v === 'custom' ? (isPreset(m.color) ? '#0000ff' : m.color) : v })} options={[...TCOL.map(([c, l]) => ({ value: c, label: l, dot: c })), { value: 'custom', label: 'Personalizado', dot: isPreset(m.color) ? '#0000ff' : m.color }]} />
          {!isPreset(m.color) && <input type="color" value={m.color} onChange={e => setM({ ...m, color: e.target.value })} style={{ width: '100%', height: 26, marginTop: 6, background: 'none', border: 'none', cursor: 'pointer' }} />}</div></div>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 13px', marginTop: 16 }}>
        <div><div style={{ fontSize: 13.3, fontWeight: 700 }}>Agregar a WhatsApp Business</div><div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 3, lineHeight: 1.4 }}>Esta etiqueta se aplicará a los chats (importe primero las existentes de WhatsApp)</div></div>
        <span style={{ marginLeft: 'auto', paddingLeft: 10 }}><Toggle on={m.wa} onChange={v => setM({ ...m, wa: v })} /></span></div>
      <Lb mt={16}>Vista previa</Lb>
      <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '15px 15px' }}><span className="st-dep" style={{ background: m.color, color: lum(m.color) > .6 ? '#111' : '#fff' }}><i />{m.name || 'Nombre de la etiqueta'}</span></div>
      <Foot onCancel={() => setM(null)} disabled={!m.name.trim() || tags.some(t => t.name.toLowerCase() === m.name.trim().toLowerCase() && t.id !== m.id)} label={m.id ? 'Guardar' : 'Crear'} onOk={() => { const t = { ...m, name: m.name.trim() }; setTags(x => m.id ? x.map(y => y.id === m.id ? t : y) : [...x, { ...t, id: uid() }]); toast(m.id ? 'Etiqueta actualizada' : 'Etiqueta creada'); setM(null) }} />
    </LModal>}
    <LModal open={!!del} onClose={() => setDel(null)} title="Eliminar etiqueta" width={482} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55 }}>¿Eliminar la etiqueta "{del?.name}"? Los contactos la conservarán como texto.</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 13 }}><button className="lb2 g" onClick={() => setDel(null)}>Cancelar</button><button className="lb2 d" onClick={() => { setTags(x => x.filter(t => t.id !== del.id)); setDel(null); toast('Etiqueta eliminada') }}>Eliminar</button></div>
    </LModal>
  </Card>
}

/* ---------------- Integraciones ---------------- */
const PROV = [
  ['leonapay', 'Leona Pay', 'pagos', 'Cobra en Brasil, México y Latinoamérica.', '#004fc7', Sparkles, true],
  ['notasy', 'Notasy NF-e', 'facturas', 'Emisión automatizada de facturas electrónicas de ventas', '#6d5dfc', Receipt],
  ['lowtrack', 'LowTrack', 'seguimiento', 'Seguimiento de ventas y envío automático al Facebook CAPI', '#2563eb', ChartLine],
  ['utmify', 'UTMify', 'seguimiento', 'Seguimiento de campañas y atribución avanzada de ventas', '#111111', ChartLine],
  ['openai', 'OpenAI GPT', 'ia', 'IA generativa para chatbots y flujos cognitivos', '#111111', Bot],
  ['xpag', 'XPag', 'pagos', 'Operación en tres vías — PIX (BRL), API LATAM y API Cripto (USDT) — con conciliación automática', '#000000', CreditCard],
  ['gemini', 'Google Gemini', 'ia', 'Modelos multimodales rápidos y eficientes de Google', '#ffffff', Sparkles],
  ['eleven', 'ElevenLabs', 'ia', 'Síntesis de voz con IA para audio en flujos', '#000000', Mic],
  ['openrouter', 'OpenRouter', 'ia', 'Una clave para varios modelos (Claude, GPT, Gemini, Llama y otros)', '#111111', Zap],
  ['biziva', 'BIZIVA', 'ia', 'IA compatible con OpenAI — modelo biziva-auto y API en biziva.com.br', '#dc2626', Bot],
  ['zenith', 'Zenith Global', 'pagos', 'Métodos locales y operación multi-país y multi-moneda: LATAM, Europa, Asia y más', '#111111', Globe],
]
const CAT = { whatsapp: 'WHATSAPP', facturas: 'FACTURAS', seguimiento: 'SEGUIMIENTO', pagos: 'PAGOS', ia: 'INTELIGENCIA ARTIFICIAL' }
const Logo = ({ p, s = 37 }) => { const Ic = p[5]; return <span style={{ width: s, height: s, borderRadius: 7, background: p[4], display: 'grid', placeItems: 'center', color: p[4] === '#ffffff' ? '#004fc7' : '#fff', flexShrink: 0, border: '1px solid rgba(255,255,255,.08)' }}><Ic size={s * .5} /></span> }
export function Integrations() {
  const toast = useToast(); const [act, setAct] = useStore('integrations', []); const [tab, setTab] = useState('all'); const [q, setQ] = useState(''); const [m, setM] = useState(null); const [del, setDel] = useState(null)
  const P = id => PROV.find(p => p[0] === id)
  const inTab = p => (tab === 'all' || p[2] === tab) && (p[1] + p[3]).toLowerCase().includes(q.toLowerCase())
  const cnt = k => act.filter(a => k === 'all' || P(a.prov)[2] === k).length
  const actives = act.filter(a => inTab(P(a.prov)))
  const avail = PROV.filter(p => !p[6] && inTab(p))
  const Cardi = ({ p, feat }) => <div style={{ position: 'relative', background: 'var(--card)', border: feat ? '2px solid #005ae3' : '1px solid var(--border)', borderRadius: 7, padding: '20px 20px 18px', display: 'flex', flexDirection: 'column', minHeight: 222 }}>
    {feat && <span style={{ position: 'absolute', top: -10, right: 12, background: '#005ae3', color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', padding: '3px 8px', borderRadius: 4 }}>NOVEDAD</span>}
    <div style={{ display: 'flex', alignItems: 'flex-start' }}><Logo p={p} /><span className="bl-tag" style={{ marginLeft: 'auto', fontSize: 10.5, letterSpacing: '.05em', fontWeight: 600, background: 'transparent', border: '1px solid var(--border)' }}>{CAT[p[2]]}</span></div>
    <div style={{ fontSize: 15.5, fontWeight: 700, marginTop: 15 }}>{p[1]}</div>
    <div style={{ fontSize: 13.3, lineHeight: 1.6, color: 'var(--soft)', marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p[3]}</div>
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 'auto', paddingTop: 15, display: 'flex', justifyContent: 'flex-end' }}><button className="lb2 g sm" style={{ height: 31, minWidth: 0, fontSize: 12.5 }} onClick={() => setM({ prov: p[0], label: '', key: '' })}>Configurar</button></div></div>
  const H = ({ t, n, r }) => <div style={{ display: 'flex', alignItems: 'center', margin: '27px 0 12px' }}><span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.18em', color: 'var(--soft)' }}>{t}{n != null && <b style={{ color: 'var(--text)', marginLeft: 6, letterSpacing: '.05em' }}>{n}</b>}</span><span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--soft)' }}>{r}</span></div>
  return <div>
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' }}>{[['all', 'Todas'], ['whatsapp', 'WhatsApp'], ['facturas', 'Facturas'], ['seguimiento', 'Seguimiento'], ['pagos', 'Pagos'], ['ia', 'Inteligencia artificial']].map(([k, l]) => <button key={k} onClick={() => setTab(k)} style={{ height: 41, padding: '0 14px', fontSize: 13.3, fontWeight: 600, color: tab === k ? '#4d94ff' : 'var(--text)', borderBottom: '2px solid ' + (tab === k ? '#005ae3' : 'transparent'), marginBottom: -1, display: 'flex', alignItems: 'center', gap: 11 }}>{l}{cnt(k) > 0 && <small style={{ fontSize: 10.5, fontWeight: 700 }}>{cnt(k)}</small>}</button>)}</div>
    <div className="lp-srch" style={{ marginTop: 11 }}><Search size={15} /><input style={{ height: 30, fontWeight: 500 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar integración..." /></div>
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 15 }} />
    {inTab(PROV[0]) && <><H t="DESTACADOS" r="La integración nativa de Leona" /><div style={{ width: 'calc(25% - 11px)', minWidth: 260 }}><Cardi p={PROV[0]} feat /></div></>}
    {act.length > 0 && <><H t="ACTIVAS" n={actives.length} r="Conectadas en tu cuenta" />
      {actives.map(a => { const p = P(a.prov); return <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--card)', border: '1px solid var(--border)', borderLeft: '3px solid #22c55e', borderRadius: 7, height: 61, padding: '0 17px', marginBottom: 11 }}>
        <Logo p={p} s={32} /><div><div style={{ fontSize: 13.5, fontWeight: 700 }}>{a.label || p[1]}</div><div style={{ fontSize: 11.5, color: '#94a3b8' }}>{p[1]}</div></div>
        <span className="pf-on" style={{ marginTop: 0, height: 24, fontSize: 12 }}><i />Activo</span>
        <button style={{ fontSize: 12.5, fontWeight: 500 }} onClick={() => setM({ ...a })}>Editar</button><button style={{ fontSize: 12.5, color: '#ef4444' }} onClick={() => setDel(a)}>Eliminar</button></div> })}
      {actives.length === 0 && <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Ninguna activa en esta categoría.</div>}</>}
    <H t="DISPONIBLES" n={avail.length} r="Listas para conectar" />
    {avail.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 15 }}>{avail.map(p => <Cardi key={p[0]} p={p} />)}</div> : <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>{tab === 'whatsapp' ? 'Las conexiones de WhatsApp se gestionan en Conexiones.' : 'Sin resultados.'}</div>}
    {m && (() => { const p = P(m.prov); return <LModal open onClose={() => setM(null)} title={(m.id ? 'Editar ' : 'Configurar ') + p[1]} desc={p[3]} icon={<Logo p={p} s={28} />}
      footer={<><button className="lb2 g" onClick={() => setM(null)}>Cancelar</button><button className="lb2 p" disabled={!m.key.trim()} onClick={() => { setAct(x => m.id ? x.map(y => y.id === m.id ? m : y) : [...x, { ...m, id: uid() }]); toast(p[1] + (m.id ? ' actualizada' : ' conectada')); setM(null) }}>{m.id ? 'Guardar' : 'Conectar'}</button></>}>
      <Lb>Nombre de la integración</Lb><input className="l-in" style={IN} value={m.label} onChange={e => setM({ ...m, label: e.target.value })} placeholder={'Ej.: ' + p[1] + ' principal'} />
      <Lb mt={16} req>{p[2] === 'ia' ? 'API Key' : 'Token / API Key'}</Lb><input className="l-in" type="password" style={IN} value={m.key} onChange={e => setM({ ...m, key: e.target.value })} placeholder="••••••••••••" />
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 7 }}>La clave se guarda solo en este navegador.</div>
    </LModal> })()}
    <LModal open={!!del} onClose={() => setDel(null)} title="Eliminar integración" width={482} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55 }}>¿Desconectar "{del?.label || (del && P(del.prov)[1])}"?</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 13 }}><button className="lb2 g" onClick={() => setDel(null)}>Cancelar</button><button className="lb2 d" onClick={() => { setAct(x => x.filter(a => a.id !== del.id)); setDel(null); toast('Integración eliminada') }}>Eliminar</button></div>
    </LModal>
  </div>
}

/* ---------------- Seguimiento ---------------- */
export function Tracking({ onBack }) {
  const toast = useToast(); const nav = useNavigate()
  const [pix, setPix] = useStore('track_pixels', []); const [links, setLinks] = useStore('track_links', []); const [conns] = useStore('connections', [])
  const [pm, setPm] = useState(null); const [lm, setLm] = useState(null)
  const Sec = ({ t, btn, onAdd, children }) => <div className="st-card" style={{ marginTop: 24, padding: '22px 22px 22px' }}><div style={{ display: 'flex', alignItems: 'center' }}><span style={{ fontSize: 15, fontWeight: 700 }}>{t}</span><button className="wh-btn" style={{ marginLeft: 'auto' }} onClick={onAdd}><Plus size={15} />{btn}</button></div>{children}</div>
  const Emp = ({ ic: Ic, t, d, btn, onAdd }) => <div style={{ border: '1px dashed var(--border)', borderRadius: 5, height: 256, marginTop: 17, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}><Ic size={44} strokeWidth={1.9} color="#94a3b8" /><div style={{ fontSize: 16, fontWeight: 700, marginTop: 17 }}>{t}</div><div style={{ fontSize: 13.3, color: '#94a3b8', marginTop: 9, maxWidth: 370, lineHeight: 1.45 }}>{d}</div>{btn && <button className="wh-btn" style={{ marginTop: 17 }} onClick={onAdd}><Plus size={15} />{btn}</button>}</div>
  const code = 'código'
  const preview = msg => { const i = Math.min(5, msg.length); return <>{msg.slice(0, i)}<span style={{ background: 'var(--btn2h)', color: '#4d94ff', borderRadius: 4, padding: '1px 6px', margin: '0 4px' }}>{code}</span>{msg.slice(i)}</> }
  const sum = lm ? Object.values(lm.inst).reduce((a, b) => a + (+b || 0), 0) : 0
  const lOk = lm && lm.name.trim() && lm.msg.trim().length >= 6 && sum === 100
  const base = location.origin + '/r/'
  return <div className="lp" style={{ paddingTop: 26 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, fontSize: 13.3, color: '#94a3b8', marginLeft: 8 }}><button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }} onClick={onBack}><ArrowLeft size={14} />Volver</button><span style={{ width: 1, height: 16, background: 'var(--border2)' }} />
      <button style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--soft)' }} onClick={() => nav('/welcome')}><House size={14} />Inicio</button><ChevronRight size={14} /><b style={{ color: 'var(--text)' }}>Seguimiento</b></div>
    <div className="lp-hd" style={{ marginTop: 21 }}><Radar size={22} style={{ marginLeft: 2 }} /><div><h1 style={{ fontSize: 19.5 }}>Seguimiento</h1><p>Conecta el anuncio con WhatsApp y devuelve la conversión a TikTok, Kwai o Google.</p></div></div>
    <div className="pf-hint" style={{ color: 'var(--text)', height: 42, marginTop: 26, fontSize: 13 }}>La cuenta de servicio de Google de Leona aún no está configurada.</div>
    <div className="wh-note" style={{ height: 50, marginTop: 23, fontSize: 13 }}>El clic de Kwai se guarda. El POST del píxel espera la URL y los campos confirmados de la Event API.</div>
    <Sec t="Píxeles" btn="Nuevo píxel" onAdd={() => setPm({ plat: 'TikTok', name: '', pid: '', token: '' })}>
      {pix.length === 0 ? <Emp ic={Radar} t="Todavía no hay píxeles" d="Registre el píxel de la cuenta de anuncios para devolver la conversión." btn="Nuevo píxel" onAdd={() => setPm({ plat: 'TikTok', name: '', pid: '', token: '' })} />
        : <Tbl grid="1fr 120px 1fr 80px" cols={['NOMBRE', 'PLATAFORMA', 'PIXEL ID', 'ACCIONES']} rows={pix.map(p => [<b>{p.name}</b>, p.plat, <span style={mono}>{p.pid}</span>, <Act onEdit={() => setPm({ ...p })} onDel={() => setPix(x => x.filter(y => y.id !== p.id))} />])} />}
    </Sec>
    <Sec t="Enlaces" btn="Nuevo enlace" onAdd={() => setLm({ name: '', plat: 'TikTok', fmt: 'direct', pix: '', inst: {}, fall: 'any', ev: true, msg: 'Hola, me gustaría recibir la información' })}>
      {links.length === 0 ? <Emp ic={Link2} t="Todavía no hay enlaces" d="Cree el enlace que usará el anuncio y elija la instancia de WhatsApp que recibirá a los contactos." />
        : <Tbl grid="1fr 110px 2fr 80px" cols={['NOMBRE', 'PLATAFORMA', 'ENLACE', 'ACCIONES']} rows={links.map(l => [<b>{l.name}</b>, l.plat, <span style={{ ...mono, fontWeight: 400, color: '#4d94ff' }}>{base + l.slug}</span>, <><button className="ch-ib" style={{ width: 28, height: 28 }} onClick={() => { navigator.clipboard?.writeText(base + l.slug); toast('Enlace copiado') }}><Copy size={14} /></button><Act onEdit={() => setLm({ ...l })} onDel={() => setLinks(x => x.filter(y => y.id !== l.id))} /></>])} />}
    </Sec>
    {pm && <LModal open onClose={() => setPm(null)} title={pm.id ? 'Editar píxel' : 'Nuevo píxel'} icon={<Radar size={19} />} bodyStyle={{ overflow: 'visible' }}
      footer={<><button className="lb2 g" onClick={() => setPm(null)}>Cancelar</button><button className="lb2 p" disabled={!pm.name.trim() || !pm.pid.trim()} onClick={() => { setPix(x => pm.id ? x.map(y => y.id === pm.id ? pm : y) : [...x, { ...pm, id: uid() }]); setPm(null); toast('Píxel guardado') }}>Guardar píxel</button></>}>
      <Lb>Plataforma</Lb><LSelect className="l-in ct-in" bold value={pm.plat} onChange={v => setPm({ ...pm, plat: v })} options={['TikTok', 'Kwai', 'Google', 'Meta'].map(x => ({ value: x, label: x }))} />
      <Lb mt={16} req>Nombre</Lb><input className="l-in" style={IN} value={pm.name} onChange={e => setPm({ ...pm, name: e.target.value })} />
      <Lb mt={16} req>Pixel ID</Lb><input className="l-in" style={IN} value={pm.pid} onChange={e => setPm({ ...pm, pid: e.target.value.trim() })} />
      <Lb mt={16}>Access token</Lb><input className="l-in" type="password" style={IN} value={pm.token} onChange={e => setPm({ ...pm, token: e.target.value })} />
    </LModal>}
    {lm && <LModal open onClose={() => setLm(null)} title={lm.id ? 'Editar enlace' : 'Nuevo enlace'} icon={<Link2 size={20} />} width={478} bodyStyle={{ padding: '20px 23px 0', overflowX: 'visible' }}>
      <Lb>Nombre</Lb><input className="l-in" style={IN} autoFocus value={lm.name} onChange={e => setLm({ ...lm, name: e.target.value })} />
      <Lb mt={16}>Plataforma</Lb><LSelect className="l-in ct-in" bold value={lm.plat} onChange={v => setLm({ ...lm, plat: v })} options={['TikTok', 'Kwai', 'Google'].map(x => ({ value: x, label: x }))} />
      <Lb mt={16}>Formato</Lb><LSelect className="l-in ct-in" bold value={lm.fmt} onChange={v => setLm({ ...lm, fmt: v })} options={[{ value: 'direct', label: 'Enlace directo' }, { value: 'page', label: 'Página intermedia' }]} />
      <Lb mt={16}>Píxeles</Lb><LSelect className="l-in ct-in" value={lm.pix} onChange={v => setLm({ ...lm, pix: v })} placeholder="Seleccione" options={pix.filter(p => p.plat === lm.plat).map(p => ({ value: p.id, label: p.name }))} />
      <Lb mt={16}>Instancias</Lb>
      {conns.length === 0 ? <div style={{ fontSize: 13.3, color: 'var(--soft)' }}>Ninguna instancia con número en esta cuenta.</div>
        : conns.map(c => <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}><input type="checkbox" checked={c.id in lm.inst} onChange={e => { const i = { ...lm.inst }; if (e.target.checked) i[c.id] = 100 - sum > 0 ? 100 - sum : 0; else delete i[c.id]; setLm({ ...lm, inst: i }) }} style={{ accentColor: '#005ae3' }} /><span style={{ fontSize: 13, flex: 1 }}>{c.name} <span style={{ color: '#94a3b8' }}>{c.phone}</span></span>
          {c.id in lm.inst && <><input className="l-in" style={{ ...IN, width: 70, height: 30 }} type="number" min="0" max="100" value={lm.inst[c.id]} onChange={e => setLm({ ...lm, inst: { ...lm.inst, [c.id]: e.target.value } })} />%</>}</div>)}
      {sum !== 100 && <div style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4 }}>Suma: {sum}. La suma de los porcentajes marcados tiene que ser 100.</div>}
      <Lb mt={16}>Si ninguna instancia está conectada</Lb><LSelect className="l-in ct-in" bold value={lm.fall} onChange={v => setLm({ ...lm, fall: v })} options={[{ value: 'any', label: 'Sortear aunque esté desconectada' }, { value: 'none', label: 'Mostrar error al visitante' }]} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.3, fontWeight: 600, marginTop: 15, cursor: 'pointer' }}><input type="checkbox" checked={lm.ev} onChange={e => setLm({ ...lm, ev: e.target.checked })} style={{ width: 15, height: 15, accentColor: '#3b82f6' }} />Enviar el evento de contacto en el primer vínculo</label>
      <Lb mt={14}>Mensaje</Lb><textarea className="l-in" style={{ ...IN, height: 78, padding: 12, fontWeight: 600, resize: 'vertical' }} value={lm.msg} onChange={e => setLm({ ...lm, msg: e.target.value })} />
      <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>El código entra después de la 5ª letra. La frase necesita al menos 6 caracteres.</div>
      <Lb mt={12}>Vista previa</Lb><div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', fontSize: 13.3 }}>{preview(lm.msg)}</div>
      <Foot onCancel={() => setLm(null)} disabled={!lOk} label="Guardar enlace" onOk={() => { const l = { ...lm, slug: lm.slug || lm.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + uid().slice(0, 4) }; setLinks(x => lm.id ? x.map(y => y.id === lm.id ? l : y) : [...x, { ...l, id: uid() }]); setLm(null); toast('Enlace guardado') }} />
    </LModal>}
  </div>
}

/* ---------------- Productos ---------------- */
let CUR = []
try { const dn = new Intl.DisplayNames(['es'], { type: 'currency' }); CUR = Intl.supportedValuesOf('currency').map(c => ({ value: c, label: `${c} · ${dn.of(c)}` })) } catch { CUR = ['BRL', 'PEN', 'USD', 'MXN', 'COP', 'CLP', 'ARS', 'EUR'].map(c => ({ value: c, label: c })) }
const num = v => +String(v).replace(/\./g, '').replace(',', '.') || 0
const fmt = v => v.replace(/[^\d,]/g, '')
export function Products() {
  const toast = useToast(); const [list, setList] = useStore('products', []); const [q, setQ] = useState(''); const [m, setM] = useState(null)
  const rows = list.filter(p => (p.name || '').toLowerCase().includes(q.toLowerCase()))
  const blank = { name: '', cur: 'BRL', min: '', max: '', def: '' }
  const err = m && (num(m.def) <= 0 ? 'El valor predeterminado debe ser mayor que cero.' : num(m.max) < num(m.min) ? 'El precio máximo debe ser mayor o igual al mínimo.' : (num(m.def) < num(m.min) || num(m.def) > num(m.max)) ? 'El valor predeterminado debe estar entre el mínimo y el máximo.' : '')
  const money = (c, v) => `${c} ${num(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
  return <Card>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="lp-btn p" onClick={() => setM(blank)}><Plus size={16} />Nuevo producto</button></div>
    <div style={{ marginTop: 9 }}><Srch v={q} set={setQ} ph="Buscar por nombre..." /></div>
    {list.length === 0 ? <EmptyIn ic={Package} t="No hay productos" d="Cree el primer producto para usarlo en ventas y flujos." btn="Registrar producto" onClick={() => setM(blank)} />
      : <Tbl grid="1.4fr 1fr 1fr 1fr 80px" cols={['NOMBRE', 'MÍNIMO', 'MÁXIMO', 'PREDETERMINADO', 'ACCIONES']} rows={rows.map(p => [<b>{p.name}</b>, money(p.cur, p.min), money(p.cur, p.max), <b style={{ color: '#22c55e' }}>{money(p.cur, p.def)}</b>, <Act onEdit={() => setM({ ...p })} onDel={() => { setList(x => x.filter(y => y.id !== p.id)); toast('Producto eliminado') }} />])} />}
    {m && <LModal open onClose={() => setM(null)} title={m.id ? 'Editar producto' : 'Nuevo producto'} desc="Registre productos con rango de precio y valor predeterminado para ventas e integraciones." width={479} bodyStyle={{ padding: '20px 20px 0', overflow: 'visible' }}>
      <Lb req>Nombre</Lb><input className="l-in" style={IN} autoFocus value={m.name} onChange={e => setM({ ...m, name: e.target.value })} placeholder="Ej.: Plan premium" />
      <Lb mt={15} req>Moneda</Lb><LSelect className="l-in ct-in" bold value={m.cur} onChange={v => setM({ ...m, cur: v })} options={CUR} />
      <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 6, lineHeight: 1.4 }}>Los precios mínimo, máximo y predeterminado se interpretan en esta moneda.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        <div><Lb mt={15} req>Precio mínimo</Lb><input className="l-in" style={IN} inputMode="decimal" value={m.min} onChange={e => setM({ ...m, min: fmt(e.target.value) })} placeholder="0,00" /></div>
        <div><Lb mt={15} req>Precio máximo</Lb><input className="l-in" style={IN} inputMode="decimal" value={m.max} onChange={e => setM({ ...m, max: fmt(e.target.value) })} placeholder="0,00" /></div></div>
      <Lb mt={15} req>Valor predeterminado (fallback)</Lb><input className="l-in" style={IN} inputMode="decimal" value={m.def} onChange={e => setM({ ...m, def: fmt(e.target.value) })} placeholder="0,00" />
      <div style={{ fontSize: 12.5, color: m.def && err ? '#ef4444' : '#94a3b8', marginTop: 6 }}>{m.def && err ? err : 'Se usa cuando no hay otro valor definido. Debe ser mayor que cero.'}</div>
      <Foot onCancel={() => setM(null)} disabled={!m.name.trim() || !!err} label={m.id ? 'Guardar' : 'Crear'} onOk={() => { setList(x => m.id ? x.map(y => y.id === m.id ? m : y) : [...x, { ...m, name: m.name.trim(), id: uid() }]); toast(m.id ? 'Producto actualizado' : 'Producto creado'); setM(null) }} />
    </LModal>}
  </Card>
}

/* ---------------- Herramientas MCP ---------------- */
const genTok = () => { const a = new Uint8Array(24); crypto.getRandomValues(a); return 'mcp_' + Array.from(a, b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[b % 62]).join('') }
export function Mcp() {
  const toast = useToast(); const [creds, setCreds] = useStore('mcp_creds', []); const [q, setQ] = useState(''); const [m, setM] = useState(null); const [del, setDel] = useState(null)
  const URL_ = location.origin + '/mcp'
  const copy = (v, t) => { navigator.clipboard?.writeText(v); toast(t + ' copiado') }
  const rows = creds.filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
  const active = creds.some(c => c.status === 'active')
  const create = () => { const tok = m.type === 'static' ? genTok() : null; const exp = new Date(Date.now() + 90 * 864e5).toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: 'numeric' })
    setCreds(x => [{ id: uid(), name: m.name.trim(), type: m.type, status: m.type === 'static' ? 'active' : 'pending', prefix: tok ? tok.slice(0, 12) : null, exp: tok ? exp : '-', used: null }, ...x]); setM({ ...m, step: 2, tok }) }
  const Btn = ({ v, t }) => <button className="lb2 g" style={{ height: 41, minWidth: 81, fontSize: 13.3 }} onClick={() => copy(v, t)}>Copiar</button>
  const Ro = ({ v }) => <input readOnly className="l-in" style={{ ...IN, height: 41, fontWeight: 700, fontSize: 13.3 }} value={v} onFocus={e => e.target.select()} />
  return <>
    <div className="st-card" style={{ marginTop: 0, padding: '22px 22px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingBottom: 17, borderBottom: '1px solid var(--border)' }}>
        <button className="lp-btn" style={{ height: 33, fontSize: 12.5 }} onClick={() => setM({ step: 'info' })}><CircleHelpIc />¿Cómo usar?</button>
        <button className="lp-btn p" style={{ height: 33, fontSize: 12.5 }} onClick={() => setM({ step: 1, type: 'static', name: '' })}><Plus size={15} />Nueva credencial</button></div>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 17, paddingBottom: 15, borderBottom: '1px solid var(--border)' }}>
        <div><div style={{ fontSize: 14.2, fontWeight: 700 }}>Servidor MCP</div><div style={{ fontSize: 11.6, color: 'var(--soft)', marginTop: 6 }}>Use la URL y una credencial abajo para conectar su agente externo de IA.</div></div>
        <span className="pf-on" style={{ marginLeft: 'auto', marginTop: 0, height: 22, fontSize: 11.6, ...(active ? {} : { color: '#94a3b8', background: 'var(--chip)', borderColor: 'var(--border2)' }) }}><i style={active ? null : { background: '#94a3b8' }} />{active ? 'Credenciales activas' : 'Sin credenciales activas'}</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 19, marginTop: 15 }}>
        <div><div style={{ fontSize: 14.2, fontWeight: 600, marginBottom: 10 }}>URL</div>
          <div style={{ display: 'flex', gap: 9 }}><div className="pf-in" style={{ flex: 1 }}><Globe size={15} /><input readOnly value={URL_} style={{ background: 'var(--deep)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11.3, height: 37 }} /></div>
            <button className="lp-btn" style={{ width: 39, padding: 0, justifyContent: 'center' }} title="Copiar URL" onClick={() => copy(URL_, 'URL')}><Copy size={15} /></button></div>
          <div style={{ fontSize: 11.6, color: '#94a3b8', marginTop: 11, lineHeight: 1.65 }}>Cursor y n8n: token estático + Bearer.<br />Claude: OAuth, solo pegue la URL.</div></div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '18px 15px 16px' }}><div style={{ fontSize: 11.6, fontWeight: 700, letterSpacing: '.03em' }}>AUTENTICACIÓN</div>
          <div style={{ fontSize: 11.6, color: 'var(--text)', marginTop: 9 }}>Envíe su token en el encabezado Authorization como Bearer:</div>
          <code style={{ display: 'block', background: 'var(--btn3)', borderRadius: 3, padding: '7px 10px', marginTop: 10, fontSize: 9.8, fontWeight: 700 }}>Authorization: Bearer su-token</code></div>
      </div>
    </div>
    <div className="st-card" style={{ marginTop: 16, padding: '27px 19px 19px' }}>
      <div style={{ fontSize: 14.2, fontWeight: 700 }}>Credenciales</div><div style={{ fontSize: 11.6, color: 'var(--soft)', marginTop: 5 }}>Cree credenciales para Cursor, Claude, n8n y otros clientes MCP.</div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 6, height: 64, marginTop: 17, display: 'flex', alignItems: 'center', padding: '0 15px' }}><b style={{ fontSize: 11.6 }}>{creds.length} credencial(es)</b>
        <div className="lp-srch" style={{ marginLeft: 'auto', width: 224 }}><Search size={14} /><input style={{ height: 33, fontSize: 11.6 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar credencial..." /></div></div>
      {creds.length > 0 && <Tbl grid="1.3fr .9fr .8fr 1.1fr 1fr 80px" cols={['NOMBRE', 'TIPO', 'ESTADO', 'ÚLTIMO USO', 'EXPIRA', 'ACCIONES']} rows={rows.map(c => [
        <div style={{ padding: '9px 0' }}><b style={{ fontSize: 13.5 }}>{c.name}</b>{c.prefix && <div style={{ ...mono, fontWeight: 400, fontSize: 10.5, color: 'var(--soft)', marginTop: 3 }}>{c.prefix.slice(0, 12)}...</div>}</div>,
        <Badge c={c.type === 'static' ? '#60a5fa' : '#4d94ff'}>{c.type === 'static' ? 'Estático' : 'OAuth'}</Badge>,
        <span style={{ fontSize: 14, color: c.status === 'active' ? 'var(--text)' : '#f59e0b' }}>{c.status === 'active' ? 'Activa' : 'Pendiente'}</span>,
        <span style={{ fontSize: 14 }}>{c.used || 'Nunca usado'}</span>, <span style={{ fontSize: 14 }}>{c.exp}</span>,
        <button className="ch-ib" style={{ width: 28, height: 28, marginRight: 30 }} title="Revocar" onClick={() => setDel(c)}><Trash2 size={15} color="#ef4444" /></button>])} />}
      {creds.length > 0 && rows.length === 0 && <div style={{ padding: 18, textAlign: 'center', fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Ninguna credencial coincide.</div>}
    </div>
    {m?.step === 'info' && <LModal open onClose={() => setM(null)} title="¿Qué es Leona MCP?" width={479} bodyStyle={{ padding: '26px 24px 0' }}>
      <div style={{ display: 'flex', gap: 14, background: 'var(--in2)', border: '1px solid #1e3a8a', borderRadius: 7, padding: '17px 17px' }}><Sparkles size={20} color="#4d94ff" style={{ flexShrink: 0 }} /><div><b style={{ fontSize: 14.3 }}>Conectando inteligencia a sus datos</b><div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--soft)', marginTop: 4 }}>El Model Context Protocol (MCP) permite que agentes de IA interactúen con las herramientas y recursos de su cuenta Leona de forma segura.</div></div></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14.3, fontWeight: 700, marginTop: 22 }}><BookIc />¿Para qué sirve?</div>
      <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--soft)', marginTop: 12 }}>Con una credencial válida, clientes como Cursor y Claude pueden listar contactos, conexiones, flujos y ejecutar acciones permitidas por su cuenta.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14.3, fontWeight: 700, marginTop: 20 }}><ShieldIc />Buenas prácticas</div>
      {['Cree credenciales separadas por cliente y revoque las que no use.', 'Trate URL y tokens como contraseñas. Nunca los comparta públicamente.', 'Revogue de inmediato credenciales comprometidas o de colaboradores que salieron.', 'Use OAuth para Claude y token estático para Cursor/n8n.'].map(t => <p key={t} style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--soft)', marginTop: 10 }}>{t}</p>)}
      <div style={{ borderTop: '1px solid var(--border2)', marginTop: 22, padding: '16px 0', display: 'flex', justifyContent: 'flex-end' }}><button className="lb2 g" style={{ minWidth: 95 }} onClick={() => setM(null)}>Entendido</button></div>
    </LModal>}
    {m?.step === 1 && <LModal open onClose={() => setM(null)} title="Nueva credencial" width={430} bodyStyle={{ padding: '21px 22px 22px' }}>
      <div style={{ fontSize: 13.3, color: 'var(--soft)', marginBottom: 14 }}>Elija el tipo de autenticación.</div>
      {[['static', 'Token estático', 'Cursor, n8n y similares.'], ['oauth', 'OAuth', 'Claude.ai y Claude Desktop.']].map(([k, t, d]) => <button key={k} onClick={() => setM({ ...m, type: k })} style={{ display: 'block', width: '100%', textAlign: 'left', border: '1px solid ' + (m.type === k ? '#0b4eb7' : 'var(--border)'), boxShadow: m.type === k ? '0 0 0 1px #0b4eb7' : 'none', background: m.type === k ? 'var(--in2)' : 'var(--deep)', borderRadius: 7, padding: '13px 13px', marginBottom: 8 }}><b style={{ fontSize: 13.3 }}>{t}</b><div style={{ fontSize: 11.6, color: '#94a3b8', marginTop: 5 }}>{d}</div></button>)}
      <Lb mt={9}>Nombre</Lb><input className="l-in" style={IN} autoFocus value={m.name} onChange={e => setM({ ...m, name: e.target.value })} onKeyDown={e => e.key === 'Enter' && m.name.trim() && create()} placeholder="Ej.: Claude, Cursor" />
      <div style={{ display: 'flex', gap: 11, marginTop: 20 }}><button className="lb2 g" onClick={() => setM(null)}>Cancelar</button><button className="lb2 p" style={{ background: '#005ae3', minWidth: 72 }} disabled={!m.name.trim()} onClick={create}>Crear</button></div>
    </LModal>}
    {m?.step === 2 && <LModal open onClose={() => setM(null)} title="Nueva credencial" width={430} bodyStyle={{ padding: '22px 22px 20px' }}>
      {m.tok && <div className="wh-note" style={{ height: 'auto', padding: '13px 15px', marginTop: 0, fontSize: 13.3, fontWeight: 400 }}>Copie el token ahora. No se mostrará de nuevo.</div>}
      <Lb mt={m.tok ? 14 : 0}>URL</Lb><div style={{ display: 'flex', gap: 8 }}><Ro v={URL_} /><Btn v={URL_} t="URL" /></div>
      {m.tok ? <>
        <Lb mt={14}>Token</Lb><div style={{ display: 'flex', gap: 8 }}><Ro v={m.tok} /><Btn v={m.tok} t="Token" /></div>
        <div style={{ fontSize: 13.3, fontWeight: 600, marginTop: 13 }}>Conectar</div>
        <ul style={{ fontSize: 10.5, color: '#94a3b8', lineHeight: 1.7, margin: '6px 0 0 16px' }}><li>Cursor: Settings → MCP, URL + token</li><li>n8n: nodo MCP Client, URL + Bearer</li><li>Otros: header Authorization Bearer</li></ul>
      </> : <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.3, color: '#94a3b8', marginTop: 17 }}><Link2 size={15} />Esperando conexión</div>
        <div style={{ fontSize: 13.3, fontWeight: 700, marginTop: 17 }}>En Claude</div>
        <div style={{ fontSize: 11.6, color: '#94a3b8', lineHeight: 1.7, marginTop: 3 }}>1. Settings → Connectors → Add custom connector<br />2. Pegue la URL<br />3. Entre con su cuenta Leona<br />4. Autorice la credencial</div>
        <div style={{ fontSize: 11.6, color: '#94a3b8', marginTop: 12 }}>El estado cambia cuando Claude se conecte.</div></>}
      <button className="lb2 p" style={{ width: '100%', marginTop: 16 }} onClick={() => setM(null)}>Cerrar</button>
    </LModal>}
    <LModal open={!!del} onClose={() => setDel(null)} title="Revocar credencial" width={482} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55 }}>¿Revocar la credencial "{del?.name}"? Los clientes que la usen perderán el acceso.</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 13 }}><button className="lb2 g" onClick={() => setDel(null)}>Cancelar</button><button className="lb2 d" onClick={() => { setCreds(x => x.filter(c => c.id !== del.id)); setDel(null); toast('Credencial revocada') }}>Revocar</button></div>
    </LModal>
  </>
}
