import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Container, Paper } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';

import TopNavBar from '../../components/organisms/TopNavBar';
import EncabezadoPerfil from '../../components/molecules/EncabezadoPerfil';
import Notificacion from '../../components/molecules/Notificacion';
import AccesosGrid from '../../components/organisms/perfil/AccesosGrid';
import DatosUsuarioCard from '../../components/organisms/perfil/DatosUsuarioCard';
import TiendaCard from '../../components/organisms/perfil/TiendaCard';
import EditarPerfilDialog from '../../components/organisms/perfil/EditarPerfilDialog';
import TelefonosDialog from '../../components/organisms/perfil/TelefonosDialog';
import CorreosDialog from '../../components/organisms/perfil/CorreosDialog';
import CambiarClaveDialog from '../../components/organisms/perfil/CambiarClaveDialog';
import TiendaDialog from '../../components/organisms/perfil/TiendaDialog';
import { getEmpresa, getMe } from '../../mocks/usuario';
import { esEmprendedor, tieneAmbosRoles } from '../../utils/roles';

// Accesos del emprendedor según el diagrama de navegación.
// Las rutas inexistentes hoy caen en la ruta comodín de App.jsx.
const GRUPOS_ACCESOS = [
  {
    titulo: 'Ventas',
    accesos: [
      { titulo: 'Pedidos recibidos', icono: LocalShippingOutlinedIcon, ruta: '/pedidos' },
      {
        titulo: 'Cotizaciones recibidas',
        icono: RequestQuoteOutlinedIcon,
        ruta: '/cotizaciones-recibidas',
      },
      { titulo: 'Calificaciones', icono: StarBorderOutlinedIcon, ruta: '/calificaciones' },
    ],
  },
  {
    titulo: 'Catálogo',
    accesos: [
      { titulo: 'Mis productos', icono: StorefrontOutlinedIcon, ruta: '/productos' },
      { titulo: 'Mis servicios', icono: BuildOutlinedIcon, ruta: '/servicios' },
      { titulo: 'Inventario', icono: Inventory2OutlinedIcon, ruta: '/inventario' },
      { titulo: 'Ofertas', icono: LocalOfferOutlinedIcon, ruta: '/ofertas' },
    ],
  },
  {
    titulo: 'Comunicación',
    accesos: [
      { titulo: 'Mensajería', icono: MailOutlinedIcon, ruta: '/mensajeria' },
      { titulo: 'Preguntas pendientes', icono: HelpOutlinedIcon, ruta: '/preguntas-pendientes' },
    ],
  },
  {
    titulo: 'Más',
    accesos: [{ titulo: 'Dashboard', icono: DashboardOutlinedIcon, ruta: '/emprendedor' }],
  },
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

export default function ProfileE() {
  const [redirigir, setRedirigir] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogo, setDialogo] = useState(null); // 'editar' | 'telefonos' | 'correos' | 'clave' | 'tienda' | null
  const [aviso, setAviso] = useState({ open: false, mensaje: '', severidad: 'success' });

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [datos, datosEmpresa] = await Promise.all([getMe(), getEmpresa()]);
      if (esCliente(datos)) {
        setRedirigir(true);
        return;
      }
      setUsuario(datos);
      setEmpresa(datosEmpresa);
    } catch {
      setError('No pudimos cargar tu perfil. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (redirigir) return <Navigate to="/perfil" replace />;

  const notificar = (mensaje, severidad = 'success') =>
    setAviso({ open: true, mensaje, severidad });
  const cerrarDialogo = () => setDialogo(null);
  const alActualizarUsuario = (actualizado, mensaje) => {
    setUsuario(actualizado);
    notificar(mensaje);
  };
  const alActualizarEmpresa = (actualizada, mensaje) => {
    setEmpresa(actualizada);
    notificar(mensaje);
  };
  const alFallar = (mensaje) => notificar(mensaje, 'error');

  return (
    <Pantalla>
      <EncabezadoPerfil
        titulo="Mi perfil emprendedor"
        cambio={
          tieneAmbosRoles(usuario)
            ? { texto: 'Ir a mi perfil de cliente', ruta: '/perfil' }
            : null
        }
      />

      {cargando && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress aria-label="Cargando perfil" />
          </Box>
        </Paper>
      )}

      {!cargando && error && (
        <Paper sx={{ p: 3, mb: 3 }}>
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
        </Paper>
      )}

      {!cargando && usuario && empresa && (
        <>
          <Box sx={{ mb: 3 }}>
            <DatosUsuarioCard
              usuario={usuario}
              onEditar={() => setDialogo('editar')}
              onTelefonos={() => setDialogo('telefonos')}
              onCorreos={() => setDialogo('correos')}
              onClave={() => setDialogo('clave')}
            />
          </Box>

          <Box sx={{ mb: 6 }}>
            <TiendaCard
              empresa={empresa}
              onEditar={() => setDialogo('tienda')}
            />
          </Box>
        </>
      )}

      {GRUPOS_ACCESOS.map(({ titulo, accesos }) => (
        <Box key={titulo} sx={{ mb: 3 }}>
          <AccesosGrid titulo={titulo} accesos={accesos} />
        </Box>
      ))}

      {usuario && empresa && (
        <>
          <EditarPerfilDialog
            open={dialogo === 'editar'}
            onClose={cerrarDialogo}
            usuario={usuario}
            onActualizado={alActualizarUsuario}
            onError={alFallar}
          />
          <TelefonosDialog
            open={dialogo === 'telefonos'}
            onClose={cerrarDialogo}
            telefonos={usuario.telefonos}
            onActualizado={alActualizarUsuario}
            onError={alFallar}
          />
          <CorreosDialog
            open={dialogo === 'correos'}
            onClose={cerrarDialogo}
            correos={usuario.correos}
            onActualizado={alActualizarUsuario}
            onError={alFallar}
          />
          <CambiarClaveDialog
            open={dialogo === 'clave'}
            onClose={cerrarDialogo}
            onExito={(mensaje) => notificar(mensaje)}
          />
          <TiendaDialog
            open={dialogo === 'tienda'}
            onClose={cerrarDialogo}
            empresa={empresa}
            onActualizado={alActualizarEmpresa}
            onError={alFallar}
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