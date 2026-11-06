export const CLAVE_MENSAJERIA = "laguito_mensajeria_local_v1";
export const MAXIMO_MENSAJE = 2000;

export function cargarMensajeria() {
  try {
    const guardado = localStorage.getItem(CLAVE_MENSAJERIA);

    if (guardado === null) {
      return { version: 1, conversaciones: [] };
    }

    const datos = JSON.parse(guardado);

    if (!datos || !Array.isArray(datos.conversaciones)) {
      throw new Error("Los datos de mensajería no son válidos.");
    }

    return datos;
  } catch (error) {
    return {
      conversaciones: [],
      error: error.message || "No se pudo leer la mensajería.",
    };
  }
}

export function enviarMensaje(id, texto) {
  const contenido = String(texto ?? "").trim();

  if (!contenido) {
    throw new Error("Escribe un mensaje.");
  }

  if (contenido.length > MAXIMO_MENSAJE) {
    throw new Error(`El máximo es de ${MAXIMO_MENSAJE} caracteres.`);
  }

  const datos = cargarMensajeria();

  if (datos.error) {
    throw new Error(datos.error);
  }

  const conversacion = datos.conversaciones.find(
    (conversacion) => conversacion.id === id
  );

  if (!conversacion) {
    throw new Error("No se encontró la conversación.");
  }

  const mensaje = {
    id: crypto.randomUUID(),
    texto: contenido,
    fecha: new Date().toISOString(),
    remitente: "admin",
  };

  conversacion.mensajes = [
    ...(conversacion.mensajes ?? []),
    mensaje,
  ];

  localStorage.setItem(CLAVE_MENSAJERIA, JSON.stringify(datos));

  return mensaje;
}