export function validarRun(run) {
  if (!run) {
    return false;
  }

  // Quitar puntos, guion y espacios
  const runLimpio = run
    .replace(/\./g, "")
    .replace(/-/g, "")
    .replace(/\s/g, "")
    .toUpperCase();

  // Debe tener al menos cuerpo + dígito verificador
  if (runLimpio.length < 2) {
    return false;
  }

  const cuerpo = runLimpio.slice(0, -1);
  const digitoIngresado = runLimpio.slice(-1);

  // El cuerpo debe contener solamente números
  if (!/^\d+$/.test(cuerpo)) {
    return false;
  }

  // El dígito verificador debe ser número o K
  if (!/^[0-9K]$/.test(digitoIngresado)) {
    return false;
  }

  let suma = 0;
  let multiplicador = 2;

  // Recorrer el RUN de derecha a izquierda
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;

    multiplicador++;

    if (multiplicador === 8) {
      multiplicador = 2;
    }
  }

  const resto = suma % 11;
  const resultado = 11 - resto;

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