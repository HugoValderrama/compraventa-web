
import { Routes, Route, Navigate } from "react-router-dom";

import LoginScreen from "./pages/Login/LoginScreen";
import RegistroScreen from "./pages/Registro/RegistroScreen";
import ProfileClient from "./pages/Profiles/ProfileClient";
import ProfileE from "./pages/Profiles/ProfileE";
import DashboardPage from "./pages/Emprendedor/DashboardPage.jsx";
import DashboardAdmin from "./pages/DashboardAdmin/DashboardAdmin.jsx";
import ProductosPage from "./pages/Productos/ProductosPage.jsx";
import ServiciosPage from "./pages/Servicios/ServiciosPage.jsx";
import OfertasPage from "./pages/Ofertas/OfertasPage.jsx";


import CotizacionesRecibidasPage from "./pages/CotizacionesRecibidas/CotizacionesRecibidasPage.jsx";
import PedidosPage from "./pages/Pedidos/PedidosPage.jsx";
import ComprasPage from "./pages/Compras/ComprasPage.jsx";
import HomePage from "./pages/Home/HomePage.jsx";
import CatalogoGeneralPage from "./pages/Catalogo/CatalogoGeneralPage.jsx";

import ListaDeseosPage from "./pages/ListaDeseos/ListaDeseosPage.jsx";
import CarritoPage from "./pages/Carrito/CarritoPage.jsx";
import DireccionEnvioPage from "./pages/Carrito/DireccionEnvioPage.jsx";
import PagoPage from "./pages/Carrito/PagoPage";
import ConfirmacionPage from "./pages/Carrito/ConfirmacionPage";
import PanelModeracion from "./pages/PanelModeracion/PanelModeracion";
import MisPreguntasPage, {
  PreguntasRecibidasPage,
} from "./pages/MisPreguntas/MisPreguntasPage.jsx";

import InventarioPage from "./pages/Inventario/InventarioPage.jsx";
import GestionVentasPedidos from "./pages/GestionVentasPedidos/GestionVentasPedidos.jsx";
import GestionDevolucionesReembolsos from "./pages/GestionDevolucionesReembolsos/GestionDevolucionesReembolsos.jsx";
import GestionPublicacionesPage from "./pages/GestionPublicaciones/GestionPublicacionesPage.jsx";
import CalificacionesPage from "./pages/Calificaciones/CalificacionesPage.jsx";


import CategoriasPage from "./pages/Categorias/CategoriasPage";
import RecuperarPassword from "./pages/RecuperarPassword/RecuperarPassword";

import { AuthProvider } from "./context/AuthContext";
import { NavbarDataProvider } from "./context/NavbarDataContext";
import { TituloPantallaProvider } from "./context/TituloPantallaContext";

import RutaPorRol from "./routes/RutaPorRol";
import SelectorRolDev from "./components/dev/SelectorRolDev";
import PerfilEmprendedor from "./pages/PerfilEmprendedor/PerfilEmprendedor";
import MisDireccionesPage from "./pages/MisDirecciones/MisDireccionesPage";
// Atajos para proteger rutas por rol.
const cliente = (el) => (
  <RutaPorRol rol="cliente">{el}</RutaPorRol>
);

const emprendedor = (el) => (
  <RutaPorRol rol="emprendedor">{el}</RutaPorRol>
);

const administrador = (el) => (
  <RutaPorRol rol="administrador">{el}</RutaPorRol>
);

function App() {
  return (
    <AuthProvider>
      <NavbarDataProvider>
        <TituloPantallaProvider>
          <div className="App">
            <Routes>
              {/* Inicio principal */}
              <Route path="/" element={<HomePage />} />

              {/* Inicio de sesión y registro */}
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/registro" element={<RegistroScreen />} />
              <Route
                path="/recuperar-password"
                element={<RecuperarPassword />}
              />

              {/* Perfiles */}
              <Route
                path="/perfil"
                element={cliente(<ProfileClient />)}
              />
              <Route
                path="/perfilE"
                element={emprendedor(<ProfileE />)}
              />

              {/* Modo cliente */}
              <Route
                path="/lista-deseos"
                element={cliente(<ListaDeseosPage />)}
              />
              <Route
                path="/carrito"
                element={cliente(<CarritoPage />)}
              />
              <Route
                path="/carrito/confirmacion/:id"
                element={cliente(<ConfirmacionPage />)}
              />
              <Route
                path="/carrito/pago"
                element={cliente(<PagoPage />)}
              />
              <Route
                path="/carrito/direccion"
                element={cliente(<DireccionEnvioPage />)}
              />
              <Route
                path="/cotizaciones/*"
                element={cliente(<CotizacionesPage />)}
              />
              <Route
                path="/compras/*"
                element={cliente(<ComprasPage />)}
              />
              <Route
                path="/mis-preguntas"
                element={cliente(<MisPreguntasPage />)}
              />
              <Route
                path="/mis-preguntas/:id"
                element={cliente(<MisPreguntasPage />)}
              />
              {/* Modo administrador */}
              
              <Route path="/admin" element={administrador(<DashboardAdmin />)} />

              <Route path="/panel-moderacion" element={administrador(<PanelModeracion />)} />

              {/* Modo emprendedor */}
              <Route path="/emprendedor" element={emprendedor(<DashboardPage />)} />

              <Route
                path="/inventario"
                element={emprendedor(<InventarioPage />)}
              />
              <Route
                path="/cotizaciones-recibidas/*"
                element={emprendedor(<CotizacionesRecibidasPage />)}
              />
              <Route
                path="/pedidos/*"
                element={emprendedor(<PedidosPage />)}
              />
              <Route
                path="/ofertas"
                element={emprendedor(<OfertasPage />)}
              />
              <Route
                path="/preguntas-recibidas"
                element={emprendedor(<PreguntasRecibidasPage />)}
              />
              <Route
                path="/preguntas-recibidas/:id"
                element={emprendedor(<PreguntasRecibidasPage />)}
              />

              <Route path="/preguntas-pendientes" element={<Navigate to="/preguntas-recibidas" replace />} />

              <Route
                path="/calificaciones"
                element={emprendedor(<CalificacionesPage />)}
              />
              {/* Compartidas */}

              <Route path="/catalogo" element={<CatalogoGeneralPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />
              <Route
                path="/gestion-ventas-pedidos"
                element={<GestionVentasPedidos />}
              />
              <Route
                path="/gestion-devoluciones-reembolsos"
                element={<GestionDevolucionesReembolsos />}
              />
              <Route
                path="/gestion-publicaciones"
                element={<GestionPublicacionesPage />}
              />
              <Route path="/perfil-emprendedor" element={emprendedor(<PerfilEmprendedor />)}/>
              {/* Productos y servicios */}
              <Route path="/productos/*" element={<ProductosPage />} />
              <Route path="/servicios/*" element={<ServiciosPage />} />

              <Route path="/mis-direcciones" element={cliente(<MisDireccionesPage />)}/>
              {/* Ruta desconocida */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <SelectorRolDev />
          </div>
        </TituloPantallaProvider>
      </NavbarDataProvider>
    </AuthProvider>
  );
}

export default App;
