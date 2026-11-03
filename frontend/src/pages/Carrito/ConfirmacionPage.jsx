import * as React from 'react'
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom'
import {
  Alert, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Paper, Stack, Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import { pesos } from '../Catalogo/catalogo.js'
import { cargarPedidosPrueba, formatearFechaPedido, suscribirPedidosPrueba } from './pedidosPrueba.js'

const AZUL = '#008FFF'

function DatoPedido({ etiqueta, valor }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography component="dt" variant="caption" color="text.secondary" sx={{ letterSpacing: 0.3, fontSize: 11 }}>{etiqueta}</Typography>
      <Typography component="dd" sx={{ m: 0, mt: 0.75, fontWeight: 600, overflowWrap: 'anywhere' }}><span>{valor}</span></Typography>
    </Box>
  )
}

export default function ConfirmacionPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const [datos, setDatos] = React.useState(() => cargarPedidosPrueba())
  const [detalle, setDetalle] = React.useState(null)
  const [estadoAbierto, setEstadoAbierto] = React.useState(false)
  const pedido = datos.pedidos.find((item) => item.id === id)

  React.useEffect(() => suscribirPedidosPrueba(() => setDatos(cargarPedidosPrueba())), [])

  const abrirEstado = () => {
    setDetalle(pedido)
    setEstadoAbierto(true)
  }

  return (
    <Box translate="no" className="notranslate" sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar title="Mi carrito" />
      <Container component="main" maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ maxWidth: 820, mx: 'auto', borderRadius: 3, px: { xs: 2.5, sm: 4.5 }, py: { xs: 4, sm: 5 }, textAlign: 'center' }}>
          {datos.error ? (
            <Stack spacing={2}>
              <Alert severity="error">{datos.error}</Alert>
              <Button onClick={() => setDatos(cargarPedidosPrueba())}>Reintentar</Button>
              <Button component={RouterLink} to="/catalogo">Volver a la tienda</Button>
            </Stack>
          ) : !pedido ? (
            <Stack spacing={2} sx={{ alignItems: 'center' }}>
              <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>No encontramos este pedido</Typography>
              <Typography color="text.secondary">Comprueba el número de orden o vuelve a la tienda.</Typography>
              <Button component={RouterLink} to="/catalogo" variant="contained">Volver a la tienda</Button>
            </Stack>
          ) : (
            <>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#E7F8F0', color: '#17B563', mx: 'auto', mb: 2.5, display: 'grid', placeItems: 'center' }}>
                <svg width="38" height="38" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M32 18a13 13 0 1 1-6-10" /><path d="m14 18 6 6L34 9" /></svg>
              </Box>
              <Chip label="Pedido de prueba" size="small" sx={{ mb: 1.5, bgcolor: '#F3F8FF', color: AZUL, fontWeight: 600 }} />
              <Typography component="h1" sx={{ fontSize: { xs: 24, sm: 30 }, fontWeight: 800, mb: 1 }}>¡Pedido realizado con éxito!</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>Tu pedido de prueba quedó registrado. Aquí puedes consultar sus detalles.</Typography>

              <Box sx={{ display: 'inline-flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.75, bgcolor: '#F3F8FF', color: AZUL, fontWeight: 700, px: 2.5, py: 1.5, borderRadius: 1.5, mt: 3, mb: 3 }}>
                <span>Número de orden:</span><span>{pedido.numeroOrden}</span>
              </Box>

              {state?.aviso && <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>{state.aviso}</Alert>}
              <Box component="dl" sx={{ m: 0, p: 2, border: '1px solid #DDDDDD', borderRadius: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2, textAlign: 'left' }}>
                <DatoPedido etiqueta="FECHA" valor={formatearFechaPedido(pedido.creadoEn)} />
                <DatoPedido etiqueta="ENTREGA ESTIMADA" valor="Por confirmar" />
                <DatoPedido etiqueta="TOTAL DE PRODUCTOS" valor={pesos(pedido.totalProductos)} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>Compra de prueba, sin cobro ni envío de correo. Despacho por confirmar.</Typography>

              <Stack spacing={0.5} sx={{ alignItems: 'center', mt: 3 }}>
                <Button type="button" variant="contained" onClick={abrirEstado} sx={{ bgcolor: AZUL, textTransform: 'none', fontWeight: 700, py: 1.5, px: 4, borderRadius: 1.5, '&:hover': { bgcolor: '#0875C9' } }}>Ver estado del pedido</Button>
                <Button component={RouterLink} to="/catalogo" sx={{ color: AZUL, textTransform: 'none', fontWeight: 600 }}>Volver a la tienda</Button>
              </Stack>
            </>
          )}
        </Paper>
      </Container>

      <Dialog open={estadoAbierto} onClose={() => setEstadoAbierto(false)} translate="no" className="notranslate" fullWidth maxWidth="sm" aria-labelledby="estado-pedido-titulo">
        <DialogTitle id="estado-pedido-titulo">Estado del pedido</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Chip label="Pedido de prueba registrado" color="success" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
            <Typography sx={{ fontWeight: 700 }}><span>{detalle?.numeroOrden ?? ''}</span></Typography>
            <Typography variant="body2"><span>{detalle ? `Fecha: ${formatearFechaPedido(detalle.creadoEn)}` : ''}</span></Typography>
            <Typography variant="body2"><span>{detalle?.metodo === 'tarjeta' ? `Pago de prueba con tarjeta terminada en ${detalle.ultimosDigitos}` : 'Pago de prueba por transferencia bancaria'}</span></Typography>
            <Divider />
            {detalle?.items.map((item) => (
              <Stack key={item.id} direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="body2"><span>{`${item.cantidad} × ${item.nombre}`}</span></Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}><span>{pesos(item.importe)}</span></Typography>
              </Stack>
            ))}
            <Divider />
            <Box>
              <Typography sx={{ fontWeight: 700 }}><span>{detalle?.direccion.destinatario ?? ''}</span></Typography>
              <Typography variant="body2"><span>{detalle?.direccion.direccion ?? ''}</span></Typography>
              <Typography variant="body2"><span>{detalle ? `${detalle.direccion.ciudad}, ${detalle.direccion.region}` : ''}</span></Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Entrega estimada y despacho por confirmar.</Typography>
          </Stack>
        </DialogContent>
        <DialogActions><Button type="button" onClick={() => setEstadoAbierto(false)}>Cerrar</Button></DialogActions>
      </Dialog>
    </Box>
  )
}
