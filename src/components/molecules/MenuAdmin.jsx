import { ListItemText, Menu, MenuItem } from '@mui/material'

// Menú del modo administrador: por ahora solo inicio y cierre de sesión.
export default function MenuAdmin({ anchorEl, onClose, onNavegar, onCerrarSesion }) {
  return (
    <Menu id="menu-perfil" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      <MenuItem onClick={() => onNavegar('/')}>
        <ListItemText>Ir al inicio</ListItemText>
      </MenuItem>
      <MenuItem onClick={onCerrarSesion}>
        <ListItemText>Cerrar sesión</ListItemText>
      </MenuItem>
    </Menu>
  )
}