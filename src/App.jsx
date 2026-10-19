
import { Routes, Route, Navigate } from "react-router-dom";

import LoginScreen from "./pages/Login/LoginScreen";
import RegistroScreen from "./pages/Registro/RegistroScreen";
import ProfileClient from "./pages/Profiles/ProfileClient";
import ProfileE from "./pages/Profiles/ProfileE";

import CotizacionesPage from "./pages/cotizacion.jsx";
import ProductosPage from "./pages/Productos.jsx";
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



function App() {
  return (
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
        <Route path="/perfil" element={<ProfileClient />} />
        <Route path="/perfilE" element={<ProfileE />} />
        <Route path="/lista-deseos" element={<ListaDeseosPage />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/mensajeria" element={<MensajeriaPage />} />
        <Route path="/mensajeria/:id" element={<MensajeriaPage />} />
        <Route path="/carrito/confirmacion/:id" element={<ConfirmacionPage />}/>
        <Route path="/carrito/pago" element={<PagoPage />} />
        <Route path="/carrito/direccion" element={<DireccionEnvioPage />}/>
        <Route path="/cotizaciones/*" element={<CotizacionesPage />} />

        {/* Catálogo */}
        <Route path="/catalogo" element={<CatalogoGeneralPage />} />

        {/* Productos y servicios */}
        <Route path="/productos/*" element={<ProductosPage />} />
        <Route path="/servicios/*" element={<ServiciosPage />} />

        {/* Cotizaciones */}
        <Route path="/cotizaciones/*" element={<CotizacionesPage />} />
        <Route
          path="/cotizaciones-recibidas/*"
          element={<CotizacionesRecibidasPage />}
        />

        {/* Pedidos y compras */}
        <Route path="/pedidos/*" element={<PedidosPage />} />
        <Route path="/compras/*" element={<ComprasPage />} />

        {/* Gestión de categorías */}
        <Route path="/categorias" element={<CategoriasPage />} />

        {/* Lista de deseos y carrito */}
        <Route path="/lista-deseos" element={<ListaDeseosPage />} />
        <Route path="/carrito" element={<CarritoPage />} />

        <Route path="/mis-preguntas" element={<MisPreguntasPage />} />
        <Route path="/mis-preguntas/:id" element={<MisPreguntasPage />} />

        <Route path="/preguntas-recibidas" element={<PreguntasRecibidasPage />}/>
        <Route path="/preguntas-recibidas/:id" element={<PreguntasRecibidasPage />}/>

        {/* Ruta desconocida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
