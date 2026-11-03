import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { updateMe } from '../../../mocks/usuario';
import {
  fechaMaximaMayorEdad,
  validarFechaNacimiento,
  validarNombre,
  validarTextoObligatorio,
} from '../../../utils/validaciones';

const desdeUsuario = (u) => ({
  nombres: u.nombres,
  apellidos: u.apellidos,
  fechaNacimiento: u.fechaNacimiento,
  direccionPrincipal: u.direccionPrincipal,
});

export default function EditarPerfilDialog({ open, onClose, usuario, onActualizado, onError }) {
  const [form, setForm] = useState(() => desdeUsuario(usuario));
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(desdeUsuario(usuario));
      setErrores({});
    }
  }, [open, usuario]);

  const cambiar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErrores((er) => ({ ...er, [campo]: '' }));
  };

  const cerrar = () => {
    if (!guardando) onClose();
  };

  const enviar = async (e) => {
    e.preventDefault();
    const nuevos = {
      nombres: validarNombre(form.nombres, 'El nombre'),
      apellidos: validarNombre(form.apellidos, 'El apellido'),
      fechaNacimiento: validarFechaNacimiento(form.fechaNacimiento),
      direccionPrincipal: validarTextoObligatorio(form.direccionPrincipal, 'La dirección', 5),
    };
    if (Object.values(nuevos).some(Boolean)) {
      setErrores(nuevos);
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await updateMe({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        fechaNacimiento: form.fechaNacimiento,
        direccionPrincipal: form.direccionPrincipal.trim(),
      });
      onActualizado(actualizado, 'Perfil actualizado correctamente.');
      onClose();
    } catch (err) {
      onError(err.message || 'No se pudo actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={cerrar} fullWidth maxWidth="sm">
      <form onSubmit={enviar} noValidate>
        <DialogTitle>Editar perfil</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="RUN"
              value={usuario.run}
              disabled
              helperText="El RUN no se puede modificar."
              fullWidth
            />
            <TextField
              label="Nombres"
              value={form.nombres}
              onChange={cambiar('nombres')}
              error={Boolean(errores.nombres)}
              helperText={errores.nombres}
              fullWidth
              required
            />
            <TextField
              label="Apellidos"
              value={form.apellidos}
              onChange={cambiar('apellidos')}
              error={Boolean(errores.apellidos)}
              helperText={errores.apellidos}
              fullWidth
              required
            />
            <TextField
              label="Fecha de nacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={cambiar('fechaNacimiento')}
              error={Boolean(errores.fechaNacimiento)}
              helperText={errores.fechaNacimiento}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { max: fechaMaximaMayorEdad() },
              }}
              fullWidth
              required
            />
            <TextField
              label="Dirección principal"
              value={form.direccionPrincipal}
              onChange={cambiar('direccionPrincipal')}
              error={Boolean(errores.direccionPrincipal)}
              helperText={errores.direccionPrincipal}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}