import { useNavigate } from 'react-router-dom';
import { Button, Paper, Stack, Typography } from '@mui/material';

export default function AccesosRapidos() {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Accesos rápidos
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
        <Button variant="contained" onClick={() => navigate('/productos/nuevo')}>
          Publicar producto
        </Button>
        <Button variant="contained" onClick={() => navigate('/servicios/nuevo')}>
          Publicar servicio
        </Button>
        <Button variant="outlined" onClick={() => navigate('/inventario')}>
          Ver inventario
        </Button>
      </Stack>
    </Paper>
  );
}