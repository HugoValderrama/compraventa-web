import { Chip, Stack, Typography } from '@mui/material';

const ESTADOS = {
  agotado: { texto: 'Agotado', color: 'error' },
  bajo: { texto: 'Stock bajo', color: 'warning' },
  disponible: { texto: 'Disponible', color: 'success' },
};

// El estado siempre lleva texto: el color solo refuerza.
export default function ChipEstadoStock({ estado, sinGuardar = false }) {
  const { texto, color } = ESTADOS[estado];

  return (
    <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
      <Chip label={texto} color={color} size="small" />
      {sinGuardar && (
        <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 600 }}>
          Sin guardar
        </Typography>
      )}
    </Stack>
  );
}