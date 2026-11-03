import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Chip, Container, Snackbar, Stack, Typography } from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import { ESTADOS, obtenerSolicitudes } from '../../mocks/cotizacionesRecibidas'
import SolicitudesList from './SolicitudesList'
import ResponderCotizacion from './ResponderCotizacion'

const FILTROS = {
  Todas: null,
  Pendientes: ESTADOS.PENDIENTE,
  Respondidas: ESTADOS.RESPONDIDA,
  Aceptadas: ESTADOS.ACEPTADA,
  Expiradas: ESTADOS.EXPIRADA,
}

function Paneles({
  solicitudes,
  cargando,
  error,
  onReintentar,
  filtro,
  onFiltro,
  onRespondida,
}) {
  const { id } = useParams()
  const navigate = useNavigate()

  const seleccionada = solicitudes.find((s) => s.id === id) ?? null
  const noEncontrada = Boolean(id) && !cargando && !error && !seleccionada
  const estadoFiltro = FILTROS[filtro]
  const visibles = estadoFiltro
    ? solicitudes.filter((s) => s.estado === estadoFiltro)
    : solicitudes

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 5fr) minmax(0, 8fr)' },
        alignItems: 'start',
      }}
    >
      <SolicitudesList
        solicitudes={visibles}
        filtros={Object.keys(FILTROS)}
        filtro={filtro}
        onFiltro={onFiltro}
        seleccionadaId={id}
        cargando={cargando}
        error={error}
        onReintentar={onReintentar}
        onVer={(sol) => navigate(`/cotizaciones-recibidas/${sol.id}`)}
      />

      <ResponderCotizacion
        solicitud={seleccionada}
        noEncontrada={noEncontrada}
        cargando={cargando}
        onRespondida={onRespondida}
      />
    </Box>
  )
}

export default function CotizacionesRecibidasPage() {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [filtro, setFiltro] = useState('Todas')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError('')

    obtenerSolicitudes()
      .then((datos) => {
        if (activo) setSolicitudes(datos)
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

  const pendientes = solicitudes.filter((s) => s.estado === ESTADOS.PENDIENTE).length

  const handleRespondida = (actualizada) => {
    setSolicitudes((actuales) =>
      actuales.map((s) => (s.id === actualizada.id ? actualizada : s))
    )
    setAviso(`Cotización enviada a ${actualizada.cliente.nombre}.`)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography
        variant="caption"
        sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mb: 0.5 }}
        >
        Mi perfil / Taller Tierra / Emprendedor
        {/* TODO: conectar API (nombre del taller) */}
        </Typography>

        <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}
        >
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
            Cotizaciones Recibidas
        </Typography>

        {!cargando && !error && (
            <Chip
            label={`${pendientes} por responder`}
            size="small"
            sx={{ bgcolor: '#E3F2FD', color: 'primary.main', fontWeight: 600 }}
            />
        )}
        </Stack>

        <Routes>
          {['/', ':id'].map((ruta) => (
            <Route
              key={ruta}
              index={ruta === '/'}
              path={ruta === '/' ? undefined : ruta}
              element={
                <Paneles
                  solicitudes={solicitudes}
                  cargando={cargando}
                  error={error}
                  onReintentar={() => setIntento((n) => n + 1)}
                  filtro={filtro}
                  onFiltro={setFiltro}
                  onRespondida={handleRespondida}
                />
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/cotizaciones-recibidas" replace />} />
        </Routes>
      </Container>

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={4000}
        onClose={() => setAviso('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setAviso('')}>
          {aviso}
        </Alert>
      </Snackbar>
    </Box>
  )
}