import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined'
import RequestPageOutlinedIcon from '@mui/icons-material/RequestPageOutlined'
import TopNavBar from '../../components/organisms/TopNavBar'
import { AZUL, FONDO } from '../../constants/colores'
import {
  HORAS_ALERTA,
  HORAS_ENTRE_RECORDATORIOS,
  cargarModeracion,
  contarAlertas,
  enviarRecordatorio,
  formatearAntiguedad,
  formatearFechaModeracion,
  itemsEnAlerta,
  puedeRecordar,
  resolverItem,
  restablecerModeracion,
  suscribirModeracion,
} from './Moderacion.js'

// Triángulo de advertencia de la maqueta. Va dibujado aquí para no depender del paquete de iconos.
function IconoAdvertencia(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 5.99 19.53 19H4.47L12 5.99M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" />
    </SvgIcon>
  )
}

const TINTA = '#16163A'
const ENLACE = '#0B4FA8'
const POR_COLUMNA = 3

// Barra de secciones del administrador.
// Pon disponible: true y la ruta real cuando exista cada pantalla.
const SECCIONES_ADMIN = [
  { etiqueta: 'Panel Admin', ruta: '/admin', disponible: false, Icono: DashboardOutlinedIcon },
  { etiqueta: 'Notificaciones', ruta: '/admin/notificaciones', disponible: false, Icono: NotificationsNoneOutlinedIcon },
  { etiqueta: 'Tickets', ruta: '/admin/tickets', disponible: false, Icono: QuestionAnswerOutlinedIcon },
  { etiqueta: 'Reportes', ruta: '/admin/reportes', disponible: false, Icono: RequestPageOutlinedIcon },
]

const TIPOS_EN_ORDEN = ['pregunta', 'mensaje']

const TEXTOS = {
  pregunta: {
    tarjeta: 'Pregunta pendiente',
    ver: 'Ver pregunta',
    columna: 'Preguntas pendientes',
    alerta: 'Preguntas sin respuestas',
    vacio: `No hay preguntas con más de ${HORAS_ALERTA} horas sin respuesta.`,
    escrita: 'Escrita por',
    recibida: 'Recibida',
  },
  mensaje: {
    tarjeta: 'Mensaje sin respuesta',
    ver: 'Ver conversación',
    columna: 'Mensajes sin respuesta',
    alerta: 'Mensajes sin respuesta',
    vacio: `No hay mensajes con más de ${HORAS_ALERTA} horas sin respuesta.`,
    escrita: 'Escrito por',
    recibida: 'Recibido',
  },
}

function textoAlerta(tipo, cantidad) {
  const sujeto = tipo === 'pregunta' ? ['pregunta', 'preguntas'] : ['mensaje', 'mensajes']
  return cantidad === 1
    ? `Tienes 1 ${sujeto[0]} que lleva más de ${HORAS_ALERTA} horas sin respuesta.`
    : `Tienes ${cantidad} ${sujeto[1]} que llevan más de ${HORAS_ALERTA} horas sin respuesta.`
}

// Solo para lectores de pantalla.
const soloLector = {
  position: 'absolute',
  width: 1,
  height: 1,
  p: 0,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
}

/* ------------------------------------------------------------------ */
/* Barra de secciones                                                  */
/* ------------------------------------------------------------------ */

function SeccionesAdmin({ onIr }) {
  return (
    <Paper component="nav" aria-label="Secciones de administración" elevation={0} sx={{ borderRadius: 2.5, p: 0.75, mb: 2.5 }}>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {SECCIONES_ADMIN.map(({ etiqueta, ruta, disponible, Icono }) => {
          const boton = (
            <Button
              disabled={!disponible}
              startIcon={<Icono />}
              onClick={() => onIr(ruta)}
              sx={{ textTransform: 'none', fontWeight: 600, color: TINTA }}
            >
              {etiqueta}
            </Button>
          )

          // Un botón deshabilitado no dispara el tooltip: va dentro de un span.
          return disponible ? (
            <React.Fragment key={etiqueta}>{boton}</React.Fragment>
          ) : (
            <Tooltip key={etiqueta} title="Próximamente">
              <span>{boton}</span>
            </Tooltip>
          )
        })}
      </Stack>
    </Paper>
  )
}

