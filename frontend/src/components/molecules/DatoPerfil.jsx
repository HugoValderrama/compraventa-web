import { Typography } from '@mui/material';

export default function DatoPerfil({ etiqueta, valor }) {
  return (
    <Typography component="div" sx={{ overflowWrap: 'anywhere' }}>
      <strong>{etiqueta}:</strong> {valor || '—'}
    </Typography>
  );
}