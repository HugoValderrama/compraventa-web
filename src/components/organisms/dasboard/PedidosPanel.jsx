import { Link as RouterLink } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemText, Paper, Stack, Typography } from '@mui/material';
import TarjetaContador from '../../molecules/dashboard/TarjetaContador';
import ChipEstadoPedido from '../../molecules/dashboard/ChipEstadoPedido';
import { ESTADOS_PEDIDO } from '../../../utils/dashboard';
import { formatearFecha, pesos } from '../../../utils/formatos';

export default function PedidosPanel({ porEstado, recientes }) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Pedidos
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Todos tus pedidos, por estado
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
          gap: 1.5,
          my: 2,
        }}
      >
        {ESTADOS_PEDIDO.map((estado) => (
          <TarjetaContador key={estado} titulo={estado} valor={porEstado[estado] ?? 0} to="/pedidos" />
        ))}
      </Box>

      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Pedidos más recientes
      </Typography>

      {recientes.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Aún no tienes pedidos.
        </Typography>
      ) : (
        <List disablePadding>
          {recientes.map((pedido) => (
            <ListItemButton
              key={pedido.id}
              component={RouterLink}
              to={`/pedidos/${pedido.id}`}
              divider
              sx={{ gap: 1, flexWrap: 'wrap' }}
            >
              <ListItemText
                primary={`#${pedido.id}`}
                secondary={`${pedido.cliente} · ${formatearFecha(pedido.fecha)}`}
                sx={{ flex: '1 1 160px', '& .MuiListItemText-primary': { fontWeight: 600 } }}
              />
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 700 }}>{pesos(pedido.total)}</Typography>
                <ChipEstadoPedido estado={pedido.estado} />
              </Stack>
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
}