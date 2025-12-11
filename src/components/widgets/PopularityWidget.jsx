// src/components/widgets/PopularityWidget.jsx

'use client';
import { useState, useEffect } from 'react';

/**
 * Widget para seleccionar el nivel mínimo de popularidad de las pistas.
 * @param {function} onUpdatePreferences Función para notificar al componente padre.
 */
export default function PopularityWidget({ onUpdatePreferences }) {
  // Inicialmente, solo definiremos la popularidad mínima, asumiendo max=100
  const [minPopularity, setMinPopularity] = useState(50); 
  const maxPopularity = 100; // Asumimos que el máximo siempre es 100

  useEffect(() => {
    // Parámetro enviado: target_popularity (para la búsqueda de recomendaciones)
    // Usamos el target_popularity en lugar de min/max, ya que es el parámetro principal de Spotify.
    onUpdatePreferences({ 
      target_popularity: minPopularity,
      min_popularity: minPopularity, // Enviamos el rango completo para la lógica de filtrado
      max_popularity: maxPopularity
    });
  }, [minPopularity, onUpdatePreferences]);

  const getLabel = (value) => {
    if (value <= 30) return "Nicho/Underground"; // Underground 0-50
    if (value <= 70) return "Popular"; // Popular 50-80
    return "Mainstream/Global Hits"; // Mainstream 80-100
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-green-400">Popularidad de Pistas</h3>
      
      <div className="mb-4">
        <label className="block text-white text-md mb-2">
          Mínimo de Popularidad: **{minPopularity}**
        </label>
        <span className="text-sm text-gray-400 block mb-2">
            {getLabel(minPopularity)}
        </span>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={minPopularity}
          onChange={(e) => setMinPopularity(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-green-500"
        />
      </div>
      <p className="text-xs text-gray-500">
        Define la popularidad mínima (0=Nicho, 100=Global Hits).
      </p>
    </div>
  );
}