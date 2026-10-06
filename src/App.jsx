import { useLocation } from 'react-router-dom'
import CotizacionesPage from './pages/cotizacion.jsx'
import ProductosPage from './pages/Productos.jsx'

export default function App() {
  const { pathname } = useLocation()
  return pathname.startsWith('/productos') ? <ProductosPage /> : <CotizacionesPage />
}
