import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Paper,
  Rating,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Pantalla from './Pantalla';
import Notificacion from '../../components/molecules/Notificacion';
import ProductoCard from '../../components/molecules/producto/ProductoCard';
import ProductoPrecio from '../../components/molecules/producto/ProductoPrecio';
import ProductoStock from '../../components/molecules/producto/ProductoStock';
import SelectorVariante from '../../components/molecules/producto/SelectorVariante';
import SelectorCantidad from '../../components/molecules/producto/SelectorCantidad';
import EntregaProducto from '../../components/molecules/producto/EntregaProducto';
import GaleriaProducto from '../../components/organisms/producto/GaleriaProducto';
import AccionesProducto from '../../components/organisms/producto/AccionesProducto';
import PreguntasProducto from '../../components/organisms/producto/PreguntasProducto';
import ResenasProducto from '../../components/organisms/producto/ResenasProducto';
import {
  addToCart,
  addToWishlist,
  createQuestion,
  deleteProduct,
  getProduct,
  getQuestions,
  getRelatedProducts,
  getReviews,
} from '../../mocks/productos';
import { getMe } from '../../mocks/usuario';
import { esCliente, esEmprendedor } from '../../utils/roles';
import { stockTotal } from '../../utils/productos';

const RUTAS = {
  login: '/login',
  carrito: '/carrito',
  deseos: '/lista-deseos',
  preguntas: '/mis-preguntas',
  catalogo: '/catalogo',
  misProductos: '/productos',
  tienda: (id) => `/tiendas/${id}`,
};

const SIN_AVISO = { open: false, mensaje: '', severidad: 'success' };
const EXTRAS_INICIAL = { cargando: true, relacionados: [], preguntas: [], resenas: [], fallos: {} };

// 'visitante' | 'cliente' | 'dueno' | 'lectura' (emprendedor que no es dueño)
function calcularVista(usuario, producto) {
  if (!usuario) return 'visitante';
  if (esEmprendedor(usuario) && producto.emprendedorId === usuario.id) return 'dueno';
  if (esCliente(usuario)) return 'cliente';
  return 'lectura';
}

