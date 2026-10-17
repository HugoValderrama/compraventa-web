import { Avatar, Box, Stack, Typography } from '@mui/material'
import StarRoundedIcon from '@mui/icons-material/StarRounded'

const nota = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const iniciales = (nombre) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('')

export default function ProveedorCard({ proveedor }) {
  const { nombre, calificacion, totalResenas } = proveedor
  const conResenas = calificacion != null && totalResenas > 0

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}
    >
      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
        {iniciales(nombre)}
      </Avatar>

      <Box>
        <Typography sx={{ fontWeight: 600 }}>{nombre}</Typography>

        {conResenas ? (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <StarRoundedIcon fontSize="small" sx={{ color: 'warning.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {nota.format(calificacion)} ({totalResenas}{' '}
              {totalResenas === 1 ? 'reseña' : 'reseñas'})
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sin reseñas todavía
          </Typography>
        )}
      </Box>
    </Stack>
  )
}