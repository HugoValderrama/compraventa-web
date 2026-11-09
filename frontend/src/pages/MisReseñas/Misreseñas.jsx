import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import TopNavBar from '../../components/organisms/TopNavBar'
import {
  ETIQUETAS_ESTRELLAS,
  MAXIMO_COMENTARIO,
  cargarResenas,
  enviarResena,
  formatearFechaResena,
} from './Misreseñas.js'

const AZUL = '#008FFF'
const MORADO = '#3026A6'
const AMARILLO = '#FFC20E'

const estiloEstrellas = { color: AMARILLO, '& .MuiRating-iconEmpty': { color: '#C9CBD3' } }

/* ------------------------------------------------------------------ */
/* Tarjeta de una reseña ya escrita                                    */
/* ------------------------------------------------------------------ */

function TarjetaResena({ resena }) {
  return (
    <Paper component="article" elevation={0} sx={{ borderRadius: 2.5, p: 2.25 }}>
      <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16, mb: 0.75, overflowWrap: 'anywhere' }}>
        {resena.titulo}
      </Typography>
      <Rating
        value={resena.calificacion}
        readOnly
        size="small"
        aria-label={`Calificación: ${resena.calificacion} de 5 estrellas`}
        sx={{ ...estiloEstrellas, mb: 0.75 }}
      />
      {resena.comentario && (
        <Typography sx={{ fontSize: 14, mb: 1, overflowWrap: 'anywhere' }}>{resena.comentario}</Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        {formatearFechaResena(resena.fecha)}
      </Typography>
    </Paper>
  )
}

/* ------------------------------------------------------------------ */
/* Tarjeta de un producto pendiente (pestaña "Pendientes por calificar") */
/* ------------------------------------------------------------------ */

