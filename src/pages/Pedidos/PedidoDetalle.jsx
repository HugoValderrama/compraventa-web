import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import EstadoChip from '../../components/atoms/EstadoChip'
import PasosPedido from '../../components/molecules/PasosPedido'
import {
  ESTADOS_PEDIDO,
  TRANSPORTISTAS,
  comenzarPreparacion,
  marcarEnviado,
  obtenerPedido,
  solicitarCancelacion,
} from '../../mocks/pedidos'
import { formatearFecha, formatearFechaHora, pesos } from '../../utils/formatos'

const PATRON_SEGUIMIENTO = /^[A-Za-z0-9-]{6,30}$/

function validar({ transportista, numero }) {
  const errores = {}

  if (!transportista) errores.transportista = 'Selecciona un transportista.'

  if (!numero.trim()) {
    errores.numero = 'Ingresa el número de seguimiento.'
  } else if (!PATRON_SEGUIMIENTO.test(numero.trim())) {
    errores.numero = 'Usa entre 6 y 30 letras, números o guiones.'
  }

  return errores
}

function Pantalla({ children }) {
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar showBack onBack={() => navigate('/pedidos')} />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  )
}

export default function PedidoDetalle({ id }) {
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  const [valores, setValores] = useState({ transportista: '', numero: '' })
  const [errores, setErrores] = useState({})
  const [procesando, setProcesando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [dialogo, setDialogo] = useState(false)
  const [cancelacion, setCancelacion] = useState(false)

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError('')

    obtenerPedido(id)
      .then((dato) => {
        if (activo) setPedido(dato)
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar el pedido.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [id, intento])

  const ejecutar = async (accion, mensaje) => {
    if (procesando) return false
    setProcesando(true)

    try {
      const actualizado = await accion()
      if (actualizado) setPedido(actualizado)
      setAviso({ tipo: 'success', mensaje })
      return true
    } catch (err) {
      setAviso({ tipo: 'error', mensaje: err.message })
      return false
    } finally {
      setProcesando(false)
    }
  }

  const cambiar = (campo) => (event) => {
    setValores((actuales) => ({ ...actuales, [campo]: event.target.value }))
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
  }

  const comenzar = () =>
    ejecutar(() => comenzarPreparacion(pedido.id), 'El pedido pasó a En preparación.')

  const enviar = async (event) => {
    event.preventDefault()

    const encontrados = validar(valores)
    setErrores(encontrados)
    if (Object.keys(encontrados).length) return

    await ejecutar(
      () =>
        marcarEnviado(pedido.id, {
          empresaTransporte: valores.transportista,
          numeroSeguimiento: valores.numero.trim(),
        }),
      'Pedido marcado como enviado. El cliente recibirá el seguimiento.'
    )
  }

  const confirmarCancelacion = async () => {
    setDialogo(false)
    const ok = await ejecutar(
      () => solicitarCancelacion(pedido.id),
      'Solicitud de cancelación enviada.'
    )
    if (ok) setCancelacion(true)
  }

  if (cargando) {
    return (
      <Pantalla>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'white' }} aria-label="Cargando pedido" />
        </Box>
      </Pantalla>
    )
  }

  if (error) {
    return (
      <Pantalla>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      </Pantalla>
    )
  }

  if (!pedido) {
    return (
      <Pantalla>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="h6">Pedido no encontrado</Typography>
            <Button variant="contained" onClick={() => navigate('/pedidos')}>
              Volver a pedidos
            </Button>
          </Stack>
        </Paper>
      </Pantalla>
    )
  }

  const despachado =
    pedido.estado === ESTADOS_PEDIDO.ENVIADO || pedido.estado === ESTADOS_PEDIDO.ENTREGADO
  const sinIniciar = pedido.estado === ESTADOS_PEDIDO.RECIBIDO
  const bloqueado = despachado || sinIniciar
  const completados = sinIniciar ? 1 : pedido.estado === ESTADOS_PEDIDO.PREPARACION ? 2 : 3
  const d = pedido.despacho
  const transportista = despachado ? d.empresaTransporte ?? '' : valores.transportista
  const numero = despachado ? d.numeroSeguimiento ?? '' : valores.numero
  const productos = pedido.total - pedido.envio
  const nombreCorto = pedido.cliente.nombre.split(' ')[0]

  return (
    <Pantalla>
      <Typography
        variant="caption"
        sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mb: 0.5 }}
      >
        Mi perfil / Taller Tierra / Emprendedor
        {/* TODO: conectar API (nombre del taller) */}
      </Typography>

      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}
      >
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
          Pedido #{pedido.id}
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate('/pedidos')}
          sx={{ bgcolor: 'white', color: 'text.primary', '&:hover': { bgcolor: 'grey.200' } }}
        >
          ← Pedidos recibidos
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 7fr) minmax(0, 5fr)' },
          alignItems: 'start',
        }}
      >
        {/* Tarjeta del pedido */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
            >
              <Typography variant="h6">{pedido.cliente.nombre}</Typography>

              <Stack direction="row" spacing={1}>
                {pedido.pagado && <EstadoChip estado="Pagado" />}
                <EstadoChip
                  estado={pedido.estado}
                  etiqueta={sinIniciar ? 'Por preparar' : undefined}
                />
              </Stack>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Recibido el {formatearFechaHora(pedido.fecha)}
            </Typography>

            <Divider />

            {pedido.items.map((item) => (
              <Stack key={item.id} direction="row" spacing={2}>
                <Avatar
                  variant="rounded"
                  src={item.imagen || undefined}
                  alt={item.nombre}
                  sx={{ width: 80, height: 80 }}
                >
                  {item.nombre[0]}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                    {item.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.variante} · SKU {item.sku} · {item.cantidad}{' '}
                    {item.cantidad === 1 ? 'unidad' : 'unidades'}
                  </Typography>
                  <Typography sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {pesos(item.precioUnitario * item.cantidad)}
                  </Typography>
                </Box>
              </Stack>
            ))}

            <Divider />

            <Box>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Dirección de entrega</Typography>
              <Typography variant="body2">
                {pedido.direccionEntrega.nombre} · {pedido.direccionEntrega.telefono}
              </Typography>
              <Typography variant="body2">{pedido.direccionEntrega.direccion}</Typography>
            </Box>

            {pedido.notaCliente && (
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                Nota del cliente: “{pedido.notaCliente}”
              </Typography>
            )}

            <Divider />

            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
            >
              <Typography variant="body2">
                Producto {pesos(productos)} + Envío {pesos(pedido.envio)}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Total {pesos(pedido.total)}
              </Typography>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              {pedido.pagado
                ? `Pago confirmado · ${pedido.medioPago} · Comprobante #P${pedido.id}`
                : 'Pago pendiente'}
            </Typography>
          </Stack>
        </Paper>

        {/* Tarjeta de despacho */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Preparar y despachar</Typography>

            <PasosPedido completados={completados} />

            <Typography variant="body2" color="text.secondary">
              {despachado
                ? `Pedido enviado${
                    d.ultimaActualizacion
                      ? ` · ${formatearFechaHora(d.ultimaActualizacion)}`
                      : ''
                  }. El cliente ya puede ver el seguimiento.`
                : `Despacha antes del ${formatearFecha(
                    d.fechaEstimada
                  )}. El cliente recibirá el seguimiento automáticamente.`}
            </Typography>

            {sinIniciar && (
              <Button variant="outlined" onClick={comenzar} disabled={procesando}>
                Comenzar preparación
              </Button>
            )}

            <Stack component="form" noValidate onSubmit={enviar} spacing={2}>
              <TextField
                select
                label="Transportista"
                required
                fullWidth
                value={transportista}
                onChange={cambiar('transportista')}
                error={Boolean(errores.transportista)}
                helperText={errores.transportista}
                disabled={bloqueado || procesando}
                slotProps={{
                  select: { displayEmpty: true },
                  inputLabel: { shrink: true },
                }}
              >
                <MenuItem value="" disabled>
                  Selecciona un transportista
                </MenuItem>
                {TRANSPORTISTAS.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Número de seguimiento"
                placeholder="Ingresa el número de envío"
                required
                fullWidth
                value={numero}
                onChange={cambiar('numero')}
                error={Boolean(errores.numero)}
                helperText={errores.numero}
                disabled={bloqueado || procesando}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { maxLength: 30 },
                }}
              />

              {sinIniciar && (
                <Typography variant="caption" color="text.secondary">
                  Comienza la preparación para poder despachar el pedido.
                </Typography>
              )}

              <Button type="submit" variant="contained" disabled={bloqueado || procesando}>
                {procesando && !sinIniciar ? 'Guardando…' : 'Marcar como enviado'}
              </Button>
            </Stack>

            <Button
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => setAviso({ tipo: 'info', mensaje: 'Próximamente' })}
            >
              Contactar a {nombreCorto}
            </Button>

            {!despachado && (
              <>
                <Divider />

                <Typography variant="body2" color="text.secondary">
                  ¿Hay un problema con la compra?
                </Typography>

                {cancelacion ? (
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Cancelación solicitada
                  </Typography>
                ) : (
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    onClick={() => setDialogo(true)}
                    sx={{ alignSelf: 'flex-start', textAlign: 'left' }}
                  >
                    Solicitar cancelación del pedido
                  </Link>
                )}
              </>
            )}
          </Stack>
        </Paper>
      </Box>

      <Dialog
        open={dialogo}
        onClose={() => setDialogo(false)}
        aria-labelledby="cancelar-titulo"
      >
        <DialogTitle id="cancelar-titulo">¿Solicitar la cancelación del pedido?</DialogTitle>
        <DialogContent>
          <Typography>
            Se enviará la solicitud de cancelación del pedido #{pedido.id}. Esta acción no se
            puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogo(false)}>Volver</Button>
          <Button variant="contained" color="error" onClick={confirmarCancelacion}>
            Solicitar cancelación
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={4000}
        onClose={() => setAviso(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {aviso ? (
          <Alert severity={aviso.tipo} variant="filled" onClose={() => setAviso(null)}>
            {aviso.mensaje}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Pantalla>
  )
}