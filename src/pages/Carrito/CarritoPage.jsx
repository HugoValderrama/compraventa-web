import * as React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import TopNavBar from '../../components/organisms/TopNavBar'
import { CLAVE_PRODUCTOS, cargarCatalogo, pesos } from '../Catalogo/catalogo.js'
import {
  cambiarCantidad,
  cargarCarrito,
  quitarDelCarrito,
  resumirCarrito,
  suscribirCarrito,
  validarCarritoActual,
} from './carrito.js'

// Ubicación: src/pages/Carrito/CarritoPage.jsx, junto a carrito.js.
function ImagenCarrito({ producto }) {
  const [fallida, setFallida] = React.useState('')
  const src = producto?.imagen ?? ''
  return (
    <Box sx={{ width: { xs: 84, sm: 108 }, height: { xs: 84, sm: 108 }, flexShrink: 0, borderRadius: 1.5, bgcolor: '#858585', color: 'white', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      {src && src !== fallida ? (
        <Box component="img" src={src} alt={producto.nombre} loading="lazy" onError={() => setFallida(src)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Typography variant="caption" sx={{ p: 1, textAlign: 'center', fontWeight: 700 }}>Sin imagen</Typography>
      )}
    </Box>
  )
}

function FilaCarrito({ linea, onCantidad, onQuitar }) {
  const { producto, cantidad, importe, problema } = linea
  const nombre = producto?.nombre ?? 'Producto no disponible'
  return (
    <Paper component="article" elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, boxShadow: '0 3px 4px rgba(0,0,0,0.18)' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: { md: 'center' }, gap: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
          <ImagenCarrito producto={producto} />
          <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            <Typography component="h2" sx={{ fontSize: { xs: 18, sm: 22 }, fontWeight: 700 }}>{nombre}</Typography>
            {producto?.vendedor && <Typography sx={{ fontWeight: 600, mt: 0.5 }}>{producto.vendedor}</Typography>}
            {producto && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{pesos(producto.precio)} por unidad</Typography>}
            {problema && <Typography variant="body2" color="error" sx={{ mt: 1 }}>{problema}</Typography>}
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: '#F0F1F5', borderRadius: 1 }}>
            <IconButton size="small" aria-label={'Reducir cantidad de ' + nombre} disabled={cantidad <= 1 || !producto} onClick={() => onCantidad(linea.id, cantidad - 1)}>
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Box component="output" aria-label={'Cantidad de ' + nombre} aria-live="polite" sx={{ minWidth: 25, px: 0.5, textAlign: 'center', fontWeight: 700 }}>{cantidad}</Box>
            <IconButton size="small" aria-label={'Aumentar cantidad de ' + nombre} disabled={!producto || cantidad >= producto.stock} onClick={() => onCantidad(linea.id, cantidad + 1)}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography sx={{ minWidth: 90, textAlign: 'right', fontWeight: 700 }}>
            {importe === null ? 'Por confirmar' : pesos(importe)}
          </Typography>
          <IconButton aria-label={'Eliminar del carrito: ' + nombre} onClick={() => onQuitar(linea.id)}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 7h16" />
              <path d="M9 7V4h6v3" />
              <path d="M6 7l1 14h10l1-14" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default function CarritoPage() {
  const [carrito, setCarrito] = React.useState(() => cargarCarrito())
  const [catalogo, setCatalogo] = React.useState(() => cargarCatalogo())
  const [aviso, setAviso] = React.useState(null)
  const [revisando, setRevisando] = React.useState(false)
  const resumen = resumirCarrito(carrito.items, catalogo.productos)
  const puedeContinuar = resumen.puedeContinuar && !catalogo.error && !carrito.error

  React.useEffect(() => {
    const dejarDeEscuchar = suscribirCarrito(() => setCarrito(cargarCarrito()))
    const sincronizarProductos = (event) => {
      if (event.key === CLAVE_PRODUCTOS || event.key === null) setCatalogo(cargarCatalogo())
    }
    window.addEventListener('storage', sincronizarProductos)
    return () => {
      dejarDeEscuchar()
      window.removeEventListener('storage', sincronizarProductos)
    }
  }, [])

  const actualizar = (id, cantidad) => {
    try {
      setCarrito(cambiarCantidad(id, cantidad))
      setCatalogo(cargarCatalogo())
    } catch (error) {
      setCarrito(cargarCarrito())
      setCatalogo(cargarCatalogo())
      setAviso({ mensaje: error.message, severidad: 'error' })
    }
  }

  const quitar = (id) => {
    try {
      setCarrito(quitarDelCarrito(id))
      setAviso({ mensaje: 'Producto eliminado del carrito.', severidad: 'success' })
    } catch (error) {
      setAviso({ mensaje: error.message, severidad: 'error' })
    }
  }

  const proceder = () => {
    try {
      const actual = validarCarritoActual()
      setCarrito(actual.carrito)
      setCatalogo(actual.catalogo)
      setRevisando(true)
    } catch (error) {
      setCarrito(cargarCarrito())
      setCatalogo(cargarCatalogo())
      setAviso({ mensaje: error.message, severidad: 'error' })
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar title="Mi carrito" />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Typography component="h1" variant="h5" sx={{ color: 'white', fontWeight: 700 }}>Mi carrito</Typography>
          <Button component={RouterLink} to="/catalogo" sx={{ color: 'white', textTransform: 'none' }}>Seguir comprando</Button>
        </Stack>

        {carrito.error ? (
          <Alert severity="error" action={<Button color="inherit" onClick={() => setCarrito(cargarCarrito())}>Reintentar</Button>}>{carrito.error}</Alert>
        ) : carrito.items.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Tu carrito está vacío</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Explora el catálogo y agrega los productos que quieras comprar.</Typography>
            <Button component={RouterLink} to="/catalogo" variant="contained">Ver productos</Button>
          </Paper>
        ) : (
          <>
            {catalogo.error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => setCatalogo(cargarCatalogo())}>Reintentar</Button>}>{catalogo.error}</Alert>}
            <Stack spacing={1.5}>
              {resumen.lineas.map((linea) => <FilaCarrito key={linea.id} linea={linea} onCantidad={actualizar} onQuitar={quitar} />)}
            </Stack>

            <Paper elevation={0} sx={{ mt: { xs: 3, md: 5 }, p: { xs: 2.5, md: 4 }, borderRadius: 2, boxShadow: '0 3px 4px rgba(0,0,0,0.18)' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 3 }}>
                <Stack spacing={1}>
                  <Typography color="text.secondary">Subtotal: {resumen.subtotal === null ? 'Por confirmar' : pesos(resumen.subtotal)}</Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <Typography>Total de productos:</Typography>
                    <Typography aria-live="polite" sx={{ color: '#008FFF', fontSize: 26, fontWeight: 800 }}>{resumen.total === null ? 'Por confirmar' : pesos(resumen.total)}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">Envío pendiente de confirmar.</Typography>
                </Stack>
                <Button variant="contained" endIcon={<ArrowForwardIcon />} disabled={!puedeContinuar} onClick={proceder} sx={{ bgcolor: '#008FFF', px: 3, py: 1.5, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#0875C9' } }}>
                  Proceder al pago
                </Button>
              </Stack>
              {!puedeContinuar && <Alert severity="warning" sx={{ mt: 2 }}>Revisa los productos, las cantidades y los importes indicados para continuar.</Alert>}
            </Paper>
          </>
        )}
      </Container>

      <Dialog open={revisando} onClose={() => setRevisando(false)} fullWidth maxWidth="sm" aria-labelledby="revision-carrito-titulo">
        <DialogTitle id="revision-carrito-titulo">Revisión del pedido</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {resumen.lineas.map((linea) => (
              <Box key={linea.id}>
                <Typography sx={{ fontWeight: 700 }}>{linea.producto?.nombre ?? 'Producto no disponible'}</Typography>
                <Typography variant="body2">{linea.cantidad} unidades · {linea.importe === null ? 'Precio por confirmar' : pesos(linea.importe)}</Typography>
                {linea.problema && <Typography variant="body2" color="error">{linea.problema}</Typography>}
              </Box>
            ))}
            <Divider />
            <Typography sx={{ fontWeight: 700 }}>Total de productos: {resumen.total === null ? 'Por confirmar' : pesos(resumen.total)}</Typography>
            <Typography variant="body2" color="text.secondary">Envío pendiente de confirmar.</Typography>
            {!puedeContinuar && <Alert severity="warning">El carrito ha cambiado. Revisa los productos antes de continuar.</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setRevisando(false)}>Volver al carrito</Button></DialogActions>
      </Dialog>

      <Snackbar open={Boolean(aviso)} autoHideDuration={4000} onClose={() => setAviso(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={aviso?.severidad ?? 'success'} variant="filled" onClose={() => setAviso(null)}>{aviso?.mensaje ?? ''}</Alert>
      </Snackbar>
    </Box>
  )
}
