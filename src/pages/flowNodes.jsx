import { useState } from 'react'
import { X, Plus, Trash2, Info, Upload, Link2, Code, Mic, Image, Music, Video, ChevronDown, Search } from 'lucide-react'
import { useStore, useToast, uid } from '../ui'
import { LSelect, Toggle } from './leona'

const U4 = [['seconds', 'Segundos'], ['minutes', 'Minutos'], ['hours', 'Horas'], ['days', 'Días']]
const U3 = U4.slice(1)
const OPS = [['eq', 'Igual a'], ['neq', 'Diferente de'], ['has', 'Contiene'], ['nhas', 'No contiene'], ['gt', 'Mayor que'], ['lt', 'Menor que'], ['ex', 'Existe'], ['nex', 'No existe']]
const MODELS = { gpt: ['GPT-6 Astra', 'GPT-6.1 Sol', 'GPT-6 Sol', 'GPT-6 Luna', 'GPT-5.6 Sol', 'GPT-5.6 Terra', 'GPT-5.6 Luna', 'GPT-5.5', 'GPT-5.5 Pro', 'GPT-5.4', 'GPT-5.4 Pro', 'GPT-5.4 Mini', 'GPT-5.4 Nano', 'GPT-5.2', 'GPT-5.2 Pro'], gemini: ['Gemini 3 Pro', 'Gemini 3 Flash', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash'], leona: ['Leona AI'], openrouter: ['openrouter/auto', 'anthropic/claude', 'meta-llama/llama'], biziva: ['biziva-auto'] }
const PAYVARS = ['{gateway.value}', '{gateway.status}', '{gateway.pix_code}', '{gateway.pix_qr}', '{gateway.boleto_url}', '{gateway.charge_id}', '{gateway.expires_at}']
const how = t => ({ t: 'how', l: t })

/* Definición de cada nodo, tomada de Leona */
export const NODE_DEF = {
  esperar: { title: 'Editar esperar respuesta', fields: [
    { k: 'forever', t: 'switch', l: 'Esperar indefinidamente (sin cerrar automáticamente por tiempo)', help: 'El flujo solo avanza cuando el lead responde (o por otra acción externa).', box: 1 },
    { k: 'wait', t: 'time', l: 'Tiempo máximo esperando la respuesta del lead:', d: [1, 'days'], u: U4, help: 'Límite total: 31 días (máximo 31 en esta unidad).', when: c => !c.forever },
    { k: 'buffer', t: 'switch', l: 'Activar buffer de mensajes', help: 'Activa el buffer para definir el tiempo de espera entre mensajes.' },
    { k: 'bufferT', t: 'time', l: 'Tiempo del buffer', d: [10, 'seconds'], u: U4, when: c => c.buffer },
    { k: 'reply', t: 'switch', l: 'Enviar como respuesta al mensaje del lead' },
    { k: 'react', t: 'switch', l: 'Reaccionar al mensaje del lead', help: 'Reacciona a la última respuesta del lead al enviar el siguiente bloque.' },
    { k: 'emoji', t: 'text', l: 'Emoji de reacción', ph: '👍', when: c => c.react },
    { k: 'field', t: 'text', l: 'Campo para guardar la información en el usuario:', ph: 'Nombre' },
    { k: 'msg', t: 'area', l: 'Mensaje antes de esperar la respuesta:', ph: 'Mensaje' }],
    desc: c => 'Esperar la respuesta del cliente.' },
  controlador: { title: 'Editar controlador de chat', fields: [
    { k: 'status', t: 'select', l: 'Configurar estado del chat *', o: [['espera', 'En espera'], ['atencion', 'En atención'], ['resueltos', 'Resueltos']], d: 'espera' },
    how('Este nodo cambia el estado del chat en el sistema (Esperando → Atención → Resuelto).')], desc: c => ({ espera: 'Estado: En espera', atencion: 'Estado: En atención', resueltos: 'Estado: Resueltos' })[c.status || 'espera'] },
  notificacion: { title: 'Editar notificación', fields: [
    { k: 'name', t: 'text', l: 'Nombre *', ph: 'Ej.: Notificación de pedido recibido', req: 1 },
    { k: 'phone', t: 'phone', l: 'Número *', req: 1 },
    { k: 'msg', t: 'area', l: 'Mensaje *', ph: 'Escriba su mensaje aquí...', req: 1, tb: 1 },
    how('Este nodo envía una notificación por WhatsApp al número indicado. Use el formato de texto para resaltar partes importantes.')], desc: c => c.name || '' },
  condicional: { title: 'Editar condicional', fields: [
    { k: 'mode', t: 'radio', l: 'Regla lógica', o: [['all', 'La regla coincide con las condiciones (Y)', 'todas'], ['any', 'La regla coincide con condición (O)', 'cualquier']], d: 'all' },
    { k: 'conds', t: 'list', l: 'Condiciones', add: 'Añadir condición', empty: 'Ninguna condición añadida. Haga clic en "Añadir condición" para empezar.', item: [{ k: 'field', ph: '{campo} o variable' }, { k: 'op', o: OPS }, { k: 'val', ph: 'Valor', when: i => !['ex', 'nex'].includes(i.op) }] }],
    outs: c => !(c.conds || []).length ? [] : [{ k: 'true', l: 'Condición cumplida', c: 'gn', pc: '#16a34a' }, { k: 'false', l: 'No cumplida', c: 'rd', pc: '#dc2626' }] },
  distribuidor: { title: 'Editar distribuidor', fields: [
    { t: 'h', l: 'Seleccione cuántas distribuciones se harán:' },
    { k: 'next', t: 'switch', l: 'Distribuir siempre al siguiente' },
    { k: 'norep', t: 'switch', l: 'Evitar repetición' },
    { k: 'outs', t: 'list', add: 'Añadir salida', empty: 'Ninguna salida. Añada al menos dos para repartir los contactos.', item: [{ k: 'name', ph: 'Nombre de la salida' }, { k: 'pct', ph: '%', num: 1, w: 80 }], d: () => [{ id: uid(), name: 'Salida A', pct: 50 }, { id: uid(), name: 'Salida B', pct: 50 }] },
    how('Este nodo distribuye los contactos por igual entre las salidas. Los clientes recurrentes van siempre a la misma salida de antes.')],
    outs: c => (c.outs || []).map((o, i) => ({ k: 'o' + o.id, l: `${o.name || 'Salida ' + (i + 1)}${o.pct ? ' · ' + o.pct + '%' : ''}`, c: 'or', pc: '#f59e0b' })) },
  conexion: { title: 'Editar conexión de flujo', fields: [{ k: 'flow', t: 'flowpick', l: 'Seleccione el flujo de destino:', ph: 'Escriba el nombre del flujo...' }], desc: (c, s) => c.flow ? '→ ' + (s.flows.find(f => f.id === c.flow)?.name || 'Flujo eliminado') : 'Redirigir a otro flujo', outs: () => [] },
  pixel: { title: 'Editar pixel', fields: [
    { k: 'plat', t: 'select', l: 'Plataforma *', o: [['Facebook', 'Facebook'], ['TikTok', 'TikTok'], ['Kwai', 'Kwai'], ['Google', 'Google']], d: 'Facebook' },
    { k: 'pixel', t: 'select', l: 'Pixel configurado *', o: s => s.pixels.map(p => [p.id, p.name]), ph: 'Seleccione un pixel configurado', help: 'Configure los píxeles en Ajustes → Píxeles de Facebook' },
    { k: 'ev', t: 'select', l: 'Tipo de evento *', o: [['Compra', 'Compra'], ['Lead', 'Lead']], d: 'Compra' },
    { k: 'page', t: 'varea', l: 'Page ID', ph: 'Ej.: 123456789012345 o {pagina_id}', help: 'ID de la página de Facebook vinculada a WhatsApp Business. No es necesario para la API oficial (WhatsApp Cloud). En conexiones no oficiales, puede ser obligatorio para eventos por WhatsApp. Use el botón de variables en la barra de herramientas para campos dinámicos.' },
    { k: 'val', t: 'varea', l: 'Valor del artículo *', ph: 'Ej.: 197,00 o {precio}', help: 'Solo para eventos de compra. Use el botón de variables en la barra de herramientas para campos dinámicos.', when: c => (c.ev || 'Compra') === 'Compra' },
    { k: 'cur', t: 'cur', l: 'Moneda', ph: 'MXN, BRL o {comprovante.moeda}', d: 'BRL' },
    how('Este nodo dispara eventos de Facebook mediante la Conversions API. Seleccione un pixel configurado en Ajustes.')], desc: () => 'Disparar eventos en herramientas de anuncios (Facebook Ads, etc.)' },
  intervalo: { title: 'Editar intervalo inteligente', fields: [
    { k: 'kind', t: 'seg', l: 'Tipo de programación', o: [['interval', 'Intervalo'], ['date', 'Fecha'], ['hours', 'Horarios']], d: 'interval' },
    { k: 'time', t: 'time', l: 'Tiempo', d: [1, 'minutes'], u: U3, help: 'Configure el intervalo de espera antes de continuar (máximo 31 días en total).', when: c => (c.kind || 'interval') === 'interval' },
    { k: 'date', t: 'datetime', l: 'Fecha y hora', help: 'El flujo continúa en esta fecha y hora (zona horaria de la empresa).', when: c => c.kind === 'date' },
    { k: 'from', t: 'clock', l: 'Desde', d: '09:00', when: c => c.kind === 'hours', half: 1 }, { k: 'to', t: 'clock', l: 'Hasta', d: '18:00', when: c => c.kind === 'hours', half: 1 },
    { k: 'days', t: 'days', l: 'Días', when: c => c.kind === 'hours', help: 'Si el lead llega fuera del horario, el flujo espera hasta el siguiente horario disponible.' }],
    desc: c => (c.kind || 'interval') === 'interval' ? `Espera de ${String((c.time || [1])[0]).padStart(2, '0')} ${({ minutes: 'minuto', hours: 'hora', days: 'día' })[(c.time || [1, 'minutes'])[1]]}${(c.time || [1])[0] > 1 ? 's' : ''}` : c.kind === 'date' ? 'Hasta ' + (c.date ? new Date(c.date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '—') : `Horario ${c.from || '09:00'} – ${c.to || '18:00'}` },
  departamento: { title: 'Editar departamento', fields: [
    { k: 'dep', t: 'select', l: 'Departamento', o: s => s.deps.map(d => [d.id, d.name]), ph: 'Seleccione un departamento', emptyMsg: 'Ninguna acción configurada. Elija un departamento para asignar al chat.' },
    how('Este nodo asigna un departamento al chat mientras se ejecuta el flujo, para organizar y filtrar chats.')], desc: (c, s) => c.dep ? 'Departamento: ' + (s.deps.find(d => d.id === c.dep)?.name || '—') : 'Asignar departamento al chat' },
  integracion: { title: 'Editar integración', fields: [{ t: 'http' }], desc: c => c.url ? `${c.method || 'GET'} ${c.url}` : 'Realizar peticiones HTTP (POST/PUT/GET) a APIs externas',
    outs: () => [{ k: 'success', l: 'Éxito', c: 'gn', pc: '#16a34a' }, { k: 'failure', l: 'Fallo', c: 'rd', pc: '#dc2626' }] },
  ia: { title: 'Editar bloque de IA', fields: [
    { k: 'prov', t: 'select', l: 'Proveedor de IA', o: [['leona', 'Leona AI'], ['gpt', 'GPT'], ['gemini', 'Gemini'], ['openrouter', 'OpenRouter'], ['biziva', 'BIZIVA'], ['deepseek', 'DeepSeek (próximamente)']], d: 'gpt' },
    { k: 'auth', t: 'select', l: 'Autenticación', o: [['manual', 'Clave manual o variable global'], ['int', 'Integración registrada']], d: 'manual', when: c => (c.prov || 'gpt') !== 'leona' },
    { k: 'key', t: 'password', l: 'Clave API', ph: 'sk-… o {g_nombre_variable}', help: 'Puede usar la clave fija (como antes) o referenciar una variable global de la cuenta en el formato {g_nome} (el nombre registrado debe empezar por g_).', when: c => (c.prov || 'gpt') !== 'leona' && (c.auth || 'manual') === 'manual' },
    { k: 'model', t: 'select', l: 'Modelo', o: c => (MODELS[c.prov || 'gpt'] || []).map(m => [m, m]), d: 'GPT-5.4 Mini', help: 'Si el modelo seleccionado no está disponible con su clave API, la ejecución fallará. Compruebe el acceso antes de usar.', dyn: 1 },
    { k: 'msg', t: 'varea', l: 'Mensaje enviado al modelo', ph: '{last_user_message}', help: 'Use variables como {last_user_message} o {campo} con el botón de variables en la barra de herramientas' },
    { k: 'save', t: 'text', l: 'Campo para guardar la respuesta de la IA:', ph: 'ai.response', d: 'ai.response', help: 'Si no se completa, se guardará en ai.response. La respuesta siempre se guarda también en ai.response.' },
    { k: 'auto', t: 'switch', l: 'Enviar respuesta automáticamente', help: 'Envía la respuesta de la IA como mensaje al lead automáticamente' },
    { k: 'prompt', t: 'area', l: 'Prompt de IA / Comportamiento', ph: 'Usted es un asistente útil.\nResponda siempre en español.\nSea claro y conciso.' },
    { k: 'audio', t: 'switch', l: 'Entender audio', help: 'Permite procesar mensajes de audio' },
    { k: 'image', t: 'switch', l: 'Entender imagen', help: 'Permite procesar imágenes' },
    { k: 'pdf', t: 'switch', l: 'Entender PDF', help: 'Permite procesar documentos PDF' },
    { k: 'receipt', t: 'switch', l: 'Identificar comprobante', help: 'Identifica comprobantes de pago en imagen/PDF y extrae datos en el lead. Crea la salida Comprobante válido en la parte superior del bloque.' },
    { k: 'conds', t: 'list', l: 'Condicionales inteligentes (hasta 10)', help: 'La IA clasifica la respuesta del cliente y sigue la salida correspondiente. Orden = prioridad.', add: 'Añadir condicional', max: 10, item: [{ k: 'name', ph: 'Ej.: Quiere comprar' }, { k: 'desc', ph: 'Cuándo usar esta salida' }] },
    { k: 'ctx', t: 'switch', l: 'Mantener contexto de la conversación (últimas 5 interacciones)', help: 'Mantiene el historial de las últimas interacciones para mejor contexto (máximo 20 interacciones)' },
    how('Este bloque se integra con APIs de IA (GPT, Gemini, OpenRouter o Leona AI) para generar respuestas inteligentes. La respuesta se guarda en una variable configurable y puede usarse en otros bloques. En caso de error, el motivo se guarda en una variable de fallo para su tratamiento.')],
    desc: () => 'Integración con GPT y Gemini para respuestas inteligentes',
    outs: c => [...(c.receipt ? [{ k: 'receipt', l: 'Comprobante válido', c: 'gn', pc: '#16a34a' }] : []), ...(c.conds || []).map(x => ({ k: 'c' + x.id, l: x.name || 'Condicional', c: 'pu', pc: '#9333ea' })), { k: 'success', l: 'Éxito', c: 'gn', pc: '#16a34a' }, { k: 'failure', l: 'Fallo', c: 'rd', pc: '#dc2626' }] },
  agente: { title: 'Editar Agente de IA', fields: [
    { t: 'note', l: 'El agente se arma en Agentes de IA. Aquí el bloque solo entrega o retoma la conversación.' },
    { k: 'act', t: 'cards', o: [['give', 'Entregar', 'El agente toma el chat.'], ['take', 'Quitar', 'Devuelve la conversación al flujo.']], d: 'give' },
    { k: 'agent', t: 'select', l: 'Agente', o: s => s.agents.map(a => [a.id, a.name]), ph: 'Seleccione un agente', emptyMsg: 'Aún no hay agentes. Créalos en Agentes de IA.', when: c => (c.act || 'give') === 'give' }],
    desc: (c, s) => (c.act || 'give') === 'take' ? 'Devuelve la conversación al flujo' : c.agent ? 'Agente: ' + (s.agents.find(a => a.id === c.agent)?.name || '—') : '', outs: c => (c.act || 'give') === 'take' ? null : [] },
  kanban: { title: 'Editar Kanban', fields: [
    { k: 'act', t: 'select', l: 'Acción *', o: [['create', 'Añadir'], ['remove', 'Quitar']], d: 'create', help: c => (c.act || 'create') === 'create' ? 'Crea una tarjeta en el Kanban seleccionado' : 'Quita la tarjeta del lead del Kanban seleccionado', dynHelp: 1 },
    { k: 'board', t: 'select', l: 'Seleccionar Kanban *', o: s => s.boards.map(b => [b.id, b.name]), ph: 'Seleccione un Kanban', emptyMsg: 'No hay Kanbans. Cree uno primero.' },
    { k: 'col', t: 'select', l: 'Columna *', o: (s, c) => (s.boards.find(b => b.id === c.board)?.cols || []).map(x => [x.id, x.name]), ph: 'Seleccione una columna', when: c => !!c.board && (c.act || 'create') === 'create' },
    { k: 'value', t: 'text', l: 'Valor (opcional)', ph: 'Ej.: 97,00 o {comprovante.valor}', when: c => !!c.board && (c.act || 'create') === 'create' }],
    desc: (c, s) => c.board ? `${(c.act || 'create') === 'create' ? 'Añadir a' : 'Quitar de'} ${s.boards.find(b => b.id === c.board)?.name || '—'}` : 'Crear o mover tarjeta en el Kanban seleccionado' },
  manipulador: { title: 'Editar manipulador', fields: [
    { k: 'var', t: 'vtext', l: 'Nombre de la variable a usar en el contacto:', ph: 'Ej.: Cuenta1' },
    { k: 'op', t: 'select', l: 'Elija la operación:', o: [['set_value', 'Definir valor'], ['add', 'Sumar al valor actual del campo'], ['sub', 'Restar del valor actual del campo'], ['mul', 'Multiplicar el valor actual del campo'], ['div', 'Dividir el valor actual del campo']], d: 'set_value' },
    { k: 'val', t: 'varea', l: 'Valor a guardar en el contacto', ph: 'Texto o variables como {full_name}', help: 'Las variables entre llaves se resuelven al ejecutar (ej.: {first_name}).' },
    { t: 'note2', l: 'El cambio aplica para el resto del flujo.' }],
    desc: c => c.var ? `${c.var} ${({ set_value: '=', add: '+=', sub: '-=', mul: '×=', div: '÷=' })[c.op || 'set_value']} ${c.val || ''}` : 'Actualizar la fecha de creación del contacto en la base o guardar un campo personalizado' },
  venta: { title: 'Editar venta aprobada', fields: [
    { t: 'note', l: 'Elige un producto y de dónde salen el importe y la moneda (p. ej. {comprovante.valor}). Fuera del rango del producto se usa el precio fallback.' },
    { k: 'prod', t: 'select', l: 'Producto', o: s => [...s.products.map(p => [p.id, p.name]), ['__new', '+ Crear producto nuevo…']], ph: 'Selecciona…' },
    { t: 'sec', l: 'Cliente, importe y moneda', help: 'Las mismas variables que en otros bloques (comprobante, IA, globales, etc.).' },
    { k: 'client', t: 'varea', l: 'Campo de nombre del cliente (plantilla)', d: '{comprovante.nome_pagador}', help: 'Predeterminado: {comprovante.nome_pagador}. Si el valor resuelto queda vacío, usa el nombre completo del contacto.' },
    { k: 'amount', t: 'varea', l: 'Campo de importe (plantilla)', d: '{comprovante.valor}' },
    { k: 'cur', t: 'cur', l: 'Moneda', ph: 'MXN, BRL o {comprovante.moeda}', d: '{comprovante.currency}', help: 'Variable — se resuelve al enviar. Si viene vacía, usa la moneda del producto.' },
    { t: 'sec', l: 'Notificación en la app', help: 'Personaliza el título y el subtítulo del push. Combina texto libre con variables de la venta o del flujo. Déjalo en blanco para usar los textos predeterminados.' },
    { k: 'ntitle', t: 'vtext', l: 'Título de la notificación (opcional)', help: 'Ej.: 🚀 ¡Nueva venta de {produto.nome}! También admite variables del flujo ({comprovante.valor}, {first_name}, etc.).' },
    { k: 'nsub', t: 'varea', l: 'Subtítulo de la notificación (opcional)', help: 'Ej.: {venda.cliente} pagó {venda.valor} por {produto.nome}.' },
    { t: 'sec', l: 'Emisión de facturas', link: 'Gestionar emisores / proveedores…', help: 'Si selecciona un proveedor de emisión con token válido, se dispara la emisión en cuanto este nodo guarde la venta.' },
    { k: 'nf', t: 'select', l: 'Proveedor de emisión (opcional)', o: s => [['', 'No emitir comprobante automáticamente'], ...s.ints.filter(i => i.prov === 'notasy').map(i => [i.id, i.label || 'Notasy NF-e'])], d: '' },
    { t: 'sec', l: 'Seguimiento LowTrack', link: 'Gestionar integraciones LowTrack…', help: 'Envía la venta automáticamente a LowTrack (Facebook CAPI).' },
    { k: 'lt', t: 'select', l: 'Integración LowTrack (opcional)', o: s => [['', 'No enviar a LowTrack'], ...s.ints.filter(i => i.prov === 'lowtrack').map(i => [i.id, i.label || 'LowTrack'])], d: '' },
    { t: 'sec', l: 'Seguimiento UTMify', link: 'Gestionar integraciones UTMify…', help: 'Envía la venta automáticamente a UTMify.' },
    { k: 'utm', t: 'select', l: 'Integración UTMify (opcional)', o: s => [['', 'No enviar a UTMify'], ...s.ints.filter(i => i.prov === 'utmify').map(i => [i.id, i.label || 'UTMify'])], d: '' }],
    desc: (c, s) => c.prod && c.prod !== '__new' ? 'Producto: ' + (s.products.find(p => p.id === c.prod)?.name || '—') : '' },
  pago: { title: 'Editar Pago', fields: [{ k: 'gw', t: 'select', l: 'GATEWAY', cap: 1, o: [['leonapay', 'Leona Pay'], ['xpag', 'XPag'], ['zenith', 'Zenith']], d: 'leonapay' }, { t: 'pay' }], desc: c => `${c.cur || 'BRL'} · ${c.value || '100,00'}`, outs: () => PAYOUTS },
  ariapay: { title: 'Editar Leona Pay', fields: [{ t: 'pay' }], desc: c => `${c.cur || 'BRL'} · ${c.value || '100,00'}`, outs: () => PAYOUTS },
  llamar: { title: 'Editar llamada', fields: [{ t: 'call' }], desc: c => (c.ring || 8) + 's' },
  kie: { title: 'Editar integración Kie.ai', fields: [{ t: 'kie' }], desc: c => c.gen ? ({ audio: 'Audio · ElevenLabs', image: 'Imagen', music: 'Música · Suno', video: 'Video · Veo 3.1' })[c.gen] : '', outs: () => [{ k: 'success', l: 'Éxito', c: 'gn', pc: '#16a34a' }, { k: 'failure', l: 'Fallo', c: 'rd', pc: '#dc2626' }] },
}
const PAYOUTS = [{ k: 'charge_created', l: 'Cobro generado', c: 'pu', pc: '#6366f1' }, { k: 'payment_approved', l: 'Pago aprobado', c: 'gn', pc: '#16a34a' }, { k: 'payment_expired', l: 'Pago expirado', c: 'or', pc: '#d97706' }, { k: 'error', l: 'Error', c: 'rd', pc: '#dc2626' }]
export const ESPERAR_OUTS = c => [{ k: 'main', l: 'Respuesta del cliente', c: 'pu', pc: '#9333ea' }, ...(c.forever ? [] : [{ k: 'timeout', l: 'O si no responde', s: `Após ${(c.wait || [1])[0]} ${({ seconds: 'segundo', minutes: 'minuto', hours: 'hora', days: 'día' })[(c.wait || [1, 'days'])[1]]}${(c.wait || [1])[0] > 1 ? 's' : ''}`, c: 'gr', pc: '#6b7280' }])]

const useStores = () => {
  const [flows] = useStore('flows', []); const [boards] = useStore('boards', []); const [deps] = useStore('departments', []); const [products] = useStore('products', [])
  const [pixels] = useStore('track_pixels', []); const [agents] = useStore('agents', []); const [ints] = useStore('integrations', [])
  return { flows, boards, deps, products, pixels, agents, ints }
}
export const useNodeStores = useStores

const IN = { height: 41, background: 'var(--in2)' }
function VBox({ v, set, ph, area }) {
  const El = area ? 'textarea' : 'input'
  return <div className="fe-vin"><El value={v || ''} onChange={e => set(e.target.value)} placeholder={ph} style={area ? { height: 70 } : null} /><button title="Insertar variable" onClick={() => set((v || '') + '{full_name}')}><Code size={16} /></button></div>
}
const Help = ({ children }) => <div className="fe-small" style={{ marginTop: 6 }}>{children}</div>
const Lb = ({ children, cap }) => <div className="fe-lb" style={cap ? { fontSize: 11.5, letterSpacing: '.05em', color: 'var(--muted)' } : null}>{children}</div>

function Field({ f, c, set, s, flowId }) {
  const toast = useToast(); const v = c[f.k] ?? (typeof f.d === 'function' ? undefined : f.d)
  const u = val => set({ [f.k]: val })
  const opts = typeof f.o === 'function' ? f.o(f.dyn ? c : s, c) : f.o
  const help = typeof f.help === 'function' ? f.help(c) : f.help
  switch (f.t) {
    case 'switch': return <div className={f.box ? 'fe-blk' : ''} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, ...(f.box ? { padding: '13px 15px', marginBottom: 0 } : {}) }}><div style={{ flex: 1 }}><div style={{ fontSize: 13.3, fontWeight: 600 }}>{f.l}</div>{help && <Help>{help}</Help>}</div><Toggle on={!!v} onChange={u} /></div>
    case 'text': case 'password': return <><Lb>{f.l}</Lb><input className="l-in" type={f.t === 'password' ? 'password' : 'text'} style={IN} value={v || ''} onChange={e => u(e.target.value)} placeholder={f.ph} />{help && <Help>{help}</Help>}</>
    case 'vtext': return <><Lb>{f.l}</Lb><VBox v={v} set={u} ph={f.ph} />{help && <Help>{help}</Help>}</>
    case 'area': return <><Lb>{f.l}</Lb><textarea className="l-in" style={{ ...IN, height: 92, padding: '11px 13px', resize: 'vertical' }} value={v || ''} onChange={e => u(e.target.value)} placeholder={f.ph} />{help && <Help>{help}</Help>}</>
    case 'varea': return <><Lb>{f.l}</Lb><VBox area v={v} set={u} ph={f.ph} />{help && <Help>{help}</Help>}</>
    case 'select': return <><Lb cap={f.cap}>{f.l}</Lb>{opts.length || !f.emptyMsg ? <LSelect className="l-in" bold value={v ?? ''} onChange={val => { if (val === '__new') { toast('Cree el producto en Configuración › Productos', 'info'); return } u(val) }} placeholder={f.ph} options={opts.map(([value, label]) => ({ value, label }))} /> : <div style={{ border: '1px dashed var(--border2)', borderRadius: 7, padding: '13px 14px', fontSize: 13.3, color: 'var(--soft)' }}>{f.emptyMsg}</div>}{help && <Help>{help}</Help>}</>
    case 'time': { const t = v || f.d; return <><Lb>{f.l}</Lb><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}><input className="l-in" type="number" min="1" style={{ ...IN, fontWeight: 700 }} value={t[0]} onChange={e => u([Math.max(1, +e.target.value || 1), t[1]])} /><LSelect className="l-in" bold value={t[1]} onChange={x => u([t[0], x])} options={f.u.map(([value, label]) => ({ value, label }))} /></div>{help && <Help>{help}</Help>}</> }
    case 'seg': return <><Lb>{f.l}</Lb><div className="fe-seg">{opts.map(([k, l]) => <button key={k} className={(v || f.d) === k ? 'on' : ''} onClick={() => u(k)}>{l}</button>)}</div></>
    case 'radio': return <><Lb>{f.l}</Lb>{opts.map(([k, l, b]) => <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.3, color: 'var(--soft)', marginBottom: 9, cursor: 'pointer' }}><input type="radio" checked={(v || f.d) === k} onChange={() => u(k)} style={{ accentColor: '#8b5cf6' }} />{l} <b style={{ color: 'var(--text)' }}>{b}</b></label>)}</>
    case 'cards': return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{opts.map(([k, l, d]) => <button key={k} onClick={() => u(k)} style={{ textAlign: 'left', padding: '13px 14px', borderRadius: 8, border: '1px solid ' + ((v || f.d) === k ? '#8b5cf6' : 'var(--border2)'), background: (v || f.d) === k ? 'rgba(139,92,246,.12)' : 'transparent', color: 'var(--text)' }}><b style={{ fontSize: 14 }}>{l}</b><div style={{ fontSize: 12, color: 'var(--soft)', marginTop: 4 }}>{d}</div></button>)}</div>
    case 'clock': return <><Lb>{f.l}</Lb><input className="l-in" type="time" style={IN} value={v || f.d} onChange={e => u(e.target.value)} /></>
    case 'datetime': return <><Lb>{f.l}</Lb><input className="l-in" type="datetime-local" style={IN} value={v || ''} onChange={e => u(e.target.value)} />{help && <Help>{help}</Help>}</>
    case 'days': { const d = v || [1, 2, 3, 4, 5]; return <><Lb>{f.l}</Lb><div style={{ display: 'flex', gap: 6 }}>{['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((x, i) => <button key={i} onClick={() => u(d.includes(i) ? d.filter(y => y !== i) : [...d, i])} style={{ width: 38, height: 38, borderRadius: 8, fontWeight: 700, fontSize: 13, border: '1px solid ' + (d.includes(i) ? '#8b5cf6' : 'var(--border2)'), background: d.includes(i) ? '#8b5cf6' : 'transparent', color: d.includes(i) ? '#fff' : 'var(--soft)' }}>{x}</button>)}</div>{help && <Help>{help}</Help>}</> }
    case 'cur': return <><div style={{ display: 'flex', alignItems: 'center' }}><Lb>{f.l}</Lb><span style={{ marginLeft: 'auto', fontSize: 12, color: '#c084fc', marginBottom: 9 }}>{'<>'} Variables</span></div><input className="l-in" style={IN} value={v ?? ''} onChange={e => u(e.target.value)} placeholder={f.ph} />
      {/^[A-Z]{3}$/.test(v || '') && <div style={{ fontSize: 12, color: '#4ade80', marginTop: 6 }}>OK · {v}</div>}{help && <Help>{help}</Help>}</>
    case 'phone': { const p = v || { cc: '+55', n: '' }; return <><Lb>{f.l}</Lb><div style={{ display: 'flex', gap: 8 }}><LSelect className="l-in" bold value={p.cc} onChange={cc => u({ ...p, cc })} options={[['+55', '+55 Brasil'], ['+51', '+51 Perú'], ['+52', '+52 México'], ['+57', '+57 Colombia'], ['+54', '+54 Argentina'], ['+56', '+56 Chile'], ['+1', '+1 EE. UU.'], ['+34', '+34 España']].map(([value, label]) => ({ value, label }))} style={{ width: 150, flexShrink: 0 }} />
      <input className="l-in" style={IN} inputMode="tel" value={p.n} onChange={e => u({ ...p, n: e.target.value.replace(/[^\d ]/g, '') })} placeholder={'número sin ' + p.cc} /></div></> }
    case 'flowpick': { const [q, setQ] = useState(''); const list = s.flows.filter(x => x.id !== flowId && x.name.toLowerCase().includes(q.toLowerCase())); const cur = s.flows.find(x => x.id === v)
      return <><Lb>{f.l}</Lb><div className="fe-vin" style={{ alignItems: 'center' }}><Search size={15} color="#8f8a9e" style={{ marginLeft: 13 }} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={cur ? cur.name : f.ph} style={{ height: 41 }} /></div>
        <div style={{ marginTop: 8, maxHeight: 220, overflowY: 'auto' }}>{list.map(x => <button key={x.id} className={'l-opt' + (x.id === v ? ' on' : '')} onClick={() => u(x.id)}>{x.name}</button>)}{!list.length && <div className="fe-small" style={{ padding: 8 }}>Ningún flujo encontrado.</div>}</div></> }
    case 'list': { const L = v || (typeof f.d === 'function' ? f.d() : []); if (!c[f.k] && typeof f.d === 'function') setTimeout(() => u(L)); return <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}><b style={{ fontSize: 13.3 }}>{f.l}</b><button className="lb2 p sm" style={{ marginLeft: 'auto', height: 34 }} disabled={f.max && L.length >= f.max} onClick={() => u([...L, { id: uid(), ...(f.item.find(i => i.o) ? { [f.item.find(i => i.o).k]: f.item.find(i => i.o).o[0][0] } : {}) }])}><Plus size={15} />{f.add}</button></div>
      {help && <div className="fe-small" style={{ marginTop: -4, marginBottom: 10 }}>{help}</div>}
      {L.length === 0 ? f.empty && <div style={{ border: '1.5px dashed var(--border2)', borderRadius: 7, padding: '18px 16px', textAlign: 'center', fontSize: 13.3, color: 'var(--soft)' }}>{f.empty}</div>
        : L.map(it => <div key={it.id} className="fe-opt">{f.item.filter(i => !i.when || i.when(it)).map(i => i.o ? <select key={i.k} className="l-in" style={{ ...IN, height: 38, flex: 1 }} value={it[i.k]} onChange={e => u(L.map(x => x.id === it.id ? { ...x, [i.k]: e.target.value } : x))}>{i.o.map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
          : <input key={i.k} className="l-in" type={i.num ? 'number' : 'text'} style={{ ...IN, height: 38, flex: i.w ? 'none' : 1, width: i.w }} value={it[i.k] ?? ''} placeholder={i.ph} onChange={e => u(L.map(x => x.id === it.id ? { ...x, [i.k]: i.num ? +e.target.value : e.target.value } : x))} />)}
          <button className="ch-ib" onClick={() => u(L.filter(x => x.id !== it.id))}><Trash2 size={15} /></button></div>)}
      {f.k === 'outs' && L.length > 0 && <Help>Suma: {L.reduce((a, x) => a + (+x.pct || 0), 0)}%{L.reduce((a, x) => a + (+x.pct || 0), 0) !== 100 && ' — debería ser 100%'}</Help>}</> }
    case 'how': return <div className="fe-how"><Info size={17} color="var(--soft)" style={{ flexShrink: 0, marginTop: 2 }} /><div><b>Cómo funciona</b><p>{f.l}</p></div></div>
    case 'note': return <div style={{ fontSize: 13.3, color: 'var(--soft)', lineHeight: 1.5 }}>{f.l}</div>
    case 'note2': return <div style={{ fontSize: 12.5, color: '#a78bfa' }}>{f.l}</div>
    case 'h': return <b style={{ fontSize: 13.3 }}>{f.l}</b>
    case 'sec': return <div style={{ borderTop: '1px solid var(--border)', paddingTop: 15 }}><div style={{ display: 'flex' }}><b style={{ fontSize: 14 }}>{f.l}</b>{f.link && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#c084fc' }}>{f.link}</span>}</div>{help && <Help>{help}</Help>}</div>
    case 'pay': return <Pay c={c} set={set} />
    case 'call': return <Call c={c} set={set} />
    case 'kie': return <Kie c={c} set={set} />
    case 'http': return <Http c={c} set={set} />
    default: return null
  }
}

function Pay({ c, set }) {
  const [vars, setVars] = useState(false); const [ints] = useStore('integrations', []); const pays = ints.filter(i => ['leonapay', 'xpag', 'zenith'].includes(i.prov))
  return <>
    <Lb cap>CLAVE</Lb><div className="fe-small" style={{ marginTop: -4 }}>Elige la empresa en Integraciones. La clave se genera y queda lista. Si hay más de una, elige aquí cuál cobra.</div>
    {pays.length ? <div style={{ marginTop: 9 }}><LSelect className="l-in" bold value={c.int || pays[0].id} onChange={v => set({ int: v })} options={pays.map(p => ({ value: p.id, label: p.label || p.prov }))} /></div> : <div style={{ fontSize: 12.5, color: '#c084fc', marginTop: 8 }}>Registrar en Integraciones → Pagos</div>}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 16 }}>
      <div><div style={{ display: 'flex' }}><Lb cap>MONEDA</Lb><span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#c084fc' }}>Insertar variable</span></div><LSelect className="l-in" bold value={c.cur || 'BRL'} onChange={v => set({ cur: v })} options={[['BRL', '🇧🇷 BRL'], ['MXN', '🇲🇽 MXN'], ['COP', '🇨🇴 COP'], ['EUR', '🇪🇺 EUR'], ['CLP', '🇨🇱 CLP']].map(([value, label]) => ({ value, label }))} /></div>
      <div><div style={{ display: 'flex' }}><Lb cap>VALOR</Lb><button style={{ marginLeft: 'auto', fontSize: 11.5, color: '#c084fc', marginBottom: 9 }} onClick={() => set({ value: '{comprovante.valor}' })}>Insertar variable</button></div><input className="l-in" style={{ ...IN, fontWeight: 700, opacity: c.noAmount ? .5 : 1 }} disabled={c.noAmount} value={c.value ?? '100,00'} onChange={e => set({ value: e.target.value })} /></div></div>
    <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'flex-start' }}><div style={{ flex: 1 }}><b style={{ fontSize: 13.3 }}>QR sin monto</b><Help>Genera el QR PIX reutilizable sin monto. El lead paga lo que quiera. Nombre, correo, teléfono y documento salen solos. Después del pago, usa {'{gateway.value}'}.</Help></div><Toggle on={!!c.noAmount} onChange={v => set({ noAmount: v })} /></div>
    <div style={{ marginTop: 16 }}><Lb cap>MEDIO DE PAGO</Lb><LSelect className="l-in" bold value={c.method || 'PIX'} onChange={v => set({ method: v })} options={[{ value: 'PIX', label: 'PIX' }, { value: 'Boleto', label: 'Boleto' }]} /><Help>Nombre, correo y documento salen solos. El teléfono es el del lead.</Help></div>
    <button onClick={() => setVars(!vars)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginTop: 16, fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', color: 'var(--soft)' }}><ChevronDown size={15} style={{ transform: vars ? 'rotate(180deg)' : '' }} />VARIABLES TRAS EL COBRO</button>
    {vars && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>{PAYVARS.map(x => <code key={x} className="ct-tag" style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigator.clipboard?.writeText(x)}>{x}</code>)}</div>}
  </>
}
function Call({ c, set }) {
  const r = c.ring || 8; const src = c.src || 'file'
  const pick = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.mp3,.ogg,.m4a,audio/*'; i.onchange = () => { const f = i.files[0]; if (f && f.size <= 16 * 1048576) set({ file: f.name }) }; i.click() }
  return <><div style={{ border: '1px solid rgba(20,184,166,.4)', background: 'rgba(20,184,166,.07)', borderRadius: 9, padding: '14px 15px' }}><b style={{ fontSize: 14 }}>Llamada al lead</b><Help>Marca el número del contacto automáticamente.</Help></div>
    <div style={{ display: 'flex', marginTop: 16, fontSize: 13.3 }}><b>Tiempo de toque</b><b style={{ marginLeft: 'auto', color: '#2dd4bf' }}>{r}s</b></div>
    <input type="range" className="fe-rng" min="1" max="15" value={r} onChange={e => set({ ring: +e.target.value })} style={{ marginTop: 9, background: `linear-gradient(90deg,#14b8a6 ${(r - 1) / 14 * 100}%,#374151 0)` }} />
    <div style={{ display: 'flex', fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}><span>1s</span><span style={{ marginLeft: 'auto' }}>15s</span></div>
    <Help>De 1 a 15 segundos. WhatsApp corta la llamada en ese límite y el flujo solo sigue después.</Help>
    <div className="fe-warn" style={{ marginTop: 12 }}>Solo funciona en conexiones no oficiales (UAZAPI).<br />Puede aumentar la tasa de bloqueo de la instancia.</div>
    <div style={{ marginTop: 16 }}><b style={{ fontSize: 13.3 }}>Audio (opcional)</b><Help>Sube el archivo en el bloque o pega una URL (puede ser variable). Sin audio, queda solo el toque.</Help></div>
    <div className="fe-seg" style={{ marginTop: 10 }}>{[['file', 'Archivo', Upload], ['url', 'URL', Link2]].map(([k, l, I]) => <button key={k} className={src === k ? 'on' : ''} onClick={() => set({ src: k })}><I size={14} />{l}</button>)}</div>
    {src === 'file' ? <div className="fe-drop" style={{ borderColor: '#14b8a6', background: 'rgba(20,184,166,.06)' }}><small>{c.file || 'MP3, OGG, M4A. Máximo 16MB.'}</small><button className="bt" style={{ background: '#0d9488' }} onClick={pick}>Subir audio</button></div>
      : <input className="l-in" style={IN} value={c.url || ''} onChange={e => set({ url: e.target.value })} placeholder="https://ejemplo.com/audio.mp3 o {audio_url}" />}</>
}
function Kie({ c, set }) {
  const g = c.gen || 'audio'
  const GEN = [['audio', 'Audio', 'Generar voz con ElevenLabs', Mic], ['image', 'Imagen', 'Generar imágenes', Image], ['music', 'Música', 'Música con Suno desde prompts', Music], ['video', 'Video', 'Veo 3.1 o WAN 3.0. Texto con variables y fotos de referencia.', Video]]
  const MOD = { audio: [['elevenlabs/text-to-speech-multilingual-v2', 'ElevenLabs Multilíngue (Mais natural, ótimo em português)'], ['elevenlabs/text-to-speech-turbo', 'ElevenLabs Turbo (Mais rápido e econômico)']], image: [['nano-banana', 'Nano Banana'], ['seedream', 'Seedream 4'], ['flux', 'Flux Kontext']], music: [['suno-v5', 'Suno V5'], ['suno-v4.5', 'Suno V4.5']], video: [['veo3.1', 'Veo 3.1'], ['veo3.1-fast', 'Veo 3.1 Fast'], ['wan3', 'WAN 3.0']] }
  return <><div style={{ border: '1px solid rgba(217,70,239,.4)', background: 'rgba(217,70,239,.07)', borderRadius: 9, padding: '14px 15px' }}><b style={{ fontSize: 14 }}>Integración Kie.ai</b><Help>Bloque nativo para generación de audio, imagen y video (Veo)</Help></div>
    <div style={{ marginTop: 16 }}><Lb>API key de Kie.ai</Lb><input className="l-in" style={IN} value={c.key || ''} onChange={e => set({ key: e.target.value })} placeholder="{minha_key_kie}" /><div style={{ fontSize: 12, color: '#c084fc', marginTop: 6 }}>Cómo obtener tu API key</div></div>
    <div style={{ marginTop: 16 }}><Lb>¿Qué generar?</Lb><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>{GEN.map(([k, l, d, I]) => <button key={k} onClick={() => set({ gen: k, model: MOD[k][0][0] })} style={{ textAlign: 'left', padding: '12px 13px', borderRadius: 8, border: '1px solid ' + (g === k ? '#d946ef' : 'var(--border2)'), background: g === k ? 'rgba(217,70,239,.1)' : 'transparent', color: 'var(--text)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13.5 }}><I size={15} color="#e879f9" />{l}</div><div style={{ fontSize: 11.5, color: 'var(--soft)', marginTop: 4, lineHeight: 1.4 }}>{d}</div></button>)}</div></div>
    <div style={{ marginTop: 16 }}><Lb>Modelo</Lb><LSelect className="l-in" bold value={c.model || MOD[g][0][0]} onChange={v => set({ model: v })} options={MOD[g].map(([value, label]) => ({ value, label }))} /></div>
    <div style={{ marginTop: 16 }}><Lb>{g === 'audio' ? 'Texto' : 'Prompt'}</Lb><textarea className="l-in" style={{ ...IN, height: 86, padding: '11px 13px' }} value={c.text || ''} onChange={e => set({ text: e.target.value })} placeholder={g === 'audio' ? 'Olá {nome}, bem-vindo!' : 'Describe lo que quieres generar…'} /></div>
    {g === 'audio' && <div style={{ marginTop: 16 }}><Lb>Voz</Lb><LSelect className="l-in" bold value={c.voice || 'Rachel'} onChange={v => set({ voice: v })} options={['Rachel (feminina calma)', 'Adam (masculina grave)', 'Bella (feminina suave)', 'Antoni (masculina natural)', 'Elli (feminina jovem)', 'Josh (masculina profunda)'].map(x => ({ value: x.split(' ')[0], label: x }))} /></div>}
    <div style={{ marginTop: 16 }}><Lb>Campo para guardar el resultado</Lb><input className="l-in" style={IN} value={c.save ?? 'kie.url'} onChange={e => set({ save: e.target.value })} /></div></>
}
function Http({ c, set }) {
  const toast = useToast(); const [tab, setTab] = useState('head'); const [curl, setCurl] = useState(null)
  const parse = () => { const t = curl || ''; const m = t.match(/-X\s+(\w+)/); const url = t.match(/['"]?(https?:\/\/[^\s'"]+)/); const hs = [...t.matchAll(/-H\s+['"]([^:]+):\s*([^'"]+)['"]/g)]; const body = t.match(/(?:--data|-d)(?:-raw)?\s+['"]([\s\S]*?)['"]\s*$/)
    set({ method: m ? m[1].toUpperCase() : body ? 'POST' : 'GET', url: url ? url[1] : c.url, headers: hs.length ? JSON.stringify(Object.fromEntries(hs.map(h => [h[1].trim(), h[2].trim()])), null, 2) : c.headers, body: body ? body[1] : c.body }); setCurl(null); toast('cURL importado') }
  return <><Lb>Tipo de petición POST/PUT/GET *</Lb>
    <div style={{ display: 'flex', gap: 8 }}><button className="lb2 g" style={{ minWidth: 0 }} onClick={() => setCurl('')}>Pegar cURL</button><LSelect className="l-in" bold value={c.method || 'GET'} onChange={v => set({ method: v })} options={['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(x => ({ value: x, label: x }))} style={{ flex: 1 }} /></div>
    {curl != null && <div style={{ marginTop: 10 }}><textarea className="l-in" style={{ ...IN, height: 90, padding: 11, fontFamily: 'ui-monospace,monospace', fontSize: 12 }} autoFocus value={curl} onChange={e => setCurl(e.target.value)} placeholder="curl -X POST https://api… -H 'Content-Type: application/json' -d '{…}'" /><div style={{ display: 'flex', gap: 8, marginTop: 7 }}><button className="lb2 p sm" onClick={parse}>Importar</button><button className="lb2 g sm" onClick={() => setCurl(null)}>Cancelar</button></div></div>}
    <div style={{ marginTop: 16 }}><Lb>URL de la petición *</Lb><VBox v={c.url} set={v => set({ url: v })} ph="https://api.ejemplo.com/endpoint" /><Help>Use variables como {'{nombre}'}, {'{phone_number}'}, {'{email}'} para sustituir valores dinámicamente</Help></div>
    <div className="fe-seg" style={{ marginTop: 16 }}>{[['head', 'Cabecera de la petición'], ['body', 'Cuerpo de la petición'], ['map', 'Mapear respuesta']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)} style={{ fontSize: 12 }}>{l}</button>)}</div>
    {tab === 'map' ? <><div style={{ display: 'flex', alignItems: 'center', marginBottom: 9 }}><b style={{ fontSize: 13.3 }}>Mapear respuesta</b><button className="lb2 p sm" style={{ marginLeft: 'auto', height: 32 }} onClick={() => set({ map: [...(c.map || []), { id: uid(), path: '', field: '' }] })}><Plus size={14} />Añadir</button></div>
      {(c.map || []).map(m => <div key={m.id} className="fe-opt"><input className="l-in" style={{ ...IN, height: 38 }} placeholder="data.id" value={m.path} onChange={e => set({ map: c.map.map(x => x.id === m.id ? { ...x, path: e.target.value } : x) })} /><input className="l-in" style={{ ...IN, height: 38 }} placeholder="campo_del_contacto" value={m.field} onChange={e => set({ map: c.map.map(x => x.id === m.id ? { ...x, field: e.target.value } : x) })} /><button className="ch-ib" onClick={() => set({ map: c.map.filter(x => x.id !== m.id) })}><Trash2 size={15} /></button></div>)}
      {!(c.map || []).length && <Help>Guarde valores de la respuesta en campos del contacto (ej.: data.id → pedido_id).</Help>}</>
      : <><div style={{ display: 'flex', alignItems: 'center', marginBottom: 9 }}><b style={{ fontSize: 13.3 }}>{tab === 'head' ? 'Datos de cabecera' : 'Cuerpo (JSON)'}</b><button className="lb2 g sm" style={{ marginLeft: 'auto', height: 32, minWidth: 0 }} onClick={() => { if (!c.url) return toast('Escriba la URL primero', 'err'); toast('La prueba de peticiones requiere el servidor de Leona', 'info') }}>Probar petición</button></div>
        <textarea className="l-in" style={{ ...IN, height: 120, padding: 11, fontFamily: 'ui-monospace,monospace', fontSize: 12.5 }} value={(tab === 'head' ? c.headers : c.body) || ''} onChange={e => set({ [tab === 'head' ? 'headers' : 'body']: e.target.value })} placeholder={tab === 'head' ? '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {token}",\n  "X-API-Key": "tu-clave-api"\n}' : '{\n  "nombre": "{full_name}",\n  "telefono": "{phone_number}"\n}'} />
        <Help>Formato JSON. Ejemplo: {'{"Content-Type": "application/json"}'}</Help></>}</>
}

export function GenericNodeModal({ node, def, color, icon, onClose, onSave, flowId }) {
  const s = useStores(); const [c, setC] = useState(node.cfg || {})
  const set = p => setC(x => ({ ...x, ...p }))
  const fs = def.fields.filter(f => !f.when || f.when(c))
  const req = fs.filter(f => f.req).every(f => f.t === 'phone' ? (c[f.k]?.n || '').replace(/\D/g, '').length >= 6 : (c[f.k] || '').toString().trim())
  return <div className="lm-ov" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="lm" style={{ maxWidth: 540, maxHeight: '94vh' }}>
    <div className="fe-mh"><span className="ic" style={{ background: color }}>{icon}</span><h2>{def.title}</h2><button style={{ marginLeft: 'auto', color: 'var(--muted)', display: 'grid' }} onClick={onClose}><X size={19} /></button></div>
    <div className="lm-b" style={{ padding: '20px 24px 0', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{fs.map((f, i) => <div key={f.k || i} style={f.half ? { display: 'inline-block' } : null}><Field f={f} c={c} set={set} s={s} flowId={flowId} /></div>)}</div>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 18, padding: '14px 0 20px', display: 'flex', justifyContent: 'flex-end', gap: 11 }}>
        <button className="lb2 g" onClick={onClose}>Cancelar</button><button className="lb2 p" disabled={!req} onClick={() => onSave({ ...node, cfg: c, desc: def.desc ? def.desc(c, s) : node.desc })}>Guardar</button></div>
    </div></div></div>
}

/* Carrusel */
export const carOuts = c => { const cards = c.cards || []; const r = []; cards.forEach((k, i) => (k.buttons || []).forEach((b, j) => { if ((b.type || 'reply') === 'reply') r.push({ k: 'b' + b.id, l: k.text ? `${i + 1}. ${b.title || 'Opción'}` : 'Respuesta al botón', s: b.title || 'Opción A', c: 'pu', pc: '#9333ea' }) }))
  return [...r, { k: 'fallback', l: 'Texto libre (fallback)', c: 'or', pc: '#d97706' }, { k: 'timeout', l: 'Timeout: sin toque REPLY a tiempo', c: 'gr', pc: '#6b7280' }] }
export const carBlank = () => ({ id: uid(), text: '', src: 'file', img: '', url: '', buttons: [{ id: uid(), type: 'reply', title: 'Opción A', val: '' }] })
export function CarouselModal({ node, onClose, onSave }) {
  const toast = useToast()
  const [c, setC] = useState({ exp: 0, unit: 'days', intro: 'Elige una opción abajo', cards: [carBlank()], ...(node.cfg || {}) })
  const set = p => setC(x => ({ ...x, ...p })); const card = (id, p) => set({ cards: c.cards.map(k => k.id === id ? { ...k, ...p } : k) })
  const [drag, setDrag] = useState(null)
  const pick = id => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/jpeg,image/png,image/webp'; i.onchange = () => { const f = i.files[0]; if (!f) return; if (f.size > 20 * 1048576) return toast('Máx. 20MB', 'err'); const r = new FileReader(); r.onload = () => card(id, { img: f.size < 1.5 * 1048576 ? r.result : '', fname: f.name }); r.readAsDataURL(f) }; i.click() }
  const ok = c.cards.length && c.cards.every(k => k.text.trim())
  const nb = c.cards.reduce((a, k) => a + (k.buttons || []).filter(b => (b.type || 'reply') === 'reply').length, 0)
  return <div className="lm-ov" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="lm" style={{ maxWidth: 560, maxHeight: '94vh' }}>
    <div className="fe-mh"><span className="ic" style={{ background: '#0ea5e9' }}><LayoutGridI /></span><h2>Editar carrusel</h2><button style={{ marginLeft: 'auto', color: 'var(--muted)', display: 'grid' }} onClick={onClose}><X size={19} /></button></div>
    <div className="lm-b" style={{ padding: '20px 24px 0', overflowY: 'auto' }}>
      <Lb>Tiempo de expiración</Lb><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}><input className="l-in" type="number" min="0" style={{ ...IN, fontWeight: 700 }} value={c.exp} onChange={e => set({ exp: Math.max(0, +e.target.value || 0) })} /><LSelect className="l-in" bold value={c.unit} onChange={v => set({ unit: v })} options={U4.map(([value, label]) => ({ value, label }))} /></div>
      <Help>Si es 0, el valor por defecto es 2 días. Después de ese tiempo sin toque en un botón REPLY, el flujo sigue por la salida de timeout.</Help>
      <div style={{ marginTop: 16 }}><Lb>Texto introductorio (sobre las tarjetas)</Lb><textarea className="l-in" style={{ ...IN, height: 74, padding: '11px 13px' }} value={c.intro} onChange={e => set({ intro: e.target.value })} placeholder="Texto mostrado sobre el carrusel en WhatsApp…" /></div>
      <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0 10px' }}><b style={{ fontSize: 14 }}>Tarjetas del carrusel</b><span className="fe-small" style={{ marginLeft: 'auto' }}>Tarjetas: {c.cards.length} · Botones REPLY: {nb}</span></div>
      {c.cards.map((k, i) => <div key={k.id} className="fe-blk" draggable onDragStart={() => setDrag(k.id)} onDragOver={e => e.preventDefault()} onDrop={() => { if (!drag || drag === k.id) return; const a = [...c.cards]; const from = a.findIndex(x => x.id === drag); const [m] = a.splice(from, 1); a.splice(i, 0, m); set({ cards: a }); setDrag(null) }} style={{ padding: 15, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><GripI /><b style={{ fontSize: 13.5 }}>Tarjeta {i + 1}</b>{c.cards.length > 1 && <button className="ch-ib" style={{ marginLeft: 'auto' }} onClick={() => set({ cards: c.cards.filter(x => x.id !== k.id) })}><Trash2 size={15} /></button>}</div>
        <Lb>Texto de la tarjeta (obligatorio)</Lb><textarea className="l-in" style={{ ...IN, height: 64, padding: '10px 12px' }} value={k.text} onChange={e => card(k.id, { text: e.target.value })} placeholder="Escriba la leyenda..." />
        <div style={{ marginTop: 14 }}><Lb>Imagen de la tarjeta</Lb><Help>El carrusel de WhatsApp aquí es solo imagen. Archivo o URL (variables permitidas). Máx. 20MB.</Help>
          <div className="fe-seg" style={{ marginTop: 9 }}>{[['file', 'Archivo', Upload], ['url', 'URL', Link2]].map(([s, l, I]) => <button key={s} className={k.src === s ? 'on' : ''} onClick={() => card(k.id, { src: s })}><I size={14} />{l}</button>)}</div>
          {k.src === 'file' ? <div className="fe-drop">{k.img ? <img src={k.img} style={{ maxHeight: 90, borderRadius: 6 }} /> : <small>{k.fname || '2MB JPG, PNG o WEBP'}</small>}<button className="bt" onClick={() => pick(k.id)}>Enviar imagen</button></div>
            : <input className="l-in" style={IN} value={k.url} onChange={e => card(k.id, { url: e.target.value })} placeholder="https://… o {imagen_url}" />}</div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 9px' }}><b style={{ fontSize: 13.3 }}>Botones (máx. 3 por tarjeta)</b><button className="lb2 p sm" style={{ marginLeft: 'auto', height: 32 }} disabled={k.buttons.length >= 3} onClick={() => card(k.id, { buttons: [...k.buttons, { id: uid(), type: 'reply', title: 'Opción ' + 'ABC'[k.buttons.length], val: '' }] })}><Plus size={14} />Añadir botón</button></div>
        {k.buttons.map(b => { const ub = p => card(k.id, { buttons: k.buttons.map(x => x.id === b.id ? { ...x, ...p } : x) }); return <div key={b.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 11, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}><div style={{ width: 140 }}><Lb>Tipo</Lb><LSelect className="l-in" bold value={b.type} onChange={v => ub({ type: v })} options={[['reply', 'Respuesta'], ['url', 'URL'], ['copy', 'Copiar'], ['call', 'Llamada']].map(([value, label]) => ({ value, label }))} /></div>
            <div style={{ flex: 1 }}><Lb>Título del botón</Lb><input className="l-in" style={IN} maxLength={20} value={b.title} onChange={e => ub({ title: e.target.value })} /></div>
            {k.buttons.length > 1 && <button className="ch-ib" style={{ alignSelf: 'flex-end', marginBottom: 4 }} onClick={() => card(k.id, { buttons: k.buttons.filter(x => x.id !== b.id) })}><Trash2 size={15} /></button>}</div>
          {b.type !== 'reply' && <input className="l-in" style={{ ...IN, marginTop: 8 }} value={b.val} onChange={e => ub({ val: e.target.value })} placeholder={{ url: 'https://ejemplo.com', copy: 'Código a copiar', call: '+55 11 99999-9999' }[b.type]} />}</div> })}
      </div>)}
      <button className="lb2 g" style={{ width: '100%' }} disabled={c.cards.length >= 10} onClick={() => set({ cards: [...c.cards, carBlank()] })}><Plus size={15} />Añadir tarjeta</button>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 18, padding: '14px 0 20px', display: 'flex', justifyContent: 'flex-end', gap: 11 }}>
        <button className="lb2 g" onClick={onClose}>Cancelar</button><button className="lb2 p" disabled={!ok} onClick={() => onSave({ ...node, cfg: c, desc: '📝 ' + (c.intro || 'Elige una opción abajo') })}>Guardar</button></div>
    </div></div></div>
}
const LayoutGridI = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
const GripI = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="#8f8a9e"><circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" /></svg>
