import { Box, Typography } from '@mui/material';

export default function ProductoImagen({ src, nombre, sx }) {
  const base = {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: 2,
    objectFit: 'cover',
    bgcolor: '#FFFFFF',
    ...sx,
  };

  return src ? (
    <Box component="img" src={src} alt={nombre} sx={base} />
  ) : (
    <Box
      role="img"
      aria-label={`Sin imagen para ${nombre}`}
      sx={{ ...base, display: 'grid', placeItems: 'center', color: '#62A7F5', textAlign: 'center', p: 1 }}
    >
      <Typography variant="caption">Sin imagen</Typography>
    </Box>
  );
}