
import { getProducts, updateProduct } from './productos';

const obtenerFechaLocal = () => {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};

export const obtenerEstadoOferta = (oferta) => {
  if (!oferta) return 'Sin oferta';

  const hoy = obtenerFechaLocal();

  if (hoy < oferta.fechaInicio) return 'Programada';
  if (hoy > oferta.fechaFin) return 'Finalizada';

  return 'Activa';
};

const validarOferta = (producto, datos) => {
  const { fechaInicio, fechaFin, precioOferta } = datos;
  const precio = Number(precioOferta);

  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

if (!formatoFecha.test(fechaInicio) || !formatoFecha.test(fechaFin)) {
  throw new Error('Las fechas deben tener un año de exactamente 4 dígitos.');
}

  if (!fechaInicio || !fechaFin) {
    throw new Error('Debes ingresar ambas fechas.');
  }

  if (fechaFin < fechaInicio) {
    throw new Error('La fecha de término no puede ser anterior al inicio.');
  }

  if (!Number.isFinite(precio) || precio <= 0) {
    throw new Error('El precio de oferta debe ser mayor que cero.');
  }

  if (precio >= Number(producto.precio)) {
    throw new Error('El precio de oferta debe ser menor que el precio normal.');
  }

  return {
    fechaInicio,
    fechaFin,
    precioOferta: precio,
  };
};

// Obtiene los productos pertenecientes a la empresa.
export const obtenerProductosParaOferta = async (emprendedorId) => {
  const productos = await getProducts({ emprendedorId });

  return productos.filter((producto) => producto.activo !== false);
};

// Lista las ofertas de los productos de una empresa.
export const obtenerOfertas = async (emprendedorId) => {
  const productos = await getProducts({ emprendedorId });

  return productos
    .filter((producto) => producto.oferta)
    .map((producto) => ({
      ...producto,
      estadoOferta: obtenerEstadoOferta(producto.oferta),
    }));
};

// Crea una oferta para un producto.
export const crearOferta = async (emprendedorId, productoId, datos) => {
  const productos = await getProducts({ emprendedorId });

  const producto = productos.find(
    (item) => String(item.id) === String(productoId)
  );

  if (!producto) {
    throw new Error('No se encontró el producto seleccionado.');
  }

  if (producto.activo === false) {
    throw new Error('No puedes crear ofertas para un producto inactivo.');
  }

  if (producto.oferta) {
    throw new Error('Este producto ya tiene una oferta registrada.');
  }

  const oferta = validarOferta(producto, datos);

  await updateProduct(producto.id, { oferta });

  return {
    ...producto,
    oferta,
    estadoOferta: obtenerEstadoOferta(oferta),
  };
};

// Modifica una oferta existente.
export const actualizarOferta = async (
  emprendedorId,
  productoId,
  datos
) => {
  const productos = await getProducts({ emprendedorId });

  const producto = productos.find(
    (item) => String(item.id) === String(productoId)
  );

  if (!producto || !producto.oferta) {
    throw new Error('No se encontró la oferta que deseas editar.');
  }

  const oferta = validarOferta(producto, datos);

  await updateProduct(producto.id, { oferta });

  return {
    ...producto,
    oferta,
    estadoOferta: obtenerEstadoOferta(oferta),
  };
};
