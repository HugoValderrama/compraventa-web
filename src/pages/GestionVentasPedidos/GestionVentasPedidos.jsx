import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { formatearFechaHora, hoyISO, pesos } from '../../utils/formatos'
import { ESTADOS_ADMIN, listarPedidosAdmin } from './Pedidosadmin'

const AZUL = '#0088ff'
const POR_PAGINA = 3

const FILTROS = [
  { clave: 'todos', etiqueta: 'Todos', coincide: () => true },
  {
    clave: 'pendientes',
    etiqueta: 'Pendientes',
    coincide: (p) => p.estado === ESTADOS_ADMIN.POR_PREPARAR,
  },
  {
    clave: 'curso',
    etiqueta: 'En curso',
    coincide: (p) => [ESTADOS_ADMIN.CONFIRMADO, ESTADOS_ADMIN.ENVIADO].includes(p.estado),
  },
  {
    clave: 'finalizados',
    etiqueta: 'Finalizados',
    coincide: (p) => p.estado === ESTADOS_ADMIN.ENTREGADO,
  },
  {
    clave: 'cancelados',
    etiqueta: 'Cancelados',
    coincide: (p) => p.estado === ESTADOS_ADMIN.CANCELADO,
  },
]

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES_LARGO = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const claveMes = (valor) => {
  const f = new Date(valor)
  return `${f.getFullYear()}-${f.getMonth()}`
}

// "15 oct · 14:20"
const fechaCorta = (valor) => {
  const f = new Date(valor)
  const hora = String(f.getHours()).padStart(2, '0')
  const min = String(f.getMinutes()).padStart(2, '0')
  return `${f.getDate()} ${MESES[f.getMonth()]} · ${hora}:${min}`
}

// Descarga lo que se está viendo (todas las páginas, con período, pago y búsqueda aplicados).
// Separador ";" y BOM UTF-8 para que Excel en español lo abra en columnas y con tildes bien.
const celdaCSV = (valor) => {
  let texto = String(valor ?? '')
  if (/^[=+\-@]/.test(texto)) texto = `'${texto}` // evita que Excel lo interprete como fórmula
  return `"${texto.replace(/"/g, '""')}"`
}

function descargarListado(pedidos) {
  const columnas = [
    ['Pedido', (p) => p.id],
    ['Fecha', (p) => formatearFechaHora(p.fecha)],
    ['Cliente', (p) => p.cliente],
    ['Emprendedor', (p) => p.emprendedor],
    ['Tipo', (p) => p.tipo],
    ['Detalle', (p) => p.detalle],
    ['Comuna', (p) => p.comuna],
    ['Subtotal', (p) => p.subtotal],
    ['Envío', (p) => p.envio],
    ['Total', (p) => p.total],
    ['Medio de pago', (p) => p.medioPago],
    ['Pago', (p) => (p.pagado ? 'Pagado' : 'Pendiente')],
    ['Estado', (p) => p.estado],
  ]
  const lineas = [
    columnas.map(([titulo]) => celdaCSV(titulo)).join(';'),
    ...pedidos.map((p) => columnas.map(([, valor]) => celdaCSV(valor(p))).join(';')),
  ]
  const blob = new Blob(['\ufeff' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const enlace = Object.assign(document.createElement('a'), { href: url, download: `pedidos-${hoyISO()}.csv` })
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const COLORES_ESTADO = {
  Pagado: { bg: '#eaf6ee', color: '#21864b' },
  'Pendiente de pago': { bg: '#fff3d9', color: '#996200' },
  [ESTADOS_ADMIN.POR_PREPARAR]: { bg: '#fff3d9', color: '#996200' },
  [ESTADOS_ADMIN.CONFIRMADO]: { bg: '#e8f4fd', color: AZUL },
  [ESTADOS_ADMIN.ENVIADO]: { bg: '#e8f4fd', color: AZUL },
  [ESTADOS_ADMIN.ENTREGADO]: { bg: '#eaf6ee', color: '#21864b' },
  [ESTADOS_ADMIN.CANCELADO]: { bg: '#fdecea', color: '#c62828' },
}

// "15 oct 2026 · 14:20"
const fechaLarga = (valor) => `${fechaCorta(valor).replace(' · ', ` ${new Date(valor).getFullYear()} · `)}`

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

const botonAzul = {
  bgcolor: AZUL,
  color: 'white',
  textTransform: 'none',
  fontWeight: 700,
  fontSize: 13,
  borderRadius: 2,
  boxShadow: 'none',
  '&:hover': { bgcolor: '#0070d1', boxShadow: 'none' },
}

function Campo({ etiqueta, children, sx }) {
  return (
    <Stack spacing={0.5} sx={sx}>
      <Typography component="span" sx={{ fontSize: 12, fontWeight: 700 }}>
        {etiqueta}
      </Typography>
      {children}
    </Stack>
  )
}

function SelectNativo({ etiqueta, value, onChange, opciones }) {
  return (
    <TextField
      select
      size="small"
      value={value}
      onChange={onChange}
      slotProps={{
        select: { native: true },
        htmlInput: { 'aria-label': etiqueta },
      }}
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: 12 } }}
    >
      {opciones.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.etiqueta}
        </option>
      ))}
    </TextField>
  )
}

