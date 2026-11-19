import { useState, useRef } from 'react'
import { Users, Filter, History, Download, Upload, Plus, Search, Trash2, Pencil, ArrowLeft, MessageSquare } from 'lucide-react'
import { useStore, Modal, Select, Empty, useToast, uid, downloadCSV, Confirm, Menu } from '../ui'
import { useNavigate } from 'react-router-dom'

const ST = { Activo: 'b-green', Lead: 'b-violet', Cliente: 'b-amber', Inactivo: 'b-gray' }
const blank = { name: '', phone: '', email: '', status: 'Lead', origin: 'Manual', tags: '' }

export default function Contacts() {
  const toast = useToast(); const nav = useNavigate()
  const [list, setList] = useStore('contacts', [])
  const [q, setQ] = useState(''); const [st, setSt] = useState('all'); const [or, setOr] = useState('all'); const [recent, setRecent] = useState(false)
  const [modal, setModal] = useState(null); const [mq, setMq] = useState(''); const [form, setForm] = useState(blank); const [del, setDel] = useState(null); const [selected, setSelected] = useState([])
  const [filters, setFilters] = useState(false)
  const file = useRef()
  let rows = list.filter(c => (c.name + c.phone + c.email).toLowerCase().includes(q.toLowerCase()) && (st === 'all' || c.status === st) && (or === 'all' || c.origin === or))
  if (recent) rows = [...rows].sort((a, b) => b.ts - a.ts)
  const save = () => {
    if (!form.name || !form.phone) return toast('Nombre y teléfono son obligatorios', 'err')
    if (form.id) setList(l => l.map(c => c.id === form.id ? form : c)); else setList(l => [{ ...form, id: uid(), ts: Date.now(), created: new Date().toLocaleDateString('es-PE') }, ...l])
    toast(form.id ? 'Contacto actualizado' : 'Contacto creado'); setModal(null); setForm(blank)
  }
  const importCSV = e => {
    const f = e.target.files[0]; if (!f) return
    f.text().then(t => {
      const lines = t.split(/\r?\n/).filter(Boolean).slice(1)
      const added = lines.map(l => { const [name, phone, email] = l.split(',').map(x => x.replace(/"/g, '').trim()); return { ...blank, name, phone, email: email || '', origin: 'Importación', id: uid(), ts: Date.now(), created: new Date().toLocaleDateString('es-PE') } }).filter(c => c.name)
      setList(l => [...added, ...l]); toast(`${added.length} contactos importados`)
    }); e.target.value = ''
  }
  const found = mq ? list.filter(c => (c.name + c.phone + c.email).toLowerCase().includes(mq.toLowerCase())) : []
  return <div className="page">
    <div className="ph"><Users size={18} style={{ marginTop: 3 }} /><div><h1>Contactos</h1><p>{list.length} contactos • <i>{list.filter(c => c.status === 'Activo').length}</i> activos • <i>{list.filter(c => c.status === 'Lead').length}</i> leads</p></div>
      <div className="actions"><button className={'btn ' + (filters ? 'btn-o' : 'btn-g')} onClick={() => setFilters(!filters)}><Filter size={13} />Filtros</button>
        <button className={'btn ' + (recent ? 'btn-o' : 'btn-g')} onClick={() => setRecent(!recent)}><History size={13} />Recientes</button>
        <button className="btn btn-g" disabled={!list.length} style={{ opacity: list.length ? 1 : .5 }} onClick={() => downloadCSV('contactos.csv', [['Nombre', 'Teléfono', 'Correo', 'Estado', 'Origen'], ...list.map(c => [c.name, c.phone, c.email, c.status, c.origin])])}><Download size={13} />Exportar CSV</button>
        <button className="btn btn-g" onClick={() => file.current.click()}><Upload size={13} />Importar CSV</button><input ref={file} type="file" accept=".csv" hidden onChange={importCSV} />
        <button className="btn btn-p" onClick={() => { setModal('search'); setMq('') }}><Plus size={14} />Nuevo contacto</button></div></div>
    <div className="row" style={{ marginBottom: 14, flexWrap: 'wrap' }}><div className="search" style={{ width: 300 }}><Search size={13} /><input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar contacto..." /></div><span className="sp" />
      <Select value={st} onChange={setSt} right options={[{ value: 'all', label: 'Todos los estados' }, ...Object.keys(ST)]} />
      <Select value={or} onChange={setOr} right options={[{ value: 'all', label: 'Todos los orígenes' }, 'Manual', 'WhatsApp', 'Importación', 'Facebook']} /></div>
    {filters && <div className="card" style={{ padding: 14, marginBottom: 14, animation: 'pop .25s' }}><div className="row" style={{ flexWrap: 'wrap', gap: 6 }}><span className="small muted">Filtros rápidos:</span>{Object.keys(ST).map(s => <button key={s} className={'chip' + (st === s ? ' on' : '')} onClick={() => setSt(st === s ? 'all' : s)}>{s}</button>)}<button className="chip" onClick={() => { setSt('all'); setOr('all'); setQ('') }}>Limpiar</button></div></div>}
    <div className="card" style={{ padding: 10 }}>
      {rows.length ? <div className="tbl-wrap"><table className="tbl"><thead><tr><th><input type="checkbox" style={{ accentColor: '#8b5cf6' }} checked={selected.length === rows.length} onChange={e => setSelected(e.target.checked ? rows.map(r => r.id) : [])} /></th>{['Nombre', 'Teléfono', 'Correo', 'Estado', 'Origen', 'Etiquetas', 'Creado', ''].map(t => <th key={t}>{t}</th>)}</tr></thead>
        <tbody>{rows.map((c, i) => <tr key={c.id} style={{ animationDelay: i * .03 + 's' }}><td><input type="checkbox" style={{ accentColor: '#8b5cf6' }} checked={selected.includes(c.id)} onChange={e => setSelected(s => e.target.checked ? [...s, c.id] : s.filter(x => x !== c.id))} /></td>
          <td><div className="row"><div className="chat-av" style={{ width: 26, height: 26, fontSize: 11, background: '#8b5cf6' }}>{c.name[0]}</div><b>{c.name}</b></div></td><td>{c.phone}</td><td className="muted">{c.email || '—'}</td>
          <td><span className={'badge ' + ST[c.status]}>{c.status.toUpperCase()}</span></td><td>{c.origin}</td><td>{c.tags ? c.tags.split(',').map(t => <span key={t} className="badge b-gray" style={{ marginRight: 3 }}>{t.trim()}</span>) : '—'}</td><td className="muted">{c.created}</td>
          <td><div className="row" style={{ gap: 2 }}><button className="icon-btn" title="Chatear" onClick={() => nav('/chats')}><MessageSquare size={13} /></button><button className="icon-btn" onClick={() => { setForm(c); setModal('form') }}><Pencil size={13} /></button><button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => setDel(c.id)}><Trash2 size={13} /></button></div></td></tr>)}</tbody></table>
        {selected.length > 0 && <div className="row" style={{ padding: 10, borderTop: '1px solid var(--border)' }}><span className="small">{selected.length} seleccionados</span><button className="btn btn-d btn-sm" onClick={() => { setList(l => l.filter(c => !selected.includes(c.id))); setSelected([]); toast('Contactos eliminados') }}><Trash2 size={12} />Eliminar</button></div>}</div>
        : <div style={{ border: '1px solid var(--border)', borderRadius: 8 }}><Empty icon={<Users size={30} />} title={list.length ? 'Sin resultados' : 'No hay contactos creados'} text={list.length ? 'Pruebe con otros filtros' : 'Cree su primer contacto para empezar a gestionar'} action={!list.length && <button className="btn btn-p" onClick={() => { setForm(blank); setModal('form') }}><Plus size={14} />Crear primer contacto</button>} /></div>}
    </div>
    <Modal open={modal === 'search'} onClose={() => setModal(null)} title="Nuevo contacto" sub="Escriba para buscar contactos existentes" footer={<button className="btn btn-g" onClick={() => setModal(null)}>Cancelar</button>}>
      <div className="search"><Search size={13} /><input className="input" autoFocus value={mq} onChange={e => setMq(e.target.value)} placeholder="Buscar por nombre, teléfono o correo..." style={{ borderColor: 'var(--p)' }} /></div>
      <div style={{ minHeight: 110, padding: '14px 0' }}>{!mq ? <p className="muted" style={{ textAlign: 'center' }}>Escriba para buscar contactos existentes</p> : found.length ? found.map(c => <div key={c.id} className="dd-item" onClick={() => { setForm(c); setModal('form') }}><b>{c.name}</b><span className="muted">{c.phone}</span></div>) : <p className="muted" style={{ textAlign: 'center' }}>Ningún contacto encontrado</p>}</div>
      <button className="btn btn-p" onClick={() => { setForm({ ...blank, name: /\d/.test(mq) ? '' : mq, phone: /\d/.test(mq) ? mq : '' }); setModal('form') }}><Plus size={14} />Crear nuevo contacto</button></Modal>
    <Modal open={modal === 'form'} onClose={() => setModal(null)} title={form.id ? 'Editar contacto' : 'Crear contacto'} icon={<Users size={18} />}
      footer={<>{!form.id && <button className="btn btn-g" onClick={() => setModal('search')}><ArrowLeft size={13} />Volver</button>}<button className="btn btn-g" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-p" onClick={save}>Guardar</button></>}>
      <div className="grid g2">{[['name', 'Nombre *'], ['phone', 'Teléfono *'], ['email', 'Correo'], ['tags', 'Etiquetas (separadas por coma)']].map(([k, l]) => <div className="field" key={k}><label className="lb">{l}</label><input className="input" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>)}
        <div className="field"><label className="lb">Estado</label><select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{Object.keys(ST).map(s => <option key={s}>{s}</option>)}</select></div>
        <div className="field"><label className="lb">Origen</label><select className="input" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })}>{['Manual', 'WhatsApp', 'Importación', 'Facebook'].map(s => <option key={s}>{s}</option>)}</select></div></div></Modal>
    <Confirm open={!!del} onClose={() => setDel(null)} onOk={() => { setList(l => l.filter(c => c.id !== del)); toast('Contacto eliminado') }} title="Eliminar contacto" />
  </div>
}
