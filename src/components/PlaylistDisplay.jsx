// src/components/PlaylistDisplay.jsx

'use client';
import TrackCard from './TrackCard';
import { FaSpotify } from 'react-icons/fa';

/**
 * Componente que muestra la playlist generada y los controles de exportación.
 * @param {object} props Propiedades de la playlist y sus acciones.
 */
export default function PlaylistDisplay({
  user,
  playlist,
  error,
  exportUrl,
  isExporting,
  handleRemoveTrack,
  handleExportPlaylist,
}) {

  if (error) {
    return <p className="text-red-500 bg-red-900/20 p-3 rounded">{error}</p>;
  }

  if (playlist.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg min-h-96 flex flex-col items-center justify-center">
        <p className="text-gray-400">Selecciona tus preferencias y haz clic en "Generar Playlist".</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      
      {/* Controles de Exportación */}
      <div className="flex justify-between items-center mb-4">
          <p className="text-green-400 font-bold">Lista Lista: {playlist.length} canciones</p>
          
          {exportUrl ? (
              <a 
                  href={exportUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-full font-bold transition duration-300"
              >
                  <FaSpotify />
                  <span>Ver en Spotify</span>
              </a>
          ) : (
              <button
                  onClick={handleExportPlaylist}
                  disabled={isExporting}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-full font-bold transition duration-300 ${
                      isExporting ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                  }`}
              >
                  <FaSpotify />
                  <span>{isExporting ? 'Exportando...' : 'Exportar a Spotify'}</span>
              </button>
          )}
      </div>
      
      {/* Lista de Pistas */}
      <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {playlist.map((track, index) => (
          <TrackCard 
            key={track.id} 
            track={track} 
            index={index} 
            onRemove={handleRemoveTrack} 
          />
        ))}
      </ul>
    </div>
  );
}