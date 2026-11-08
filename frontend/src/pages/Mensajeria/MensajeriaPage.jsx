import * as React from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import {
  Alert, Box, Button, Container, Divider, IconButton, List, ListItem,
  ListItemButton, Paper, Stack, TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import {
  MAXIMO_MENSAJE, cargarMensajeria, contarNoLeidos, enviarMensaje,
  estadoConversacion, formatearFechaMensaje, marcarConversacionLeida,
  ordenarConversaciones, suscribirMensajeria,
} from './mensajeria.js'

const AZUL = '#008FFF'

function FlechaVolver() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  )
}

function Bandeja({ conversaciones, seleccionadaId, visible }) {
  const ordenadas = ordenarConversaciones(conversaciones)
  return (
    <Paper component="nav" aria-label="Conversaciones" elevation={0} sx={{ display: visible ? 'flex' : 'none', flexDirection: 'column', borderRadius: 2.5, minHeight: 0, overflow: 'hidden' }}>
      <Typography component="h2" sx={{ fontSize: 18, fontWeight: 700, px: 2, pt: 2, pb: 1.5 }}>Conversaciones</Typography>
      <List disablePadding sx={{ px: 2, pb: 2, overflowY: 'auto', minHeight: 0 }}>
        {ordenadas.map((conversacion, indice) => {
          const ultimo = conversacion.mensajes.at(-1)
          const noLeidos = contarNoLeidos(conversacion)
          const seleccionada = seleccionadaId === conversacion.id
          return (
            <React.Fragment key={conversacion.id}>
              {indice > 0 && <Divider component="li" />}
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={`/mensajeria/${encodeURIComponent(conversacion.id)}`}
                  selected={seleccionada}
                  aria-current={seleccionada ? 'page' : undefined}
                  sx={{ display: 'block', px: 1.25, py: 1.25, borderRadius: 1.5, '&.Mui-selected': { bgcolor: '#E7F4FF' }, '&.Mui-selected:hover': { bgcolor: '#D9EDFE' } }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conversacion.contacto.nombre}</Typography>
                    {ultimo && <Typography component="time" dateTime={ultimo.fecha} variant="caption" color="text.secondary" sx={{ flexShrink: 0, fontSize: 11 }}><span>{formatearFechaMensaje(ultimo.fecha, 'bandeja')}</span></Typography>}
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                      <span>{ultimo ? `${ultimo.autor === 'yo' ? 'Tú: ' : ''}${ultimo.texto}` : 'Sin mensajes todavía'}</span>
                    </Typography>
                    {noLeidos > 0 && <Box component="span" aria-label={`${noLeidos} mensajes no leídos`} sx={{ display: 'grid', placeItems: 'center', minWidth: 20, height: 20, px: 0.5, borderRadius: '50%', bgcolor: AZUL, color: 'white', fontSize: 11, flexShrink: 0 }}><span>{noLeidos > 99 ? '99+' : noLeidos}</span></Box>}
                  </Stack>
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          )
        })}
      </List>
      {!ordenadas.length && <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>Todavía no tienes conversaciones.</Typography>}
    </Paper>
  )
}

