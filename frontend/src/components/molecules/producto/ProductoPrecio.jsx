import { Chip, Stack, Typography } from '@mui/material';
import { pesos } from '../../../utils/formatos';
import { precioVigente } from '../../../utils/productos';

export default function ProductoPrecio({ producto, grande = false }) {
  const { precio, precioNormal, descuento } = precioVigente(producto);

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
      <Typography sx={{ color: '#62A7F5', fontWeight: 800, fontSize: grande ? 28 : 18 }}>
        {pesos(precio)}
      </Typography>

      {descuento > 0 && (
        <>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', textDecoration: 'line-through' }}
          >
            {pesos(precioNormal)}
          </Typography>
          <Chip label={`-${descuento}%`} size="small" color="error" />
        </>
      )}
    </Stack>
  );
}