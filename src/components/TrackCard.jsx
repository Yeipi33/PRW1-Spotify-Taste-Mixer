// src/components/TrackCard.jsx

'use client';
import { useState } from 'react';
// Importamos los iconos necesarios para los botones
import { FaHeart, FaRegHeart, FaTimes, FaPlay, FaPause } from 'react-icons/fa'; 

/**
 * Componente para mostrar una pista individual de la playlist.
 * @param {object} track Objeto de la pista de Spotify.
 * @param {number} index El índice de la pista en la lista.
 * @param {function} onRemove Función para eliminar la pista.
 * @param {string|null} currentPlayingTrackId ID de la pista reproduciéndose globalmente.
 * @param {function} onTogglePlay Función para iniciar/detener la reproducción.
 */
export default function TrackCard({ track, index, onRemove, currentPlayingTrackId, onTogglePlay }) {
  // Estado local para la funcionalidad 'favorita'
  const [isFavorite, setIsFavorite] = useState(false);

  // Determinar el estado de reproducción global
  const isCurrentlyPlaying = currentPlayingTrackId === track.id;

  const togglePlayback = () => {
    // track.preview_url es el link de 30s que viene de la API de Spotify
    if (track.preview_url) {
      onTogglePlay(track.id, track.preview_url);
    }
  };

  const handleToggleFavorite = () => {
    // Lógica simple de toggle (no se persiste en este proyecto)
    setIsFavorite(prev => !prev);
  };
  
  const handleRemove = () => onRemove(track.id);

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-700 hover:bg-gray-700 transition duration-150 rounded-lg">
      
      {/* Información de la Pista */}
      <div className="flex items-center min-w-0 pr-4">
        
        {/* Botón Play/Pause (solo si hay URL de vista previa) */}
        {track.preview_url ? (
            <button
                onClick={togglePlayback}
                title={isCurrentlyPlaying ? 'Pausar' : 'Reproducir 30s'}
                className={`p-1 mr-3 rounded-full transition duration-150 ${isCurrentlyPlaying ? 'text-green-400' : 'text-gray-500 hover:text-green-300'}`}
            >
                {isCurrentlyPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
            </button>
        ) : (
             <span className="p-1 mr-3 rounded-full text-gray-700">
                <FaPlay size={16} />
            </span>
        )}
        
        <span className="text-gray-400 font-mono mr-3 w-4 text-center flex-shrink-0">{index + 1}.</span>
        
        {/* Portada del Álbum */}
        <img 
            src={track.album.images[2]?.url || '/placeholder.png'} 
            alt={track.name} 
            className="w-10 h-10 mr-3 object-cover rounded flex-shrink-0"
        />

        <div className="min-w-0">
          <p className="text-white font-semibold truncate" title={track.name}>{track.name}</p>
          <p className="text-sm text-gray-400 truncate">
            {track.artists.map(a => a.name).join(', ')}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex space-x-3 items-center flex-shrink-0">
        
        {/* Botón Favorito */}
        <button
          onClick={handleToggleFavorite}
          className={`p-1 transition duration-150 ${isFavorite ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'}`}
          title={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
        >
          {isFavorite ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
        </button>

        {/* Botón Eliminar */}
        <button
          onClick={handleRemove}
          className="p-1 text-gray-500 hover:text-red-500 transition duration-150"
          title="Eliminar de la lista generada"
        >
          <FaTimes size={18} />
        </button>
      </div>
    </div>
  );
}