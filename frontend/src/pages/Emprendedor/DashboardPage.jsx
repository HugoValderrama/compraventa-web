import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import Pantalla from '../Productos/Pantalla';
import SelectorPeriodo from '../../components/molecules/dashboard/SelectorPeriodo';
import KpisVentas from '../../components/organisms/dashboard/KpisVentas';
import GraficoVentas from '../../components/organisms/dashboard/GraficoVentas';
import AlertaStockCritico from '../../components/organisms/dashboard/AlertaStockCritico';
import PedidosPanel from '../../components/organisms/dashboard/PedidosPanel';
import TopProductos from '../../components/organisms/dashboard/TopProductos';
import PendientesPanel from '../../components/organisms/dashboard/PendientesPanel';
import AccesosRapidos from '../../components/organisms/dashboard/AccesosRapidos';
import { useAuth } from '../../context/AuthContext';
import { getDashboard } from '../../mocks/dashboard';

// Escritorio: 12 columnas. Móvil: una columna con este orden:
// alerta de stock, KPI, gráfico, pendientes, pedidos, top productos, accesos.
const celda = (columnas, ordenMovil) => ({
  gridColumn: { xs: 'auto', md: `span ${columnas}` },
  order: { xs: ordenMovil, md: 0 },
});

const REJILLA = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(12, minmax(0, 1fr))' },
  gap: 3,
};

function EsqueletoPanel() {
  const bloque = (alto) => (
    <Skeleton variant="rounded" height={alto} sx={{ bgcolor: 'rgba(255,255,255,0.35)' }} />
  );

  return (
    <Box aria-busy="true" aria-label="Cargando panel" sx={REJILLA}>
      <Box
        sx={{
          gridColumn: { md: 'span 12' },
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <Box key={i}>{bloque(92)}</Box>
        ))}
      </Box>
      <Box sx={{ gridColumn: { md: 'span 8' } }}>{bloque(360)}</Box>
      <Box sx={{ gridColumn: { md: 'span 4' } }}>{bloque(360)}</Box>
      <Box sx={{ gridColumn: { md: 'span 7' } }}>{bloque(300)}</Box>
      <Box sx={{ gridColumn: { md: 'span 5' } }}>{bloque(300)}</Box>
    </Box>
  );
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [periodo, setPeriodo] = useState('30d');
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [datos, setDatos] = useState(null);
  const [redirigir, setRedirigir] = useState(null);
  const solicitud = useRef(0);

  const cargar = useCallback(async () => {
    const actual = solicitud.current + 1;
    solicitud.current = actual;
    setEstado('cargando');
    try {
      const respuesta = await getDashboard(periodo);
      if (actual !== solicitud.current) return; // llegó una respuesta de un periodo anterior
      setDatos(respuesta);
      setEstado('listo');
    } catch (err) {
      if (actual !== solicitud.current) return;
      if (err.codigo === 401) setRedirigir('/login');
      else if (err.codigo === 403) setRedirigir('/');
      else setEstado('error');
    }
  }, [periodo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (redirigir) return <Navigate to={redirigir} replace />;

  const nombre = usuario?.nombre?.trim().split(/\s+/)[0] ?? '';

  return (
    <Pantalla ancho="lg">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}
      >
        <Typography component="p" variant="h6" sx={{ color: 'white' }}>
          {nombre ? `Hola, ${nombre}` : 'Hola'}
        </Typography>
        <SelectorPeriodo valor={periodo} onChange={setPeriodo} />
      </Stack>

      {estado === 'cargando' && <EsqueletoPanel />}

      {estado === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={cargar}>
              Reintentar
            </Button>
          }
        >
          No pudimos cargar tu panel. Inténtalo de nuevo.
        </Alert>
      )}

      {estado === 'listo' && datos && (
        <Box sx={REJILLA}>
          <Box sx={celda(12, 2)}>
            <KpisVentas ventas={datos.ventas} />
          </Box>

          <Box sx={celda(8, 3)}>
            <GraficoVentas serie={datos.serie} periodo={datos.periodo} />
          </Box>

          <Box sx={celda(4, 1)}>
            <AlertaStockCritico alertas={datos.stockCritico} />
          </Box>

          <Box sx={celda(7, 5)}>
            <PedidosPanel porEstado={datos.pedidosPorEstado} recientes={datos.pedidosRecientes} />
          </Box>

          <Box sx={celda(5, 6)}>
            <TopProductos productos={datos.topProductos} />
          </Box>

          <Box sx={celda(6, 4)}>
            <PendientesPanel
              cotizaciones={datos.cotizacionesPendientes}
              preguntas={datos.preguntasPendientes}
            />
          </Box>

          <Box sx={celda(6, 7)}>
            <AccesosRapidos />
          </Box>
        </Box>
      )}
    </Pantalla>
  );
}