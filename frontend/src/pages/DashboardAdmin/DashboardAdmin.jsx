import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import { pesos } from '../../utils/formatos'
import { obtenerDashboardAdmin } from './DashboardAdmin'

const AZUL = '#0088ff'

// Destinos del dashboard. Una ruta en null significa que esa pantalla aún no existe:
// al construirla, escribe aquí su ruta (y agrega su <Route> en App.jsx).
const RUTAS = {
  pedidos: '/gestion-ventas-pedidos',
  devoluciones: '/gestion-devoluciones-reembolsos',
  publicaciones: '/gestion-publicaciones',
  usuarios: '/admin/usuarios',
  categorias: '/categorias',
  reportes: '/reportes',
}

const NOMBRES = {
  publicaciones: 'La gestión de publicaciones',
  usuarios: 'La gestión de usuarios',
  categorias: 'La gestión de categorías',
  reportes: 'El módulo de reportes',
}

const COLORES_ESTADO = {
  'Por preparar': { bg: '#fff3d9', color: '#996200' },
  Confirmado: { bg: '#e8f4fd', color: AZUL },
  Enviado: { bg: '#eaf6ee', color: '#21864b' },
  Entregado: { bg: '#eaf6ee', color: '#21864b' },
  Cancelado: { bg: '#fdecea', color: '#c62828' },
}
const COLOR_NEUTRO = { bg: '#eeeeee', color: '#555555' }

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const numero = new Intl.NumberFormat('es-CL', { useGrouping: 'always' })

const hora = (f) => `${String(f.getHours()).padStart(2, '0')}:${String(f.getMinutes()).padStart(2, '0')}`

// "15 oct · 14:20"
const fechaCorta = (valor) => {
  const f = new Date(valor)
  return `${f.getDate()} ${MESES[f.getMonth()]} · ${hora(f)}`
}

// "15 oct 2026 · 14:30"
const fechaLarga = (valor) => {
  const f = new Date(valor)
  return `${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()} · ${hora(f)}`
}

