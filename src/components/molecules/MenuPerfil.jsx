import {
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
} from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import LogoutIcon from '@mui/icons-material/Logout'
import { nombreModo, rutaPerfil } from '../../utils/sesion'

const ITEMS_POR_MODO = {
  cliente: [
    { label: 'Ver mi perfil', ruta: rutaPerfil('cliente'), Icono: PersonOutlineIcon },
    { label: 'Mis compras', ruta: '/compras', Icono: ReceiptLongOutlinedIcon },
    { label: 'Mis cotizaciones', ruta: '/cotizaciones', Icono: RequestQuoteOutlinedIcon },
    { label: 'Mis direcciones', ruta: '/direcciones', Icono: LocationOnOutlinedIcon },
  ],
  emprendedor: [
    { label: 'Ver mi perfil', ruta: rutaPerfil('emprendedor'), Icono: PersonOutlineIcon },
    { label: 'Panel del emprendedor', ruta: '/emprendedor', Icono: DashboardOutlinedIcon },
    { label: 'Pedidos recibidos', ruta: '/pedidos', Icono: LocalShippingOutlinedIcon },
    { label: 'Mis productos', ruta: '/productos', Icono: Inventory2OutlinedIcon },
  ],
}

// Menú desplegable de "Mi perfil". Depende del MODO activo.
export default function MenuPerfil({
  anchorEl,
  onClose,
  modo,
  tieneAmbosRoles,
  noLeidasOtroModo,
  onNavegar,
  onCambiarModo,
  onCerrarSesion,
}) {
  const otroModo = modo === 'cliente' ? 'emprendedor' : 'cliente'
  const items = ITEMS_POR_MODO[modo] ?? []

  return (
    <Menu
      id="menu-perfil"
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: { sx: { minWidth: 240, maxWidth: 'calc(100vw - 16px)' } },
        list: { 'aria-label': 'Menú de mi perfil' },
      }}
    >
      {tieneAmbosRoles && (
        <ListSubheader sx={{ lineHeight: '32px', fontWeight: 700 }}>
          Modo: {nombreModo(modo)}
        </ListSubheader>
      )}
      {tieneAmbosRoles && (
        <MenuItem onClick={onCambiarModo}>
          <ListItemIcon>
            <SwapHorizIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cambiar a modo {otroModo}</ListItemText>
          {noLeidasOtroModo > 0 && (
            <Chip
              size="small"
              color="error"
              label={noLeidasOtroModo > 9 ? '9+' : noLeidasOtroModo}
              aria-label={`${noLeidasOtroModo} notificaciones sin leer en modo ${otroModo}`}
              sx={{ ml: 1 }}
            />
          )}
        </MenuItem>
      )}
      {tieneAmbosRoles && <Divider />}

      {items.map(({ label, ruta, Icono }) => (
        <MenuItem key={ruta} onClick={() => onNavegar(ruta)}>
          <ListItemIcon>
            <Icono fontSize="small" />
          </ListItemIcon>
          <ListItemText>{label}</ListItemText>
        </MenuItem>
      ))}

      <Divider />
      <MenuItem onClick={onCerrarSesion}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Cerrar sesión</ListItemText>
      </MenuItem>
    </Menu>
  )
}
