import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CreditCard, Crown, LayoutGrid, Sparkles, CircleHelp, FileText, Copy, Filter, RotateCcw, ReceiptText, ChevronRight, X, Minus, Plus } from 'lucide-react'
import { useStore, useToast } from '../ui'
import { LModal, LSelect } from './leona'

const brl = v => 'R$ ' + (+v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
const PRICE = 127

/* ---------- Modal "Assinar agora" (también se usa en el Dashboard) ---------- */
export function AssinarModal({ open, onClose }) {
  const toast = useToast()
  const [n, setN] = useState(1); const [ct, setCt] = useState('ext'); const [pay, setPay] = useState('card')
  const [c, setC] = useState({ num: '', name: '', mm: '', aa: '', cvv: '', doc: '' })
  useEffect(() => { if (!open) return; const k = e => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [open])
  if (!open) return null
  const fmtNum = v => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
  const fmtDoc = v => { const d = v.replace(/\D/g, '').slice(0, 14); return d.length <= 11 ? d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})(\d{1,2})$/, '$1-$2') : d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, '$1.$2.$3/$4-$5') }
  const go = () => {
    if (ct === 'br' && pay === 'card' && (c.num.replace(/\D/g, '').length < 13 || !c.name.trim() || !c.mm || !c.aa || c.cvv.length < 3 || c.doc.replace(/\D/g, '').length < 11)) return toast('Complete los datos de la tarjeta', 'err')
    onClose(); toast(`Redirigiendo al pago de ${n} instancia${n > 1 ? 's' : ''}…`, 'info')
  }
  const In = (k, ph, f = x => x, extra = {}) => <input className="l-in" style={{ height: 37, background: 'var(--in2)' }} value={c[k]} placeholder={ph} onChange={e => setC({ ...c, [k]: f(e.target.value) })} {...extra} />
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="modal db-m" style={{ maxHeight: '94vh' }}>
      <div className="mh"><div><h2>Assinar agora</h2><p>Escolha quantas instâncias deseja contratar. A cobrança mensal é recorrente por instância.</p></div>
        <button className="x" onClick={onClose}><X size={18} /></button></div>
      <div className="mb" style={{ overflowY: 'auto' }}>
        <div className="db-inst"><div><div className="t">Instâncias adicionais</div><div className="s">{brl(PRICE)} por instância · {brl(PRICE * n)}/mês</div></div>
          <div className="db-step"><button onClick={() => setN(Math.max(1, n - 1))}><Minus size={13} strokeWidth={2.6} /></button><b>{n}</b><button onClick={() => setN(n + 1)}><Plus size={13} strokeWidth={2.6} /></button></div></div>
        <div className="lbl">PAÍS DE COBRANÇA</div>
        <div className="db-ct"><button className={ct === 'br' ? 'on' : ''} onClick={() => setCt('br')}><small>BR</small>Brasil</button><button className={ct === 'ext' ? 'on' : ''} onClick={() => setCt('ext')}><span style={{ fontSize: 13 }}>🌎</span>Exterior</button></div>
        <div className="note">{ct === 'br' ? 'Cobrança em reais. Você escolhe entre Pix e cartão no checkout.' : 'Valores em reais (R$). No checkout internacional a Paddle cobra na moeda do seu país.'}</div>
        {ct === 'br' && <>
          <div className="lbl">FORMA DE PAGAMENTO</div>
          <div className="db-ct"><button className={pay === 'card' ? 'on' : ''} onClick={() => setPay('card')}>Cartão</button><button className={pay === 'pix' ? 'on' : ''} onClick={() => setPay('pix')}>Pix</button></div>
          {pay === 'card' ? <>
            <label className="l-lbl" style={{ marginTop: 16, color: 'var(--text)' }}>Número do cartão</label>{In('num', '0000 0000 0000 0000', fmtNum, { inputMode: 'numeric' })}
            <label className="l-lbl" style={{ marginTop: 16, color: 'var(--text)' }}>Nome no cartão</label>{In('name', '', x => x.toUpperCase())}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
              <div><label className="l-lbl" style={{ marginTop: 16, color: 'var(--text)' }}>Mês</label>{In('mm', 'MM', x => x.replace(/\D/g, '').slice(0, 2), { inputMode: 'numeric' })}</div>
              <div><label className="l-lbl" style={{ marginTop: 16, color: 'var(--text)' }}>Ano</label>{In('aa', 'AA', x => x.replace(/\D/g, '').slice(0, 2), { inputMode: 'numeric' })}</div>
              <div><label className="l-lbl" style={{ marginTop: 16, color: 'var(--text)' }}>CVV</label>{In('cvv', '123', x => x.replace(/\D/g, '').slice(0, 4), { inputMode: 'numeric' })}</div></div>
            <label className="l-lbl" style={{ marginTop: 16, color: 'var(--text)' }}>CPF ou CNPJ</label>{In('doc', '000.000.000-00', fmtDoc, { inputMode: 'numeric' })}
          </> : <div className="note" style={{ marginTop: 12 }}>O QR Code Pix é gerado no checkout e vence em 30 minutos.</div>}
        </>}
      </div>
      <div className="mf"><button className="c" onClick={onClose}>Cancelar</button><button className="ok" onClick={go}>Ir para o pagamento</button></div>
    </div></div>
}