/* ------------------------------------------------------------------ */
/* Banner de alertas                                                   */
/* ------------------------------------------------------------------ */

function BannerAlertas({ conteo }) {
  const tiposConAlerta = TIPOS_EN_ORDEN.filter((tipo) => conteo[tipo] > 0)
  const hayAlertas = tiposConAlerta.length > 0

  return (
    <Paper
      component="section"
      aria-label="Alertas"
      elevation={0}
      sx={{ bgcolor: AZUL, color: TINTA, borderRadius: 3, p: { xs: 2, sm: 3 }, mb: 2.5 }}
    >
      <Stack spacing={1.5} aria-live="polite">
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {hayAlertas ? <IconoAdvertencia /> : <CheckIcon />}
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: 18 }}>
            Alertas
          </Typography>
        </Stack>

        {hayAlertas ? (
          tiposConAlerta.map((tipo) => (
            <Box key={tipo}>
              <Typography sx={{ fontWeight: 700 }}>{TEXTOS[tipo].alerta}</Typography>
              <Typography>{textoAlerta(tipo, conteo[tipo])}</Typography>
            </Box>
          ))
        ) : (
          <Typography>
            Todo al día: no hay preguntas ni mensajes con más de {HORAS_ALERTA} horas sin respuesta.
          </Typography>
        )}
      </Stack>
    </Paper>
  )
}

/* ------------------------------------------------------------------ */
/* Tarjetas                                                            */
/* ------------------------------------------------------------------ */

