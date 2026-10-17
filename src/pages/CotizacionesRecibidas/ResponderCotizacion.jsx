import { useState } from 'react'
import { Alert, Box, Button, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material'
import EstadoChip from '../../components/atoms/EstadoChip'
import { ESTADOS, responderSolicitud } from '../../mocks/cotizacionesRecibidas'
import { formatearFecha, hoyISO, pesos, sumarDias } from '../../utils/formatos'

function validarMonto(valor) {
  if (valor === '') return 'Campo obligatorio.'
  const n = Number(valor)
  if (!Number.isFinite(n)) return 'Ingresa un monto válido.'
  if (n < 0) return 'El monto debe ser mayor o igual a 0.'
  if (!Number.isInteger(n)) return 'Ingresa un monto sin decimales.'
  return ''
}

function validarFecha(valor) {
  if (!valor) return 'Campo obligatorio.'
  if (valor <= hoyISO()) return 'La fecha debe ser posterior a hoy.'
  return ''
}

function validar(v) {
  const errores = {
    precioTotal: validarMonto(v.precioTotal),
    envio: validarMonto(v.envio),
    entregaEstimada: validarFecha(v.entregaEstimada),
    validaHasta: validarFecha(v.validaHasta),
    detalle: v.detalle.trim() ? '' : 'Describe el detalle de tu propuesta.',
  }
  return Object.fromEntries(Object.entries(errores).filter(([, msg]) => msg))
}

function Contenedor({ titulo, codigo, estado, children }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6">{titulo}</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {estado && <EstadoChip estado={estado} />}
            {codigo && (
              <Typography variant="caption" color="text.secondary">
                #{codigo}
              </Typography>
            )}
          </Stack>
        </Stack>
        {children}
      </Stack>
    </Paper>
  )
}

function Dato({ etiqueta, valor }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {etiqueta}
      </Typography>
      <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {valor}
      </Typography>
    </Box>
  )
}

function Formulario({ solicitud, onRespondida }) {
  const [valores, setValores] = useState({
    precioTotal: '',
    entregaEstimada: '',
    envio: '',
    validaHasta: sumarDias(15),
    detalle: '',
  })
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)

  const editable = solicitud.estado === ESTADOS.PENDIENTE
  const respuesta = solicitud.respuesta

  const cambiar = (campo) => (event) => {
    setValores((actuales) => ({ ...actuales, [campo]: event.target.value }))
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
  }

  const campo = (nombre) => ({
  value: valores[nombre],
  onChange: cambiar(nombre),
  error: Boolean(errores[nombre]),
  helperText: errores[nombre],
  disabled: enviando,
  fullWidth: true,
  required: true,
  })

  const montosValidos = !validarMonto(valores.precioTotal) && !validarMonto(valores.envio)
  const totalVivo = montosValidos ? Number(valores.precioTotal) + Number(valores.envio) : 0

  const enviar = async (event) => {
    event.preventDefault()
    if (enviando) return

    const encontrados = validar(valores)
    setErrores(encontrados)
    if (Object.keys(encontrados).length) return

    setEnviando(true)
    setErrorEnvio('')

    try {
      const actualizada = await responderSolicitud(solicitud.id, {
        precioTotal: Number(valores.precioTotal),
        entregaEstimada: valores.entregaEstimada,
        envio: Number(valores.envio),
        validaHasta: valores.validaHasta,
        detalle: valores.detalle.trim(),
      })
      onRespondida(actualizada)
    } catch (err) {
      setErrorEnvio(err.message)
      setEnviando(false)
    }
  }

  return (
      <Contenedor
        titulo={`Responder a ${solicitud.cliente.nombre.split(' ')[0]}`}
        codigo={solicitud.codigo}
        estado={editable ? null : solicitud.estado}
      >
      <Typography sx={{ fontStyle: 'italic', overflowWrap: 'anywhere' }}>
        “{solicitud.mensaje}”
      </Typography>

      <Box>
        <Typography sx={{ fontWeight: 600, mb: 1 }}>Ítems solicitados</Typography>
        <Stack spacing={0.5}>
          {solicitud.items.map((item) => (
            <Typography key={item.nombre} variant="caption" color="text.secondary">
              {item.nombre} · {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'} ·{' '}
              {item.ubicacion}
            </Typography>
          ))}
        </Stack>
      </Box>

      {editable ? (
      <Stack component="form" noValidate onSubmit={enviar} spacing={2}>
        <Box
          sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}
        >
          <TextField
            label="Precio total (CLP)"
            type="number"
            {...campo('precioTotal')}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
              htmlInput: { min: 0, step: 1 },
            }}
          />
          <TextField
            label="Entrega estimada"
            type="date"
            {...campo('entregaEstimada')}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: sumarDias(1) } }}
          />
          <TextField
            label="Envío (CLP)"
            type="number"
            {...campo('envio')}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
              htmlInput: { min: 0, step: 1 },
            }}
          />
          <TextField
            label="Válida hasta"
            type="date"
            {...campo('validaHasta')}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: sumarDias(1) } }}
          />
        </Box>

        <TextField
          label="Detalle de tu propuesta"
          multiline
          minRows={3}
          {...campo('detalle')}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />

        {errorEnvio && <Alert severity="error">{errorEnvio}</Alert>}

        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
        >
          <Typography sx={{ fontWeight: 700 }}>Total: {pesos(totalVivo)}</Typography>

          <Button type="submit" variant="contained" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar cotización'}
          </Button>
        </Stack>
      </Stack>
      ) : respuesta ? (
        <Stack spacing={1.5}>
          <Typography sx={{ fontWeight: 600 }}>Tu respuesta</Typography>
          <Dato etiqueta="Precio total" valor={pesos(respuesta.precioTotal)} />
          <Dato etiqueta="Envío" valor={pesos(respuesta.envio)} />
          <Dato etiqueta="Entrega estimada" valor={formatearFecha(respuesta.entregaEstimada)} />
          <Dato etiqueta="Válida hasta" valor={formatearFecha(respuesta.validaHasta)} />
          <Dato etiqueta="Detalle de tu propuesta" valor={respuesta.detalle} />
          <Typography sx={{ fontWeight: 700 }}>
            Total: {pesos(respuesta.precioTotal + respuesta.envio)}
          </Typography>
        </Stack>
      ) : (
        <Alert severity="info">
          Esta solicitud está {solicitud.estado.toLowerCase()} y ya no admite respuesta.
        </Alert>
      )}
    </Contenedor>
  )
}

export default function ResponderCotizacion({ solicitud, noEncontrada, cargando, onRespondida }) {
  if (solicitud) {
    // key: reinicia el formulario al cambiar de solicitud
    return <Formulario key={solicitud.id} solicitud={solicitud} onRespondida={onRespondida} />
  }

  return (
    <Contenedor titulo="Responder cotización">
      {noEncontrada ? (
        <Alert severity="warning">Solicitud no encontrada.</Alert>
      ) : (
        <Typography color="text.secondary">
          {cargando ? 'Cargando…' : 'Selecciona una solicitud para responder'}
        </Typography>
      )}
    </Contenedor>
  )
}