import { Box, Paper, Typography } from '@mui/material';
import TarjetaContador from '../../molecules/dashboard/TarjetaContador';

export default function PendientesPanel({ cotizaciones, preguntas }) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Pendientes
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
        <TarjetaContador
          titulo="Cotizaciones por responder"
          valor={cotizaciones}
          to="/cotizaciones-recibidas"
          color={cotizaciones > 0 ? 'warning.dark' : 'text.primary'}
        />
        <TarjetaContador
          titulo="Preguntas sin responder"
          valor={preguntas}
          to="/preguntas-pendientes"
          color={preguntas > 0 ? 'warning.dark' : 'text.primary'}
        />
      </Box>
    </Paper>
  );
}