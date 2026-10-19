import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import ListaAgregable from '../../molecules/ListaAgregable';
import { updateMe } from '../../../mocks/usuario';
import { validarCorreo } from '../../../utils/validaciones';

export default function CorreosDialog({ open, onClose, correos, onActualizado, onError }) {
  const [ocupado, setOcupado] = useState(false);

  const guardar = async (nuevos, mensaje) => {
    setOcupado(true);
    try {
      const actualizado = await updateMe({ correos: nuevos });
      onActualizado(actualizado, mensaje);
      return true;
    } catch (err) {
      onError(err.message || 'No se pudo actualizar los correos. Inténtalo de nuevo.');
      return false;
    } finally {
      setOcupado(false);
    }
  };

  const validar = (correo, items) => {
    const mensaje = validarCorreo(correo);
    if (mensaje) return mensaje;
    if (items.some((c) => c.toLowerCase() === correo)) return 'Este correo ya está registrado.';
    return '';
  };

  return (
    <Dialog open={open} onClose={ocupado ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Mis correos</DialogTitle>
      <DialogContent>
        <ListaAgregable
          items={correos}
          etiquetaCampo="Nuevo correo"
          placeholder="correo@ejemplo.cl"
          tipoInput="email"
          validar={validar}
          normalizar={(v) => v.trim().toLowerCase()}
          ocupado={ocupado}
          onAgregar={(c) => guardar([...correos, c], 'Correo agregado.')}
          onQuitar={(c) => guardar(correos.filter((x) => x !== c), 'Correo eliminado.')}
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