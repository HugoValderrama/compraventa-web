import { Routes, Route, Navigate } from "react-router-dom";

import LoginScreen from "./pages/Login/LoginScreen";
import RegistroScreen from "./pages/Registro/RegistroScreen";
import ProfileClient from "./pages/Profiles/ProfileClient";
import ProfileE from "./pages/Profiles/ProfileE";

import CotizacionesPage from "./pages/cotizacion.jsx";
import ProductosPage from "./pages/Productos/ProductosPage.jsx";
import ServiciosPage from "./pages/Servicios/ServiciosPage.jsx";

import CotizacionesRecibidasPage from "./pages/CotizacionesRecibidas/CotizacionesRecibidasPage.jsx";
import PedidosPage from "./pages/Pedidos/PedidosPage.jsx";
import ComprasPage from "./pages/Compras/ComprasPage.jsx";
import HomePage from './pages/Home/HomePage.jsx';
import CatalogoGeneralPage from './pages/Catalogo/CatalogoGeneralPage.jsx';
import ListaDeseosPage from './pages/ListaDeseos/ListaDeseosPage.jsx';
import CarritoPage from './pages/Carrito/CarritoPage.jsx';
import DireccionEnvioPage from './pages/Carrito/DireccionEnvioPage.jsx';
import PagoPage from './pages/Carrito/PagoPage.jsx';
import ConfirmacionPage from './pages/Carrito/ConfirmacionPage.jsx';
import MensajeriaPage from './pages/Mensajeria/MensajeriaPage.jsx';
import MisPreguntasPage, {PreguntasRecibidasPage,} from './pages/MisPreguntas/MisPreguntasPage.jsx';
// Tus pantallas
import CategoriasPage from "./pages/Categorias/CategoriasPage";
import RecuperarPassword from "./pages/RecuperarPassword/RecuperarPassword";

// Navbar: sesión, modo activo y datos compartidos
import { AuthProvider } from "./context/AuthContext";
import { NavbarDataProvider } from "./context/NavbarDataContext";
import { TituloPantallaProvider } from "./context/TituloPantallaContext";
import RutaPorRol from "./routes/RutaPorRol";

// Atajos para proteger rutas por rol (modo cliente / modo emprendedor)
const cliente = (el) => <RutaPorRol rol="cliente">{el}</RutaPorRol>;
const emprendedor = (el) => <RutaPorRol rol="emprendedor">{el}</RutaPorRol>;

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
              <Route path="/perfil" element={cliente(<ProfileClient />)} />
              <Route path="/perfilE" element={emprendedor(<ProfileE />)} />
              {/* Pantalla de inicio del modo emprendedor: por ahora lleva al perfil */}
              <Route path="/emprendedor" element={<Navigate to="/perfilE" replace />} />

              {/* Modo cliente */}
              <Route path="/lista-deseos" element={cliente(<ListaDeseosPage />)} />
              <Route path="/carrito" element={cliente(<CarritoPage />)} />
              <Route path="/carrito/confirmacion/:id" element={cliente(<ConfirmacionPage />)} />
              <Route path="/carrito/pago" element={cliente(<PagoPage />)} />
              <Route path="/carrito/direccion" element={cliente(<DireccionEnvioPage />)} />
              <Route path="/cotizaciones/*" element={cliente(<CotizacionesPage />)} />
              <Route path="/compras/*" element={cliente(<ComprasPage />)} />
              <Route path="/mis-preguntas" element={cliente(<MisPreguntasPage />)} />
              <Route path="/mis-preguntas/:id" element={cliente(<MisPreguntasPage />)} />

              {/* Modo emprendedor */}
              <Route
                path="/cotizaciones-recibidas/*"
                element={emprendedor(<CotizacionesRecibidasPage />)}
              />
              <Route path="/pedidos/*" element={emprendedor(<PedidosPage />)} />
              <Route path="/preguntas-recibidas" element={emprendedor(<PreguntasRecibidasPage />)} />
              <Route path="/preguntas-recibidas/:id" element={emprendedor(<PreguntasRecibidasPage />)} />

              {/* Compartidas (cliente y emprendedor) */}
              <Route path="/mensajeria" element={<MensajeriaPage />} />
              <Route path="/mensajeria/:id" element={<MensajeriaPage />} />
              <Route path="/catalogo" element={<CatalogoGeneralPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />

              {/* /productos y /servicios mezclan detalle (cliente) y gestión (emprendedor),
                  por eso no se protegen por rol */}
              <Route path="/productos/*" element={<ProductosPage />} />
              <Route path="/servicios/*" element={<ServiciosPage />} />

              {/* Ruta desconocida */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </TituloPantallaProvider>
      </NavbarDataProvider>
    </AuthProvider>
  );
}

export default App;
