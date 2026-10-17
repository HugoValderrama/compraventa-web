import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import PedidosList from './PedidosList'
import PedidoDetalle from './PedidoDetalle'

// key: reinicia el formulario al cambiar de pedido
function DetalleRuta() {
  const { id } = useParams()
  return <PedidoDetalle key={id} id={id} />
}

export default function PedidosPage() {
  return (
    <Routes>
      <Route index element={<PedidosList />} />
      <Route path=":id" element={<DetalleRuta />} />
      <Route path="*" element={<Navigate to="/pedidos" replace />} />
    </Routes>
  )
}