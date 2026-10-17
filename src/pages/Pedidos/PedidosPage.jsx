import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import EstadoChip from '../../components/atoms/EstadoChip'
import { listarPedidos } from '../../mocks/pedidos'
import { formatearFechaHora, pesos } from '../../utils/formatos'
import PedidoDetalle from './PedidoDetalle'

function Lista() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

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
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
          Pedidos recibidos
        </Typography>

        {cargando && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress sx={{ color: 'white' }} aria-label="Cargando pedidos" />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!cargando && !error && !pedidos.length && (
          <Alert severity="info">Aún no tienes pedidos.</Alert>
        )}

        {pedidos.map((p) => (
          <Paper key={p.id} sx={{ p: 2, mb: 2 }}>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 600 }}>
                #{p.id} · {p.cliente.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatearFechaHora(p.fecha)} · {pesos(p.total)}
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <EstadoChip
                  estado={p.estado}
                  etiqueta={p.estado === 'Recibido' ? 'Por preparar' : undefined}
                />
                <Button variant="contained" onClick={() => navigate(`/pedidos/${p.id}`)}>
                  Ver detalle
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Container>
    </Box>
  )
}

// key: reinicia el formulario al cambiar de pedido
function DetalleRuta() {
  const { id } = useParams()
  return <PedidoDetalle key={id} id={id} />
}

export default function PedidosPage() {
  return (
    <Routes>
      <Route index element={<Lista />} />
      <Route path=":id" element={<DetalleRuta />} />
      <Route path="*" element={<Navigate to="/pedidos" replace />} />
    </Routes>
  )
}