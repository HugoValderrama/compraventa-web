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
import { updateEmpresa } from '../../../mocks/usuario';
import {
  MAX_DIRECCION_LOCAL,
  MAX_GIRO,
  MAX_PAGINA_WEB,
  MAX_RAZON_SOCIAL,
  validarDireccionLocal,
  validarGiro,
  validarPaginaWeb,
  validarRazonSocial,
  validarRut,
} from '../../../utils/validacionesTienda';

const CAMPOS = [
  { campo: 'razonSocial', etiqueta: 'Razón social', max: MAX_RAZON_SOCIAL, requerido: true },
  { campo: 'rut', etiqueta: 'RUT de la empresa', ayuda: 'Ejemplo: 76.123.456-0', requerido: true },
  { campo: 'giro', etiqueta: 'Giro', max: MAX_GIRO, requerido: true },
  { campo: 'paginaWeb', etiqueta: 'Página web (opcional)', max: MAX_PAGINA_WEB, placeholder: 'mitienda.cl' },
  { campo: 'direccionLocal', etiqueta: 'Dirección del local (opcional)', max: MAX_DIRECCION_LOCAL },
];

const VALIDADORES = {
  razonSocial: validarRazonSocial,
  rut: validarRut,
  giro: validarGiro,
  paginaWeb: validarPaginaWeb,
  direccionLocal: validarDireccionLocal,
};

const desdeEmpresa = (e) => ({
  razonSocial: e.razonSocial ?? '',
  rut: e.rut ?? '',
  giro: e.giro ?? '',
  paginaWeb: e.paginaWeb ?? '',
  direccionLocal: e.direccionLocal ?? '',
});

export default function TiendaDialog({ open, onClose, empresa, onActualizado, onError }) {
  const [form, setForm] = useState(() => desdeEmpresa(empresa));
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(desdeEmpresa(empresa));
      setErrores({});
    }
  }, [open, empresa]);

  const cambiar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErrores((er) => ({ ...er, [campo]: '' }));
  };

  const cerrar = () => {
    if (!guardando) onClose();
  };

  const enviar = async (e) => {
    e.preventDefault();
    const nuevos = {};
    CAMPOS.forEach(({ campo }) => {
      nuevos[campo] = VALIDADORES[campo](form[campo]);
    });
    if (Object.values(nuevos).some(Boolean)) {
      setErrores(nuevos);
      return;
    }

    setGuardando(true);
    try {
      const actualizada = await updateEmpresa({
        razonSocial: form.razonSocial.trim(),
        rut: form.rut.trim().toUpperCase(),
        giro: form.giro.trim(),
        paginaWeb: form.paginaWeb.trim(),
        direccionLocal: form.direccionLocal.trim(),
      });
      onActualizado(actualizada, 'Datos de la tienda actualizados correctamente.');
      onClose();
    } catch (err) {
      onError(err.message || 'No se pudo actualizar la tienda. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={cerrar} fullWidth maxWidth="sm">
      <form onSubmit={enviar} noValidate>
        <DialogTitle>Editar tienda</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {CAMPOS.map(({ campo, etiqueta, max, ayuda, placeholder, requerido }) => (
              <TextField
                key={campo}
                label={etiqueta}
                value={form[campo]}
                onChange={cambiar(campo)}
                placeholder={placeholder}
                error={Boolean(errores[campo])}
                helperText={errores[campo] || (max ? `${form[campo].length}/${max}` : ayuda)}
                required={requerido}
                fullWidth
              />
            ))}
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