function FilaPedido({ pedido, onVer }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ py: 1.5, alignItems: { xs: 'stretch', sm: 'flex-start' } }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, overflowWrap: 'anywhere' }}>
          #{pedido.id} · {pedido.cliente}
        </Typography>
        <Typography sx={{ fontSize: 12, overflowWrap: 'anywhere' }}>
          {pedido.emprendedor} · {pedido.detalle}
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          {fechaCorta(pedido.fecha)} · {pedido.tipo} · {pedido.comuna}
        </Typography>
      </Box>

      <Stack spacing={0.5} sx={{ minWidth: { sm: 105 }, alignItems: 'flex-start' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 17 }}>{pesos(pedido.total)}</Typography>
        <ChipEstado estado={pedido.pagado ? 'Pagado' : 'Pendiente de pago'} />
      </Stack>

      <Stack spacing={1} sx={{ minWidth: { sm: 104 }, alignItems: 'flex-start' }}>
        <ChipEstado estado={pedido.estado} />
        <Button variant="contained" onClick={() => onVer(pedido)} sx={botonAzul}>
          Ver detalle
        </Button>
      </Stack>
    </Stack>
  )
}

function DetallePedido({ pedido, onCerrar }) {
  const servicio = pedido.tipo === 'Servicio'

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="sm" aria-labelledby="titulo-detalle-pedido">
      <DialogTitle id="titulo-detalle-pedido" sx={{ pb: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography component="span" sx={{ fontSize: 18, fontWeight: 700, mr: 'auto' }}>
            Pedido #{pedido.id}
          </Typography>
          <ChipEstado estado={pedido.pagado ? 'Pagado' : 'Pendiente de pago'} />
          <ChipEstado estado={pedido.estado} />
        </Stack>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 400, mt: 0.5 }}>
          Recibido el {fechaLarga(pedido.fecha)}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1.25} sx={{ pt: 1 }}>
          <Divider />

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{pedido.detalle}</Typography>
            <Typography sx={{ fontSize: 12 }}>
              {pedido.tipo} · {pedido.emprendedor}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Cliente</Typography>
            <Typography sx={{ fontSize: 12 }}>
              {pedido.cliente} · {pedido.comuna}
            </Typography>
          </Box>

          <Divider />

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 12 }}>
              {servicio
                ? `Servicio ${pesos(pedido.subtotal)}`
                : `Producto ${pesos(pedido.subtotal)} + Envío ${pesos(pedido.envio)}`}
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Total {pesos(pedido.total)}</Typography>
          </Stack>

          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            {pedido.pagado
              ? `Pago confirmado · ${pedido.medioPago} · Comprobante #P${pedido.id}`
              : `Pago pendiente · ${pedido.medioPago}`}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCerrar}
          variant="outlined"
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, borderRadius: 2, color: 'text.primary', borderColor: '#dde1e6' }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function GestionVentasPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [periodo, setPeriodo] = useState(null) // null = el mes más reciente
  const [pago, setPago] = useState('todos')
  const [pagina, setPagina] = useState(1)
  const [aviso, setAviso] = useState('')
  const [detalle, setDetalle] = useState(null)

  useEffect(() => {
    let activo = true

    listarPedidosAdmin()
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

  const reintentar = () => {
    setCargando(true)
    setError('')
    setIntento((n) => n + 1)
  }

  // Meses presentes en los datos, del más reciente al más antiguo
  const periodos = useMemo(() => {
    const vistos = new Map()
    pedidos.forEach((p) => {
      const clave = claveMes(p.fecha)
      if (!vistos.has(clave)) {
        const f = new Date(p.fecha)
        vistos.set(clave, {
          valor: clave,
          etiqueta: `${MESES_LARGO[f.getMonth()]} ${f.getFullYear()}`,
          orden: f.getFullYear() * 12 + f.getMonth(),
        })
      }
    })
    const lista = [...vistos.values()].sort((a, b) => b.orden - a.orden)
    return [...lista, { valor: 'todos', etiqueta: 'Todo el historial' }]
  }, [pedidos])

  const periodoActivo = periodo ?? periodos[0]?.valor ?? 'todos'

  // Pedidos que cumplen período, pago y búsqueda (los contadores de cada filtro salen de aquí)
  const base = useMemo(() => {
    const texto = normalizar(busqueda.trim().replace(/^#/, ''))

    return pedidos.filter(
      (p) =>
        (periodoActivo === 'todos' || claveMes(p.fecha) === periodoActivo) &&
        (pago === 'todos' || (pago === 'pagado') === p.pagado) &&
        (!texto ||
          p.id.includes(texto) ||
          normalizar(p.cliente).includes(texto) ||
          normalizar(p.emprendedor).includes(texto)),
    )
  }, [pedidos, periodoActivo, pago, busqueda])

  const conteos = FILTROS.map((f) => base.filter(f.coincide).length)
  const filtrados = base.filter(FILTROS.find((f) => f.clave === filtro).coincide)

  const pagados = filtrados.filter((p) => p.pagado)
  const totalPagado = pagados.reduce((suma, p) => suma + p.total, 0)
  const sinPagar = filtrados.length - pagados.length

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)
  const desde = filtrados.length ? inicio + 1 : 0
  const hasta = Math.min(inicio + POR_PAGINA, filtrados.length)

  // Al cambiar cualquier filtro se vuelve a la página 1
  const cambiar = (setter) => (valor) => {
    setter(valor)
    setPagina(1)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography sx={{ color: 'white', fontSize: 11, mb: 0.5 }}>
          Mi perfil / Administración / Todo el marketplace
        </Typography>

        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}
        >
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
            Gestión de Ventas/Pedidos
          </Typography>

          <Button
            variant="contained"
            sx={botonAzul}
            disabled={cargando || Boolean(error)}
            onClick={() => {
              if (!filtrados.length) {
                setAviso('No hay pedidos para descargar con los filtros actuales.')
                return
              }
              descargarListado(filtrados)
              setAviso(`Listado descargado (${filtrados.length} ${filtrados.length === 1 ? 'pedido' : 'pedidos'}).`)
            }}
          >
            Descargar listado
          </Button>
        </Stack>

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

        <Paper sx={{ p: 2, borderRadius: '10px' }}>
          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Campo etiqueta="Buscar pedido" sx={{ flex: 1 }}>
                <TextField
                  size="small"
                  placeholder="ID, cliente o emprendedor"
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
                    htmlInput: { 'aria-label': 'Buscar pedido' },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: 12 } }}
                />
              </Campo>

              <Campo etiqueta="Período" sx={{ width: { sm: 165 } }}>
                <SelectNativo
                  etiqueta="Período"
                  value={periodoActivo}
                  onChange={(e) => cambiar(setPeriodo)(e.target.value)}
                  opciones={periodos}
                />
              </Campo>

              <Campo etiqueta="Pago" sx={{ width: { sm: 128 } }}>
                <SelectNativo
                  etiqueta="Pago"
                  value={pago}
                  onChange={(e) => cambiar(setPago)(e.target.value)}
                  opciones={[
                    { valor: 'todos', etiqueta: 'Todos' },
                    { valor: 'pagado', etiqueta: 'Pagado' },
                    { valor: 'pendiente', etiqueta: 'Pendiente' },
                  ]}
                />
              </Campo>
            </Stack>

            <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1.5 }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                Toda la plataforma · {pagados.length} pagados · {sinPagar} pendientes de pago
              </Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                Pagado: {pesos(totalPagado)}
              </Typography>
            </Stack>

            <Divider />

            {cargando && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress aria-label="Cargando pedidos" />
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

            {!cargando && !error && !filtrados.length && (
              <Alert severity="info">
                {busqueda.trim()
                  ? 'No se encontraron pedidos para tu búsqueda.'
                  : 'No hay pedidos en esta categoría.'}
              </Alert>
            )}

            {!cargando &&
              !error &&
              visibles.map((p, i) => (
                <Box key={p.id}>
                  <FilaPedido pedido={p} onVer={setDetalle} />
                  {i < visibles.length - 1 && <Divider />}
                </Box>
              ))}

            {!cargando && !error && filtrados.length > 0 && (
              <>
                <Divider />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
                >
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    Mostrando {desde}–{hasta} de {filtrados.length} pedidos
                  </Typography>

                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Button
                      size="small"
                      disabled={paginaActual === 1}
                      onClick={() => setPagina(paginaActual - 1)}
                      sx={{ textTransform: 'none', fontSize: 12, color: '#707070' }}
                    >
                      ‹ Anterior
                    </Button>

                    <Box
                      aria-live="polite"
                      sx={{
                        bgcolor: '#e8f4fd',
                        color: AZUL,
                        fontSize: 11,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {paginaActual} de {totalPaginas}
                    </Box>

                    <Button
                      variant="outlined"
                      disabled={paginaActual === totalPaginas}
                      onClick={() => setPagina(paginaActual + 1)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        borderRadius: 2,
                        color: 'text.primary',
                        borderColor: '#dde1e6',
                      }}
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

      {detalle && <DetallePedido pedido={detalle} onCerrar={() => setDetalle(null)} />}

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
