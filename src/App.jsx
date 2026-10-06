import { Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from "./pages/Login/LoginScreen";
import RegistroScreen from "./pages/Registro/RegistroScreen";
import ProfileClient from "./pages/Profiles/ProfileClient";
import ProfileE from "./pages/Profiles/ProfileE";
import CotizacionesPage from "./pages/cotizacion.jsx";
import ProductosPage from "./pages/Productos.jsx";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/perfil" element={<ProfileClient />} />
        <Route path="/perfilE" element={<ProfileE />} />
        <Route path="/cotizaciones/*" element={<CotizacionesPage />} />
        <Route path="/productos/*" element={<ProductosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route
          path="/registro"
          element={<RegistroScreen />}
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
          path="/cotizaciones"
          element={<CotizacionesPage />}
        />

        <Route
          path="/productos/*"
          element={<ProductosPage />}
        />
      </Routes>
    </div>
  );
}

export default App;
