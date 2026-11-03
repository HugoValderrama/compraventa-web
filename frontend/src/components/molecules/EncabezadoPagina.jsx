import { Breadcrumbs, Link, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

// TODO: conectar API (nombre del taller del emprendedor autenticado)
const NOMBRE_TALLER = 'Taller Tierra'

export default function EncabezadoPagina({ titulo, accion }) {
  const navigate = useNavigate()

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, mb: 3 }}
    >
      <Stack spacing={0.5}>
        <Breadcrumbs
          separator="/"
          aria-label="Ruta de navegación"
          sx={{ color: 'white', fontSize: 12 }}
        >
          <Link
            component="button"
            type="button"
            underline="hover"
            color="inherit"
            sx={{ fontSize: 12 }}
            onClick={() => navigate('/perfilE')}
          >
            Mi perfil
          </Link>
          <Typography color="inherit" sx={{ fontSize: 12 }}>
            {NOMBRE_TALLER}
          </Typography>
          <Typography color="inherit" sx={{ fontSize: 12 }}>
            Emprendedor
          </Typography>
        </Breadcrumbs>

        <Typography variant="h5" sx={{ color: 'white' }}>
          {titulo}
        </Typography>
      </Stack>

      {accion}
    </Stack>
  )
}