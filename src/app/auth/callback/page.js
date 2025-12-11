// src/app/auth/callback/page.js

'use client'; 
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state'); 

    if (code) {
      // 1. Enviar el código a nuestra ruta API del servidor
      fetch('/api/spotify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          return;
        }

        // 2. Guardar los tokens en localStorage (o cookies)
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('expires_in', Date.now() + data.expires_in * 1000);

        // 3. Redirigir al dashboard
        router.push('/dashboard'); 
      })
      .catch(err => {
        console.error("Error en el intercambio:", err);
        setError('Ocurrió un error al procesar la autenticación.');
      })
      .finally(() => setLoading(false));

    } else if (searchParams.get('error')) {
      setError('Autenticación denegada por el usuario.');
      setLoading(false);
    } else {
      setError('No se encontró el código de autorización.');
      setLoading(false);
    }
  }, [searchParams, router]);

  if (loading) {
    return <div className="text-center mt-20">Cargando y procesando autenticación...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">Error: {error}</div>;
  }

  return <div className="text-center mt-20">Redirigiendo...</div>;
}