import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import { useAuth } from './AuthContext'
import { getCart } from '../mocks/carrito'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../mocks/notificaciones'

// Estado compartido del navbar: carrito, notificaciones (de ambos modos) y avisos.
// Vive en App para que no se pierda cuando cada pantalla monta su propio <TopNavBar />.
const NavbarDataContext = createContext(null)

const SIN_NOTIFS = { cliente: [], emprendedor: [] }
const porFechaDesc = (a, b) => new Date(b.fecha) - new Date(a.fecha)
const contarNoLeidas = (lista) => lista.filter((n) => !n.leida).length

export function NavbarDataProvider({ children }) {
  const { usuario, modo } = useAuth()
  const [carrito, setCarrito] = useState({ items: [] })
  const [notifs, setNotifs] = useState(SIN_NOTIFS)
  const [aviso, setAviso] = useState({ abierto: false, texto: '' })
  const cargaRef = useRef(0)

  const hayUsuario = Boolean(usuario)
  const rolesKey = usuario ? usuario.roles.join(',') : ''

  const refrescar = useCallback(async () => {
    const carga = ++cargaRef.current
    if (!hayUsuario) {
      setCarrito({ items: [] })
      setNotifs(SIN_NOTIFS)
      return
    }
    const roles = rolesKey.split(',').filter(Boolean)
    try {
      const [cart, ...listas] = await Promise.all([
        roles.includes('cliente') ? getCart() : Promise.resolve({ items: [] }),
        ...roles.map((rol) => getNotifications(rol)),
      ])
      if (carga !== cargaRef.current) return // llegó una carga más nueva
      setCarrito(cart)
      setNotifs({ ...SIN_NOTIFS, ...Object.fromEntries(roles.map((rol, i) => [rol, listas[i]])) })
    } catch {
      // TODO: mostrar error de carga cuando exista la API real
    }
  }, [hayUsuario, rolesKey])

  // Al iniciar/cerrar sesión y al cambiar de modo se vuelve a cargar todo.
  useEffect(() => {
    refrescar()
  }, [refrescar, modo])

  const marcarLeida = useCallback(
    (id) => {
      setNotifs((previo) => ({
        cliente: previo.cliente.map((n) => (n.id === id ? { ...n, leida: true } : n)),
        emprendedor: previo.emprendedor.map((n) => (n.id === id ? { ...n, leida: true } : n)),
      }))
      markNotificationRead(id).catch(refrescar)
    },
    [refrescar],
  )

  const marcarTodasLeidas = useCallback(() => {
    if (!modo) return
    setNotifs((previo) => ({ ...previo, [modo]: previo[modo].map((n) => ({ ...n, leida: true })) }))
    markAllNotificationsRead(modo).catch(refrescar)
  }, [modo, refrescar])

  const avisar = useCallback((texto) => setAviso({ abierto: true, texto }), [])

  const valor = useMemo(() => {
    const otro = modo === 'cliente' ? 'emprendedor' : 'cliente'
    const delModo = modo ? [...notifs[modo]].sort(porFechaDesc) : []
    return {
      cantidadCarrito: carrito.items.reduce((total, item) => total + (item.cantidad ?? 1), 0),
      notificaciones: delModo,
      noLeidas: contarNoLeidas(delModo),
      noLeidasOtroModo: modo && usuario?.roles.includes(otro) ? contarNoLeidas(notifs[otro]) : 0,
      marcarLeida,
      marcarTodasLeidas,
      refrescar,
      avisar,
    }
  }, [carrito, notifs, modo, usuario, marcarLeida, marcarTodasLeidas, refrescar, avisar])

  return (
    <NavbarDataContext.Provider value={valor}>
      {children}
      <Snackbar
        open={aviso.abierto}
        autoHideDuration={3000}
        onClose={(_, motivo) => {
          if (motivo !== 'clickaway') setAviso((previo) => ({ ...previo, abierto: false }))
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setAviso((p) => ({ ...p, abierto: false }))}>
          {aviso.texto}
        </Alert>
      </Snackbar>
    </NavbarDataContext.Provider>
  )
}

export function useNavbarData() {
  const contexto = useContext(NavbarDataContext)
  if (!contexto) throw new Error('useNavbarData debe usarse dentro de <NavbarDataProvider>')
  return contexto
}
