import * as React from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControlLabel, IconButton, Paper, Radio, RadioGroup, Snackbar,
  Stack, Step, StepLabel, Stepper, TextField, Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import { CLAVE_PRODUCTOS, cargarCatalogo, pesos } from '../Catalogo/catalogo.js'
import { cargarCarrito, resumirCarrito, suscribirCarrito } from './carrito.js'
import {
  CAMPOS_DIRECCION, cargarDirecciones, direccionVacia, guardarDireccion, prepararEnvio,
  seleccionarDireccion, suscribirDirecciones, validarDireccion,
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

// El callback es opcional. Por defecto abre la pantalla /carrito/pago.
export default function DireccionEnvioPage({ onContinuarPago }) {
  const navigate = useNavigate()
  const [envio, setEnvio] = React.useState(() => cargarDirecciones())
  const [carrito, setCarrito] = React.useState(() => cargarCarrito())
  const [catalogo, setCatalogo] = React.useState(() => cargarCatalogo())
  const [formulario, setFormulario] = React.useState(null)
  const [errores, setErrores] = React.useState({})
  const [errorGuardar, setErrorGuardar] = React.useState('')
  const [aviso, setAviso] = React.useState(null)
  const [continuando, setContinuando] = React.useState(false)
  const resumen = resumirCarrito(carrito.items, catalogo.productos)
  const direccion = envio.direcciones.find((item) => item.id === envio.seleccionadaId)
  const errorCarrito = carrito.error || catalogo.error
  const puedeContinuar = !envio.error && !errorCarrito && resumen.puedeContinuar && Boolean(direccion)

  React.useEffect(() => {
    const actualizar = () => {
      setEnvio(cargarDirecciones())
      setCarrito(cargarCarrito())
      setCatalogo(cargarCatalogo())
    }
    const dejarDirecciones = suscribirDirecciones(actualizar)
    const dejarCarrito = suscribirCarrito(actualizar)
    const onProductos = (event) => {
      if (event.key === CLAVE_PRODUCTOS || event.key === null) actualizar()
    }
    window.addEventListener('storage', onProductos)
    window.addEventListener('focus', actualizar)
    return () => {
      dejarDirecciones()
      dejarCarrito()
      window.removeEventListener('storage', onProductos)
      window.removeEventListener('focus', actualizar)
    }
  }, [])

  const abrirFormulario = (actual = null) => {
    setErrores({})
    setErrorGuardar('')
    setFormulario({ id: actual?.id ?? null, datos: actual ?? direccionVacia() })
  }

  const guardar = (event) => {
    event.preventDefault()
    if (!formulario) return
    const nuevosErrores = validarDireccion(formulario.datos)
    setErrores(nuevosErrores)
    setErrorGuardar('')
    if (Object.keys(nuevosErrores).length) return
    try {
      setEnvio(guardarDireccion(formulario.datos, formulario.id))
      setFormulario(null)
      setAviso({ severidad: 'success', mensaje: 'Dirección guardada.' })
    } catch (error) {
      setErrorGuardar(error.message)
    }
  }

  const seleccionar = (id) => {
    try {
      setEnvio(seleccionarDireccion(id))
    } catch (error) {
      setEnvio(cargarDirecciones())
      setAviso({ severidad: 'error', mensaje: error.message })
    }
  }

  const continuar = async () => {
    if (continuando) return
    setContinuando(true)
    try {
      const actual = prepararEnvio()
      if (typeof onContinuarPago === 'function') await onContinuarPago(actual)
      else navigate('/carrito/pago')
    } catch (error) {
      setEnvio(cargarDirecciones())
      setCarrito(cargarCarrito())
      setCatalogo(cargarCatalogo())
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

            {envio.error ? (
              <Alert severity="error" action={<Button color="inherit" onClick={() => setEnvio(cargarDirecciones())}>Reintentar</Button>}>{envio.error}</Alert>
            ) : (
              <>
                {!envio.direcciones.length && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Agrega una dirección para recibir tu compra.</Typography>}
                <RadioGroup aria-labelledby="direccion-envio-titulo" value={envio.seleccionadaId ?? ''} onChange={(_, id) => seleccionar(id)} sx={{ gap: 1.5 }}>
                  {envio.direcciones.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', px: 1, py: 1.25, border: '1.5px solid', borderColor: item.id === envio.seleccionadaId ? AZUL : '#DDDDDD', bgcolor: item.id === envio.seleccionadaId ? '#F3F8FF' : 'white', borderRadius: 1.5 }}>
                      <FormControlLabel value={item.id} control={<Radio sx={{ '&.Mui-checked': { color: AZUL } }} />} sx={{ flex: 1, m: 0, minWidth: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { minWidth: 0, pt: 0.75, overflowWrap: 'anywhere' } }} label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.alias || item.destinatario}</Typography>
                          <Typography variant="body2">{item.direccion || [item.calle, item.numero, item.departamento].filter(Boolean).join(' ')}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.ciudad || item.comuna}, {item.region} · {item.telefono}</Typography>
                        </Box>
                      } />
                      <IconButton aria-label={`Editar dirección: ${item.alias || item.direccion || item.calle}`} onClick={() => abrirFormulario(item)}><Icono editar /></IconButton>
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

      <Dialog open={Boolean(formulario)} onClose={() => setFormulario(null)} fullWidth maxWidth="sm" aria-labelledby="formulario-direccion-titulo">
        <Box component="form" noValidate onSubmit={guardar}>
          <DialogTitle id="formulario-direccion-titulo">{formulario?.id ? 'Editar dirección' : 'Agregar nueva dirección'}</DialogTitle>
          <DialogContent dividers>
            {errorGuardar && <Alert severity="error" sx={{ mb: 2 }}>{errorGuardar}</Alert>}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 1 }}>
              {CAMPOS_DIRECCION.map((campo, indice) => (
                <TextField
                  key={campo.nombre}
                  label={campo.etiqueta}
                  value={formulario?.datos[campo.nombre] ?? ''}
                  required={Boolean(campo.obligatorio)}
                  type={campo.nombre === 'telefono' ? 'tel' : campo.tipo ?? 'text'}
                  autoComplete={campo.autocompletar ?? 'off'}
                  autoFocus={indice === 0}
                  fullWidth
                  error={Boolean(errores[campo.nombre])}
                  helperText={errores[campo.nombre]}
                  slotProps={{
                    htmlInput: {
                      maxLength: campo.nombre === 'telefono' ? 15 : campo.maximo,
                      ...(campo.nombre === 'telefono'
                        ? { inputMode: 'numeric', pattern: '[0-9]*' }
                        : {}),
                    },
                  }}
                  sx={{ gridColumn: campo.completo ? '1 / -1' : 'auto' }}
                  onChange={(event) => {
                    const nombre = campo.nombre
                    const entrada = event.target.value
                    const nuevoValor = nombre === 'telefono'
                      ? entrada.replace(/[^0-9]/g, '').slice(0, 15)
                      : entrada

                    setFormulario((actual) => actual ? {
                      ...actual,
                      datos: { ...actual.datos, [nombre]: nuevoValor },
                    } : actual)
                    setErrores((actual) => ({ ...actual, [nombre]: '' }))
                  }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={() => setFormulario(null)}>Cancelar</Button><Button type="submit" variant="contained">Guardar dirección</Button></DialogActions>
        </Box>
      </Dialog>
      <Snackbar open={Boolean(aviso)} autoHideDuration={4000} onClose={() => setAviso(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert variant="filled" severity={aviso?.severidad ?? 'success'} onClose={() => setAviso(null)}>{aviso?.mensaje ?? ''}</Alert></Snackbar>
    </Box>
  )
}
