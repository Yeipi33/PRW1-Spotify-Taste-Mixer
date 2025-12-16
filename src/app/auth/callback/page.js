// src/app/auth/callback/page.js
'use client'; // Necesario para usar hooks, sessionStorage, y localStorage

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { handleAuthCallback } from '../../../lib/auth'; // Importamos la función de intercambio de tokens

export default function CallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('Procesando autenticación...');
    const [errorOccurred, setErrorOccurred] = useState(false);

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');

            if (error) {
                setStatus(`Error de Spotify: ${error}. Redirigiendo a login...`);
                setErrorOccurred(true);
                return;
            }

            if (!code) {
                setStatus('No se recibió el código de autorización. Redirigiendo a login...');
                setErrorOccurred(true);
                return;
            }

            // 1. Validación CSRF Obligatoria
            const savedState = sessionStorage.getItem('spotify_auth_state');
            sessionStorage.removeItem('spotify_auth_state'); // Limpiar inmediatamente
            
            //
            if (!state || state !== savedState) {
                console.error("Fallo de validación CSRF");
                setStatus("Error de seguridad (CSRF). Redirigiendo a login...");
                setErrorOccurred(true);
                return;
            }
            
            // 2. Intercambiar código por tokens
            setStatus('Intercambiando código por tokens...');
            try {
                // handleAuthCallback realiza la petición POST y guarda los tokens en localStorage.
                await handleAuthCallback(code);
                
                setStatus('Autenticación exitosa. Redirigiendo al Dashboard...');
                // Redirección programática después del login exitoso
                router.replace('/dashboard'); 

            } catch (err) {
                console.error('Error al intercambiar token:', err);
                setStatus('Error de autenticación. Inténtalo de nuevo.');
                setErrorOccurred(true);
            }
        };

        processCallback();
    }, [searchParams, router]);

    // Redirigir si ocurre un error después de un breve retraso
    useEffect(() => {
        if (errorOccurred) {
            const timer = setTimeout(() => router.replace('/'), 3000);
            return () => clearTimeout(timer);
        }
    }, [errorOccurred, router]);


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold mb-4 text-white">Autenticación de Spotify</h2>
                <p className="text-gray-400">{status}</p>
            </div>
        </div>
    );
}