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

// Datos de ejemplo. El primer correo/teléfono de cada lista es el principal.
let usuarioMock = {
  id: 1,
  rol: 'cliente',
  run: '12.345.678-5',
  nombres: 'Juan Andrés',
  apellidos: 'Pérez Soto',
  fechaNacimiento: '1998-05-14',
  fechaRegistro: '2025-03-10',
  direccionPrincipal: 'Av. Alemania 1234, Osorno',
  correos: ['juan.perez@correo.cl', 'jperez@ulagos.cl'],
  telefonos: ['+56912345678'],
  password: 'Clave123!', // solo para simular la verificación; el backend nunca la devuelve
};

const publico = ({ password, ...resto }) => ({
  ...resto,
  correos: [...resto.correos],
  telefonos: [...resto.telefonos],
});

// TODO: conectar API
// GET /api/users/me
export async function getMe() {
  await esperar();
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