import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import EstadoChip from '../../components/atoms/EstadoChip'
import { ESTADOS_COMPRA, listarCompras } from '../../mocks/compras'
import { formatearFecha, pesos } from '../../utils/formatos'
import PantallaCompras from './PantallaCompras'

const EN_CURSO = [
  ESTADOS_COMPRA.RECIBIDO,
  ESTADOS_COMPRA.PREPARACION,
  ESTADOS_COMPRA.ENVIADO,
]

const PESTANAS = [
  { clave: 'todas', etiqueta: 'Todas', coincide: () => true },
  { clave: 'curso', etiqueta: 'En curso', coincide: (c) => EN_CURSO.includes(c.estado) },
  {
    clave: 'entregadas',
    etiqueta: 'Entregadas',
    coincide: (c) => c.estado === ESTADOS_COMPRA.ENTREGADO,
  },
]

function Miniatura({ item }) {
  if (item.imagen) {
    return (
      <Box
        component="img"
        src={item.imagen}
        alt={item.nombre}
        sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }

  return (
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: 1,
        bgcolor: 'grey.200',
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      <Typography variant="caption">Sin imagen</Typography>
    </Box>
  )
}

export default function ComprasList() {
  const navigate = useNavigate()
  const [compras, setCompras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [pestana, setPestana] = useState('todas')

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError('')

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
  }, [intento])

  const actual = PESTANAS.find((p) => p.clave === pestana)
  const visibles = compras.filter(actual.coincide)
  const listo = !cargando && !error

  return (
    <PantallaCompras onBack={() => navigate('/perfil')}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}
      >
        <Typography variant="h5" sx={{ color: 'white' }}>
          Mis compras
        </Typography>

        <Tabs
          value={pestana}
          onChange={(_, valor) => setPestana(valor)}
          variant="scrollable"
          scrollButtons={false}
          slotProps={{ indicator: { sx: { display: 'none' } } }}
        >
          {PESTANAS.map((p) => (
            <Tab
              key={p.clave}
              value={p.clave}
              label={p.etiqueta}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 36,
                borderRadius: 999,
                color: 'white',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            />
          ))}
        </Tabs>
      </Stack>

      {cargando && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: 'white' }} aria-label="Cargando compras" />
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {listo && !compras.length && (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="h6">Aún no tienes compras</Typography>
            <Button variant="contained" onClick={() => navigate('/productos')}>
              Ir a productos
            </Button>
          </Stack>
        </Paper>
      )}

      {listo && compras.length > 0 && !visibles.length && (
        <Alert severity="info">No hay compras en esta categoría.</Alert>
      )}

      {listo &&
        visibles.map((c) => {
          const primero = c.items[0]
          const otros = c.items.length - 1

          return (
            <Paper key={c.id} sx={{ p: 2, mb: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ alignItems: { sm: 'center' } }}
              >
                <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                  <Miniatura item={primero} />

                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }}>Compra #{c.id}</Typography>

                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {primero.nombre}
                      {otros > 0 && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {' '}
                          y {otros} más
                        </Typography>
                      )}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {formatearFecha(c.fecha)} · {c.vendedor}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack spacing={0.25}>
                  <Typography sx={{ fontWeight: 700 }}>{pesos(c.total)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Envío: {pesos(c.envio)}
                  </Typography>
                </Stack>

                <Stack spacing={1} sx={{ alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                  <EstadoChip estado={c.estado} />
                  <Button variant="contained" onClick={() => navigate(`/compras/${c.id}`)}>
                    Ver detalle
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          )
        })}
    </PantallaCompras>
  )
}