function Hilo({ conversacion, movil, borrador, onBorrador, onEnviar, error, onCerrarError, enviando }) {
  const listaRef = React.useRef(null)
  const campoRef = React.useRef(null)
  const ultimoId = conversacion.mensajes.at(-1)?.id

  React.useEffect(() => {
    const lista = listaRef.current
    if (lista) lista.scrollTop = lista.scrollHeight
  }, [conversacion.id, ultimoId])

  const alEnviar = (event) => {
    onEnviar(event)
    campoRef.current?.focus()
  }

  return (
    <Paper component="section" aria-labelledby="titulo-conversacion" elevation={0} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2.5, p: 2, minHeight: 0, overflow: 'hidden' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pb: 1.5 }}>
        {movil && <IconButton component={RouterLink} to="/mensajeria" aria-label="Volver a las conversaciones" size="small"><FlechaVolver /></IconButton>}
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h2" id="titulo-conversacion" sx={{ fontWeight: 700, fontSize: 16, overflowWrap: 'anywhere' }}>{conversacion.contacto.nombre}</Typography>
          <Typography variant="caption" sx={{ color: AZUL, fontSize: 11 }}><span>{estadoConversacion(conversacion)}</span></Typography>
        </Box>
      </Stack>
      <Divider />

      <Box component="ol" role="log" aria-label={`Mensajes con ${conversacion.contacto.nombre}`} aria-live="polite" aria-relevant="additions" ref={listaRef} sx={{ listStyle: 'none', m: 0, py: 1.5, px: 0, flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {conversacion.mensajes.map((mensaje) => {
          const propio = mensaje.autor === 'yo'
          return (
            <Box component="li" key={mensaje.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: propio ? 'flex-end' : 'flex-start', flexShrink: 0 }}>
              <Box sx={{ maxWidth: '85%', bgcolor: propio ? AZUL : '#F0F1F3', color: propio ? 'white' : '#25252A', borderRadius: 3.5, px: 1.5, py: 1, overflowWrap: 'anywhere' }}>
                <Typography component="span" sx={{ position: 'absolute', width: 1, height: 1, p: 0, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap' }}>{propio ? 'Tú: ' : `${conversacion.contacto.nombre}: `}</Typography>
                <Typography component="p" sx={{ m: 0, fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{mensaje.texto}</Typography>
              </Box>
              <Typography component="time" dateTime={mensaje.fecha} title={formatearFechaMensaje(mensaje.fecha, 'completa')} sx={{ fontSize: 10, color: '#8D99AE', mt: 0.4 }}><span>{formatearFechaMensaje(mensaje.fecha)}</span></Typography>
            </Box>
          )
        })}
        {!conversacion.mensajes.length && <Box component="li" sx={{ my: 'auto', py: 3, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">Aquí aparecerán tus mensajes.</Typography></Box>}
      </Box>

      {error && <Alert severity="error" onClose={onCerrarError} sx={{ mb: 1 }}>{error}</Alert>}
      <Box component="form" aria-label="Escribir un mensaje" onSubmit={alEnviar} sx={{ pt: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
          <TextField
            inputRef={campoRef}
            fullWidth multiline minRows={1} maxRows={4} size="small"
            name="mensaje" placeholder="Escribe un mensaje…" value={borrador}
            onChange={(event) => onBorrador(event.target.value.slice(0, MAXIMO_MENSAJE))}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) alEnviar(event)
            }}
            slotProps={{ htmlInput: { 'aria-label': 'Mensaje', 'aria-describedby': 'ayuda-mensaje', maxLength: MAXIMO_MENSAJE } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D4D9E2' } }}
          />
          <Button type="submit" variant="contained" disableElevation disabled={!borrador.trim() || enviando} sx={{ bgcolor: AZUL, minHeight: 38, borderRadius: 1.5, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#0078D6' } }}><span>{enviando ? 'Enviando…' : 'Enviar'}</span></Button>
        </Stack>
        <Typography id="ayuda-mensaje" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: 10 }}>
          <span>{`Enter para enviar · Shift + Enter para otra línea · ${borrador.length}/${MAXIMO_MENSAJE}`}</span>
        </Typography>
      </Box>
    </Paper>
  )
}

export default function MensajeriaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const escritorio = useMediaQuery(theme.breakpoints.up('sm'))
  const [datos, setDatos] = React.useState(() => cargarMensajeria())
  const [borradores, setBorradores] = React.useState({})
  const [errorAccion, setErrorAccion] = React.useState('')
  const [enviando, setEnviando] = React.useState(false)
  const procesando = React.useRef(false)
  const [primeraId, setPrimeraId] = React.useState(null)

  React.useEffect(() => {
    const actualizar = () => setDatos(cargarMensajeria())
    const cancelar = suscribirMensajeria(actualizar)
    window.addEventListener('focus', actualizar)
    return () => {
      cancelar()
      window.removeEventListener('focus', actualizar)
    }
  }, [])

  React.useEffect(() => {
    if (!datos.error && datos.conversaciones.length && !primeraId) setPrimeraId(datos.conversaciones[0].id)
  }, [datos.conversaciones, datos.error, primeraId])

  // En escritorio se muestra un hilo inicial; en móvil se abre al tocar un contacto.
  const seleccionadaId = id || (escritorio ? primeraId : null)
  const seleccionada = datos.conversaciones.find((item) => item.id === seleccionadaId) ?? null
  const verHilo = escritorio || Boolean(id)
  const verBandeja = escritorio || !id

  React.useEffect(() => {
    setErrorAccion('')
  }, [seleccionadaId])

  React.useEffect(() => {
    if (!verHilo || !seleccionada || datos.error || contarNoLeidos(seleccionada) === 0) return
    try {
      setDatos(marcarConversacionLeida(seleccionada.id))
    } catch (error) {
      setErrorAccion(error.message)
    }
  }, [seleccionada, verHilo, datos.error])

  const cambiarBorrador = (texto) => {
    if (seleccionadaId) setBorradores((actuales) => ({ ...actuales, [seleccionadaId]: texto }))
  }

  const handleEnviar = (event) => {
    event.preventDefault()
    const texto = borradores[seleccionadaId] ?? ''
    if (!seleccionada || !texto.trim() || procesando.current) return
    procesando.current = true
    setEnviando(true)
    setErrorAccion('')
    try {
      setDatos(enviarMensaje(seleccionada.id, texto))
      setBorradores((actuales) => ({ ...actuales, [seleccionada.id]: '' }))
    } catch (error) {
      setErrorAccion(error.message)
    } finally {
      procesando.current = false
      setEnviando(false)
    }
  }

  return (
    <Box translate="no" className="notranslate" sx={{ bgcolor: '#3026A6', height: '100dvh', minHeight: 420, display: 'flex', flexDirection: 'column' }}>
      <TopNavBar showBack title="Mensajería" onBack={() => navigate('/catalogo')} />
      <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, pt: 1.5, pb: 2.5 }}>
        <Typography component="h1" sx={{ position: 'absolute', width: 1, height: 1, p: 0, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap' }}>Mensajería</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', mb: 1.5, fontSize: 11 }}>Vista de prueba · Estos contactos son ficticios y los mensajes se guardan en este navegador.</Typography>
        {datos.error ? (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setDatos(cargarMensajeria())}>Reintentar</Button>}>{datos.error}</Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(220px, 2fr) minmax(0, 3fr)', lg: 'minmax(270px, 3fr) minmax(0, 5fr)' }, gap: 2, flex: 1, minHeight: 0 }}>
            <Bandeja conversaciones={datos.conversaciones} seleccionadaId={seleccionadaId} visible={verBandeja} />
            {verHilo && (seleccionada ? (
              <Hilo key={seleccionada.id} conversacion={seleccionada} movil={!escritorio} borrador={borradores[seleccionada.id] ?? ''} onBorrador={cambiarBorrador} onEnviar={handleEnviar} error={errorAccion} onCerrarError={() => setErrorAccion('')} enviando={enviando} />
            ) : (
              <Paper elevation={0} sx={{ borderRadius: 2.5, p: 3, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, textAlign: 'center' }}>
                <Typography component="h2" sx={{ fontWeight: 700 }}><span>{id ? 'Conversación no encontrada' : 'Selecciona una conversación'}</span></Typography>
                <Typography variant="body2" color="text.secondary"><span>{id ? 'El enlace no corresponde a una conversación disponible.' : 'Elige un contacto de la bandeja para ver sus mensajes.'}</span></Typography>
                {id && <Button component={RouterLink} to="/mensajeria" variant="outlined" sx={{ textTransform: 'none' }}>Volver a la bandeja</Button>}
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  )
}
