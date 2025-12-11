// src/lib/spotify.js

import { getAccessToken } from './auth';

// URL base de la API de Spotify (reemplazando el marcador de posición)
const SPOTIFY_API_BASE_URL = "https://developer.spotify.com/documentation/web-api5$"; 

// ------------------------------------------------------------------
// 1. FUNCIÓN CENTRAL DE PETICIÓN (FETCH WRAPPER)
// ------------------------------------------------------------------

async function spotifyFetch(endpoint, options = {}) {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('No se pudo obtener el token de acceso. Autenticación fallida.');
  }

  const url = `${SPOTIFY_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    throw new Error("Token expirado o inválido. Reautenticación necesaria.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`Error en la API de Spotify (${endpoint}):`, response.status, errorData);
    throw new Error(`Fallo en la petición a Spotify: ${response.status}`);
  }

  return response.status === 204 ? {} : response.json();
}

// ------------------------------------------------------------------
// 2. FUNCIONES DE UTILIDAD PARA WIDGETS
// ------------------------------------------------------------------

export const getUserProfile = () => {
  return spotifyFetch('/me');
};

export const getUserTopArtists = (limit = 5) => {
  return spotifyFetch(`/me/top/artists?limit=${limit}&time_range=medium_term`);
};

export const getArtistTopTracks = (artistId, market = 'ES') => {
    return spotifyFetch(`/artists/${artistId}/top-tracks?market=${market}`);
};

// ------------------------------------------------------------------
// 3. ESTRATEGIA DE GENERACIÓN DE PLAYLIST (ANTI-DEPRECATED)
// ------------------------------------------------------------------

export async function generatePlaylist(preferences) {
  let tracks = [];
  const MAX_TRACKS_PER_ARTIST = 3;
  const SEED_LIMIT = 5;

  const topArtistsData = await getUserTopArtists(SEED_LIMIT);
  let artistIds = topArtistsData.items.map(a => a.id);
  
  // TO-DO: Implementar el uso de preferences.genres para buscar más artistas/tracks
  // TO-DO: Implementar el uso de preferences.popularity para filtrar el resultado

  for (const artistId of artistIds.slice(0, SEED_LIMIT)) {
    try {
      const topTracks = await getArtistTopTracks(artistId);
      // Filtro simple: aplicar la popularidad mínima del widget
      const minPopularity = preferences.popularity ? preferences.popularity.min : 50; 
      
      const filteredTracks = topTracks.tracks.filter(
        track => track.popularity >= minPopularity
      );

      tracks.push(...filteredTracks.slice(0, MAX_TRACKS_PER_ARTIST)); 
    } catch (e) {
      console.warn(`No se pudieron obtener canciones para el artista ${artistId}`);
    }
  }

  const uniqueTracks = Array.from(new Set(tracks.map(t => t.id)))
                            .map(id => tracks.find(t => t.id === id));

  return uniqueTracks.slice(0, 50); 
}

// ------------------------------------------------------------------
// 4. FUNCIONES DE EXPORTACIÓN
// ------------------------------------------------------------------

export const createPlaylist = (userId, name, description) => {
  return spotifyFetch(`/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({
      name: name,
      description: description,
      public: false // La creamos como privada por defecto
    }),
  });
};

export const addTracksToPlaylist = (playlistId, trackUris) => {
  return spotifyFetch(`/playlists/${playlistId}/tracks`, {
    method: 'POST',
    body: JSON.stringify({
      uris: trackUris
    }),
  });
};

export async function exportPlaylist(user, tracks) {
    if (tracks.length === 0) {
        throw new Error("La lista de canciones está vacía.");
    }

    const trackUris = tracks.map(track => track.uri);
    
    const playlistName = `Mi Taste Mixer (${new Date().toLocaleDateString()})`;
    const playlistDescription = `Playlist generada automáticamente por Taste Mixer con ${tracks.length} canciones.`;
    
    const newPlaylist = await createPlaylist(user.id, playlistName, playlistDescription);

    await addTracksToPlaylist(newPlaylist.id, trackUris);

    return newPlaylist.external_urls.spotify;
}