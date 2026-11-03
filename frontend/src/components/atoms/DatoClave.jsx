import { Box, Stack, Typography } from '@mui/material'

export default function DatoClave({ icono: Icono, etiqueta, valor }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Icono fontSize="small" sx={{ color: 'text.secondary' }} />
      <Typography variant="body2">
        <Box component="span" sx={{ color: 'text.secondary' }}>
          {etiqueta}:{' '}
        </Box>
        <Box component="span" sx={{ fontWeight: 600 }}>
          {valor || '—'}
        </Box>
      </Typography>
    </Stack>
  )
}