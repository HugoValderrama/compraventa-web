import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TopNavBar from '../../components/organisms/TopNavBar'
import PedidoFila from '../../components/molecules/PedidoFila'
import { ESTADOS_PEDIDO, listarPedidos } from '../../mocks/pedidos'

const POR_PAGINA = 3

const PESTANAS = [
  { clave: 'todos', etiqueta: 'Todos', coincide: () => true },
  {
    clave: 'preparar',
    etiqueta: 'Por preparar',
    coincide: (p) =>
      [ESTADOS_PEDIDO.RECIBIDO, ESTADOS_PEDIDO.PREPARACION].includes(p.estado),
  },
  {
    clave: 'enviados',
    etiqueta: 'Enviados',
    coincide: (p) => p.estado === ESTADOS_PEDIDO.ENVIADO,
  },
  {
    clave: 'entregados',
    etiqueta: 'Entregados',
    coincide: (p) => p.estado === ESTADOS_PEDIDO.ENTREGADO,
  },
]

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export default function PedidosList() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [pestana, setPestana] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError('')

    listarPedidos()
      .then((datos) => {
        if (activo) setPedidos(datos)
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar los pedidos.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [intento])

  const conteos = PESTANAS.map((t) => pedidos.filter(t.coincide).length)

  const filtrados = useMemo(() => {
    const actual = PESTANAS.find((t) => t.clave === pestana)
    const texto = normalizar(busqueda.trim().replace(/^#/, ''))

    return pedidos
      .filter(actual.coincide)
      .filter(
        (p) =>
          !texto ||
          p.id.includes(texto) ||
          normalizar(p.cliente.nombre).includes(texto)
      )
  }, [pedidos, pestana, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)
  const desde = filtrados.length ? inicio + 1 : 0
  const hasta = Math.min(inicio + POR_PAGINA, filtrados.length)

  const cambiarPestana = (_, valor) => {
    setPestana(valor)
    setPagina(1)
  }

  const cambiarBusqueda = (event) => {
    setBusqueda(event.target.value)
    setPagina(1)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography
          variant="caption"
          sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mb: 0.5 }}
        >
          Mi perfil / Taller Tierra / Emprendedor
          {/* TODO: conectar API (nombre del taller) */}
        </Typography>

        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
            Pedidos Recibidos
          </Typography>

          <Button
            variant="contained"
            onClick={() => setAviso('Próximamente')}
            sx={{
              bgcolor: 'white',
              color: 'text.primary',
              '&:hover': { bgcolor: 'grey.200' },
            }}
            onClick={() => {
              console.log('[Pedidos] Descargar listado (pendiente)')
              setAviso('Próximamente')
            }}
          >
            Descargar listado
          </Button>
        </Stack>

        <Tabs
          value={pestana}
          onChange={cambiarPestana}
          variant="scrollable"
          scrollButtons={false}
          slotProps={{ indicator: { sx: { display: 'none' } } }}
          sx={{ mb: 2 }}
        >
          {PESTANAS.map((t, i) => (
            <Tab
              key={t.clave}
              value={t.clave}
              label={`${t.etiqueta} (${conteos[i]})`}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 36,
                mr: 1,
                borderRadius: 999,
                bgcolor: 'white',
                color: 'text.primary',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            />
          ))}
        </Tabs>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                pb: 1,
              }}
            >
              <Typography color="text.secondary">Últimos pedidos</Typography>

              <TextField
                size="small"
                placeholder="Buscar pedido o cliente"
                value={busqueda}
                onChange={cambiarBusqueda}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                  htmlInput: { 'aria-label': 'Buscar pedido o cliente' },
                }}
                sx={{ minWidth: { sm: 260 } }}
              />
            </Stack>

            {cargando && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress aria-label="Cargando pedidos" />
              </Box>
            )}

            {error && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => setIntento((n) => n + 1)}
                  >
                    Reintentar
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {!cargando && !error && !filtrados.length && (
              <Alert severity="info">
                {busqueda.trim()
                  ? 'No se encontraron pedidos para tu búsqueda.'
                  : 'No hay pedidos en esta categoría'}
              </Alert>
            )}

            {!cargando &&
              !error &&
              visibles.map((p) => (
                <Box key={p.id}>
                  <Divider />
                  <PedidoFila pedido={p} onVer={(x) => navigate(`/pedidos/${x.id}`)} />
                </Box>
              ))}

            {!cargando && !error && filtrados.length > 0 && (
              <>
                <Divider />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{
                    pt: 1,
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Mostrando {desde}–{hasta} de {filtrados.length} pedidos
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      disabled={paginaActual === 1}
                      onClick={() => setPagina(paginaActual - 1)}
                    >
                      ‹ Anterior
                    </Button>

                    <Typography sx={{ px: 1, fontWeight: 600 }} aria-live="polite">
                      {paginaActual}
                    </Typography>

                    <Button
                      variant="outlined"
                      disabled={paginaActual === totalPaginas}
                      onClick={() => setPagina(paginaActual + 1)}
                    >
                      Siguiente ›
                    </Button>
                  </Stack>
                </Stack>
              </>
            )}
          </Stack>
        </Paper>
      </Container>

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={3000}
        onClose={() => setAviso('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" onClose={() => setAviso('')}>
          {aviso}
        </Alert>
      </Snackbar>
    </Box>
  )
}