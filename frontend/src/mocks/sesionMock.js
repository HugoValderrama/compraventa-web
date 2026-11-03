import { leerSesionGuardada, normalizarUsuario } from '../utils/sesion';

export const fallo = (mensaje, codigo, campo) =>
  Object.assign(new Error(mensaje), { codigo, ...(campo ? { campo } : {}) });

// En el backend el emprendedor sale del token; aquí, de la sesión guardada por AuthContext.
export function exigirEmprendedor() {
  const usuario = normalizarUsuario(leerSesionGuardada()?.usuario);
  if (!usuario) throw fallo('No hay una sesión activa.', 401);
  if (!usuario.roles.includes('emprendedor')) {
    throw fallo('Solo los emprendedores pueden usar esta función.', 403);
  }
  return usuario;
}