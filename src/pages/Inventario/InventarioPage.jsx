import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Pantalla from '../Productos/Pantalla';
import Notificacion from '../../components/molecules/Notificacion';
import TarjetaResumenStock from '../../components/molecules/inventario/TarjetaResumenStock';
import TablaInventario from '../../components/organisms/inventario/TablaInventario';
import TarjetasInventario from '../../components/organisms/inventario/TarjetasInventario';
import { getInventory, updateVariantStock } from '../../mocks/inventario';
import { STOCK_BAJO } from '../../utils/productos';
import {
  MAX_STOCK,
  PRODUCTOS_POR_PAGINA,
  agruparPorProducto,
  contarEstados,
  estadoStock,
  nombreVariante,
  normalizarBusqueda,
  stockDesdeTexto,
  textoAlerta,
  validarStock,
} from '../../utils/inventario';

const SIN_AVISO = { open: false, mensaje: '', severidad: 'success' };

const FILTROS_ESTADO = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'disponible', texto: 'Disponible' },
  { valor: 'bajo', texto: 'Stock bajo' },
  { valor: 'agotado', texto: 'Agotado' },
  { valor: 'alertas', texto: 'Alertas (stock bajo y agotado)' },
];

const ORDENES = [
  { valor: 'stock', texto: 'Stock (menor a mayor)' },
  { valor: 'nombre', texto: 'Nombre del producto (A-Z)' },
];

const sinClave = (objeto, clave) => {
  const copia = { ...objeto };
  delete copia[clave];
  return copia;
};

const etiquetaPagina = (tipo, pagina, seleccionada) => {
  if (tipo === 'page') return seleccionada ? `Página ${pagina}` : `Ir a la página ${pagina}`;
  if (tipo === 'first') return 'Ir a la primera página';
  if (tipo === 'last') return 'Ir a la última página';
  if (tipo === 'next') return 'Ir a la página siguiente';
  return 'Ir a la página anterior';
};

