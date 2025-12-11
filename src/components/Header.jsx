// src/components/Header.jsx

'use client';
import { logout } from '../lib/auth'; // Importamos directamente la función de logout
import { FaSpotify } from 'react-icons/fa';

/**
 * Componente de encabezado reutilizable.
 * @param {object} user El objeto de perfil de usuario.
 * @param {function} onLogout Función para manejar el cierre de sesión.
 */
export default function Header({ user }) {
  
  const handleLogout = () => {
    // La función logout de lib/auth.js ya borra tokens y redirige
    logout();
  };

  return (
    <header className="flex justify-between items-center pb-6 border-b border-gray-700">
      <h1 className="text-3xl font-bold flex items-center space-x-2">
          <FaSpotify className="text-green-500 text-4xl" />
          <span>Spotify Taste Mixer</span>
      </h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm hidden sm:inline">Hola, {user?.display_name || user?.id}</span>
        <button 
          onClick={handleLogout} 
          className="bg-red-600 hover:bg-red-700 py-1 px-3 rounded-full text-sm transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}