// src/components/widgets/TrackWidget.jsx
'use client';

import { useState, useEffect } from 'react';
import { spotifyRequest } from '../../lib/auth';
import { useDebounce } from '../../lib/hooks/useDebounce';
import Spinner from '../Spinner';

const MAX_TRACKS = 5;

export default function TrackWidget({ onSelect, selectedItems }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Comienza a escribir para buscar canciones.');

    // Aplicar debounce al término de búsqueda
    const debouncedSearchTerm = useDebounce(searchTerm, 500); 

    // Efecto para buscar canciones
    useEffect(() => {
        const fetchTracks = async () => {
            if (!debouncedSearchTerm.trim()) {
                setSearchResults([]);
                setStatus('Comienza a escribir para buscar canciones.');
                return;
            }

            setIsLoading(true);
            setStatus('Buscando...');
            
            try {
                // Endpoint de búsqueda de Spotify (type=track)
                const data = await spotifyRequest(`/search?q=${encodeURIComponent(debouncedSearchTerm)}&type=track&limit=8`);
                
                const tracks = data?.tracks?.items || [];
                setSearchResults(tracks);

                if (tracks.length === 0) {
                    setStatus(`No se encontraron canciones para "${debouncedSearchTerm}".`);
                } else {
                    setStatus(`Mostrando ${tracks.length} resultados.`);
                }

            } catch (error) {
                console.error('Error al buscar canciones:', error);
                setStatus('Error al buscar. Por favor, inténtalo de nuevo.');
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTracks();
    }, [debouncedSearchTerm]);

    const toggleTrack = (track) => {
        const isSelected = selectedItems.includes(track.id);

        if (isSelected) {
            onSelect(selectedItems.filter(id => id !== track.id));
        } else if (selectedItems.length < MAX_TRACKS) {
            onSelect([...selectedItems, track.id]);
        }
    };
    
    return (
        <div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar canción, título, artista..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 outline-none"
                />
            </div>

            <p className="text-sm text-gray-400 mb-3">
                Semillas de Canción Seleccionadas: {selectedItems.length} / {MAX_TRACKS}
            </p>

            <div className="max-h-80 overflow-y-auto pr-2">
                {isLoading ? (
                    <Spinner text="Buscando canciones..." />
                ) : (
                    <div>
                        {searchResults.length > 0 ? (
                            searchResults.map(track => {
                                const isSelected = selectedItems.includes(track.id);
                                const isDisabled = !isSelected && selectedItems.length >= MAX_TRACKS;
                                
                                const imageUrl = track.album.images.find(img => img.width > 64)?.url || '/placeholder-track.png';
                                
                                return (
                                    <TrackResultItem 
                                        key={track.id}
                                        track={track}
                                        imageUrl={imageUrl}
                                        isSelected={isSelected}
                                        isDisabled={isDisabled}
                                        onClick={() => toggleTrack(track)}
                                    />
                                );
                            })
                        ) : (
                            <p className="text-gray-500">{status}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Componente para renderizar cada canción en la lista de resultados
const TrackResultItem = ({ track, imageUrl, isSelected, isDisabled, onClick }) => (
    <div 
        onClick={onClick}
        className={`flex items-center p-2 mb-2 rounded-lg cursor-pointer transition-colors 
                    ${isSelected ? 'bg-green-700 border border-green-500' : 'bg-gray-700 hover:bg-gray-600'}
                    ${isDisabled && 'opacity-50 cursor-not-allowed'}`}
    >
        <img 
            src={imageUrl} 
            alt={track.name} 
            className="w-12 h-12 object-cover mr-4" 
        />
        <div className="flex-grow min-w-0">
            <p className="font-semibold text-white truncate">{track.name}</p>
            <p className="text-sm text-gray-400 truncate">{track.artists.map(a => a.name).join(', ')}</p>
        </div>
        <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 
                        ${isSelected ? 'bg-green-400 border-white' : 'border-gray-400'}`}>
        </div>
    </div>
);