function TarjetaAlerta({ item, ahora, onVer }) {
  const textos = TEXTOS[item.tipo]

  return (
    <Paper component="article" elevation={0} sx={{ borderRadius: 2.5, p: 2, bgcolor: 'white', color: TINTA }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconoAdvertencia fontSize="small" aria-hidden="true" />
          <Typography component="h3" sx={{ fontWeight: 600 }}>
            {textos.tarjeta}
          </Typography>
        </Stack>

        <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', px: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18, overflowWrap: 'anywhere' }}>{item.publicacion}</Typography>
          <Typography sx={{ overflowWrap: 'anywhere' }}>{item.texto}</Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', rowGap: 0 }}
        >
          <Typography component="span" sx={{ fontWeight: 600 }}>
            {formatearAntiguedad(item.fecha, ahora)}
          </Typography>
          <Button onClick={() => onVer(item.id)} sx={{ textTransform: 'none', fontWeight: 700, color: ENLACE }}>
            {textos.ver}
            <Box component="span" sx={soloLector}>{` de ${item.publicacion}`}</Box>
            <Box component="span" aria-hidden="true" sx={{ ml: 0.5 }}>→</Box>
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

function ColumnaAlertas({ tipo, items, ahora, onVer }) {
  const [expandida, setExpandida] = React.useState(false)
  const textos = TEXTOS[tipo]
  const idTitulo = `titulo-columna-${tipo}`
  const visibles = expandida ? items : items.slice(0, POR_COLUMNA)
  const ocultas = items.length - visibles.length

  const estiloBoton = { color: 'white', textTransform: 'none', fontWeight: 700 }

  return (
    <Box component="section" aria-labelledby={idTitulo} sx={{ flex: '1 1 0', minWidth: 0 }}>
      <Typography id={idTitulo} component="h2" sx={soloLector}>
        {textos.columna} ({items.length})
      </Typography>

      <Stack spacing={2}>
        {items.length === 0 ? (
          <Paper elevation={0} sx={{ borderRadius: 2.5, p: 2, bgcolor: 'white', color: TINTA }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CheckIcon fontSize="small" aria-hidden="true" />
              <Typography>{textos.vacio}</Typography>
            </Stack>
          </Paper>
        ) : (
          visibles.map((item) => <TarjetaAlerta key={item.id} item={item} ahora={ahora} onVer={onVer} />)
        )}

        {ocultas > 0 && (
          <Button onClick={() => setExpandida(true)} sx={estiloBoton}>
            Mostrar {ocultas} más
          </Button>
        )}
        {expandida && items.length > POR_COLUMNA && (
          <Button onClick={() => setExpandida(false)} sx={estiloBoton}>
            Mostrar menos
          </Button>
        )}
      </Stack>
    </Box>
  )
}

/* ------------------------------------------------------------------ */
/* Detalle: ver el mensaje y actuar                                    */
/* ------------------------------------------------------------------ */

function Dato({ etiqueta, valor }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 1 }}>
      <Typography component="dt" sx={{ fontWeight: 700, fontSize: 14 }}>
        {etiqueta}:
      </Typography>
      <Typography component="dd" sx={{ m: 0, fontSize: 14, overflowWrap: 'anywhere' }}>
        {valor}
      </Typography>
    </Box>
  )
}

function DetalleItem({ item, ahora, onCerrar, onRecordar, onResolver }) {
  const [error, setError] = React.useState('')
  const textos = TEXTOS[item.tipo]
  const recordable = puedeRecordar(item, ahora)

  const intentar = (accion) => {
    try {
      accion(item.id)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="sm" aria-labelledby="titulo-detalle-moderacion">
      <DialogTitle id="titulo-detalle-moderacion" sx={{ overflowWrap: 'anywhere' }}>
        {textos.tarjeta}: {item.publicacion}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Box sx={{ bgcolor: '#F3F4F8', borderRadius: 2, p: 1.5 }}>
            <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{item.texto}</Typography>
          </Box>

          <Stack component="dl" spacing={0.5} sx={{ m: 0 }}>
            <Dato etiqueta={textos.escrita} valor={item.autor} />
            <Dato etiqueta="Emprendedor responsable" valor={item.emprendedor} />
            <Dato
              etiqueta={textos.recibida}
              valor={`${formatearFechaModeracion(item.fecha)} (${formatearAntiguedad(item.fecha, ahora).toLowerCase()})`}
            />
            <Dato
              etiqueta="Último recordatorio"
              valor={item.recordadoEn ? formatearAntiguedad(item.recordadoEn, ahora).toLowerCase() : 'Ninguno'}
            />
          </Stack>

          {!recordable && (
            <Typography variant="caption" color="text.secondary">
              Ya se envió un recordatorio. Podrás enviar otro pasadas {HORAS_ENTRE_RECORDATORIOS} horas.
            </Typography>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onCerrar}>Cerrar</Button>
        <Button variant="outlined" onClick={() => intentar(onResolver)}>
          Marcar como resuelta
        </Button>
        <Button variant="contained" disabled={!recordable} onClick={() => intentar(onRecordar)}>
          Enviar recordatorio
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function PanelModeracionPage() {
  const navigate = useNavigate()
  const [ahora, setAhora] = React.useState(() => new Date())
  const [datos, setDatos] = React.useState(() => cargarModeracion(undefined, ahora))
  const [idSeleccionado, setIdSeleccionado] = React.useState(null)
  const [mensaje, setMensaje] = React.useState('')
  const [errorAccion, setErrorAccion] = React.useState('')

  // Recarga cuando cambian los datos (otra pestaña) o al volver a la ventana.
  // El reloj avanza cada minuto para que "Hace X horas" no quede desactualizado.
  React.useEffect(() => {
    const recargar = () => {
      const instante = new Date()
      setAhora(instante)
      setDatos(cargarModeracion(undefined, instante))
    }
    const cancelar = suscribirModeracion(recargar)
    window.addEventListener('focus', recargar)
    const reloj = window.setInterval(() => setAhora(new Date()), 60_000)

    return () => {
      cancelar()
      window.removeEventListener('focus', recargar)
      window.clearInterval(reloj)
    }
  }, [])

  const conteo = React.useMemo(() => contarAlertas(datos.items, ahora), [datos.items, ahora])
  const porTipo = React.useMemo(
    () => ({
      pregunta: itemsEnAlerta(datos.items, 'pregunta', ahora),
      mensaje: itemsEnAlerta(datos.items, 'mensaje', ahora),
    }),
    [datos.items, ahora],
  )

  // Se deriva de los datos: si alguien lo resuelve en otra pestaña, el diálogo se cierra solo.
  const seleccionado = datos.items.find((item) => item.id === idSeleccionado && item.estado === 'pendiente') ?? null

  // Las acciones lanzan un Error si algo falla; el diálogo lo muestra.
  const recordar = (id) => {
    const instante = new Date()
    const resultado = enviarRecordatorio(id, undefined, instante)
    setAhora(instante)
    setDatos({ items: resultado.items, error: '' })
    setMensaje(`Recordatorio enviado a ${resultado.item.emprendedor}.`)
    setErrorAccion('')
    setIdSeleccionado(null)
  }

  const resolver = (id) => {
    const instante = new Date()
    const resultado = resolverItem(id, undefined, instante)
    setAhora(instante)
    setDatos({ items: resultado.items, error: '' })
    setMensaje(`“${resultado.item.publicacion}” se marcó como resuelta.`)
    setErrorAccion('')
    setIdSeleccionado(null)
  }

  const restablecer = () => {
    try {
      const instante = new Date()
      const resultado = restablecerModeracion(undefined, instante)
      setAhora(instante)
      setDatos(resultado)
      setMensaje('Se restablecieron los datos de prueba.')
      setErrorAccion('')
      setIdSeleccionado(null)
    } catch (err) {
      setErrorAccion(err.message)
    }
  }

  const reintentar = () => {
    const instante = new Date()
    setAhora(instante)
    setDatos(cargarModeracion(undefined, instante))
  }

  return (
    <Box translate="no" className="notranslate" sx={{ bgcolor: FONDO, minHeight: '100dvh' }}>
      <TopNavBar title="Moderación" />

      <Container maxWidth="lg" sx={{ pt: 2.5, pb: 4 }}>
        <Typography component="h1" sx={soloLector}>
          Panel de moderación
        </Typography>

        <SeccionesAdmin onIr={navigate} />

        {datos.error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={reintentar}>
                Reintentar
              </Button>
            }
          >
            {datos.error}
          </Alert>
        ) : (
          <>
            {mensaje && (
              <Alert severity="success" onClose={() => setMensaje('')} sx={{ mb: 2 }}>
                {mensaje}
              </Alert>
            )}
            {errorAccion && (
              <Alert severity="error" onClose={() => setErrorAccion('')} sx={{ mb: 2 }}>
                {errorAccion}
              </Alert>
            )}

            <BannerAlertas conteo={conteo} />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: { md: 'flex-start' } }}>
              {TIPOS_EN_ORDEN.map((tipo) => (
                <ColumnaAlertas key={tipo} tipo={tipo} items={porTipo[tipo]} ahora={ahora} onVer={setIdSeleccionado} />
              ))}
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 3, color: 'rgba(255,255,255,0.85)' }}
            >
              <Typography variant="caption">Vista de prueba · Los datos se guardan en este navegador.</Typography>
              <Button
                size="small"
                onClick={restablecer}
                sx={{ color: 'white', textTransform: 'none', textDecoration: 'underline' }}
              >
                Restablecer datos de prueba
              </Button>
            </Stack>
          </>
        )}
      </Container>

      {seleccionado && (
        <DetalleItem
          key={seleccionado.id}
          item={seleccionado}
          ahora={ahora}
          onCerrar={() => setIdSeleccionado(null)}
          onRecordar={recordar}
          onResolver={resolver}
        />
      )}
    </Box>
  )
}