import { Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'

const COLORES = {
  // Cotizaciones
  'Pendiente de respuesta': 'warning',
  Respondida: 'info',
  Aceptada: 'success',
  Cancelada: 'error',
  // Pedidos
  Pagado: 'success',
  Recibido: 'warning',
  'En preparación': 'info',
  Enviado: 'success',
  Entregado: 'success',
}

const ETIQUETAS = {
  'Pendiente de respuesta': 'Pendiente',
}

export default function EstadoChip({ estado, etiqueta }) {
  const activo = estado === 'Activo'

  return (
    <Chip
      label={etiqueta ?? ETIQUETAS[estado] ?? estado}
      size="small"
      color={COLORES[estado]}
      sx={
        activo
          ? (t) => ({
              bgcolor: alpha(t.palette.success.main, 0.12),
              color: 'success.dark',
              fontWeight: 600,
            })
          : { fontWeight: 600 }
      }
    />
  )
}