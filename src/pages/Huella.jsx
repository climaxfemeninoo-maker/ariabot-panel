import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, Briefcase, Users, TrendingUp, Trophy, Target, Zap, Shield, Gem, Crown, Lock, X, Minus, Plus, CircleHelp, ArrowLeft } from 'lucide-react'
import { useStore, useToast, uid } from '../ui'
import { PawIcon } from '../icons'

const brl = v => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
const brl0 = v => 'R$ ' + v.toLocaleString('pt-BR')
export const LEVELS = [
  [50000, 'Instinto em Ação', Trophy, 'O primeiro passo na selva. A operação começa a ganhar estrutura e o instinto se traduz em execuções rápidas e precisas.'],
  [100000, 'Novo Predador', Target, 'Presença confirmada. O mercado começa a notar sua força. A operação sai do amadorismo e constrói tração real.'],
  [250000, 'Ritmo de Caça', Zap, 'Consistência e velocidade. O crescimento não é por acaso, é estrutura. A demanda é gerada de forma ativa e constante.'],
  [500000, 'Força Instintiva', Shield, 'Domínio de território. A operação roda com potência e resiliência, adaptando-se e crescendo mesmo com as mudanças do mercado.'],
  [1000000, 'Topo da Cadeia', Gem, 'Liderança e escala. O faturamento milionário é reflexo de uma engrenagem operacional perfeita e de escala contínua.'],
  [2000000, 'Lenda Viva', Crown, 'Domínio absoluto. A consolidação de um império comercial que dita o ritmo e as regras do seu mercado.'],
]
const useRevenue = () => { const [sl] = useStore('sales', []); const sales = Array.isArray(sl) ? sl : []; return sales.reduce((a, s) => a + (+s.value || 0), 0) }

