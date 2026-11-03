import { Chip, Stack, ToggleButton, Typography } from '@mui/material';
import { esStockBajo } from '../../../utils/productos';

export default function SelectorVariante({ tipo, variantes, seleccionadaId, onSeleccionar, error }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {tipo}:
      </Typography>

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {variantes.map((v) => {
          const agotada = v.stock === 0;

          return (
            <ToggleButton
              key={v.id}
              value={v.id}
              size="small"
              selected={seleccionadaId === v.id}
              disabled={agotada}
              onChange={() => onSeleccionar(v)}
              sx={{ textTransform: 'none', flexDirection: 'column', alignItems: 'flex-start', px: 1.5, py: 0.75 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {v.etiqueta}
              </Typography>
              <Typography variant="caption">{agotada ? 'Agotado' : `${v.stock} en stock`}</Typography>
              {esStockBajo(v.stock) && (
                <Chip label="Stock bajo" size="small" color="warning" sx={{ mt: 0.5 }} />
              )}
            </ToggleButton>
          );
        })}
      </Stack>

      {error && (
        <Typography variant="caption" sx={{ color: 'error.main' }}>
          {error}
        </Typography>
      )}
    </Stack>
  );
}