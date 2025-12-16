// src/components/PlaylistDisplay.jsx
'use client';

import TrackCard from './TrackCard';
import { useState, useEffect } from 'react';
import { getCurrentUserProfile, createPlaylist, addTracksToPlaylist } from '../lib/spotify'; 

export default function PlaylistDisplay({ initialTracks, onRegenerate, onAddMore }) {
    // Estado local para manejar la lista de reproducción (permitiendo eliminar pistas)
    const [tracks, setTracks] = useState(initialTracks);
    const [isSaving, setIsSaving] = useState(false); // Estado para el botón de Guardar

    // Actualizar el estado local cuando las pistas generadas cambian desde el Dashboard
    useEffect(() => {
        setTracks(initialTracks);
    }, [initialTracks]);

    /**
     * Elimina una pista específica de la lista generada.
     * Implementa la lógica descrita en la documentación: filtrar por trackId.
     * @param {string} trackId - ID de la canción a eliminar.
     */
    const removeTrack = (trackId) => {
        // Lógica de eliminación de pistas individuales
        const updatedTracks = tracks.filter(track => track.id !== trackId);
        setTracks(updatedTracks);
    };
    
    // Función de callback (opcional)
    const handleFavoriteChange = (newFavorites) => {
        console.log(`Pistas favoritas actualizadas. Total: ${newFavorites.length}`);
    };

    /**
     * Secuencia para guardar la playlist en la cuenta de Spotify del usuario.
     */
    const handleSaveToSpotify = async () => {
        if (tracks.length === 0) {
            alert("No hay canciones para guardar.");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Obtener el ID del usuario
            const user = await getCurrentUserProfile();
            const userId = user.id;

            // 2. Crear una nueva lista de reproducción
            const playlistName = `Taste Mixer - ${new Date().toLocaleDateString()} (${new Date().toLocaleTimeString()})`;
            const newPlaylist = await createPlaylist(userId, playlistName);
            const playlistId = newPlaylist.id;

            // 3. Obtener los URIs de las canciones
            const trackUris = tracks.map(track => track.uri);

            // 4. Añadir las canciones a la nueva playlist
            await addTracksToPlaylist(playlistId, trackUris);
            
            alert(`¡Playlist "${playlistName}" guardada exitosamente en tu Spotify!`);

        } catch (error) {
            console.error("Error al guardar en Spotify:", error);
            alert("Error al guardar la playlist. Asegúrate de que tu token de acceso es válido y que tienes permisos de escritura.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Resultados: {tracks.length} Pistas</h3>
            
            {/* Controles de la lista de reproducción */}
            <div className="flex flex-col gap-2">
                {/* Primera Fila: Regenerar y Añadir Más */}
                <div className="flex gap-3">
                    {/* Botón para actualizar/regenerar la lista */}
                    <button 
                        onClick={onRegenerate}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                        🔄 Actualizar/Regenerar
                    </button>
                    
                    {/* Botón para añadir más canciones */}
                    <button 
                        onClick={onAddMore}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                        ➕ Añadir Más Canciones
                    </button>
                </div>
                
                {/* Segunda Fila: Guardar en Spotify (opcional) */}
                <button 
                    onClick={handleSaveToSpotify}
                    disabled={isSaving || tracks.length === 0}
                    className={`w-full py-2 font-bold rounded-lg transition-colors text-sm ${
                        isSaving || tracks.length === 0
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                    {isSaving ? 'Guardando...' : '💾 Guardar en Spotify'}
                </button>
            </div>

            {/* Listado de Pistas */}
            <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                {tracks.length === 0 ? (
                    <p className="text-gray-400 p-4 bg-gray-700 rounded-lg">Lista vacía. Ajusta tus semillas y genera una nueva lista.</p>
                ) : (
                    tracks.map(track => (
                        <TrackCard 
                            key={track.id} 
                            track={track} 
                            onRemove={removeTrack} // Implementación de eliminar pista individual
                            onFavoriteChange={handleFavoriteChange}
                        />
                    ))
                )}
            </div>
        </div>
    );
}