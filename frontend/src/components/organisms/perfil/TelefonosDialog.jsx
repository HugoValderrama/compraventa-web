import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import ListaAgregable from '../../molecules/ListaAgregable';
import { updateMe } from '../../../mocks/usuario';
import {
  formatearTelefono,
  normalizarTelefono,
  validarTelefono,
} from '../../../utils/validaciones';

export default function TelefonosDialog({ open, onClose, telefonos, onActualizado, onError }) {
  const [ocupado, setOcupado] = useState(false);

  const guardar = async (nuevos, mensaje) => {
    setOcupado(true);
    try {
      const actualizado = await updateMe({ telefonos: nuevos });
      onActualizado(actualizado, mensaje);
      return true;
    } catch (err) {
      onError(err.message || 'No se pudo actualizar los teléfonos. Inténtalo de nuevo.');
      return false;
    } finally {
      setOcupado(false);
    }
  };

  const validar = (tel, items) => {
    const mensaje = validarTelefono(tel);
    if (mensaje) return mensaje;
    if (items.includes(tel)) return 'Este teléfono ya está registrado.';
    return '';
  };

  return (
    <Dialog open={open} onClose={ocupado ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Mis teléfonos</DialogTitle>
      <DialogContent>
        <ListaAgregable
          items={telefonos}
          etiquetaCampo="Nuevo teléfono"
          placeholder="+56 9 1234 5678"
          tipoInput="tel"
          validar={validar}
          normalizar={normalizarTelefono}
          formatear={formatearTelefono}
          ocupado={ocupado}
          onAgregar={(tel) => guardar([...telefonos, tel], 'Teléfono agregado.')}
          onQuitar={(tel) => guardar(telefonos.filter((t) => t !== tel), 'Teléfono eliminado.')}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={ocupado}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}