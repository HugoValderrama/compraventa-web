import { Link as RouterLink } from 'react-router-dom';
import { Box, Chip, Link, Stack, Typography } from '@mui/material';
import ProductoImagen from '../producto/ProductoImagen';

// onNavegar(evento, ruta) permite pedir confirmación si hay cambios sin guardar.
export default function CabeceraProductoInventario({ grupo, onNavegar }) {
  const ruta = `/productos/${grupo.productoId}/editar`;

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <ProductoImagen
        src={grupo.foto}
        nombre={grupo.productoNombre}
        sx={{ width: 48, height: 48, flexShrink: 0 }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Link
          component={RouterLink}
          to={ruta}
          underline="hover"
          onClick={(e) => onNavegar(e, ruta)}
          sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}
        >
          {grupo.productoNombre}
        </Link>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          {grupo.categoria}
        </Typography>
        {!grupo.activo && <Chip label="Inactivo" size="small" sx={{ mt: 0.5 }} />}
      </Box>
    </Stack>
  );
}