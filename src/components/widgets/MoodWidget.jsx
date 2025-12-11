// src/components/widgets/MoodWidget.jsx

'use client';
import { useState, useEffect } from 'react';

/**
 * Widget para seleccionar niveles de energía y características musicales (0.0 a 1.0).
 * @param {function} onUpdatePreferences Función para notificar al componente padre.
 */
export default function MoodWidget({ onUpdatePreferences }) {
  // Valores iniciales en el rango 0-100 para simplificar el slider
  const [energy, setEnergy] = useState(70);
  const [valence, setValence] = useState(50); // Positividad
  const [danceability, setDanceability] = useState(60); 

  useEffect(() => {
    // Parámetros enviados: Usamos target_ para el rango 0.0 a 1.0
    onUpdatePreferences({ 
      target_energy: energy / 100,
      target_valence: valence / 100,
      target_danceability: danceability / 100,
      // Se pueden añadir más como target_acousticness o target_instrumentalness
    });
  }, [energy, valence, danceability, onUpdatePreferences]);

  const characteristics = [
    { label: 'Energía', state: energy, setter: setEnergy, tooltip: 'Intensidad y actividad (Baja=Tranquilo, Alta=Enérgico)' },
    { label: 'Valencia (Ánimo)', state: valence, setter: setValence, tooltip: 'Positividad musical (Baja=Triste/Negativo, Alta=Feliz/Positivo)' },
    { label: 'Bailabilidad', state: danceability, setter: setDanceability, tooltip: 'Qué tan adecuada es la pista para bailar' },
  ];

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-green-400">Widget de Estado de Ánimo</h3>
      
      <p className="text-sm text-gray-400 mb-4">
        Ajusta los parámetros para definir el "mood" de tu playlist.
      </p>

      {characteristics.map((char) => (
        <div key={char.label} className="mb-4">
          <label className="block text-white text-md mb-1" title={char.tooltip}>
            {char.label}: **{(char.state / 100).toFixed(2)}**
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={char.state}
            onChange={(e) => char.setter(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm accent-green-500"
          />
        </div>
      ))}
      
      <p className="text-xs text-gray-500 mt-4">
        Nota: Estos valores (0.0 - 1.0) se usan para guiar el algoritmo de recomendación de Spotify.
      </p>
    </div>
  );
}