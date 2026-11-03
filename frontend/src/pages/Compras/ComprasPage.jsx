import { Navigate, Route, Routes } from 'react-router-dom'
import ComprasList from './ComprasList'
import CompraDetalle from './CompraDetalle'
import CompraSeguimiento from './CompraSeguimiento'

export default function ComprasPage() {
  return (
    <Routes>
      <Route index element={<ComprasList />} />
      <Route path=":id" element={<CompraDetalle />} />
      <Route path=":id/seguimiento" element={<CompraSeguimiento />} />
      <Route path="*" element={<Navigate to="/compras" replace />} />
    </Routes>
  )
}