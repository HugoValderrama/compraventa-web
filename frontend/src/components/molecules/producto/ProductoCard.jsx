import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import ProductoImagen from './ProductoImagen';
import ProductoPrecio from './ProductoPrecio';

export default function ProductoCard({ producto, onClick }) {
  return (
    <Card variant="outlined">
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <ProductoImagen src={producto.fotos[0]} nombre={producto.nombre} sx={{ borderRadius: 0 }} />
        <CardContent sx={{ p: 1.5 }}>
          <Typography variant="caption" sx={{ color: '#62A7F5', fontWeight: 700 }}>
            {producto.categoria}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
            {producto.nombre}
          </Typography>
          <ProductoPrecio producto={producto} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}