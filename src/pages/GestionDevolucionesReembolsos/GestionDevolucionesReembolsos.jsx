import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TopNavBar from '../../components/organisms/TopNavBar'
import { pesos } from '../../utils/formatos'
import { ESTADOS_DEVOLUCION, listarDevolucionesAdmin, resolverDevolucionAdmin } from './devolucionesadmin'

const AZUL = '#0088ff'
const POR_PAGINA = 3
const { EN_REVISION, APROBADA, REEMBOLSADA, RECHAZADA } = ESTADOS_DEVOLUCION

// "Abiertas" = En revisión + Aprobadas (aprobadas que aún no se pagan)
const FILTROS = [
  { clave: 'abiertas', etiqueta: 'Abiertas', coincide: (c) => [EN_REVISION, APROBADA].includes(c.estado) },
  { clave: 'revision', etiqueta: 'En revisión', coincide: (c) => c.estado === EN_REVISION },
  { clave: 'aprobadas', etiqueta: 'Aprobadas', coincide: (c) => c.estado === APROBADA },
  { clave: 'reembolsadas', etiqueta: 'Reembolsadas', coincide: (c) => c.estado === REEMBOLSADA },
  { clave: 'rechazadas', etiqueta: 'Rechazadas', coincide: (c) => c.estado === RECHAZADA },
]

const COLORES_ESTADO = {
  [EN_REVISION]: { bg: '#fff3d9', color: '#996200' },
  [APROBADA]: { bg: '#eaf6ee', color: '#21864b' },
  [REEMBOLSADA]: { bg: '#e8f4fd', color: AZUL },
  [RECHAZADA]: { bg: '#fdecea', color: '#c62828' },
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// "14 oct 2026"
const fechaCorta = (valor) => {
  const f = new Date(valor)
  return `${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()}`
}

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const estiloCampo = { '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: 12 } }

function ChipEstado({ estado }) {
  const { bg, color } = COLORES_ESTADO[estado]
  return (
    <Box
      component="span"
      sx={{ bgcolor: bg, color, fontSize: 11, fontWeight: 700, px: '7px', py: '3px', borderRadius: '4px', whiteSpace: 'nowrap' }}
    >
      {estado}
    </Box>
  )
}

function ItemSolicitud({ caso, seleccionado, onElegir }) {
  return (
    <ButtonBase
      onClick={() => onElegir(caso.id)}
      aria-pressed={seleccionado}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        p: '7px',
        borderRadius: '6px',
        border: '1px solid',
        borderColor: seleccionado ? AZUL : '#dde1e6',
        bgcolor: seleccionado ? '#e8f4fd' : 'white',
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
          {caso.id} · Pedido #{caso.pedido}
        </Typography>
        <ChipEstado estado={caso.estado} />
      </Stack>
      <Typography sx={{ fontSize: 11, mt: 0.25 }}>
        {caso.cliente} · {caso.vendedor}
      </Typography>
      <Typography sx={{ fontSize: 11, color: '#707070' }}>
        {caso.motivo} · {pesos(caso.monto)}
      </Typography>
    </ButtonBase>
  )
}

// key={caso.id} en el padre: al cambiar de caso se reinicia la nota
function DetalleSolicitud({ caso, procesando, onResolver, onAviso }) {
  const [nota, setNota] = useState(caso.nota)
  const [errorNota, setErrorNota] = useState('')

  const enRevision = caso.estado === EN_REVISION
  const aprobada = caso.estado === APROBADA
  const cerrada = !enRevision && !aprobada

  const rechazar = () => {
    if (!nota.trim()) {
      setErrorNota('Escribe una nota para rechazar el reembolso.')
      return
    }
    onResolver(caso.id, 'rechazar', nota.trim())
  }

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Caso {caso.id}</Typography>
        <ChipEstado estado={caso.estado} />
      </Stack>

      <Typography sx={{ fontSize: 12 }}>
        Pedido #{caso.pedido} · {caso.detalle}
      </Typography>
      <Typography sx={{ fontSize: 11, color: '#707070' }}>
        Comprador/a: {caso.cliente} · Vendedor: {caso.vendedor}
      </Typography>

      <Divider />

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{caso.titulo}</Typography>
        <Typography sx={{ fontSize: 11, color: '#707070', whiteSpace: 'nowrap' }}>{fechaCorta(caso.fecha)}</Typography>
      </Stack>
      <Typography sx={{ fontSize: 12 }}>{caso.comentario}</Typography>

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        {caso.fotos > 0 ? (
          <Button
            variant="text"
            onClick={() => onAviso('Próximamente')}
            sx={{ p: 0, minWidth: 0, textTransform: 'none', fontSize: 12, fontWeight: 700, color: AZUL }}
          >
            Ver {caso.fotos} {caso.fotos === 1 ? 'foto adjunta' : 'fotos adjuntas'}
          </Button>
        ) : (
          <Typography sx={{ fontSize: 12, color: '#707070' }}>Sin fotos adjuntas</Typography>
        )}
        <Typography sx={{ fontSize: 11, color: '#707070' }}>
          {caso.respuestaVendedor ? 'Respuesta del vendedor recibida' : 'Sin respuesta del vendedor'}
        </Typography>
      </Stack>

      <Divider />

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 12 }}>Reembolso solicitado</Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{pesos(caso.monto)}</Typography>
      </Stack>

      <Stack spacing={0.5}>
        <Typography component="label" htmlFor="nota-interna" sx={{ fontSize: 12, fontWeight: 700 }}>
          Resolución / Nota interna
        </Typography>
        <TextField
          id="nota-interna"
          size="small"
          value={nota}
          disabled={cerrada || procesando}
          placeholder="Escribe la resolución del caso"
          onChange={(e) => {
            setNota(e.target.value)
            setErrorNota('')
          }}
          error={Boolean(errorNota)}
          helperText={errorNota}
          sx={estiloCampo}
        />
      </Stack>

      <Typography sx={{ fontSize: 11, color: '#707070' }}>
        Destino: {caso.destino} · Plazo: {caso.plazo}.
      </Typography>

      {!cerrada && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', pt: 0.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            disabled={procesando}
            onClick={() => onResolver(caso.id, enRevision ? 'aprobar' : 'reembolsar', nota.trim())}
            sx={{
              bgcolor: AZUL,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#0070d1', boxShadow: 'none' },
            }}
          >
            {enRevision ? 'Aprobar reembolso' : 'Marcar como reembolsado'}
          </Button>

          {enRevision && (
            <Button
              variant="outlined"
              disabled={procesando}
              onClick={rechazar}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 13,
                borderRadius: 2,
                color: 'text.primary',
                borderColor: '#dde1e6',
              }}
            >
              Rechazar
            </Button>
          )}

          <Button
            variant="text"
            onClick={() => onAviso('Próximamente')}
            sx={{ textTransform: 'none', fontSize: 12, color: AZUL }}
          >
            Contactar
          </Button>
        </Stack>
      )}
    </Stack>
  )
}

