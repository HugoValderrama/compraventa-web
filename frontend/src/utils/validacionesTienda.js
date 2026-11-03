import { validarRun } from './validarRun';

export const MAX_RAZON_SOCIAL = 50;
export const MAX_GIRO = 50;
export const MAX_PAGINA_WEB = 30;
export const MAX_DIRECCION_LOCAL = 30;

// Dominio con o sin http(s)://, ej: mitienda.cl, https://mitienda.cl/ofertas
const FORMATO_WEB = /^(https?:\/\/)?([\p{L}\d-]+\.)+[\p{L}]{2,}(\/\S*)?$/u;

const largo = (valor) => (valor ?? '').trim().length;

// El RUT de empresa usa el mismo módulo 11 que el RUN. No se restringe el rango
// porque una persona natural con giro usa su RUT personal.
export function validarRut(valor) {
  if (!largo(valor)) return 'El RUT de la empresa es obligatorio.';
  if (!validarRun(valor)) return 'Ingresa un RUT válido (ej: 76.123.456-0).';
  return '';
}

export function validarRazonSocial(valor) {
  if (!largo(valor)) return 'La razón social es obligatoria.';
  if (largo(valor) > MAX_RAZON_SOCIAL) {
    return `La razón social no puede superar los ${MAX_RAZON_SOCIAL} caracteres.`;
  }
  return '';
}

export function validarGiro(valor) {
  if (!largo(valor)) return 'El giro es obligatorio.';
  if (largo(valor) > MAX_GIRO) return `El giro no puede superar los ${MAX_GIRO} caracteres.`;
  return '';
}

// Opcional.
export function validarPaginaWeb(valor) {
  if (!largo(valor)) return '';
  if (largo(valor) > MAX_PAGINA_WEB) {
    return `La página web no puede superar los ${MAX_PAGINA_WEB} caracteres.`;
  }
  if (!FORMATO_WEB.test(valor.trim())) return 'Ingresa una página web válida (ej: mitienda.cl).';
  return '';
}

// Opcional: una tienda puede ser solo en línea.
export function validarDireccionLocal(valor) {
  if (largo(valor) > MAX_DIRECCION_LOCAL) {
    return `La dirección del local no puede superar los ${MAX_DIRECCION_LOCAL} caracteres.`;
  }
  return '';
}