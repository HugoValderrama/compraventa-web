import { Stack, Typography } from '@mui/material'

export default function FilaDato({ etiqueta, valor, destacado = false }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: destacado ? 700 : 400 }}
      >
        {etiqueta}
      </Typography>
      <Typography
        component="div"
        sx={{
          fontWeight: destacado ? 700 : 500,
          textAlign: 'right',
          overflowWrap: 'anywhere',
        }}
      >
        {valor}
      </Typography>
    </Stack>
  )
}