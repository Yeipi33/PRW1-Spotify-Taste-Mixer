// src/components/Header.jsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
    const router = useRouter();
    
    // Verificamos si hay un token almacenado para determinar si el usuario está autenticado.
    // Usamos typeof window !== 'undefined' para asegurar que estamos en el lado del cliente.
    const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('spotify_token');

    const handleLogout = () => {
        // 1. Limpiar todos los tokens y estados persistentes
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expiration');
        sessionStorage.removeItem('spotify_auth_state'); // Limpieza de estado CSRF si persiste

        // 2. Redirigir al usuario a la página de inicio (login)
        router.push('/');
    };

    return (
        <header className="bg-gray-800 p-4 shadow-lg sticky top-0 z-10">
            <nav className="flex justify-between items-center max-w-7xl mx-auto">
                {/* Título de la Aplicación y Link a Home/Login */}
                <div className="text-xl font-bold text-green-400">
                    <Link href="/">
                        🎶 Taste Mixer
                    </Link>
                </div>
                
                {/* Navegación y Botón de Logout */}
                <div className="space-x-4">
                    {isAuthenticated ? (
                        <>
                            {/* Link al Dashboard si está autenticado */}
                            <Link href="/dashboard" className="hover:text-green-400 transition-colors">
                                Dashboard
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        // Link al Login si no está autenticado
                        <Link href="/" className="hover:text-green-400 transition-colors">
                            Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}