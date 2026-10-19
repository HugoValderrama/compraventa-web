import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Pantalla from './Pantalla';
import Notificacion from '../../components/molecules/Notificacion';
import ProductoImagen from '../../components/molecules/producto/ProductoImagen';
import ProductoPrecio from '../../components/molecules/producto/ProductoPrecio';
import ProductoStock from '../../components/molecules/producto/ProductoStock';
import { deleteProduct, getProduct } from '../../mocks/productos';
import { getMe } from '../../mocks/usuario';
import { esEmprendedor } from '../../utils/roles';
import { stockTotal } from '../../utils/productos';
import { pesos } from '../../utils/formatos';

const SIN_AVISO = { open: false, mensaje: '', severidad: 'success' };

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [varianteId, setVarianteId] = useState(null);
  const [pestana, setPestana] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [aviso, setAviso] = useState(SIN_AVISO);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [p, yo] = await Promise.all([getProduct(id), getMe()]);
      setProducto(p);
      setUsuario(yo);
    } catch (err) {
      setError(err.message || 'No pudimos cargar el producto.');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const eliminar = async () => {
    setEliminando(true);
    try {
      await deleteProduct(id);
      navigate('/productos', { replace: true, state: { mensaje: 'Producto eliminado.' } });
    } catch (err) {
      setConfirmando(false);
      setEliminando(false);
      setAviso({
        open: true,
        mensaje: err.message || 'No se pudo eliminar el producto.',
        severidad: 'error',
      });
    }
  };

  const esDueno =
    Boolean(producto && usuario) && esEmprendedor(usuario) && producto.emprendedorId === usuario.id;
  const variante = producto?.variantes.find((v) => v.id === varianteId);
  const stock = producto ? (variante ? variante.stock : stockTotal(producto)) : 0;
  const variantesConNombre = producto?.variantes.filter((v) => v.etiqueta) ?? [];
  const caracteristicas = producto
    ? Object.entries(producto.caracteristicas).filter(([, valor]) => valor)
    : [];

  return (
    <Pantalla volver>
      {cargando && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'white' }} aria-label="Cargando producto" />
        </Box>
      )}

      {!cargando && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={cargar}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!cargando && producto && (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <ProductoImagen src={producto.fotos[0]} nombre={producto.nombre} />
              </Box>

              <Stack spacing={1.5} sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#62A7F5', fontWeight: 700 }}>
                    {producto.categoria}
                  </Typography>
                  {!producto.activo && <Chip label="Inactivo" size="small" />}
                  {producto.restriccionEdad && <Chip label="+18" size="small" color="warning" />}
                </Stack>

                <Typography variant="h5" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                  {producto.nombre}
                </Typography>

                <ProductoPrecio producto={producto} grande />

                {variantesConNombre.length > 0 && (
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {producto.tipoVariante}:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                      {variantesConNombre.map((v) => (
                        <Chip
                          key={v.id}
                          label={v.etiqueta}
                          size="small"
                          variant={varianteId === v.id ? 'filled' : 'outlined'}
                          color={varianteId === v.id ? 'primary' : 'default'}
                          onClick={() => setVarianteId(v.id)}
                        />
                      ))}
                    </Stack>
                  </Stack>
                )}

                <ProductoStock stock={stock} />

                {esDueno ? (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      sx={{ flex: 1 }}
                      onClick={() => navigate(`/productos/${id}/editar`)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      sx={{ flex: 1 }}
                      onClick={() => setConfirmando(true)}
                    >
                      Eliminar
                    </Button>
                  </Stack>
                ) : (
                  <Button variant="contained" disabled={stock === 0 || !producto.activo}>
                    Agregar al carrito
                  </Button>
                )}
              </Stack>
            </Stack>

            <Tabs value={pestana} onChange={(_, valor) => setPestana(valor)}>
              <Tab label="Especificaciones" />
              <Tab label="Descripción" />
            </Tabs>
            <Divider sx={{ mt: '-16px !important' }} />

            {pestana === 0 && (
              <Stack spacing={1.5}>
                {caracteristicas.length > 0 && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2,
                    }}
                  >
                    {caracteristicas.map(([clave, valor]) => (
                      <Typography key={clave} variant="body2">
                        <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                          {clave}:
                        </Box>
                        {valor}
                      </Typography>
                    ))}
                  </Box>
                )}

                <Typography variant="body2">
                  <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                    Entrega:
                  </Box>
                  {[
                    producto.envio.retiroEnTaller && 'retiro en taller',
                    producto.envio.despacho &&
                      `despacho (${producto.envio.costoEnvio ? pesos(producto.envio.costoEnvio) : 'gratis'})`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  {` · preparación de ${producto.envio.diasPreparacion} ${
                    producto.envio.diasPreparacion === 1 ? 'día' : 'días'
                  }`}
                </Typography>
              </Stack>
            )}

            {pestana === 1 && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {producto.descripcion || 'Este producto no tiene descripción.'}
              </Typography>
            )}
          </Stack>
        </Paper>
      )}

      <Dialog
        open={confirmando}
        onClose={() => !eliminando && setConfirmando(false)}
        aria-labelledby="eliminar-titulo"
      >
        <DialogTitle id="eliminar-titulo">¿Eliminar “{producto?.nombre}”?</DialogTitle>
        <DialogContent>
          <Typography>Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmando(false)} disabled={eliminando}>
            Volver
          </Button>
          <Button color="error" variant="contained" onClick={eliminar} disabled={eliminando}>
            {eliminando ? 'Eliminando…' : 'Eliminar producto'}
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