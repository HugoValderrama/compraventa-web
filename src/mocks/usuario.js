const RETARDO_MS = 500;
const esperar = (ms = RETARDO_MS) => new Promise((resolve) => setTimeout(resolve, ms));

const CAMPOS_EDITABLES = [
  'nombres',
  'apellidos',
  'fechaNacimiento',
  'direccionPrincipal',
  'correos',
  'telefonos',
];

const CAMPOS_EMPRESA = ['razonSocial', 'rut', 'giro', 'paginaWeb', 'direccionLocal'];

// Solo desarrollo: los roles reales vendrán del backend (token/sesión).
// Un usuario puede ser cliente, emprendedor o ambos. En la consola del navegador:
//   localStorage.setItem('rolMock', 'emprendedor')   -> solo emprendedor
//   localStorage.setItem('rolMock', 'ambos')         -> cliente y emprendedor
//   localStorage.removeItem('rolMock')               -> solo cliente (por defecto)
//   localStorage.setItem('rolMock', 'visitante')
// Después, recargar la página.
const rolesActuales = () => {
  try {
    const valor = localStorage.getItem('rolMock');
    if (valor === 'emprendedor') return ['emprendedor'];
    if (valor === 'ambos') return ['cliente', 'emprendedor'];
  } catch {
    /* almacenamiento no disponible */
  }
  return ['cliente'];
};

const sinSesion = () => {
  try {
    return localStorage.getItem('rolMock') === 'visitante';
  } catch {
    return false;
  }
}

// Datos de ejemplo. El primer correo/teléfono de cada lista es el principal.
let usuarioMock = {
  id: 1,
  run: '12.345.678-5',
  nombres: 'Juan Andrés',
  apellidos: 'Pérez Soto',
  fechaNacimiento: '1998-05-14',
  fechaRegistro: '2025-03-10',
  direccionPrincipal: 'Av. Alemania 1234, Osorno',
  correos: ['juan.perez@correo.cl', 'jperez@ulagos.cl'],
  telefonos: ['+56912345678'],
  password: 'Clave123!', // solo para simular la verificación; el backend nunca la devuelve
  // La empresa se guarda junto al usuario (solo la usa el rol emprendedor).
  empresa: {
    id: 1,
    razonSocial: 'Pérez y Soto Artesanías SpA',
    rut: '76.123.456-0',
    giro: 'Venta de artesanías',
    paginaWeb: 'artesaniasps.cl',
    direccionLocal: 'Calle Mackenna 456, Osorno',
  },
};

const publico = ({ password, empresa, ...resto }) => ({
  ...resto,
  roles: rolesActuales(),
  correos: [...resto.correos],
  telefonos: [...resto.telefonos],
});

// TODO: conectar API
// GET /api/users/me
export async function getMe() {
  await esperar();
  if (sinSesion()) throw Object.assign(new Error('No hay una sesión activa.'), { codigo: 401 });
  return publico(usuarioMock);
}

// TODO: conectar API
// PUT /api/users/me
export async function updateMe(data) {
  await esperar();
  const cambios = {};
  CAMPOS_EDITABLES.forEach((campo) => {
    if (data[campo] !== undefined) cambios[campo] = data[campo];
  });
  usuarioMock = { ...usuarioMock, ...cambios };
  return publico(usuarioMock);
}

// TODO: conectar API
// PUT /api/users/me/password
export async function changePassword({ actual, nueva }) {
  await esperar();
  if (actual !== usuarioMock.password) {
    throw Object.assign(new Error('La contraseña actual es incorrecta.'), { campo: 'actual' });
  }
  usuarioMock = { ...usuarioMock, password: nueva };
  return { ok: true };
}

// TODO: conectar API
// No hay endpoint propio: la empresa viaja dentro del usuario (campo "empresa" de GET /api/users/me).
// Si el backend la entrega así, esta función se elimina y se lee de getMe().
export async function getEmpresa() {
  await esperar();
  return { ...usuarioMock.empresa };
}

// TODO: conectar API
// No hay endpoint propio: se envía dentro de PUT /api/users/me (campo "empresa").
export async function updateEmpresa(data) {
  await esperar();
  const cambios = {};
  CAMPOS_EMPRESA.forEach((campo) => {
    if (data[campo] !== undefined) cambios[campo] = data[campo];
  });
  usuarioMock = { ...usuarioMock, empresa: { ...usuarioMock.empresa, ...cambios } };
  return { ...usuarioMock.empresa };
}