function NoEncontrado({ onCatalogo }) {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Producto no encontrado
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          El producto que buscas no existe o ya no está disponible.
        </Typography>
        <Button variant="contained" onClick={onCatalogo}>
          Ir al catálogo
        </Button>
      </Stack>
    </Paper>
  );
}

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [estado, setEstado] = useState('cargando'); // cargando | listo | noEncontrado | error
  const [producto, setProducto] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [extras, setExtras] = useState(EXTRAS_INICIAL);
  const [varianteId, setVarianteId] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [errorVariante, setErrorVariante] = useState('');
  const [pestana, setPestana] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [aviso, setAviso] = useState(SIN_AVISO);

  const cargarExtras = useCallback(async () => {
    setExtras((e) => ({ ...e, cargando: true }));
    const [rel, preg, res] = await Promise.allSettled([
      getRelatedProducts(id),
      getQuestions(id),
      getReviews(id),
    ]);
    setExtras({
      cargando: false,
      relacionados: rel.status === 'fulfilled' ? rel.value : [],
      preguntas: preg.status === 'fulfilled' ? preg.value : [],
      resenas: res.status === 'fulfilled' ? res.value : [],
      fallos: {
        relacionados: rel.status === 'rejected',
        preguntas: preg.status === 'rejected',
        resenas: res.status === 'rejected',
      },
    });
  }, [id]);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      // La página es pública: si no hay sesión (o falla), se trata como visitante.
      const [p, yo] = await Promise.all([getProduct(id), getMe().catch(() => null)]);

      // Un producto inactivo solo lo ve su dueño.
      if (!p.activo && calcularVista(yo, p) !== 'dueno') {
        setEstado('noEncontrado');
        return;
      }

      setProducto(p);
      setUsuario(yo);
      setEstado('listo');
      cargarExtras();
    } catch (err) {
      setEstado(err.codigo === 404 ? 'noEncontrado' : 'error');
    }
  }, [id, cargarExtras]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const vista = producto ? calcularVista(usuario, producto) : null;
  const variantes = producto?.variantes ?? [];
  const unica = variantes.length === 1 ? variantes[0] : null;
  const variante = variantes.find((v) => v.id === varianteId) ?? unica;
  const total = producto ? stockTotal(producto) : 0;
  const stockActual = variante ? variante.stock : total;
  const resenas = extras.resenas;
  const promedio = resenas.length ? resenas.reduce((s, r) => s + r.estrellas, 0) / resenas.length : 0;
  const caracteristicas = producto
    ? Object.entries(producto.caracteristicas).filter(([, valor]) => valor)
    : [];
  const puedeComprar = vista === 'cliente' || vista === 'visitante';

  const fallar = (err, mensajeBase) => {
    setAviso({ open: true, mensaje: err.message || mensajeBase, severidad: 'error' });
    setOcupado(false);
  };

  const elegirVariante = (v) => {
    setVarianteId(v.id);
    setErrorVariante('');
    setCantidad((c) => Math.max(1, Math.min(c, v.stock)));
  };

  const agregarAlCarrito = async () => {
    if (!variante) {
      setErrorVariante(`Selecciona ${producto.tipoVariante.toLowerCase()}.`);
      return;
    }
    setOcupado(true);
    try {
      await addToCart(producto.id, variante.id, cantidad);
      navigate(RUTAS.carrito);
    } catch (err) {
      fallar(err, 'No se pudo agregar al carrito.');
    }
  };

  const agregarADeseos = async () => {
    setOcupado(true);
    try {
      await addToWishlist(producto.id);
      navigate(RUTAS.deseos);
    } catch (err) {
      fallar(err, 'No se pudo agregar a la lista de deseos.');
    }
  };

  const eliminar = async () => {
    setOcupado(true);
    try {
      await deleteProduct(producto.id);
      navigate(RUTAS.misProductos, { replace: true, state: { mensaje: 'Producto eliminado.' } });
    } catch (err) {
      setConfirmando(false);
      fallar(err, 'No se pudo eliminar el producto.');
    }
  };

  const enviarPregunta = async (texto) => {
    const nueva = await createQuestion(producto.id, texto);
    setExtras((e) => ({ ...e, preguntas: [nueva, ...e.preguntas] }));
    setAviso({ open: true, mensaje: 'Tu pregunta fue enviada.', severidad: 'success' });
  };

  const modoPreguntas =
    vista === 'cliente' ? 'formulario' : vista === 'visitante' ? 'login' : 'ninguno';

  return (
    <Pantalla volver destino={vista === 'dueno' ? RUTAS.misProductos : RUTAS.catalogo}>
      {estado === 'cargando' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'white' }} aria-label="Cargando producto" />
        </Box>
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
          No pudimos cargar el producto. Inténtalo de nuevo.
        </Alert>
      )}

      {estado === 'noEncontrado' && <NoEncontrado onCatalogo={() => navigate(RUTAS.catalogo)} />}

      {estado === 'listo' && producto && (
        <>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <GaleriaProducto fotos={producto.fotos} nombre={producto.nombre} />
                </Box>

                <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: '#62A7F5', fontWeight: 700 }}>
                      {producto.categoria}
                    </Typography>
                    {producto.restriccionEdad && <Chip label="+18" size="small" color="warning" />}
                    {!producto.activo && <Chip label="Inactivo" size="small" />}
                  </Stack>

                  <Typography variant="h5" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                    {producto.nombre}
                  </Typography>

                  {producto.tienda && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Vendido por{' '}
                      <Link
                        component={RouterLink}
                        to={RUTAS.tienda(producto.tienda.id)}
                        underline="hover"
                        sx={{ fontWeight: 600 }}
                      >
                        {producto.tienda.nombre}
                      </Link>
                    </Typography>
                  )}

                  {resenas.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Rating value={promedio} precision={0.5} readOnly size="small" />
                      <Link component="button" type="button" variant="body2" underline="hover" onClick={() => setPestana(3)}>
                        ({resenas.length})
                      </Link>
                    </Stack>
                  )}

                  <ProductoPrecio producto={producto} grande />

                  {!producto.activo && (
                    <Alert severity="warning">Este producto está inactivo: los clientes no lo ven.</Alert>
                  )}

                  {producto.restriccionEdad && (
                    <Alert severity="warning">Producto solo para mayores de 18 años (+18).</Alert>
                  )}

                  {variantes.some((v) => v.etiqueta) && (
                    <SelectorVariante
                      tipo={producto.tipoVariante}
                      variantes={variantes}
                      seleccionadaId={variante?.id ?? null}
                      onSeleccionar={elegirVariante}
                      error={errorVariante}
                    />
                  )}

                  <ProductoStock stock={stockActual} />

                  {puedeComprar && (
                    <SelectorCantidad
                      cantidad={cantidad}
                      max={variante ? variante.stock : 0}
                      onChange={setCantidad}
                      deshabilitado={!variante}
                    />
                  )}

                  <EntregaProducto envio={producto.envio} />

                  <AccionesProducto
                    vista={vista}
                    sinStock={total === 0}
                    ocupado={ocupado}
                    onCarrito={agregarAlCarrito}
                    onDeseos={agregarADeseos}
                    onMisPreguntas={() => navigate(RUTAS.preguntas)}
                    onLogin={() => navigate(RUTAS.login)}
                    onEditar={() => navigate(`/productos/${producto.id}/editar`)}
                    onEliminar={() => setConfirmando(true)}
                    onVolver={() => navigate(RUTAS.misProductos)}
                  />
                </Stack>
              </Stack>

              <Box>
                <Tabs
                  value={pestana}
                  onChange={(_, valor) => setPestana(valor)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                >
                  <Tab label="Especificaciones" />
                  <Tab label="Descripción" />
                  <Tab label={`Preguntas (${extras.preguntas.length})`} />
                  <Tab label={`Reseñas (${resenas.length})`} />
                </Tabs>
                <Divider />
              </Box>

              {pestana === 0 &&
                (caracteristicas.length ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    {caracteristicas.map(([clave, valor]) => (
                      <Typography key={clave} variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                        <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                          {clave}:
                        </Box>
                        {valor}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2">Este producto no tiene especificaciones.</Typography>
                ))}

              {pestana === 1 && (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                  {producto.descripcion || 'Este producto no tiene descripción.'}
                </Typography>
              )}

              {pestana === 2 && (
                <PreguntasProducto
                  preguntas={extras.preguntas}
                  cargando={extras.cargando}
                  fallo={Boolean(extras.fallos.preguntas)}
                  onReintentar={cargarExtras}
                  modo={modoPreguntas}
                  onEnviar={enviarPregunta}
                  onLogin={() => navigate(RUTAS.login)}
                />
              )}

              {pestana === 3 && (
                <ResenasProducto
                  resenas={resenas}
                  promedio={promedio}
                  cargando={extras.cargando}
                  fallo={Boolean(extras.fallos.resenas)}
                  onReintentar={cargarExtras}
                />
              )}
            </Stack>
          </Paper>

          <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Productos relacionados
            </Typography>

            {extras.cargando && <CircularProgress size={24} aria-label="Cargando productos relacionados" />}

            {!extras.cargando && extras.fallos.relacionados && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={cargarExtras}>
                    Reintentar
                  </Button>
                }
              >
                No pudimos cargar los productos relacionados.
              </Alert>
            )}

            {!extras.cargando && !extras.fallos.relacionados && extras.relacionados.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No hay productos relacionados por ahora.
              </Typography>
            )}

            {extras.relacionados.length > 0 && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                  gap: 2,
                }}
              >
                {extras.relacionados.map((p) => (
                  <ProductoCard key={p.id} producto={p} onClick={() => navigate(`/productos/${p.id}`)} />
                ))}
              </Box>
            )}
          </Paper>
        </>
      )}

      <Dialog
        open={confirmando}
        onClose={() => !ocupado && setConfirmando(false)}
        aria-labelledby="eliminar-titulo"
      >
        <DialogTitle id="eliminar-titulo">¿Eliminar “{producto?.nombre}”?</DialogTitle>
        <DialogContent>
          <Typography>Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmando(false)} disabled={ocupado}>
            Volver
          </Button>
          <Button color="error" variant="contained" onClick={eliminar} disabled={ocupado}>
            {ocupado ? 'Eliminando…' : 'Eliminar producto'}
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