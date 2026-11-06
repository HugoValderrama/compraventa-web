import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { obtenerPanelModeracion } from './Moderacionmensajeria'

const AZUL = '#0088ff'

// Accesos del encabezado. Una ruta en null significa que esa pantalla aún no existe:
// al construirla, escribe aquí su ruta (y agrega su <Route> en App.jsx).
const ACCESOS = [
  { clave: 'panel', texto: 'Panel Admin', icono: PersonOutlineIcon, ruta: '/dashboard-admin' },
  { clave: 'notificaciones', texto: 'Notificaciones', icono: NotificationsNoneIcon, ruta: null },
  { clave: 'tickets', texto: 'Tickets', icono: ConfirmationNumberOutlinedIcon, ruta: null },
  { clave: 'reportes', texto: 'Reportes', icono: AssessmentOutlinedIcon, ruta: null },
]

const TIPOS = {
  pregunta: { titulo: 'Pregunta pendiente', enlace: 'Ver pregunta →' },
  mensaje: { titulo: 'Mensaje sin respuesta', enlace: 'Ver conversación →' },
}

const plural = (cantidad, singular, plural) => `${cantidad} ${cantidad === 1 ? singular : plural}`

// "Hace 3 días", "Hace 3 días y 8 horas", "Hace 5 horas"
function haceTiempo(fecha) {
  const horas = Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 3600000))
  if (horas < 1) return 'Hace menos de una hora'

  const dias = Math.floor(horas / 24)
  const resto = horas % 24
  if (dias === 0) return `Hace ${plural(horas, 'hora', 'horas')}`
  return `Hace ${plural(dias, 'día', 'días')}${resto ? ` y ${plural(resto, 'hora', 'horas')}` : ''}`
}

const estiloEnlace = {
  alignSelf: 'flex-start',
  fontSize: 13,
  fontWeight: 700,
  color: AZUL,
  borderRadius: 0.5,
  '&:hover': { textDecoration: 'underline' },
}

function TarjetaPendiente({ pendiente, onNoDisponible }) {
  const { titulo, enlace } = TIPOS[pendiente.tipo]

  return (
    <Paper component="article" sx={{ p: 2.5, borderRadius: '10px' }}>
      <Stack spacing={1.25} sx={{ height: '100%' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <WarningAmberIcon aria-hidden />
          <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
            {titulo}
          </Typography>
        </Stack>

        <Typography sx={{ fontSize: 14, fontWeight: 700, overflowWrap: 'anywhere' }}>
          {pendiente.publicacion}
        </Typography>
        <Typography sx={{ fontSize: 14, overflowWrap: 'anywhere' }}>{pendiente.texto}</Typography>
        <Typography sx={{ fontSize: 12, color: '#707070' }}>{haceTiempo(pendiente.fecha)}</Typography>

        {pendiente.ruta ? (
          <ButtonBase component={RouterLink} to={pendiente.ruta} sx={estiloEnlace}>
            {enlace}
          </ButtonBase>
        ) : (
          <ButtonBase onClick={onNoDisponible} sx={estiloEnlace}>
            {enlace}
          </ButtonBase>
        )}
      </Stack>
    </Paper>
  )
}

export default function PanelModeracion() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let activo = true

    obtenerPanelModeracion()
      .then((resultado) => {
        if (activo) setDatos(resultado)
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar el panel de moderación.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [intento])

  const reintentar = () => {
    setCargando(true)
    setError('')
    setIntento((n) => n + 1)
  }

  const pendientes = datos
    ? [
        ...datos.preguntas.map((p) => ({ ...p, tipo: 'pregunta' })),
        ...datos.mensajes.map((m) => ({ ...m, tipo: 'mensaje' })),
      ]
    : []

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        {/* Encabezado */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, alignItems: { sm: 'center' } }}>
          <Paper sx={{ px: 2, py: 1, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src="/logo.png" alt="" sx={{ width: 28, height: 28, borderRadius: '50%' }} />
            <Typography component="h1" sx={{ fontSize: 22, fontWeight: 700 }}>
              Moderación
            </Typography>
          </Paper>

          <Paper
            component="nav"
            aria-label="Accesos de moderación"
            sx={{ flex: 1, px: 1, py: 0.5, borderRadius: '10px', display: 'flex', flexWrap: 'wrap', justifyContent: { sm: 'space-around' } }}
          >
            {ACCESOS.map(({ clave, texto, icono: Icono, ruta }) => (
              <Button
                key={clave}
                {...(ruta
                  ? { component: RouterLink, to: ruta }
                  : { onClick: () => setAviso(`${texto} aún no está disponible.`) })}
                startIcon={<Icono />}
                sx={{ color: 'text.primary', textTransform: 'none', fontWeight: 700, fontSize: 14 }}
              >
                {texto}
              </Button>
            ))}
          </Paper>
        </Stack>

        {cargando && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress aria-label="Cargando panel" sx={{ color: 'white' }} />
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={reintentar}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!cargando && !error && datos && (
          <Stack spacing={3}>
            {/* Alerta */}
            <Paper
              role="status"
              sx={{ p: 3, borderRadius: '10px', bgcolor: '#62a7f5', boxShadow: 'none' }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <WarningAmberIcon aria-hidden sx={{ fontSize: 36 }} />
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Alertas</Typography>
                  <Typography component="h2" sx={{ fontSize: 20, fontWeight: 700 }}>
                    Preguntas sin respuestas
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mt: 2 }}>
                {pendientes.length
                  ? `Tienes preguntas que llevan más de ${datos.umbralHoras} horas sin respuesta.`
                  : `No hay preguntas ni mensajes con más de ${datos.umbralHoras} horas sin respuesta.`}
              </Typography>
            </Paper>

            {/* Pendientes */}
            {pendientes.length > 0 && (
              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
                {pendientes.map((p) => (
                  <TarjetaPendiente
                    key={p.id}
                    pendiente={p}
                    onNoDisponible={() => setAviso('Esta vista aún no está disponible.')}
                  />
                ))}
              </Box>
            )}
          </Stack>
        )}
      </Container>

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={3000}
        onClose={(_, razon) => {
          if (razon !== 'clickaway') setAviso('')
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" onClose={() => setAviso('')}>
          {aviso}
        </Alert>
      </Snackbar>
    </Box>
  )
}
