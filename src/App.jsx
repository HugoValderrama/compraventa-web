
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
import CategoriasPage from "./pages/Categorias/CategoriasPage";

import RecuperarPassword from "./pages/RecuperarPassword/RecuperarPassword";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={<LoginScreen />}
        />

        <Route
          path="/registro"
          element={<RegistroScreen />}
        />

        <Route
          path="/recuperar-password"
          element={<RecuperarPassword />}
        />

        <Route
          path="/perfil"
          element={<ProfileClient />}
        />

        <Route
          path="/perfilE"
          element={<ProfileE />}
        />

        <Route
          path="/cotizaciones/*"
          element={<CotizacionesPage />}
        />

        <Route
          path="/productos/*"
          element={<ProductosPage />}
        />

        <Route
          path="/servicios/*"
          element={<ServiciosPage />}
        />

        <Route
          path="/cotizaciones-recibidas/*"
          element={<CotizacionesRecibidasPage />}
        />

        <Route
          path="/pedidos/*"
          element={<PedidosPage />}
        />

        <Route
          path="/compras/*"
          element={<ComprasPage />}
        />

        <Route
          path="/categorias"
          element={<CategoriasPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
