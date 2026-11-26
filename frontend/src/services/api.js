const API_URL = "http://localhost:7173/api";

export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.mensaje || "Ocurrió un error en la petición");
    }

    return data;
}

export async function login({ run, password }) {
    // Quitamos los puntos por si el campo de texto formatea el RUN como "11.222.333-9"
    const runSinPuntos = String(run ?? "").replace(/\./g, "").trim();

    const data = await apiFetch("/Auth/login", {
        method: "POST",
        body: JSON.stringify({ run: runSinPuntos, clave: password }),
    });

    // Guardamos el token JWT para futuras peticiones protegidas
    localStorage.setItem("token", data.token);

    // Devolvemos { id, nombre, roles } tal como lo espera AuthContext
    return data.usuario;
}
