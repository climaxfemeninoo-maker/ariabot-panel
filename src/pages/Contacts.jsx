import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Filter, History, Download, Upload, Plus, Search, Trash2, Pencil, ArrowLeft, MessageCircle, MessageSquare, ArrowUpDown, ChevronDown, Check, Save, TriangleAlert } from 'lucide-react'
import { useStore, useToast, uid, downloadCSV, useOutside } from '../ui'
import { LModal, LSelect } from './leona'
import { COUNTRIES, flagUrl, findCountry, UF } from './countries'

const AV = ['#004fc7', '#059669', '#d97706', '#db2777', '#0891b2', '#dc2626', '#4686e5']
const avc = s => AV[[...(s || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0) % AV.length]
const ini = n => (n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
const TAGC = { Venta: ['#1b3b6b', '#305ea3', '#4686e5'] }

export default function Contacts() {
  const toast = useToast(); const nav = useNavigate()
  const [list, setList] = useStore('contacts', [])
  const [, setChats] = useStore('chat_list', [])
  const [, setOpenChat] = useStore('chat_open', null)
  const [q, setQ] = useState(''); const [st, setSt] = useState('all'); const [or, setOr] = useState('all')
  const [recent, setRecent] = useState(false); const [asc, setAsc] = useState(true); const [sel, setSel] = useState([])
  const [modal, setModal] = useState(null); const [edit, setEdit] = useState(null); const [del, setDel] = useState(null)
  const [flt, setFlt] = useState({ tags: [], from: '', to: '' })
  const file = useRef()
  const [tagStore] = useStore('tags', [])
  const tagsAll = [...new Set([...tagStore.map(t => t.name), ...list.flatMap(c => c.tags || [])])]
  const rows = useMemo(() => {
    let r = list.filter(c => [c.name, c.phone, c.email].join(' ').toLowerCase().includes(q.toLowerCase())
      && (st === 'all' || (c.status || 'Lead') === st) && (or === 'all' || c.origin === or)
      && (!flt.tags.length || flt.tags.some(t => (c.tags || []).includes(t)))
      && (!flt.from || new Date(c.created || 0) >= new Date(flt.from + 'T00:00')) && (!flt.to || new Date(c.created || 0) < +new Date(flt.to + 'T00:00') + 864e5))
    r = [...r].sort(recent ? (a, b) => new Date(b.created || 0) - new Date(a.created || 0) : (a, b) => (asc ? 1 : -1) * (a.name || '').localeCompare(b.name || ''))
    return r
  }, [list, q, st, or, flt, recent, asc])
  const fOn = flt.tags.length || flt.from || flt.to
  const save = (c, openIt) => {
    if (c.id && list.some(x => x.id === c.id)) { setList(l => l.map(x => x.id === c.id ? c : x)); toast('Contacto actualizado') }
    else { c = { ...c, id: uid(), created: new Date().toISOString() }; setList(l => [c, ...l]); toast('Contacto creado') }
    setModal(null); setEdit(null); if (openIt) chat(c)
  }
  const chat = c => {
    let id
    setChats(cs => { const ex = cs.find(x => x.contactId === c.id); if (ex) { id = ex.id; return cs } id = uid(); return [{ id, contactId: c.id, name: c.name, phone: c.phone, tags: c.tags || [], status: 'atencion', agent: 'Pablo Monja Suclupe', unread: 0, last: Date.now(), msgs: [] }, ...cs] })
    setTimeout(() => { setOpenChat(id); nav('/chats') }, 0)
  }
  const importCSV = e => {
    const f = e.target.files[0]; if (!f) return
    f.text().then(t => {
      const lines = t.split(/\r?\n/).filter(Boolean); if (lines.length < 2) return toast('El archivo está vacío', 'err')
      const head = lines[0].toLowerCase().split(/[;,]/).map(s => s.replace(/"/g, '').trim())
      const idx = k => head.findIndex(h => k.some(x => h.includes(x)))
      const [iN, iP, iE, iT] = [idx(['nombre', 'name']), idx(['tel', 'phone', 'celular']), idx(['correo', 'email', 'mail']), idx(['etiqueta', 'tag'])]
      const add = lines.slice(1).map(l => { const c = l.split(/[;,]/).map(s => s.replace(/"/g, '').trim()); return { id: uid(), name: c[iN] || c[0] || 'Sin nombre', phone: c[iP] || '', email: iE >= 0 ? c[iE] : '', tags: iT >= 0 && c[iT] ? c[iT].split('|').map(s => s.trim()) : [], status: 'Lead', origin: 'Referido', created: new Date().toISOString() } })
      setList(l => [...add, ...l]); toast(`${add.length} contactos importados`)
    }); e.target.value = ''
  }
  const allSel = rows.length > 0 && rows.every(r => sel.includes(r.id))
  return <div className="lp">
    <div className="lp-hd"><Users size={22} strokeWidth={1.8} style={{ marginLeft: 2 }} />
      <div><h1>Contactos</h1><p>{list.length} contactos <span style={{ color: '#94a3b8' }}>•</span> <i>Será implementado</i> activos <span style={{ color: '#94a3b8' }}>•</span> <i>Será implementado</i> leads</p></div>
      <div className="r">
        {sel.length > 0 && <button className="lp-btn" style={{ color: '#ef4444' }} onClick={() => setDel('sel')}><Trash2 size={16} />Eliminar ({sel.length})</button>}
        <button className={'lp-btn' + (fOn ? ' on' : '')} onClick={() => setModal('filter')}><Filter size={16} />Filtros</button>
        <button className={'lp-btn' + (recent ? ' on' : '')} onClick={() => setRecent(!recent)}><History size={16} />Recientes</button>
        <button className="lp-btn" disabled={!list.length} onClick={() => { downloadCSV('contactos.csv', [['Nombre', 'Teléfono', 'Correo', 'Etiquetas', 'Estado', 'Origen'], ...rows.map(c => [c.name, c.phone, c.email || '', (c.tags || []).join('|'), c.status || 'Lead', c.origin || ''])]); toast('CSV exportado') }}><Download size={16} />Exportar CSV</button>
        <button className="lp-btn" onClick={() => file.current.click()}><Upload size={16} />Importar CSV</button><input ref={file} type="file" accept=".csv,text/csv" hidden onChange={importCSV} />
        <button className="lp-btn p" onClick={() => setModal('search')}><Plus size={17} />Nuevo contacto</button>
      </div></div>
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 21 }}>
      <div className="lp-srch" style={{ width: 540, maxWidth: '50%' }}><Search size={15} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar contacto..." /></div>
      <div className="lp-jsel" style={{ marginLeft: 'auto', marginRight: -15 }}>
        <LSelect value={st} onChange={setSt} bold style={{ width: 168 }} options={[['all', 'Todos los estados'], ['Activo', 'Activo'], ['Lead', 'Lead'], ['Inactivo', 'Inactivo']].map(([value, label]) => ({ value, label }))} />
        <LSelect value={or} onChange={setOr} bold style={{ width: 178 }} options={[['all', 'Todos los orígenes'], ['WhatsApp', 'WhatsApp'], ['Facebook', 'Facebook'], ['Instagram', 'Instagram'], ['Sitio web', 'Sitio web'], ['Referido', 'Referido']].map(([value, label]) => ({ value, label }))} />
      </div>
    </div>
    <div className="lp-card" style={{ marginTop: 11, minHeight: 'calc(100vh - 205px)' }}>
      {list.length === 0 ? <div className="ct-empty"><Users size={46} strokeWidth={1.8} className="big" /><h3>No hay contactos creados</h3><p>Cree su primer contacto para empezar a gestionar</p>
        <button className="lp-btn p" style={{ marginTop: 17 }} onClick={() => setModal('search')}><Plus size={16} />Crear primer contacto</button></div>
        : <table className="ct-tbl"><thead><tr>
          <th style={{ width: 52, paddingLeft: 16 }}><span className={'ct-cb' + (allSel ? ' on' : '')} onClick={() => setSel(allSel ? [] : rows.map(r => r.id))}>{allSel && <Check size={10} strokeWidth={3} />}</span></th>
          <th style={{ textTransform: 'none', letterSpacing: '.02em', color: '#8fa3c4', fontSize: 11.5, cursor: 'pointer' }} onClick={() => { setRecent(false); setAsc(!asc) }}>Nombre completo <ArrowUpDown size={11} style={{ verticalAlign: -1 }} /></th>
          <th>TELÉFONO</th><th>ETIQUETAS</th><th style={{ textAlign: 'right', paddingRight: 54 }}>ACCIONES</th></tr></thead>
          <tbody>{rows.map(c => <tr key={c.id} className={sel.includes(c.id) ? 'sel' : ''}>
            <td style={{ paddingLeft: 16 }}><span className={'ct-cb' + (sel.includes(c.id) ? ' on' : '')} onClick={() => setSel(s => s.includes(c.id) ? s.filter(x => x !== c.id) : [...s, c.id])}>{sel.includes(c.id) && <Check size={10} strokeWidth={3} />}</span></td>
            <td><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span className="ct-av" style={{ background: avc(c.name) }}>{ini(c.name)}</span><div><div className="ct-nm">{c.name}</div>{c.email && <div className="ct-em">{c.email}</div>}</div></div></td>
            <td style={{ fontSize: 13.8, letterSpacing: '.02em' }}>{(c.phone || '').replace(/\s+/g, '')}</td>
            <td>{(c.tags || []).length ? c.tags.map(t => <span key={t} className="ct-tag" style={TAGC[t] ? { background: TAGC[t][0], borderColor: TAGC[t][1], color: TAGC[t][2] } : null}>{t}</span>) : <span style={{ color: '#94a3b8' }}>-</span>}</td>
            <td><div className="ct-act" style={{ paddingRight: 12 }}>
              <button title="Abrir conversación" onClick={() => chat(c)}><MessageCircle size={16} color="#005ae3" /></button>
              <button title="Editar" onClick={() => { setEdit(c); setModal('form') }}><Pencil size={15} /></button>
              <button title="Eliminar" onClick={() => setDel(c)}><Trash2 size={15} color="#ef4444" /></button></div></td>
          </tr>)}</tbody></table>}
      {list.length > 0 && rows.length === 0 && <div style={{ textAlign: 'center', padding: 40, fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Ningún contacto coincide con la búsqueda o los filtros.</div>}
    </div>

    {modal === 'search' && <FindContact list={list} onClose={() => setModal(null)} onPick={c => { setEdit(c); setModal('form') }} onNew={() => { setEdit(null); setModal('form') }} />}
    {modal === 'form' && <ContactData init={edit} tags={tagsAll} onBack={() => setModal('search')} onClose={() => { setModal(null); setEdit(null) }} onSave={save} />}
    {modal === 'filter' && <LModal open onClose={() => setModal(null)} title="Filtros" desc="Filtra los contactos por etiquetas y fecha de creación" icon={<Filter size={19} />}
      footer={<><button className="lb2 g" onClick={() => { setFlt({ tags: [], from: '', to: '' }); setModal(null) }}>Limpiar</button><button className="lb2 p" onClick={() => setModal(null)}>Aplicar</button></>}>
      <label className="l-lbl">Etiquetas</label>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{tagsAll.length ? tagsAll.map(t => <button key={t} className={'kb-chip' + (flt.tags.includes(t) ? ' on' : '')} onClick={() => setFlt({ ...flt, tags: flt.tags.includes(t) ? flt.tags.filter(x => x !== t) : [...flt.tags, t] })}>{t}</button>) : <span style={{ fontSize: 12.5, color: '#94a3b8', fontStyle: 'italic' }}>Aún no hay etiquetas</span>}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
        <label><span className="l-lbl">Creado desde</span><input type="date" className="l-in ct-in" value={flt.from} onChange={e => setFlt({ ...flt, from: e.target.value })} /></label>
        <label><span className="l-lbl">Creado hasta</span><input type="date" className="l-in ct-in" value={flt.to} onChange={e => setFlt({ ...flt, to: e.target.value })} /></label></div>
    </LModal>}
    <LModal open={!!del} onClose={() => setDel(null)} title={del === 'sel' ? 'Eliminar contactos' : 'Eliminar contacto'} icon={<TriangleAlert size={21} color="#ef4444" />} width={482} bodyStyle={{ padding: '22px 24px 0' }}>
      <p style={{ fontSize: 14.3, lineHeight: 1.55 }}>{del === 'sel' ? `¿Eliminar ${sel.length} contactos seleccionados?` : `¿Eliminar el contacto "${del?.name}"?`} Esta acción no se puede deshacer.</p>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 13 }}>
        <button className="lb2 g" onClick={() => setDel(null)}>Cancelar</button>
        <button className="lb2 d" onClick={() => { const ids = del === 'sel' ? sel : [del.id]; setList(l => l.filter(x => !ids.includes(x.id))); setSel([]); setDel(null); toast(ids.length > 1 ? 'Contactos eliminados' : 'Contacto eliminado') }}>Eliminar</button></div>
    </LModal>
  </div>
}

function FindContact({ list, onClose, onPick, onNew }) {
  const [q, setQ] = useState('')
  const res = q.trim() ? list.filter(c => [c.name, c.phone, c.email].join(' ').toLowerCase().includes(q.toLowerCase())) : []
  return <LModal open onClose={onClose} title="Nuevo contacto" desc="Escriba para buscar contactos existentes" width={479} bodyStyle={{ padding: '22px 22px 18px' }}>
    <div className="l-ico"><Search size={15} /><input className="l-in soft" autoFocus style={{ borderColor: 'var(--p)', boxShadow: '0 0 0 2px rgba(0,90,227,.35)' }} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, teléfono o correo..." /></div>
    <div style={{ minHeight: 230 }}>
      {!q.trim() ? <div style={{ textAlign: 'center', fontSize: 13.3, color: '#94a3b8', paddingTop: 30 }}>Escriba para buscar contactos existentes</div>
        : res.length ? <div style={{ marginTop: 10 }}>{res.map(c => <button key={c.id} className="l-opt" style={{ height: 46 }} onClick={() => onPick(c)}><span className="ct-av" style={{ width: 30, height: 30, fontSize: 11, background: avc(c.name) }}>{ini(c.name)}</span>
          <span><span style={{ display: 'block' }}>{c.name}</span><span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 500 }}>{c.phone}{c.email ? ' · ' + c.email : ''}</span></span></button>)}</div>
          : <div style={{ textAlign: 'center', fontSize: 13.3, color: '#94a3b8', paddingTop: 30 }}>Ningún contacto encontrado</div>}
    </div>
    <button className="lb2 p" style={{ height: 41, padding: '0 18px' }} onClick={onNew}><Plus size={16} />Crear nuevo contacto</button>
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 19, paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}><button className="lb2 g" onClick={onClose}>Cancelar</button></div>
  </LModal>
}

function PhoneCode({ value, onChange }) {
  const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const ref = useRef(); useOutside(ref, () => setOpen(false))
  const c = findCountry(value)
  const list = COUNTRIES.filter(x => (x.code + ' ' + x.name).toLowerCase().includes(q.toLowerCase().trim()))
  const sorted = [...list.filter(x => x.iso === value), ...list.filter(x => x.iso !== value)]
  return <div className="l-sel" ref={ref} style={{ width: 100, flexShrink: 0 }}>
    <button type="button" className={'l-in ct-in l-selb' + (open ? ' open' : '')} style={{ fontWeight: 600, padding: '0 9px', borderColor: open ? 'var(--p)' : undefined }} onClick={() => { setOpen(!open); setQ('') }}>
      <img src={flagUrl(c.iso)} alt="" style={{ width: 17, height: 12, borderRadius: 1.5, objectFit: 'cover' }} onError={e => e.currentTarget.style.display = 'none'} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.code}</span><ChevronDown size={14} className="chev" /></button>
    {open && <div className="l-selm" style={{ width: 236, right: 'auto', padding: 0, maxHeight: 'none', overflow: 'hidden' }}>
      <div style={{ padding: 8 }}><div className="l-ico"><Search size={14} /><input className="l-in" autoFocus style={{ height: 32, fontSize: 12.5, borderColor: 'var(--p)' }} placeholder="Buscar país ou DDI..." value={q} onChange={e => setQ(e.target.value)} /></div></div>
      <div style={{ maxHeight: 250, overflowY: 'auto', padding: '0 0 4px', borderTop: '1px solid var(--border)' }}>
        {sorted.length === 0 && <div className="l-opt" style={{ color: '#94a3b8' }}>Nenhum país encontrado</div>}
        {sorted.map(x => <button type="button" key={x.iso} className={'l-opt' + (x.iso === value ? ' on' : '')} style={{ borderRadius: 0, height: 35, paddingLeft: 13 }} onClick={() => { onChange(x.iso); setOpen(false) }}>
          <img src={flagUrl(x.iso)} alt="" style={{ width: 17, height: 12, borderRadius: 1.5, objectFit: 'cover' }} onError={e => e.currentTarget.style.visibility = 'hidden'} />{x.code} {x.name}{x.iso === value && <Check size={15} style={{ marginLeft: 'auto' }} />}</button>)}
      </div></div>}
  </div>
}

function TagSel({ value, onChange, options }) {
  const [open, setOpen] = useState(false); const [n, setN] = useState(''); const ref = useRef(); useOutside(ref, () => setOpen(false))
  const all = [...new Set([...options, ...value])]
  const add = () => { const t = n.trim(); if (t && !value.includes(t)) onChange([...value, t]); setN('') }
  return <div className="l-sel" ref={ref}>
    <button type="button" className={'l-in ct-in l-selb' + (open ? ' open' : '')} style={{ color: value.length ? 'var(--text)' : '#94a3b8', borderColor: open ? 'var(--p)' : undefined }} onClick={() => setOpen(!open)}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value.length ? value.join(', ') : 'Seleccione etiquetas para este contacto...'}</span><ChevronDown size={15} className="chev" /></button>
    {open && <div className="l-selm">
      <div style={{ padding: 3 }}><input className="l-in" style={{ height: 30, fontSize: 12.5 }} autoFocus placeholder="Nueva etiqueta y Enter…" value={n} onChange={e => setN(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} /></div>
      {all.length === 0 && <div className="l-opt" style={{ color: '#94a3b8', fontWeight: 500 }}>No hay etiquetas todavía</div>}
      {all.map(t => <button type="button" key={t} className="l-opt" onClick={() => onChange(value.includes(t) ? value.filter(x => x !== t) : [...value, t])}>{t}{value.includes(t) && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--p)' }} />}</button>)}
    </div>}
  </div>
}

export function ContactData({ init, tags, onBack, onClose, onSave }) {
  const split = () => { if (!init?.phone) return { cc: 'br', num: '' }; const m = COUNTRIES.filter(c => init.phone.replace(/\s/g, '').startsWith(c.code)).sort((a, b) => b.code.length - a.code.length)[0]; return m ? { cc: m.iso, num: init.phone.replace(/\s/g, '').slice(m.code.length) } : { cc: 'br', num: init.phone } }
  const [f, setF] = useState(() => ({ name: init?.name || '', email: init?.email || '', ...split(), tags: init?.tags || [], state: init?.state || '', city: init?.city || '', cep: init?.cep || '', fields: init?.fields || [] }))
  const [addr, setAddr] = useState(!!(init?.state || init?.cep)); const [cf, setCf] = useState(!!init?.fields?.length)
  const c = findCountry(f.cc)
  const ok = f.name.trim() && f.num.replace(/\D/g, '').length >= 6
  const go = openIt => onSave({ ...(init || {}), name: f.name.trim(), email: f.email.trim(), phone: c.code + f.num.replace(/\D/g, ''), tags: f.tags, state: f.state, city: f.city, cep: f.cep, fields: f.fields.filter(x => x.k), status: init?.status || 'Lead', origin: init?.origin || 'WhatsApp' }, openIt)
  const Lb = ({ children, mt = 0 }) => <label className="l-lbl" style={{ marginTop: mt, color: 'var(--text)' }}>{children}</label>
  return <LModal open onClose={onClose} title="Datos del contacto" desc="Administre y organice sus contactos" width={615} bodyStyle={{ padding: '22px 22px 22px' }}>
    <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.3, color: 'var(--text)', marginBottom: 17 }}><ArrowLeft size={15} />Volver a la búsqueda</button>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
      <div><Lb>Nombre completo</Lb><input className="l-in ct-in" autoFocus={!init} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Nombre completo" /></div>
      <div><Lb>Correo</Lb><input className="l-in ct-in" type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="Correo del contacto" /></div>
      <div><Lb mt={17}>Teléfono</Lb><div style={{ display: 'flex', gap: 8 }}><PhoneCode value={f.cc} onChange={v => setF({ ...f, cc: v })} /><input className="l-in ct-in" inputMode="tel" value={f.num} onChange={e => setF({ ...f, num: e.target.value.replace(/[^\d ]/g, '') })} placeholder={f.cc === 'br' ? '8599999999' : '999999999'} /></div>
        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>{f.cc === 'br' ? 'DDD + número (10 u 11 dígitos)' : 'Número sin el código de país'}</div></div>
      <div><Lb mt={17}>Etiquetas</Lb><TagSel value={f.tags} onChange={v => setF({ ...f, tags: v })} options={tags} /></div>
    </div>
    <button className={'ct-sec' + (addr ? ' open' : '')} onClick={() => setAddr(!addr)}>Dirección<ChevronDown size={15} /></button>
    <div className="ct-sub">Estado, ciudad y código postal</div>
    {addr && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 15px', marginTop: 4 }}>
      <div><Lb mt={17}>Estado</Lb><LSelect className="l-in ct-in" value={f.state} onChange={v => setF({ ...f, state: v, city: '' })} options={UF.map(u => ({ value: u, label: u }))} placeholder="Selecione..." /></div>
      <div><Lb mt={17}>Ciudad</Lb><input className="l-in ct-in" disabled={!f.state} value={f.city} onChange={e => setF({ ...f, city: e.target.value })} placeholder={f.state ? 'Escriba la ciudad' : 'Selecione...'} /></div>
      <div><Lb mt={17}>CEP</Lb><input className="l-in ct-in" inputMode="numeric" value={f.cep} placeholder="00000-000" onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 8); setF({ ...f, cep: d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d }) }} /></div>
    </div>}
    <button className={'ct-sec' + (cf ? ' open' : '')} onClick={() => setCf(!cf)}>Campos personalizados<ChevronDown size={15} /></button>
    <div className="ct-sub">Añada campos personalizados para este contacto</div>
    {cf && <>{f.fields.map((x, i) => <div key={i} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <input className="l-in ct-in" placeholder="Nombre del campo" value={x.k} onChange={e => setF({ ...f, fields: f.fields.map((y, j) => j === i ? { ...y, k: e.target.value } : y) })} />
      <input className="l-in ct-in" placeholder="Valor" value={x.v} onChange={e => setF({ ...f, fields: f.fields.map((y, j) => j === i ? { ...y, v: e.target.value } : y) })} />
      <button className="ch-ib" style={{ height: 37, width: 37 }} onClick={() => setF({ ...f, fields: f.fields.filter((_, j) => j !== i) })}><Trash2 size={15} /></button></div>)}
      <button className="ct-dash" onClick={() => setF({ ...f, fields: [...f.fields, { k: '', v: '' }] })}><Plus size={15} />Añadir campo</button></>}
    <div style={{ height: 1, background: 'var(--border2)', margin: '24px 0 15px' }} />
    <div style={{ display: 'flex', gap: 9 }}>
      <button className="lb2 g" style={{ fontSize: 13 }} disabled={!ok} onClick={() => go(false)}><Save size={15} />Guardar contacto</button>
      <button className="lb2 p" style={{ fontSize: 13 }} disabled={!ok} onClick={() => go(true)}><MessageSquare size={15} />Guardar y abrir conversación</button>
    </div>
    <button className="lb2 g" style={{ marginTop: 13, minWidth: 0 }} onClick={onClose}>Cancelar</button>
  </LModal>
}
