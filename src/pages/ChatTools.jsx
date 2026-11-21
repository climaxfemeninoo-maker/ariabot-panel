import { useState, useRef } from 'react'
import { Search, Clock, Smile, Cat, Pizza, Bus, Trophy, Shirt, Music, Flag, Play, X, Check, Workflow, Zap } from 'lucide-react'
import { useStore, useOutside } from '../ui'
import { SEED_FLOWS } from './Flows'

/* Doble check estilo WhatsApp */
export const Ticks = ({ read = true, size = 16 }) => <svg className={'tk' + (read ? ' rd' : '')} width={size} height={size * .7} viewBox="0 0 18 12.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1.2 6.9 4.6 10.2 11.4 2.2" /><path d="M7.4 9.4 8.3 10.2 15.6 2.2" /></svg>

const sp = s => s.split(' ')
const CATS = [
  ['rec', 'Recientes', Clock, []],
  ['ppl', 'Personas y cuerpo', Smile, sp('😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 🫠 😉 😊 😇 🥰 😍 🤩 😘 😗 ☺️ 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🫢 🫣 🤫 🤔 🫡 🤐 🤨 😐 😑 😶 🫥 😏 😒 🙄 😬 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🥵 🥶 🥴 😵 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 🫤 😟 🙁 😮 😯 😲 😳 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 💩 🤡 👻 👽 🤖 👋 🤚 🖐️ ✋ 🖖 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 🫵 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 💪 🧠 👀 👁️ 👄 💋 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝')],
  ['ani', 'Animales y naturaleza', Cat, sp('🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 🐢 🐍 🦎 🐙 🦑 🦐 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🐘 🦒 🐪 🐄 🐎 🐖 🐑 🐐 🦌 🐕 🐈 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🍁 🍂 🍃 🌷 🌹 🥀 🌺 🌸 🌼 🌻 🌞 🌝 🌛 🌙 ⭐ 🌟 ✨ ⚡ 🔥 🌈 ☀️ ⛅ ☁️ 🌧️ ⛈️ ❄️ ☃️ 💧 🌊')],
  ['food', 'Comida y bebida', Pizza, sp('🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🌽 🥕 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🧀 🥚 🍳 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🥪 🌮 🌯 🥗 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍙 🍚 🍰 🎂 🧁 🍮 🍭 🍬 🍫 🍿 🍩 🍪 ☕ 🍵 🧃 🥤 🧋 🍺 🍻 🥂 🍷 🍸 🍹 🧉')],
  ['trv', 'Viajes y lugares', Bus, sp('🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🏍️ 🛵 🚲 🛴 🚨 🚔 🚍 🚘 🚖 ✈️ 🛫 🛬 🚀 🛸 🚁 ⛵ 🚤 🛳️ 🚢 ⚓ 🗺️ 🗽 🗼 🏰 🏯 🏟️ 🎡 🎢 🎠 ⛲ 🏖️ 🏝️ 🏜️ 🌋 ⛰️ 🏔️ 🏕️ 🏠 🏡 🏢 🏬 🏦 🏨 🏪 🏫 🏥 ⛪ 🕌 🌅 🌄 🌇 🌆 🌃 🌉')],
  ['act', 'Actividades', Trophy, sp('⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🎱 🏓 🏸 🥊 🥋 ⛳ 🏹 🎣 🤿 🎽 🛹 🛼 ⛸️ 🎿 🏂 🏋️ 🤸 ⛹️ 🤾 🏌️ 🏇 🧘 🏄 🏊 🚴 🏆 🥇 🥈 🥉 🏅 🎖️ 🎗️ 🎫 🎟️ 🎪 🎭 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🎻 🎲 ♟️ 🎯 🎳 🎮 🧩 🎉 🎊 🎁 🎈')],
  ['obj', 'Objetos', Shirt, sp('⌚ 📱 💻 ⌨️ 🖥️ 🖨️ 🖱️ 💽 💾 💿 📷 📸 📹 🎥 📞 ☎️ 📺 📻 ⏰ ⏳ 📡 🔋 🔌 💡 🔦 🕯️ 💸 💵 💴 💶 💷 💰 💳 💎 ⚖️ 🔧 🔨 🛠️ ⚙️ 🔒 🔓 🔑 🗝️ 📦 📫 📮 📝 📁 📂 📅 📆 📌 📍 ✂️ 🖊️ ✏️ 🔍 🔎 👕 👖 👔 👗 👙 👠 👟 👜 👛 🎒 👑 🧢 👓 🕶️ 💍 💄')],
  ['sym', 'Símbolos', Music, sp('✅ ☑️ ✔️ ❌ ❎ ➕ ➖ ➗ ✖️ ♾️ ‼️ ⁉️ ❓ ❔ ❕ ❗ 〰️ 💯 🔟 🔢 #️⃣ *️⃣ ▶️ ⏸️ ⏹️ ⏺️ ⏭️ ⏮️ ⏩ ⏪ 🔀 🔁 🔂 🔼 🔽 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ 🔄 🆗 🆕 🆓 🆒 🆙 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟥 🟧 🟨 🟩 🟦 🟪 ⬛ ⬜ 🔶 🔷 🔸 🔹 💲 ©️ ®️ ™️ ⚠️ 🚫 ⛔ 📢 🔔 🔕 💬 💭 🗯️')],
  ['flag', 'Banderas', Flag, sp('🏁 🚩 🎌 🏴 🏳️ 🏳️‍🌈 🇵🇪 🇲🇽 🇨🇴 🇦🇷 🇨🇱 🇧🇷 🇪🇨 🇧🇴 🇵🇾 🇺🇾 🇻🇪 🇨🇷 🇵🇦 🇬🇹 🇭🇳 🇸🇻 🇳🇮 🇩🇴 🇨🇺 🇵🇷 🇺🇸 🇨🇦 🇪🇸 🇵🇹 🇫🇷 🇮🇹 🇩🇪 🇬🇧 🇯🇵 🇨🇳 🇰🇷 🇮🇳')],
]
const NAMES = { '😀': 'sonrisa feliz', '😂': 'risa lagrimas', '❤️': 'corazon amor', '👍': 'ok bien like pulgar', '🙏': 'gracias por favor', '🔥': 'fuego', '🎉': 'fiesta celebrar', '✅': 'check listo', '💰': 'dinero', '💵': 'dinero billete', '😍': 'enamorado', '😊': 'feliz', '👋': 'hola saludo', '😢': 'triste', '😡': 'enojado', '🤔': 'pensar', '👏': 'aplausos', '💪': 'fuerza', '🚀': 'cohete', '⭐': 'estrella', '📦': 'paquete envio', '🛒': 'compra', '💳': 'tarjeta pago', '📱': 'celular telefono', '⏰': 'alarma hora', '🎁': 'regalo', '🇵🇪': 'peru', '🇲🇽': 'mexico', '🇨🇴': 'colombia' }

