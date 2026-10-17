import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined'
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import EstadoChip from '../atoms/EstadoChip'
import { AZUL } from '../../constants/colores'
import { precioServicio } from '../../utils/formatos'

const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

const ICONOS = {
  'Talleres y clases': BrushOutlinedIcon,
  'Esmaltado y cocción': BrushOutlinedIcon,
  'Cerámica a medida': PaletteOutlinedIcon,
}

const precioTexto = (s) => {
  if (s.unidadCobro === 'persona') return `${clp.format(s.precio)} / persona`
  if (s.unidadCobro === 'hora') return `${clp.format(s.precio)} / hora`
  return `Desde ${clp.format(s.precio)}`
}

// Primera línea: modalidad · ubicación · duración (lo que exista).
const detalleTexto = (s) =>
  [s.modalidad, s.ubicacion, s.duracion].filter(Boolean).join(' · ')

export default function ServicioCard({ servicio, onEditar, onCambiarEstado }) {
  const Icono = ICONOS[servicio.categoria] ?? HandymanOutlinedIcon
  const pausar = servicio.estado === 'Activo'

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' } }}
      >
        <Box
          aria-hidden="true"
          sx={{
            width: 64,
            height: 64,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 2,
            bgcolor: alpha(AZUL, 0.15),
            color: AZUL,
          }}
        >
          <Icono fontSize="large" />
        </Box>

        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
            {servicio.nombre}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {detalleTexto(servicio)}
          </Typography>
          {servicio.diasHorario && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {servicio.diasHorario}
            </Typography>
          )}
        </Stack>

        <Stack spacing={1} sx={{ alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <EstadoChip estado={servicio.estado} />
            <Typography sx={{ color: AZUL, fontWeight: 800 }}>
              {precioServicio(servicio)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => onEditar(servicio)}>
              Editar
            </Button>
            <Button variant="contained" onClick={() => onCambiarEstado(servicio)}>
              {pausar ? 'Pausar' : 'Activar'}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}