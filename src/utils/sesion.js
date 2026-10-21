// Utilidades de sesión y modo activo (cliente / emprendedor).

export const ROLES = ['cliente', 'emprendedor']
export const CLAVE_SESION = 'laguito.sesion'
const CLAVE_ULTIMO_MODO = 'laguito.ultimoModo'

// true: RutaPorRol redirige a "/" si no hay sesión (o no hay el rol).
// Ponlo en false mientras desarrollan sin pasar por el login.
export const EXIGIR_SESION_EN_RUTAS = true

// Hoy: /perfil para cliente y /perfilE para emprendedor.
export function rutaPerfil(modo) {
  return modo === 'emprendedor' ? '/perfilE' : '/perfil'
}

// Pantalla de inicio de cada modo (al cambiar de modo).
export function rutaInicio(modo) {
  return modo === 'emprendedor' ? '/emprendedor' : '/perfil'
}

export function nombreModo(modo) {
  return modo === 'emprendedor' ? 'Emprendedor' : 'Cliente'
}

// Acepta { rol: 'cliente' } (formato antiguo) o { roles: [...] }.
export function normalizarUsuario(crudo) {
  if (!crudo || typeof crudo !== 'object') return null
  const lista = Array.isArray(crudo.roles) ? crudo.roles : crudo.rol ? [crudo.rol] : []
  const roles = [...new Set(lista.map((r) => String(r).toLowerCase()))].filter((r) =>
    ROLES.includes(r),
  )
  if (roles.length === 0) return null
  return { ...crudo, id: crudo.id ?? 'usuario', roles }
}

// Último modo usado -> rol de registro -> primer rol. Con un solo rol, ese.
export function elegirModoInicial(usuario, ultimoModo, rolRegistro) {
  if (usuario.roles.length === 1) return usuario.roles[0]
  if (usuario.roles.includes(ultimoModo)) return ultimoModo
  if (usuario.roles.includes(rolRegistro)) return rolRegistro
  return usuario.roles[0]
}

export const claveUltimoModo = (usuario) => `${CLAVE_ULTIMO_MODO}.${usuario.id}`

// --- localStorage seguro (puede fallar en modo privado, etc.) ---
export function leerAlmacen(clave) {
  try {
    return window.localStorage.getItem(clave)
  } catch {
    return null
  }
}

export function escribirAlmacen(clave, valor) {
  try {
    window.localStorage.setItem(clave, valor)
  } catch {
    /* sin almacenamiento disponible */
  }
}

export function borrarAlmacen(clave) {
  try {
    window.localStorage.removeItem(clave)
  } catch {
    /* sin almacenamiento disponible */
  }
}

export function leerSesionGuardada() {
  const texto = leerAlmacen(CLAVE_SESION)
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}
