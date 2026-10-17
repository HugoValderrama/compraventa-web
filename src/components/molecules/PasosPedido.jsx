import { Box, Stack, Typography } from '@mui/material'

const PASOS = ['Pagado', 'Por preparar', 'Enviado']

// completados: cuántos pasos están cumplidos (0 a 3)
export default function PasosPedido({ completados }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      role="list"
      aria-label="Progreso del pedido"
      sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}
    >
      {PASOS.map((paso, i) => {
        const hecho = i < completados

        return (
          <Stack
            key={paso}
            direction="row"
            spacing={1.5}
            role="listitem"
            sx={{ alignItems: 'center' }}
          >
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: 'center' }}
              aria-label={`${paso}${hecho ? ' (completado)' : ''}`}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: hecho ? 'text.primary' : 'text.disabled',
                  bgcolor: hecho ? 'text.primary' : 'transparent',
                }}
              />
              <Typography
                variant="body2"
                sx={{ fontWeight: hecho ? 600 : 400 }}
              >
                {paso}
              </Typography>
            </Stack>

            {i < PASOS.length - 1 && (
              <Typography color="text.secondary" aria-hidden>
                →
              </Typography>
            )}
          </Stack>
        )
      })}
    </Stack>
  )
}