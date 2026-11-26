import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { FaMapMarkerAlt, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import TopNavBar from '../../components/organisms/TopNavBar'

const API_BASE = 'http://localhost:7173/api'


function obtenerToken() {
  return (
    window.localStorage.getItem('token') ||
    window.localStorage.getItem('jwt') ||
    window.localStorage.getItem('accessToken') ||
    ''
  )
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
  const [direcciones, setDirecciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [openModal, setOpenModal] = useState(false)
  const [direccionEditando, setDireccionEditando] = useState(null)

  const [regiones, setRegiones] = useState([])
  const [provincias, setProvincias] = useState([])
  const [comunas, setComunas] = useState([])

  const [regionId, setRegionId] = useState('')
  const [provinciaId, setProvinciaId] = useState('')
  const [comunaId, setComunaId] = useState('')
  const [numero, setNumero] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')

  const headersAuth = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${obtenerToken()}`,
  }), [])

  const cargarDirecciones = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/direcciones`, {
        headers: headersAuth(),
      })
      if (res.status === 401) {
        throw new Error('Tu sesión expiró o no has iniciado sesión.')
      }
      if (!res.ok) {
        throw new Error('No se pudieron cargar tus direcciones desde el servidor.')
      }
      const data = await res.json()
      setDirecciones(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [headersAuth])

  useEffect(() => {
    cargarDirecciones()
    fetch(`${API_BASE}/ubicaciones/regiones`)
      .then((res) => res.json())
      .then(setRegiones)
      .catch(console.error)
  }, [cargarDirecciones])

  useEffect(() => {
    if (!regionId) {
      setProvincias([])
      return
    }
    fetch(`${API_BASE}/ubicaciones/regiones/${regionId}/provincias`)
      .then((res) => res.json())
      .then(setProvincias)
      .catch(console.error)
  }, [regionId])

  useEffect(() => {
    if (!provinciaId) {
      setComunas([])
      return
    }
    fetch(`${API_BASE}/ubicaciones/provincias/${provinciaId}/comunas`)
      .then((res) => res.json())
      .then(setComunas)
      .catch(console.error)
  }, [provinciaId])

  const handleAbrirModal = (direccion = null) => {
    setDireccionEditando(direccion)
    if (direccion) {
      setRegionId(direccion.regionId || '')
      setProvinciaId(direccion.provinciaId || '')
      setComunaId(direccion.comunaId || '')
      setNumero(direccion.numero ? String(direccion.numero) : '')
      setCodigoPostal(direccion.codigoPostal ? String(direccion.codigoPostal) : '')
    } else {
      setRegionId('')
      setProvinciaId('')
      setComunaId('')
      setNumero('')
      setCodigoPostal('')
    }
    setOpenModal(true)
  }

  const handleCerrarModal = () => {
    setOpenModal(false)
    setDireccionEditando(null)
    setRegionId('')
    setProvinciaId('')
    setComunaId('')
    setNumero('')
    setCodigoPostal('')
  }

  const soloNumeros = (valor, maxLen) => valor.replace(/\D/g, '').slice(0, maxLen)

  const handleGuardar = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const calle = formData.get('calle').trim()
    const numeroInt = Number(numero)
    const departamento = formData.get('departamento')?.trim() || null
    const codigoPostalInt = Number(codigoPostal)

    if (!calle || !numeroInt || !comunaId || !codigoPostalInt) return

    setGuardando(true)
    setError('')

    const payload = {
      calle,
      numero: numeroInt,
      departamento,
      comunaId: Number(comunaId),
      codigoPostal: codigoPostalInt,
    }

    try {
      const url = direccionEditando
        ? `${API_BASE}/direcciones/${direccionEditando.id}`
        : `${API_BASE}/direcciones`

      const method = direccionEditando ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: headersAuth(),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.mensaje || 'Error al guardar la dirección en la base de datos.')
      }

      handleCerrarModal()
      await cargarDirecciones()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (id) => {
    setError('')
    try {
      const res = await fetch(`${API_BASE}/direcciones/${id}`, {
        method: 'DELETE',
        headers: headersAuth(),
      })

      if (!res.ok) {
        throw new Error('No se pudo eliminar la dirección.')
      }

      await cargarDirecciones()
    } catch (err) {
      setError(err.message)
    }
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
          startIcon={<FaPlus />}
          onClick={() => handleAbrirModal()}
          sx={{ bgcolor: '#62A7F5', '&:hover': { bgcolor: '#4B94E6' }, fontWeight: 600, textTransform: 'none' }}
        >
          Agregar dirección
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {direcciones.map((dir) => (
              <Grid item xs={12} sm={6} key={dir.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    borderColor: '#e0e0e0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2, flexGrow: 1 }}>
                    <Box sx={{ color: '#62A7F5', mt: 0.5 }}>
                      <FaMapMarkerAlt size={20} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, mb: 0.5, color: '#081A19' }}>
                        {dir.calle} #{dir.numero}
                        {dir.departamento ? `, Depto ${dir.departamento}` : ''}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666666', fontWeight: 500 }}>
                        {dir.comuna}, Provincia de {dir.provincia}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666666', fontWeight: 500 }}>
                        Región de {dir.region} (CP: {dir.codigoPostal})
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
                  </Stack>
                </Paper>
              </Grid>
            ))}

            {!error && !direcciones.length && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Aún no tienes direcciones guardadas en tu cuenta.
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>

      <Dialog
        open={openModal}
        onClose={handleCerrarModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <Box component="form" onSubmit={handleGuardar} key={direccionEditando?.id || 'nueva'}>
          <DialogTitle sx={{ fontWeight: 800, color: '#081A19' }}>
            {direccionEditando ? 'Editar dirección' : 'Agregar nueva dirección'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  name="calle"
                  label="Calle"
                  fullWidth
                  required
                  size="small"
                  inputProps={{ maxLength: 30 }}
                  defaultValue={direccionEditando?.calle || ''}
                />
                <TextField
                  name="numero"
                  label="Número"
                  type="text"
                  required
                  size="small"
                  value={numero}
                  onChange={(e) => setNumero(soloNumeros(e.target.value, 9))}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  sx={{ width: { xs: '100%', sm: '140px' } }}
                />
                <TextField
                  name="departamento"
                  label="Depto (opc.)"
                  size="small"
                  inputProps={{ maxLength: 5 }}
                  sx={{ width: { xs: '100%', sm: '140px' } }}
                  defaultValue={direccionEditando?.departamento || ''}
                />
              </Stack>

              <TextField
                select
                label="Región"
                fullWidth
                required
                size="small"
                value={regionId}
                onChange={(e) => {
                  setRegionId(e.target.value)
                  setProvinciaId('')
                  setComunaId('')
                }}
              >
                {regiones.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.nombre}</MenuItem>
                ))}
              </TextField>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Provincia"
                  fullWidth
                  required
                  size="small"
                  disabled={!regionId}
                  value={provinciaId}
                  onChange={(e) => {
                    setProvinciaId(e.target.value)
                    setComunaId('')
                  }}
                >
                  {provincias.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Comuna"
                  fullWidth
                  required
                  size="small"
                  disabled={!provinciaId}
                  value={comunaId}
                  onChange={(e) => setComunaId(e.target.value)}
                >
                  {comunas.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                  ))}
                </TextField>
              </Stack>

              <TextField
                name="codigoPostal"
                label="Código Postal"
                type="text"
                fullWidth
                required
                size="small"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(soloNumeros(e.target.value, 7))}
                inputProps={{ maxLength: 7, inputMode: 'numeric', pattern: '[0-9]{7}' }}
                helperText="Ingresa los 7 dígitos del código postal de Chile"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCerrarModal} disabled={guardando} sx={{ color: '#B5B0B0', fontWeight: 600, textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={guardando} sx={{ bgcolor: '#62A7F5', '&:hover': { bgcolor: '#4B94E6' }, fontWeight: 600, textTransform: 'none' }}>
              {guardando ? 'Guardando...' : 'Guardar dirección'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Pantalla>
  )
}
