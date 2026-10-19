import * as React from 'react'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Alert, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, List, ListItem, ListItemButton, Paper, Snackbar,
  Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import {
  CLIENTE_DEMO, EMPRENDEDOR_DEMO, MAXIMO_RESPUESTA, cargarPreguntas,
  contarPreguntas, estadoPregunta, filtrarPreguntas, formatearFechaPregunta,
  preguntasDelUsuario, responderPregunta, suscribirPreguntas,
} from './preguntas.js'

const AZUL = '#008FFF'
const ETIQUETAS = { todas: 'Todas', pendientes: 'Pendientes', respondidas: 'Respondidas' }

function BandejaPreguntas({ preguntas, conteos, estados, estado, onEstado, seleccionadaId, destino }) {
  return (
    <Paper component="section" aria-label="Historial de preguntas" elevation={0} sx={{ borderRadius: 2.5, p: 2.25, minWidth: 0 }}>
      <Tabs value={estado} onChange={(_, valor) => onEstado(valor)} variant="scrollable" scrollButtons="auto" aria-label="Filtrar preguntas por estado" slotProps={{ indicator: { sx: { display: 'none' } } }} sx={{ minHeight: 38, mb: 1.5, '& .MuiTabs-flexContainer': { gap: 0.5 } }}>
        {estados.map((valor) => (
          <Tab key={valor} value={valor} label={`${ETIQUETAS[valor]} (${conteos[valor]})`} sx={{ minHeight: 38, minWidth: 0, px: 1.5, py: 1, borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: 13, '&.Mui-selected': { bgcolor: AZUL, color: 'white' } }} />
        ))}
      </Tabs>
      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, maxHeight: 620, overflowY: 'auto' }}>
        {preguntas.map((pregunta) => (
          <ListItem disablePadding key={pregunta.id}>
            <ListItemButton component={RouterLink} to={destino(pregunta.id)} selected={seleccionadaId === pregunta.id} aria-current={seleccionadaId === pregunta.id ? 'page' : undefined} sx={{ display: 'block', p: 1.5, borderRadius: 1.5, bgcolor: '#F0F1F3', '&.Mui-selected': { bgcolor: '#E7F4FF' }, '&.Mui-selected:hover': { bgcolor: '#D9EDFE' } }}>
              <Typography sx={{ color: AZUL, fontWeight: 700, fontSize: 14, mb: 0.75, overflowWrap: 'anywhere' }}>{pregunta.publicacion.nombre}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.75, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{pregunta.texto}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}><span>{`${pregunta.autor.nombre} · ${formatearFechaPregunta(pregunta.creadaEn, true)}`}</span></Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {!preguntas.length && <Box sx={{ py: 4, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No hay preguntas en esta sección.</Typography></Box>}
    </Paper>
  )
}

function DetallePregunta({ pregunta, emprendedor, borrador, onBorrador, onPublicar, error, guardando, onPublicacion }) {
  const pendiente = !pregunta.respuesta
  const puedeResponder = emprendedor && pendiente
  return (
    <Paper component="section" aria-labelledby="pregunta-detalle-titulo" elevation={0} sx={{ borderRadius: 2.5, p: 2.5, minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography component="h2" id="pregunta-detalle-titulo" sx={{ fontWeight: 700, fontSize: 21 }}><span>{puedeResponder ? 'Responder pregunta' : emprendedor ? 'Respuesta publicada' : 'Detalle de mi pregunta'}</span></Typography>
        <Chip size="small" label="Pública" sx={{ bgcolor: '#E7F4FF', color: AZUL, fontSize: 12, fontWeight: 700, borderRadius: 0.5 }} />
      </Stack>
      <Button type="button" onClick={() => onPublicacion(pregunta.publicacion)} sx={{ color: AZUL, textTransform: 'none', fontSize: 13, fontWeight: 700, p: 0, minWidth: 0, mb: 1.5, textAlign: 'left', justifyContent: 'flex-start', overflowWrap: 'anywhere' }}><span>{`${pregunta.publicacion.nombre} · Ver publicación →`}</span></Button>
      <Divider sx={{ mb: 1.5 }} />
      <Typography component="h3" sx={{ fontWeight: 700, fontSize: 20, mb: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{pregunta.texto}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}><span>{`${pregunta.autor.nombre} · ${formatearFechaPregunta(pregunta.creadaEn)}`}</span></Typography>

      {puedeResponder ? (
        <Box component="form" onSubmit={onPublicar}>
          <Typography component="label" htmlFor="respuesta-publica" sx={{ display: 'block', mb: 0.5, fontSize: 14, fontWeight: 700 }}>Tu respuesta pública *</Typography>
          <TextField
            id="respuesta-publica" name="respuesta" fullWidth multiline minRows={3} maxRows={10}
            value={borrador} onChange={(event) => onBorrador(event.target.value.slice(0, MAXIMO_RESPUESTA))}
            placeholder="Escribe tu respuesta pública…"
            error={Boolean(error)}
            slotProps={{ htmlInput: { maxLength: MAXIMO_RESPUESTA, 'aria-describedby': 'respuesta-contador respuesta-error', 'aria-required': true } }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: 14, borderRadius: 1.5 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D4D9E2' } }}
          />
          <Typography id="respuesta-contador" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 1.5 }}><span>{`${borrador.length} / 1.000 caracteres`}</span></Typography>
          {error && <Alert id="respuesta-error" severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
          <Box sx={{ bgcolor: '#E7F4FF', borderRadius: 1.5, p: 1.5, mb: 2 }}><Typography variant="body2" sx={{ fontSize: 13 }}>La respuesta de esta demostración aparecerá en el historial del cliente. Evita incluir datos personales en una respuesta pública.</Typography></Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">Revisa tu respuesta antes de publicarla.</Typography>
            <Button type="submit" variant="contained" disableElevation disabled={!borrador.trim() || guardando} sx={{ bgcolor: AZUL, borderRadius: 1.5, textTransform: 'none', fontWeight: 700, px: 2.5, py: 1.25, flexShrink: 0, '&:hover': { bgcolor: '#0078D6' } }}><span>{guardando ? 'Guardando…' : 'Publicar respuesta pública'}</span></Button>
          </Stack>
        </Box>
      ) : pregunta.respuesta ? (
        <Box>
          <Chip size="small" label="Respondida" sx={{ bgcolor: '#E5F4E9', color: '#257942', fontWeight: 700, mb: 1.5 }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.75 }}>Respuesta del emprendedor</Typography>
          <Box sx={{ bgcolor: '#F0F1F3', borderRadius: 1.5, p: 1.5 }}><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{pregunta.respuesta.texto}</Typography></Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}><span>{`${pregunta.respuesta.emprendedorNombre} · ${formatearFechaPregunta(pregunta.respuesta.creadaEn)}`}</span></Typography>
        </Box>
      ) : (
        <Box sx={{ bgcolor: '#E7F4FF', borderRadius: 1.5, p: 2 }}>
          <Typography sx={{ color: AZUL, fontSize: 14, fontWeight: 700, mb: 0.5 }}>Pendiente de respuesta</Typography>
          <Typography variant="body2">El emprendedor todavía no ha respondido tu pregunta.</Typography>
        </Box>
      )}
    </Paper>
  )
}

function PublicacionDialog({ abierta, publicacion, onCerrar }) {
  return (
    <Dialog open={abierta} onClose={onCerrar} fullWidth maxWidth="sm" translate="no" className="notranslate" aria-labelledby="publicacion-pregunta-titulo">
      <DialogTitle id="publicacion-pregunta-titulo"><span>{publicacion?.nombre ?? 'Publicación'}</span></DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}><span>{`${publicacion?.tipo === 'servicio' ? 'Servicio' : 'Producto'} · ${publicacion?.emprendedorNombre ?? ''}`}</span></Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}><span>{publicacion?.descripcion ?? ''}</span></Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>Vista de prueba de la publicación asociada a esta pregunta.</Typography>
      </DialogContent>
      <DialogActions><Button type="button" onClick={onCerrar} sx={{ textTransform: 'none' }}>Cerrar</Button></DialogActions>
    </Dialog>
  )
}

function PantallaPreguntas({ modo }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const emprendedor = modo === 'emprendedor'
  const rutaBase = emprendedor ? '/preguntas-recibidas' : '/mis-preguntas'
  const estados = emprendedor ? ['pendientes', 'respondidas'] : ['todas', 'pendientes', 'respondidas']
  const parametroEstado = parametros.get('estado')
  const estado = estados.includes(parametroEstado) ? parametroEstado : emprendedor ? 'pendientes' : 'todas'
  const [datos, setDatos] = React.useState(() => cargarPreguntas())
  const [borradores, setBorradores] = React.useState({})
  const [errorRespuesta, setErrorRespuesta] = React.useState('')
  const [guardando, setGuardando] = React.useState(false)
  const [aviso, setAviso] = React.useState('')
  const [publicacionVista, setPublicacionVista] = React.useState(null)
  const [publicacionAbierta, setPublicacionAbierta] = React.useState(false)
  const procesando = React.useRef(false)

  React.useEffect(() => {
    const actualizar = () => setDatos(cargarPreguntas())
    const cancelar = suscribirPreguntas(actualizar)
    window.addEventListener('focus', actualizar)
    return () => {
      cancelar()
      window.removeEventListener('focus', actualizar)
    }
  }, [])

  const propias = preguntasDelUsuario(datos.preguntas, modo)
  const conteos = contarPreguntas(propias)
  const visibles = filtrarPreguntas(propias, estado)
  const seleccionada = id ? propias.find((pregunta) => pregunta.id === id) ?? null : visibles[0] ?? null
  const seleccionadaId = seleccionada?.id ?? null
  const fueraDelFiltro = seleccionada && estado !== 'todas' && estadoPregunta(seleccionada) !== estado

  React.useEffect(() => {
    setErrorRespuesta('')
  }, [seleccionadaId, modo])

  const destino = (preguntaId, filtro = estado) => {
    const siguientes = new URLSearchParams(parametros)
    siguientes.set('estado', filtro)
    return {
      pathname: preguntaId ? `${rutaBase}/${encodeURIComponent(preguntaId)}` : rutaBase,
      search: `?${siguientes.toString()}`,
    }
  }

  const cambiarEstado = (valor) => navigate(destino(null, valor))
  const cambiarBorrador = (texto) => {
    if (seleccionada) setBorradores((actuales) => ({ ...actuales, [seleccionada.id]: texto }))
    setErrorRespuesta('')
  }

  const handlePublicar = (event) => {
    event.preventDefault()
    if (!emprendedor || !seleccionada || procesando.current) return
    procesando.current = true
    setGuardando(true)
    setErrorRespuesta('')
    try {
      const siguientes = responderPregunta(seleccionada.id, borradores[seleccionada.id] ?? '')
      setDatos(siguientes)
      setBorradores((actuales) => ({ ...actuales, [seleccionada.id]: '' }))
      navigate(destino(seleccionada.id, 'respondidas'), { replace: true })
      setAviso('Respuesta guardada en esta demostración.')
    } catch (error) {
      setErrorRespuesta(error.message)
    } finally {
      procesando.current = false
      setGuardando(false)
    }
  }

  const abrirPublicacion = (publicacion) => {
    setPublicacionVista(publicacion)
    setPublicacionAbierta(true)
  }

  const titulo = emprendedor ? estado === 'respondidas' ? 'Preguntas Respondidas' : 'Preguntas Pendientes' : 'Mis Preguntas'
  const pendientesTexto = emprendedor ? `${conteos.pendientes} por responder` : `${conteos.pendientes} sin respuesta`

  return (
    <Box translate="no" className="notranslate" sx={{ minHeight: '100vh', bgcolor: '#3026A6', pb: 2 }}>
      <TopNavBar />
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', mb: 0.5 }}><span>{emprendedor ? `Mi perfil / ${EMPRENDEDOR_DEMO.nombre} / Emprendedor` : `Mi perfil / ${CLIENTE_DEMO.nombre} / Cliente`}</span></Typography>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
          <Typography component="h1" sx={{ fontSize: { xs: 25, md: 28 }, fontWeight: 700, color: 'white' }}><span>{titulo}</span></Typography>
          {!datos.error && <Chip size="small" label={pendientesTexto} sx={{ bgcolor: '#E7F4FF', color: AZUL, borderRadius: 0.5, fontWeight: 700 }} />}
        </Stack>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', mb: 2.5 }}>Demostración local · Las preguntas y respuestas de ejemplo se guardan en este navegador.</Typography>

        {datos.error ? (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setDatos(cargarPreguntas())}>Reintentar</Button>}>{datos.error}</Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 8fr)' }, gap: 2, alignItems: 'stretch', minHeight: { md: 470 } }}>
            <BandejaPreguntas preguntas={visibles} conteos={conteos} estados={estados} estado={estado} onEstado={cambiarEstado} seleccionadaId={seleccionadaId} destino={destino} />
            {seleccionada ? (
              <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {fueraDelFiltro && <Alert severity="info" action={<Button color="inherit" size="small" onClick={() => navigate(destino(seleccionada.id, estadoPregunta(seleccionada)))}>Ver sección</Button>}>La pregunta seleccionada pertenece a otra sección.</Alert>}
                <Box sx={{ flex: 1, '& > section': { height: '100%', boxSizing: 'border-box' } }}>
                  <DetallePregunta pregunta={seleccionada} emprendedor={emprendedor} borrador={borradores[seleccionada.id] ?? ''} onBorrador={cambiarBorrador} onPublicar={handlePublicar} error={errorRespuesta} guardando={guardando} onPublicacion={abrirPublicacion} />
                </Box>
              </Box>
            ) : (
              <Paper elevation={0} sx={{ borderRadius: 2.5, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1.5, textAlign: 'center', minHeight: 260 }}>
                <Typography component="h2" sx={{ fontWeight: 700 }}><span>{id ? 'Pregunta no encontrada' : 'No hay preguntas para mostrar'}</span></Typography>
                <Typography variant="body2" color="text.secondary"><span>{id ? 'Esta pregunta no está disponible en tu historial.' : 'Puedes revisar las demás secciones del historial.'}</span></Typography>
                {id && <Button component={RouterLink} to={rutaBase} sx={{ textTransform: 'none' }}>Volver al historial</Button>}
              </Paper>
            )}
          </Box>
        )}
      </Container>
      <PublicacionDialog abierta={publicacionAbierta} publicacion={publicacionVista} onCerrar={() => setPublicacionAbierta(false)} />
      <Snackbar open={Boolean(aviso)} autoHideDuration={4500} onClose={() => setAviso('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setAviso('')}><span>{aviso}</span></Alert>
      </Snackbar>
    </Box>
  )
}

// Son dos pantallas de una misma demostración. La sesión real se conectará al backend.
export default function MisPreguntasPage() {
  return <PantallaPreguntas key="cliente" modo="cliente" />
}

export function PreguntasRecibidasPage() {
  return <PantallaPreguntas key="emprendedor" modo="emprendedor" />
}
