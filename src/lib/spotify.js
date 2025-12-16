// src/lib/spotify.js

import { spotifyRequest } from './auth';

/**
 * Obtiene el perfil del usuario actualmente autenticado (incluye el ID de usuario).
 * Endpoint: /me
 * @returns {Promise<object>} Objeto con los datos del perfil del usuario.
 */
export async function getCurrentUserProfile() {
    try {
        const userProfile = await spotifyRequest('/me');
        return userProfile;
    } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
        throw error;
    }
}

/**
 * Crea una nueva lista de reproducción vacía para el usuario.
 * Endpoint: POST /users/{user_id}/playlists
 * @param {string} userId - El ID del usuario de Spotify.
 * @param {string} name - Nombre de la nueva playlist.
 * @param {boolean} isPublic - Si la playlist debe ser pública.
 * @returns {Promise<object>} Objeto de la playlist creada.
 */
export async function createPlaylist(userId, name, isPublic = true) {
    const body = {
        name: name,
        public: isPublic,
        description: 'Lista generada por Spotify Taste Mixer'
    };
    
    try {
        // spotifyRequest ya añade el Content-Type: application/json si hay body
        const newPlaylist = await spotifyRequest(`/users/${userId}/playlists`, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        return newPlaylist;
    } catch (error) {
        console.error("Error al crear la playlist:", error);
        throw error;
    }
}

/**
 * Añade una lista de canciones a una playlist existente.
 * Endpoint: POST /playlists/{playlist_id}/tracks
 * @param {string} playlistId - El ID de la playlist destino.
 * @param {Array<string>} trackUris - Array de URIs de las canciones (ej: ['spotify:track:ID1', 'spotify:track:ID2']).
 * @returns {Promise<object>} Objeto de respuesta de Spotify.
 */
export async function addTracksToPlaylist(playlistId, trackUris) {
    const body = {
        uris: trackUris
    };

    try {
        const response = await spotifyRequest(`/playlists/${playlistId}/tracks`, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        return response;
    } catch (error) {
        console.error("Error al añadir canciones:", error);
        throw error;
    }
}