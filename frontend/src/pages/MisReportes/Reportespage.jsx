import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  GlobalStyles,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material'
import CancelIcon from '@mui/icons-material/Cancel'
import TuneIcon from '@mui/icons-material/Tune'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import TopNavBar from '../../components/organisms/TopNavBar'
import { pesos } from '../../utils/formatos'
import {
  CATEGORIAS_REPORTE,
  ESTADOS_REPORTE,
  FILTROS_INICIALES,
  FILTROS_VACIOS,
  TIPOS_REPORTE,
  calcularResumen,
  cargarVentas,
  describirPeriodo,
  errorDeFiltros,
  filtrarVentas,
  filtrosActivos,
  formatearFechaReporte,
  ordenarVentas,
  textoResultados,
} from './Reportes.js'

const AZUL = '#008FFF'
const AZUL_OSCURO = '#0B6FD0'
const MORADO = '#3026A6'
const POR_PAGINA = 10

const COLORES_ESTADO = {
  Finalizada: { bgcolor: '#E3EEFF', color: AZUL_OSCURO },
  Pendiente: { bgcolor: '#FFF1D6', color: '#8A5300' },
  Cancelada: { bgcolor: '#FDE4E4', color: '#B42318' },
}

// Al imprimir solo sale el bloque "solo-imprimir" (informe limpio con TODAS las filas).
const estilosImpresion = {
  '@media print': {
    header: { display: 'none !important' },
    '.no-imprimir': { display: 'none !important' },
    '.solo-imprimir': { display: 'block !important' },
    '.reporte-raiz': { background: 'white !important', minHeight: 'auto !important' },
  },
}

/* ------------------------------------------------------------------ */
/* Piezas                                                              */
/* ------------------------------------------------------------------ */

function Campo({ id, etiqueta, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography component="label" htmlFor={id} id={`${id}-etiqueta`} sx={{ display: 'block', fontWeight: 700, fontSize: 14, mb: 0.75 }}>
        {etiqueta}
      </Typography>
      {children}
    </Box>
  )
}

