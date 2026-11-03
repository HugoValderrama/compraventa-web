// "hace 5 min", "hace 3 h", "hace 2 días"...
export function tiempoRelativo(iso, ahora = Date.now()) {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const min = Math.floor((ahora - t) / 60000)
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const horas = Math.floor(min / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return dias === 1 ? 'hace 1 día' : `hace ${dias} días`
  return new Date(t).toLocaleDateString('es-CL')
}