export function EmojiPanel({ onPick, onClose }) {
  const ref = useRef(); useOutside(ref, onClose)
  const [rec, setRec] = useStore('emoji_recent', [])
  const [q, setQ] = useState(''); const [cat, setCat] = useState('ppl'); const body = useRef()
  const recent = Array.isArray(rec) ? rec : []
  const pick = e => { setRec([e, ...recent.filter(x => x !== e)].slice(0, 24)); onPick(e) }
  const go = k => { setCat(k); const el = body.current?.querySelector('[data-c="' + k + '"]'); if (el) body.current.scrollTo({ top: el.offsetTop - 6, behavior: 'smooth' }) }
  const k = q.trim().toLowerCase()
  const found = k ? CATS.slice(1).flatMap(c => c[3]).filter(e => (NAMES[e] || '').includes(k) || c2n(e).includes(k)) : null
  return <div ref={ref} className="emp" onMouseDown={e => e.stopPropagation()}>
    <div className="emp-s"><Search size={15} /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar emoji..." />{q && <button onClick={() => setQ('')}><X size={13} /></button>}</div>
    {!k && <div className="emp-t">{CATS.map(([id, t, Ic]) => <button key={id} title={t} className={cat === id ? 'on' : ''} onClick={() => go(id)}><Ic size={17} /></button>)}</div>}
    <div className="emp-b" ref={body} onScroll={e => { if (k) return; const st = e.currentTarget.scrollTop; let cur = cat; e.currentTarget.querySelectorAll('[data-c]').forEach(s => { if (s.offsetTop - 30 <= st) cur = s.dataset.c }); if (cur !== cat) setCat(cur) }}>
      {k ? (found.length ? <div className="emp-g">{found.map((e, i) => <button key={i} onClick={() => pick(e)}>{e}</button>)}</div> : <div className="emp-n">No se encontraron emojis</div>)
        : CATS.map(([id, t, , list]) => { const l = id === 'rec' ? recent : list; if (!l.length) return null
          return <div key={id} data-c={id}><div className="emp-h">{t}</div><div className="emp-g">{l.map((e, i) => <button key={i} onClick={() => pick(e)}>{e}</button>)}</div></div> })}
    </div>
  </div>
}
const c2n = e => { for (const [, t, , l] of CATS) if (l.includes(e)) return t.toLowerCase(); return '' }

/* Seleccionar flujo para enviarlo o fijarlo en la barra rápida */
export function FlowPicker({ pinned, onToggle, onRun, onClose }) {
  const [flows] = useStore('flows', SEED_FLOWS); const [q, setQ] = useState('')
  const list = (Array.isArray(flows) ? flows : []).filter(f => f.status !== 'archivado' && f.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name))
  return <div className="lm-ov" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="lm fp" style={{ maxWidth: 560 }}>
    <div className="lm-h c"><span className="ic"><Workflow size={19} /></span><div><h2>Seleccionar flujo</h2></div><button className="x" onClick={onClose}><X size={18} /></button></div>
    <div className="lm-b" style={{ padding: '14px 20px 8px' }}>
      <p className="fp-d">Haz clic en un flujo para agregarlo a la barra rápida o usa el botón de reproducir para enviarlo ahora.</p>
      <div className="fp-s"><Search size={16} /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar flujo" /></div>
      <div className="fp-l">{list.length ? list.map(f => { const on = pinned.includes(f.id); return <div key={f.id} className={'fp-i' + (on ? ' on' : '')} onClick={() => onToggle(f.id)}>
        <span className="dt" style={{ background: f.status === 'activo' ? '#22c55e' : '#f59e0b' }} />
        <div style={{ flex: 1, minWidth: 0 }}><b>{f.name}</b><small>{on ? <><Check size={12} strokeWidth={3} />En la barra rápida · clic para quitar</> : 'Haz clic para agregar'}</small></div>
        <button className="pl" title="Enviar ahora" onClick={e => { e.stopPropagation(); onRun(f) }}><Play size={14} fill="currentColor" /></button></div> })
        : <div className="fp-n"><Zap size={26} />{q ? 'Ningún flujo coincide con la búsqueda' : 'Aún no tienes flujos creados'}</div>}</div>
    </div>
    <div className="lm-f"><button className="lb2 g" onClick={onClose}>Cerrar</button></div>
  </div></div>
}
