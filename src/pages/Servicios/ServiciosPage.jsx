import { Navigate, Route, Routes } from 'react-router-dom'
import ServiciosList from './ServiciosList'
import { EditarServicio, NuevoServicio } from './ServicioFormPage'

export default function ServiciosPage() {
  return (
    <Routes>
      <Route index element={<ServiciosList />} />
      <Route path="nuevo" element={<NuevoServicio />} />
      <Route path=":id/editar" element={<EditarServicio />} />
      <Route path="*" element={<Navigate to="/servicios" replace />} />
    </Routes>
  )
}