// src/app/page.js
'use client'; // Debe ser un Client Component para manejar interacciones de usuario y sessionStorage

import { getAuthorizationUrl, generateRandomString } from '../lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Redirige al dashboard si ya hay un token guardado (sesión activa)
        if (typeof window !== 'undefined' && localStorage.getItem('spotify_token')) {
            router.replace('/dashboard');
        } else {
            setIsLoading(false);
        }
    }, [router]);

    const handleLogin = () => {
        // 1. Generar y guardar el state para la validación CSRF obligatoria
        const state = generateRandomString(16);
        sessionStorage.setItem('spotify_auth_state', state);

        // 2. Generar la URL de autorización y redirigir
        const authUrl = getAuthorizationUrl(state);
        
        // Redirigir al usuario a la página de login de Spotify
        window.location.href = authUrl;
    };

    if (isLoading) {
        // Mostrar un estado de carga mientras se verifica el token
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-xl text-green-400">Verificando sesión...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
            <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl">
                <h1 className="text-4xl font-extrabold mb-4 text-white">
                    🎶 Spotify Taste Mixer
                </h1>
                <p className="text-gray-400 mb-8 max-w-sm">
                    Aplicación web que genera listas de reproducción personalizadas de Spotify.
                </p>
                
                <button 
                    onClick={handleLogin}
                    className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full text-lg transition-colors shadow-lg"
                >
                    Iniciar Sesión con Spotify
                </button>
                <p className="text-xs text-gray-500 mt-4">
                    Requiere permisos para ver tu perfil y crear playlists.
                </p>
            </div>
        </div>
    );
}