export function HuellaModal({ open, onClose }) {
  const nav = useNavigate()
  const [contacts] = useStore('contacts', []); const [co] = useStore('companyData', { name: 'Empresa Pablo Monja Suclupe' })
  const rev = useRevenue()
  if (!open) return null
  const cur = [...LEVELS].reverse().find(l => rev >= l[0]); const next = LEVELS.find(l => rev < l[0])
  const prev = cur ? cur[0] : 0; const pct = next ? Math.min(100, (rev - prev) / (next[0] - prev) * 100) : 100
  const Stat = ({ l, ic: Ic, c, children }) => <div style={{ border: '1px solid var(--border)', borderRadius: 7, padding: '20px 17px 18px', minWidth: 0 }}><div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}><span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', color: '#94a3b8', lineHeight: 1.4 }}>{l}</span><Ic size={14} color={c} style={{ marginLeft: 'auto', flexShrink: 0 }} /></div><div style={{ marginTop: 12 }}>{children}</div></div>
  return <div className="lm-ov" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="lm" style={{ maxWidth: 630 }}>
      <div className="lm-h"><div><h2 style={{ fontSize: 18.5 }}>Huella del Depredador: el viaje de escala</h2><p style={{ fontSize: 13.3 }}>Logros operativos y facturación acumulada</p></div><button className="x" onClick={onClose}><X size={18} /></button></div>
      <div className="lm-b" style={{ padding: '22px 23px 26px' }}>
        <div style={{ border: '1px solid #2a344a', borderRadius: 9, padding: '20px 20px 20px', background: 'linear-gradient(120deg,#151e30,#1a243a 60%,#1d273e)' }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>🐆 El mercado es una selva.</div>
          <p style={{ fontSize: 12.4, lineHeight: 1.6, color: 'var(--text)', marginTop: 8 }}>La Huella del Depredador reconoce a socios que dejaron de solo reaccionar al mercado y pasaron a avanzar sobre él con más inteligencia, ritmo y potencia operativa. Cada hito representa escala, fuerza y dominio en la selva competitiva.</p>
          <button className="lb2 p" style={{ marginTop: 14, height: 33, fontSize: 12.5 }} onClick={() => { onClose(); nav('/rewards') }}><Gift size={15} />Canjear premios</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 15, marginTop: 22 }}>
          <Stat l="OPERACIÓN ACTIVA" ic={Briefcase} c="#f472b6"><div style={{ fontSize: 14.5, fontWeight: 700, color: '#005ae3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{co.name}</div></Stat>
          <Stat l="LEADS ACUMULADOS" ic={Users} c="#60a5fa"><span style={{ fontSize: 17, fontWeight: 700 }}>{contacts.length}</span> <span style={{ fontSize: 11.5, color: 'var(--soft)' }}>leads acumulados</span></Stat>
          <Stat l="FACTURACIÓN ACUMULADA" ic={TrendingUp} c="#22c55e"><div style={{ fontSize: 19, fontWeight: 700, color: '#22c55e' }}>{brl(rev)}</div></Stat>
        </div>
        <div style={{ position: 'relative', border: '1px solid #4a2236', borderRadius: 7, padding: '22px 17px 14px', marginTop: 16, overflow: 'hidden' }}>
          <span style={{ position: 'absolute', right: 12, top: 24, fontSize: 52, fontWeight: 900, color: 'rgba(255,255,255,.04)', letterSpacing: '.02em' }}>LEONA</span>
          <div style={{ display: 'flex' }}><div><div style={{ fontSize: 11.5, color: 'var(--soft)', fontWeight: 500 }}>Sello Actual de Facturación</div><div style={{ fontSize: 13.3, color: cur ? 'var(--text)' : '#94a3b8', marginTop: 13, fontWeight: cur ? 700 : 400 }}>{cur ? cur[1] : 'Sin sello aún'}</div></div>
            {next && <div style={{ marginLeft: 'auto', textAlign: 'right' }}><div style={{ fontSize: 11.5, color: 'var(--soft)' }}>Próximo Hito</div><div style={{ fontSize: 13.3, fontWeight: 700, marginTop: 8 }}>{next[1]}</div><div style={{ fontSize: 11.5, fontWeight: 700, color: '#22c55e', marginTop: 2 }}>{brl0(next[0])}</div></div>}</div>
          <div style={{ display: 'flex', fontSize: 11.5, marginTop: 14 }}><span style={{ color: 'var(--soft)' }}>Progreso hacia el próximo sello</span><b style={{ marginLeft: 'auto' }}>{Math.floor(pct)}%</b></div>
          <div style={{ height: 7, borderRadius: 7, background: '#151e30', border: '1px solid var(--border)', marginTop: 6, overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg,#005ae3,#22c55e)' }} /></div>
          {next && <div style={{ fontSize: 10.5, color: 'var(--soft)', textAlign: 'right', marginTop: 7 }}>Faltan {brl(next[0] - rev)} para {next[1]}</div>}
        </div>
        <div style={{ fontSize: 13.3, fontWeight: 700, letterSpacing: '.02em', marginTop: 24 }}>NIVELES DE LA HUELLA DEL DEPREDADOR</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 13 }}>
          {LEVELS.map(([v, t, Ic, d]) => { const ok = rev >= v; return <div key={v} style={{ border: '1px solid ' + (ok ? '#22c55e' : 'rgba(255,255,255,.75)'), borderRadius: 6, padding: '15px 15px 14px', background: ok ? 'rgba(34,197,94,.06)' : 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}><span style={{ width: 30, height: 30, border: '1px solid rgba(255,255,255,.7)', borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ic size={15} /></span>
              <div><div style={{ fontSize: 12.5, fontWeight: 700 }}>{t}</div><div style={{ fontSize: 11.5, fontWeight: 700, color: '#22c55e', marginTop: 2 }}>{brl0(v)}</div></div>
              <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid rgba(255,255,255,.6)', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700, color: ok ? '#22c55e' : '#cbd5e1', whiteSpace: 'nowrap' }}>{ok ? '✓' : <Lock size={10} />}{brl(v)}</span></div>
            <p style={{ fontSize: 11.5, lineHeight: 1.55, color: 'var(--text)', marginTop: 10 }}>{d}</p></div> })}
        </div>
      </div>
    </div></div>
}

const REWARDS = [
  { min: 50000, lbl: '50 mil', title: 'Carta + Pulseira + Pin 50k', items: ['Carta comemorativa', 'Pulseira Leona', 'Pin 50k'], price: 29.9, extra: 67.5, img: '/rewards/r1.jpg' },
  { min: 100000, lbl: '100 mil', title: 'Kit Placa Premium', items: ['Placa Premium', 'Pin 100k (para grudar na placa)', 'Carta comemorativa', ['Acesso ao Grupo VIP + Eventos privados futuros']], price: 297, extra: 346.5, img: '/rewards/r2.jpg' },
  { min: 250000, lbl: '250 mil', title: 'Pin 250k + Carta', items: ['Pin 250k', 'Carta comemorativa'], price: 29.9, extra: 54.5, img: '/rewards/r3.jpg' },
  { min: 500000, lbl: '500 mil', title: 'Pin 500k + Carta', items: ['Pin 500k', 'Carta comemorativa'], price: 29.9, extra: 54.5, img: '/rewards/r4.jpg' },
  { min: 1000000, lbl: '1 milhão', title: 'Pin 1M + Carta', items: ['Pin 1M', 'Carta comemorativa'], price: 29.9, extra: 54.5, img: '/rewards/r5.jpg' },
  { min: 2000000, lbl: '2 milhões', title: 'Pin 2M + Carta', items: ['Pin 2M', 'Carta comemorativa'], price: 29.9, extra: 54.5, img: '/rewards/r6.jpg' },
]

export function Rewards() {
  const nav = useNavigate(); const toast = useToast(); const rev = useRevenue()
  const [profR] = useStore('profile', {}); const prof = { name: 'Pablo Monja Suclupe', ...(profR || {}) }; const [subR] = useStore('subscription', {}); const sub = { instances: 0, ...(subR && typeof subR === 'object' ? subR : {}) }
  const [orders, setOrders] = useStore('reward_orders', []); const [tab, setTab] = useState('prem'); const [extra, setExtra] = useState({})
  const next = LEVELS.find(l => rev < l[0]); const prev = [...LEVELS].reverse().find(l => rev >= l[0])?.[0] || 0
  const pct = next ? Math.min(100, (rev - prev) / (next[0] - prev) * 100) : 100
  const months = false
  const unlocked = REWARDS.filter(r => rev >= r.min).length
  const ready = REWARDS.filter(r => rev >= r.min && months && !orders.some(o => o.min === r.min)).length
  const glass = { background: 'rgba(16,22,36,.75)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 18 }
  return <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', zIndex: 50, color: '#fff', background: 'radial-gradient(1200px 600px at 0% 0%,#1f2b46 0%,transparent 60%),radial-gradient(900px 500px at 100% 20%,#0d3a3a 0%,transparent 55%),radial-gradient(900px 500px at 50% 100%,#2b2208 0%,transparent 60%),#06080b' }}>
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '25px 0 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button onClick={() => nav(-1)} title="Volver" style={{ color: '#cbd5e1', display: 'grid', marginRight: 14 }}><ArrowLeft size={18} /></button>
        <img src="/leona-white.png" alt="Leona" style={{ height: 33 }} />
        <span style={{ marginLeft: 'auto', border: '1px solid rgba(255,255,255,.15)', borderRadius: 18, padding: '7px 13px', fontSize: 12.5, fontWeight: 700, color: '#cbd5e1', background: 'rgba(255,255,255,.04)' }}>Conta #13120</span></div>
      <div style={{ ...glass, marginTop: 25, padding: '29px 29px', display: 'flex', alignItems: 'center', background: 'linear-gradient(110deg,#212d48,#121825 55%,#0c2a2c)' }}>
        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', color: '#22d3ee' }}>SUA JORNADA</div>
          <div style={{ fontSize: 34, fontWeight: 800, marginTop: 5, letterSpacing: '-.01em' }}>Olá, {prof.name.split(' ')[0]}! 👋</div>
          <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6, color: '#a5a3c4', marginTop: 9, maxWidth: 470 }}>Acompanhe seu faturamento e monte um pedido só com os prêmios desbloqueados. Frete grátis na hora de fechar.</p></div>
        <div style={{ ...glass, borderRadius: 16, width: 383, padding: '22px 20px 23px', background: 'rgba(8,14,22,.6)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#cbd5e1' }}>Faturamento acumulado</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#facc15', marginTop: 6, letterSpacing: '-.02em' }}>{brl(rev)}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#a5a3c4', marginTop: 4 }}>Atualizado pela Leona.</div>
          {next && <><div style={{ display: 'flex', fontSize: 12.8, fontWeight: 700, color: '#cbd5e1', marginTop: 25 }}><span>Próxima meta: R$ {next[0] >= 1e6 ? next[0] / 1e6 + ' mi' : next[0] / 1000 + ' mil'}</span><span style={{ marginLeft: 'auto' }}>Faltam {brl(next[0] - rev)}</span></div>
            <div style={{ height: 8, borderRadius: 8, background: 'rgba(255,255,255,.08)', marginTop: 11, overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg,#facc15,#22d3ee)' }} /></div></>}
        </div>
      </div>
      <div style={{ ...glass, borderRadius: 14, marginTop: 29, padding: '19px 18px', background: 'rgba(60,14,24,.45)', borderColor: 'rgba(239,68,68,.45)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fecaca' }}>Primeiro lote em produção</div>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.55, color: '#fecaca', marginTop: 7 }}>Este primeiro lote está sendo produzido de uma vez, então o envio pode levar cerca de 30 dias úteis. Assim que as peças ficarem prontas, saem na hora. Agradecemos a paciência de todos.</div></div>
      <div style={{ ...glass, borderRadius: 14, marginTop: 22, padding: '19px 18px 17px', background: 'rgba(48,36,10,.45)', borderColor: 'rgba(234,179,8,.4)' }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Requisitos para resgate</div>
        {[['3 meses de Leona Flow', months], ['Faturamento atingido', unlocked > 0]].map(([t, ok]) => <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 700, color: ok ? '#4ade80' : '#a5a3c4', marginTop: 14 }}><span style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid currentColor', background: ok ? 'currentColor' : 'none' }} />{t}</div>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13, marginTop: 22 }}>
        {[[ready, 'Prontos para resgatar'], [unlocked, 'Marcos desbloqueados'], [`${sub.instances || 0} instâncias`, 'Plano Leona']].map(([v, l]) => <div key={l} style={{ ...glass, borderRadius: 14, padding: '20px 17px 21px' }}><div style={{ fontSize: 24, fontWeight: 800 }}>{v}</div><div style={{ fontSize: 14, fontWeight: 700, color: '#a5a3c4', marginTop: 12 }}>{l}</div></div>)}</div>
      <div style={{ display: 'flex', gap: 9, marginTop: 32 }}>{[['prem', 'Premiações'], ['ped', 'Pedidos e rastreio']].map(([k, l]) => <button key={k} onClick={() => setTab(k)} style={{ height: 41, padding: '0 15px', borderRadius: 21, fontSize: 14.3, fontWeight: 700, color: tab === k ? '#fff' : '#a5a3c4', background: tab === k ? '#212e4a' : 'rgba(255,255,255,.03)', border: '1px solid ' + (tab === k ? '#004fc7' : 'rgba(255,255,255,.12)') }}>{l}</button>)}</div>
      {tab === 'ped' ? (orders.length ? <div style={{ marginTop: 26 }}>{orders.map(o => <div key={o.id} style={{ ...glass, borderRadius: 14, padding: '16px 19px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}><img src={o.img} alt="" style={{ width: 54, height: 54, borderRadius: 9, objectFit: 'cover' }} /><div><b>{o.title}</b><div style={{ fontSize: 13, color: '#a5a3c4', marginTop: 3 }}>{o.qty} unidade(s) · {o.date}</div></div><span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: '#facc15' }}>Em produção</span></div>)}</div>
        : <div style={{ fontSize: 17, fontWeight: 700, color: '#a5a3c4', marginTop: 50, marginLeft: 4 }}>Você ainda não tem pedidos nesta trilha.</div>)
        : <>
          <div style={{ fontSize: 19, fontWeight: 700, marginTop: 30 }}>Premiações</div>
          <div style={{ marginTop: 22 }}>{REWARDS.map((r, i) => { const ok = rev >= r.min; const can = ok && months; const n = extra[r.min] || 0
            return <div key={r.min} style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
              <div style={{ width: 22, position: 'relative', flexShrink: 0 }}><span style={{ position: 'absolute', left: 10, top: 0, bottom: -18, width: 2, background: i === REWARDS.length - 1 ? 'transparent' : 'rgba(255,255,255,.2)' }} /><span style={{ position: 'absolute', left: 3, top: 102, width: 16, height: 16, borderRadius: '50%', border: '2px solid ' + (ok ? '#22c55e' : '#cbd5e1'), background: ok ? '#22c55e' : '#06080b' }} /></div>
              <div style={{ ...glass, borderRadius: 14, flex: 1, display: 'flex', gap: 20, padding: '23px 20px 22px', opacity: ok ? 1 : .78 }}>
                <div style={{ position: 'relative', width: 133, height: 133, borderRadius: 13, overflow: 'hidden', flexShrink: 0, marginTop: 24 }}><img src={r.img} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `${ok ? '' : 'brightness(.55) '}${r.hue ? `hue-rotate(${r.hue}deg)` : ''}` }} /><span style={{ position: 'absolute', bottom: 7, left: 0, right: 0, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#a5a3c4' }}>{r.lbl}</span></div>
                <div style={{ flex: 1, paddingTop: 22 }}><span style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 800, letterSpacing: '.1em', color: ok ? '#4ade80' : '#a5a3c4', background: 'rgba(255,255,255,.06)', borderRadius: 14, padding: '6px 11px' }}>{ok ? 'DESBLOQUEADO' : 'BLOQUEADO'}</span>
                  <div style={{ fontSize: 19, fontWeight: 700, marginTop: 13 }}>{r.title}</div>
                  <ul style={{ listStyle: 'none', marginTop: 9 }}>{r.items.map(it => { const vip = Array.isArray(it); return <li key={vip ? it[0] : it} style={{ fontSize: 15.5, fontWeight: 700, color: vip ? '#fcd34d' : '#a5a3c4', lineHeight: 1.55 }}><span style={{ color: vip ? '#f59e0b' : '#004fc7', marginRight: 8 }}>•</span>{vip ? it[0] : it}</li> })}</ul></div>
                <div style={{ width: 236, textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{brl(r.price)}</div>
                  <button disabled={!can} onClick={() => { setOrders(o => [{ id: uid(), min: r.min, title: r.title, img: r.img, qty: 1 + n, date: new Date().toLocaleDateString('pt-BR') }, ...o]); toast('Pedido criado: ' + r.title); setTab('ped') }} style={{ width: '100%', height: 45, borderRadius: 9, marginTop: 9, fontSize: 15.5, fontWeight: 700, background: can ? '#004fc7' : '#2f4168', color: can ? '#fff' : '#7f94b3', cursor: can ? 'pointer' : 'not-allowed' }}>{can ? 'Resgatar' : ok ? 'Requisitos pendentes' : 'Meta não atingida'}</button>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', marginTop: 15, paddingTop: 15, fontSize: 12.5, fontWeight: 800, letterSpacing: '.08em', color: '#a5a3c4' }}>UNIDADES EXTRAS</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 9, marginTop: 13 }}>
                    <div style={{ lineHeight: 1.35 }}><div style={{ fontSize: 13.3, fontWeight: 700, color: '#a5a3c4' }}>Unidades extras</div><div style={{ fontSize: 13.3, fontWeight: 700 }}><span style={{ color: '#fbbf24' }}>{brl(r.extra)}</span> <span style={{ color: '#a5a3c4' }}>cada</span> <CircleHelp size={12} style={{ verticalAlign: -2, color: '#a5a3c4' }} /></div></div>
                    <button disabled={!can || !n} onClick={() => setExtra({ ...extra, [r.min]: n - 1 })} style={{ width: 28, height: 28, borderRadius: 6, display: 'grid', placeItems: 'center', color: '#677487', background: 'rgba(255,255,255,.04)' }}><Minus size={13} /></button>
                    <b style={{ width: 22, textAlign: 'center', fontSize: 18 }}>{n}</b>
                    <button disabled={!can} onClick={() => setExtra({ ...extra, [r.min]: n + 1 })} style={{ width: 28, height: 28, borderRadius: 6, display: 'grid', placeItems: 'center', color: '#677487', background: 'rgba(255,255,255,.04)' }}><Plus size={13} /></button></div>
                </div>
              </div></div> })}</div></>}
    </div>
  </div>
}

/* ======================= Trilha do Predador (móvil) ======================= */
const STEP_C = ['#f59e0b', '#94a3b8', '#ca8a04', '#14b8a6', '#ec4899', '#22d3ee']
export function TrilhaMobile() {
  const [contacts] = useStore('contacts', []); const [coR] = useStore('companyData', {}); const co = { name: 'Empresa Pablo Monja Suclupe', ...(coR || {}) }
  const [seen, setSeen] = useStore('trilha_seen', false); const [open, setOpen] = useState(null)
  const rev = useRevenue(); const brlx = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' BRL'; const brli = v => v.toLocaleString('pt-BR') + ' BRL'
  const ni = LEVELS.findIndex(l => rev < l[0]); const next = LEVELS[ni]; const cur = ni === 0 ? null : LEVELS[ni < 0 ? LEVELS.length - 1 : ni - 1]
  const prev = cur ? cur[0] : 0; const pct = next ? (rev - prev) / (next[0] - prev) : 1
  return <div className="tr">
    <div className="mv-logo" style={{ marginBottom: 6 }}><img src="/leona-white.png" alt="Leona" /></div>
    <h1>Trilha do Predador</h1><div style={{ fontSize: 15, color: '#a19cb0', marginTop: 8 }}>La jornada de escala de tu operación.</div>
    <div className="tr-hero">
      <div style={{ fontSize: 19, fontWeight: 600 }}>🐆&nbsp; El mercado es una selva.</div>
      <div style={{ fontSize: 14.5, color: '#a19cb0', marginTop: 8, lineHeight: 1.45 }}>Cada hito es territorio conquistado. Toca los sellos y siente la cacería.</div>
      <div className="tr-orb"><i>{cur ? (() => { const I = cur[2]; return <I size={44} /> })() : <PawIcon size={50} />}</i></div>
      <div style={{ fontSize: 27, fontWeight: 600, marginTop: 30 }}>{cur ? cur[1] : 'La cacería empezó'}</div>
      <div style={{ fontSize: 15, color: '#c2c9d4', marginTop: 6 }}>{cur ? 'Sello conquistado' : 'Primer sello a la vista'}</div>
      <div style={{ fontSize: 16.5, marginTop: 14 }}>{next ? `Faltan ${brlx(next[0] - rev)} para ${next[1]}` : 'Todos los sellos conquistados 👑'}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center', marginTop: 16 }}>
        <span className="tr-chip"><Briefcase size={17} color="#60a5fa" /><span><small>Operación</small><b>{co.name}</b></span></span>
        <span className="tr-chip"><Users size={17} color="#60a5fa" /><span><small>Leads</small><b>{contacts.length}</b></span></span>
        <span className="tr-chip"><TrendingUp size={17} color="#60a5fa" /><span><small>Facturación</small><b>{brlx(rev)}</b></span></span></div>
    </div>
    <div style={{ fontSize: 20, fontWeight: 500, marginTop: 40 }}>La ruta</div><div style={{ fontSize: 15, color: '#a19cb0', marginTop: 8 }}>Toca un sello para abrir la historia de ese hito.</div>
    <div style={{ marginTop: 22 }}>{LEVELS.map(([v, t, Ic], i) => { const ok = rev >= v, isN = i === ni, right = i % 2 === 1
      return <div key={v}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexDirection: right ? 'row-reverse' : 'row', padding: '0 14px', cursor: 'pointer' }} onClick={() => setOpen(i)}>
          <span className={'tr-seal' + (isN ? ' next' : ok ? ' ok' : '')}>{ok ? <Ic size={30} /> : <Lock size={isN ? 34 : 28} fill="currentColor" strokeWidth={1.6} />}</span>
          <div style={{ textAlign: right ? 'right' : 'left' }}><div style={{ fontSize: 20, color: ok || isN ? '#fff' : '#d0d5dc' }}>{t}</div><div style={{ fontSize: 16, color: isN ? '#f59e0b' : ok ? '#4ade80' : '#c2c9d4', marginTop: 6 }}>{brli(v)}</div><div style={{ fontSize: 14.5, color: '#c2c9d4', marginTop: 4 }}>{ok ? 'Conquistado' : `Faltan ${brli(Math.ceil(v - rev))}`}</div></div></div>
        {i < LEVELS.length - 1 && <svg viewBox="0 0 300 80" style={{ width: '62%', height: 64, display: 'block', margin: '4px auto', transform: right ? 'scaleX(-1)' : '' }}><path d="M20 8 C 30 30, 260 30, 270 58 C 272 64, 268 70, 262 72" fill="none" stroke="#282c36" strokeWidth="12" strokeLinecap="round" /></svg>}
      </div> })}</div>
    {open != null && (() => { const [v, t, Ic, d] = LEVELS[open]; const ok = rev >= v; return <div className="md-ov" onClick={e => e.target === e.currentTarget && setOpen(null)}><div className="md-sh" style={{ textAlign: 'center', padding: '8px 22px 30px' }}><div className="md-hd" />
      <span className={'tr-seal' + (ok ? ' ok' : open === ni ? ' next' : '')} style={{ margin: '10px auto 0' }}><Ic size={34} /></span>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 16 }}>{t}</div><div style={{ fontSize: 15, color: '#f59e0b', marginTop: 4 }}>{brli(v)}</div>
      <p style={{ fontSize: 14.5, color: '#c2c9d4', lineHeight: 1.6, marginTop: 14 }}>{d}</p>
      <div style={{ fontSize: 14, marginTop: 14, color: ok ? '#4ade80' : '#a19cb0' }}>{ok ? '✓ Sello conquistado' : `Faltan ${brlx(v - rev)}`}</div></div></div> })()}
    {!seen && <div className="tr-ov"><div className="tr-wc">
      <div className="tr-ring"><svg width="138" height="138" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}><circle cx="69" cy="69" r="62" fill="none" stroke="rgba(245,158,11,.22)" strokeWidth="9" /><circle cx="69" cy="69" r="62" fill="none" stroke="#f59e0b" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${Math.max(.18, pct) * 390} 390`} /></svg><i><PawIcon size={48} /></i></div>
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '.3em', color: '#f59e0b', marginTop: 34 }}>DE LA MANADA</div>
      <div style={{ fontSize: 27, fontWeight: 600, lineHeight: 1.2, marginTop: 14 }}>{co.name}, la cacería empieza ahora</div>
      <p style={{ fontSize: 15.5, color: '#a19cb0', lineHeight: 1.5, marginTop: 16 }}>El mercado es una selva y cada sello es territorio conquistado. Este es solo el primer paso de una jornada demasiado grande para hacerla solo.</p>
      <div className="tr-steps">{[PawIcon, ...LEVELS.slice(1, 6).map(l => l[2])].map((I, i) => <><span key={'s' + i} style={{ borderColor: STEP_C[i], color: STEP_C[i], background: STEP_C[i] + '22', boxShadow: i === 0 ? `0 0 16px ${STEP_C[0]}88` : 'none' }}><I size={16} /></span>{i < 5 && <em key={'e' + i} style={{ background: `linear-gradient(90deg,${STEP_C[i]}66,${STEP_C[i + 1]}66)` }} />}</>)}</div>
      <p style={{ fontSize: 15.5, color: '#a19cb0', lineHeight: 1.5 }}>La manada está contigo. El equipo que construye Leona quiere quedarse cerca de quien vive el producto día a día. Si algo se traba o se siente raro, avísanos. Cazamos juntos.</p>
      <div style={{ fontSize: 15.5, fontWeight: 500, marginTop: 18 }}>Equipo de desarrollo Leona</div>
      <button className="tr-go" style={{ marginTop: 22 }} onClick={() => setSeen(true)}><PawIcon size={22} />Entra a la cacería</button>
    </div></div>}
  </div>
}
