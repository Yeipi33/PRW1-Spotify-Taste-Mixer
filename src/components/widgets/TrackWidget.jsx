// src/components/widgets/TrackWidget.jsx

'use client';
import { useState, useEffect, useCallback } from 'react';
// Ruta relativa ajustada: subir dos niveles
import { searchSpotify } from '../../lib/spotify'; 

const MAX_TRACKS = 5; 

export default function TrackWidget({ onUpdatePreferences }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trackIds = selectedTracks.map(track => track.id);
    onUpdatePreferences({ seed_tracks: trackIds });
  }, [selectedTracks, onUpdatePreferences]);


  const fetchTracks = useCallback(async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchSpotify(query, 'track');
      setSearchResults(data.tracks.items);
    } catch (e) {
      console.error("Error buscando canciones:", e);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTracks(searchTerm);
    }, 500); 
    return () => clearTimeout(handler);
  }, [searchTerm, fetchTracks]);


  const toggleTrack = (track) => {
    setSelectedTracks(prev => {
      if (prev.some(t => t.id === track.id)) {
        return prev.filter(t => t.id !== track.id);
      } else if (prev.length < MAX_TRACKS) {
        return [...prev, track];
      }
      return prev;
    });
    setSearchTerm(''); 
    setSearchResults([]);
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-green-400">Búsqueda de Seguimiento (Máx {MAX_TRACKS})</h3>
      
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

      <input
        type="text"
        placeholder="Buscar canción o artista..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

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
            <img 
                src={track.album.images[2]?.url || '/placeholder.png'} 
                alt={track.name} 
                className="w-8 h-8 mr-3 object-cover flex-shrink-0" 
            />
            <div className="truncate">
                <p className="font-semibold truncate">{track.name}</p>
                <p className="text-xs text-gray-400 truncate">{track.artists[0].name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}