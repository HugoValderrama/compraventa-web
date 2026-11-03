import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import RutaPorRol from '../../routes/RutaPorRol';
import ProductosList from './ProductosList';
import ProductoForm from './ProductoForm';
import ProductoDetalle from './ProductoDetalle';

const emprendedor = (el) => <RutaPorRol rol="emprendedor">{el}</RutaPorRol>;

// La clave remonta el formulario al pasar de "nuevo" a "editar" (o entre productos).
function RutaFormulario() {
  const { id } = useParams();
  return <ProductoForm key={id ?? 'nuevo'} id={id} />;
}

// La clave reinicia el detalle (variante, cantidad, pestaña) al pasar de un producto a otro.
function RutaDetalle() {
  const { id } = useParams();
  return <ProductoDetalle key={id} />;
}

export default function ProductosPage() {
  return (
    <Routes>
      <Route index element={emprendedor(<ProductosList />)} />
      <Route path="nuevo" element={emprendedor(<RutaFormulario />)} />
      <Route path=":id/editar" element={emprendedor(<RutaFormulario />)} />
      <Route path=":id" element={<RutaDetalle />} />
      <Route path="*" element={<Navigate to="/productos" replace />} />
    </Routes>
  );
}