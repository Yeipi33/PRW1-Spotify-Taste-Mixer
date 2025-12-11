// src/app/dashboard/page.js

'use client'; 
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// Funciones de la API y exportación
import { getUserProfile, generatePlaylist, exportPlaylist } from '@/lib/spotify.js'; 
import { logout } from '@/lib/auth';
// Componentes de la interfaz
import GenreWidget from '@/components/widgets/GenreWidget.jsx'; 
import PopularityWidget from '@/components/widgets/PopularityWidget.jsx'; 
import ArtistWidget from '@/components/widgets/ArtistWidget.jsx'; 
import DecadeWidget from '@/components/widgets/DecadeWidget.jsx'; 
import MoodWidget from '@/components/widgets/MoodWidget.jsx'; 
// Componentes Refactorizados
import Header from '@/components/Header.jsx';
import PlaylistDisplay from '@/components/PlaylistDisplay.jsx'; 

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState({}); 
  const [playlist, setPlaylist] = useState([]); 
  const [isGenerating, setIsGenerating] = useState(false); 
  const [isExporting, setIsExporting] = useState(false); 
  const [exportUrl, setExportUrl] = useState(null); 
  const router = useRouter();

  // 1. Centralización de Preferencias (usada por todos los widgets)
  const handleUpdatePreferences = useCallback((newPreference) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreference 
    }));
  }, []);

  // 2. Lógica para eliminar una pista del estado local de la playlist
  const handleRemoveTrack = useCallback((trackId) => {
    setPlaylist(prevPlaylist => {
      setExportUrl(null); 
      return prevPlaylist.filter(track => track.id !== trackId);
    });
  }, []);

  // 3. Generar la playlist (resetea la lista)
  const handleGeneratePlaylist = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setPlaylist([]);
    setExportUrl(null);
    
    try {
      const newPlaylist = await generatePlaylist(preferences);
      setPlaylist(newPlaylist);
      setError(null);
    } catch (err) {
      setError('No se pudo generar la playlist. Revisa tu conexión y preferencias.');
      setPlaylist([]);
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Añadir más canciones (función obligatoria)
  const handleAddMoreTracks = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setExportUrl(null);

    try {
        const newTracks = await generatePlaylist(preferences);
        
        setPlaylist(prevPlaylist => {
            const existingIds = new Set(prevPlaylist.map(t => t.id));
            const uniqueNewTracks = newTracks.filter(t => !existingIds.has(t.id));
            return [...prevPlaylist, ...uniqueNewTracks];
        });
        
        setError(null);
    } catch (err) {
        console.error('Fallo al añadir más pistas:', err);
        setError('No se pudo añadir más pistas.');
    } finally {
        setIsGenerating(false);
    }
  };


  // 5. Exportar la playlist a Spotify
  const handleExportPlaylist = async () => {
    if (isExporting || playlist.length === 0) return;

    setIsExporting(true);
    setError(null);

    try {
        const url = await exportPlaylist(user, playlist);
        setExportUrl(url); 
        alert('✅ Playlist creada en Spotify con éxito!');
    } catch (err) {
        console.error('Error al exportar playlist:', err);
        setError('Fallo al exportar. Asegúrate de tener el scope necesario (playlist-modify-private).');
    } finally {
        setIsExporting(false);
    }
  };


  // 6. Efecto para verificar la autenticación y cargar el perfil de usuario
  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getUserProfile();
        setUser(profile);
        setError(null);
      } catch (err) {
        setError('Error al cargar el perfil. Puede que se necesite reautenticación.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Cargando Dashboard...</div>;
  }

  // 7. Renderizado
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      
      {/* ⬅️ USO DEL COMPONENTE HEADER */}
      <Header user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        
        {/* === COLUMNA 1: WIDGETS Y CONTROLES === */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Afinadores Musicales</h2>
          
          <GenreWidget onUpdatePreferences={handleUpdatePreferences} />
          <PopularityWidget onUpdatePreferences={handleUpdatePreferences} /> 
          <ArtistWidget onUpdatePreferences={handleUpdatePreferences} />
          <DecadeWidget onUpdatePreferences={handleUpdatePreferences} />
          <MoodWidget onUpdatePreferences={handleUpdatePreferences} />
          
          {/* Botón de Generación Inicial */}
          <button 
            onClick={handleGeneratePlaylist} 
            disabled={isGenerating}
            className={`w-full py-3 px-4 rounded-lg font-bold transition duration-300 ${
              isGenerating ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isGenerating ? 'Generando Playlist...' : 'Generar Playlist'}
          </button>

          {/* Botón Añadir Más Canciones */}
          {playlist.length > 0 && (
            <button 
                onClick={handleAddMoreTracks} 
                disabled={isGenerating}
                className={`w-full py-3 px-4 rounded-lg font-bold transition duration-300 border border-gray-500 ${
                isGenerating ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'
                }`}
            >
                {isGenerating ? 'Añadiendo...' : 'Añadir Más Canciones'}
            </button>
          )}
          
          <p className="text-xs text-gray-500 pt-2 break-words">Preferencias: {JSON.stringify(preferences)}</p>
        </div>

        {/* === COLUMNA 2: VISUALIZACIÓN DE PLAYLIST === */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Tu Playlist Generada</h2>
          
          {/* ⬅️ USO DEL COMPONENTE PLAYLISTDISPLAY */}
          <PlaylistDisplay
              user={user}
              playlist={playlist}
              error={error}
              exportUrl={exportUrl}
              isExporting={isExporting}
              handleRemoveTrack={handleRemoveTrack}
              handleExportPlaylist={handleExportPlaylist}
          />
        </div>
      </div>
    </div>
  );
}