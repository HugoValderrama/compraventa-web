export const tieneRol = (usuario, rol) =>
  Array.isArray(usuario?.roles) && usuario.roles.includes(rol);

export const esCliente = (usuario) => tieneRol(usuario, 'cliente');
export const esEmprendedor = (usuario) => tieneRol(usuario, 'emprendedor');
export const tieneAmbosRoles = (usuario) => esCliente(usuario) && esEmprendedor(usuario);
export const esAdministrador = (usuario) => tieneRol(usuario, 'administrador');