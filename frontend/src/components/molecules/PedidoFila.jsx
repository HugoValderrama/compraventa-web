import { Box, Button, Stack, Typography } from '@mui/material'
import EstadoChip from '../atoms/EstadoChip'
import { ESTADOS_PEDIDO } from '../../mocks/pedidos'
import { formatearFechaHora, pesos } from '../../utils/formatos'

const POR_PREPARAR = [ESTADOS_PEDIDO.RECIBIDO, ESTADOS_PEDIDO.PREPARACION]

function resumenItems(items) {
  return items
    .map((i) => {
      const variante = i.variante?.replace(/^Tamaño\s+/, '')
      return `${i.cantidad} × ${i.nombre}${variante ? ` · ${variante}` : ''}`
    })
    .join(', ')
}

function entrega(pedido) {
  if (pedido.tipoEntrega === 'Retiro en taller') return 'Retiro en taller'

  // TODO: conectar API (el backend debería entregar la comuna por separado)
  const partes = pedido.direccionEntrega.direccion.split(',').map((t) => t.trim())
  const comuna = partes.length > 1 ? partes[partes.length - 2] : partes[0]
  return `Envío a ${comuna}`
}

export default function PedidoFila({ pedido, onVer }) {
  const porPreparar = POR_PREPARAR.includes(pedido.estado)

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        py: 2,
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
          #{pedido.id} · {pedido.cliente.nombre}
        </Typography>
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
          {resumenItems(pedido.items)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatearFechaHora(pedido.fecha)} · {entrega(pedido)}
        </Typography>
      </Box>

      <Stack spacing={0.5} sx={{ alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
        <Typography sx={{ fontWeight: 700 }}>{pesos(pedido.total)}</Typography>
        {pedido.pagado && <EstadoChip estado="Pagado" />}
      </Stack>

      <Stack spacing={1} sx={{ alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
        <EstadoChip
          estado={porPreparar ? ESTADOS_PEDIDO.RECIBIDO : pedido.estado}
          etiqueta={porPreparar ? 'Por preparar' : undefined}
        />
        <Button variant="contained" onClick={() => onVer(pedido)}>
          Ver detalle
        </Button>
      </Stack>
    </Stack>
  )
}