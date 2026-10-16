import { Navigate, Route, Routes } from 'react-router-dom'
import ServiciosList from './ServiciosList'
import ServicioForm from './ServicioForm'

export default function ServiciosPage() {
  return (
    <Routes>
      <Route index element={<ServiciosList />} />
      <Route path="nuevo" element={<ServicioForm />} />
      <Route path=":id/editar" element={<ServicioForm />} />
      <Route path="*" element={<Navigate to="/servicios" replace />} />
    </Routes>
  )
}