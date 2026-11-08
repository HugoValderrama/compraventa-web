
import { useCallback, useEffect, useState } from 'react';

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
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

import { getEmpresa } from '../../mocks/usuario';

import {
  obtenerOfertas,
  obtenerProductosParaOferta,
  crearOferta,
  actualizarOferta,
} from '../../mocks/ofertas';

import Pantalla from '../Servicios/Pantalla';
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina';

const formatoPrecio = (precio) =>
  Number(precio).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });

const estadoColor = (estado) => {
  switch (estado) {
    case 'Activa':
      return 'success';
    case 'Programada':
      return 'info';
    case 'Finalizada':
      return 'default';
    default:
      return 'default';
  }
};

const FILTROS = [
  {
    valor: 'todas',
    etiqueta: 'Todas',
    coincide: () => true,
  },
  {
    valor: 'Activa',
    etiqueta: 'Activas',
    coincide: (oferta) => oferta.estadoOferta === 'Activa',
  },
  {
    valor: 'Programada',
    etiqueta: 'Programadas',
    coincide: (oferta) => oferta.estadoOferta === 'Programada',
  },
  {
    valor: 'Finalizada',
    etiqueta: 'Finalizadas',
    coincide: (oferta) => oferta.estadoOferta === 'Finalizada',
  },
];

const formularioInicial = {
  productoId: '',
  fechaInicio: '',
  fechaFin: '',
  precioOferta: '',
};


const obtenerFechaLocal = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};

const formatearFecha = (fecha) => {
  if (!fecha) return '';

  const [anio, mes, dia] = fecha.split('-');

  return `${dia}/${mes}/${anio}`;
};

