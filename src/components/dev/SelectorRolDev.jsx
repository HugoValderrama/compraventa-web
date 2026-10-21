import { Box, MenuItem, TextField } from '@mui/material';
import {
  CLAVE_SESION,
  borrarAlmacen,
  escribirAlmacen,
  leerSesionGuardada,
  normalizarUsuario,
} from '../../utils/sesion';

const CUENTAS = {
  visitante: null,
  cliente: ['cliente'],
  emprendedor: ['emprendedor'],
  ambos: ['cliente', 'emprendedor'],
};

const TEXTOS = {
  visitante: 'Visitante (sin sesión)',
  cliente: 'Cliente',
  emprendedor: 'Emprendedor',
  ambos: 'Cliente y emprendedor',
};

function opcionActual() {
  const usuario = normalizarUsuario(leerSesionGuardada()?.usuario);
  if (!usuario) return 'visitante';
  return usuario.roles.length > 1 ? 'ambos' : usuario.roles[0];
}

// Solo desarrollo: crea o borra la sesión (laguito.sesion) sin pasar por el login.
// Se elimina al conectar el backend.
export default function SelectorRolDev() {
  if (!import.meta.env.DEV) return null;

  const cambiar = (e) => {
    const roles = CUENTAS[e.target.value];
    if (roles) {
      escribirAlmacen(
        CLAVE_SESION,
        JSON.stringify({ usuario: { id: 1, nombre: 'Juan Pérez', roles }, modo: roles[0] })
      );
    } else {
      borrarAlmacen(CLAVE_SESION);
    }
    window.location.reload();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 1200,
        bgcolor: 'white',
        borderRadius: 1,
        boxShadow: 3,
        p: 1,
      }}
    >
      <TextField
        select
        size="small"
        label="Sesión (solo desarrollo)"
        value={opcionActual()}
        onChange={cambiar}
        sx={{ minWidth: 210 }}
      >
        {Object.entries(TEXTOS).map(([valor, texto]) => (
          <MenuItem key={valor} value={valor}>
            {texto}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}