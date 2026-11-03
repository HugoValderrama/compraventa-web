import { aISO } from './formatos';

export const REQUISITOS_PASSWORD = 'Mínimo 8 caracteres, una letra y un número';

const FORMATO_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarTextoObligatorio(valor, etiqueta, minimo = 2) {
  const texto = (valor ?? '').trim();
  if (!texto) return `${etiqueta} es obligatorio.`;
  if (texto.length < minimo) return `${etiqueta} debe tener al menos ${minimo} caracteres.`;
  return '';
}

export function validarNombre(valor, etiqueta) {
  const base = validarTextoObligatorio(valor, etiqueta);
  if (base) return base;
  if (!FORMATO_NOMBRE.test(valor)) return `${etiqueta} solo puede contener letras.`;
  return '';
}

export function validarCorreo(valor) {
  const correo = (valor ?? '').trim();
  if (!correo) return 'El correo es obligatorio.';
  if (!FORMATO_CORREO.test(correo)) return 'Ingresa un correo válido.';
  return '';
}

// Acepta "+56 9 1234 5678", "+56912345678", "912345678", etc. Devuelve "+569XXXXXXXX"
// (mismo formato que guarda PhoneField en el registro).
export function normalizarTelefono(valor) {
  const limpio = (valor ?? '').replace(/[\s-]/g, '');
  if (/^9\d{8}$/.test(limpio)) return `+56${limpio}`;
  return limpio;
}

export function validarTelefono(valor) {
  const tel = normalizarTelefono(valor);
  if (!tel) return 'El teléfono es obligatorio.';
  if (!/^\+569\d{8}$/.test(tel)) return 'Ingresa un teléfono chileno válido (+56 9XXXXXXXX).';
  return '';
}

export function formatearTelefono(valor) {
  const m = /^\+56(9)(\d{4})(\d{4})$/.exec(valor ?? '');
  return m ? `+56 ${m[1]} ${m[2]} ${m[3]}` : valor;
}

export function calcularEdad(iso, hoy = new Date()) {
  const [anio, mes, dia] = iso.split('-').map(Number);
  let edad = hoy.getFullYear() - anio;
  const mesActual = hoy.getMonth() + 1;
  if (mesActual < mes || (mesActual === mes && hoy.getDate() < dia)) edad -= 1;
  return edad;
}

export function validarFechaNacimiento(iso) {
  if (!iso) return 'La fecha de nacimiento es obligatoria.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || Number.isNaN(Date.parse(iso))) {
    return 'Ingresa una fecha válida.';
  }
  const edad = calcularEdad(iso);
  if (edad < 0) return 'La fecha no puede ser futura.';
  if (edad < 18) return 'Debes tener 18 años o más.';
  if (edad > 120) return 'Ingresa una fecha válida.';
  return '';
}

// Fecha máxima (aaaa-mm-dd) para el input de nacimiento: hoy menos 18 años.
export function fechaMaximaMayorEdad() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return aISO(d);
}

export function validarPassword(valor) {
  if (!valor) return 'La contraseña es obligatoria.';
  if (valor.length < 8) return 'Debe tener al menos 8 caracteres.';
  if (!/[A-Za-z]/.test(valor)) return 'Debe incluir al menos una letra.';
  if (!/\d/.test(valor)) return 'Debe incluir al menos un número.';
  return '';
}