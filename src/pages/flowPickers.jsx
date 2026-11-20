import { useState, useRef, useMemo } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { useStore, useOutside } from '../ui'

/* Variables del sistema (iguales a Leona) */
export const SYS_VARS = [['full_name', 'Nombre completo'], ['first_name', 'Primer nombre'], ['created_at', 'Fecha de creación del contacto (dd/MM/aaaa HH:mm:ss, São Paulo)'], ['phone_number', 'Teléfono'], ['attendant_name', 'Nombre del agente activo'],
  ['user_email', 'Correo de inicio de sesión del titular de la cuenta (owner). Solo lectura; use {user_email} en textos'], ['instance_number', 'Número de instancia'], ['instance_name', 'Nombre de la instancia (conexión)'],
  ['hora', 'Hora (HH:mm)'], ['data', 'Fecha (dd/MM)'], ['dia', 'Día de la semana'], ['saudacao', 'Saludo (buenos días/tardes/noches)'], ['greeting', 'Saludo en inglés (Good morning/afternoon/evening)'], ['saludo', 'Saludo en español (Buenos días/tardes/noches)'],
  ['salutation', 'Saludo en francés (Bonjour/Bon après-midi/Bonsoir)'], ['saluto', 'Saludo en italiano (Buongiorno/Buon pomeriggio/Buonasera)'], ['response.type', 'Tipo de respuesta (MIME)'], ['response.erro', 'Error de integración'],
  ['ai.response', 'Respuesta de la IA'], ['ai.fail.reason', 'Motivo del fallo de la IA'], ['ai.erro', 'Error de la IA'], ['gateway.transaction_id', 'Gateway · transaction_id'], ['gateway.payment_link', 'Gateway · link de checkout (COP)'],
  ['gateway.payment_code', 'Gateway · código de pago (PIX/CLABE/COP)'], ['gateway.payment_llave', 'Gateway · llave Bre-B (COP)'], ['gateway.payment_qrcode', 'Gateway · QR Code (Bre-B COP)'], ['gateway.value', 'Gateway · valor pagado'], ['gateway.erro', 'Gateway · error (código)'],
  ['comprovante.nome_recebedor', 'Comprobante: nombre del beneficiario'], ['comprovante.nome_pagador', 'Comprobante: nombre del pagador'], ['comprovante.valor', 'Comprobante: monto'], ['comprovante.currency', 'Comprobante: moneda'], ['comprovante.banco', 'Comprobante: banco'],
  ['comprovante.data', 'Comprobante: fecha'], ['comprovante.doc_pagador', 'Comprobante: documento del pagador'], ['comprovante.doc_recebedor', 'Comprobante: documento del beneficiario'], ['comprovante.chave_pix', 'Comprobante: clave Pix'],
  ['comprovante.pix_valido', 'Comprobante: clave Pix válida'], ['comprovante.pix_similaridade', 'Comprobante: similaridad de clave Pix (%)'], ['comprovante.recebedor_valido', 'Comprobante: beneficiario válido'],
  ['comprovante.recebedor_similaridade', 'Comprobante: similaridad del beneficiario (%)'], ['comprovante.valido', 'Comprobante: validación general (clave y nombre)']]
const ADS_VARS = [['ctwa_clid', 'CTWA Click ID'], ['source_url', 'Source URL'], ['source_id', 'Source ID'], ['media_url', 'Media URL'], ['thumbnail_url', 'Thumbnail URL']]

export function VarPicker({ onPick, onClose, right = true, up }) {
  const [q, setQ] = useState(''); const ref = useRef(); useOutside(ref, onClose)
  const [gv] = useStore('set_vars', []); const [cf] = useStore('custom_fields', [])
  const k = q.toLowerCase(); const f = list => list.filter(([a, b]) => (a + ' ' + (b || '')).toLowerCase().includes(k))
  const secs = [['Variables del sistema', f(SYS_VARS)], ['Anuncios (lead)', f(ADS_VARS)], ['Variables globales', f((Array.isArray(gv) ? gv : []).map(v => [v.key, v.desc || '']))], [`Campos personalizados (${Array.isArray(cf) ? cf.length : 0})`, f((Array.isArray(cf) ? cf : []).map(c => [c.name, c.desc || '']))]]
  return <div ref={ref} className={'vp' + (up ? ' up' : '')} style={right ? { right: 0 } : { left: 0 }} onMouseDown={e => e.stopPropagation()}>
    <div className="vp-s"><Search size={15} /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar variable..." /></div>
    <div className="vp-l">{secs.map(([t, l]) => <div key={t}><div className="vp-t">{t}</div>{l.length ? l.map(([a, b]) => <button key={t + a} onClick={() => { onPick('{' + a + '}'); onClose() }}><code>{'{' + a + '}'}</code>{b && <span>{b}</span>}</button>) : <div className="vp-e">{q ? 'Sin coincidencias' : t.startsWith('Variables globales') ? 'Aún no hay variables globales. Créalas en Configuración › Variables globales.' : 'Sin elementos'}</div>}</div>)}</div>
  </div>
}

