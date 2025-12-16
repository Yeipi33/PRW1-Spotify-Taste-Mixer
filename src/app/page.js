// src/app/page.js
'use client'; // Debe ser un Client Component para manejar la interacción de login

import { getAuthorizationUrl, generateRandomString } from '../lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirige al dashboard si ya hay un token (simple comprobación)
        if (localStorage.getItem('spotify_token')) {
            router.replace('/dashboard');
        }
    }, [router]);

    const handleLogin = () => {
        // 1. Generar y guardar el state para la validación CSRF
        const state = generateRandomString(16);
        sessionStorage.setItem('spotify_auth_state', state);

        // 2. Generar la URL de autorización
        const authUrl = getAuthorizationUrl();
        
        // 3. Redirigir al usuario a la página de login de Spotify
        window.location.href = authUrl;
    };

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Spotify Taste Mixer</h1>
            <p>Genera listas de reproducción personalizadas de Spotify.</p>
            <button 
                onClick={handleLogin}
                style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
            >
                Iniciar Sesión con Spotify
            </button>
        </div>
    );
}