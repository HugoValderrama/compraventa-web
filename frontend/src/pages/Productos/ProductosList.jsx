import { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Pantalla from './Pantalla';
import Notificacion from '../../components/molecules/Notificacion';
import ProductoImagen from '../../components/molecules/producto/ProductoImagen';
import ProductoPrecio from '../../components/molecules/producto/ProductoPrecio';
import ProductoStock from '../../components/molecules/producto/ProductoStock';
import { getProducts } from '../../mocks/productos';
import { getMe } from '../../mocks/usuario';
import { esEmprendedor } from '../../utils/roles';
import { stockTotal } from '../../utils/productos';

export default function ProductosList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [redirigir, setRedirigir] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [aviso, setAviso] = useState(() => ({
    open: Boolean(location.state?.mensaje),
    mensaje: location.state?.mensaje ?? '',
    severidad: 'success',
  }));

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const yo = await getMe();
      if (!esEmprendedor(yo)) {
        setRedirigir(true);
        return;
      }
      setProductos(await getProducts({ emprendedorId: yo.id }));
    } catch (err) {
      // Sin sesión: /perfil redirige al inicio de sesión.
      if (err.codigo === 401) setRedirigir(true);
      else setError('No pudimos cargar tus productos. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Limpia el mensaje del historial para que no reaparezca al recargar.
  useEffect(() => {
    if (location.state?.mensaje) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  if (redirigir) return <Navigate to="/perfil" replace />;

  const visibles = productos.filter((p) =>
    `${p.nombre} ${p.categoria}`.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return (
    <Pantalla>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', mb: 3 }}
      >
        <Typography variant="h5" sx={{ color: 'white' }}>
          Mis productos
        </Typography>

        <Button
          variant="contained"
          disabled={cargando || Boolean(error)}
          onClick={() => navigate('/productos/nuevo')}
        >
          Publicar producto
        </Button>
      </Stack>

      {cargando && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'white' }} aria-label="Cargando productos" />
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

      {!cargando && !error && productos.length > 0 && (
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre o categoría"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ mb: 2, bgcolor: 'white', borderRadius: 1 }}
        />
      )}

      {!cargando &&
        !error &&
        visibles.map((p) => (
          <Paper key={p.id} sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                <ProductoImagen
                  src={p.fotos[0]}
                  nombre={p.nombre}
                  sx={{ width: 96, height: 96, flexShrink: 0 }}
                />

                <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: '#62A7F5', fontWeight: 700 }}>
                    {p.categoria}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                    {p.nombre}
                  </Typography>
                  <ProductoPrecio producto={p} />
                  <ProductoStock stock={stockTotal(p)} />
                  {!p.activo && <Chip label="Inactivo" size="small" sx={{ alignSelf: 'flex-start' }} />}
                </Stack>
              </Stack>

              <Stack
                direction={{ xs: 'row', sm: 'column' }}
                spacing={1}
                sx={{ alignSelf: { sm: 'center' } }}
              >
                <Button variant="contained" onClick={() => navigate(`/productos/${p.id}`)}>
                  Ver detalle
                </Button>
                <Button variant="outlined" onClick={() => navigate(`/productos/${p.id}/editar`)}>
                  Editar
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}

      {!cargando && !error && !productos.length && (
        <Alert severity="info">
          Aún no tienes productos. Publica el primero con “Publicar producto”.
        </Alert>
      )}

      {!cargando && !error && productos.length > 0 && !visibles.length && (
        <Alert severity="info">No hay productos que coincidan con la búsqueda.</Alert>
      )}

      <Notificacion
        open={aviso.open}
        mensaje={aviso.mensaje}
        severidad={aviso.severidad}
        onClose={() => setAviso((a) => ({ ...a, open: false }))}
      />
    </Pantalla>
  );
}