import { useLocation } from 'react-router-dom'
import CotizacionesPage from './pages/cotizacion.jsx'
import ProductosPage from './pages/Productos.jsx'

// Cada página trae sus propias rutas internas (con un "*" que redirige),
// así que se elige cuál mostrar según la URL: /productos... -> Productos,
// cualquier otra -> Cotizaciones (como estaba antes).
export default function App() {
  const { pathname } = useLocation()
  return pathname.startsWith('/productos') ? <ProductosPage /> : <CotizacionesPage />
}
