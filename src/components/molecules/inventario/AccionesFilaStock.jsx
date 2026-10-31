import { Button, Stack } from '@mui/material';

export default function AccionesFilaStock({
  visibles,
  puedeGuardar,
  guardando = false,
  bloqueado = false,
  onGuardar,
  onDescartar,
}) {
  if (!visibles) return null;

  return (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        variant="contained"
        disabled={!puedeGuardar || guardando || bloqueado}
        onClick={onGuardar}
      >
        {guardando ? 'Guardando…' : 'Guardar'}
      </Button>
      <Button size="small" disabled={guardando || bloqueado} onClick={onDescartar}>
        Descartar
      </Button>
    </Stack>
  );
}