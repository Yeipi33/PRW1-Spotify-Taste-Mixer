// src/components/widgets/GenreWidget.jsx
'use client';

import { useState, useEffect } from 'react';
import { spotifyRequest } from '../../lib/auth';
import Spinner from '../Spinner';

const MAX_GENRES = 5;

export default function GenreWidget({ onSelect, selectedItems }) {
    const [availableGenres, setAvailableGenres] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar los géneros disponibles al montar el componente
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                // Endpoint para obtener los géneros disponibles para las semillas de recomendación
                const data = await spotifyRequest('/recommendations/available-genre-seeds');
                setAvailableGenres(data?.genres || []);
            } catch (err) {
                console.error('Error fetching genres:', err);
                setError('No se pudieron cargar los géneros. Intenta recargar la página.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchGenres();
    }, []);

    const toggleGenre = (genre) => {
        const isSelected = selectedItems.includes(genre);

        if (isSelected) {
            // Deseleccionar
            onSelect(selectedItems.filter(g => g !== genre));
        } else if (selectedItems.length < MAX_GENRES) {
            // Seleccionar, si no se excede el límite
            onSelect([...selectedItems, genre]);
        }
    };

    if (isLoading) {
        return <Spinner text="Cargando géneros de Spotify..." />;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div>
            <p className="text-sm text-gray-400 mb-3">
                Selecciona hasta {MAX_GENRES} géneros para usar como semillas de la playlist.
                <br/>
                Seleccionados: **{selectedItems.length}** / {MAX_GENRES}
            </p>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1 pr-3">
                {availableGenres.map(genre => {
                    const isSelected = selectedItems.includes(genre);
                    const isDisabled = !isSelected && selectedItems.length >= MAX_GENRES;

                    return (
                        <button
                            key={genre}
                            onClick={() => toggleGenre(genre)}
                            disabled={isDisabled}
                            className={`py-1 px-3 rounded-full text-sm font-medium transition-colors border capitalize
                                ${isSelected
                                    ? 'bg-green-600 text-white border-green-400'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'}
                                ${isDisabled && 'opacity-50 cursor-not-allowed'}`}
                        >
                            {genre.replace(/-/g, ' ')} {/* Formatear guiones por espacios */}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}