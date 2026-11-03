import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import CampoClave from '../../molecules/CampoClave';
import { changePassword } from '../../../mocks/usuario';
import { REQUISITOS_PASSWORD, validarPassword } from '../../../utils/validaciones';

const VACIO = { actual: '', nueva: '', confirmacion: '' };

export default function CambiarClaveDialog({ open, onClose, onExito }) {
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(VACIO);
      setErrores({});
      setErrorGeneral('');
    }
  }, [open]);

  const cambiar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErrores((er) => ({ ...er, [campo]: '' }));
    setErrorGeneral('');
  };

  const cerrar = () => {
    if (!guardando) onClose();
  };

  const enviar = async (e) => {
    e.preventDefault();
    const nuevos = {
      actual: form.actual ? '' : 'Ingresa tu contraseña actual.',
      nueva: validarPassword(form.nueva),
      confirmacion: '',
    };
    if (!nuevos.nueva && form.nueva === form.actual) {
      nuevos.nueva = 'La nueva contraseña debe ser distinta de la actual.';
    }
    if (!form.confirmacion) nuevos.confirmacion = 'Confirma tu nueva contraseña.';
    else if (form.confirmacion !== form.nueva) nuevos.confirmacion = 'Las contraseñas no coinciden.';

    if (Object.values(nuevos).some(Boolean)) {
      setErrores(nuevos);
      return;
    }

    setGuardando(true);
    try {
      await changePassword({ actual: form.actual, nueva: form.nueva });
      onExito('Contraseña actualizada correctamente.');
      onClose();
    } catch (err) {
      if (err.campo) setErrores((er) => ({ ...er, [err.campo]: err.message }));
      else setErrorGeneral(err.message || 'No se pudo cambiar la contraseña. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={cerrar} fullWidth maxWidth="xs">
      <form onSubmit={enviar} noValidate>
        <DialogTitle>Cambiar contraseña</DialogTitle>
        <DialogContent>
          {errorGeneral && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {errorGeneral}
            </Alert>
          )}
          <CampoClave
            label="Contraseña actual"
            value={form.actual}
            onChange={cambiar('actual')}
            error={errores.actual}
            autoComplete="current-password"
            autoFocus
          />
          <CampoClave
            label="Nueva contraseña"
            value={form.nueva}
            onChange={cambiar('nueva')}
            error={errores.nueva}
            helperText={REQUISITOS_PASSWORD}
            autoComplete="new-password"
          />
          <CampoClave
            label="Confirmar nueva contraseña"
            value={form.confirmacion}
            onChange={cambiar('confirmacion')}
            error={errores.confirmacion}
            autoComplete="new-password"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Cambiar contraseña'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}