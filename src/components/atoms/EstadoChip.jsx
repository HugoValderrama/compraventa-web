import { Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'

const COLORES_COTIZACION = {
  'Pendiente de respuesta': 'warning',
  Respondida: 'info',
  Aceptada: 'success',
  Cancelada: 'error',
}

// El dato guarda el estado completo, pero en pantalla se muestra abreviado.
const ETIQUETAS = {
  'Pendiente de respuesta': 'Pendiente',
}

export default function EstadoChip({ estado }) {
  const activo = estado === 'Activo'

  return (
    <Chip
      label={ETIQUETAS[estado] ?? estado}
      size="small"
      color={COLORES_COTIZACION[estado]}
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