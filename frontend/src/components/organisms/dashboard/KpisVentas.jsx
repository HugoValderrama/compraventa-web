import { Box } from '@mui/material';
import TarjetaKpi from '../../molecules/dashboard/TarjetaKpi';
import { pesos } from '../../../utils/formatos';

// La variación lleva flecha y texto, no solo color.
function describirVariacion(pct) {
  if (pct === null) {
    return { valor: '—', detalle: 'Sin datos del periodo anterior', color: 'text.secondary' };
  }
  if (pct === 0) {
    return { valor: '■ 0 %', detalle: 'Sin cambios respecto al periodo anterior', color: 'text.secondary' };
  }
  const sube = pct > 0;
  return {
    valor: `${sube ? '▲ +' : '▼ −'}${Math.abs(pct)} %`,
    detalle: `${sube ? 'Subió' : 'Bajó'} respecto al periodo anterior`,
    color: sube ? 'success.main' : 'error.main',
  };
}

export default function KpisVentas({ ventas }) {
  const variacion = describirVariacion(ventas.variacionPct);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      <TarjetaKpi titulo="Ventas del periodo" valor={pesos(ventas.total)} />
      <TarjetaKpi titulo="Pedidos" valor={ventas.pedidos.toLocaleString('es-CL')} />
      <TarjetaKpi titulo="Ticket promedio" valor={pesos(ventas.ticketPromedio)} />
      <TarjetaKpi
        titulo="Variación de ventas"
        valor={variacion.valor}
        detalle={variacion.detalle}
        color={variacion.color}
      />
    </Box>
  );
}