import { leerSesionGuardada, normalizarUsuario } from '../utils/sesion';

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

const limpiarRun = (run) => String(run ?? '').replace(/[.\s-]/g, '').toUpperCase();

// Cuentas de prueba para el login simulado (cualquier contraseña no vacía sirve):
//   11.111.111-1 -> cliente · 22.222.222-2 -> emprendedor · 12.345.678-5 -> ambos
const CUENTAS_DE_PRUEBA = {
  111111111: { roles: ['cliente'] },
  222222222: { roles: ['emprendedor'] },
  123456785: { roles: ['cliente', 'emprendedor'] },
};

// Un solo usuario de mentira (id 1): de la sesión solo se toman roles y modo.
// Los correos/teléfonos: el primero de cada lista es el principal.
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
  // La empresa se guarda junto al usuario (solo la usa el modo emprendedor).
  empresa: {
    id: 1,
    razonSocial: 'Pérez y Soto Artesanías SpA',
    rut: '76.123.456-0',
    giro: 'Venta de artesanías',
    paginaWeb: 'artesaniasps.cl',
    direccionLocal: 'Calle Mackenna 456, Osorno',
  },
};

// La sesión la guarda AuthContext en localStorage (laguito.sesion). El "backend" de
// mentira la lee para saber quién llama; con el backend real esto sale del token.
function exigirSesion() {
  const guardada = leerSesionGuardada();
  const usuario = normalizarUsuario(guardada?.usuario);
  if (!usuario) throw Object.assign(new Error('No hay una sesión activa.'), { codigo: 401 });
  const modo = usuario.roles.includes(guardada.modo) ? guardada.modo : usuario.roles[0];
  return { roles: usuario.roles, modo };
}

const publico = ({ password, empresa, ...resto }, sesion) => ({
  ...resto,
  roles: sesion.roles,
  modo: sesion.modo,
  correos: [...resto.correos],
  telefonos: [...resto.telefonos],
});

// TODO: conectar API
// POST /api/auth/login   (devuelve la sesión mínima que guarda AuthContext)
export async function login({ run, password }) {
  await esperar();
  const cuenta = CUENTAS_DE_PRUEBA[limpiarRun(run)];
  if (!cuenta || !String(password ?? '').trim()) {
    throw Object.assign(new Error('RUN o contraseña incorrectos.'), { codigo: 401 });
  }
  return {
    id: usuarioMock.id,
    nombre: `${usuarioMock.nombres} ${usuarioMock.apellidos}`,
    roles: [...cuenta.roles],
  };
}

// TODO: conectar API
// GET /api/users/me
export async function getMe() {
  // La sesión se lee DESPUÉS del retardo: AuthContext la escribe en un efecto,
  // y justo después de iniciar sesión todavía no estaría en localStorage.
  await esperar();
  return publico(usuarioMock, exigirSesion());
}

// TODO: conectar API
// PUT /api/users/me
export async function updateMe(data) {
  await esperar();
  const sesion = exigirSesion();
  const cambios = {};
  CAMPOS_EDITABLES.forEach((campo) => {
    if (data[campo] !== undefined) cambios[campo] = data[campo];
  });
  usuarioMock = { ...usuarioMock, ...cambios };
  return publico(usuarioMock, sesion);
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