import { Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'

// Chips con color sólido (cotizaciones)
const SOLIDOS = {
  'Pendiente de respuesta': 'warning',
  Respondida: 'info',
  Aceptada: 'success',
  Cancelada: 'error',
}

// Chips suaves, fondo translúcido (Activo, pedidos)
const SUAVES = {
  Activo: 'success',
  Pagado: 'success',
  Recibido: 'warning',
  'En preparación': 'warning',
  Enviado: 'info',
  Entregado: 'success',
}

const ETIQUETAS = {
  'Pendiente de respuesta': 'Pendiente',
}

export default function EstadoChip({ estado, etiqueta }) {
  const suave = SUAVES[estado]

  return (
    <Chip
      label={etiqueta ?? ETIQUETAS[estado] ?? estado}
      size="small"
      color={suave ? undefined : SOLIDOS[estado]}
      sx={
        suave
          ? (t) => ({
              bgcolor: alpha(t.palette[suave].main, 0.12),
              color: `${suave}.dark`,
              fontWeight: 600,
            })
          : { fontWeight: 600 }
      }
    />
  )
}