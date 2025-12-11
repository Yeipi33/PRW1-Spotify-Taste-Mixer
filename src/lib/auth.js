// src/lib/auth.js

// Variables de entorno necesarias (NEXT_PUBLIC_ son accesibles en el cliente)
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;

// Scopes necesarios para el proyecto (permisos que solicitamos)
const scopes = [
  "user-read-private", 
  "user-read-email", 
  "user-top-read",     
  "playlist-modify-public", 
  "playlist-modify-private"
].join(",");

// URLs fijas de Spotify
const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize"; // URL de Autorización
// const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"; // No necesario aquí, solo en la ruta API


// ------------------------------------------------------------------
// 1. GENERACIÓN DE URL
// ------------------------------------------------------------------

/**
 * Construye la URL completa a la que el usuario debe ser redirigido para el login.
 * @returns {string} La URL de autorización de Spotify.
 */
export const getAuthorizeUrl = () => {
  const url = new URL(SPOTIFY_AUTHORIZE_URL);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", CLIENT_ID);
  url.searchParams.append("scope", scopes);
  url.searchParams.append("redirect_uri", REDIRECT_URI);
  
  return url.toString();
};


// ------------------------------------------------------------------
// 2. GESTIÓN DE TOKENS (REFRESH)
// ------------------------------------------------------------------

/**
 * Llama a la ruta API del servidor para obtener un nuevo Access Token 
 * usando el Refresh Token guardado.
 * @param {string} refreshTokenValue El refresh token actual del usuario.
 * @returns {Promise<object>} Los nuevos datos del token.
 */
export async function refreshToken(refreshTokenValue) {
  // Llama a nuestra ruta API del servidor (/api/refresh-token)
  const response = await fetch('/api/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token. Reauthentication required.");
  }

  return response.json();
}

/**
 * Intenta obtener un Access Token válido, refrescándolo si es necesario.
 * @returns {Promise<string|null>} El Access Token válido, o null si falla.
 */
export async function getAccessToken() {
  let accessToken = localStorage.getItem('access_token');
  let expiresAt = localStorage.getItem('expires_in');
  let refreshTokenValue = localStorage.getItem('refresh_token');

  // Si no hay token de acceso, o ha expirado (usando un margen de 5 minutos: 300000 ms)
  if (!accessToken || Date.now() >= (parseInt(expiresAt) - 300000)) {
    if (!refreshTokenValue) {
      // No hay tokens, debe redirigirse al login
      return null; 
    }

    try {
      const newTokens = await refreshToken(refreshTokenValue);
      
      // 1. Guardar el nuevo Access Token y tiempo de expiración
      localStorage.setItem('access_token', newTokens.access_token);
      localStorage.setItem('expires_in', Date.now() + newTokens.expires_in * 1000);
      
      // 2. Opcionalmente, guardar nuevo refresh token si Spotify lo envía
      if (newTokens.refresh_token) {
        localStorage.setItem('refresh_token', newTokens.refresh_token);
      }
      
      return newTokens.access_token;
    } catch (error) {
      console.error(error.message);
      // Fallo crítico, forzar la redirección para que el usuario se logee de nuevo.
      // Usamos window.location.href para forzar la redirección del navegador.
      window.location.href = getAuthorizeUrl(); 
      return null;
    }
  }

  return accessToken;
}


// ------------------------------------------------------------------
// 3. LOGOUT (Recomendado)
// ------------------------------------------------------------------

/**
 * Elimina todos los tokens de almacenamiento local y redirige al inicio.
 */
export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_in');
    
    // Redirigir a la página de inicio o login
    window.location.href = '/'; 
};