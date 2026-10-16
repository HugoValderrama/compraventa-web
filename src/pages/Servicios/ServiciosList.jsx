import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Alert,
  Breadcrumbs,
  Button,
  CircularProgress,
  Link,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined'
import ServicioCard from '../../components/molecules/ServicioCard'
import ConfirmarDialog from '../../components/molecules/ConfirmarDialog'
import Pantalla from './Pantalla'
import { cambiarEstadoServicio, obtenerServicios } from '../../mocks/servicios'
import { AZUL } from '../../constants/colores'

const FILTROS = [
  { valor: 'todos', etiqueta: 'Todos', coincide: () => true },
  { valor: 'activos', etiqueta: 'Activos', coincide: (s) => s.estado === 'Activo' },
  { valor: 'pausados', etiqueta: 'Pausados', coincide: (s) => s.estado === 'Pausado' },
]

// TODO: conectar API (nombre del taller del emprendedor autenticado)
const NOMBRE_TALLER = 'Taller Tierra'

const ERROR_CARGA = 'No se pudieron cargar los servicios. Inténtalo nuevamente.'

export default function ServiciosList() {
  const navigate = useNavigate()
  const location = useLocation()
  const mensajeInicial = location.state?.mensaje ?? ''

  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [filtro, setFiltro] = useState('todos')

  const [pendiente, setPendiente] = useState(null)
  const [dialogo, setDialogo] = useState(false)
  const [procesando, setProcesando] = useState(false)

  const [aviso, setAviso] = useState({
    abierto: Boolean(mensajeInicial),
    severidad: 'success',
    mensaje: mensajeInicial,
  })

  useEffect(() => {
    let vigente = true

    obtenerServicios()
      .then((datos) => {
        if (vigente) setServicios(datos)
      })
      .catch(() => {
        if (vigente) setError(ERROR_CARGA)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [intento])

  const reintentar = () => {
    setError('')
    setCargando(true)
    setIntento((n) => n + 1)
  }

  const mostrarAviso = (severidad, mensaje) =>
    setAviso({ abierto: true, severidad, mensaje })

  const pedirConfirmacion = (servicio) => {
    setPendiente(servicio)
    setDialogo(true)
  }

  const confirmar = async () => {
    if (!pendiente) return

    const nuevoEstado = pendiente.estado === 'Activo' ? 'Pausado' : 'Activo'
    setProcesando(true)

    try {
      const actualizado = await cambiarEstadoServicio(pendiente.id, nuevoEstado)
      setServicios((lista) =>
        lista.map((s) => (s.id === actualizado.id ? actualizado : s))
      )
      mostrarAviso(
        'success',
        nuevoEstado === 'Pausado' ? 'Servicio pausado.' : 'Servicio activado.'
      )
    } catch (err) {
      mostrarAviso('error', err.message)
    } finally {
      setProcesando(false)
      setDialogo(false)
    }
  }

  const filtroActual = FILTROS.find((f) => f.valor === filtro)
  const visibles = servicios.filter(filtroActual.coincide)
  const pausando = pendiente?.estado === 'Activo'

  return (
    <Pantalla>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, mb: 3 }}
      >
        <Stack spacing={0.5}>
          <Breadcrumbs
            separator="/"
            aria-label="Ruta de navegación"
            sx={{ color: 'white', fontSize: 12 }}
          >
            <Link
              component="button"
              type="button"
              underline="hover"
              color="inherit"
              sx={{ fontSize: 12 }}
              onClick={() => navigate('/perfilE')}
            >
              Mi perfil
            </Link>
            <Typography color="inherit" sx={{ fontSize: 12 }}>
              {NOMBRE_TALLER}
            </Typography>
            <Typography color="inherit" sx={{ fontSize: 12 }}>
              Emprendedor
            </Typography>
          </Breadcrumbs>

          <Typography variant="h5" sx={{ color: 'white' }}>
            Mis Servicios
          </Typography>
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/servicios/nuevo')}
        >
          Crear servicio
        </Button>
      </Stack>

      {cargando && (
        <Stack spacing={2} role="status" sx={{ alignItems: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'white' }} />
          <Typography sx={{ color: 'white' }}>Cargando servicios…</Typography>
        </Stack>
      )}

      {!cargando && error && (
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

      {!cargando && !error && servicios.length === 0 && (
        <Paper sx={{ p: 4 }}>
          <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <HandymanOutlinedIcon sx={{ color: AZUL, fontSize: 48 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Aún no tienes servicios
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Publica tu primer servicio para que otras personas puedan contratarlo.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/servicios/nuevo')}>
              Crear mi primer servicio
            </Button>
          </Stack>
        </Paper>
      )}

      {!cargando && !error && servicios.length > 0 && (
        <>
          <Tabs
            value={filtro}
            onChange={(_, valor) => setFiltro(valor)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Filtrar servicios por estado"
            slotProps={{ indicator: { sx: { display: 'none' } } }}
            sx={{ mb: 2 }}
          >
            {FILTROS.map((f) => (
              <Tab
                key={f.valor}
                value={f.valor}
                label={`${f.etiqueta} (${servicios.filter(f.coincide).length})`}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 36,
                  mr: 1,
                  borderRadius: 999,
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                }}
              />
            ))}
          </Tabs>

          {visibles.map((s) => (
            <ServicioCard
              key={s.id}
              servicio={s}
              onEditar={(servicio) => navigate(`/servicios/${servicio.id}/editar`)}
              onCambiarEstado={pedirConfirmacion}
            />
          ))}

          {visibles.length === 0 && (
            <Alert severity="info">
              No tienes servicios {filtro === 'activos' ? 'activos' : 'pausados'} por ahora.
            </Alert>
          )}

          <Typography variant="body2" sx={{ color: 'white', mt: 2 }}>
            Mostrando {visibles.length} de {servicios.length}{' '}
            {servicios.length === 1 ? 'servicio' : 'servicios'} · Precios en pesos
            chilenos (CLP)
          </Typography>
        </>
      )}

      <ConfirmarDialog
        abierto={dialogo}
        titulo={`¿${pausando ? 'Pausar' : 'Activar'} “${pendiente?.nombre ?? ''}”?`}
        mensaje={
          pausando
            ? 'El servicio dejará de estar disponible hasta que lo actives de nuevo.'
            : 'El servicio volverá a estar disponible para otras personas.'
        }
        textoConfirmar={pausando ? 'Pausar servicio' : 'Activar servicio'}
        cargando={procesando}
        onConfirmar={confirmar}
        onCancelar={() => setDialogo(false)}
      />

      <Snackbar
        open={aviso.abierto}
        autoHideDuration={4000}
        onClose={(_, motivo) => {
          if (motivo !== 'clickaway') setAviso((a) => ({ ...a, abierto: false }))
        }}
      >
        <Alert
          severity={aviso.severidad}
          variant="filled"
          onClose={() => setAviso((a) => ({ ...a, abierto: false }))}
        >
          {aviso.mensaje}
        </Alert>
      </Snackbar>
    </Pantalla>
  )
}