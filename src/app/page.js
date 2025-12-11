import { getAuthorizeUrl } from '../lib/auth';
import Link from 'next/link';

export default function Home() {
  const loginUrl = getAuthorizeUrl();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-4">🎵 Spotify Taste Mixer</h1>
      <p className="text-xl mb-8">Genera tus listas de reproducción personalizadas.</p>
      
      {/* Botón que redirige a Spotify para la autorización */}
      <Link href={loginUrl} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-lg">
          Iniciar Sesión con Spotify
      </Link>
    </div>
  );
}