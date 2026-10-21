import { useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Box, Button, ButtonBase, Stack, Toolbar, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import NavIconButton, { FOCO_VISIBLE } from '../atoms/NavIconButton'
import MenuPerfil from '../molecules/MenuPerfil'
import PanelNotificaciones from '../molecules/PanelNotificaciones'
import { useAuth } from '../../context/AuthContext'
import { useNavbarData } from '../../context/NavbarDataContext'
import { useTituloActual } from '../../context/TituloPantallaContext'
import { tituloDeRuta } from '../../utils/titulosRutas'
import { rutaInicio } from '../../utils/sesion'

export const INVERTIDO_POR_DEFECTO = true

const RUTA_LOGIN = '/login'
const RUTA_REGISTRO = '/registro'
const RUTAS_SIN_VOLVER = ['/', RUTA_LOGIN, RUTA_REGISTRO]

// Las pantallas que aún pasen showBack / onBack no se rompen: el navbar es el mismo en todas.
// `title` sigue funcionando como título forzado.
export default function TopNavBar({ invertido = INVERTIDO_POR_DEFECTO, title = '' }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { usuario, modo, cambiarModo, cerrarSesion } = useAuth()
  const { cantidadCarrito, notificaciones, noLeidas, noLeidasOtroModo, marcarLeida, marcarTodasLeidas, avisar } =
    useNavbarData()
  const tituloPersonalizado = useTituloActual()

  const [anclaPerfil, setAnclaPerfil] = useState(null)
  const [anclaNotif, setAnclaNotif] = useState(null)

  const ruta = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const titulo = title || tituloPersonalizado || tituloDeRuta(pathname)
  const mostrarVolver = !RUTAS_SIN_VOLVER.includes(ruta)
  const tieneAmbosRoles = Boolean(usuario && usuario.roles.length > 1)

  // Sin historial previo (primera pantalla de la sesión) no sacamos al usuario del sitio.
  const volver = () => {
    if (window.history.state?.idx === 0) navigate('/')
    else navigate(-1)
  }

  const irA = (destino) => {
    setAnclaPerfil(null)
    navigate(destino)
  }

  const handleCambiarModo = () => {
    const nuevo = modo === 'cliente' ? 'emprendedor' : 'cliente'
    setAnclaPerfil(null)
    cambiarModo(nuevo)
    navigate(rutaInicio(nuevo))
    avisar(`Ahora estás en modo ${nuevo}`)
  }

  const handleCerrarSesion = () => {
    setAnclaPerfil(null)
    cerrarSesion() // también vacía carrito y notificaciones (NavbarDataProvider)
    navigate('/')
  }

  const handleClickNotificacion = (n) => {
    marcarLeida(n.id)
    setAnclaNotif(null)
    navigate(n.ruta)
  }

  const identidad = (
    <Stack
      key="identidad"
      direction="row"
      spacing={0.5}
      sx={{ alignItems: 'center', minWidth: 0, flex: '1 1 auto', justifyContent: invertido ? 'flex-start' : 'flex-end' }}
    >
      <ButtonBase
        component={RouterLink}
        to="/"
        aria-label="Ir al inicio de Laguito Libre"
        sx={{ borderRadius: '50%', flexShrink: 0, ...FOCO_VISIBLE }}
      >
        <Box component="img" src="/logo.png" alt="" sx={{ width: 40, height: 40, borderRadius: '50%', display: 'block' }} />
      </ButtonBase>

      {mostrarVolver && (
        <NavIconButton label="Volver" onClick={volver}>
          <ArrowBackIcon />
        </NavIconButton>
      )}

      {titulo && (
        <Typography
          component="span"
          title={titulo}
          noWrap
          sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 20 }, minWidth: 0, pl: 0.5 }}
        >
          {titulo}
        </Typography>
      )}
    </Stack>
  )

  const acciones = (
    <Stack key="acciones" direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
      {usuario ? (
        <>
          <Button
            color="inherit"
            aria-label="Mi perfil"
            aria-haspopup="menu"
            aria-controls={anclaPerfil ? 'menu-perfil' : undefined}
            aria-expanded={anclaPerfil ? 'true' : undefined}
            onClick={(e) => setAnclaPerfil(e.currentTarget)}
            startIcon={
              <Box component="span" sx={{ display: 'inline-flex', position: 'relative' }}>
                <AccountCircleOutlinedIcon />
                {noLeidasOtroModo > 0 && (
                  <Box
                    component="span"
                    aria-hidden="true"
                    sx={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }}
                  />
                )}
              </Box>
            }
            sx={{
              textTransform: 'none',
              minWidth: 0,
              px: { xs: 1, sm: 1.5 },
              ...FOCO_VISIBLE,
              '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: { xs: 0, sm: -0.5 } },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Mi perfil</Box>
          </Button>

          {modo === 'cliente' && (
            <NavIconButton
              label={cantidadCarrito > 0 ? `Mi carrito, ${cantidadCarrito} ítems` : 'Mi carrito'}
              badge={cantidadCarrito}
              onClick={() => navigate('/carrito')}
            >
              <ShoppingCartOutlinedIcon />
            </NavIconButton>
          )}

          <NavIconButton
            label={noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : 'Notificaciones'}
            badge={noLeidas}
            aria-haspopup="dialog"
            aria-controls={anclaNotif ? 'panel-notificaciones' : undefined}
            aria-expanded={anclaNotif ? 'true' : undefined}
            onClick={(e) => setAnclaNotif(e.currentTarget)}
          >
            <NotificationsNoneOutlinedIcon />
          </NavIconButton>
        </>
      ) : (
        <>
          <Button component={RouterLink} to={RUTA_LOGIN} color="inherit" sx={{ textTransform: 'none', ...FOCO_VISIBLE }}>
            Iniciar sesión
          </Button>
          <Button component={RouterLink} to={RUTA_REGISTRO} variant="contained" disableElevation sx={{ textTransform: 'none', ...FOCO_VISIBLE }}>
            Registrarse
          </Button>
        </>
      )}
    </Stack>
  )

  const bloques = invertido ? [identidad, acciones] : [acciones, identidad]

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        component="header"
        sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 1, px: { xs: 1, sm: 2 }, py: 0.5 }}>
          {bloques}
        </Toolbar>
      </AppBar>

      {usuario && (
        <>
          <MenuPerfil
            anchorEl={anclaPerfil}
            onClose={() => setAnclaPerfil(null)}
            modo={modo}
            tieneAmbosRoles={tieneAmbosRoles}
            noLeidasOtroModo={noLeidasOtroModo}
            onNavegar={irA}
            onCambiarModo={handleCambiarModo}
            onCerrarSesion={handleCerrarSesion}
          />
          <PanelNotificaciones
            anchorEl={anclaNotif}
            onClose={() => setAnclaNotif(null)}
            notificaciones={notificaciones}
            noLeidas={noLeidas}
            onClickNotificacion={handleClickNotificacion}
            onMarcarTodas={marcarTodasLeidas}
          />
        </>
      )}
    </>
  )
}