export default function OfertasPage() {
  const [emprendedorId, setEmprendedorId] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [productos, setProductos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const [filtro, setFiltro] = useState('todas');

  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError('');

      const empresa = await getEmpresa();
      const idEmpresa = empresa.id;

      setEmprendedorId(idEmpresa);

      const [ofertasObtenidas, productosObtenidos] = await Promise.all([
        obtenerOfertas(idEmpresa),
        obtenerProductosParaOferta(idEmpresa),
      ]);

      setOfertas(ofertasObtenidas);
      setProductos(productosObtenidos);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las ofertas.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirCrear = () => {
    setProductoEditando(null);
    setFormulario(formularioInicial);
    setError('');
    setDialogoAbierto(true);
  };

  const abrirEditar = (producto) => {
    setProductoEditando(producto);

    setFormulario({
      productoId: String(producto.id),
      fechaInicio: producto.oferta.fechaInicio,
      fechaFin: producto.oferta.fechaFin,
      precioOferta: String(producto.oferta.precioOferta),
    });

    setError('');
    setDialogoAbierto(true);
  };

  const cerrarDialogo = () => {
    if (guardando) return;

    setDialogoAbierto(false);
    setProductoEditando(null);
    setFormulario(formularioInicial);
    setError('');
  };

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const productoSeleccionado = productos.find(
    (producto) => String(producto.id) === String(formulario.productoId)
  );

  const guardarOferta = async (evento) => {
    evento.preventDefault();

    if (!emprendedorId) {
      setError('No se pudo identificar la empresa.');
      return;
    }

    const hoy = obtenerFechaLocal();

    

if (formulario.fechaInicio < hoy) {
  setError('La fecha de inicio no puede ser anterior al día de hoy.');
  return;
}

if (formulario.fechaFin < formulario.fechaInicio) {
  setError('La fecha de término no puede ser anterior a la fecha de inicio.');
  return;
}

    try {
      setGuardando(true);
      setError('');

      const datosOferta = {
        fechaInicio: formulario.fechaInicio,
        fechaFin: formulario.fechaFin,
        precioOferta: formulario.precioOferta,
      };

      if (productoEditando) {
        await actualizarOferta(
          emprendedorId,
          productoEditando.id,
          datosOferta
        );
      } else {
        await crearOferta(
          emprendedorId,
          formulario.productoId,
          datosOferta
        );
      }

      setDialogoAbierto(false);
      setProductoEditando(null);
      setFormulario(formularioInicial);

      await cargarDatos();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la oferta.');
    } finally {
      setGuardando(false);
    }
  };

  const productosDisponibles = productos.filter(
    (producto) =>
      !producto.oferta ||
      String(producto.id) === String(productoEditando?.id)
  );

  const filtroActual = FILTROS.find((f) => f.valor === filtro);
  const ofertasVisibles = ofertas.filter(filtroActual.coincide);

  if (cargando) {
    return (
      <Pantalla>
        <Stack
          spacing={2}
          role="status"
          sx={{ alignItems: 'center', py: 6 }}
        >
          <CircularProgress sx={{ color: 'white' }} />
          <Typography sx={{ color: 'white' }}>
            Cargando ofertas...
          </Typography>
        </Stack>
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      {/* Encabezado sin botón superior derecho */}
      <EncabezadoPagina titulo="Mis Ofertas" />

      {/* Descripción en blanco y con letra más grande */}
      <Typography
        sx={{
          color: '#FFFFFF',
          fontSize: '22px',
          mb: 2,
        }}
      >
        Administra los descuentos y la vigencia de tus productos.
      </Typography>

      {error && !dialogoAbierto && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {ofertas.length === 0 ? (
        <Paper sx={{ p: 4 }}>
          <Stack
            spacing={1.5}
            sx={{ alignItems: 'center', textAlign: 'center' }}
          >
            <LocalOfferOutlinedIcon
              sx={{ fontSize: 48, color: '#3026A6' }}
            />

            <Typography variant="h6" fontWeight={600}>
              Todavía no tienes ofertas
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Crea una oferta temporal para uno de tus productos.
            </Typography>

            {/* Se conserva el botón central */}
            <Button variant="contained" onClick={abrirCrear}>
              Crear mi primera oferta
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
          <Tabs
            value={filtro}
            onChange={(_, valor) => setFiltro(valor)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Filtrar ofertas por estado"
            slotProps={{ indicator: { sx: { display: 'none' } } }}
            sx={{ mb: 2 }}
          >
            {FILTROS.map((f) => (
              <Tab
                key={f.valor}
                value={f.valor}
                label={`${f.etiqueta} (${ofertas.filter(f.coincide).length})`}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 36,
                  mr: 1,
                  borderRadius: 999,
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                }}
              />
            ))}
          </Tabs>

          <Stack spacing={2}>
            {ofertasVisibles.map((producto) => (
              <Paper
                key={producto.id}
                elevation={1}
                sx={{
                  p: 2.5,
                  borderRadius: 1.5,
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', md: 'center' },
                  gap: 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 76,
                      height: 76,
                      borderRadius: 2,
                      backgroundColor: '#E8F2FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <LocalOfferOutlinedIcon
                      sx={{ fontSize: 38, color: '#62A7F5' }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {producto.nombre}
                    </Typography>

                    <Typography color="text.secondary">
                      Precio normal: {formatoPrecio(producto.precio)}
                    </Typography>

                    <Typography color="success.main" fontWeight={700}>
                      Precio oferta:{' '}
                      {formatoPrecio(producto.oferta.precioOferta)}
                    </Typography>

                    <Typography color="text.secondary" variant="body2">
                      Desde: {formatearFecha(producto.oferta.fechaInicio)} · Hasta:{' '}
                      {formatearFecha(producto.oferta.fechaFin)}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="flex-end"
                  flexWrap="wrap"
                >
                  <Chip
                    label={producto.estadoOferta}
                    color={estadoColor(producto.estadoOferta)}
                    size="small"
                  />

                  <Button
                    variant="outlined"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => abrirEditar(producto)}
                  >
                    Editar
                  </Button>
                </Stack>
              </Paper>
            ))}

            {ofertasVisibles.length === 0 && (
              <Alert severity="info">
                No tienes ofertas{' '}
                {filtro === 'Activa'
                  ? 'activas'
                  : filtro === 'Programada'
                    ? 'programadas'
                    : 'finalizadas'}{' '}
                por ahora.
              </Alert>
            )}
          </Stack>

          <Typography variant="body2" sx={{ color: 'white', mt: 2 }}>
            Mostrando {ofertasVisibles.length} de {ofertas.length}{' '}
            {ofertas.length === 1 ? 'oferta' : 'ofertas'} · Precios en pesos
            chilenos (CLP)
          </Typography>
        </>
      )}

      <Dialog
        open={dialogoAbierto}
        onClose={cerrarDialogo}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={guardarOferta}>
          <DialogTitle>
            {productoEditando ? 'Editar oferta' : 'Crear oferta temporal'}
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              <TextField
                select
                fullWidth
                label="Producto"
                name="productoId"
                value={formulario.productoId}
                onChange={manejarCambio}
                disabled={Boolean(productoEditando)}
                required
              >
                {productosDisponibles.map((producto) => (
                  <MenuItem
                    key={producto.id}
                    value={String(producto.id)}
                  >
                    {producto.nombre} — {formatoPrecio(producto.precio)}
                  </MenuItem>
                ))}
              </TextField>

              {productoSeleccionado && (
                <Alert severity="info">
                  Precio normal del producto:{' '}
                  <strong>
                    {formatoPrecio(productoSeleccionado.precio)}
                  </strong>
                </Alert>
              )}

              <TextField
                fullWidth
                type="number"
                label="Precio de oferta"
                name="precioOferta"
                value={formulario.precioOferta}
                onChange={manejarCambio}
                inputProps={{ min: 1, step: 1 }}
                required
              />

            <TextField
  fullWidth
  type="date"
  label="Fecha de inicio"
  name="fechaInicio"
  value={formulario.fechaInicio}
  onChange={manejarCambio}
  InputLabelProps={{ shrink: true }}
  inputProps={{
    min: obtenerFechaLocal(),
  }}
  required
/>

              <TextField
                fullWidth
                type="date"
                label="Fecha de término"
                name="fechaFin"
                value={formulario.fechaFin}
                onChange={manejarCambio}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: formulario.fechaInicio || '0001-01-01',
                  max: '9999-12-31',
                }}
                required
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={cerrarDialogo} disabled={guardando}>
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={guardando}
              sx={{
                backgroundColor: '#3026A6',
                '&:hover': { backgroundColor: '#241d82' },
              }}
            >
              {guardando ? 'Guardando...' : 'Guardar oferta'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Pantalla>
  );
}
