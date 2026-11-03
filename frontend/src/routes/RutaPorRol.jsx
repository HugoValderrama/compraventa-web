import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EXIGIR_SESION_EN_RUTAS } from '../utils/sesion'

// Protege una ruta por rol. Las rutas son del MODO:
// - la cuenta tiene el rol pero está en el otro modo -> cambia el modo solo y deja pasar
// - la cuenta no tiene el rol (o no hay sesión)      -> redirige a "/"
export default function RutaPorRol({ rol, children }) {
  const { usuario, modo, cambiarModo } = useAuth()
  const tieneRol = Boolean(usuario?.roles.includes(rol))
  const hayQueCambiar = tieneRol && modo !== rol

  useEffect(() => {
    if (hayQueCambiar) cambiarModo(rol)
  }, [hayQueCambiar, rol, cambiarModo])

  if (!usuario && !EXIGIR_SESION_EN_RUTAS) return children
  if (!tieneRol) return <Navigate to="/" replace />
  return children
}
