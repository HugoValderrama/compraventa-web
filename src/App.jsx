
import { Routes, Route, Navigate } from "react-router-dom";

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
<<<<<<< HEAD
          path="*"
          element={<Navigate to="/" replace />}
        />
=======
          path="/servicios/*"
          element={<ServiciosPage />}
        />

        <Route
          path='/cotizaciones-recibidas/*'
          element={<CotizacionesRecibidasPage/>}
        />

        <Route
          path='/pedidos/*'
          element={<PedidosPage/>}
        />

        <Route
          path='/compras/*'
          element={<ComprasPage />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
>>>>>>> e60dfbe28b84c84f57b374b0565906cf2de2d9c6
      </Routes>
    </div>
  );
}

export default App;
