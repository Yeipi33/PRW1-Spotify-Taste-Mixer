// src/components/widgets/ArtistWidget.jsx

'use client';
import { useState, useEffect, useCallback } from 'react';
import * as SpotifyAPI from '@/lib/spotify';

const MAX_ARTISTS = 5; // Límite de selección

/**
 * Widget para buscar y seleccionar artistas (Máx 5).
 * Envía los IDs de los artistas seleccionados como 'seed_artists'.
 * @param {function} onUpdatePreferences Función para notificar al componente padre.
 */
export default function ArtistWidget({ onUpdatePreferences }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Notificar al Dashboard cuando cambian los artistas seleccionados
  useEffect(() => {
    // Parámetro enviado: Lista de IDs de artistas
    const artistIds = selectedArtists.map(artist => artist.id);
    onUpdatePreferences({ seed_artists: artistIds });
  }, [selectedArtists, onUpdatePreferences]);


  // 2. Función de búsqueda (Endpoint: /search?type=artist)
  const fetchArtists = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchSpotify(query, 'artist');
      setSearchResults(data.artists.items);
    } catch (e) {
      console.error("Error buscando artistas:", e);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Efecto para activar la búsqueda (Simulación de Debouncing)
  useEffect(() => {
    // Esperar 500ms después de escribir
    const handler = setTimeout(() => {
      fetchArtists(searchTerm);
    }, 500); 
    return () => clearTimeout(handler);
  }, [searchTerm, fetchArtists]);


  // 4. Función para añadir/eliminar artistas
  const toggleArtist = (artist) => {
    setSelectedArtists(prev => {
      if (prev.some(a => a.id === artist.id)) {
        // Eliminar si ya está seleccionado
        return prev.filter(a => a.id !== artist.id);
      } else if (prev.length < MAX_ARTISTS) { // Límite de 5 artistas
        // Añadir si hay espacio
        return [...prev, artist];
      }
      return prev;
    });
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-green-400">Artistas Semilla (Máx {MAX_ARTISTS})</h3>
      
      {/* Artistas Seleccionados */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedArtists.map(artist => (
          <span
            key={artist.id}
            className="px-3 py-1 text-xs rounded-full bg-green-700 text-white flex items-center cursor-pointer"
            onClick={() => toggleArtist(artist)}
          >
            {artist.name} &times;
          </span>
        ))}
      </div>

      {/* Input de Búsqueda */}
      <input
        type="text"
        placeholder="Buscar artista..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {/* Resultados de Búsqueda */}
      {loading && <p className="text-sm text-gray-500 mt-2">Buscando...</p>}
      {!loading && searchTerm.length >= 2 && searchResults.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">No se encontraron resultados.</p>
      )}
      
      <div className="mt-2 max-h-40 overflow-y-auto">
        {searchResults.map(artist => (
          <div
            key={artist.id}
            onClick={() => toggleArtist(artist)}
            className={`flex items-center p-2 hover:bg-gray-700 cursor-pointer rounded-lg text-sm transition ${
                selectedArtists.some(a => a.id === artist.id) ? 'bg-gray-600' : ''
            }`}
          >
            <img 
                src={artist.images[2]?.url || '/placeholder.png'} 
                alt={artist.name} 
                className="w-8 h-8 rounded-full mr-3 object-cover" 
            />
            {artist.name}
          </div>
        ))}
      </div>
    </div>
  );
}