export function TokensModal({ open, onClose }) {
  const toast = useToast(); const [n, setN] = useState(10000)
  if (!open) return null
  const pay = m => { onClose(); toast(`Redirigiendo al pago de ${n.toLocaleString('en-US')} tokens (${m})…`, 'info') }
  return <LModal open onClose={onClose} title="Adicionar tokens Leona" desc="Compra avulsa de tokens, válida para a conta inteira. Não altera sua assinatura mensal." width={479} bodyStyle={{ padding: '11px 23px 20px' }}
    footer={<button className="lb2 g" onClick={onClose}>Cancelar</button>}>
    <div style={{ fontSize: 13.3, fontWeight: 600 }}>Cuántos tokens Leona quieres comprar</div>
    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>1.000 tokens Leona = R$ 1,00. Arrastra la barra o escribe el monto.</div>
    <input type="range" className="rng" style={{ marginTop: 17, background: `linear-gradient(90deg,#005ae3 ${(n - 10000) / 990000 * 100}%,#e5e7eb 0)` }} min={10000} max={1000000} step={10000} value={n} onChange={e => setN(+e.target.value)} />
    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 25 }}>Tokens</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 7 }}><input className="l-in" style={{ height: 37, background: 'var(--in2)', fontWeight: 700 }} value={n.toLocaleString('en-US')} onChange={e => setN(Math.min(10000000, +e.target.value.replace(/\D/g, '') || 0))} onBlur={() => setN(x => Math.max(10000, x))} /><span style={{ fontSize: 13.3, color: '#94a3b8', whiteSpace: 'nowrap' }}>tokens Leona</span></div>
    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>Pagas</div>
    <div style={{ fontSize: 16.8, fontWeight: 700, marginTop: 2 }}>BRL {(n / 1000).toFixed(2)}</div>
    <button className="ms-b1" style={{ width: '100%', marginTop: 11, borderRadius: 5, fontWeight: 600 }} onClick={() => pay('Pix o tarjeta')}><small>BR</small>Pix o tarjeta</button>
    <button className="ms-b2" style={{ width: '100%', marginTop: 8, borderRadius: 5, fontWeight: 600 }} onClick={() => pay('Paddle')}><span>🌎</span>Paddle (internacional)</button>
    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 16 }}>Pix y tarjeta en reales, o el checkout internacional con Paddle.</div>
  </LModal>
}

export default function Billing() {
  const { sub } = useParams()
  if (sub === 'refunds') return <Records kind="refunds" />
  if (sub === 'invoices') return <Records kind="invoices" />
  return <Main />
}

