import * as React from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import {
  CATEGORIAS,
  ESTADOS,
  MAXIMO_MOTIVO,
  TIPOS,
  actualizarPublicacion,
  cambiarEstadoPublicacion,
  cargarPublicaciones,
  contarPorEstado,
  crearPublicacion,
  eliminarPublicacion,
  filtrarPublicaciones,
  formatearPrecio,
  suscribirPublicaciones,
} from './gestionPublicaciones.js'

const AZUL = '#008FFF'
const POR_PAGINA = 5

const COLORES_ESTADO = {
  'En revisión': { bgcolor: '#FFF1D6', color: '#8A5300' },
  Activa: { bgcolor: '#E3F6EA', color: '#1E7B43' },
  Pausada: { bgcolor: '#ECEDF0', color: '#55596A' },
  Rechazada: { bgcolor: '#FDE4E4', color: '#B42318' },
}

const FORM_VACIO = {
  titulo: '',
  emprendedor: '',
  tipo: 'Producto',
  categoria: CATEGORIAS[0],
  precio: '',
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
/* Fila de la tabla                                                    */
/* ------------------------------------------------------------------ */

function Fila({ item, onRevisar, onMotivo, onEditar, onEstado, onEliminar }) {
  // Las mismas acciones que muestra la imagen, según el estado.
  const acciones = {
    'En revisión': [['Revisar', () => onRevisar(item)]],
    Activa: [
      ['Editar', () => onEditar(item)],
      ['Pausar', () => onEstado(item, 'Pausada')],
    ],
    Pausada: [
      ['Editar', () => onEditar(item)],
      ['Activar', () => onEstado(item, 'Activa')],
    ],
    Rechazada: [['Ver motivo', () => onMotivo(item)]],
  }[item.estado]

  return (
    <TableRow hover>
      <TableCell>
        <Typography sx={{ fontWeight: 700, fontSize: 14, overflowWrap: 'anywhere' }}>
          {item.titulo}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.id} · {item.emprendedor}
        </Typography>
      </TableCell>

      <TableCell sx={{ fontSize: 13 }}>{item.tipo}</TableCell>

      <TableCell sx={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
        {formatearPrecio(item.precio)}
      </TableCell>

      <TableCell>
        <Chip
          label={item.estado}
          size="small"
          sx={{ ...COLORES_ESTADO[item.estado], fontWeight: 600, fontSize: 11 }}
        />
      </TableCell>

      <TableCell>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {acciones.map(([etiqueta, accion], indice) => (
            <React.Fragment key={etiqueta}>
              {indice > 0 && <Box component="span" aria-hidden="true" sx={{ color: 'text.secondary' }}>·</Box>}
              <Button size="small" onClick={accion} sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, color: AZUL }}>
                {etiqueta}
                <Box component="span" sx={blanco}>{` ${item.titulo}`}</Box>
              </Button>
            </React.Fragment>
          ))}
          <Box component="span" aria-hidden="true" sx={{ color: 'text.secondary' }}>·</Box>
          <Button size="small" color="error" onClick={() => onEliminar(item)} sx={{ textTransform: 'none', minWidth: 0 }}>
            Eliminar
            <Box component="span" sx={blanco}>{` ${item.titulo}`}</Box>
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  )
}

/* ------------------------------------------------------------------ */
/* Formulario (CREATE y UPDATE)                                        */
/* ------------------------------------------------------------------ */

