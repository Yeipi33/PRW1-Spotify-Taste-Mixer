// src/app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Importaciones de Componentes
import Header from '../../components/Header';
import GenreWidget from '../../components/widgets/GenreWidget';
import ArtistWidget from '../../components/widgets/ArtistWidget';
import TrackWidget from '../../components/widgets/TrackWidget';
import PopularityWidget from '../../components/widgets/PopularityWidget';
import MoodWidget from '../../components/widgets/MoodWidget';
import DecadeWidget from '../../components/widgets/DecadeWidget';
import PlaylistDisplay from '../../components/PlaylistDisplay'; 
import { spotifyRequest } from '../lib/auth';


// --- Hook usePlaylistSeeds ---
const initialSeeds = {
    // Semillas base (ID/Nombre)
    seed_artists: [], 
    seed_tracks: [], 
    seed_genres: [], 
    
    // Parámetros de audio (rango 0.0 a 1.0)
    target_energy: 0.5, 
    target_valence: 0.5,
    
    // Parámetros de popularidad (rango 0 a 100)
    min_popularity: 30, 
    max_popularity: 70,
    
    // Parámetros de tiempo (años)
    min_year: 1980, 
    max_year: new Date().getFullYear(),
};

/**
 * Hook personalizado para manejar el estado de las semillas y la generación de la playlist.
 * @param {Function} setPlaylistTracks - Función para actualizar el estado de las pistas generadas.
 */
const usePlaylistSeeds = (setPlaylistTracks) => {
    const [seeds, setSeeds] = useState(initialSeeds);
    const [isGenerating, setIsGenerating] = useState(false);

    // Funciones de actualización de estado
    const updateSeeds = (type, value) => setSeeds(prevSeeds => ({ ...prevSeeds, [type]: value }));
    const updateAudioParams = (params) => setSeeds(prevSeeds => ({ ...prevSeeds, ...params }));
    const updatePopularity = ([min, max]) => setSeeds(prevSeeds => ({ ...prevSeeds, min_popularity: min, max_popularity: max }));
    const updateDecades = ({ min_year, max_year }) => setSeeds(prevSeeds => ({ ...prevSeeds, min_year: min_year, max_year: max_year }));

    /**
     * Llama a la API de Spotify para generar recomendaciones.
     * @param {number} limit - El número de canciones a solicitar.
     * @param {boolean} append - Si se deben añadir los nuevos resultados a los existentes.
     */
    const generatePlaylist = async (limit = 20, append = false) => {
        const seedCount = seeds.seed_artists.length + seeds.seed_tracks.length + seeds.seed_genres.length;
        if (seedCount === 0) {
            alert('¡Debes seleccionar al menos un artista, canción o género (semillas)!');
            return;
        }
        
        setIsGenerating(true);

        const queryParams = new URLSearchParams();
        
        // 1. Lógica de Seeds (Spotify acepta máximo 5 combinadas)
        const artistIds = seeds.seed_artists.slice(0, 5);
        const trackIds = seeds.seed_tracks.slice(0, 5 - artistIds.length);
        const genreIds = seeds.seed_genres.slice(0, 5 - artistIds.length - trackIds.length);

        if (artistIds.length > 0) queryParams.append('seed_artists', artistIds.join(','));
        if (trackIds.length > 0) queryParams.append('seed_tracks', trackIds.join(','));
        if (genreIds.length > 0) queryParams.append('seed_genres', genreIds.join(','));

        // 2. Lógica de Parámetros de Audio, Popularidad y Tiempo
        queryParams.append('target_energy', seeds.target_energy.toFixed(2));
        queryParams.append('target_valence', seeds.target_valence.toFixed(2));
        queryParams.append('min_popularity', seeds.min_popularity);
        queryParams.append('max_popularity', seeds.max_popularity);
        queryParams.append('min_year', seeds.min_year);
        queryParams.append('max_year', seeds.max_year);
        
        queryParams.append('limit', limit); 

        try {
            const recommendations = await spotifyRequest(`/recommendations?${queryParams.toString()}`);
            
            if (recommendations && recommendations.tracks) {
                if (append) {
                    // Añadir los nuevos tracks a los existentes (Funcionalidad 'Añadir Más')
                    setPlaylistTracks(prev => [...prev, ...recommendations.tracks]);
                } else {
                    // Reemplazar los tracks existentes (Funcionalidad 'Regenerar')
                    setPlaylistTracks(recommendations.tracks);
                }
            } else {
                if (!append) setPlaylistTracks([]);
            }
        } catch (error) {
            console.error('Fallo al obtener recomendaciones:', error);
            alert('Error al generar la playlist. Revisa el estado de tu token.');
        } finally {
            setIsGenerating(false);
        }
    };

    return { 
        seeds, 
        updateSeeds, 
        updateAudioParams, 
        updatePopularity, 
        updateDecades,
        generatePlaylist,
        isGenerating
    };
};

// --- Componente DashboardPage ---