const EMO = '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 😶 😐 😑 😬 🙄 😯 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠 👋 🤚 ✋ 👌 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 👏 🙌 👐 🤲 🙏 💪 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💔 💕 💞 💓 💗 💖 💘 💝 ✨ ⭐ 🌟 🔥 💯 ✅ ❌ ⚠️ 📌 📍 📎 📝 📞 📱 💬 💰 💵 💳 🎁 🎉 🎊 🛒 📦 🚚 ⏰ 📅 🔔 👉 🆕 🆓 🔝'.split(' ')
export function EmojiPicker({ onPick, onClose }) {
  const ref = useRef(); useOutside(ref, onClose)
  return <div ref={ref} className="ep" onMouseDown={e => e.stopPropagation()}>{EMO.map((e, i) => <button key={i} onClick={() => onPick(e)}>{e}</button>)}</div>
}

export const CURRENCIES = [['BRL', 'real brasileño'], ['USD', 'dólar estadounidense'], ['MXN', 'peso mexicano'], ['ARS', 'peso argentino'], ['COP', 'peso colombiano'], ['AED', 'dírham de los Emiratos Árabes Unidos'], ['AUD', 'dólar australiano'], ['BOB', 'boliviano'], ['CAD', 'dólar canadiense'], ['CHF', 'franco suizo'], ['CLP', 'peso chileno'], ['CNY', 'yuan chino'], ['CRC', 'colón costarricense'], ['CZK', 'corona checa'], ['DKK', 'corona danesa'], ['DOP', 'peso dominicano'], ['EUR', 'euro'], ['GBP', 'libra esterlina'], ['GTQ', 'quetzal guatemalteco'], ['HKD', 'dólar hongkonés'], ['HNL', 'lempira hondureño'], ['ILS', 'nuevo séquel israelí'], ['INR', 'rupia india'], ['JPY', 'yen japonés'], ['KRW', 'won surcoreano'], ['NIO', 'córdoba nicaragüense'], ['NOK', 'corona noruega'], ['NZD', 'dólar neozelandés'], ['PAB', 'balboa panameño'], ['PEN', 'sol peruano'], ['PHP', 'peso filipino'], ['PLN', 'esloti polaco'], ['PYG', 'guaraní paraguayo'], ['RUB', 'rublo ruso'], ['SEK', 'corona sueca'], ['SGD', 'dólar singapurense'], ['THB', 'bat tailandés'], ['TRY', 'lira turca'], ['TWD', 'nuevo dólar taiwanés'], ['UYU', 'peso uruguayo'], ['VES', 'bolívar venezolano'], ['ZAR', 'rand sudafricano']]
export function CurrencyPicker({ onPick, onClose }) {
  const [q, setQ] = useState(''); const ref = useRef(); useOutside(ref, onClose)
  const l = CURRENCIES.filter(([a, b]) => (a + ' ' + b).toLowerCase().includes(q.toLowerCase()))
  return <div ref={ref} className="vp" style={{ right: 0 }} onMouseDown={e => e.stopPropagation()}><div className="vp-s"><Search size={15} /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar moneda..." /></div>
    <div className="vp-l">{!q && <><div className="vp-t">Más usadas</div>{CURRENCIES.slice(0, 5).map(([a, b]) => <button key={'m' + a} onClick={() => { onPick(a); onClose() }}><code>{a}</code><span>{b}</span></button>)}</>}
      <div className="vp-t">Todas las monedas ({CURRENCIES.length})</div>{l.map(([a, b]) => <button key={a} onClick={() => { onPick(a); onClose() }}><code>{a}</code><span>{b}</span></button>)}</div></div>
}
export const curName = c => CURRENCIES.find(x => x[0] === c)?.[1]

/* botón + popover listo para insertar */
export function PickBtn({ kind = 'var', onPick, children, title, className, up }) {
  const [o, setO] = useState(false)
  return <span style={{ position: 'relative', display: 'inline-flex' }}><button type="button" className={className + (o ? ' on' : '')} title={title} onClick={() => setO(!o)}>{children}</button>
    {o && (kind === 'var' ? <VarPicker up={up} onPick={onPick} onClose={() => setO(false)} /> : kind === 'emoji' ? <EmojiPicker onPick={e => onPick(e)} onClose={() => setO(false)} /> : <CurrencyPicker onPick={onPick} onClose={() => setO(false)} />)}</span>
}
