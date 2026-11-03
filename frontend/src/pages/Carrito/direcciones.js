import { validarCarritoActual } from './carrito.js'

export const CLAVE_DIRECCIONES = 'laguito-libre.direcciones.v1'
export const EVENTO_DIRECCIONES = 'laguito-libre:direcciones-actualizadas'

export const CAMPOS_DIRECCION = [
  { nombre: 'destinatario', etiqueta: 'Nombre completo', maximo: 100, autocompletar: 'shipping name', obligatorio: true, fila: 1 },
  { nombre: 'telefono', etiqueta: 'Teléfono', maximo: 15, tipo: 'tel', autocompletar: 'shipping tel', obligatorio: true, fila: 1 },
  { nombre: 'direccion', etiqueta: 'Dirección (calle y número)', maximo: 240, autocompletar: 'shipping street-address', obligatorio: true, fila: 2 },
  { nombre: 'ciudad', etiqueta: 'Ciudad', maximo: 80, autocompletar: 'shipping address-level2', obligatorio: true, fila: 3 },
  { nombre: 'region', etiqueta: 'Región/Estado', maximo: 80, autocompletar: 'shipping address-level1', obligatorio: true, fila: 3 },
  { nombre: 'codigoPostal', etiqueta: 'Cód. postal', maximo: 16, autocompletar: 'shipping postal-code', fila: 3 },
]

const texto = (valor) => typeof valor === 'string' ? valor.trim().replace(/\s+/g, ' ') : ''

export function direccionVacia() {
  return { ...Object.fromEntries(CAMPOS_DIRECCION.map(({ nombre }) => [nombre, ''])), predeterminada: false }
}

// Se aplica al valor propuesto completo, también al pegar, soltar texto o autocompletar.
export function esTelefonoPermitido(valor) {
  return typeof valor === 'string' && valor.length <= 15 && !/[^0-9]/.test(valor)
}

export function validarDireccion(datos) {
  const errores = {}
  for (const campo of CAMPOS_DIRECCION) {
    const valor = texto(datos?.[campo.nombre])
    if (campo.obligatorio && !valor) errores[campo.nombre] = 'Completa este campo.'
    else if (valor.length > campo.maximo) errores[campo.nombre] = `Usa hasta ${campo.maximo} caracteres.`
  }
  const telefono = datos?.telefono ?? ''
  if (telefono && (!esTelefonoPermitido(telefono) || telefono.length < 8)) {
    errores.telefono = 'Ingresa entre 8 y 15 dígitos, sin espacios ni símbolos.'
  }
  return errores
}

function normalizar(datos) {
  if (Object.keys(validarDireccion(datos)).length) throw new Error('Revisa los datos de la dirección.')
  const direccion = Object.fromEntries(CAMPOS_DIRECCION.map(({ nombre }) => [nombre, texto(datos[nombre])]))
  // Estos datos podían existir antes del nuevo modal. Se conservan al editar.
  if (typeof datos.alias === 'string') direccion.alias = texto(datos.alias)
  if (typeof datos.referencia === 'string') direccion.referencia = texto(datos.referencia)
  return direccion
}

function adaptarAnterior(datos) {
  if (typeof datos.direccion === 'string') return datos
  const calleYNumero = [texto(datos.calle), texto(datos.numero)].filter(Boolean).join(' ')
  const direccion = [calleYNumero, texto(datos.departamento)].filter(Boolean).join(', ')
  return {
    ...datos,
    direccion,
    ciudad: texto(datos.comuna),
    telefono: texto(datos.telefono).replace(/[\s()-]/g, '').replace(/^\+/, ''),
    codigoPostal: '',
  }
}

