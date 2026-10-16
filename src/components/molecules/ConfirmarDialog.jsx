import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

export default function ConfirmarDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Dialog
      open={abierto}
      onClose={cargando ? undefined : onCancelar}
      aria-labelledby="confirmar-titulo"
    >
      <DialogTitle id="confirmar-titulo">{titulo}</DialogTitle>
      <DialogContent>
        <Typography>{mensaje}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelar} disabled={cargando}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onConfirmar} disabled={cargando}>
          {cargando ? 'Guardando…' : textoConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  )
}