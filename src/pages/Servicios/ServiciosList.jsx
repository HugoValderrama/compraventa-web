import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  CircularProgress,
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
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina'
import Pantalla from './Pantalla'
import {
  cambiarEstadoServicio,
  eliminarServicio,
  obtenerServicios,
} from '../../mocks/servicios'
import { AZUL } from '../../constants/colores'

const FILTROS = [
  { valor: 'todos', etiqueta: 'Todos', coincide: () => true },
  { valor: 'activos', etiqueta: 'Activos', coincide: (s) => s.estado === 'Activo' },
  { valor: 'pausados', etiqueta: 'Pausados', coincide: (s) => s.estado === 'Pausado' },
]

const ERROR_CARGA = 'No se pudieron cargar los servicios. Inténtalo nuevamente.'

// Textos del cuadro de confirmación según la acción pendiente.
function textosDialogo(pendiente) {
  if (!pendiente) return { titulo: '', mensaje: '', confirmar: '' }

  const { servicio, tipo } = pendiente

  if (tipo === 'eliminar') {
    return {
      titulo: `¿Eliminar “${servicio.nombre}”?`,
      mensaje: 'Esta acción no se puede deshacer.',
      confirmar: 'Eliminar servicio',
    }
  }

  if (servicio.estado === 'Activo') {
    return {
      titulo: `¿Pausar “${servicio.nombre}”?`,
      mensaje: 'El servicio dejará de estar disponible hasta que lo actives de nuevo.',
      confirmar: 'Pausar servicio',
    }
  }

  return {
    titulo: `¿Activar “${servicio.nombre}”?`,
    mensaje: 'El servicio volverá a estar disponible para otras personas.',
    confirmar: 'Activar servicio',
  }
}

export default function ServiciosList() {
  const navigate = useNavigate()
  const location = useLocation()
  const mensajeInicial = location.state?.mensaje ?? ''

  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [filtro, setFiltro] = useState('todos')

  // pendiente = { servicio, tipo: 'estado' | 'eliminar' }
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
        if (!vigente) return
        console.log('[Servicios] Listado cargado:', datos.length, 'servicios')
        setServicios(datos)
      })
      .catch(() => {
        if (!vigente) return
        console.log('[Servicios] Error al cargar el listado')
        setError(ERROR_CARGA)
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

  const pedirConfirmacion = (servicio, tipo) => {
    setPendiente({ servicio, tipo })
    setDialogo(true)
  }

  const confirmar = async () => {
    if (!pendiente) return

    const { servicio, tipo } = pendiente
    setProcesando(true)

    try {
      if (tipo === 'eliminar') {
        console.log('[Servicios] Eliminando servicio', {
          id: servicio.id,
          nombre: servicio.nombre,
        })
        await eliminarServicio(servicio.id)
        setServicios((lista) => lista.filter((s) => s.id !== servicio.id))
        console.log('[Servicios] Servicio eliminado', { id: servicio.id })
        mostrarAviso('success', 'Servicio eliminado.')
      } else {
        const nuevoEstado = servicio.estado === 'Activo' ? 'Pausado' : 'Activo'
        console.log('[Servicios] Cambiando estado', {
          id: servicio.id,
          de: servicio.estado,
          a: nuevoEstado,
        })
        const actualizado = await cambiarEstadoServicio(servicio.id, nuevoEstado)
        setServicios((lista) =>
          lista.map((s) => (s.id === actualizado.id ? actualizado : s))
        )
        console.log('[Servicios] Estado actualizado', {
          id: actualizado.id,
          estado: actualizado.estado,
        })
        mostrarAviso(
          'success',
          nuevoEstado === 'Pausado' ? 'Servicio pausado.' : 'Servicio activado.'
        )
      }
    } catch (err) {
      console.log('[Servicios] Error en la operación:', err.message)
      mostrarAviso('error', err.message)
    } finally {
      setProcesando(false)
      setDialogo(false)
    }
  }

  const filtroActual = FILTROS.find((f) => f.valor === filtro)
  const visibles = servicios.filter(filtroActual.coincide)
  const textos = textosDialogo(pendiente)

  return (
    <Pantalla>
      <EncabezadoPagina
        titulo="Mis Servicios"
        accion={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/servicios/nuevo')}
          >
            Crear servicio
          </Button>
        }
      />

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
              onVer={(servicio) => navigate(`/servicios/${servicio.id}`)}
              onEditar={(servicio) => navigate(`/servicios/${servicio.id}/editar`)}
              onCambiarEstado={(servicio) => pedirConfirmacion(servicio, 'estado')}
              onEliminar={(servicio) => pedirConfirmacion(servicio, 'eliminar')}
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
        titulo={textos.titulo}
        mensaje={textos.mensaje}
        textoConfirmar={textos.confirmar}
        colorConfirmar={pendiente?.tipo === 'eliminar' ? 'error' : 'primary'}
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
