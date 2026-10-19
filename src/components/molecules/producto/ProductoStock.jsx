import { Typography } from '@mui/material';
import { esStockBajo } from '../../../utils/productos';

export default function ProductoStock({ stock }) {
  const bajo = esStockBajo(stock);
  const color = stock === 0 ? 'error.main' : bajo ? 'warning.main' : 'success.main';
  const texto =
    stock === 0
      ? 'Sin stock'
      : `${stock} ${stock === 1 ? 'unidad disponible' : 'unidades disponibles'}${bajo ? ' (stock bajo)' : ''}`;

  return (
    <Typography variant="body2" sx={{ color, fontWeight: 600 }}>
      {texto}
    </Typography>
  );
}