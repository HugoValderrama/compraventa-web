import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  CLAVE_SESION,
  borrarAlmacen,
  claveUltimoModo,
  elegirModoInicial,
  escribirAlmacen,
  leerAlmacen,
  leerSesionGuardada,
  normalizarUsuario,
} from '../utils/sesion'

// Sesión mínima: { usuario: { id, nombre, roles: [...] }, modo }
// Se guarda en localStorage (laguito.sesion).
const AuthContext = createContext(null)

function cargarInicial() {
  const guardada = leerSesionGuardada()
  const usuario = normalizarUsuario(guardada?.usuario)
  if (!usuario) return { usuario: null, modo: null }
  const modo = usuario.roles.includes(guardada.modo) ? guardada.modo : usuario.roles[0]
  return { usuario, modo }
}

export function AuthProvider({ children }) {
  const [estado, setEstado] = useState(cargarInicial)
  const { usuario, modo } = estado

  useEffect(() => {
    if (usuario) escribirAlmacen(CLAVE_SESION, JSON.stringify({ usuario, modo }))
  }, [usuario, modo])

  // Llamar desde el login/registro: iniciarSesion({ id, nombre, rol })
  // o iniciarSesion({ id, nombre, roles: [...], rolRegistro }).
  const iniciarSesion = useCallback((datos) => {
    const nuevo = normalizarUsuario(datos)
    if (!nuevo) return null
    const ultimo = leerAlmacen(claveUltimoModo(nuevo))
    const modoInicial = elegirModoInicial(nuevo, ultimo, datos.rolRegistro)
    setEstado({ usuario: nuevo, modo: modoInicial })
    return nuevo
  }, [])

  const cambiarModo = useCallback(
    (nuevoModo) => {
      if (!usuario || !usuario.roles.includes(nuevoModo)) return
      escribirAlmacen(claveUltimoModo(usuario), nuevoModo)
      setEstado((previo) => (previo.modo === nuevoModo ? previo : { ...previo, modo: nuevoModo }))
    },
    [usuario],
  )

  const cerrarSesion = useCallback(() => {
    borrarAlmacen(CLAVE_SESION)
    setEstado({ usuario: null, modo: null })
  }, [])

  const valor = useMemo(
    () => ({ usuario, modo, iniciarSesion, cambiarModo, cerrarSesion }),
    [usuario, modo, iniciarSesion, cambiarModo, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
