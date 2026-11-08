import { Box, MenuItem, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rutaInicio } from '../../utils/sesion';

const CUENTAS = {
  visitante: null,
  cliente: ['cliente'],
  emprendedor: ['emprendedor'],
  ambos: ['cliente', 'emprendedor'],
  administrador: ['administrador'],
};

const TEXTOS = {
  visitante: 'Visitante (sin sesión)',
  cliente: 'Cliente',
  emprendedor: 'Emprendedor',
  ambos: 'Cliente y emprendedor',
  administrador: 'Administrador',
};

export default function SelectorRolDev() {
  const navigate = useNavigate();
  const { usuario, iniciarSesion, cerrarSesion } = useAuth();

  if (!import.meta.env.DEV) return null;

  const actual = !usuario ? 'visitante' : usuario.roles.length > 1 ? 'ambos' : usuario.roles[0];

  const cambiar = (e) => {
    const roles = CUENTAS[e.target.value];
    if (!roles) {
      cerrarSesion();
      navigate('/');
      return;
    }
    iniciarSesion({ id: 1, nombre: 'Juan Pérez', roles });
    navigate(rutaInicio(roles[0]));
  };

  return (
    <Box sx={{ position: 'fixed', left: 12, bottom: 12, zIndex: 1200, bgcolor: 'white', borderRadius: 1, boxShadow: 3, p: 1 }}>
      <TextField select size="small" label="Sesión (solo desarrollo)" value={actual} onChange={cambiar} sx={{ minWidth: 210 }}>
        {Object.entries(TEXTOS).map(([valor, texto]) => (
          <MenuItem key={valor} value={valor}>{texto}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
}