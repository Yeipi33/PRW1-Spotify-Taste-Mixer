// src/app/auth/callback/page.js
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('Procesando autenticación...');

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
        if (error) {
            setStatus(`Error de Spotify: ${error}. Redirigiendo a login...`);
            setTimeout(() => router.replace('/'), 3000);
            return;
        }

        if (code) {
            // 1. **Validación CSRF Obligatoria**
            const savedState = sessionStorage.getItem('spotify_auth_state');
            sessionStorage.removeItem('spotify_auth_state'); // Eliminar después de usar

            if (!state || state !== savedState) {
                console.error("Fallo de validación CSRF");
                setStatus("Error de seguridad (CSRF). Redirigiendo a login...");
                setTimeout(() => router.replace('/'), 3000);
                return;
            }

            // 2. Intercambiar código por tokens a través de nuestra API Route
            const exchangeToken = async () => {
                setStatus('Intercambiando código por tokens...');
                try {
                    const response = await fetch('/api/spotify-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code }),
                    });

                    if (!response.ok) {
                        throw new Error('Fallo al intercambiar el token');
                    }

                    const data = await response.json();

                    // 3. Guardar tokens en localStorage
                    localStorage.setItem('spotify_token', data.access_token);
                    localStorage.setItem('spotify_refresh_token', data.refresh_token);
                    // Guardar la expiración como timestamp
                    const expirationTime = Date.now() + (data.expires_in * 1000) - 10000; // 10s antes para seguridad
                    localStorage.setItem('spotify_token_expiration', expirationTime.toString());
                    
                    setStatus('Autenticación exitosa. Redirigiendo al Dashboard...');
                    router.replace('/dashboard');
                } catch (err) {
                    console.error('Error al intercambiar token:', err);
                    setStatus('Error de autenticación. Redirigiendo a login...');
                    setTimeout(() => router.replace('/'), 3000);
                }
            };
            exchangeToken();
        } else {
            // Si no hay código ni error, algo salió mal
            setStatus('Fallo de autenticación. Redirigiendo a login...');
            setTimeout(() => router.replace('/'), 3000);
        }
    }, [searchParams, router]);

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Autenticación de Spotify</h2>
            <p>{status}</p>
        </div>
    );
}