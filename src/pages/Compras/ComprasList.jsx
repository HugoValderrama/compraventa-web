import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { listarCompras } from '../../mocks/compras'
import { formatearFecha, pesos } from '../../utils/formatos'

export default function ComprasList() {
  const navigate = useNavigate()
  const [compras, setCompras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    listarCompras()
      .then((datos) => {
        if (activo) setCompras(datos)
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar las compras.')
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
          Mis compras
        </Typography>

        {cargando && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress sx={{ color: 'white' }} aria-label="Cargando compras" />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!cargando && !error && !compras.length && (
          <Alert severity="info">Aún no tienes compras.</Alert>
        )}

        {compras.map((c) => (
          <Paper key={c.id} sx={{ p: 2, mb: 2 }}>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 600 }}>
                Compra #{c.id} · {c.vendedor}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatearFecha(c.fecha)} · {pesos(c.total)}
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <EstadoChip estado={c.estado} />
                <Button variant="contained" onClick={() => navigate(`/compras/${c.id}`)}>
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