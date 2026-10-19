import { Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from "./pages/Login/LoginScreen";
import RegistroScreen from "./pages/Registro/RegistroScreen";
import ProfileClient from "./pages/Profiles/ProfileClient";
import ProfileE from "./pages/Profiles/ProfileE";
import CotizacionesPage from "./pages/cotizacion.jsx";
import ProductosPage from "./pages/Productos.jsx";
import ServiciosPage from "./pages/Servicios/ServiciosPage.jsx"
import CotizacionesRecibidasPage from "./pages/CotizacionesRecibidas/CotizacionesRecibidasPage.jsx";
import PedidosPage from "./pages/Pedidos/PedidosPage.jsx";
import ComprasPage from "./pages/Compras/ComprasPage.jsx";
import HomePage from './pages/Home/HomePage.jsx';
import CatalogoGeneralPage from './pages/Catalogo/CatalogoGeneralPage.jsx';
import ListaDeseosPage from './pages/ListaDeseos/ListaDeseosPage.jsx';
import CarritoPage from './pages/Carrito/CarritoPage.jsx';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogoGeneralPage />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/registro" element={<RegistroScreen />} />
        <Route path="/perfil" element={<ProfileClient />} />
        <Route path="/perfilE" element={<ProfileE />} />
        <Route path="/lista-deseos" element={<ListaDeseosPage />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/cotizaciones/*" element={<CotizacionesPage />} />
        <Route path="/productos/*" element={<ProductosPage />} />
        <Route path="/servicios/*" element={<ServiciosPage />} />
        <Route path="/cotizaciones-recibidas/*" element={<CotizacionesRecibidasPage />} />
        <Route path="/pedidos/*" element={<PedidosPage />} />
        <Route path="/compras/*" element={<ComprasPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
export default App;
