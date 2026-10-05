import { Routes, Route, Navigate } from 'react-router-dom'
import CotizacionesListPage from './pages/CotizacionesListPage'
import CotizacionDetallePage from './pages/CotizacionDetallePage'

// Temporal: reemplazar por la página real de Marco (Solicitar cotización)
const NuevaCotizacionPlaceholder = () => <div>Solicitar cotización (pendiente)</div>

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cotizaciones" replace />} />
      <Route path="/cotizaciones" element={<CotizacionesListPage />} />
      {/* "nueva" va antes que ":id" para que no se interprete como un id */}
      <Route path="/cotizaciones/nueva" element={<NuevaCotizacionPlaceholder />} />
      <Route path="/cotizaciones/:id" element={<CotizacionDetallePage />} />
      <Route path="*" element={<Navigate to="/cotizaciones" replace />} />
    </Routes>
  )
}

export default App