function TarjetaPendiente({ pendiente, seleccionada, onCalificar }) {
  return (
    <Paper
      component="article"
      elevation={0}
      sx={{
        borderRadius: 2.5,
        p: 2.25,
        outline: seleccionada ? `2px solid ${AZUL}` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16, overflowWrap: 'anywhere' }}>
          {pendiente.nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Aún sin calificar
        </Typography>
      </Box>
      <Button
        size="small"
        aria-label={`Calificar ${pendiente.nombre}`}
        aria-pressed={seleccionada}
        onClick={() => onCalificar(pendiente.id)}
        sx={{ textTransform: 'none', fontWeight: 700, color: AZUL, flexShrink: 0 }}
      >
        {seleccionada ? 'Calificando' : 'Calificar'}
      </Button>
    </Paper>
  )
}

/* ------------------------------------------------------------------ */
/* Panel "Calificar producto"                                          */
/* ------------------------------------------------------------------ */

function PanelCalificar({ pendiente, calificacion, comentario, error, enviando, onCalificacion, onComentario, onEnviar, onCancelar }) {
  return (
    <Paper component="section" aria-labelledby="calificar-titulo" elevation={0} sx={{ borderRadius: 3, p: 2.5 }}>
      <Typography component="h2" id="calificar-titulo" sx={{ color: MORADO, fontWeight: 800, fontSize: 18, mb: 1.5 }}>
        Calificar producto
      </Typography>

      {!pendiente ? (
        <Typography variant="body2" color="text.secondary">
          No tienes productos pendientes por calificar.
        </Typography>
      ) : (
        <Box component="form" onSubmit={onEnviar} noValidate>
          <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5, overflowWrap: 'anywhere' }}>
            {pendiente.nombre}
          </Typography>

          <Stack sx={{ alignItems: 'center', mb: 0.5 }}>
            <Rating
              name="calificacion"
              value={calificacion}
              onChange={(_, valor) => onCalificacion(valor ?? 0)}
              aria-label="Calificación del producto"
              getLabelText={(valor) => `${valor} ${valor === 1 ? 'estrella' : 'estrellas'}`}
              sx={{ ...estiloEstrellas, fontSize: 34 }}
            />
          </Stack>

          <Typography
            variant="caption"
            aria-hidden="true"
            sx={{ display: 'block', textAlign: 'center', fontSize: 10, color: 'text.secondary', mb: 1.5 }}
          >
            {ETIQUETAS_ESTRELLAS.map((etiqueta, indice) => (
              <Fragment key={etiqueta}>
                {indice > 0 && ' — '}
                <Box
                  component="span"
                  sx={{
                    fontWeight: calificacion === indice + 1 ? 800 : 400,
                    color: calificacion === indice + 1 ? MORADO : 'inherit',
                  }}
                >
                  {etiqueta}
                </Box>
              </Fragment>
            ))}
          </Typography>

          <Box sx={{ position: 'relative', mb: 1.5 }}>
            <TextField
              multiline
              minRows={3}
              fullWidth
              size="small"
              value={comentario}
              onChange={(event) => onComentario(event.target.value)}
              placeholder={`Escribe tu comentario... (máx. ${MAXIMO_COMENTARIO} caracteres)`}
              slotProps={{
                htmlInput: { maxLength: MAXIMO_COMENTARIO, 'aria-label': 'Comentario' },
              }}
              sx={{ '& .MuiInputBase-root': { pb: 3, fontSize: 13 } }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              aria-live="polite"
              sx={{ position: 'absolute', right: 10, bottom: 6, fontSize: 10 }}
            >
              {comentario.length}/{MAXIMO_COMENTARIO}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disableElevation
            disabled={enviando}
            sx={{ bgcolor: AZUL, textTransform: 'none', fontWeight: 700, borderRadius: 1.5, py: 1 }}
          >
            {enviando ? 'Enviando…' : 'Enviar reseña'}
          </Button>

          <Stack sx={{ alignItems: 'center', mt: 1.5 }}>
            <Button
              type="button"
              size="small"
              onClick={onCancelar}
              disabled={enviando}
              sx={{ textTransform: 'none', color: 'text.secondary', textDecoration: 'underline', fontWeight: 700 }}
            >
              Cancelar
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  )
}

/* ------------------------------------------------------------------ */
/* Pantalla                                                            */
/* ------------------------------------------------------------------ */

export default function MisResenas() {
  const navigate = useNavigate()

  const [resenas, setResenas] = useState([])
  const [pendientes, setPendientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [intento, setIntento] = useState(0)

  const [pestana, setPestana] = useState('resenas') // 'resenas' | 'pendientes'
  const [seleccionadaId, setSeleccionadaId] = useState(null)
  const [calificacion, setCalificacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    let activo = true

    cargarResenas()
      .then((datos) => {
        if (!activo) return
        setResenas(datos.resenas)
        setPendientes(datos.pendientes)
      })
      .catch(() => {
        if (activo) setErrorCarga('No se pudieron cargar tus reseñas.')
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
    setErrorCarga('')
    setIntento((n) => n + 1)
  }

  // El producto que se está calificando: el elegido o, si no hay, el primero pendiente.
  const actual = pendientes.find((p) => p.id === seleccionadaId) ?? pendientes[0] ?? null

  const limpiarFormulario = () => {
    setCalificacion(0)
    setComentario('')
    setError('')
  }

  const elegir = (id) => {
    setSeleccionadaId(id)
    limpiarFormulario()
    setMensaje('')
  }

  const enviar = async (event) => {
    event.preventDefault()
    if (!actual) return

    setEnviando(true)
    setError('')

    try {
      const nueva = await enviarResena(actual.id, { calificacion, comentario })
      setResenas((previas) => [nueva, ...previas])
      setPendientes((previos) => previos.filter((p) => p.id !== actual.id))
      setSeleccionadaId(null)
      limpiarFormulario()
      setPestana('resenas')
      setMensaje(`¡Gracias! Publicamos tu reseña de "${nueva.titulo}".`)
    } catch (err) {
      setError(err.message || 'No se pudo enviar la reseña.')
    } finally {
      setEnviando(false)
    }
  }

  const botonPestana = (valor, etiqueta) => {
    const activa = pestana === valor
    return (
      <Button
        key={valor}
        aria-pressed={activa}
        onClick={() => setPestana(valor)}
        sx={{
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 999,
          px: 2.5,
          bgcolor: activa ? 'white' : 'transparent',
          color: activa ? '#25252A' : 'white',
          border: '1.5px solid white',
          '&:hover': { bgcolor: activa ? '#F0F1F3' : 'rgba(255,255,255,0.12)' },
        }}
      >
        {etiqueta}
      </Button>
    )
  }

  return (
    <Box translate="no" className="notranslate" sx={{ bgcolor: MORADO, minHeight: '100dvh' }}>
      <TopNavBar title="Mis Reseñas" />

      <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
          

          <Stack direction="row" role="group" aria-label="Secciones de reseñas" sx={{ gap: 1.5, flexWrap: 'wrap' }}>
            {botonPestana('resenas', 'Mis reseñas')}
            {botonPestana('pendientes', 'Pendientes por calificar')}
          </Stack>
        </Stack>

        {cargando && (
          <Stack sx={{ alignItems: 'center', py: 6 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Stack>
        )}

        {!cargando && errorCarga && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={reintentar}>
                Reintentar
              </Button>
            }
          >
            {errorCarga}
          </Alert>
        )}

        {!cargando && !errorCarga && (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'flex-start' }}>
            <Stack spacing={2} sx={{ flex: 3, width: '100%', minWidth: 0 }}>
              {mensaje && (
                <Alert severity="success" onClose={() => setMensaje('')}>
                  {mensaje}
                </Alert>
              )}

              {pestana === 'resenas' &&
                (resenas.length === 0 ? (
                  <Paper elevation={0} sx={{ borderRadius: 2.5, p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">Aún no has escrito reseñas.</Typography>
                  </Paper>
                ) : (
                  resenas.map((resena) => <TarjetaResena key={resena.id} resena={resena} />)
                ))}

              {pestana === 'pendientes' &&
                (pendientes.length === 0 ? (
                  <Paper elevation={0} sx={{ borderRadius: 2.5, p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No tienes productos pendientes por calificar.</Typography>
                  </Paper>
                ) : (
                  pendientes.map((pendiente) => (
                    <TarjetaPendiente
                      key={pendiente.id}
                      pendiente={pendiente}
                      seleccionada={actual?.id === pendiente.id}
                      onCalificar={elegir}
                    />
                  ))
                ))}
            </Stack>

            <Box sx={{ flex: 2, width: '100%', minWidth: 0, maxWidth: { md: 400 } }}>
              <PanelCalificar
                pendiente={actual}
                calificacion={calificacion}
                comentario={comentario}
                error={error}
                enviando={enviando}
                onCalificacion={setCalificacion}
                onComentario={setComentario}
                onEnviar={enviar}
                onCancelar={limpiarFormulario}
              />
            </Box>
          </Stack>
        )}
      </Container>
    </Box>
  )
}