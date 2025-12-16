// src/lib/auth.js

// --- CONFIGURACIÓN DE LA API DE SPOTIFY ---
// NOTA: En una aplicación real, estas variables deberían cargarse desde variables de entorno (.env.local)
const CLIENT_ID = 'TU_CLIENT_ID_AQUI'; // Reemplazar con tu ID de Cliente de Spotify
const REDIRECT_URI = 'http://localhost:3000/callback'; // Reemplazar con tu URI de redirección configurada
const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE_URL = 'https://api.spotify.com/v1';

// Permisos (scopes) necesarios:
// user-read-private: Obtener el ID del usuario.
// playlist-modify-public: Crear y añadir canciones a playlists.
const SCOPES = [
    'user-read-private',
    'playlist-modify-public'
].join(' ');

/**
 * Genera una cadena aleatoria para usar como estado CSRF.
 * @param {number} length - Longitud de la cadena.
 * @returns {string} Cadena aleatoria.
 */
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/**
 * Redirige al usuario a la página de autorización de Spotify.
 */
export function redirectToSpotifyAuth() {
    // El estado (state) es usado para prevención de CSRF
    const state = generateRandomString(16);
    sessionStorage.setItem('spotify_auth_state', state);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: SCOPES,
        redirect_uri: REDIRECT_URI,
        state: state
    });

    // Redirigir la ventana actual
    window.location.href = `${AUTH_URL}?${params.toString()}`;
}

/**
 * Intercambia el código de autorización por un token de acceso y un token de refresco.
 * @param {string} code - El código de autorización de Spotify.
 * @returns {Promise<object>} Los datos del token.
 */
export async function handleAuthCallback(code) {
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
    });

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    });

    if (!response.ok) {
        throw new Error(`Fallo al obtener el token: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Guardar tokens y expiración en localStorage
    const now = Date.now();
    localStorage.setItem('spotify_token', data.access_token);
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
    // Calcular expiración: ahora + (segundos * 1000 ms)
    localStorage.setItem('spotify_token_expiration', now + (data.expires_in * 1000)); 
    
    return data;
}

/**
 * Refresca el token de acceso usando el token de refresco.
 */
async function refreshToken() {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) {
        throw new Error("No hay token de refresco disponible.");
    }

    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
    });

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    });

    if (!response.ok) {
        throw new Error(`Fallo al refrescar el token: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Actualizar el token y la expiración
    const now = Date.now();
    localStorage.setItem('spotify_token', data.access_token);
    localStorage.setItem('spotify_token_expiration', now + (data.expires_in * 1000));
    // El token de refresco a veces se devuelve, si lo hace, lo actualizamos también
    if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }
    
    return data.access_token;
}

/**
 * Realiza una solicitud a la API de Spotify, manejando el token de acceso y refrescándolo si es necesario.
 * @param {string} endpoint - El endpoint de la API (ej: '/me').
 * @param {object} options - Opciones de fetch (method, body, etc.).
 * @returns {Promise<object>} El cuerpo de la respuesta JSON.
 */
export async function spotifyRequest(endpoint, options = {}) {
    let token = localStorage.getItem('spotify_token');
    const expiration = localStorage.getItem('spotify_token_expiration');
    const now = Date.now();

    // 1. Verificar y Refrescar el token si está cerca de expirar (ej: 60 segundos antes)
    if (token && expiration && now > parseInt(expiration) - 60000) {
        try {
            token = await refreshToken();
        } catch (error) {
            console.error('Error durante el refresco del token, redirigiendo al login:', error);
            // Si el refresco falla, obligar al usuario a iniciar sesión de nuevo
            localStorage.removeItem('spotify_token');
            localStorage.removeItem('spotify_refresh_token');
            window.location.href = '/'; 
            throw new Error("Token expirado y refresco fallido.");
        }
    }
    
    if (!token) {
        // Esto solo debería ocurrir si el token está completamente ausente
        throw new Error("No hay token de acceso disponible para la API.");
    }

    // 2. Realizar la solicitud a la API
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': options.body ? 'application/json' : undefined, // Asegurar Content-Type si hay body
        },
    });

    // Manejo de error 401 (Token inválido o expirado inesperadamente)
    if (response.status === 401) {
         // Intento final de refresco en caso de que Spotify nos haya dicho que el token es inválido
        try {
            token = await refreshToken();
            // Reintentar la solicitud con el nuevo token
            return spotifyRequest(endpoint, options); 
        } catch (e) {
            // Si falla el reintento, el usuario debe reautenticarse
            localStorage.removeItem('spotify_token');
            localStorage.removeItem('spotify_refresh_token');
            window.location.href = '/'; 
            throw new Error("Token rechazado por Spotify. Reautenticación necesaria.");
        }
    }

    // Manejo de otros errores HTTP
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Error en la API de Spotify (${response.status}): ${errorBody.error?.message || response.statusText}`);
    }

    // Devolver el JSON (manejar respuesta 204 No Content si es necesario)
    return response.status === 204 ? {} : response.json();
}