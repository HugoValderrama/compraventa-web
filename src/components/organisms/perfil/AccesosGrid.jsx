import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper } from '@mui/material';

export default function AccesosGrid({ accesos }) {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 3,
        }}
      >
        {accesos.map(({ titulo, icono: Icono, ruta }) => (
          <Button
            key={ruta}
            variant="contained"
            startIcon={Icono ? <Icono /> : null}
            onClick={() => navigate(ruta)}
          >
            {titulo}
          </Button>
        ))}
      </Box>
    </Paper>
  );
}