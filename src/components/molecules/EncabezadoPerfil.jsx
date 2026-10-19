import { useNavigate } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';

// `cambio` es opcional: { texto, ruta }. Solo se pasa si el usuario tiene ambos roles.
export default function EncabezadoPerfil({ titulo, cambio }) {
  const navigate = useNavigate();

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        mb: 3,
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
      }}
    >
      <Typography variant="h5" sx={{ color: 'white' }}>
        {titulo}
      </Typography>

      {cambio && (
        <Button
          variant="outlined"
          onClick={() => navigate(cambio.ruta)}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.12)' },
          }}
        >
          {cambio.texto}
        </Button>
      )}
    </Stack>
  );
}