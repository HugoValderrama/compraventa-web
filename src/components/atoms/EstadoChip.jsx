import { Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'

export default function EstadoChip({ estado }) {
  const activo = estado === 'Activo'

  return (
    <Chip
      label={estado}
      size="small"
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