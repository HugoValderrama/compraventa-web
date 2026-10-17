import { Box, Typography } from '@mui/material'
import { AZUL } from '../../constants/colores'

export default function ImagenServicio({ foto, nombre }) {
  const base = {
    width: '100%',
    aspectRatio: '16 / 10',
    borderRadius: 2,
    objectFit: 'cover',
  }

  return foto ? (
    <Box component="img" src={foto} alt={nombre} sx={base} />
  ) : (
    <Box
      role="img"
      aria-label={`Sin imagen para ${nombre}`}
      sx={{
        ...base,
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'action.hover',
        color: AZUL,
        textAlign: 'center',
        p: 1,
      }}
    >
      <Typography variant="caption">Sin imagen</Typography>
    </Box>
  )
}