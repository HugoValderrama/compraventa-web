import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, List, ListItem, Paper, Stack, Typography } from '@mui/material';
import ChipEstadoStock from '../../molecules/inventario/ChipEstadoStock';
import { estadoStock } from '../../../utils/inventario';

const MAX_FILAS = 5;

export default function AlertaStockCritico({ alertas }) {
  const navigate = useNavigate();
  const visibles = alertas.slice(0, MAX_FILAS);
  const restantes = alertas.length - visibles.length;
  const colorBorde = !alertas.length
    ? 'success.main'
    : alertas.some((a) => a.stock === 0)
      ? 'error.main'
      : 'warning.main';

  return (
    <Paper sx={{ p: 3, height: '100%', borderTop: '6px solid', borderTopColor: colorBorde }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Stock crítico
      </Typography>

      {alertas.length === 0 ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Todo en orden: ningún producto con stock bajo.
        </Alert>
      ) : (
        <List disablePadding sx={{ mt: 1 }}>
          {visibles.map((a) => (
            <ListItem
              key={a.varianteId}
              divider
              disableGutters
              sx={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}
            >
              <Box sx={{ flex: '1 1 150px', minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{a.productoNombre}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {a.etiqueta || 'Variante única'}
                </Typography>
              </Box>

              <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
                <Typography sx={{ fontWeight: 700 }}>
                  {a.stock} {a.stock === 1 ? 'unidad' : 'unidades'}
                </Typography>
                <ChipEstadoStock estado={estadoStock(a.stock)} />
              </Stack>

              <Button
                size="small"
                variant="outlined"
                aria-label={`Reponer ${a.productoNombre}${a.etiqueta ? ` · ${a.etiqueta}` : ''}`}
                onClick={() => navigate(`/inventario?buscar=${encodeURIComponent(a.sku || a.productoNombre)}`)}
              >
                Reponer
              </Button>
            </ListItem>
          ))}
        </List>
      )}

      <Stack direction="row" sx={{ mt: 2, justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {restantes > 0 ? `y ${restantes} más` : ''}
        </Typography>
        <Button onClick={() => navigate('/inventario')}>Ver todo el inventario</Button>
      </Stack>
    </Paper>
  );
}