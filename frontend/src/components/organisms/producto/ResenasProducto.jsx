import { Alert, Box, Button, CircularProgress, Divider, Rating, Stack, Typography } from '@mui/material';
import { formatearFecha } from '../../../utils/formatos';

export default function ResenasProducto({ resenas, promedio, cargando, fallo, onReintentar }) {
  if (cargando) return <CircularProgress size={24} aria-label="Cargando reseñas" />;

  if (fallo) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onReintentar}>
            Reintentar
          </Button>
        }
      >
        No pudimos cargar las reseñas.
      </Alert>
    );
  }

  if (resenas.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Aún no hay reseñas para este producto.
      </Typography>
    );
  }

  const promedioTexto = promedio.toLocaleString('es-CL', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {promedioTexto}
        </Typography>
        <Box>
          <Rating value={promedio} precision={0.5} readOnly aria-label={`Promedio ${promedioTexto} de 5`} />
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
            {resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'}
          </Typography>
        </Box>
      </Stack>

      <Divider />

      {resenas.map((r) => (
        <Stack key={r.id} spacing={0.5}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Rating value={r.estrellas} readOnly size="small" />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {r.autor} · {formatearFecha(r.fecha)}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {r.comentario}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}