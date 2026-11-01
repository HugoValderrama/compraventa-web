import * as React from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import {
  MAXIMO_COMENTARIO,
  ORDENES,
  actualizarCalificacion,
  cargarCalificaciones,
  crearCalificacion,
  eliminarCalificacion,
  formatearFecha,
  formatearPromedio,
  ordenarCalificaciones,
  resumirCalificaciones,
  suscribirCalificaciones,
} from './calificaciones.js'

const AZUL = '#008FFF'
const POR_PAGINA = 3
const TIENDA = 'Taller Tierra'

const FORM_VACIO = {
  cliente: '',
  producto: '',
  pedido: '',
  puntaje: 5,
  comentario: '',
  verificada: true,
}

const blanco = {
  position: 'absolute',
  width: 1,
  height: 1,
  p: 0,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
}

/* ------------------------------------------------------------------ */
/* Resumen (tarjeta izquierda)                                         */
/* ------------------------------------------------------------------ */

function Resumen({ resumen }) {
  const { total, promedio, conteos } = resumen

  return (
    <Paper component="aside" aria-label="Resumen de calificaciones" elevation={0} sx={{ borderRadius: 2.5, p: 2.5 }}>
      <Typography component="h2" sx={{ fontSize: 18, fontWeight: 700, mb: 2 }}>
        {TIENDA}
      </Typography>

      <Typography sx={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>
        {total ? formatearPromedio(promedio) : '—'}
        <Box component="span" sx={{ fontSize: 34 }}> / 5</Box>
      </Typography>

      <Rating
        value={promedio}
        precision={0.1}
        readOnly
        size="large"
        sx={{ my: 1.5 }}
        aria-label={`Promedio ${formatearPromedio(promedio)} de 5`}
      />

      <Typography variant="body2" color="text.secondary">
        {total} {total === 1 ? 'calificación recibida' : 'calificaciones recibidas'}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1}>
        {[5, 4, 3, 2, 1].map((n) => (
          <Stack key={n} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ width: 28 }}>{n} ★</Typography>
            <LinearProgress
              variant="determinate"
              value={total ? (conteos[n] / total) * 100 : 0}
              aria-label={`${conteos[n]} calificaciones de ${n} estrellas`}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: '#EEF0F6',
                '& .MuiLinearProgress-bar': { bgcolor: AZUL, borderRadius: 3 },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ width: 22, textAlign: 'right' }}>
              {conteos[n]}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body2">
        Las opiniones provienen de clientes con compras verificadas.
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Promedio de toda tu tienda: productos y servicios.
      </Typography>
    </Paper>
  )
}

/* ------------------------------------------------------------------ */
/* Una opinión (READ + botones de UPDATE / DELETE)                     */
/* ------------------------------------------------------------------ */

function Opinion({ item, onEditar, onEliminar }) {
  const detalle = [
    item.producto,
    item.pedido && `Pedido #${item.pedido}`,
    item.verificada && 'Compra verificada',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Box component="li" sx={{ listStyle: 'none', py: 1.75, borderTop: '1px solid #E6E8EF' }}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, overflowWrap: 'anywhere' }}>
          {item.cliente}
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <Rating value={item.puntaje} readOnly size="small" aria-label={`${item.puntaje} de 5 estrellas`} />
          <Typography component="time" dateTime={item.fecha} variant="caption" color="text.secondary">
            {formatearFecha(item.fecha)}
          </Typography>
        </Stack>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>
        {detalle}
        {item.editadaEn && ' · editada'}
      </Typography>

      <Typography sx={{ fontSize: 13, mt: 0.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {item.comentario}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
        <Button size="small" sx={{ textTransform: 'none', minWidth: 0 }} onClick={() => onEditar(item)}>
          Editar
          <Box component="span" sx={blanco}>{` opinión de ${item.cliente}`}</Box>
        </Button>
        <Button size="small" color="error" sx={{ textTransform: 'none', minWidth: 0 }} onClick={() => onEliminar(item)}>
          Eliminar
          <Box component="span" sx={blanco}>{` opinión de ${item.cliente}`}</Box>
        </Button>
      </Stack>
    </Box>
  )
}

/* ------------------------------------------------------------------ */
/* Formulario (CREATE y UPDATE comparten el mismo)                     */
/* ------------------------------------------------------------------ */