export default function GestionDevolucionesReembolsos() {
  const [casos, setCasos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [procesando, setProcesando] = useState(false)

  const [filtro, setFiltro] = useState('abiertas')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [elegido, setElegido] = useState(null)
  const [aviso, setAviso] = useState(null) // { texto, severidad }

  useEffect(() => {
    let activo = true

    listarDevolucionesAdmin()
      .then((datos) => {
        if (activo) setCasos(datos)
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar las solicitudes.')
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

  // Casos que cumplen la búsqueda (los contadores de cada filtro salen de aquí)
  const base = useMemo(() => {
    const texto = normalizar(busqueda.trim().replace(/^#/, ''))
    return casos.filter(
      (c) =>
        !texto ||
        normalizar(c.id).includes(texto) ||
        c.pedido.includes(texto) ||
        normalizar(c.cliente).includes(texto),
    )
  }, [casos, busqueda])

  const filtroActual = FILTROS.find((f) => f.clave === filtro)
  const conteos = FILTROS.map((f) => base.filter(f.coincide).length)
  const filtrados = base.filter(filtroActual.coincide)

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)
  const desde = filtrados.length ? inicio + 1 : 0
  const hasta = Math.min(inicio + POR_PAGINA, filtrados.length)

  // Si el caso elegido ya no está en la lista (cambió el filtro), se muestra el primero
  const seleccionado = filtrados.find((c) => c.id === elegido) ?? visibles[0]

  // Al cambiar el filtro o la búsqueda se vuelve a la página 1
  const cambiar = (setter) => (valor) => {
    setter(valor)
    setPagina(1)
  }

  const resolver = async (id, accion, nota) => {
    setProcesando(true)
    try {
      const actualizado = await resolverDevolucionAdmin(id, accion, nota)
      setCasos((previos) => previos.map((c) => (c.id === id ? actualizado : c)))
      const textos = {
        aprobar: `Reembolso aprobado (${id})`,
        rechazar: `Reembolso rechazado (${id})`,
        reembolsar: `Reembolso registrado como pagado (${id})`,
      }
      setAviso({ texto: textos[accion], severidad: 'success' })
    } catch (e) {
      setAviso({ texto: e.message || 'No se pudo actualizar el caso.', severidad: 'error' })
    } finally {
      setProcesando(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography sx={{ color: 'white', fontSize: 11, mb: 0.5 }}>
          Mi perfil / Administración / Todo el marketplace
        </Typography>

        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
          Gestión de Devoluciones y Reembolsos
        </Typography>

        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
          {FILTROS.map((f, i) => {
            const activo = filtro === f.clave
            return (
              <Button
                key={f.clave}
                aria-pressed={activo}
                onClick={() => cambiar(setFiltro)(f.clave)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: activo ? AZUL : 'white',
                  color: activo ? 'white' : '#707070',
                  '&:hover': { bgcolor: activo ? '#0070d1' : 'grey.200' },
                }}
              >
                {f.etiqueta} ({conteos[i]})
              </Button>
            )
          })}
        </Stack>

        {cargando && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress aria-label="Cargando solicitudes" sx={{ color: 'white' }} />
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

        {!cargando && !error && (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Paper sx={{ p: 1.5, borderRadius: '10px', width: { xs: '100%', md: 310 }, flexShrink: 0 }}>
              <Stack spacing={0.75}>
                <Stack spacing={0.5} sx={{ pb: 0.5 }}>
                  <Typography component="label" htmlFor="buscar-solicitud" sx={{ fontSize: 12, fontWeight: 700 }}>
                    Buscar solicitud
                  </Typography>
                  <TextField
                    id="buscar-solicitud"
                    size="small"
                    placeholder="Caso, pedido o cliente"
                    value={busqueda}
                    onChange={(e) => cambiar(setBusqueda)(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={estiloCampo}
                  />
                </Stack>

                {!filtrados.length && (
                  <Alert severity="info">
                    {busqueda.trim()
                      ? 'No se encontraron solicitudes para tu búsqueda.'
                      : 'No hay solicitudes en esta categoría.'}
                  </Alert>
                )}

                {visibles.map((c) => (
                  <ItemSolicitud
                    key={c.id}
                    caso={c}
                    seleccionado={seleccionado?.id === c.id}
                    onElegir={setElegido}
                  />
                ))}

                {filtrados.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}
                  >
                    <Typography sx={{ fontSize: 11, color: '#707070' }}>
                      {desde}–{hasta} de {filtrados.length} {filtroActual.etiqueta.toLowerCase()}
                    </Typography>

                    <Stack direction="row" sx={{ alignItems: 'center' }}>
                      {paginaActual > 1 && (
                        <Button
                          size="small"
                          onClick={() => setPagina(paginaActual - 1)}
                          sx={{ minWidth: 0, p: 0.25, textTransform: 'none', fontSize: 11, color: AZUL }}
                        >
                          ‹ Anterior
                        </Button>
                      )}
                      <Typography aria-live="polite" sx={{ fontSize: 11, color: AZUL, px: 0.5 }}>
                        {paginaActual} de {totalPaginas}
                      </Typography>
                      {paginaActual < totalPaginas && (
                        <Button
                          size="small"
                          onClick={() => setPagina(paginaActual + 1)}
                          sx={{ minWidth: 0, p: 0.25, textTransform: 'none', fontSize: 11, color: AZUL }}
                        >
                          Siguiente ›
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, borderRadius: '10px', flex: 1, width: '100%', minWidth: 0 }}>
              {seleccionado ? (
                <DetalleSolicitud
                  key={seleccionado.id}
                  caso={seleccionado}
                  procesando={procesando}
                  onResolver={resolver}
                  onAviso={(texto) => setAviso({ texto, severidad: 'info' })}
                />
              ) : (
                <Typography sx={{ fontSize: 12, color: '#707070' }}>
                  Selecciona una solicitud para ver su detalle.
                </Typography>
              )}
            </Paper>
          </Stack>
        )}
      </Container>

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={3000}
        onClose={() => setAviso(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={aviso?.severidad ?? 'info'} variant="filled" onClose={() => setAviso(null)}>
          {aviso?.texto}
        </Alert>
      </Snackbar>
    </Box>
  )
}
