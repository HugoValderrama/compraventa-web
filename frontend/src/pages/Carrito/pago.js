import { cargarCatalogo } from '../Catalogo/catalogo.js'
import { cargarCarrito, resumirCarrito } from './carrito.js'
import { cargarDirecciones, prepararEnvio } from './direcciones.js'

export const METODOS_PAGO = { TARJETA: 'tarjeta', TRANSFERENCIA: 'transferencia' }

export function tarjetaVacia() {
  return { numero: '', vencimiento: '', cvv: '' }
}

export function soloDigitos(valor, maximo) {
  return typeof valor === 'string' ? valor.replace(/[^0-9]/g, '').slice(0, maximo) : ''
}

export function formatearNumeroTarjeta(valor) {
  return soloDigitos(valor, 19).replace(/(.{4})(?=.)/g, '$1 ')
}

export function formatearVencimiento(valor) {
  const digitos = soloDigitos(valor, 4)
  return digitos.length > 2 ? digitos.slice(0, 2) + '/' + digitos.slice(2) : digitos
}

function luhn(numero) {
  let suma = 0
  let duplicar = false
  for (let i = numero.length - 1; i >= 0; i--) {
    let digito = Number(numero[i])
    if (duplicar) {
      digito *= 2
      if (digito > 9) digito -= 9
    }
    suma += digito
    duplicar = !duplicar
  }
  return suma % 10 === 0
}

export function validarFormularioPago(metodo, datos, fecha = new Date()) {
  if (!Object.values(METODOS_PAGO).includes(metodo)) return { metodo: 'Selecciona un método de pago.' }
  if (metodo === METODOS_PAGO.TRANSFERENCIA) return {}
  const errores = {}
  const { numero = '', vencimiento = '', cvv = '' } = datos ?? {}
  if (typeof numero !== 'string' || numero !== soloDigitos(numero, 19) || numero.length < 13 || /^0+$/.test(numero) || !luhn(numero)) {
    errores.numero = 'Revisa el número de tarjeta de prueba.'
  }
  if (typeof vencimiento !== 'string' || vencimiento !== soloDigitos(vencimiento, 4) || vencimiento.length !== 4) {
    errores.vencimiento = 'Ingresa una fecha con formato MM/AA.'
  } else {
    const mes = Number(vencimiento.slice(0, 2))
    const anio = 2000 + Number(vencimiento.slice(2))
    if (mes < 1 || mes > 12) errores.vencimiento = 'El mes debe estar entre 01 y 12.'
    else if (anio < fecha.getFullYear() || (anio === fecha.getFullYear() && mes < fecha.getMonth() + 1)) {
      errores.vencimiento = 'La fecha de expiración ya pasó.'
    }
  }
  if (typeof cvv !== 'string' || cvv !== soloDigitos(cvv, 4) || cvv.length < 3) {
    errores.cvv = 'Ingresa 3 o 4 dígitos.'
  }
  return errores
}

export function cargarContextoPago(almacenamiento) {
  const carrito = cargarCarrito(almacenamiento)
  const catalogo = cargarCatalogo(almacenamiento)
  const envio = cargarDirecciones(almacenamiento)
  const resumen = resumirCarrito(carrito.items, catalogo.productos)
  const direccion = envio.direcciones.find((item) => item.id === envio.seleccionadaId) ?? null
  const error = carrito.error || catalogo.error || envio.error || (
    !resumen.puedeContinuar
      ? resumen.lineas.find((linea) => linea.problema)?.problema || 'Revisa los productos y las cantidades del carrito.'
      : !direccion ? 'Selecciona una dirección de envío antes de continuar.' : ''
  )
  return { direccion, resumen, error }
}

// Solo prueba de interfaz. No inicia transacciones, no crea órdenes y no escribe en almacenamiento.
export function prepararRevisionPago(metodo, datos, almacenamiento, fecha) {
  const errores = validarFormularioPago(metodo, datos, fecha)
  if (Object.keys(errores).length) return { errores, revision: null }
  const { direccion, resumen } = prepararEnvio(almacenamiento)
  return {
    errores: {},
    revision: {
      direccion,
      resumen,
      metodo,
      ultimosDigitos: metodo === METODOS_PAGO.TARJETA ? datos.numero.slice(-4) : null,
      modo: 'prueba',
    },
  }
}