export default function InventarioPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const movil = useMediaQuery(theme.breakpoints.down('md'));

  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [redirigir, setRedirigir] = useState(null);
  const [items, setItems] = useState([]);
  const [ediciones, setEdiciones] = useState({}); // { [varianteId]: texto } solo filas modificadas
  const [guardando, setGuardando] = useState({}); // { [varianteId]: true }
  const [guardandoLote, setGuardandoLote] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('stock');
  const [pagina, setPagina] = useState(1);
  const [destino, setDestino] = useState(null); // ruta pendiente de confirmar
  const [aviso, setAviso] = useState(SIN_AVISO);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      setItems(await getInventory());
      setEstado('listo');
    } catch (err) {
      if (err.codigo === 401) setRedirigir('/login');
      else if (err.codigo === 403) setRedirigir('/');
      else setEstado('error');
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cantidadCambios = Object.keys(ediciones).length;
  const hayCambios = cantidadCambios > 0;
  const hayInvalidas = Object.values(ediciones).some((texto) => validarStock(texto) !== '');

  // Avisa al cerrar o recargar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!hayCambios) return undefined;
    const avisar = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [hayCambios]);

  const conteo = useMemo(() => contarEstados(items), [items]);

  const filtrados = useMemo(() => {
    const consulta = normalizarBusqueda(busqueda);
    return items.filter((item) => {
      const est = estadoStock(item.stock);
      if (filtroEstado === 'alertas' && est === 'disponible') return false;
      if (['disponible', 'bajo', 'agotado'].includes(filtroEstado) && est !== filtroEstado) return false;
      return !consulta || normalizarBusqueda(`${item.productoNombre} ${item.sku}`).includes(consulta);
    });
  }, [items, filtroEstado, busqueda]);

  const grupos = useMemo(() => agruparPorProducto(filtrados, orden), [filtrados, orden]);
  const totalPaginas = Math.max(1, Math.ceil(grupos.length / PRODUCTOS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const gruposPagina = grupos.slice(
    (paginaActual - 1) * PRODUCTOS_POR_PAGINA,
    paginaActual * PRODUCTOS_POR_PAGINA
  );

  if (redirigir) return <Navigate to={redirigir} replace />;

  const cambiarFiltro = (valor) => {
    setFiltroEstado(valor);
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setFiltroEstado('todos');
    setBusqueda('');
    setPagina(1);
  };

  const cambiarTexto = (item, texto) =>
    setEdiciones((previo) =>
      stockDesdeTexto(texto) === item.stock
        ? sinClave(previo, item.varianteId)
        : { ...previo, [item.varianteId]: texto }
    );

  const ajustar = (item, delta) => {
    const actual = stockDesdeTexto(ediciones[item.varianteId] ?? String(item.stock)) ?? item.stock;
    cambiarTexto(item, String(Math.min(MAX_STOCK, Math.max(0, actual + delta))));
  };

  const descartar = (item) => setEdiciones((previo) => sinClave(previo, item.varianteId));

  const guardarFila = async (item, { silencioso = false } = {}) => {
    const numero = stockDesdeTexto(ediciones[item.varianteId] ?? '');
    if (numero === null) return false;

    setGuardando((previo) => ({ ...previo, [item.varianteId]: true }));
    try {
      const actualizada = await updateVariantStock(item.varianteId, numero);
      setItems((previo) =>
        previo.map((i) => (i.varianteId === actualizada.varianteId ? actualizada : i))
      );
      setEdiciones((previo) => sinClave(previo, item.varianteId));
      if (!silencioso) {
        setAviso({
          open: true,
          mensaje: `Stock guardado: ${nombreVariante(actualizada)} (${actualizada.stock}).`,
          severidad: 'success',
        });
      }
      return true;
    } catch (err) {
      if (!silencioso) {
        setAviso({
          open: true,
          mensaje: err.message || 'No se pudo guardar el stock. Inténtalo de nuevo.',
          severidad: 'error',
        });
      }
      return false;
    } finally {
      setGuardando((previo) => sinClave(previo, item.varianteId));
    }
  };

  const guardarTodo = async () => {
    const pendientes = items.filter((i) => ediciones[i.varianteId] !== undefined);
    setGuardandoLote(true);
    let guardadas = 0;
    for (const item of pendientes) {
      if (await guardarFila(item, { silencioso: true })) guardadas += 1;
    }
    setGuardandoLote(false);

    const fallidas = pendientes.length - guardadas;
    setAviso(
      fallidas === 0
        ? {
            open: true,
            mensaje: `${guardadas} ${guardadas === 1 ? 'cambio guardado' : 'cambios guardados'}.`,
            severidad: 'success',
          }
        : {
            open: true,
            mensaje: `Se guardaron ${guardadas} y ${fallidas} no se pudieron guardar. Inténtalo de nuevo.`,
            severidad: 'error',
          }
    );
  };

  // Enlaces propios de la pantalla: si hay cambios sin guardar, pide confirmación.
  const intentarNavegar = (evento, ruta) => {
    if (!hayCambios) return;
    evento.preventDefault();
    setDestino(ruta);
  };

  const propiedadesLista = {
    grupos: gruposPagina,
    ediciones,
    guardando,
    bloqueado: guardandoLote,
    onCambiar: cambiarTexto,
    onAjustar: ajustar,
    onGuardar: guardarFila,
    onDescartar: descartar,
    onNavegar: intentarNavegar,
  };

  const hayAlertas = conteo.bajo > 0 || conteo.agotado > 0;

  return (
    <Pantalla ancho="lg">
      <Typography sx={{ color: 'white', mb: 2 }}>
        Revisa y ajusta el stock de cada variante de tus productos.
      </Typography>

      {estado === 'cargando' && (
        <Stack spacing={2} aria-busy="true" aria-label="Cargando inventario">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={84} sx={{ bgcolor: 'rgba(255,255,255,0.35)' }} />
            ))}
          </Box>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rounded" height={56} />
              ))}
            </Stack>
          </Paper>
        </Stack>
      )}

      {estado === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={cargar}>
              Reintentar
            </Button>
          }
        >
          No pudimos cargar tu inventario. Inténtalo de nuevo.
        </Alert>
      )}

      {estado === 'listo' && items.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="h6">Aún no tienes productos en tu inventario</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Publica tu primer producto para controlar su stock desde aquí.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/productos/nuevo')}>
              Publicar producto
            </Button>
          </Stack>
        </Paper>
      )}

      {estado === 'listo' && items.length > 0 && (
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            <TarjetaResumenStock
              titulo="Total de variantes"
              valor={conteo.total}
              activa={filtroEstado === 'todos'}
              onClick={() => cambiarFiltro('todos')}
            />
            <TarjetaResumenStock
              titulo={`Disponibles (${STOCK_BAJO} o más)`}
              valor={conteo.disponible}
              color="success.main"
              activa={filtroEstado === 'disponible'}
              onClick={() => cambiarFiltro('disponible')}
            />
            <TarjetaResumenStock
              titulo={`Stock bajo (1 a ${STOCK_BAJO - 1})`}
              valor={conteo.bajo}
              color="warning.dark"
              activa={filtroEstado === 'bajo'}
              onClick={() => cambiarFiltro('bajo')}
            />
            <TarjetaResumenStock
              titulo="Agotadas (0)"
              valor={conteo.agotado}
              color="error.main"
              activa={filtroEstado === 'agotado'}
              onClick={() => cambiarFiltro('agotado')}
            />
          </Box>

          {hayAlertas && (
            <Alert
              severity="warning"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => cambiarFiltro(filtroEstado === 'alertas' ? 'todos' : 'alertas')}
                >
                  {filtroEstado === 'alertas' ? 'Ver todo' : 'Ver solo alertas'}
                </Button>
              }
            >
              {textoAlerta(conteo)}
            </Alert>
          )}

          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Buscar producto o SKU"
                  placeholder="Nombre o código del producto"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPagina(1);
                  }}
                  size="small"
                  fullWidth
                />
                <TextField
                  select
                  label="Estado"
                  value={filtroEstado}
                  onChange={(e) => cambiarFiltro(e.target.value)}
                  size="small"
                  sx={{ minWidth: 240 }}
                >
                  {FILTROS_ESTADO.map(({ valor, texto }) => (
                    <MenuItem key={valor} value={valor}>
                      {texto}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Ordenar por"
                  value={orden}
                  onChange={(e) => {
                    setOrden(e.target.value);
                    setPagina(1);
                  }}
                  size="small"
                  sx={{ minWidth: 230 }}
                >
                  {ORDENES.map(({ valor, texto }) => (
                    <MenuItem key={valor} value={valor}>
                      {texto}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              {hayCambios && (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{ justifyContent: 'flex-end', alignItems: { sm: 'center' } }}
                >
                  <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 600, mr: 1 }}>
                    {cantidadCambios} {cantidadCambios === 1 ? 'cambio sin guardar' : 'cambios sin guardar'}
                  </Typography>
                  <Button disabled={guardandoLote} onClick={() => setEdiciones({})}>
                    Descartar todo
                  </Button>
                  <Button
                    variant="contained"
                    disabled={hayInvalidas || guardandoLote}
                    onClick={guardarTodo}
                  >
                    {guardandoLote ? 'Guardando…' : `Guardar cambios (${cantidadCambios})`}
                  </Button>
                </Stack>
              )}

              {filtrados.length === 0 ? (
                <Stack spacing={2} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
                  <Typography>No hay variantes que coincidan con los filtros.</Typography>
                  <Button variant="outlined" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </Button>
                </Stack>
              ) : (
                <>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {filtrados.length} {filtrados.length === 1 ? 'variante' : 'variantes'} en{' '}
                    {grupos.length} {grupos.length === 1 ? 'producto' : 'productos'}
                  </Typography>

                  {movil ? (
                    <TarjetasInventario {...propiedadesLista} />
                  ) : (
                    <TablaInventario {...propiedadesLista} />
                  )}

                  {totalPaginas > 1 && (
                    <Pagination
                      count={totalPaginas}
                      page={paginaActual}
                      onChange={(_, valor) => setPagina(valor)}
                      getItemAriaLabel={etiquetaPagina}
                      sx={{ alignSelf: 'center' }}
                    />
                  )}
                </>
              )}

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Se marca “Stock bajo” cuando quedan menos de {STOCK_BAJO} unidades y “Disponible” desde{' '}
                {STOCK_BAJO}. El estado y los contadores reflejan el stock ya guardado.
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      )}

      <Dialog open={Boolean(destino)} onClose={() => setDestino(null)} aria-labelledby="salir-titulo">
        <DialogTitle id="salir-titulo">Tienes cambios sin guardar</DialogTitle>
        <DialogContent>
          <Typography>Si sales ahora, se perderán los cambios de stock que no guardaste.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDestino(null)}>Seguir editando</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              const ruta = destino;
              setDestino(null);
              navigate(ruta);
            }}
          >
            Salir sin guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Notificacion
        open={aviso.open}
        mensaje={aviso.mensaje}
        severidad={aviso.severidad}
        onClose={() => setAviso(SIN_AVISO)}
      />
    </Pantalla>
  );
}