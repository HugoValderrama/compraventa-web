import { Chip } from '@mui/material';

const COLORES = {
  Recibido: 'info',
  'En preparación': 'warning',
  Enviado: 'primary',
  Entregado: 'success',
  Cancelado: 'default',
};

export default function ChipEstadoPedido({ estado }) {
  return <Chip size="small" label={estado || 'Sin estado'} color={COLORES[estado] ?? 'default'} />;
}