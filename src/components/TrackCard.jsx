// src/components/TrackCard.jsx

'use client';
import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaTimes } from 'react-icons/fa'; // Iconos para Favorito y Eliminar

/**
 * Componente para mostrar una pista individual de la playlist.
 * @param {object} track Objeto de la pista de Spotify.
 * @param {number} index El índice de la pista en la lista.
 * @param {function} onRemove Función para eliminar la pista de la playlist.
 */
export default function TrackCard({ track, index, onRemove }) {
  // Estado para gestionar si la pista es favorita, basado en localStorage
  const [isFavorite, setIsFavorite] = useState(false);

  // Clave única para localStorage
  const FAVORITE_KEY = `spotify_mixer_favorite_${track.id}`;

  // 1. Efecto para cargar el estado 'isFavorite' desde localStorage al montar el componente
  useEffect(() => {
    const storedFavorite = localStorage.getItem(FAVORITE_KEY);
    if (storedFavorite === 'true') {
      setIsFavorite(true);
    }
  }, [FAVORITE_KEY]);

  // 2. Función para alternar el estado de favorito y guardarlo en localStorage
  const toggleFavorite = () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    
    if (newState) {
      localStorage.setItem(FAVORITE_KEY, 'true');
      console.log(`Pista ${track.name} marcada como favorita.`);
    } else {
      localStorage.removeItem(FAVORITE_KEY);
      console.log(`Pista ${track.name} eliminada de favoritos.`);
    }
  };

  // 3. Función para manejar la eliminación
  const handleRemove = () => {
    // Llama a la función pasada por el padre (Dashboard)
    onRemove(track.id);
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-700 hover:bg-gray-700 transition duration-150 rounded-lg">
      
      {/* Información de la Pista */}
      <div className="flex items-center min-w-0 pr-4">
        <span className="text-gray-400 font-mono mr-3 w-4 text-center">{index + 1}.</span>
        
        {/* Imagen del álbum (opcional) */}
        {/*
        <img 
          src={track.album.images[0]?.url || '/placeholder-album.png'} 
          alt={track.album.name} 
          className="w-10 h-10 object-cover rounded mr-3"
        />
        */}

        <div className="min-w-0">
          <p className="text-white font-semibold truncate" title={track.name}>{track.name}</p>
          <p className="text-sm text-gray-400 truncate">
            {track.artists.map(a => a.name).join(', ')}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex space-x-3 items-center">
        
        {/* Botón Favorito */}
        <button
          onClick={toggleFavorite}
          title={isFavorite ? 'Eliminar de Favoritos' : 'Marcar como Favorita'}
          className={`p-1 rounded-full transition duration-150 ${isFavorite ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
        >
          {isFavorite ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
        </button>
        
        {/* Botón Eliminar */}
        <button
          onClick={handleRemove}
          title="Eliminar de la Lista"
          className="text-gray-500 hover:text-red-500 transition duration-150 p-1 rounded-full"
        >
          <FaTimes size={16} />
        </button>
      </div>
    </div>
  );
}