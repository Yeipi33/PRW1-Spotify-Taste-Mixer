// src/app/layout.js
import './globals.css'; // Importa los estilos globales (incluyendo Tailwind)

export const metadata = {
  title: 'Spotify Taste Mixer - Generador de Playlists', // Título descriptivo
  description: 'Aplicación web que genera listas de reproducción personalizadas de Spotify basadas en las preferencias musicales del usuario mediante widgets configurables.', // Descripción del proyecto
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* Aplicamos el fondo oscuro y el estilo de texto global desde globals.css */}
      <body className="bg-gray-900 text-white min-h-screen">
        {/* El children es el contenido de las páginas (/page.js, /dashboard/page.js, etc.) */}
        {children}
      </body>
    </html>
  );
}