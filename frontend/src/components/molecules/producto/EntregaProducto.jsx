import { Paper, Stack, Typography } from '@mui/material';
import { pesos } from '../../../utils/formatos';

export default function EntregaProducto({ envio }) {
  const { retiroEnTaller, despacho, costoEnvio, diasPreparacion } = envio;

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Entrega
      </Typography>

      <Stack spacing={0.5}>
        {retiroEnTaller && <Typography variant="body2">Retiro en taller disponible</Typography>}
        {despacho && (
          <Typography variant="body2">
            Despacho: {costoEnvio > 0 ? pesos(costoEnvio) : 'envío gratis'}
          </Typography>
        )}
        {!retiroEnTaller && !despacho && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            El vendedor no indicó opciones de entrega.
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Preparación: {diasPreparacion} {diasPreparacion === 1 ? 'día' : 'días'}
        </Typography>
      </Stack>
    </Paper>
  );
}