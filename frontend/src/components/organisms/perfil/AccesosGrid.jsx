import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography } from '@mui/material';

// `titulo` es opcional: agrupa los accesos bajo un encabezado (perfil emprendedor).
export default function AccesosGrid({ accesos, titulo }) {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      {titulo && (
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          {titulo}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 3,
        }}
      >
        {accesos.map(({ titulo: etiqueta, icono: Icono, ruta }) => (
          <Button
            key={ruta}
            variant="contained"
            startIcon={Icono ? <Icono /> : null}
            onClick={() => navigate(ruta)}
          >
            {etiqueta}
          </Button>
        ))}
      </Box>
    </Paper>
  );
}