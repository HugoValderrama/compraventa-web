import { useState } from 'react';
import { Box, ButtonBase, Stack } from '@mui/material';
import ProductoImagen from '../../molecules/producto/ProductoImagen';

export default function GaleriaProducto({ fotos, nombre }) {
  const [indice, setIndice] = useState(0);
  const actual = fotos[Math.min(indice, fotos.length - 1)]; // sin fotos -> placeholder "Sin imagen"

  return (
    <Stack spacing={1.5}>
      <ProductoImagen src={actual} nombre={nombre} />

      {fotos.length > 1 && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {fotos.map((url, i) => (
            <ButtonBase
              key={`${i}-${url.slice(-12)}`}
              onClick={() => setIndice(i)}
              aria-label={`Ver fotografía ${i + 1}`}
              aria-current={i === indice}
              sx={{
                width: 64,
                height: 64,
                borderRadius: 1,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: i === indice ? 'primary.main' : 'transparent',
              }}
            >
              <Box component="img" src={url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </ButtonBase>
          ))}
        </Stack>
      )}
    </Stack>
  );
}