import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Badge,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  Paper,
  Popover,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { obtenerPanelModeracion } from './moderacionMensajeria'
import { cargarPreguntas, estadoPregunta } from '../MisPreguntas/preguntas.js'
import { cargarMensajeria } from "./mensajeriaLocal.js";
const AZUL = '#0088ff'

// Accesos del encabezado. Una ruta en null significa que esa pantalla aún no existe:
// al construirla, escribe aquí su ruta (y agrega su <Route> en App.jsx).
// "Notificaciones" y "Tickets" no navegan: abren su propia vista dentro del panel.
const ACCESOS = [
  { clave: 'panel', texto: 'Panel Admin', icono: PersonOutlineIcon, ruta: '/admin' },
  { clave: 'notificaciones', texto: 'Notificaciones', icono: NotificationsNoneIcon, ruta: null },
  { clave: 'Entradas', texto: 'Entradas', icono: ConfirmationNumberOutlinedIcon, ruta: null },
  { clave: 'Reportes', texto: 'Reporte', icono: AssessmentOutlinedIcon, ruta: '/reportes' },
]

const TIPOS = {
  pregunta: { titulo: 'Pregunta pendiente', enlace: 'Ver pregunta →', irA: 'Ir a la publicación' },
  mensaje: { titulo: 'Mensaje sin respuesta', enlace: 'Ver conversación →', irA: 'Abrir conversación' },
}

// Pantalla a la que lleva cada pendiente. Ninguna exige modo cliente ni emprendedor,
// así que también abren con el modo administrador.
// Los datos de ejemplo del panel no traen ids reales, así que si el dato no trae
// "publicacionId" / "conversacionId" se usa la más antigua que siga sin respuesta
// en los módulos de preguntas y mensajería.
const porFecha = (a, b) => Date.parse(a) - Date.parse(b)

function destinoPregunta(pendiente) {
  if (pendiente.publicacionId) return `/productos/${encodeURIComponent(pendiente.publicacionId)}`

  const { preguntas } = cargarPreguntas()
  const real = preguntas
    .filter((q) => estadoPregunta(q) === 'pendientes')
    .sort((a, b) => porFecha(a.creadaEn, b.creadaEn))[0]

  if (!real) return pendiente.ruta ?? '/catalogo'
  const base = real.publicacion.tipo === 'servicio' ? '/servicios' : '/productos'
  return `${base}/${encodeURIComponent(real.publicacion.id)}` // pantalla donde se ve la pregunta
}

function destinoMensaje(pendiente) {
  if (pendiente.conversacionId) return `/mensajeria/${encodeURIComponent(pendiente.conversacionId)}`

  const { conversaciones } = cargarMensajeria()
  const real = conversaciones
    .filter((c) => c.mensajes.at(-1)?.autor === 'contacto') // el último mensaje es del otro y no se respondió
    .sort((a, b) => porFecha(a.mensajes.at(-1).fecha, b.mensajes.at(-1).fecha))[0]

  return real ? `/mensajeria/${encodeURIComponent(real.id)}` : (pendiente.ruta ?? '/mensajeria')
}

const destinoDe = (pendiente) =>
  pendiente.tipo === 'pregunta' ? destinoPregunta(pendiente) : destinoMensaje(pendiente)

// TODO: conectar API. Tickets de ejemplo hasta que exista el backend.
const HORA_MS = 60 * 60 * 1000
const haceHoras = (horas) => new Date(Date.now() - horas * HORA_MS).toISOString()

const TICKETS = [
  { id: 'TCK-0101', asunto: 'Pedido no recibido', usuario: 'Camila Rojas', estado: 'Abierto', fecha: haceHoras(30) },
  { id: 'TCK-0102', asunto: 'Solicitud de reembolso', usuario: 'Diego Soto', estado: 'En revisión', fecha: haceHoras(52) },
  { id: 'TCK-0103', asunto: 'Publicación con datos incorrectos', usuario: 'Taller Tierra', estado: 'Resuelto', fecha: haceHoras(120) },
]

