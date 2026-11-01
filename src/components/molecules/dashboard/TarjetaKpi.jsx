import { Paper, Typography } from '@mui/material';

export default function TarjetaKpi({ titulo, valor, detalle, color = 'text.primary' }) {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
        {titulo}
      </Typography>
      <Typography
        sx={{ fontWeight: 700, color, fontSize: { xs: '1.25rem', sm: '1.5rem' }, overflowWrap: 'anywhere' }}
      >
        {valor}
      </Typography>
      {detalle && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          {detalle}
        </Typography>
      )}
    </Paper>
  );
}