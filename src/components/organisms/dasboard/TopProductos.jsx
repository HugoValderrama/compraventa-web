import { Link as RouterLink } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { pesos } from '../../../utils/formatos';

function Contenido({ producto, posicion }) {
  return (
    <>
      <Typography sx={{ width: 20, fontWeight: 700, color: 'text.secondary' }}>{posicion}</Typography>
      <ListItemText
        primary={producto.nombre}
        secondary={`${producto.unidades} ${producto.unidades === 1 ? 'unidad' : 'unidades'}`}
        sx={{ '& .MuiListItemText-primary': { fontWeight: 600, overflowWrap: 'anywhere' } }}
      />
      <Typography sx={{ fontWeight: 700 }}>{pesos(producto.total)}</Typography>
    </>
  );
}

export default function TopProductos({ productos }) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Productos más vendidos
      </Typography>

      {productos.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
          Aún no hay ventas en este periodo
        </Typography>
      ) : (
        <List disablePadding sx={{ mt: 1 }}>
          {productos.map((producto, i) =>
            producto.productoId ? (
              <ListItemButton
                key={producto.productoId}
                component={RouterLink}
                to={`/productos/${producto.productoId}`}
                divider
                sx={{ gap: 1 }}
              >
                <Contenido producto={producto} posicion={i + 1} />
              </ListItemButton>
            ) : (
              // Producto sin ficha en el catálogo: se muestra, pero no hay detalle al que ir.
              <ListItem key={producto.nombre} divider sx={{ gap: 1 }}>
                <Contenido producto={producto} posicion={i + 1} />
              </ListItem>
            )
          )}
        </List>
      )}
    </Paper>
  );
}