function Etiqueta({ texto, colores }) {
  return (
    <Box
      component="span"
      sx={{
        bgcolor: colores.bg,
        color: colores.color,
        fontSize: 11,
        fontWeight: 700,
        px: '7px',
        py: '3px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      {texto}
    </Box>
  )
}

function Indicador({ titulo, valor, detalle }) {
  return (
    <Paper sx={{ p: 2, borderRadius: '10px' }}>
      <Typography sx={{ fontSize: 12, color: '#707070' }}>{titulo}</Typography>
      <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}>{valor}</Typography>
      <Typography sx={{ fontSize: 11, color: '#707070' }}>{detalle}</Typography>
    </Paper>
  )
}

function PedidoReciente({ pedido, ultimo }) {
  return (
    <>
      <Stack spacing={0.5} sx={{ py: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
            #{pedido.id} · {pedido.cliente}
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{pesos(pedido.total)}</Typography>
        </Stack>
        <Typography sx={{ fontSize: 12 }}>
          {pedido.emprendedor} · {pedido.detalle}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Etiqueta texto={pedido.estado} colores={COLORES_ESTADO[pedido.estado] ?? COLOR_NEUTRO} />
          <Typography sx={{ fontSize: 11, color: '#707070' }}>{fechaCorta(pedido.fecha)}</Typography>
        </Stack>
      </Stack>
      {!ultimo && <Divider />}
    </>
  )
}

export default function DashboardAdmin() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let activo = true

    obtenerDashboardAdmin()
      .then((resumen) => {
        if (activo) setDatos(resumen)
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar el resumen del marketplace.')
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

  // Props para un botón o enlace: navega si la pantalla existe, si no avisa
  const destino = (clave) =>
    RUTAS[clave]
      ? { component: RouterLink, to: RUTAS[clave] }
      : { onClick: () => setAviso(`${NOMBRES[clave]} aún no está disponible.`) }

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

  const filaPendiente = (clave, cantidad, texto, colores) => (
    <ButtonBase
      {...destino(clave)}
      sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5, width: '100%', py: 0.25, borderRadius: 1, textAlign: 'left', '&:hover': { bgcolor: 'grey.100' } }}
    >
      <Etiqueta texto={cantidad} colores={colores} />
      <Typography sx={{ fontSize: 13 }}>{texto}</Typography>
    </ButtonBase>
  )

  const filaEnlace = (clave, texto) => (
    <ButtonBase
      {...destino(clave)}
      sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', py: 0.25, borderRadius: 1, '&:hover': { bgcolor: 'grey.100' } }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{texto}</Typography>
      <Typography aria-hidden sx={{ fontSize: 13 }}>
        →
      </Typography>
    </ButtonBase>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, mb: 2, flexWrap: 'wrap' }}
        >
          <Box>
            <Typography sx={{ color: 'white', fontSize: 11, mb: 0.5 }}>
              Mi perfil / Administración / Todo el marketplace
            </Typography>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
              Dashboard Admin
            </Typography>
          </Box>

          <Button variant="contained" {...destino('reportes')} sx={botonAzul}>
            Ver reportes
          </Button>
        </Stack>

        {cargando && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress aria-label="Cargando resumen" sx={{ color: 'white' }} />
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

        {!cargando && !error && datos && (
          <Stack spacing={1.5}>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              }}
            >
              <Indicador
                titulo="Ventas de octubre"
                valor={pesos(datos.ventas.monto)}
                detalle={`${numero.format(datos.ventas.pedidosPagados)} pedidos pagados · ${
                  datos.ventas.variacion > 0 ? '+' : ''
                }${datos.ventas.variacion} %`}
              />
              <Indicador
                titulo="Usuarios registrados"
                valor={numero.format(datos.usuarios.total)}
                detalle={`${numero.format(datos.usuarios.emprendedores)} emprendedores · ${numero.format(
                  datos.usuarios.administradores,
                )} admin.`}
              />
              <Indicador
                titulo="Publicaciones activas"
                valor={numero.format(datos.publicaciones.activas)}
                detalle={`${numero.format(datos.publicaciones.productos)} productos · ${numero.format(
                  datos.publicaciones.servicios,
                )} servicios`}
              />
              <Indicador
                titulo="Casos por resolver"
                valor={numero.format(datos.casos.porResolver)}
                detalle={`${datos.casos.enRevision} en revisión · ${datos.casos.aprobados} aprobados`}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 260px' },
                alignItems: 'start',
              }}
            >
              <Paper sx={{ p: 2, borderRadius: '10px' }}>
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center', pb: 0.5 }}>
                  <Typography component="h2" sx={{ fontSize: 18, fontWeight: 700 }}>
                    Actividad del marketplace
                  </Typography>
                  <ButtonBase
                    {...destino('pedidos')}
                    sx={{ fontSize: 12, fontWeight: 700, color: AZUL, borderRadius: 0.5 }}
                  >
                    Ver pedidos →
                  </ButtonBase>
                </Stack>
                <Divider />
                {datos.actividad.length === 0 && (
                  <Typography sx={{ fontSize: 12, color: '#707070', py: 2 }}>Aún no hay pedidos recientes.</Typography>
                )}
                {datos.actividad.map((p, i) => (
                  <PedidoReciente key={p.id} pedido={p} ultimo={i === datos.actividad.length - 1} />
                ))}
              </Paper>

              <Paper sx={{ p: 2, borderRadius: '10px' }}>
                <Stack spacing={1}>
                  <Typography component="h2" sx={{ fontSize: 18, fontWeight: 700 }}>
                    Pendientes de gestión
                  </Typography>

                  {filaPendiente(
                    'publicaciones',
                    datos.pendientes.publicacionesPorModerar,
                    'Publicaciones por moderar',
                    { bg: '#fff3d9', color: '#996200' },
                  )}
                  {filaPendiente(
                    'devoluciones',
                    datos.pendientes.devolucionesEnRevision,
                    'Devoluciones en revisión',
                    { bg: '#fff0ee', color: '#c23d35' },
                  )}
                  {filaPendiente(
                    'usuarios',
                    datos.pendientes.usuariosPorVerificar,
                    'Usuarios por verificar',
                    { bg: '#e8f4fd', color: AZUL },
                  )}

                  <Divider />

                  <Button variant="contained" {...destino('publicaciones')} sx={{ ...botonAzul, alignSelf: 'flex-start' }}>
                    Revisar publicaciones
                  </Button>

                  {filaEnlace('usuarios', 'Gestión de usuarios')}
                  {filaEnlace('categorias', 'Categorías del marketplace')}
                  {filaEnlace('pedidos', 'Ventas y pedidos')}

                  <Typography sx={{ fontSize: 11, color: '#707070' }}>
                    Actualizado: {fechaLarga(datos.actualizado)}
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          </Stack>
        )}
      </Container>

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={3000}
        onClose={(_, razon) => {
          if (razon !== 'clickaway') setAviso('')
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" onClose={() => setAviso('')}>
          {aviso}
        </Alert>
      </Snackbar>
    </Box>
  )
}
