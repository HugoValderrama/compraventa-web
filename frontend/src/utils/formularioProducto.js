// Conversión formulario <-> producto y validaciones (se repetirán en el backend).

export const MAX_NOMBRE = 50;
export const MAX_DESCRIPCION = 100; // límite de la base de datos
export const MAX_FOTOS = 5;
export const MAX_BYTES_FOTO = 5 * 1024 * 1024;
export const TIPOS_FOTO = ['image/jpeg', 'image/png'];
export const MAX_TIPO_VARIANTE = 20;
export const TIPOS_VARIANTE = ['Tamaño', 'Color', 'Otro'];

export const nuevoId = (prefijo) =>
  `${prefijo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const nuevaVariante = () => ({ id: nuevoId('v'), etiqueta: '', sku: '', stock: '0' });

export const formVacio = () => ({
  nombre: '',
  descripcion: '',
  categoria: '',
  precio: '',
  restriccionEdad: false,
  activo: true,
  tipoSel: 'Tamaño',
  tipoOtro: '',
  variantes: [nuevaVariante()],
  fotos: [], // { id, url, archivo? }
  material: '',
  dimensiones: '',
  peso: '',
  origen: '',
  retiroEnTaller: false,
  despacho: true,
  costoEnvio: '0',
  diasPreparacion: '1',
});

// Producto (ya normalizado) -> formulario (todo texto en los campos numéricos).
export function aFormulario(p) {
  const estandar = TIPOS_VARIANTE.slice(0, 2).includes(p.tipoVariante);
  return {
    nombre: p.nombre ?? '',
    descripcion: p.descripcion ?? '',
    categoria: p.categoria ?? '',
    precio: p.precio ? String(p.precio) : '',
    restriccionEdad: p.restriccionEdad,
    activo: p.activo,
    tipoSel: estandar ? p.tipoVariante : 'Otro',
    tipoOtro: estandar ? '' : p.tipoVariante,
    variantes: p.variantes.map((v) => ({
      id: v.id,
      etiqueta: v.etiqueta,
      sku: v.sku,
      stock: String(v.stock),
    })),
    fotos: p.fotos.map((url) => ({ id: nuevoId('f'), url })),
    material: p.caracteristicas.Material ?? '',
    dimensiones: p.caracteristicas.Dimensiones ?? '',
    peso: p.caracteristicas.Peso ?? '',
    origen: p.caracteristicas.Origen ?? '',
    retiroEnTaller: p.envio.retiroEnTaller,
    despacho: p.envio.despacho,
    costoEnvio: String(p.envio.costoEnvio),
    diasPreparacion: String(p.envio.diasPreparacion),
  };
}

// Formulario validado -> datos para createProduct/updateProduct.
export function aDatos(form) {
  return {
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    categoria: form.categoria,
    precio: Number(form.precio),
    restriccionEdad: form.restriccionEdad,
    activo: form.activo,
    tipoVariante: form.tipoSel === 'Otro' ? form.tipoOtro.trim() : form.tipoSel,
    variantes: form.variantes.map((v) => ({
      id: v.id,
      etiqueta: v.etiqueta.trim(),
      sku: v.sku.trim(),
      stock: Number(v.stock),
    })),
    // TODO: conectar API (subir los archivos y guardar las URLs definitivas)
    fotos: form.fotos.map((f) => f.url),
    caracteristicas: {
      Material: form.material.trim(),
      Dimensiones: form.dimensiones.trim(),
      Peso: form.peso.trim(),
      Origen: form.origen.trim(),
    },
    envio: {
      retiroEnTaller: form.retiroEnTaller,
      despacho: form.despacho,
      costoEnvio: form.despacho ? Number(form.costoEnvio) : 0,
      diasPreparacion: Number(form.diasPreparacion),
    },
  };
}

const esEntero = (texto) => /^-?\d+$/.test(String(texto).trim());

export function validarArchivoFoto(archivo, cantidadActual) {
  if (cantidadActual >= MAX_FOTOS) return `Solo puedes subir hasta ${MAX_FOTOS} fotografías.`;
  if (!TIPOS_FOTO.includes(archivo.type)) {
    return `“${archivo.name}”: solo se permiten imágenes JPG o PNG.`;
  }
  if (archivo.size > MAX_BYTES_FOTO) return `“${archivo.name}”: supera los 5 MB.`;
  return '';
}

// Devuelve { campo: mensaje, ..., variantes: { [idVariante]: { etiqueta, sku, stock } } }
export function validarFormulario(form) {
  const e = { variantes: {} };

  const nombre = form.nombre.trim();
  if (!nombre) e.nombre = 'El nombre es obligatorio.';
  else if (nombre.length > MAX_NOMBRE) e.nombre = `El nombre puede tener hasta ${MAX_NOMBRE} caracteres.`;

  const descripcion = form.descripcion.trim();
  if (!descripcion) e.descripcion = 'La descripción es obligatoria.';
  else if (descripcion.length > MAX_DESCRIPCION) {
    e.descripcion = `La descripción puede tener hasta ${MAX_DESCRIPCION} caracteres.`;
  }

  if (!form.categoria) e.categoria = 'Selecciona una categoría.';

  if (!esEntero(form.precio) || Number(form.precio) < 1) {
    e.precio = 'El precio debe ser un número entero mayor que cero.';
  }

  if (form.tipoSel === 'Otro') {
    const tipo = form.tipoOtro.trim();
    if (!tipo) e.tipoOtro = 'Indica el tipo de variante.';
    else if (tipo.length > MAX_TIPO_VARIANTE) {
      e.tipoOtro = `El tipo puede tener hasta ${MAX_TIPO_VARIANTE} caracteres.`;
    }
  }

  const conteoSku = new Map();
  form.variantes.forEach((v) => {
    const sku = v.sku.trim().toLowerCase();
    if (sku) conteoSku.set(sku, (conteoSku.get(sku) ?? 0) + 1);
  });

  form.variantes.forEach((v) => {
    const ev = {};
    if (form.variantes.length > 1 && !v.etiqueta.trim()) ev.etiqueta = 'Indica el nombre de la variante.';
    if ((conteoSku.get(v.sku.trim().toLowerCase()) ?? 0) > 1) ev.sku = 'El SKU está repetido en este producto.';
    if (!esEntero(v.stock) || Number(v.stock) < 0) ev.stock = 'El stock debe ser un entero desde 0.';
    if (Object.keys(ev).length) e.variantes[v.id] = ev;
  });

  if (!form.retiroEnTaller && !form.despacho) e.entrega = 'Elige al menos una opción de entrega.';
  if (form.despacho && (!esEntero(form.costoEnvio) || Number(form.costoEnvio) < 0)) {
    e.costoEnvio = 'El costo de envío debe ser un entero desde 0.';
  }
  if (!esEntero(form.diasPreparacion) || Number(form.diasPreparacion) < 1) {
    e.diasPreparacion = 'Los días de preparación deben ser un entero desde 1.';
  }

  return e;
}

export const hayErrores = (e) =>
  Object.entries(e).some(([clave, valor]) =>
    clave === 'variantes'
      ? Object.values(valor).some((fila) => Object.values(fila).some(Boolean))
      : Boolean(valor)
  );