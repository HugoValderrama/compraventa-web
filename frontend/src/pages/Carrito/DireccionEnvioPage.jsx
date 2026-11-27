import * as React from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert, Box, Button, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, MenuItem,
  Paper, Radio, RadioGroup, Snackbar, Stack, Step, StepLabel, Stepper,
  TextField, Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import { CLAVE_PRODUCTOS, cargarCatalogo, pesos } from '../Catalogo/catalogo.js'
import { cargarCarrito, resumirCarrito, suscribirCarrito } from './carrito.js'
import {
  guardarDireccionApi,
  guardarSeleccionadaId,
  obtenerComunasApi,
  obtenerDireccionesApi,
  obtenerLimitesApi,
  obtenerProvinciasApi,
  obtenerRegionesApi,
  obtenerSeleccionadaId,
  prepararEnvio,
} from './direcciones.js'

const AZUL = '#008FFF'

function Icono({ editar = false }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {editar ? <><path d="m14 5 5 5M5 19l4-1L20 7a2.1 2.1 0 0 0-3-3L6 15l-1 4Z" /><path d="M12 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7" /></> : <path d="M12 3v18M3 12h18" />}
    </svg>
  )
}

function ImagenResumen({ producto }) {
  const [fallida, setFallida] = React.useState('')
  const src = producto?.imagen ?? ''
  return (
    <Box sx={{ width: 48, height: 48, flexShrink: 0, bgcolor: '#858585', borderRadius: 1.5, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
      {src && src !== fallida
        ? <Box component="img" src={src} alt={producto.nombre} onError={() => setFallida(src)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <Typography sx={{ color: 'white', fontSize: 10, textAlign: 'center', px: 0.5 }}>Sin imagen</Typography>}
    </Box>
  )
}

function ResumenCompra({ resumen }) {
  const importe = resumen.subtotal === null ? 'Por confirmar' : pesos(resumen.subtotal)
  return (
    <Paper component="aside" elevation={0} aria-labelledby="resumen-compra-titulo" sx={{ p: 2.5, borderRadius: 2, alignSelf: 'start' }}>
      <Typography id="resumen-compra-titulo" component="h2" sx={{ fontWeight: 700, mb: 2 }}>Resumen de Compra</Typography>
      <Stack spacing={1.5}>
        {!resumen.lineas.length && <Typography variant="body2" color="text.secondary">Tu carrito está vacío.</Typography>}
        {resumen.lineas.map((linea) => (
          <Stack key={linea.id} direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
            <ImagenResumen producto={linea.producto} />
            <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{linea.producto?.nombre ?? 'Producto no disponible'}</Typography>
              <Typography variant="caption" color="text.secondary">Cant: {linea.cantidad}</Typography>
              {linea.problema && <Typography variant="caption" color="error" sx={{ display: 'block' }}>{linea.problema}</Typography>}
            </Box>
          </Stack>
        ))}
      </Stack>
      <Divider sx={{ my: 2.5 }} />
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">Productos</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{importe}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">Despacho</Typography><Typography variant="body2" color="text.secondary">Por confirmar</Typography>
        </Stack>
      </Stack>
      <Divider sx={{ my: 2.5 }} />
      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>Total de productos</Typography><Typography sx={{ color: AZUL, fontWeight: 800, fontSize: 20 }}>{importe}</Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>El total final incluirá el despacho.</Typography>
    </Paper>
  )
}

export default function DireccionEnvioPage({ onContinuarPago }) {
  const navigate = useNavigate()
  const [direcciones, setDirecciones] = React.useState([])
  const [seleccionadaId, setSeleccionadaId] = React.useState(() => obtenerSeleccionadaId())
  const [cargandoDirecciones, setCargandoDirecciones] = React.useState(true)
  const [errorDirecciones, setErrorDirecciones] = React.useState('')

  const [carrito, setCarrito] = React.useState(() => cargarCarrito())
  const [catalogo, setCatalogo] = React.useState(() => cargarCatalogo())

  const [openModal, setOpenModal] = React.useState(false)
  const [editandoId, setEditandoId] = React.useState(null)
  const [guardando, setGuardando] = React.useState(false)
  const [errorGuardar, setErrorGuardar] = React.useState('')
  const [aviso, setAviso] = React.useState(null)
  const [continuando, setContinuando] = React.useState(false)

  // Estados del formulario de dirección (conectados a PostgreSQL)
  const [limites, setLimites] = React.useState({})
  const [regiones, setRegiones] = React.useState([])
  const [provincias, setProvincias] = React.useState([])
  const [comunas, setComunas] = React.useState([])

  const [calle, setCalle] = React.useState('')
  const [numero, setNumero] = React.useState('')
  const [departamento, setDepartamento] = React.useState('')
  const [regionId, setRegionId] = React.useState('')
  const [provinciaId, setProvinciaId] = React.useState('')
  const [comunaId, setComunaId] = React.useState('')
  const [codigoPostal, setCodigoPostal] = React.useState('')

  const resumen = resumirCarrito(carrito.items, catalogo.productos)
  const direccionActual = direcciones.find((item) => String(item.id) === String(seleccionadaId))
  const errorCarrito = carrito.error || catalogo.error
  const puedeContinuar = !errorDirecciones && !errorCarrito && resumen.puedeContinuar && Boolean(direccionActual)

  const cargarListaDirecciones = React.useCallback(async () => {
    setCargandoDirecciones(true)
    setErrorDirecciones('')
    try {
      const lista = await obtenerDireccionesApi()
      setDirecciones(lista)
      setSeleccionadaId((prev) => {
        if (prev && lista.some((d) => String(d.id) === String(prev))) return prev
        const primera = lista[0]?.id || ''
        guardarSeleccionadaId(primera)
        return primera
      })
    } catch (err) {
      setErrorDirecciones(err.message)
    } finally {
      setCargandoDirecciones(false)
    }
  }, [])

  React.useEffect(() => {
    cargarListaDirecciones()
    obtenerRegionesApi().then(setRegiones).catch(console.error)
    obtenerLimitesApi().then(setLimites).catch(console.error)

    const actualizarCarrito = () => {
      setCarrito(cargarCarrito())
      setCatalogo(cargarCatalogo())
    }
    const dejarCarrito = suscribirCarrito(actualizarCarrito)
    const onProductos = (event) => {
      if (event.key === CLAVE_PRODUCTOS || event.key === null) actualizarCarrito()
    }
    window.addEventListener('storage', onProductos)
    window.addEventListener('focus', actualizarCarrito)
    return () => {
      dejarCarrito()
      window.removeEventListener('storage', onProductos)
      window.removeEventListener('focus', actualizarCarrito)
    }
  }, [cargarListaDirecciones])

  React.useEffect(() => {
    if (!regionId) {
      setProvincias([])
      return
    }
    obtenerProvinciasApi(regionId).then(setProvincias).catch(console.error)
  }, [regionId])

  React.useEffect(() => {
    if (!provinciaId) {
      setComunas([])
      return
    }
    obtenerComunasApi(provinciaId).then(setComunas).catch(console.error)
  }, [provinciaId])

  const soloNumeros = (valor, maxLen) => {
    const limpio = valor.replace(/\D/g, '')
    return maxLen ? limpio.slice(0, maxLen) : limpio
  }

  const soloAlfanumerico = (valor, maxLen) => {
    const limpio = valor.replace(/[^a-zA-Z0-9]/g, '')
    return maxLen ? limpio.slice(0, maxLen) : limpio
  }

  const abrirFormulario = (actual = null) => {
    setErrorGuardar('')
    if (actual) {
      setEditandoId(actual.id)
      setCalle(actual.calle || '')
      setNumero(actual.numero ? String(actual.numero) : '')
      setDepartamento(actual.departamento || '')
      setRegionId(actual.regionId || '')
      setProvinciaId(actual.provinciaId || '')
      setComunaId(actual.comunaId || '')
      setCodigoPostal(actual.codigoPostal ? String(actual.codigoPostal) : '')
    } else {
      setEditandoId(null)
      setCalle('')
      setNumero('')
      setDepartamento('')
      setRegionId('')
      setProvinciaId('')
      setComunaId('')
      setCodigoPostal('')
    }
    setOpenModal(true)
  }

  const cerrarFormulario = () => {
    setOpenModal(false)
    setEditandoId(null)
    setErrorGuardar('')
  }

  const guardar = async (event) => {
    event.preventDefault()
    const calleLimpia = calle.trim()
    const numeroInt = Number(numero)
    const departamentoLimpio = departamento.trim() || null
    const codigoPostalInt = Number(codigoPostal)

    if (!calleLimpia || !numeroInt || !comunaId || !codigoPostalInt) {
      setErrorGuardar('Completa todos los campos obligatorios.')
      return
    }

    setGuardando(true)
    setErrorGuardar('')

    const payload = {
      calle: calleLimpia,
      numero: numeroInt,
      departamento: departamentoLimpio,
      comunaId: Number(comunaId),
      codigoPostal: codigoPostalInt,
    }

    try {
      const resp = await guardarDireccionApi(payload, editandoId)
      await cargarListaDirecciones()
      if (!editandoId && resp?.id) {
        const nuevoId = String(resp.id)
        setSeleccionadaId(nuevoId)
        guardarSeleccionadaId(nuevoId)
      }
      cerrarFormulario()
      setAviso({ severidad: 'success', mensaje: 'Dirección guardada correctamente.' })
    } catch (err) {
      setErrorGuardar(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const seleccionar = (id) => {
    setSeleccionadaId(id)
    guardarSeleccionadaId(id)
  }

  const continuar = async () => {
    if (continuando) return
    setContinuando(true)
    try {
      const actual = prepararEnvio(direcciones, seleccionadaId)
      if (typeof onContinuarPago === 'function') await onContinuarPago(actual)
      else navigate('/carrito/pago')
    } catch (error) {
      setAviso({ severidad: 'error', mensaje: error.message || 'No se pudo continuar. Intenta nuevamente.' })
    } finally {
      setContinuando(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar title="Mi carrito" />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(280px, 1fr)' }, gap: 3, alignItems: 'start' }}>
          <Paper component="section" aria-label="Dirección de envío" elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, minHeight: { md: 540 }, display: 'flex', flexDirection: 'column' }}>
            <Stepper activeStep={0} sx={{ '& .MuiStepLabel-label': { fontSize: { xs: 11, sm: 13 }, fontWeight: 600 }, '& .MuiStepIcon-root.Mui-active': { color: AZUL }, '& .MuiStepLabel-label.Mui-active': { color: AZUL } }}>
              {['Dirección', 'Pago', 'Confirmación'].map((paso) => <Step key={paso}><StepLabel>{paso}</StepLabel></Step>)}
            </Stepper>
            <Divider sx={{ my: 3 }} />
            <Typography id="direccion-envio-titulo" component="h1" sx={{ fontWeight: 700, fontSize: 18, mb: 2 }}>Dirección de envío</Typography>

            {cargandoDirecciones ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : errorDirecciones ? (
              <Alert severity="error" action={<Button color="inherit" onClick={cargarListaDirecciones}>Reintentar</Button>}>{errorDirecciones}</Alert>
            ) : (
              <>
                {!direcciones.length && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Agrega una dirección para recibir tu compra.</Typography>}
                <RadioGroup aria-labelledby="direccion-envio-titulo" value={seleccionadaId ?? ''} onChange={(_, id) => seleccionar(id)} sx={{ gap: 1.5 }}>
                  {direcciones.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', px: 1, py: 1.25, border: '1.5px solid', borderColor: String(item.id) === String(seleccionadaId) ? AZUL : '#DDDDDD', bgcolor: String(item.id) === String(seleccionadaId) ? '#F3F8FF' : 'white', borderRadius: 1.5 }}>
                      <FormControlLabel value={String(item.id)} control={<Radio sx={{ '&.Mui-checked': { color: AZUL } }} />} sx={{ flex: 1, m: 0, minWidth: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { minWidth: 0, pt: 0.75, overflowWrap: 'anywhere' } }} label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {item.calle} #{item.numero}{item.departamento ? `, Depto ${item.departamento}` : ''}
                          </Typography>
                          <Typography variant="body2">
                            {item.comuna}, Provincia de {item.provincia}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Región de {item.region} · CP: {item.codigoPostal}
                          </Typography>
                        </Box>
                      } />
                      <IconButton aria-label={`Editar dirección: ${item.calle}`} onClick={() => abrirFormulario(item)}><Icono editar /></IconButton>
                    </Box>
                  ))}
                </RadioGroup>
                <Button startIcon={<Icono />} onClick={() => abrirFormulario()} sx={{ color: AZUL, textTransform: 'none', alignSelf: 'flex-start', mt: 2, px: 0.5, fontWeight: 600 }}>Agregar nueva dirección</Button>
              </>
            )}

            {(errorCarrito || !resumen.puedeContinuar) && <Alert severity="warning" sx={{ mt: 3 }} action={<Button component={RouterLink} to="/carrito" color="inherit">Ver carrito</Button>}>{errorCarrito || 'Revisa los productos y las cantidades del carrito antes de continuar.'}</Alert>}
            <Box sx={{ mt: 'auto', pt: { xs: 4, md: 6 } }}>
              <Stack direction={{ xs: 'column-reverse', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                <Button component={RouterLink} to="/carrito" sx={{ textTransform: 'none', color: 'text.secondary' }}>Volver al carrito</Button>
                <Button variant="contained" onClick={continuar} disabled={!puedeContinuar || continuando} sx={{ bgcolor: AZUL, textTransform: 'none', fontWeight: 700, px: 3, py: 1.25, '&:hover': { bgcolor: '#0875C9' } }}>{continuando ? 'Continuando…' : 'Continuar al Pago'}</Button>
              </Stack>
            </Box>
          </Paper>
          <ResumenCompra resumen={resumen} />
        </Box>
      </Container>

      <Dialog open={openModal} onClose={cerrarFormulario} fullWidth maxWidth="sm" aria-labelledby="formulario-direccion-titulo">
        <Box component="form" onSubmit={guardar}>
          <DialogTitle id="formulario-direccion-titulo">{editandoId ? 'Editar dirección' : 'Agregar nueva dirección'}</DialogTitle>
          <DialogContent dividers>
            {errorGuardar && <Alert severity="error" sx={{ mb: 2 }}>{errorGuardar}</Alert>}
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Calle"
                  fullWidth
                  required
                  size="small"
                  value={calle}
                  onChange={(e) => setCalle(limites.calle ? e.target.value.slice(0, limites.calle) : e.target.value)}
                  slotProps={{ htmlInput: { maxLength: limites.calle } }}
                />
                <TextField
                  label="Número"
                  type="text"
                  required
                  size="small"
                  value={numero}
                  onChange={(e) => setNumero(soloNumeros(e.target.value, 9))}
                  slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' } }}
                  sx={{ width: { xs: '100%', sm: '140px' } }}
                />
                <TextField
                  label="Depto (opc.)"
                  size="small"
                  value={departamento}
                  onChange={(e) => setDepartamento(soloAlfanumerico(e.target.value, limites.departamento))}
                  slotProps={{ htmlInput: { maxLength: limites.departamento, pattern: '[a-zA-Z0-9]*' } }}
                  sx={{ width: { xs: '100%', sm: '140px' } }}
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
                label="Código Postal"
                type="text"
                fullWidth
                required
                size="small"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(soloNumeros(e.target.value, 7))}
                slotProps={{ htmlInput: { maxLength: 7, inputMode: 'numeric', pattern: '[0-9]{7}' } }}
                helperText="Ingresa los 7 dígitos del código postal de Chile"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={cerrarFormulario} disabled={guardando}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar dirección'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Snackbar open={Boolean(aviso)} autoHideDuration={4000} onClose={() => setAviso(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert variant="filled" severity={aviso?.severidad ?? 'success'} onClose={() => setAviso(null)}>{aviso?.mensaje ?? ''}</Alert></Snackbar>
    </Box>
  )
}
