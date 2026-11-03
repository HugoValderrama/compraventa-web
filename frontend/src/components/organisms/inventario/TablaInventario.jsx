import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from '@mui/material';
import CabeceraProductoInventario from '../../molecules/inventario/CabeceraProductoInventario';
import ChipEstadoStock from '../../molecules/inventario/ChipEstadoStock';
import EditorStock from '../../molecules/inventario/EditorStock';
import AccionesFilaStock from '../../molecules/inventario/AccionesFilaStock';
import { estadoEdicion, estadoStock, nombreVariante } from '../../../utils/inventario';

export default function TablaInventario({
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
    <TableContainer>
      <Table aria-label="Inventario por variante">
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>Variante</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {grupos.flatMap((grupo) =>
            grupo.filas.map((item, i) => {
              const ed = estadoEdicion(item, ediciones);
              const enProceso = Boolean(guardando[item.varianteId]);
              const ultima = i === grupo.filas.length - 1;

              return (
                <TableRow
                  key={item.varianteId}
                  sx={{
                    bgcolor: ed.modificada ? (t) => alpha(t.palette.warning.main, 0.14) : undefined,
                    '& > td': ultima ? { borderBottom: '2px solid', borderBottomColor: 'divider' } : undefined,
                  }}
                >
                  {i === 0 && (
                    <TableCell
                      rowSpan={grupo.filas.length}
                      sx={{
                        verticalAlign: 'top',
                        minWidth: 240,
                        borderBottom: '2px solid',
                        borderBottomColor: 'divider',
                      }}
                    >
                      <CabeceraProductoInventario grupo={grupo} onNavegar={onNavegar} />
                    </TableCell>
                  )}

                  <TableCell>{item.etiqueta || 'Variante única'}</TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {item.sku || '—'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <EditorStock
                      idCampo={`stock-${item.varianteId}`}
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
                  </TableCell>

                  <TableCell>
                    <ChipEstadoStock estado={estadoStock(item.stock)} sinGuardar={ed.modificada} />
                  </TableCell>

                  <TableCell sx={{ minWidth: 190 }}>
                    <AccionesFilaStock
                      visibles={ed.modificada}
                      puedeGuardar={!ed.error}
                      guardando={enProceso}
                      bloqueado={bloqueado}
                      onGuardar={() => onGuardar(item)}
                      onDescartar={() => onDescartar(item)}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}