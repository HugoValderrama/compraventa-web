import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import DatoClave from '../../components/atoms/DatoClave'
import ImagenServicio from '../../components/molecules/ImagenServicio'
import ProveedorCard from '../../components/molecules/ProveedorCard'
import ServicioPestanas from '../../components/organisms/ServicioPestanas'
import Pantalla from './Pantalla'
import { obtenerServicio } from '../../mocks/servicios'
import { AZUL } from '../../constants/colores'
import { precioServicio } from '../../utils/formatos'

// Acepta 18, '18' o 'Solo mayores de 18 años'.
const esSoloMayores = (servicio) => /18/.test(String(servicio.restriccionEdad ?? ''))

// Datos que recibe la pantalla de cotización (sin la foto, que puede pesar mucho).
const paraCotizacion = (s) => ({
  id: s.id,
  nombre: s.nombre,
  categoria: s.categoria,
  modalidad: s.modalidad,
  ubicacion: s.ubicacion,
  duracion: s.duracion,
  precio: s.precio,
  unidadCobro: s.unidadCobro,
  proveedor: s.proveedor,
})

function Detalle({ servicio, onContactar }) {
  const navigate = useNavigate()
  const pausado = servicio.estado === 'Pausado'

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        <Stack spacing={2}>
          <ImagenServicio foto={servicio.foto} nombre={servicio.nombre} />
          <ProveedorCard proveedor={servicio.proveedor} />
        </Stack>

        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              {servicio.nombre}
            </Typography>
            <Chip
              label={servicio.categoria}
              size="small"
              sx={{
                bgcolor: alpha(AZUL, 0.2),
                color: 'primary.dark',
                fontWeight: 600,
              }}
            />
          </Stack>

          <Typography sx={{ color: AZUL, fontWeight: 800, fontSize: 24 }}>
            {precioServicio(servicio)}
          </Typography>

          {esSoloMayores(servicio) && (
            <Alert severity="warning" sx={{ fontWeight: 600 }}>
              Solo mayores de 18 años
            </Alert>
          )}

          {pausado && (
            <Alert severity="info">
              Este servicio está pausado y no recibe solicitudes por ahora.
            </Alert>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            <DatoClave
              icono={AccessTimeOutlinedIcon}
              etiqueta="Duración"
              valor={servicio.duracion}
            />
            <DatoClave
              icono={LocationOnOutlinedIcon}
              etiqueta="Ubicación"
              valor={servicio.ubicacion}
            />
            <DatoClave
              icono={ComputerOutlinedIcon}
              etiqueta="Modalidad"
              valor={servicio.modalidad}
            />
            <DatoClave
              icono={Inventory2OutlinedIcon}
              etiqueta="Incluye"
              valor={servicio.incluye}
            />
          </Box>

          <Stack spacing={1}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={pausado}
              onClick={() => {
                const datos = paraCotizacion(servicio)
                console.log('[Servicios] Solicitar servicio', datos)
                navigate('/cotizaciones/nueva', { state: { servicio: datos } })
              }}
            >
              Solicitar servicio
            </Button>
            <Button variant="outlined" size="large" fullWidth onClick={onContactar}>
              Contactar proveedor
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      <ServicioPestanas servicio={servicio} />
    </Paper>
  )
}

function Contenido({ id }) {
  const navigate = useNavigate()
  const { key } = useLocation()
  const [carga, setCarga] = useState({ cargando: true, servicio: null, error: '' })
  const [aviso, setAviso] = useState(false)

  useEffect(() => {
    let vigente = true

    obtenerServicio(id)
      .then((servicio) => {
        if (vigente) setCarga({ cargando: false, servicio, error: '' })
      })
      .catch((err) => {
        if (vigente) {
          setCarga({ cargando: false, servicio: null, error: err.message })
        }
      })

    return () => {
      vigente = false
    }
  }, [id])

  return (
    <Pantalla volver destino={key === 'default' ? '/servicios' : -1}>
      {carga.cargando && (
        <Stack spacing={2} role="status" sx={{ alignItems: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'white' }} />
          <Typography sx={{ color: 'white' }}>Cargando servicio…</Typography>
        </Stack>
      )}

      {carga.error && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/servicios')}>
              Ir a servicios
            </Button>
          }
        >
          {carga.error}
        </Alert>
      )}

      {carga.servicio && (
        <Detalle
          servicio={carga.servicio}
          onContactar={() => {
            console.log('[Servicios] Contactar proveedor', {
              servicioId: carga.servicio.id,
              proveedor: carga.servicio.proveedor?.nombre,
            })
            setAviso(true)
          }}
        />
      )}

      <Snackbar
        open={aviso}
        autoHideDuration={4000}
        onClose={(_, motivo) => {
          if (motivo !== 'clickaway') setAviso(false)
        }}
      >
        <Alert severity="info" variant="filled" onClose={() => setAviso(false)}>
          Próximamente: podrás escribirle al proveedor desde Mensajería.
        </Alert>
      </Snackbar>
    </Pantalla>
  )
}

export default function ServicioDetalle() {
  const { id } = useParams()
  return <Contenido key={id} id={id} />
}
