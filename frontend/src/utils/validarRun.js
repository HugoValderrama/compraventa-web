
export function validarRun(run) {
  if (!run) {
    return false;
  }

  // Quitar puntos, guion y espacios
  const runLimpio = String(run)
    .replace(/[.\s-]/g, "")
    .toUpperCase();

  // Permitir 7 u 8 números + dígito verificador
  if (!/^\d{7,8}[0-9K]$/.test(runLimpio)) {
    return false;
  }

  const cuerpo = runLimpio.slice(0, -1);
  const digitoIngresado = runLimpio.slice(-1);

  // Rechazar RUN compuesto solamente por ceros
  if (Number(cuerpo) === 0) {
    return false;
  }

  let suma = 0;
  let multiplicador = 2;

  // Algoritmo módulo 11
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;

    multiplicador++;

    if (multiplicador === 8) {
      multiplicador = 2;
    }
  }

  const resultado = 11 - (suma % 11);

  let digitoCalculado;

  if (resultado === 11) {
    digitoCalculado = "0";
  } else if (resultado === 10) {
    digitoCalculado = "K";
  } else {
    digitoCalculado = String(resultado);
  }

  return digitoCalculado === digitoIngresado;
}
