
import { Routes, Route, Navigate } from "react-router-dom";

// Login y registro
import LoginScreen from "./pages/Login/LoginScreen";
import RegistroScreen from "./pages/Registro/RegistroScreen";
import RecuperarPassword from "./pages/RecuperarPassword/RecuperarPassword";

// Perfiles
import ProfileClient from "./pages/Profiles/ProfileClient";
import ProfileE from "./pages/Profiles/ProfileE";

// Página principal y catálogo
import HomePage from "./pages/Home/HomePage.jsx";
import CatalogoGeneralPage from "./pages/Catalogo/CatalogoGeneralPage.jsx";

// Productos y servicios
import ProductosPage from "./pages/Productos/ProductosPage.jsx";
import ServiciosPage from "./pages/Servicios/ServiciosPage.jsx";

// Cotizaciones
import CotizacionesPage from "./pages/cotizacion.jsx";
import CotizacionesRecibidasPage from "./pages/CotizacionesRecibidas/CotizacionesRecibidasPage.jsx";

// Pedidos y compras
import PedidosPage from "./pages/Pedidos/PedidosPage.jsx";
import ComprasPage from "./pages/Compras/ComprasPage.jsx";

// Carrito y compras
import ListaDeseosPage from "./pages/ListaDeseos/ListaDeseosPage.jsx";
import CarritoPage from "./pages/Carrito/CarritoPage.jsx";
import DireccionEnvioPage from "./pages/Carrito/DireccionEnvioPage.jsx";
import PagoPage from "./pages/Carrito/PagoPage.jsx";
import ConfirmacionPage from "./pages/Carrito/ConfirmacionPage.jsx";

// Mensajería
import MensajeriaPage from "./pages/Mensajeria/MensajeriaPage.jsx";

// Preguntas
import MisPreguntasPage, {
  PreguntasRecibidasPage,
} from "./pages/MisPreguntas/MisPreguntasPage.jsx";

// Categorías
import CategoriasPage from "./pages/Categorias/CategoriasPage";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<HomePage />} />

        {/* Inicio de sesión y registro */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/registro" element={<RegistroScreen />} />
        <Route
          path="/recuperar-password"
          element={<RecuperarPassword />}
        />

        {/* Perfiles */}
        <Route path="/perfil" element={<ProfileClient />} />
        <Route path="/perfilE" element={<ProfileE />} />

        {/* Catálogo */}
        <Route
          path="/catalogo"
          element={<CatalogoGeneralPage />}
        />

        {/* Productos y servicios */}
        <Route path="/productos/*" element={<ProductosPage />} />
        <Route path="/servicios/*" element={<ServiciosPage />} />

        {/* Cotizaciones */}
        <Route
          path="/cotizaciones/*"
          element={<CotizacionesPage />}
        />
        <Route
          path="/cotizaciones-recibidas/*"
          element={<CotizacionesRecibidasPage />}
        />

        {/* Pedidos y compras */}
        <Route path="/pedidos/*" element={<PedidosPage />} />
        <Route path="/compras/*" element={<ComprasPage />} />

        {/* Categorías */}
        <Route path="/categorias" element={<CategoriasPage />} />

        {/* Lista de deseos */}
        <Route
          path="/lista-deseos"
          element={<ListaDeseosPage />}
        />

        {/* Carrito */}
        <Route path="/carrito" element={<CarritoPage />} />
        <Route
          path="/carrito/direccion"
          element={<DireccionEnvioPage />}
        />
        <Route
          path="/carrito/pago"
          element={<PagoPage />}
        />
        <Route
          path="/carrito/confirmacion/:id"
          element={<ConfirmacionPage />}
        />

        {/* Mensajería */}
        <Route
          path="/mensajeria"
          element={<MensajeriaPage />}
        />
        <Route
          path="/mensajeria/:id"
          element={<MensajeriaPage />}
        />

        {/* Mis preguntas */}
        <Route
          path="/mis-preguntas"
          element={<MisPreguntasPage />}
        />
        <Route
          path="/mis-preguntas/:id"
          element={<MisPreguntasPage />}
        />

        {/* Preguntas recibidas */}
        <Route
          path="/preguntas-recibidas"
          element={<PreguntasRecibidasPage />}
        />
        <Route
          path="/preguntas-recibidas/:id"
          element={<PreguntasRecibidasPage />}
        />

        {/* Rutas desconocidas */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
