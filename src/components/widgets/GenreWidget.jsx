// src/components/widgets/TrackWidget.jsx

'use client';
import { useState, useEffect, useCallback } from 'react';


const MAX_TRACKS = 5; // Límite sugerido (similar al de Artistas)

/**
 * Widget para buscar y seleccionar canciones favoritas.
 * Envía los IDs de las canciones seleccionadas como 'seed_tracks'.
 * * Funcionalidades: Búsqueda de canciones, mostrar portada, título, artista,
 * y selección múltiple.
 * * @param {function} onUpdatePreferences Función para notificar al componente padre.
 */
export default function TrackWidget({ onUpdatePreferences }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Notificar al Dashboard cuando cambian las canciones seleccionadas
  useEffect(() => {
    // Parámetro enviado: Lista de IDs de canciones (tracks)
    const trackIds = selectedTracks.map(track => track.id);
    onUpdatePreferences({ seed_tracks: trackIds });
  }, [selectedTracks, onUpdatePreferences]);


  // 2. Función de búsqueda (Endpoint: /search?type=track)
  const fetchTracks = useCallback(async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      // Endpoint: GET /search?type=track&q={query}
      const data = await searchSpotify(query, 'track');
      setSearchResults(data.tracks.items);
    } catch (e) {
      console.error("Error buscando canciones:", e);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Efecto para activar la búsqueda (Búsqueda con rebote/Debouncing)
  useEffect(() => {
    // Esperar 500ms después de escribir para evitar llamadas excesivas a la API
    const handler = setTimeout(() => {
      fetchTracks(searchTerm);
    }, 500); 
    return () => clearTimeout(handler);
  }, [searchTerm, fetchTracks]);


  // 4. Función para añadir/eliminar canciones
  const toggleTrack = (track) => {
    setSelectedTracks(prev => {
      if (prev.some(t => t.id === track.id)) {
        // Eliminar si ya está seleccionada
        return prev.filter(t => t.id !== track.id);
      } else if (prev.length < MAX_TRACKS) {
        // Añadir si hay espacio
        return [...prev, track];
      }
      return prev;
    });
    setSearchTerm(''); // Limpiar la búsqueda al seleccionar
    setSearchResults([]);
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-green-400">Búsqueda de Seguimiento (Máx {MAX_TRACKS})</h3>
      
      {/* Canciones Seleccionadas */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTracks.map(track => (
          <span
            key={track.id}
            className="px-3 py-1 text-xs rounded-full bg-green-700 text-white flex items-center cursor-pointer truncate max-w-full"
            onClick={() => toggleTrack(track)}
            title={`${track.name} - ${track.artists[0].name}`}
          >
            {track.name} &times;
          </span>
        ))}
      </div>

      {/* Input de Búsqueda */}
      <input
        type="text"
        placeholder="Buscar canción o artista..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {/* Resultados */}
      {loading && <p className="text-sm text-gray-500 mt-2">Buscando...</p>}
      {!loading && searchTerm.length >= 3 && searchResults.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">No se encontraron resultados.</p>
      )}
      
      <div className="mt-2 max-h-40 overflow-y-auto">
        {searchResults.map(track => (
          <div
            key={track.id}
            onClick={() => toggleTrack(track)}
            className={`flex items-center p-2 hover:bg-gray-700 cursor-pointer rounded-lg text-sm transition ${
                selectedTracks.some(t => t.id === track.id) ? 'bg-gray-600' : ''
            }`}
          >
            {/* Mostrar portada */}
            <img 
                src={track.album.images[2]?.url || '/placeholder.png'} 
                alt={track.name} 
                className="w-8 h-8 mr-3 object-cover flex-shrink-0" 
            />
            <div className="truncate">
                {/* Mostrar título y artista */}
                <p className="font-semibold truncate">{track.name}</p>
                <p className="text-xs text-gray-400 truncate">{track.artists[0].name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}