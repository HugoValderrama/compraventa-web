import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { formatearFecha, pesos } from '../../../utils/formatos';
import { fechaLocal } from '../../../utils/dashboard';

const compacto = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  notation: 'compact',
  maximumFractionDigits: 0,
});
const mesCorto = new Intl.DateTimeFormat('es-CL', { month: 'short' });
const mesLargo = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });
const dosDigitos = (n) => String(n).padStart(2, '0');

function etiquetaEje(iso, periodo) {
  const fecha = fechaLocal(iso);
  if (!fecha) return '';
  return periodo === '12m'
    ? mesCorto.format(fecha).replace('.', '')
    : `${dosDigitos(fecha.getDate())}-${dosDigitos(fecha.getMonth() + 1)}`;
}

const etiquetaCompleta = (iso, periodo) =>
  periodo === '12m' ? mesLargo.format(fechaLocal(iso)) : formatearFecha(iso);

export default function GraficoVentas({ serie, periodo }) {
  const theme = useTheme();
  const [verTabla, setVerTabla] = useState(false);

  const conVentas = serie.filter((punto) => punto.total > 0);
  const unidad = periodo === '12m' ? 'mes' : 'día';
  const unidades = periodo === '12m' ? 'meses' : 'días';
  const mejor = conVentas.reduce((m, p) => (!m || p.total > m.total ? p : m), null);
  const resumen = mejor
    ? `Gráfico de barras de ventas. Mejor ${unidad}: ${etiquetaCompleta(mejor.fecha, periodo)}, con ${pesos(mejor.total)}.`
    : 'Gráfico de ventas sin datos.';

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Ventas del periodo
      </Typography>

      {conVentas.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 8, textAlign: 'center' }}>
          Aún no hay ventas en este periodo
        </Typography>
      ) : (
        <>
          <Box role="img" aria-label={resumen} sx={{ width: '100%', height: 280, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={(f) => etiquetaEje(f, periodo)}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  interval="preserveStartEnd"
                  minTickGap={12}
                />
                <YAxis
                  tickFormatter={(v) => compacto.format(v)}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  width={72}
                />
                <Tooltip
                  formatter={(valor) => [pesos(valor), 'Ventas']}
                  labelFormatter={(f) => etiquetaCompleta(f, periodo)}
                  cursor={{ fill: alpha(theme.palette.primary.main, 0.08) }}
                />
                <Bar dataKey="total" name="Ventas" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Button
            size="small"
            onClick={() => setVerTabla((v) => !v)}
            aria-expanded={verTabla}
            aria-controls="tabla-ventas"
            sx={{ mt: 1 }}
          >
            {verTabla ? 'Ocultar tabla de datos' : 'Ver datos en tabla'}
          </Button>

          {verTabla && (
            <>
              <TableContainer id="tabla-ventas" sx={{ maxHeight: 240, mt: 1 }}>
                <Table size="small" stickyHeader aria-label={`Ventas por ${unidad} con movimiento`}>
                  <TableHead>
                    <TableRow>
                      <TableCell>{periodo === '12m' ? 'Mes' : 'Fecha'}</TableCell>
                      <TableCell align="right">Ventas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conVentas.map((punto) => (
                      <TableRow key={punto.fecha}>
                        <TableCell>{etiquetaCompleta(punto.fecha, periodo)}</TableCell>
                        <TableCell align="right">{pesos(punto.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Solo se muestran los {unidades} con ventas.
              </Typography>
            </>
          )}
        </>
      )}
    </Paper>
  );
}