function Indicador({ titulo, valor, detalle }) {
  return (
    <Paper component="section" aria-label={titulo} elevation={0} sx={{ borderRadius: 2.5, p: 2.25, flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{titulo}</Typography>
      <Typography sx={{ color: AZUL_OSCURO, fontWeight: 800, fontSize: 34, lineHeight: 1.2 }}>{valor}</Typography>
      <Typography variant="caption" color="text.secondary">
        {detalle}
      </Typography>
    </Paper>
  )
}

function EstadoChip({ estado }) {
  return <Chip label={estado} size="small" sx={{ ...COLORES_ESTADO[estado], fontWeight: 600, fontSize: 12, borderRadius: 1 }} />
}

/* ------------------------------------------------------------------ */
/* Pantalla                                                            */
/* ------------------------------------------------------------------ */

export default function ReportesPage() {
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [intento, setIntento] = useState(0)

  const [borrador, setBorrador] = useState(FILTROS_INICIALES) // lo que se está editando
  const [aplicados, setAplicados] = useState(FILTROS_INICIALES) // lo que usa el reporte
  const [errorFiltros, setErrorFiltros] = useState('')
  const [orden, setOrden] = useState('desc')
  const [pagina, setPagina] = useState(1)
  const [menu, setMenu] = useState(null)

  useEffect(() => {
    let activo = true

    cargarVentas()
      .then((lista) => {
        if (activo) setVentas(lista)
      })
      .catch(() => {
        if (activo) setErrorCarga('No se pudo cargar el reporte.')
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

  const cambiar = (campo) => (event) => setBorrador((actual) => ({ ...actual, [campo]: event.target.value }))

  const aplicar = (event) => {
    event?.preventDefault()
    const mensaje = errorDeFiltros(borrador)
    setErrorFiltros(mensaje)
    if (mensaje) return
    setAplicados(borrador)
    setPagina(1)
  }

  const limpiar = () => {
    setBorrador(FILTROS_VACIOS)
    setAplicados(FILTROS_VACIOS)
    setErrorFiltros('')
    setPagina(1)
  }

  const quitar = (filtro) => {
    setBorrador((actual) => ({ ...actual, ...filtro.quitar }))
    setAplicados((actual) => ({ ...actual, ...filtro.quitar }))
    setErrorFiltros('')
    setPagina(1)
  }

  const agregarFiltro = (idCampo) => {
    setMenu(null)
    // Espera a que el menú termine de cerrarse para que el foco no se pierda.
    setTimeout(() => document.getElementById(idCampo)?.focus(), 0)
  }

  // Resultado del reporte
  const filas = ordenarVentas(filtrarVentas(ventas, aplicados), orden)
  const resumen = calcularResumen(filas)
  const activos = filtrosActivos(aplicados)
  const periodo = describirPeriodo(aplicados.desde, aplicados.hasta)
  const totalPaginas = Math.max(1, Math.ceil(filas.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  // Filtros que se pueden agregar desde "+ Agregar filtro"
  const agregables = [
    aplicados.estado === 'Todos' && { etiqueta: 'Estado', id: 'filtro-estado' },
    aplicados.categoria === 'Todas' && { etiqueta: 'Categoría', id: 'filtro-categoria' },
    !aplicados.desde && !aplicados.hasta && { etiqueta: 'Período', id: 'filtro-desde' },
  ].filter(Boolean)

  const exportarPdf = () => {
    // El nombre del archivo que propone el navegador sale del título de la pestaña.
    const tituloOriginal = document.title
    document.title = `Reporte de ventas - ${periodo}`
    window.print()
    document.title = tituloOriginal
  }

  return (
    <Box translate="no" className="notranslate reporte-raiz" sx={{ bgcolor: MORADO, minHeight: '100dvh' }}>
      <GlobalStyles styles={estilosImpresion} />
      <TopNavBar title="Reportes" />

      <Container maxWidth="lg" className="no-imprimir" sx={{ pt: 1.5, pb: 4 }}>
        {/* Encabezado */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}>
          <Box>
            <Typography component="h1" sx={{ color: 'white', fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
              Módulo de Reportes
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
              Consulta y exporta la actividad de tu negocio.
            </Typography>
          </Box>

          <Button
            variant="contained"
            disableElevation
            startIcon={<FileDownloadOutlinedIcon />}
            disabled={cargando || Boolean(errorCarga) || filas.length === 0}
            onClick={exportarPdf}
            sx={{ bgcolor: AZUL, textTransform: 'none', fontWeight: 700, borderRadius: 1.5, alignSelf: { xs: 'flex-start', sm: 'center' }, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)' } }}
          >
            Exportar PDF
          </Button>
        </Stack>

        {cargando && (
          <Stack sx={{ alignItems: 'center', py: 6 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Stack>
        )}

        {!cargando && errorCarga && (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={reintentar}>Reintentar</Button>}>
            {errorCarga}
          </Alert>
        )}

        {!cargando && !errorCarga && (
          <Stack spacing={2}>
            {/* Filtros */}
            <Paper component="form" onSubmit={aplicar} noValidate aria-label="Filtros del reporte" elevation={0} sx={{ borderRadius: 3, p: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <TuneIcon sx={{ color: AZUL_OSCURO }} />
                  <Typography component="h2" sx={{ fontWeight: 800, fontSize: 18 }}>
                    Filtros del reporte
                  </Typography>
                </Stack>
                <Button type="button" size="small" onClick={limpiar} sx={{ textTransform: 'none', fontWeight: 700, color: AZUL_OSCURO }}>
                  Limpiar filtro
                </Button>
              </Stack>

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, mb: 2 }}>
                <Campo id="filtro-tipo" etiqueta="Tipo de reporte">
                  <TextField select fullWidth size="small" id="filtro-tipo" value={borrador.tipo} onChange={cambiar('tipo')} slotProps={{ select: { labelId: 'filtro-tipo-etiqueta' } }}>
                    {TIPOS_REPORTE.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                    ))}
                  </TextField>
                </Campo>

                <Campo id="filtro-desde" etiqueta="Desde">
                  <TextField fullWidth size="small" type="date" id="filtro-desde" value={borrador.desde} onChange={cambiar('desde')} error={Boolean(errorFiltros)} />
                </Campo>

                <Campo id="filtro-hasta" etiqueta="Hasta">
                  <TextField fullWidth size="small" type="date" id="filtro-hasta" value={borrador.hasta} onChange={cambiar('hasta')} error={Boolean(errorFiltros)} />
                </Campo>
              </Box>

              {errorFiltros && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorFiltros}
                </Alert>
              )}

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr auto' }, alignItems: 'end', mb: 1.5 }}>
                <Campo id="filtro-estado" etiqueta="Estado">
                  <TextField select fullWidth size="small" id="filtro-estado" value={borrador.estado} onChange={cambiar('estado')} slotProps={{ select: { labelId: 'filtro-estado-etiqueta' } }}>
                    {ESTADOS_REPORTE.map((e) => (
                      <MenuItem key={e.valor} value={e.valor}>{e.etiqueta}</MenuItem>
                    ))}
                  </TextField>
                </Campo>

                <Campo id="filtro-categoria" etiqueta="Categoría">
                  <TextField select fullWidth size="small" id="filtro-categoria" value={borrador.categoria} onChange={cambiar('categoria')} slotProps={{ select: { labelId: 'filtro-categoria-etiqueta' } }}>
                    <MenuItem value="Todas">Todas las categorías</MenuItem>
                    {CATEGORIAS_REPORTE.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </TextField>
                </Campo>

                <Button type="submit" variant="contained" disableElevation startIcon={<FilterAltOutlinedIcon />} sx={{ bgcolor: AZUL, textTransform: 'none', fontWeight: 700, borderRadius: 1.5, height: 40, px: 3 }}>
                  Aplicar filtros
                </Button>
              </Box>

              <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Filtros activos:
                </Typography>

                {activos.map((filtro) => (
                  <Chip
                    key={filtro.clave}
                    size="small"
                    label={filtro.etiqueta}
                    onDelete={() => quitar(filtro)}
                    deleteIcon={<CancelIcon aria-label={`Quitar filtro ${filtro.etiqueta}`} />}
                    sx={{ bgcolor: '#E7F4FF', color: AZUL_OSCURO, fontWeight: 700, '& .MuiChip-deleteIcon': { color: AZUL_OSCURO } }}
                  />
                ))}

                {activos.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    ninguno
                  </Typography>
                )}

                <Button
                  type="button"
                  size="small"
                  disabled={agregables.length === 0}
                  onClick={(event) => setMenu(event.currentTarget)}
                  sx={{ textTransform: 'none', fontWeight: 700, color: AZUL_OSCURO, minWidth: 0 }}
                >
                  + Agregar filtro
                </Button>
                <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)}>
                  {agregables.map((item) => (
                    <MenuItem key={item.id} onClick={() => agregarFiltro(item.id)}>
                      {item.etiqueta}
                    </MenuItem>
                  ))}
                </Menu>
              </Stack>
            </Paper>

            {/* Indicadores */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Indicador titulo="Total de ventas" valor={pesos(resumen.ingresos)} detalle="Ingresos del período" />
              <Indicador titulo="Ventas finalizadas" valor={resumen.finalizadas} detalle="Operaciones completadas" />
              <Indicador titulo="Venta promedio" valor={pesos(resumen.promedio)} detalle="Por operación finalizada" />
            </Stack>

            {/* Detalle */}
            <Paper component="section" aria-labelledby="detalle-titulo" elevation={0} sx={{ borderRadius: 3, p: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1 }}>
                <Box>
                  <Typography component="h2" id="detalle-titulo" sx={{ fontWeight: 800, fontSize: 22 }}>
                    Detalle de ventas
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {periodo}
                  </Typography>
                </Box>
                <Chip label={textoResultados(filas.length)} size="small" aria-live="polite" sx={{ bgcolor: '#F0F1F3', fontWeight: 700, borderRadius: 1.5 }} />
              </Stack>

              <TableContainer>
                <Table size="small" aria-label="Detalle de ventas">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F4F5F8', '& th': { fontWeight: 700, fontSize: 13, borderBottom: 'none' } }}>
                      <TableCell>Operación</TableCell>
                      <TableCell sortDirection={orden}>
                        <TableSortLabel active direction={orden} onClick={() => { setOrden((o) => (o === 'desc' ? 'asc' : 'desc')); setPagina(1) }}>
                          Fecha
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                          No hay ventas que coincidan con los filtros.
                        </TableCell>
                      </TableRow>
                    )}

                    {visibles.map((v) => (
                      <TableRow key={v.id} hover>
                        <TableCell sx={{ color: AZUL_OSCURO, fontWeight: 800, fontSize: 14 }}>{v.id}</TableCell>
                        <TableCell sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>{formatearFechaReporte(v.fecha)}</TableCell>
                        <TableCell sx={{ fontSize: 14 }}>{v.cliente}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>{pesos(v.total)}</TableCell>
                        <TableCell align="center">
                          <EstadoChip estado={v.estado} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPaginas > 1 && (
                <Stack sx={{ alignItems: 'center', mt: 2 }}>
                  <Pagination
                    count={totalPaginas}
                    page={paginaActual}
                    onChange={(_, valor) => setPagina(valor)}
                    color="primary"
                    getItemAriaLabel={(tipo, numero, seleccionada) =>
                      ({ page: `${seleccionada ? 'Página' : 'Ir a la página'} ${numero}`, next: 'Página siguiente', previous: 'Página anterior', first: 'Primera página', last: 'Última página' })[tipo]
                    }
                  />
                </Stack>
              )}
            </Paper>
          </Stack>
        )}
      </Container>

      {/* Versión para imprimir / guardar como PDF: texto oscuro, sin controles y con todas las filas. */}
      {!cargando && !errorCarga && (
        <Box className="solo-imprimir" sx={{ display: 'none', color: '#111', bgcolor: 'white', p: 3 }}>
          <Typography component="h1" sx={{ fontSize: 24, fontWeight: 800 }}>
            Reporte de ventas
          </Typography>
          <Typography sx={{ fontSize: 14 }}>{periodo}</Typography>
          <Typography sx={{ fontSize: 12, mb: 2 }}>
            Filtros: {activos.length ? activos.map((f) => f.etiqueta).join(' · ') : 'ninguno'}
          </Typography>

          <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 12 }}>Total de ventas</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{pesos(resumen.ingresos)}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12 }}>Ventas finalizadas</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{resumen.finalizadas}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12 }}>Venta promedio</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{pesos(resumen.promedio)}</Typography>
            </Box>
          </Stack>

          <Table size="small" aria-label="Detalle de ventas para imprimir">
            <TableHead>
              <TableRow>
                {['Operación', 'Fecha', 'Cliente', 'Total', 'Estado'].map((titulo) => (
                  <TableCell key={titulo} sx={{ fontWeight: 700, color: '#111', borderBottom: '2px solid #111' }}>
                    {titulo}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((v) => (
                <TableRow key={v.id}>
                  <TableCell sx={{ color: '#111' }}>{v.id}</TableCell>
                  <TableCell sx={{ color: '#111' }}>{formatearFechaReporte(v.fecha)}</TableCell>
                  <TableCell sx={{ color: '#111' }}>{v.cliente}</TableCell>
                  <TableCell sx={{ color: '#111' }}>{pesos(v.total)}</TableCell>
                  <TableCell sx={{ color: '#111' }}>{v.estado}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  )
}