export default function DashboardPage() {
    const router = useRouter();
    const [playlistTracks, setPlaylistTracks] = useState([]); 
    
    const { 
        seeds, 
        updateSeeds, 
        updateAudioParams, 
        updatePopularity, 
        updateDecades,
        generatePlaylist,
        isGenerating
    } = usePlaylistSeeds(setPlaylistTracks);

    // Redirección si el token no existe (Protección de ruta)
    useEffect(() => {
        if (typeof window !== 'undefined' && !localStorage.getItem('spotify_token')) {
            router.replace('/');
        }
    }, [router]);

    if (typeof window !== 'undefined' && !localStorage.getItem('spotify_token')) {
        return null; 
    }
    
    // Handlers para la gestión de la playlist
    const handleRegenerate = () => generatePlaylist(20, false); // Actualizar lista
    const handleAddMore = () => generatePlaylist(20, true);     // Añadir más canciones
    
    const totalSeeds = seeds.seed_genres.length + seeds.seed_artists.length + seeds.seed_tracks.length;

    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6 text-green-400">Taste Mixer Dashboard</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* COLUMNA DE WIDGETS (2/3 del ancho) */}
                    <section className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2">1. Semillas de Generación</h2>

                        {/* WIDGET 1: GÉNERO */}
                        <WidgetContainer title="1. Géneros (Semilla)">
                            <GenreWidget 
                                onSelect={(selectedGenres) => updateSeeds('seed_genres', selectedGenres)}
                                selectedItems={seeds.seed_genres}
                            />
                        </WidgetContainer>
                        
                        {/* WIDGET 2: ARTISTA */}
                        <WidgetContainer title="2. Artista (Semilla)">
                             <ArtistWidget 
                                onSelect={(selectedArtists) => updateSeeds('seed_artists', selectedArtists)}
                                selectedItems={seeds.seed_artists}
                            /> 
                        </WidgetContainer>
                        
                        {/* WIDGET 3: CANCIÓN/SEGUIMIENTO */}
                        <WidgetContainer title="3. Canción/Seguimiento (Semilla)">
                             <TrackWidget 
                                onSelect={(selectedTracks) => updateSeeds('seed_tracks', selectedTracks)}
                                selectedItems={seeds.seed_tracks}
                            /> 
                        </WidgetContainer>

                        <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mt-8">2. Parámetros de Filtrado</h2>
                        
                        {/* WIDGET 4: ESTADO DE ÁNIMO / ENERGÍA */}
                        <WidgetContainer title="4. Estado de Ánimo y Energía">
                            <MoodWidget 
                                onSelect={updateAudioParams}
                                selectedItems={{ target_energy: seeds.target_energy * 100, target_valence: seeds.target_valence * 100 }}
                            /> 
                        </WidgetContainer>
                        
                        {/* WIDGET 5: POPULARIDAD */}
                        <WidgetContainer title="5. Popularidad">
                            <PopularityWidget 
                                onSelect={updatePopularity}
                                selectedItems={[seeds.min_popularity, seeds.max_popularity]} 
                            /> 
                        </WidgetContainer>

                        {/* WIDGET 6: DÉCADAS */}
                        <WidgetContainer title="6. Décadas y Rango de Años">
                             <DecadeWidget 
                                onSelect={updateDecades}
                                selectedItems={{ min_year: seeds.min_year, max_year: seeds.max_year }}
                            /> 
                        </WidgetContainer>
                        
                        {/* BOTÓN DE GENERACIÓN */}
                        <button 
                            onClick={handleRegenerate}
                            disabled={isGenerating || totalSeeds === 0}
                            className={`w-full py-3 font-bold rounded-lg transition-colors ${
                                isGenerating || totalSeeds === 0 
                                    ? 'bg-gray-500 cursor-not-allowed' 
                                    : 'bg-green-500 hover:bg-green-600'
                            }`}
                        >
                            {isGenerating ? 'Generando Playlist...' : `🎧 Generar Playlist con ${totalSeeds} Semilla(s)`}
                        </button>

                    </section>

                    {/* COLUMNA DE PLAYLIST (1/3 del ancho) */}
                    <section className="lg:col-span-1 bg-gray-800 p-4 rounded-xl shadow-2xl sticky top-20 h-fit">
                        <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Lista de Reproducción Generada</h2>
                        
                        {isGenerating && playlistTracks.length === 0 ? (
                             <p className="text-green-400 mt-4">Cargando recomendaciones...</p>
                        ) : playlistTracks.length > 0 ? (
                            <PlaylistDisplay 
                                initialTracks={playlistTracks} 
                                onRegenerate={handleRegenerate} 
                                onAddMore={handleAddMore}     
                            />
                        ) : (
                            <p className="text-gray-400">Presiona "Generar Playlist" para ver los resultados.</p>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}

// Componente Wrapper para dar estilo uniforme a los widgets
const WidgetContainer = ({ title, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold mb-4 text-green-300">{title}</h3>
        {children}
    </div>
);