function Main() {
  const nav = useNavigate(); const toast = useToast()
  const obj = (v, d) => ({ ...d, ...(v && typeof v === 'object' && !Array.isArray(v) ? v : {}) })
  const [subR] = useStore('subscription', {}); const subS = obj(subR, { status: 'CANCELADA', instances: 0, since: 'Set de 2026', next: null, method: 'Pix', price: 0, country: 'Exterior' })
  const [tokR] = useStore('tokens', {}); const tok = obj(tokR, { balance: 0, used: 0, last: null }); tok.balance = +tok.balance || 0; tok.used = +tok.used || 0
  const [invR] = useStore('invoices', []); const inv = Array.isArray(invR) ? invR : []; const [connR] = useStore('connections', []); const conns = Array.isArray(connR) ? connR : []
  const [coR] = useStore('companyData', {}); const co = obj(coR, { name: 'Empresa Pablo Monja Suclupe' })
  const [prR] = useStore('profile', {}); const prof = obj(prR, { name: 'Pablo Monja Suclupe', email: 'k4el.ux@gmail.com' })
  subS.price = +subS.price || 0; subS.instances = +subS.instances || 0
  const [m, setM] = useState(null)
  const usedI = Math.min(conns.length, subS.instances)
  const Hd = ({ ic: Ic, t }) => <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}><span className="bl-ib"><Ic size={18} /></span><span className="bl-t">{t}</span></div>
  return <div className="lp" style={{ paddingTop: 22 }}>
    <div className="lp-hd"><CreditCard size={22} strokeWidth={1.9} style={{ marginLeft: 2 }} /><div><h1 style={{ fontSize: 19.5 }}>Cobrança e Assinatura</h1><p>Gerencie sua assinatura, suas instâncias contratadas e suas faturas</p></div></div>
    <div className="bl-card" style={{ marginTop: 26 }}>
      <div style={{ display: 'flex', gap: 13 }}><span className="bl-ib"><Crown size={18} /></span>
        <div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span className="bl-t">Assinatura Leona</span><span className="bl-tag">{subS.status}</span></div>
          <div style={{ fontSize: 13.3, color: 'var(--text)', marginTop: 9 }}>Sua conta está ativa e operando normalmente. Cobrança mensal recorrente por instância contratada.</div></div>
        <div style={{ textAlign: 'right' }}><div style={{ fontSize: 26, fontWeight: 700 }}>{brl(subS.price)}</div><div style={{ fontSize: 10.7, fontWeight: 700, letterSpacing: '.04em', color: '#94a3b8', marginTop: 2 }}>POR MÊS</div></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 11, marginTop: 20 }}>
        {[['INSTÂNCIAS CONTRATADAS', `${subS.instances} instâncias`], ['CLIENTE ATIVO DESDE', subS.since], ['PRÓXIMO VENCIMENTO', subS.next || '—'], ['FORMA DE PAGAMENTO', subS.method]].map(([l, v]) => <div key={l} className="bl-box"><span>{l}</span><b style={l === 'FORMA DE PAGAMENTO' ? { fontSize: 13.3 } : null}>{v}</b></div>)}
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 23 }}>
      <div className="bl-card"><Hd ic={LayoutGrid} t="Instâncias" />
        <div style={{ marginTop: 13 }}><span className="bl-big">{usedI} / {subS.instances}</span> <span style={{ fontSize: 13.3, color: '#94a3b8' }}>em uso</span></div>
        <div className="bl-bar"><div style={{ width: subS.instances ? usedI / subS.instances * 100 + '%' : 0, height: '100%', background: 'var(--p)' }} /></div>
        <div className="bl-split"><div><span>CONTRATADAS</span><b>{subS.instances}</b></div><div><span>LIVRES</span><b>{subS.instances - usedI}</b></div></div>
        <div className="bl-note">{brl(subS.price)} por instância/mês · cada instância é uma conexão de WhatsApp.</div>
        <button className="bl-gbtn" onClick={() => setM('assinar')}>Assinar agora</button></div>
      <div className="bl-card"><Hd ic={Sparkles} t="Tokens Leona" />
        <div style={{ marginTop: 13 }}><span className="bl-big">{tok.balance.toLocaleString('es-PE')}</span> <span style={{ fontSize: 13.3, color: '#94a3b8' }}>disponíveis</span></div>
        <div className="bl-bar" />
        <div className="bl-split"><div><span>USADOS</span><b>{tok.used}</b></div><div><span>ÚLTIMA RECARGA</span><b>{tok.last || '—'}</b></div></div>
        <div className="bl-note">Compra avulsa, vale para a conta inteira · separado da assinatura.</div>
        <button className="bl-gbtn" onClick={() => setM('tokens')}>+ Adicionar tokens</button></div>
      <div className="bl-card" style={{ paddingTop: 23 }}><Hd ic={CircleHelp} t="Informações da conta" />
        <div className="bl-info" style={{ marginTop: 8, height: 44 }}>ID da conta<span style={{ marginLeft: 'auto', background: 'var(--deep)', borderRadius: 5, padding: '4px 9px', fontWeight: 700, color: 'var(--text)', fontSize: 13.3 }}>13120</span><button style={{ marginLeft: 12, color: 'var(--soft)', display: 'grid' }} onClick={() => { navigator.clipboard?.writeText('13120'); toast('ID copiado') }}><Copy size={15} /></button></div>
        {[['Titular', co.name], ['E-mail', prof.email], ['Recorrência', 'Mensal'], ['Próximo vencimento', subS.next || '—'], ['País de cobrança', subS.country]].map(([l, v], i, a) => <div key={l} className="bl-info" style={i === a.length - 1 ? { borderBottom: 'none' } : null}>{l}<b>{v}</b></div>)}
      </div>
    </div>
    <div className="bl-card" style={{ marginTop: 23, paddingBottom: 30 }}>
      <div style={{ display: 'flex', gap: 13 }}><span className="bl-ib"><FileText size={18} /></span><div><div className="bl-t" style={{ fontSize: 15 }}>Histórico de faturas</div><div style={{ fontSize: 13.3, color: 'var(--soft)', marginTop: 5 }}>Histórico financeiro completo da sua conta</div></div>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 9 }}><button className="bl-ob d" onClick={() => nav('/billing/refunds')}>Reembolsos</button><button className="bl-ob o" onClick={() => nav('/billing/invoices')}>Ver todas</button></span></div>
      <div className="bl-th"><span>FATURA</span><span>DATA</span><span>DESCRIÇÃO</span><span>VALOR</span><span>STATUS</span></div>
      {inv.length ? inv.slice(0, 5).map(x => <div key={x.id} className="bl-th" style={{ fontSize: 13, fontWeight: 500, letterSpacing: 0, color: 'var(--text)', marginTop: 14 }}><span>{x.id}</span><span>{x.date}</span><span>{x.desc}</span><span>{brl(x.value)}</span><span>{x.status}</span></div>)
        : <div style={{ textAlign: 'center', fontSize: 13.3, color: 'var(--soft)', marginTop: 50 }}>Nenhuma fatura ainda</div>}
    </div>
    <div className="bl-card" style={{ marginTop: 23, display: 'flex', alignItems: 'center', gap: 13, padding: '28px 24px' }}><span className="bl-ib"><CircleHelp size={18} /></span>
      <div><div className="bl-t" style={{ fontSize: 15 }}>Precisando de suporte?</div><div style={{ fontSize: 13.3, color: 'var(--soft)', marginTop: 5 }}>Dúvidas sobre faturamento, assinatura, pagamentos ou liberação de instâncias com nosso time.</div></div>
      <button className="bl-ob d" style={{ marginLeft: 'auto', height: 33 }} onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent('Hola, necesito ayuda con mi suscripción (cuenta 13120)'), '_blank')}>Falar com Suporte</button></div>
    <AssinarModal open={m === 'assinar'} onClose={() => setM(null)} />
    <TokensModal open={m === 'tokens'} onClose={() => setM(null)} />
  </div>
}

