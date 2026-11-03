import * as React from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert, Box, Button, Container,
  Divider, FormControlLabel, Paper, Radio, RadioGroup, Stack, Step, StepLabel,
  Stepper, TextField, Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import { CLAVE_PRODUCTOS, pesos } from '../Catalogo/catalogo.js'
import { suscribirCarrito } from './carrito.js'
import { suscribirDirecciones } from './direcciones.js'
import {
  METODOS_PAGO, cargarContextoPago, formatearNumeroTarjeta, formatearVencimiento,
  prepararRevisionPago, soloDigitos, tarjetaVacia,
} from './pago.js'

import { crearIdPedido, registrarPedidoPrueba } from './pedidosPrueba.js'

const AZUL = '#008FFF'

function IconoPago({ tarjeta = false }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {tarjeta ? <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></> : <><path d="M3 17V14M7 17v-5M11 17V9M15 17V6" /><path d="M18 15h3" /></>}
    </svg>
  )
}

function direccionTexto(direccion) {
  if (!direccion) return ''
  const calle = direccion.direccion || [direccion.calle, direccion.numero, direccion.departamento].filter(Boolean).join(' ')
  return [calle, direccion.ciudad || direccion.comuna, direccion.region].filter(Boolean).join(', ')
}

function ImagenProducto({ producto }) {
  const [fallida, setFallida] = React.useState('')
  const src = producto?.imagen ?? ''
  return (
    <Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: 1.5, bgcolor: '#858585', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
      {src && src !== fallida
        ? <Box component="img" src={src} alt={producto.nombre} onError={() => setFallida(src)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <Typography sx={{ color: 'white', fontSize: 10, textAlign: 'center', px: 0.5 }}>Sin imagen</Typography>}
    </Box>
  )
}

function ResumenPago({ resumen }) {
  const importe = resumen.total === null ? 'Por confirmar' : pesos(resumen.total)
  return (
    <Paper component="aside" elevation={0} aria-labelledby="pago-resumen-titulo" sx={{ p: 2.5, borderRadius: 2, alignSelf: 'start' }}>
      <Typography id="pago-resumen-titulo" component="h2" sx={{ fontWeight: 700, mb: 2 }}>Resumen de Compra</Typography>
      <Stack spacing={1.5}>
        {!resumen.lineas.length && <Typography variant="body2" color="text.secondary">Tu carrito está vacío.</Typography>}
        {resumen.lineas.map((linea) => (
          <Stack key={linea.id} direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <ImagenProducto producto={linea.producto} />
            <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{linea.producto?.nombre ?? 'Producto no disponible'}</Typography>
              <Typography variant="caption" color="text.secondary"><span>{`Cant: ${linea.cantidad}`}</span></Typography>
              {linea.problema && <Typography variant="caption" color="error" sx={{ display: 'block' }}>{linea.problema}</Typography>}
            </Box>
          </Stack>
        ))}
      </Stack>
      <Divider sx={{ my: 2.5 }} />
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}><Typography variant="body2" color="text.secondary">Productos</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{importe}</Typography></Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}><Typography variant="body2" color="text.secondary">Despacho</Typography><Typography variant="body2" color="text.secondary">Por confirmar</Typography></Stack>
      </Stack>
      <Divider sx={{ my: 2.5 }} />
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Total de productos</Typography><Typography sx={{ color: AZUL, fontWeight: 800, fontSize: 22 }}>{importe}</Typography></Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>El total final incluirá el despacho.</Typography>
    </Paper>
  )
}

function CampoTarjeta({ nombre, etiqueta, valor, error, onCambio, placeholder, maxLength, oculto = false }) {
  const id = `pago-${nombre}`
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography component="label" htmlFor={id} sx={{ display: 'block', mb: 0.5, fontSize: 12, color: 'text.secondary' }}>{etiqueta}</Typography>
      <TextField id={id} name={nombre} type={oculto ? 'password' : 'text'} size="small" fullWidth value={valor} placeholder={placeholder} autoComplete="off" error={Boolean(error)} helperText={error} onChange={(event) => onCambio(nombre, event.target.value)} slotProps={{ htmlInput: { inputMode: 'numeric', maxLength } }} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 1.5, fontSize: 14 } }} />
    </Box>
  )
}

