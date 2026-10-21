import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Pantalla from './Pantalla';
import Notificacion from '../../components/molecules/Notificacion';
import VariantesEditor from '../../components/organisms/producto/VariantesEditor';
import FotosUploader from '../../components/organisms/producto/FotosUploader';
import { createProduct, getCategories, getProduct, updateProduct } from '../../mocks/productos';
import { getMe } from '../../mocks/usuario';
import { esEmprendedor } from '../../utils/roles';
import {
  MAX_DESCRIPCION,
  MAX_NOMBRE,
  aDatos,
  aFormulario,
  formVacio,
  hayErrores,
  nuevaVariante,
  validarFormulario,
} from '../../utils/formularioProducto';

const SIN_AVISO = { open: false, mensaje: '', severidad: 'success' };

export default function ProductoForm({ id }) {
  const navigate = useNavigate();
  const modoEditar = Boolean(id);

  const [form, setForm] = useState(null);
  const [errores, setErrores] = useState({ variantes: {} });
  const [categorias, setCategorias] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [denegado, setDenegado] = useState(null); // { mensaje, destino }
  const [guardando, setGuardando] = useState(false);
  const [resumen, setResumen] = useState('');
  const [aviso, setAviso] = useState(SIN_AVISO);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorCarga('');
    try {
      const [yo, cats, producto] = await Promise.all([
        getMe(),
        getCategories(),
        id ? getProduct(id) : null,
      ]);

      if (!esEmprendedor(yo)) {
        setDenegado({ mensaje: 'Solo los emprendedores pueden gestionar productos.', destino: '/perfil' });
        return;
      }
      if (producto && producto.emprendedorId !== yo.id) {
        setDenegado({ mensaje: 'Solo el emprendedor dueño del producto puede editarlo.', destino: '/productos' });
        return;
      }

      setUsuario(yo);
      setCategorias(cats);
      setForm(producto ? aFormulario(producto) : formVacio());
    } catch (err) {
      if (err.codigo === 401) {
        setDenegado({ mensaje: 'Debes iniciar sesión para gestionar productos.', destino: '/login' });
      } else {
        setErrorCarga(err.message || 'No pudimos cargar el formulario. Inténtalo de nuevo.');
      }      
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Acceso denegado: mensaje en pantalla y redirección.
  useEffect(() => {
    if (!denegado) return undefined;
    const temporizador = setTimeout(() => navigate(denegado.destino, { replace: true }), 2500);
    return () => clearTimeout(temporizador);
  }, [denegado, navigate]);

  const cambiar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  const cambiarSwitch = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.checked }));

  const cambiarEntrega = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.checked }));
    setErrores((er) => ({ ...er, entrega: undefined }));
  };

  const cambiarVariante = (idVariante, campo, valor) => {
    setForm((f) => ({
      ...f,
      variantes: f.variantes.map((v) => (v.id === idVariante ? { ...v, [campo]: valor } : v)),
    }));
    setErrores((er) => ({
      ...er,
      variantes: { ...er.variantes, [idVariante]: { ...er.variantes?.[idVariante], [campo]: undefined } },
    }));
  };

  const cancelar = () => navigate('/productos');

  const enviar = async (e) => {
    e.preventDefault();
    if (guardando) return;

    const nuevos = validarFormulario(form);
    setErrores(nuevos);
    if (hayErrores(nuevos)) {
      setResumen('Revisa los campos marcados en rojo.');
      requestAnimationFrame(() =>
        document
          .querySelector('[aria-invalid="true"]')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      );
      return;
    }
    setResumen('');

    setGuardando(true);
    try {
      const datos = aDatos(form);
      if (modoEditar) {
        await updateProduct(id, datos);
      } else {
        // En el backend el dueño sale de la sesión; aquí lo exige el mock.
        await createProduct({ ...datos, emprendedorId: usuario.id });
      }
      navigate('/productos', {
        replace: true,
        state: {
          mensaje: modoEditar ? 'Cambios guardados correctamente.' : 'Producto publicado correctamente.',
        },
      });
    } catch (err) {
      setAviso({
        open: true,
        mensaje: err.message || 'No se pudo guardar el producto. Inténtalo de nuevo.',
        severidad: 'error',
      });
      setGuardando(false);
    }
  };

  const opcionesCategoria =
    form && form.categoria && !categorias.some((c) => c.nombre === form.categoria)
      ? [...categorias, { id: 'actual', nombre: form.categoria }]
      : categorias;

  return (
    <Pantalla volver destino="/productos">
      <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
        {modoEditar ? 'Editar producto' : 'Publicar producto'}
      </Typography>

      {cargando && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'white' }} aria-label="Cargando formulario" />
        </Box>
      )}

      {!cargando && denegado && (
        <Alert severity="error">{denegado.mensaje} Te estamos redirigiendo…</Alert>
      )}

      {!cargando && errorCarga && (
        <Alert
          severity="error"
          action={
            <>
              <Button color="inherit" size="small" onClick={cargar}>
                Reintentar
              </Button>
              <Button color="inherit" size="small" onClick={cancelar}>
                Volver
              </Button>
            </>
          }
        >
          {errorCarga}
        </Alert>
      )}

      {!cargando && form && (
        <Paper component="form" noValidate onSubmit={enviar} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Divider>
              <Typography variant="caption">Datos generales</Typography>
            </Divider>

            <TextField
              label="Nombre del producto"
              value={form.nombre}
              onChange={cambiar('nombre')}
              error={Boolean(errores.nombre)}
              helperText={errores.nombre || `${form.nombre.length}/${MAX_NOMBRE}`}
              slotProps={{ htmlInput: { maxLength: MAX_NOMBRE } }}
              required
              fullWidth
            />

            <TextField
              label="Descripción"
              value={form.descripcion}
              onChange={cambiar('descripcion')}
              error={Boolean(errores.descripcion)}
              helperText={errores.descripcion || `${form.descripcion.length}/${MAX_DESCRIPCION}`}
              slotProps={{ htmlInput: { maxLength: MAX_DESCRIPCION } }}
              multiline
              minRows={3}
              required
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Categoría"
                value={form.categoria}
                onChange={cambiar('categoria')}
                error={Boolean(errores.categoria)}
                helperText={errores.categoria}
                required
                fullWidth
              >
                {opcionesCategoria.map((c) => (
                  <MenuItem key={c.id} value={c.nombre}>
                    {c.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Precio (CLP)"
                type="number"
                value={form.precio}
                onChange={cambiar('precio')}
                error={Boolean(errores.precio)}
                helperText={errores.precio}
                slotProps={{
                  input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                  htmlInput: { min: 1, step: 1 },
                }}
                required
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 4 }}>
              <FormControlLabel
                control={<Switch checked={form.restriccionEdad} onChange={cambiarSwitch('restriccionEdad')} />}
                label="Restricción de edad (+18)"
              />
              <FormControlLabel
                control={<Switch checked={form.activo} onChange={cambiarSwitch('activo')} />}
                label="Activo"
              />
            </Stack>

            <Divider>
              <Typography variant="caption">Variantes</Typography>
            </Divider>

            <VariantesEditor
              tipoSel={form.tipoSel}
              tipoOtro={form.tipoOtro}
              variantes={form.variantes}
              errores={errores}
              disabled={guardando}
              onTipoSel={(tipoSel) => setForm((f) => ({ ...f, tipoSel }))}
              onTipoOtro={(tipoOtro) => {
                setForm((f) => ({ ...f, tipoOtro }));
                setErrores((er) => ({ ...er, tipoOtro: undefined }));
              }}
              onCambiar={cambiarVariante}
              onAgregar={() => setForm((f) => ({ ...f, variantes: [...f.variantes, nuevaVariante()] }))}
              onQuitar={(idVariante) =>
                setForm((f) => ({ ...f, variantes: f.variantes.filter((v) => v.id !== idVariante) }))
              }
            />

            <Divider>
              <Typography variant="caption">Fotografías</Typography>
            </Divider>

            <FotosUploader
              fotos={form.fotos}
              disabled={guardando}
              onChange={(fotos) => setForm((f) => ({ ...f, fotos }))}
            />

            <Divider>
              <Typography variant="caption">Características</Typography>
            </Divider>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Material" value={form.material} onChange={cambiar('material')} fullWidth />
              <TextField label="Dimensiones" value={form.dimensiones} onChange={cambiar('dimensiones')} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Peso" value={form.peso} onChange={cambiar('peso')} fullWidth />
              <TextField label="Origen" value={form.origen} onChange={cambiar('origen')} fullWidth />
            </Stack>

            <Divider>
              <Typography variant="caption">Entrega</Typography>
            </Divider>

            <Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 4 }}>
                <FormControlLabel
                  control={<Switch checked={form.retiroEnTaller} onChange={cambiarEntrega('retiroEnTaller')} />}
                  label="Retiro en taller"
                />
                <FormControlLabel
                  control={<Switch checked={form.despacho} onChange={cambiarEntrega('despacho')} />}
                  label="Despacho"
                />
              </Stack>
              {errores.entrega && <FormHelperText error>{errores.entrega}</FormHelperText>}
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Costo de envío (CLP)"
                type="number"
                value={form.costoEnvio}
                onChange={cambiar('costoEnvio')}
                disabled={!form.despacho}
                error={Boolean(errores.costoEnvio)}
                helperText={errores.costoEnvio || (!form.despacho ? 'Se habilita al activar el despacho' : undefined)}
                slotProps={{
                  input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                  htmlInput: { min: 0, step: 1 },
                }}
                fullWidth
              />
              <TextField
                label="Días de preparación"
                type="number"
                value={form.diasPreparacion}
                onChange={cambiar('diasPreparacion')}
                error={Boolean(errores.diasPreparacion)}
                helperText={errores.diasPreparacion}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                fullWidth
              />
            </Stack>

            {resumen && <Alert severity="error">{resumen}</Alert>}

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button onClick={cancelar} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={guardando}>
                {guardando ? 'Guardando…' : modoEditar ? 'Guardar' : 'Publicar'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Notificacion
        open={aviso.open}
        mensaje={aviso.mensaje}
        severidad={aviso.severidad}
        onClose={() => setAviso(SIN_AVISO)}
      />
    </Pantalla>
  );
}