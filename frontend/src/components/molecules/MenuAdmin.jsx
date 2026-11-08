
import { ListItemText, Menu, MenuItem } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'

// Menú del modo administrador.
export default function MenuAdmin({
  anchorEl,
  onClose,
  onNavegar,
  onCerrarSesion
}) {
  return (
    <Menu
      id="menu-perfil"
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <MenuItem onClick={() => onNavegar('/')}>
        <ListItemText>Ir al inicio</ListItemText>
      </MenuItem>

      <MenuItem onClick={() => onNavegar('/admin/usuarios')}>
        <PeopleIcon sx={{ mr: 1.5, color: 'primary.main' }} />
        <ListItemText>Gestión de usuarios</ListItemText>
      </MenuItem>

      <MenuItem onClick={onCerrarSesion}>
        <ListItemText>Cerrar sesión</ListItemText>
      </MenuItem>
    </Menu>
  )
}
