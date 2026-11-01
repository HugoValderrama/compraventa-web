import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { FaMapMarkerAlt, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import TopNavBar from '../../components/organisms/TopNavBar'

const CLAVE = 'laguito-libre.direcciones.v1'

const DIRECCIONES_DEFECTO = [
  { id: '1', titulo: 'Casa', calle: 'Av. Principal 123, Depto 4B', ciudad: 'Osorno', region: 'Los Lagos', principal: true },
  { id: '2', titulo: 'Trabajo', calle: 'Calle Secundaria 456', ciudad: 'Osorno', region: 'Los Lagos', principal: false }
]

function cargar() {
  try {
    const texto = window.localStorage.getItem(CLAVE)
    const direcciones = texto === null ? DIRECCIONES_DEFECTO : JSON.parse(texto)

    if (!Array.isArray(direcciones)) {
      throw new Error('Datos inválidos')
    }

    return { direcciones, error: '' }
  } catch {
    // Si hay datos corruptos que rompen la página, los limpia y carga los de por defecto
    window.localStorage.removeItem(CLAVE)
    return {
      direcciones: DIRECCIONES_DEFECTO,
      error: 'Se limpiaron datos antiguos con errores. Ya puedes agregar direcciones nuevamente.',
    }
  }
}

function Pantalla({ children, volver = false }) {
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar
        showBack={volver}
        onBack={() => navigate(-1)}
      />

      <Container maxWidth="md" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  )
}

export default function MisDireccionesPage() {
  const [datos, setDatos] = useState(cargar)
  const [openModal, setOpenModal] = useState(false)
  const [direccionEditando, setDireccionEditando] = useState(null)

  const guardar = (nuevasDirecciones) => {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(nuevasDirecciones))
      setDatos({ direcciones: nuevasDirecciones, error: '' })
    } catch {
      setDatos((prev) => ({ ...prev, error: 'No se pudo guardar. Revisa el almacenamiento del navegador.' }))
    }
  }

  const handleAbrirModal = (direccion = null) => {
    setDireccionEditando(direccion)
    setOpenModal(true)
  }

  const handleCerrarModal = () => {
    setOpenModal(false)
    setDireccionEditando(null)
  }

  const handleGuardar = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const titulo = formData.get('titulo').trim()
    const calle = formData.get('calle').trim()
    const ciudad = formData.get('ciudad').trim()
    const region = formData.get('region').trim()

    if (!titulo || !calle || !ciudad || !region) return // Evitar guardar si hay campos vacíos

    const nuevaDireccion = {
      // Usamos Date.now() para un ID único seguro sin depender de crypto.randomUUID
      id: direccionEditando ? direccionEditando.id : String(Date.now()),
      titulo,
      calle,
      ciudad,
      region,
      principal: direccionEditando ? direccionEditando.principal : datos.direcciones.length === 0,
    }

    if (direccionEditando) {
      guardar(datos.direcciones.map(d => d.id === nuevaDireccion.id ? nuevaDireccion : d))
    } else {
      guardar([...datos.direcciones, nuevaDireccion])
    }
    handleCerrarModal()
  }

  const handleEliminar = (id) => {
    const filtradas = datos.direcciones.filter(d => d.id !== id)
    
    // Si eliminamos la principal, le asignamos el estado principal a la siguiente disponible
    if (datos.direcciones.find(d => d.id === id)?.principal && filtradas.length > 0) {
      filtradas[0].principal = true
    }
    
    guardar(filtradas)
  }

  const handleFijarPrincipal = (id) => {
    guardar(datos.direcciones.map(d => ({
      ...d,
      principal: d.id === id
    })))
  }

  return (
    <Pantalla volver>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', mb: 3 }}
      >
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
          Mis direcciones
        </Typography>

        <Button
          variant="contained"
          disabled={Boolean(datos.error && datos.direcciones.length === 0)}
          startIcon={<FaPlus />}
          onClick={() => handleAbrirModal()}
          sx={{ bgcolor: '#62A7F5', '&:hover': { bgcolor: '#4B94E6' }, fontWeight: 600, textTransform: 'none' }}
        >
          Agregar dirección
        </Button>
      </Stack>

      {datos.error && <Alert severity="info" sx={{ mb: 3 }}>{datos.error}</Alert>}

      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Grid container spacing={3}>
          {datos.direcciones.map((dir) => (
            <Grid item xs={12} sm={6} key={dir.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderColor: dir.principal ? '#62A7F5' : '#e0e0e0',
                  borderWidth: dir.principal ? 2 : 1,
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {dir.principal && (
                  <Chip
                    label="Principal"
                    size="small"
                    sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 700 }}
                  />
                )}

                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2, flexGrow: 1 }}>
                  <Box sx={{ color: '#62A7F5', mt: 0.5 }}>
                    <FaMapMarkerAlt size={20} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, mb: 0.5, color: '#081A19' }}>
                      {dir.titulo}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666', fontWeight: 500 }}>
                      {dir.calle}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666', fontWeight: 500 }}>
                      {dir.ciudad}, Región de {dir.region}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ pt: 2, borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: 1 }}
                >
                  <Button
                    size="small"
                    startIcon={<FaEdit />}
                    onClick={() => handleAbrirModal(dir)}
                    sx={{ textTransform: 'none', fontWeight: 600, color: '#62A7F5' }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<FaTrash />}
                    onClick={() => handleEliminar(dir.id)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Eliminar
                  </Button>
                  
                  {!dir.principal && (
                    <Button
                      size="small"
                      onClick={() => handleFijarPrincipal(dir.id)}
                      sx={{ textTransform: 'none', fontWeight: 600, ml: 'auto !important', color: '#B5B0B0' }}
                    >
                      Fijar principal
                    </Button>
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}

          {!datos.error && !datos.direcciones.length && (
            <Grid item xs={12}>
              <Alert severity="info">
                Aún no tienes direcciones guardadas.
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Modal / Dialog para CRUD */}
      <Dialog
        open={openModal}
        onClose={handleCerrarModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <Box component="form" onSubmit={handleGuardar}>
          <DialogTitle sx={{ fontWeight: 800, color: '#081A19' }}>
            {direccionEditando ? 'Editar dirección' : 'Agregar nueva dirección'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                name="titulo"
                label="Nombre descriptivo (Ej: Casa, Trabajo)"
                fullWidth
                required
                size="small"
                defaultValue={direccionEditando?.titulo || ''}
              />
              <TextField
                name="calle"
                label="Calle y número"
                fullWidth
                required
                size="small"
                defaultValue={direccionEditando?.calle || ''}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  name="ciudad"
                  label="Ciudad"
                  fullWidth
                  required
                  size="small"
                  defaultValue={direccionEditando?.ciudad || ''}
                />
                <TextField
                  name="region"
                  label="Región"
                  fullWidth
                  required
                  size="small"
                  defaultValue={direccionEditando?.region || ''}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCerrarModal} sx={{ color: '#B5B0B0', fontWeight: 600, textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#62A7F5', '&:hover': { bgcolor: '#4B94E6' }, fontWeight: 600, textTransform: 'none' }}>
              Guardar dirección
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Pantalla>
  )
}