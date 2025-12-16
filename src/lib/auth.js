// src/lib/auth.js (CORREGIDO)

// --- CONFIGURACIÓN DE LA API DE SPOTIFY ---
const CLIENT_ID = 'adff33428193448e834ba2278b8d35f3'; 
const REDIRECT_URI = 'http://127.0.0.1:3000/auth/callback'; 
const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE_URL = 'https://api.spotify.com/v1';

// Permisos (scopes) necesarios:
const SCOPES = [
    'user-read-private',
    'playlist-modify-public',
    'user-top-read' // Agregado para los widgets top tracks/artists
].join(' ');

/**
 * Genera una cadena aleatoria para usar como estado CSRF.
 * EXPORTADA para ser usada en el componente /page.js.
 * @param {number} length - Longitud de la cadena.
 * @returns {string} Cadena aleatoria.
 */
export function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/**
 * Genera la URL de autorización para el login de Spotify.
 * @param {string} state - El estado CSRF generado.
 * @returns {string} La URL de redirección a Spotify.
 */
export function getAuthorizationUrl(state) {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: SCOPES,
        redirect_uri: REDIRECT_URI,
        state: state
    });

    return `${AUTH_URL}?${params.toString()}`;
}

// ... (Resto de funciones: handleAuthCallback, refreshToken, spotifyRequest)
// NOTE: Para el resto de funciones, asegúrate de que usan export si se importan fuera de este módulo.

/*
   A continuación se incluyen las funciones handleAuthCallback, refreshToken, spotifyRequest 
   completas para referencia, ya que se asume que están definidas.
*/

export async function handleAuthCallback(code) {
    // ... lógica de intercambio de tokens (usa las API Routes si está en el cliente)
    // NOTE: En el flujo final (callback/page.js), la app usa la API Route /api/spotify-token
    const response = await fetch('/api/spotify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });

    if (!response.ok) {
        throw new Error(`Fallo al obtener el token: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Guardar tokens y expiración en localStorage
    const now = Date.now();
    localStorage.setItem('spotify_token', data.access_token);
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
    localStorage.setItem('spotify_token_expiration', now + (data.expires_in * 1000) - 10000); // 10s antes
    
    return data;
}

async function refreshToken() {
    // ... lógica de refresco de tokens (usa la API Route /api/refresh-token)
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) {
        throw new Error("No hay token de refresco disponible.");
    }
    
    const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
        throw new Error(`Fallo al refrescar el token: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const now = Date.now();
    localStorage.setItem('spotify_token', data.access_token);
    localStorage.setItem('spotify_token_expiration', now + (data.expires_in * 1000) - 10000);
    if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }
    
    return data.access_token;
}

export async function spotifyRequest(endpoint, options = {}) {
    let token = localStorage.getItem('spotify_token');
    const expiration = localStorage.getItem('spotify_token_expiration');
    const now = Date.now();

    // Lógica de expiración anticipada y refresco
    if (token && expiration && now > parseInt(expiration)) {
        try {
            token = await refreshToken();
        } catch (error) {
            localStorage.removeItem('spotify_token');
            localStorage.removeItem('spotify_refresh_token');
            window.location.href = '/'; 
            throw new Error("Token expirado y refresco fallido.");
        }
    }
    
    if (!token) {
        throw new Error("No hay token de acceso disponible.");
    }

    // Solicitud a la API
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    // Manejo de error 401 y reintento
    if (response.status === 401) {
        try {
            token = await refreshToken();
            return spotifyRequest(endpoint, options); 
        } catch (e) {
            localStorage.removeItem('spotify_token');
            localStorage.removeItem('spotify_refresh_token');
            window.location.href = '/'; 
            throw new Error("Token rechazado por Spotify. Reautenticación necesaria.");
        }
    }

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Error en la API de Spotify (${response.status}): ${errorBody.error?.message || response.statusText}`);
    }

    return response.status === 204 ? {} : response.json();
}