export default function PagoPage() {
  const navigate = useNavigate()
  const [intentoId] = React.useState(crearIdPedido)
  const [registrando, setRegistrando] = React.useState(false)
  const procesando = React.useRef(false)
  const [contexto, setContexto] = React.useState(() => cargarContextoPago())
  const [metodo, setMetodo] = React.useState(METODOS_PAGO.TARJETA)
  const [tarjeta, setTarjeta] = React.useState(tarjetaVacia)
  const [errores, setErrores] = React.useState({})
  const [errorPago, setErrorPago] = React.useState('')
  const { direccion, resumen, error } = contexto

  React.useEffect(() => {
    const actualizar = () => {
      setContexto(cargarContextoPago())
    }
    const dejarCarrito = suscribirCarrito(actualizar)
    const dejarDirecciones = suscribirDirecciones(actualizar)
    const onProductos = (event) => {
      if (event.key === CLAVE_PRODUCTOS || event.key === null) actualizar()
    }
    window.addEventListener('storage', onProductos)
    window.addEventListener('focus', actualizar)
    return () => {
      dejarCarrito()
      dejarDirecciones()
      window.removeEventListener('storage', onProductos)
      window.removeEventListener('focus', actualizar)
    }
  }, [])

  const cambiarTarjeta = (nombre, valor) => {
    const maximo = nombre === 'numero' ? 19 : 4
    setTarjeta((actual) => ({ ...actual, [nombre]: soloDigitos(valor, maximo) }))
    setErrores((actual) => ({ ...actual, [nombre]: '' }))
    setErrorPago('')
  }

  const cambiarMetodo = (_, siguiente) => {
    setMetodo(siguiente)
    setTarjeta(tarjetaVacia())
    setErrores({})
    setErrorPago('')
  }

  const usarDatosDePrueba = () => {
    const anio = String(new Date().getFullYear() + 2).slice(-2)
    setTarjeta({ numero: '4242424242424242', vencimiento: `12${anio}`, cvv: '123' })
    setErrores({})
    setErrorPago('')
  }

  const pagar = (event) => {
    event.preventDefault()
    if (procesando.current) return
    procesando.current = true
    setRegistrando(true)
    setErrorPago('')
    try {
      const resultado = prepararRevisionPago(metodo, tarjeta)
      setErrores(resultado.errores)
      if (!resultado.revision) {
        setErrorPago('Revisa los campos marcados antes de continuar.')
        const primerCampo = ['numero', 'vencimiento', 'cvv'].find((nombre) => resultado.errores[nombre])
        if (primerCampo) document.getElementById(`pago-${primerCampo}`)?.focus()
        return
      }
      const { pedido, aviso } = registrarPedidoPrueba(resultado.revision, intentoId)
      setTarjeta(tarjetaVacia())
      navigate(`/carrito/confirmacion/${encodeURIComponent(pedido.id)}`, {
        replace: true,
        state: { aviso },
      })
    } catch (problema) {
      setContexto(cargarContextoPago())
      setErrorPago(problema.message || 'No se pudo registrar el pedido de prueba.')
    } finally {
      procesando.current = false
      setRegistrando(false)
    }
  }

  const seleccionTarjeta = metodo === METODOS_PAGO.TARJETA

  return (
    <Box translate="no" className="notranslate" sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar title="Mi carrito" />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(280px, 1fr)' }, gap: 3, alignItems: 'start' }}>
          <Paper component="section" aria-label="Pago de la compra" elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
            <Box component="form" noValidate onSubmit={pagar}>
              <Stepper activeStep={1} sx={{ '& .MuiStepLabel-label': { fontSize: { xs: 11, sm: 13 }, fontWeight: 600 }, '& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed': { color: AZUL }, '& .MuiStepLabel-label.Mui-active': { color: AZUL }, '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: AZUL } }}>
                {['Dirección', 'Pago', 'Confirmación'].map((paso) => <Step key={paso}><StepLabel>{paso}</StepLabel></Step>)}
              </Stepper>
              <Divider sx={{ my: 3 }} />

              <Stack direction="row" sx={{ p: 1.5, bgcolor: '#F3F8FF', borderRadius: 1.5, alignItems: 'center', gap: 1.25, mb: 2 }}>
                <Box sx={{ color: AZUL, display: 'flex', flexShrink: 0 }}><IconoPago /></Box>
                <Box sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}><span>{`Despacho a: ${direccion?.destinatario ?? 'Sin dirección seleccionada'}`}</span></Typography>
                  {direccion && <Typography variant="caption" color="text.secondary">{direccionTexto(direccion)}</Typography>}
                </Box>
                <Button component={RouterLink} to="/carrito/direccion" size="small" sx={{ color: AZUL, textTransform: 'none', fontWeight: 600 }}>Editar</Button>
              </Stack>

              {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
              {errorPago && <Alert severity="error" sx={{ mb: 2 }}>{errorPago}</Alert>}
              <Typography component="h1" id="metodo-pago-titulo" sx={{ fontSize: 18, fontWeight: 700, mb: 2 }}>Método de pago</Typography>

              <RadioGroup aria-labelledby="metodo-pago-titulo" value={metodo} onChange={cambiarMetodo} sx={{ gap: 1.5 }}>
                <Box sx={{ border: '1.5px solid', borderColor: seleccionTarjeta ? AZUL : '#DDDDDD', bgcolor: seleccionTarjeta ? '#F3F8FF' : 'white', borderRadius: 1.5, p: 1.5 }}>
                  <FormControlLabel value={METODOS_PAGO.TARJETA} control={<Radio size="small" sx={{ '&.Mui-checked': { color: AZUL } }} />} sx={{ m: 0, '& .MuiRadio-root': { pl: 0, py: 0.25 } }} label={<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Tarjeta de crédito o débito</Typography><Box sx={{ color: '#8192AA', display: 'flex' }}><IconoPago tarjeta /></Box></Stack>} />
                  {seleccionTarjeta && (
                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                      <Button type="button" size="small" onClick={usarDatosDePrueba} sx={{ alignSelf: 'flex-start', textTransform: 'none', color: AZUL }}>Usar datos de prueba</Button>
                      <CampoTarjeta nombre="numero" etiqueta="Número de tarjeta" valor={formatearNumeroTarjeta(tarjeta.numero)} error={errores.numero} onCambio={cambiarTarjeta} placeholder="•••• •••• •••• XXXX" maxLength={23} />
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 1.5 }}>
                        <CampoTarjeta nombre="vencimiento" etiqueta="Expiración" valor={formatearVencimiento(tarjeta.vencimiento)} error={errores.vencimiento} onCambio={cambiarTarjeta} placeholder="MM/AA" maxLength={5} />
                        <CampoTarjeta nombre="cvv" etiqueta="CVV" valor={tarjeta.cvv} error={errores.cvv} onCambio={cambiarTarjeta} placeholder="•••" maxLength={4} oculto />
                      </Box>
                    </Stack>
                  )}
                </Box>
                <Box sx={{ border: '1.5px solid', borderColor: !seleccionTarjeta ? AZUL : '#DDDDDD', bgcolor: !seleccionTarjeta ? '#F3F8FF' : 'white', borderRadius: 1.5, px: 1.5, py: 1 }}>
                  <FormControlLabel value={METODOS_PAGO.TRANSFERENCIA} control={<Radio size="small" sx={{ '&.Mui-checked': { color: AZUL } }} />} sx={{ m: 0, '& .MuiRadio-root': { pl: 0, py: 0.25 } }} label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Transferencia bancaria (Khipu)</Typography>} />
                </Box>
              </RadioGroup>
              {errores.metodo && <Typography variant="body2" color="error" sx={{ mt: 1 }}>{errores.metodo}</Typography>}

              <Alert severity="info" sx={{ mt: 2, fontSize: 12 }}>Modo de prueba: usa datos ficticios. No se realizarán cobros.</Alert>
              <Stack direction={{ xs: 'column-reverse', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mt: 2 }}>
                <Button component={RouterLink} to="/carrito/direccion" sx={{ color: 'text.secondary', textTransform: 'none', alignSelf: { xs: 'center', sm: 'auto' } }}>Volver a dirección</Button>
                <Button type="submit" variant="contained" disabled={Boolean(error) || registrando} sx={{ bgcolor: AZUL, px: 3, py: 1.25, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#0875C9' } }}><span>{registrando ? 'Confirmando…' : 'Pagar ahora'}</span></Button>
              </Stack>
            </Box>
          </Paper>
          <ResumenPago resumen={resumen} />
        </Box>
      </Container>


    </Box>
  )
}
