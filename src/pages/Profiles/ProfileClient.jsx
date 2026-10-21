import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

import TopNavBar from '../../components/organisms/TopNavBar';
import DatoPerfil from '../../components/molecules/DatoPerfil';
import Notificacion from '../../components/molecules/Notificacion';
import AccesosGrid from '../../components/organisms/perfil/AccesosGrid';
import EditarPerfilDialog from '../../components/organisms/perfil/EditarPerfilDialog';
import TelefonosDialog from '../../components/organisms/perfil/TelefonosDialog';
import CorreosDialog from '../../components/organisms/perfil/CorreosDialog';
import CambiarClaveDialog from '../../components/organisms/perfil/CambiarClaveDialog';
import EncabezadoPerfil from '../../components/molecules/EncabezadoPerfil';
import { getMe } from '../../mocks/usuario';
import { esCliente, esEmprendedor, tieneAmbosRoles } from '../../utils/roles';
import { formatearTelefono } from '../../utils/validaciones';
import { formatearFecha } from '../../utils/formatos';

// Los 8 accesos del cliente según el diagrama de navegación.
// Las rutas inexistentes hoy caen en la ruta comodín de App.jsx.
const ACCESOS_CLIENTE = [
  { titulo: 'Mis compras', icono: ShoppingBagOutlinedIcon, ruta: '/compras' },
  { titulo: 'Carrito', icono: ShoppingCartOutlinedIcon, ruta: '/carrito' },
  { titulo: 'Lista de deseos', icono: FavoriteBorderOutlinedIcon, ruta: '/deseos' },
  { titulo: 'Mis reseñas', icono: StarBorderOutlinedIcon, ruta: '/resenas' },
  { titulo: 'Mensajería', icono: MailOutlinedIcon, ruta: '/mensajeria' },
  { titulo: 'Mis cotizaciones', icono: RequestQuoteOutlinedIcon, ruta: '/cotizaciones' },
  { titulo: 'Mis preguntas', icono: HelpOutlinedIcon, ruta: '/preguntas' },
  { titulo: 'Mis direcciones', icono: PlaceOutlinedIcon, ruta: '/direcciones' },
];

function Pantalla({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar />
      <Container maxWidth="md" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}

const iniciales = (u) => `${u.nombres?.[0] ?? ''}${u.apellidos?.[0] ?? ''}`.toUpperCase();

export default function ProfileClient() {
  const [destino, setDestino] = useState(null); // si hay valor, se redirige ahí
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogo, setDialogo] = useState(null); // 'editar' | 'telefonos' | 'correos' | 'clave' | null
  const [aviso, setAviso] = useState({ open: false, mensaje: '', severidad: 'success' });

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await getMe();
      if (!esCliente(datos)) {
        setDestino(esEmprendedor(datos) ? '/perfilE' : '/');
        return;
      }
      setUsuario(datos);
    } catch (err) {
      if (err.codigo === 401) setDestino('/login');
      else setError('No pudimos cargar tu perfil. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (destino) return <Navigate to={destino} replace />;

  const notificar = (mensaje, severidad = 'success') =>
    setAviso({ open: true, mensaje, severidad });
  const cerrarDialogo = () => setDialogo(null);
  const alActualizar = (actualizado, mensaje) => {
    setUsuario(actualizado);
    notificar(mensaje);
  };
  const alFallar = (mensaje) => notificar(mensaje, 'error');

  const deshabilitado = !usuario;

  return (
    <Pantalla>
      <EncabezadoPerfil
        titulo="Mi perfil"
        cambio={
          tieneAmbosRoles(usuario)
            ? { texto: 'Ir a mi perfil de emprendedor', ruta: '/perfilE' }
            : null
        }
      />

      <Paper sx={{ p: 3, mb: 6 }}>
        {cargando && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress aria-label="Cargando perfil" />
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

        {!cargando && usuario && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}
          >
            <Avatar
              variant="rounded"
              sx={{ width: 140, height: 140, bgcolor: 'grey.500', fontSize: '54px' }}
            >
              {iniciales(usuario)}
            </Avatar>

            <Stack spacing={1} sx={{ flex: 1, width: '100%', minWidth: 0 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 0.5, md: 4 }}>
                <DatoPerfil etiqueta="RUN" valor={usuario.run} />
                <DatoPerfil
                  etiqueta="Fecha de nacimiento"
                  valor={formatearFecha(usuario.fechaNacimiento)}
                />
                <DatoPerfil etiqueta="Registro" valor={formatearFecha(usuario.fechaRegistro)} />
              </Stack>

              <Typography variant="h6">
                {usuario.nombres} {usuario.apellidos}
              </Typography>

              <DatoPerfil etiqueta="Correo" valor={usuario.correos[0]} />
              <DatoPerfil etiqueta="Teléfono" valor={formatearTelefono(usuario.telefonos[0])} />
              <DatoPerfil etiqueta="Dirección" valor={usuario.direccionPrincipal} />
            </Stack>
          </Stack>
        )}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: 3, justifyContent: 'space-between', flexWrap: 'wrap' }}
        >
          <Button variant="contained" disabled={deshabilitado} onClick={() => setDialogo('editar')}>
            Editar perfil
          </Button>
          <Button
            variant="contained"
            disabled={deshabilitado}
            onClick={() => setDialogo('telefonos')}
          >
            Teléfonos
          </Button>
          <Button variant="contained" disabled={deshabilitado} onClick={() => setDialogo('correos')}>
            Correos
          </Button>
          <Button variant="contained" disabled={deshabilitado} onClick={() => setDialogo('clave')}>
            Cambiar contraseña
          </Button>
        </Stack>
      </Paper>

      <AccesosGrid accesos={ACCESOS_CLIENTE} />

      {usuario && (
        <>
          <EditarPerfilDialog
            open={dialogo === 'editar'}
            onClose={cerrarDialogo}
            usuario={usuario}
            onActualizado={alActualizar}
            onError={alFallar}
          />
          <TelefonosDialog
            open={dialogo === 'telefonos'}
            onClose={cerrarDialogo}
            telefonos={usuario.telefonos}
            onActualizado={alActualizar}
            onError={alFallar}
          />
          <CorreosDialog
            open={dialogo === 'correos'}
            onClose={cerrarDialogo}
            correos={usuario.correos}
            onActualizado={alActualizar}
            onError={alFallar}
          />
          <CambiarClaveDialog
            open={dialogo === 'clave'}
            onClose={cerrarDialogo}
            onExito={(mensaje) => notificar(mensaje)}
          />
        </>
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