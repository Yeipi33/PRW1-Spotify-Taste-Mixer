// src/lib/auth.js

import { headers } from 'next/headers';

// Se obtienen las variables de entorno públicas
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;
// Scopes necesarios: Leer el perfil del usuario, listar los top tracks/artistas, crear playlists
const SCOPES = 'user-read-private user-top-read playlist-modify-public playlist-modify-private'; 

/**
 * Genera una cadena aleatoria para usar como 'state' en OAuth
 * @param {number} length Longitud de la cadena a generar
 * @returns {string} Cadena aleatoria
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
 * @returns {string} La URL de redirección a Spotify.
 */
export function getAuthorizationUrl() {
    const state = generateRandomString(16);
    // Obligatorio: guardar el 'state' en sessionStorage para validación CSRF en el callback
    // Esto se haría en el componente de cliente que redirige al usuario. 
    // Por ahora, solo retornamos la URL.

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: SCOPES,
        redirect_uri: REDIRECT_URI,
        state: state
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Función para obtener el token de localStorage
 * @returns {string | null} Token de acceso
 */
export function getAccessToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('spotify_token');
    }
    return null;
}