function FormularioPublicacion({ inicial, titulo, textoBoton, onCerrar, onGuardar }) {
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
    <Dialog open onClose={guardando ? undefined : onCerrar} fullWidth maxWidth="sm" aria-labelledby="titulo-form-pub">
      <Box component="form" noValidate onSubmit={enviar}>
        <DialogTitle id="titulo-form-pub">{titulo}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Título"
              value={form.titulo}
              onChange={cambiar('titulo')}
              disabled={guardando}
              slotProps={{ htmlInput: { maxLength: 80 } }}
              fullWidth
            />
            <TextField
              label="Emprendedor"
              value={form.emprendedor}
              onChange={cambiar('emprendedor')}
              disabled={guardando}
              slotProps={{ htmlInput: { maxLength: 60 } }}
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="Tipo" value={form.tipo} onChange={cambiar('tipo')} disabled={guardando} fullWidth>
                {TIPOS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField select label="Categoría" value={form.categoria} onChange={cambiar('categoria')} disabled={guardando} fullWidth>
                {CATEGORIAS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Stack>

            <TextField
              label="Precio (CLP)"
              type="number"
              value={form.precio}
              onChange={cambiar('precio')}
              disabled={guardando}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
              fullWidth
            />

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" onClick={onCerrar} disabled={guardando}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={guardando} sx={{ bgcolor: AZUL }}>
            {guardando ? 'Guardando…' : textoBoton}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Revisar: aprobar o rechazar (con motivo)                            */
/* ------------------------------------------------------------------ */

function RevisarPublicacion({ item, onCerrar, onAprobar, onRechazar }) {
  const [rechazando, setRechazando] = React.useState(false)
  const [motivo, setMotivo] = React.useState('')
  const [error, setError] = React.useState('')

  const intentar = (accion) => {
    try {
      accion()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="sm" aria-labelledby="titulo-revisar">
      <DialogTitle id="titulo-revisar">Revisar publicación</DialogTitle>

      <DialogContent>
        <Stack spacing={1} sx={{ pt: 0.5 }}>
          <Typography sx={{ fontWeight: 700 }}>{item.titulo}</Typography>
          <Typography variant="body2" color="text.secondary">
            {item.id} · {item.emprendedor}
          </Typography>
          <Typography variant="body2">
            {item.tipo} · {item.categoria} · {formatearPrecio(item.precio)}
          </Typography>

          {rechazando && (
            <TextField
              autoFocus
              label="Motivo del rechazo"
              multiline
              minRows={3}
              value={motivo}
              onChange={(event) => setMotivo(event.target.value.slice(0, MAXIMO_MOTIVO))}
              helperText={`${motivo.length}/${MAXIMO_MOTIVO} · El emprendedor verá este motivo.`}
              sx={{ mt: 1 }}
            />
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCerrar}>Cerrar</Button>

        {rechazando ? (
          <Button color="error" variant="contained" onClick={() => intentar(() => onRechazar(motivo))}>
            Confirmar rechazo
          </Button>
        ) : (
          <>
            <Button color="error" variant="outlined" onClick={() => setRechazando(true)}>
              Rechazar
            </Button>
            <Button variant="contained" sx={{ bgcolor: AZUL }} onClick={() => intentar(onAprobar)}>
              Aprobar publicación
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function GestionPublicacionesPage() {
  const navigate = useNavigate()
  const [datos, setDatos] = React.useState(() => cargarPublicaciones())
  const [estado, setEstado] = React.useState('Todas')
  const [busqueda, setBusqueda] = React.useState('')
  const [tipo, setTipo] = React.useState('Todos')
  const [categoria, setCategoria] = React.useState('Todas')
  const [pagina, setPagina] = React.useState(0)
  const [dialogo, setDialogo] = React.useState(null) // { modo: 'crear' | 'editar' | 'revisar' | 'motivo', item }
  const [porEliminar, setPorEliminar] = React.useState(null)
  const [mensaje, setMensaje] = React.useState('')
  const [errorAccion, setErrorAccion] = React.useState('')

  React.useEffect(() => {
    const actualizar = () => setDatos(cargarPublicaciones())
    const cancelar = suscribirPublicaciones(actualizar)
    window.addEventListener('focus', actualizar)

    return () => {
      cancelar()
      window.removeEventListener('focus', actualizar)
    }
  }, [])

  const conteos = React.useMemo(() => contarPorEstado(datos.publicaciones), [datos.publicaciones])

  const filtradas = React.useMemo(
    () => filtrarPublicaciones(datos.publicaciones, { estado, busqueda, tipo, categoria }),
    [datos.publicaciones, estado, busqueda, tipo, categoria]
  )

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas - 1)
  const inicio = paginaActual * POR_PAGINA
  const visibles = filtradas.slice(inicio, inicio + POR_PAGINA)

  const filtrar = (setter) => (valor) => {
    setter(valor)
    setPagina(0)
  }

  // Cambios de estado directos (Pausar / Activar).
  const cambiarEstado = (item, nuevo) => {
    try {
      setDatos(cambiarEstadoPublicacion(item.id, nuevo))
      setMensaje(`“${item.titulo}” ahora está ${nuevo.toLowerCase()}.`)
      setErrorAccion('')
    } catch (err) {
      setErrorAccion(err.message)
    }
  }

  // CREATE y UPDATE: si algo falla lanzan un Error y el formulario lo muestra.
  const guardarFormulario = (form) => {
    if (dialogo.modo === 'crear') {
      setDatos(crearPublicacion(form))
      setEstado('Todas')
      setBusqueda('')
      setTipo('Todos')
      setCategoria('Todas')
      setPagina(0)
      setMensaje('Publicación creada. Quedó en revisión.')
    } else {
      setDatos(actualizarPublicacion(dialogo.item.id, form))
      setMensaje('Publicación actualizada.')
    }

    setErrorAccion('')
    setDialogo(null)
  }

  const aprobar = () => {
    setDatos(cambiarEstadoPublicacion(dialogo.item.id, 'Activa'))
    setMensaje(`“${dialogo.item.titulo}” fue aprobada y ya está activa.`)
    setErrorAccion('')
    setDialogo(null)
  }

  const rechazar = (motivo) => {
    setDatos(cambiarEstadoPublicacion(dialogo.item.id, 'Rechazada', motivo))
    setMensaje(`“${dialogo.item.titulo}” fue rechazada.`)
    setErrorAccion('')
    setDialogo(null)
  }

  // DELETE
  const confirmarEliminar = () => {
    try {
      setDatos(eliminarPublicacion(porEliminar.id))
      setMensaje('Publicación eliminada.')
      setErrorAccion('')
    } catch (err) {
      setErrorAccion(err.message)
    }

    setPorEliminar(null)
  }

  const formularioInicial =
    dialogo?.modo === 'editar'
      ? {
          titulo: dialogo.item.titulo,
          emprendedor: dialogo.item.emprendedor,
          tipo: dialogo.item.tipo,
          categoria: dialogo.item.categoria,
          precio: String(dialogo.item.precio),
        }
      : FORM_VACIO

  const pestanas = ['Todas', ...ESTADOS]

  return (
    <Box translate="no" className="notranslate" sx={{ bgcolor: '#3026A6', minHeight: '100dvh' }}>
      <TopNavBar showBack title="Gestión de publicaciones" onBack={() => navigate('/perfilE')} />

      <Container maxWidth="lg" sx={{ pt: 1.5, pb: 4 }}>
        <Breadcrumbs
          aria-label="Ruta de navegación"
          separator="/"
          sx={{ color: 'white', mb: 0.5, '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.7)' } }}
        >
          <Typography component={RouterLink} to="/perfilE" sx={{ color: 'white', fontSize: 11 }}>
            Mi perfil
          </Typography>
          <Typography sx={{ color: 'white', fontSize: 11 }}>Administración</Typography>
          <Typography sx={{ color: 'white', fontSize: 11 }}>Todo el marketplace</Typography>
        </Breadcrumbs>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
        >
          <Typography component="h1" sx={{ color: 'white', fontSize: 28, fontWeight: 800 }}>
            Gestión de Productos/Servicios
          </Typography>

          <Button
            variant="contained"
            disableElevation
            disabled={Boolean(datos.error)}
            onClick={() => setDialogo({ modo: 'crear' })}
            sx={{ bgcolor: AZUL, textTransform: 'none', fontWeight: 700 }}
          >
            Nueva publicación
          </Button>
        </Stack>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', mb: 1.5 }}>
          Vista de prueba · Las publicaciones se guardan en este navegador.
        </Typography>

        {datos.error ? (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={() => setDatos(cargarPublicaciones())}>Reintentar</Button>}
          >
            {datos.error}
          </Alert>
        ) : (
          <>
            <Stack direction="row" role="group" aria-label="Filtrar por estado" sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {pestanas.map((nombre) => {
                const activa = estado === nombre
                return (
                  <Button
                    key={nombre}
                    size="small"
                    aria-pressed={activa}
                    onClick={() => filtrar(setEstado)(nombre)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      px: 1.75,
                      bgcolor: activa ? AZUL : 'white',
                      color: activa ? 'white' : '#25252A',
                      '&:hover': { bgcolor: activa ? '#0078D6' : '#F0F1F3' },
                    }}
                  >
                    {nombre} ({conteos[nombre]})
                  </Button>
                )
              })}
            </Stack>

            <Paper elevation={0} sx={{ borderRadius: 2.5, p: 2.5 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="Buscar publicación"
                  placeholder="Título, ID o emprendedor"
                  size="small"
                  value={busqueda}
                  onChange={(event) => filtrar(setBusqueda)(event.target.value)}
                  sx={{ flex: 2 }}
                />
                <TextField
                  select
                  label="Tipo"
                  size="small"
                  value={tipo}
                  onChange={(event) => filtrar(setTipo)(event.target.value)}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="Todos">Productos y servicios</MenuItem>
                  <MenuItem value="Producto">Productos</MenuItem>
                  <MenuItem value="Servicio">Servicios</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Categoría"
                  size="small"
                  value={categoria}
                  onChange={(event) => filtrar(setCategoria)(event.target.value)}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="Todas">Todas</MenuItem>
                  {CATEGORIAS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
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

              <TableContainer>
                <Table size="small" aria-label="Publicaciones del marketplace">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F3F4F8' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Publicación / Emprendedor</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Precio</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibles.map((item) => (
                      <Fila
                        key={item.id}
                        item={item}
                        onRevisar={(p) => setDialogo({ modo: 'revisar', item: p })}
                        onMotivo={(p) => setDialogo({ modo: 'motivo', item: p })}
                        onEditar={(p) => setDialogo({ modo: 'editar', item: p })}
                        onEstado={cambiarEstado}
                        onEliminar={setPorEliminar}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {!filtradas.length && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {datos.publicaciones.length
                    ? 'No hay publicaciones que coincidan con los filtros.'
                    : 'Aún no hay publicaciones. Crea la primera con “Nueva publicación”.'}
                </Alert>
              )}

              {filtradas.length > 0 && (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, pt: 2 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Mostrando {inicio + 1}–{inicio + visibles.length} de {filtradas.length} publicaciones
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Button
                      size="small"
                      disabled={paginaActual === 0}
                      onClick={() => setPagina(paginaActual - 1)}
                      sx={{ textTransform: 'none' }}
                    >
                      ‹ Anterior
                    </Button>
                    <Chip
                      label={`${paginaActual + 1} de ${totalPaginas}`}
                      size="small"
                      sx={{ bgcolor: '#E7F4FF', color: AZUL, fontWeight: 600 }}
                    />
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
          </>
        )}
      </Container>

      {(dialogo?.modo === 'crear' || dialogo?.modo === 'editar') && (
        <FormularioPublicacion
          key={dialogo.item?.id ?? 'nueva'}
          titulo={dialogo.modo === 'crear' ? 'Nueva publicación' : 'Editar publicación'}
          textoBoton={dialogo.modo === 'crear' ? 'Crear publicación' : 'Guardar cambios'}
          inicial={formularioInicial}
          onCerrar={() => setDialogo(null)}
          onGuardar={guardarFormulario}
        />
      )}

      {dialogo?.modo === 'revisar' && (
        <RevisarPublicacion
          key={dialogo.item.id}
          item={dialogo.item}
          onCerrar={() => setDialogo(null)}
          onAprobar={aprobar}
          onRechazar={rechazar}
        />
      )}

      <Dialog open={dialogo?.modo === 'motivo'} onClose={() => setDialogo(null)} aria-labelledby="titulo-motivo">
        <DialogTitle id="titulo-motivo">Motivo del rechazo</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{dialogo?.item?.titulo}</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {dialogo?.item?.motivo || 'No se registró un motivo.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogo(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(porEliminar)} onClose={() => setPorEliminar(null)} aria-labelledby="titulo-eliminar-pub">
        <DialogTitle id="titulo-eliminar-pub">
          ¿Eliminar “{porEliminar?.titulo}”?
        </DialogTitle>
        <DialogContent>
          <Typography>Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPorEliminar(null)}>Volver</Button>
          <Button color="error" variant="contained" onClick={confirmarEliminar}>
            Eliminar publicación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}