function Records({ kind }) {
  const nav = useNavigate()
  const [itR] = useStore(kind, []); const items = Array.isArray(itR) ? itR : []
  const [show, setShow] = useState(false); const [f, setF] = useState({ st: 'all', from: '', to: '' })
  const R = kind === 'refunds'
  const on = f.st !== 'all' || f.from || f.to
  const rows = items.filter(x => (f.st === 'all' || x.status === f.st) && (!f.from || x.iso >= f.from) && (!f.to || x.iso <= f.to))
  const Ic = R ? RotateCcw : ReceiptText
  return <div className="lp" style={{ paddingTop: 26 }}>
    <div className="kb-crumb" style={{ margin: '0 0 0 9px' }}><a onClick={() => nav('/billing')}>Suscripción</a><ChevronRight size={14} /><b>{R ? 'Reembolsos' : 'Facturas'}</b></div>
    <div className="lp-hd" style={{ marginTop: 21 }}><Ic size={22} strokeWidth={2} style={{ marginLeft: 2 }} /><div><h1 style={{ fontSize: 19.5 }}>{R ? 'Reembolsos' : 'Facturas'}</h1><p>{R ? 'Consulte los reembolsos procesados en su cuenta' : 'Consulte el historial de facturas de su cuenta'}</p></div>
      <div className="r"><button className={'lp-btn' + (show ? ' p' : '')} style={{ height: 34, fontSize: 13 }} onClick={() => setShow(!show)}><Filter size={15} />Filtros</button></div></div>
    {show && <div className="bl-filt">
      <div><span className="cap">ESTADO</span><LSelect className="l-in" bold value={f.st} onChange={v => setF({ ...f, st: v })} options={(R ? [['all', 'Todos los estados'], ['procesado', 'Procesado'], ['pendiente', 'Pendiente'], ['rechazado', 'Rechazado']] : [['all', 'Todos los estados'], ['pagada', 'Pagada'], ['pendiente', 'Pendiente'], ['vencida', 'Vencida']]).map(([value, label]) => ({ value, label }))} /></div>
      <div><span className="cap">FECHA INICIAL</span><input type="date" className="l-in" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} /></div>
      <div><span className="cap">FECHA FINAL</span><input type="date" className="l-in" value={f.to} onChange={e => setF({ ...f, to: e.target.value })} /></div>
      <button className="lb2 g" style={{ height: 37, fontSize: 13.3 }} disabled={!on} onClick={() => setF({ st: 'all', from: '', to: '' })}><X size={14} />Limpiar filtros</button>
    </div>}
    {rows.length ? <div className="lp-card" style={{ marginTop: 21, flex: 'none' }}>{rows.map(x => <div key={x.id} className="bl-info" style={{ padding: '0 18px', height: 46 }}>{x.id} · {x.date}<b>{brl(x.value)} · {x.status}</b></div>)}</div>
      : <div className="bl-emp"><Ic size={45} strokeWidth={2} className="big" /><h3>{R ? 'No se encontraron reembolsos' : 'No se encontraron facturas'}</h3><p>{R ? 'Sus reembolsos aparecerán aquí cuando estén disponibles' : 'Sus facturas aparecerán aquí cuando estén disponibles'}</p></div>}
  </div>
}