export function cargarDirecciones(almacenamiento) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const guardado = storage.getItem(CLAVE_DIRECCIONES)
    if (guardado === null) return { direcciones: [], seleccionadaId: null, predeterminadaId: null, error: '' }
    const datos = JSON.parse(guardado)
    if (!datos || !Array.isArray(datos.direcciones)) throw new Error('Datos inválidos')
    const ids = new Set()
    const direcciones = datos.direcciones.map((direccion) => {
      if (!direccion || typeof direccion.id !== 'string' || !direccion.id.trim() || ids.has(direccion.id)) {
        throw new Error('Dirección inválida')
      }
      ids.add(direccion.id)
      return { id: direccion.id, ...normalizar(adaptarAnterior(direccion)) }
    })
    if (datos.seleccionadaId !== null && !ids.has(datos.seleccionadaId)) throw new Error('Selección inválida')
    const predeterminadaId = datos.predeterminadaId ?? null
    if (predeterminadaId !== null && !ids.has(predeterminadaId)) throw new Error('Dirección predeterminada inválida')
    return { direcciones, seleccionadaId: datos.seleccionadaId ?? predeterminadaId, predeterminadaId, error: '' }
  } catch {
    return { direcciones: [], seleccionadaId: null, predeterminadaId: null, error: 'No se pudieron cargar las direcciones guardadas. Intenta nuevamente.' }
  }
}

function modificarDirecciones(transformar, almacenamiento) {
  const actuales = cargarDirecciones(almacenamiento)
  if (actuales.error) throw new Error(actuales.error)
  const siguiente = transformar(actuales)
  const datos = { direcciones: siguiente.direcciones, seleccionadaId: siguiente.seleccionadaId, predeterminadaId: siguiente.predeterminadaId }
  try {
    const storage = almacenamiento ?? window.localStorage
    storage.setItem(CLAVE_DIRECCIONES, JSON.stringify(datos))
  } catch {
    throw new Error('No se pudo guardar la dirección. Intenta nuevamente.')
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_DIRECCIONES))
  return { ...datos, error: '' }
}

export function guardarDireccion(datos, id = null, almacenamiento) {
  const direccion = normalizar(datos)
  return modificarDirecciones((actuales) => {
    const predeterminadaPara = (direccionId) => datos.predeterminada === true
      ? direccionId
      : datos.predeterminada === false && actuales.predeterminadaId === direccionId
        ? null
        : actuales.predeterminadaId
    if (id !== null) {
      if (!actuales.direcciones.some((item) => item.id === id)) throw new Error('Esta dirección ya no está disponible.')
      return {
        direcciones: actuales.direcciones.map((item) => item.id === id ? { id, ...direccion } : item),
        seleccionadaId: actuales.seleccionadaId,
        predeterminadaId: predeterminadaPara(id),
      }
    }
    const nuevoId = globalThis.crypto?.randomUUID?.() ?? `dir-${Date.now()}-${Math.random().toString(36).slice(2)}`
    return { direcciones: [...actuales.direcciones, { id: nuevoId, ...direccion }], seleccionadaId: nuevoId, predeterminadaId: predeterminadaPara(nuevoId) }
  }, almacenamiento)
}

export function seleccionarDireccion(id, almacenamiento) {
  return modificarDirecciones((actuales) => {
    if (!actuales.direcciones.some((item) => item.id === id)) throw new Error('Selecciona una dirección disponible.')
    return { ...actuales, seleccionadaId: id }
  }, almacenamiento)
}

// Se invoca al conectar el siguiente frame de Pago: vuelve a consultar los datos actuales.
export function prepararEnvio(almacenamiento) {
  const { resumen } = validarCarritoActual(almacenamiento)
  const envio = cargarDirecciones(almacenamiento)
  if (envio.error) throw new Error(envio.error)
  const direccion = envio.direcciones.find((item) => item.id === envio.seleccionadaId)
  if (!direccion) throw new Error('Selecciona una dirección de envío antes de continuar.')
  return { direccion, resumen }
}

export function suscribirDirecciones(onCambio, objetivo = window) {
  const onStorage = (event) => {
    if (event.key === CLAVE_DIRECCIONES || event.key === null) onCambio()
  }
  objetivo.addEventListener('storage', onStorage)
  objetivo.addEventListener(EVENTO_DIRECCIONES, onCambio)
  return () => {
    objetivo.removeEventListener('storage', onStorage)
    objetivo.removeEventListener(EVENTO_DIRECCIONES, onCambio)
  }
}
