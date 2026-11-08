import { Divider, ListItemText, Menu, MenuItem } from '@mui/material'

const MODULOS = [
  { ruta: '/admin', texto: 'Dashboard' },
  { ruta: '/admin/usuarios', texto: 'Gestión de usuarios' },
  { ruta: '/categorias', texto: 'Gestión de categorías' },
  { ruta: '/gestion-publicaciones', texto: 'Gestión de productos y servicios' },
  { ruta: '/gestion-ventas-pedidos', texto: 'Ventas y pedidos' },
  { ruta: '/gestion-devoluciones-reembolsos', texto: 'Devoluciones y reembolsos' },
  { ruta: '/panel-moderacion', texto: 'Mensajería y moderación' },
  { ruta: '/reportes', texto: 'Reportes' },
]

// Menú del modo administrador.
export default function MenuAdmin({ anchorEl, onClose, onNavegar, onCerrarSesion }) {
  return (
    <Menu id="menu-perfil" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      {MODULOS.map(({ ruta, texto }) => (
        <MenuItem key={ruta} onClick={() => onNavegar(ruta)}>
          <ListItemText>{texto}</ListItemText>
        </MenuItem>
      ))}
      <Divider />
      <MenuItem onClick={onCerrarSesion}>
        <ListItemText>Cerrar sesión</ListItemText>
      </MenuItem>
    </Menu>
  )
}