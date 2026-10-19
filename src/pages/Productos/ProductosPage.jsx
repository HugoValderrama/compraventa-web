import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import ProductosList from './ProductosList';
import ProductoForm from './ProductoForm';
import ProductoDetalle from './ProductoDetalle';

// La clave remonta el formulario al pasar de "nuevo" a "editar" (o entre productos).
function RutaFormulario() {
  const { id } = useParams();
  return <ProductoForm key={id ?? 'nuevo'} id={id} />;
}

export default function ProductosPage() {
  return (
    <Routes>
      <Route index element={<ProductosList />} />
      <Route path="nuevo" element={<RutaFormulario />} />
      <Route path=":id/editar" element={<RutaFormulario />} />
      <Route path=":id" element={<ProductoDetalle />} />
      <Route path="*" element={<Navigate to="/productos" replace />} />
    </Routes>
  );
}