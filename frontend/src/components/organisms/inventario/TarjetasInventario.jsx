import { Box, Paper, Stack, Typography, alpha } from '@mui/material';
import CabeceraProductoInventario from '../../molecules/inventario/CabeceraProductoInventario';
import ChipEstadoStock from '../../molecules/inventario/ChipEstadoStock';
import EditorStock from '../../molecules/inventario/EditorStock';
import AccionesFilaStock from '../../molecules/inventario/AccionesFilaStock';
import { estadoEdicion, estadoStock, nombreVariante } from '../../../utils/inventario';

export default function TarjetasInventario({
  grupos,
  ediciones,
  guardando,
  bloqueado,
  onCambiar,
  onAjustar,
  onGuardar,
  onDescartar,
  onNavegar,
}) {
  return (
    <Stack spacing={3}>
      {grupos.map((grupo) => (
        <Stack key={grupo.productoId} spacing={1.5}>
          <CabeceraProductoInventario grupo={grupo} onNavegar={onNavegar} />

          {grupo.filas.map((item) => {
            const ed = estadoEdicion(item, ediciones);
            const enProceso = Boolean(guardando[item.varianteId]);

            return (
              <Paper
                key={item.varianteId}
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: ed.modificada ? (t) => alpha(t.palette.warning.main, 0.14) : undefined,
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600 }}>{item.etiqueta || 'Variante única'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        SKU: {item.sku || '—'}
                      </Typography>
                    </Box>
                    <ChipEstadoStock estado={estadoStock(item.stock)} sinGuardar={ed.modificada} />
                  </Stack>

                  <EditorStock
                    idCampo={`stock-movil-${item.varianteId}`}
                    nombre={nombreVariante(item)}
                    valor={ed.valor}
                    error={ed.error}
                    puedeBajar={ed.puedeBajar}
                    puedeSubir={ed.puedeSubir}
                    deshabilitado={bloqueado || enProceso}
                    onCambiar={(texto) => onCambiar(item, texto)}
                    onMenos={() => onAjustar(item, -1)}
                    onMas={() => onAjustar(item, 1)}
                  />

                  <AccionesFilaStock
                    visibles={ed.modificada}
                    puedeGuardar={!ed.error}
                    guardando={enProceso}
                    bloqueado={bloqueado}
                    onGuardar={() => onGuardar(item)}
                    onDescartar={() => onDescartar(item)}
                  />
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ))}
    </Stack>
  );
}