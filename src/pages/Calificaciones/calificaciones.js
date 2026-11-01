// Capa de datos de "Mis Calificaciones".
// Aquí vive todo el CRUD; la página (CalificacionesPage.jsx) solo dibuja.
// Cuando haya backend, basta con reemplazar leer() y escribir() por llamadas a la API.

const CLAVE = 'laguito-libre.calificaciones.v1'

export const MAXIMO_COMENTARIO = 500

export const ORDENES = {
  recientes: 'Más recientes',
  antiguas: 'Más antiguas',
  mayor: 'Mayor puntaje',
  menor: 'Menor puntaje',
}

const SEMILLA = [
  {
    id: 's1',
    cliente: 'Isabel Vera',
    producto: 'Florero Gres Silvestre',
    pedido: '1042',
    verificada: true,
    puntaje: 5,
    comentario: 'El florero es precioso. Llegó muy bien protegido y en el plazo indicado.',
    fecha: '2026-10-13T15:00:00.000Z',
  },
  {
    id: 's2',
    cliente: 'Rodrigo Díaz',
    producto: 'Taller de cerámica inicial',
    pedido: '',
    verificada: true,
    puntaje: 5,
    comentario: 'Excelente experiencia, explican con paciencia. ¡Me encantó crear mi primera pieza!',
    fecha: '2026-10-11T15:00:00.000Z',
  },
  {
    id: 's3',
    cliente: 'Paula Castro',
    producto: 'Taza de gres natural',
    pedido: '1038',
    verificada: true,
    puntaje: 4,
    comentario: 'Muy linda y de buena calidad. El envío demoró un día más de lo esperado.',
    fecha: '2026-10-08T15:00:00.000Z',
  },
  {
    id: 's4',
    cliente: 'Camila Soto',
    producto: 'Set de platos artesanales',
    pedido: '1031',
    verificada: true,
    puntaje: 5,
    comentario: 'Los platos son hermosos, cada uno es distinto. Muy recomendable.',
    fecha: '2026-10-02T15:00:00.000Z',
  },
  {
    id: 's5',
    cliente: 'Andrés Rojas',
    producto: 'Florero Gres Silvestre',
    pedido: '1027',
    verificada: true,
    puntaje: 3,
    comentario: 'El producto está bien, pero el color es algo distinto al de la foto.',
    fecha: '2026-09-28T15:00:00.000Z',
  },
]

const invalida = (c) =>
  !c ||
  typeof c.id !== 'string' ||
  !c.id ||
  typeof c.cliente !== 'string' ||
  typeof c.producto !== 'string' ||
  typeof c.comentario !== 'string' ||
  !Number.isInteger(c.puntaje) ||
  c.puntaje < 1 ||
  c.puntaje > 5 ||
  !Number.isFinite(Date.parse(c.fecha))

/* ------------------------- Lectura / escritura ------------------------- */

function leer() {
  try {
    const texto = window.localStorage.getItem(CLAVE)
    const lista = texto === null ? SEMILLA : JSON.parse(texto)

    if (!Array.isArray(lista) || lista.some(invalida)) {
      throw new Error('Datos inválidos')
    }

    return { calificaciones: lista, error: '' }
  } catch {
    return {
      calificaciones: [],
      error: 'No se pudieron leer las calificaciones. Revisa el almacenamiento del navegador.',
    }
  }
}

function escribir(lista) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(lista))
  } catch {
    throw new Error('No se pudo guardar. Revisa el almacenamiento del navegador.')
  }

  return { calificaciones: lista, error: '' }
}

// Siempre parte de lo último guardado, así dos pestañas no se pisan.
function actuales() {
  const datos = leer()
  if (datos.error) throw new Error(datos.error)
  return datos.calificaciones
}

// Valida lo escrito en el formulario y devuelve un objeto limpio.
function validar(form) {
  const cliente = String(form.cliente ?? '').trim()
  const producto = String(form.producto ?? '').trim()
  const pedido = String(form.pedido ?? '').trim()
  const comentario = String(form.comentario ?? '').trim()
  const puntaje = Number(form.puntaje)

  if (!cliente) throw new Error('El nombre del cliente es obligatorio.')
  if (cliente.length > 60) throw new Error('El nombre puede tener hasta 60 caracteres.')
  if (!producto) throw new Error('Indica el producto o servicio calificado.')
  if (producto.length > 80) throw new Error('El producto puede tener hasta 80 caracteres.')
  if (pedido && !/^\d{1,10}$/.test(pedido)) {
    throw new Error('El número de pedido debe tener solo dígitos (hasta 10).')
  }
  if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
    throw new Error('El puntaje debe ser un número entero entre 1 y 5.')
  }
  if (!comentario) throw new Error('Escribe un comentario.')
  if (comentario.length > MAXIMO_COMENTARIO) {
    throw new Error(`El comentario puede tener hasta ${MAXIMO_COMENTARIO} caracteres.`)
  }

  return {
    cliente,
    producto,
    pedido,
    comentario,
    puntaje,
    verificada: Boolean(form.verificada),
  }
}

/* ------------------------------- CRUD --------------------------------- */

// READ
export const cargarCalificaciones = leer

// CREATE
export function crearCalificacion(form) {
  const lista = actuales()
  const nueva = {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    ...validar(form),
  }

  return escribir([nueva, ...lista])
}

// UPDATE
export function actualizarCalificacion(id, form) {
  const lista = actuales()

  if (!lista.some((c) => c.id === id)) {
    throw new Error('La calificación ya no existe.')
  }

  const cambios = validar(form)

  return escribir(
    lista.map((c) =>
      c.id === id ? { ...c, ...cambios, editadaEn: new Date().toISOString() } : c
    )
  )
}

// DELETE
export function eliminarCalificacion(id) {
  const lista = actuales()

  if (!lista.some((c) => c.id === id)) {
    throw new Error('La calificación ya no existe.')
  }

  return escribir(lista.filter((c) => c.id !== id))
}

/* --------------------- Cálculos y formato para la UI ------------------- */

export function ordenarCalificaciones(lista, orden) {
  const copia = [...lista]
  const porFecha = (a, b) => Date.parse(b.fecha) - Date.parse(a.fecha)

  switch (orden) {
    case 'antiguas':
      return copia.sort((a, b) => -porFecha(a, b))
    case 'mayor':
      return copia.sort((a, b) => b.puntaje - a.puntaje || porFecha(a, b))
    case 'menor':
      return copia.sort((a, b) => a.puntaje - b.puntaje || porFecha(a, b))
    default:
      return copia.sort(porFecha)
  }
}

// Devuelve total, promedio y cuántas hay de 5, 4, 3, 2 y 1 estrellas.
export function resumirCalificaciones(lista) {
  const conteos = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let suma = 0

  lista.forEach((c) => {
    conteos[c.puntaje] += 1
    suma += c.puntaje
  })

  return {
    total: lista.length,
    promedio: lista.length ? suma / lista.length : 0,
    conteos,
  }
}

export const formatearPromedio = (valor) =>
  valor.toLocaleString('es-CL', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

export const formatearFecha = (valor) =>
  new Date(valor).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

// Avisa cuando otra pestaña cambia las calificaciones.
export function suscribirCalificaciones(callback) {
  const alCambiar = (event) => {
    if (event.key === CLAVE || event.key === null) callback()
  }

  window.addEventListener('storage', alCambiar)
  return () => window.removeEventListener('storage', alCambiar)
}