const API_URL = "http://localhost:7173/api"; // Verifica que sea el puerto exacto de tu backend

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

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error = new Error(data?.mensaje || `Error HTTP ${response.status}`);
        error.codigo = response.status;
        throw error;
    }

    return data; // <-- Esta línea es clave para que 'data' no sea undefined
}

export async function login({ run, password }) {
    const runSinPuntos = String(run ?? "").replace(/\./g, "").trim();

    const data = await apiFetch("/Auth/login", {
        method: "POST",
        body: JSON.stringify({ run: runSinPuntos, clave: password }),
    });

    if (!data?.token) {
        throw new Error("El servidor no devolvió un token válido.");
    }

    localStorage.setItem("token", data.token);
    return data.usuario;
}

export async function getMe() {
    return apiFetch("/Users/me");
}