function FormularioOpinion({ abierto, inicial, titulo, textoBoton, onCerrar, onGuardar }) {
  const [form, setForm] = React.useState(inicial)
  const [error, setError] = React.useState('')
  const [guardando, setGuardando] = React.useState(false)

  const cambiar = (campo) => (event) =>
    setForm((actual) => ({ ...actual, [campo]: event.target.value }))

  const enviar = (event) => {
    event.preventDefault()
    if (guardando) return

    setGuardando(true)
    try {
      onGuardar(form)
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} fullWidth maxWidth="sm" aria-labelledby="titulo-form-opinion">
      <Box component="form" noValidate onSubmit={enviar}>
        <DialogTitle id="titulo-form-opinion">{titulo}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Nombre del cliente"
              value={form.cliente}
              onChange={cambiar('cliente')}
              disabled={guardando}
              slotProps={{ htmlInput: { maxLength: 60 } }}
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Producto o servicio"
                value={form.producto}
                onChange={cambiar('producto')}
                disabled={guardando}
                slotProps={{ htmlInput: { maxLength: 80 } }}
                fullWidth
              />
              <TextField
                label="N.º de pedido (opcional)"
                value={form.pedido}
                onChange={cambiar('pedido')}
                disabled={guardando}
                slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 10 } }}
                fullWidth
              />
            </Stack>

            <Box>
              <Typography component="legend" variant="body2" sx={{ mb: 0.5 }}>
                Puntaje
              </Typography>
              <Rating
                name="puntaje"
                value={form.puntaje}
                disabled={guardando}
                onChange={(_, valor) => {
                  if (valor) setForm((actual) => ({ ...actual, puntaje: valor }))
                }}
              />
            </Box>

            <TextField
              label="Comentario"
              multiline
              minRows={3}
              value={form.comentario}
              onChange={(event) =>
                setForm((actual) => ({
                  ...actual,
                  comentario: event.target.value.slice(0, MAXIMO_COMENTARIO),
                }))
              }
              disabled={guardando}
              helperText={`${form.comentario.length}/${MAXIMO_COMENTARIO}`}
              fullWidth
            />

            <FormControlLabel
              label="Compra verificada"
              control={
                <Checkbox
                  checked={form.verificada}
                  disabled={guardando}
                  onChange={(event) =>
                    setForm((actual) => ({ ...actual, verificada: event.target.checked }))
                  }
                />
              }
            />

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando} sx={{ bgcolor: AZUL }}>
            {guardando ? 'Guardando…' : textoBoton}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function CalificacionesPage() {
  const navigate = useNavigate()
  const [datos, setDatos] = React.useState(() => cargarCalificaciones())
  const [orden, setOrden] = React.useState('recientes')
  const [pagina, setPagina] = React.useState(0)
  const [dialogo, setDialogo] = React.useState(null) // { modo: 'crear' } | { modo: 'editar', item }
  const [porEliminar, setPorEliminar] = React.useState(null)
  const [mensaje, setMensaje] = React.useState('')
  const [errorAccion, setErrorAccion] = React.useState('')

  React.useEffect(() => {
    const actualizar = () => setDatos(cargarCalificaciones())
    const cancelar = suscribirCalificaciones(actualizar)
    window.addEventListener('focus', actualizar)

    return () => {
      cancelar()
      window.removeEventListener('focus', actualizar)
    }
  }, [])

  const resumen = React.useMemo(
    () => resumirCalificaciones(datos.calificaciones),
    [datos.calificaciones]
  )

  const ordenadas = React.useMemo(
    () => ordenarCalificaciones(datos.calificaciones, orden),
    [datos.calificaciones, orden]
  )

  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas - 1)
  const inicio = paginaActual * POR_PAGINA
  const visibles = ordenadas.slice(inicio, inicio + POR_PAGINA)

  // CREATE y UPDATE: si algo falla lanzan un Error y el formulario lo muestra.
  const guardarFormulario = (form) => {
    if (dialogo.modo === 'crear') {
      setDatos(crearCalificacion(form))
      setOrden('recientes')
      setPagina(0)
      setMensaje('Opinión agregada correctamente.')
    } else {
      setDatos(actualizarCalificacion(dialogo.item.id, form))
      setMensaje('Opinión actualizada.')
    }

    setErrorAccion('')
    setDialogo(null)
  }

  // DELETE
  const confirmarEliminar = () => {
    try {
      setDatos(eliminarCalificacion(porEliminar.id))
      setMensaje('Opinión eliminada.')
      setErrorAccion('')
    } catch (err) {
      setErrorAccion(err.message)
    }

    setPorEliminar(null)
  }

  const formularioInicial =
    dialogo?.modo === 'editar'
      ? {
          cliente: dialogo.item.cliente,
          producto: dialogo.item.producto,
          pedido: dialogo.item.pedido ?? '',
          puntaje: dialogo.item.puntaje,
          comentario: dialogo.item.comentario,
          verificada: Boolean(dialogo.item.verificada),
        }
      : FORM_VACIO

  return (
    <Box translate="no" className="notranslate" sx={{ bgcolor: '#3026A6', minHeight: '100dvh' }}>
      <TopNavBar showBack title="Mis calificaciones" onBack={() => navigate('/perfilE')} />

      <Container maxWidth="lg" sx={{ pt: 1.5, pb: 4 }}>
        <Breadcrumbs
          aria-label="Ruta de navegación"
          separator="/"
          sx={{ color: 'white', fontSize: 11, mb: 0.5, '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.7)' } }}
        >
          <Typography component={RouterLink} to="/perfilE" sx={{ color: 'white', fontSize: 11 }}>
            Mi perfil
          </Typography>
          <Typography sx={{ color: 'white', fontSize: 11 }}>{TIENDA}</Typography>
          <Typography sx={{ color: 'white', fontSize: 11 }}>Emprendedor</Typography>
        </Breadcrumbs>

        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography component="h1" sx={{ color: 'white', fontSize: 28, fontWeight: 800 }}>
            Mis Calificaciones
          </Typography>
          <Chip
            label="Opiniones recibidas"
            size="small"
            sx={{ bgcolor: '#E7F4FF', color: AZUL, fontWeight: 600 }}
          />
        </Stack>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', mb: 1.5 }}>
          Vista de prueba · Las opiniones se guardan en este navegador.
        </Typography>

        {datos.error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => setDatos(cargarCalificaciones())}>
                Reintentar
              </Button>
            }
          >
            {datos.error}
          </Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(260px, 1fr) minmax(0, 2.2fr)' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <Resumen resumen={resumen} />

            <Paper component="section" aria-labelledby="titulo-opiniones" elevation={0} sx={{ borderRadius: 2.5, p: 2.5 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 1.5 }}
              >
                <Typography component="h2" id="titulo-opiniones" sx={{ fontSize: 18, fontWeight: 700 }}>
                  Opiniones de tus clientes
                </Typography>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <TextField
                    select
                    size="small"
                    value={orden}
                    onChange={(event) => {
                      setOrden(event.target.value)
                      setPagina(0)
                    }}
                    slotProps={{ htmlInput: { 'aria-label': 'Ordenar opiniones' } }}
                    sx={{ minWidth: 150 }}
                  >
                    {Object.entries(ORDENES).map(([clave, etiqueta]) => (
                      <MenuItem key={clave} value={clave}>{etiqueta}</MenuItem>
                    ))}
                  </TextField>

                  <Button
                    variant="contained"
                    disableElevation
                    onClick={() => setDialogo({ modo: 'crear' })}
                    sx={{ bgcolor: AZUL, textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    Agregar opinión
                  </Button>
                </Stack>
              </Stack>

              {mensaje && (
                <Alert severity="success" onClose={() => setMensaje('')} sx={{ mb: 1.5 }}>
                  {mensaje}
                </Alert>
              )}
              {errorAccion && (
                <Alert severity="error" onClose={() => setErrorAccion('')} sx={{ mb: 1.5 }}>
                  {errorAccion}
                </Alert>
              )}

              <Box component="ul" sx={{ m: 0, p: 0 }}>
                {visibles.map((item) => (
                  <Opinion
                    key={item.id}
                    item={item}
                    onEditar={(actual) => setDialogo({ modo: 'editar', item: actual })}
                    onEliminar={setPorEliminar}
                  />
                ))}
              </Box>

              {!ordenadas.length && (
                <Alert severity="info">Aún no tienes opiniones. Agrega la primera con “Agregar opinión”.</Alert>
              )}

              {ordenadas.length > 0 && (
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid #E6E8EF' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {inicio + 1}–{inicio + visibles.length} de {ordenadas.length} opiniones
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={paginaActual === 0}
                      onClick={() => setPagina(paginaActual - 1)}
                      sx={{ textTransform: 'none' }}
                    >
                      ‹ Anterior
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={paginaActual >= totalPaginas - 1}
                      onClick={() => setPagina(paginaActual + 1)}
                      sx={{ textTransform: 'none' }}
                    >
                      Siguiente ›
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Paper>
          </Box>
        )}
      </Container>

      {dialogo && (
        <FormularioOpinion
          key={dialogo.item?.id ?? 'nueva'}
          abierto
          titulo={dialogo.modo === 'crear' ? 'Agregar opinión' : 'Editar opinión'}
          textoBoton={dialogo.modo === 'crear' ? 'Agregar opinión' : 'Guardar cambios'}
          inicial={formularioInicial}
          onCerrar={() => setDialogo(null)}
          onGuardar={guardarFormulario}
        />
      )}

      <Dialog open={Boolean(porEliminar)} onClose={() => setPorEliminar(null)} aria-labelledby="titulo-eliminar">
        <DialogTitle id="titulo-eliminar">
          ¿Eliminar la opinión de {porEliminar?.cliente}?
        </DialogTitle>
        <DialogContent>
          <Typography>Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPorEliminar(null)}>Volver</Button>
          <Button color="error" variant="contained" onClick={confirmarEliminar}>
            Eliminar opinión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}