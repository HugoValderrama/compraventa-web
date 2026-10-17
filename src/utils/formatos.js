const pad = (n) => String(n).padStart(2, '0')

const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export const pesos = (valor) => clp.format(valor)

// Acepta 'aaaa-mm-dd' o un ISO completo. Devuelve dd-mm-aaaa.
export function formatearFecha(valor) {
  if (!valor) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [a, m, d] = valor.split('-')
    return `${d}-${m}-${a}`
  }
  const f = new Date(valor)
  return `${pad(f.getDate())}-${pad(f.getMonth() + 1)}-${f.getFullYear()}`
}

export function formatearFechaHora(valor) {
  const f = new Date(valor)
  return `${formatearFecha(valor)} ${pad(f.getHours())}:${pad(f.getMinutes())}`
}

// Fecha local como 'aaaa-mm-dd' (formato del input type="date")
export function aISO(fecha) {
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`
}

export const hoyISO = () => aISO(new Date())

export function sumarDias(dias) {
  const f = new Date()
  f.setDate(f.getDate() + dias)
  return aISO(f)
}