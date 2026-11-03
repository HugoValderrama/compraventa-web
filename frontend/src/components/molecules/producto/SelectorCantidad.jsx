import { IconButton, Stack, Typography } from '@mui/material';

export default function SelectorCantidad({ cantidad, max, onChange, deshabilitado = false }) {
  const bloqueado = deshabilitado || max < 1;
  const botonSx = { width: 32, height: 32, fontSize: 18 };

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Cantidad:
      </Typography>

      <Stack
        direction="row"
        sx={{ alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
      >
        <IconButton
          aria-label="Disminuir cantidad"
          disabled={bloqueado || cantidad <= 1}
          onClick={() => onChange(cantidad - 1)}
          sx={botonSx}
        >
          −
        </IconButton>
        <Typography aria-live="polite" sx={{ minWidth: 32, textAlign: 'center' }}>
          {cantidad}
        </Typography>
        <IconButton
          aria-label="Aumentar cantidad"
          disabled={bloqueado || cantidad >= max}
          onClick={() => onChange(cantidad + 1)}
          sx={botonSx}
        >
          +
        </IconButton>
      </Stack>

      {max >= 1 && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Máx. {max}
        </Typography>
      )}
    </Stack>
  );
}