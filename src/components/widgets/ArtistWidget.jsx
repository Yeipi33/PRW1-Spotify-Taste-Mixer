// src/components/widgets/ArtistWidget.jsx
'use client';

import { useState, useEffect } from 'react';
import { spotifyRequest } from '../../lib/auth';
import { useDebounce } from '../../lib/hooks/useDebounce';
import Spinner from '../Spinner';

const MAX_ARTISTS = 5;

export default function ArtistWidget({ onSelect, selectedItems }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Comienza a escribir para buscar artistas.');
    
    // Aplicar debounce al término de búsqueda
    const debouncedSearchTerm = useDebounce(searchTerm, 500); 

    // Efecto para buscar artistas
    useEffect(() => {
        const fetchArtists = async () => {
            if (!debouncedSearchTerm.trim()) {
                setSearchResults([]);
                setStatus('Comienza a escribir para buscar artistas.');
                return;
            }

            setIsLoading(true);
            setStatus('Buscando...');
            
            try {
                // Endpoint de búsqueda de Spotify (type=artist)
                const data = await spotifyRequest(`/search?q=${encodeURIComponent(debouncedSearchTerm)}&type=artist&limit=8`);
                
                const artists = data?.artists?.items || [];
                setSearchResults(artists);

                if (artists.length === 0) {
                    setStatus(`No se encontraron resultados para "${debouncedSearchTerm}".`);
                } else {
                    setStatus(`Mostrando ${artists.length} resultados.`);
                }

            } catch (error) {
                console.error('Error al buscar artistas:', error);
                setStatus('Error al buscar. Por favor, inténtalo de nuevo.');
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtists();
    }, [debouncedSearchTerm]);

    const toggleArtist = (artist) => {
        const isSelected = selectedItems.includes(artist.id);

        if (isSelected) {
            onSelect(selectedItems.filter(id => id !== artist.id));
        } else if (selectedItems.length < MAX_ARTISTS) {
            onSelect([...selectedItems, artist.id]);
        }
    };
    
    return (
        <div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar artista por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 outline-none"
                />
            </div>

            <p className="text-sm text-gray-400 mb-3">
                Semillas de Artista Seleccionadas: {selectedItems.length} / {MAX_ARTISTS}
            </p>

            <div className="max-h-80 overflow-y-auto pr-2">
                {isLoading ? (
                    <Spinner text="Buscando artistas..." />
                ) : (
                    <div>
                        {searchResults.length > 0 ? (
                            searchResults.map(artist => {
                                const isSelected = selectedItems.includes(artist.id);
                                const isDisabled = !isSelected && selectedItems.length >= MAX_ARTISTS;
                                
                                const imageUrl = artist.images.find(img => img.width > 64)?.url || '/placeholder-artist.png';
                                
                                return (
                                    <ArtistResultItem 
                                        key={artist.id}
                                        artist={artist}
                                        imageUrl={imageUrl}
                                        isSelected={isSelected}
                                        isDisabled={isDisabled}
                                        onClick={() => toggleArtist(artist)}
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

// Componente para renderizar cada artista en la lista de resultados
const ArtistResultItem = ({ artist, imageUrl, isSelected, isDisabled, onClick }) => (
    <div 
        onClick={onClick}
        className={`flex items-center p-2 mb-2 rounded-lg cursor-pointer transition-colors 
                    ${isSelected ? 'bg-green-700 border border-green-500' : 'bg-gray-700 hover:bg-gray-600'}
                    ${isDisabled && 'opacity-50 cursor-not-allowed'}`}
    >
        <img 
            src={imageUrl} 
            alt={artist.name} 
            className="w-12 h-12 rounded-full object-cover mr-4" 
        />
        <div className="flex-grow">
            <p className="font-semibold text-white">{artist.name}</p>
            <p className="text-sm text-gray-400">
                {artist.genres.slice(0, 2).join(', ') || 'Artista sin género'}
            </p>
        </div>
        <div className={`w-4 h-4 rounded-full border-2 
                        ${isSelected ? 'bg-green-400 border-white' : 'border-gray-400'}`}>
        </div>
    </div>
);