const COLORES_ESTADO = {
  Abierto: { bg: '#fff3d9', color: '#996200' },
  'En revisión': { bg: '#e8f4fd', color: '#0070d1' },
  Resuelto: { bg: '#eaf6ee', color: '#21864b' },
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

function TarjetaPendiente({ pendiente, onAbrir }) {
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

        <ButtonBase onClick={onAbrir} sx={estiloEnlace}>
          {enlace}
        </ButtonBase>
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
  const [anclaNotifs, setAnclaNotifs] = useState(null)
  const [leidas, setLeidas] = useState([])
  const [detalle, setDetalle] = useState(null) // pregunta o mensaje abierto
  const [ticketsAbierto, setTicketsAbierto] = useState(false)

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

  // Las notificaciones son lo que está pendiente de atender.
  const sinLeer = pendientes.filter((p) => !leidas.includes(p.id)).length

  const marcarLeida = (id) => setLeidas((previas) => (previas.includes(id) ? previas : [...previas, id]))

  // "Ver pregunta", "Ver conversación" y las notificaciones abren el mismo detalle.
  const abrirDetalle = (pendiente) => {
    marcarLeida(pendiente.id)
    setAnclaNotifs(null)
    setDetalle(pendiente)
  }

  const marcarTodasLeidas = () => setLeidas(pendientes.map((p) => p.id))

  const ticketsAbiertos = TICKETS.filter((t) => t.estado !== 'Resuelto').length
  const tipoDetalle = detalle ? TIPOS[detalle.tipo] : null

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
            {ACCESOS.map(({ clave, texto, icono: Icono, ruta }) => {
              let accion
              let icono = <Icono />

              if (clave === 'notificaciones') {
                accion = {
                  onClick: (event) => setAnclaNotifs(event.currentTarget),
                  'aria-haspopup': 'true',
                  'aria-label': sinLeer > 0 ? `Notificaciones, ${sinLeer} sin leer` : 'Notificaciones',
                }
                icono = (
                  <Badge badgeContent={sinLeer} color="error">
                    <Icono />
                  </Badge>
                )
              } else if (clave === 'tickets') {
                accion = {
                  onClick: () => setTicketsAbierto(true),
                  'aria-haspopup': 'dialog',
                }
                icono = (
                  <Badge badgeContent={ticketsAbiertos} color="error">
                    <Icono />
                  </Badge>
                )
              } else if (ruta) {
                accion = { component: RouterLink, to: ruta }
              } else {
                accion = { onClick: () => setAviso(`${texto} aún no está disponible.`) }
              }

              return (
                <Button
                  key={clave}
                  {...accion}
                  startIcon={icono}
                  sx={{ color: 'text.primary', textTransform: 'none', fontWeight: 700, fontSize: 14 }}
                >
                  {texto}
                </Button>
              )
            })}
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
                  <TarjetaPendiente key={p.id} pendiente={p} onAbrir={() => abrirDetalle(p)} />
                ))}
              </Box>
            )}
          </Stack>
        )}
      </Container>

      {/* Lista de notificaciones */}
      <Popover
        open={Boolean(anclaNotifs)}
        anchorEl={anclaNotifs}
        onClose={() => setAnclaNotifs(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ width: 340, maxWidth: '90vw' }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>Notificaciones</Typography>
            <Button size="small" onClick={marcarTodasLeidas} disabled={sinLeer === 0} sx={{ textTransform: 'none' }}>
              Marcar todas como leídas
            </Button>
          </Stack>
          <Divider />

          {pendientes.length === 0 ? (
            <Typography sx={{ px: 2, py: 2, fontSize: 14, color: 'text.secondary' }}>
              No tienes notificaciones.
            </Typography>
          ) : (
            <List disablePadding>
              {pendientes.map((p) => {
                const leida = leidas.includes(p.id)
                return (
                  <ListItemButton
                    key={p.id}
                    onClick={() => abrirDetalle(p)}
                    sx={{ alignItems: 'flex-start', gap: 1.25, bgcolor: leida ? 'transparent' : '#EEF6FF' }}
                  >
                    <WarningAmberIcon fontSize="small" sx={{ mt: 0.25, color: leida ? 'text.disabled' : AZUL }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: leida ? 400 : 700, overflowWrap: 'anywhere' }}>
                        {p.tipo === 'pregunta'
                          ? `Pregunta pendiente en "${p.publicacion}"`
                          : `Mensaje sin respuesta: "${p.publicacion}"`}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary', overflowWrap: 'anywhere' }}>
                        {p.texto} · {haceTiempo(p.fecha)}
                      </Typography>
                    </Box>
                  </ListItemButton>
                )
              })}
            </List>
          )}
        </Box>
      </Popover>

      {/* Detalle de la pregunta o conversación */}
      <Dialog open={Boolean(detalle)} onClose={() => setDetalle(null)} fullWidth maxWidth="xs">
        {detalle && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{tipoDetalle.titulo}</DialogTitle>
            <DialogContent>
              <Stack spacing={1.5}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Publicación</Typography>
                  <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{detalle.publicacion}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {detalle.tipo === 'pregunta' ? 'Pregunta' : 'Último mensaje'}
                  </Typography>
                  <Typography sx={{ overflowWrap: 'anywhere' }}>{detalle.texto}</Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {haceTiempo(detalle.fecha)} · sin respuesta
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setDetalle(null)} sx={{ textTransform: 'none' }}>
                Cerrar
              </Button>
              <Button
                component={RouterLink}
                to={destinoDe(detalle)}
                onClick={() => setDetalle(null)}
                variant="contained"
                disableElevation
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {tipoDetalle.irA}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Tickets */}
      <Dialog open={ticketsAbierto} onClose={() => setTicketsAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          Tickets
          <Typography component="span" sx={{ display: 'block', fontSize: 13, fontWeight: 400, color: 'text.secondary' }}>
            {plural(ticketsAbiertos, 'ticket por atender', 'tickets por atender')}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <List disablePadding>
            {TICKETS.map((t, indice) => {
              const colores = COLORES_ESTADO[t.estado]
              return (
                <Box key={t.id}>
                  {indice > 0 && <Divider />}
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ py: 1.5, alignItems: 'flex-start', justifyContent: 'space-between' }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, overflowWrap: 'anywhere' }}>
                        {t.id} · {t.asunto}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {t.usuario} · {haceTiempo(t.fecha)}
                      </Typography>
                    </Box>
                    <Chip
                      label={t.estado}
                      size="small"
                      sx={{ bgcolor: colores.bg, color: colores.color, fontWeight: 700, flexShrink: 0 }}
                    />
                  </Stack>
                </Box>
              )
            })}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setTicketsAbierto(false)} sx={{ textTransform: 'none' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

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
} //////////////////////////////////////////////////