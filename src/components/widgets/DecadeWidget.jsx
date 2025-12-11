// src/components/widgets/DecadeWidget.jsx

'use client';
import { useState, useEffect } from 'react';

const DECADES = [
  { label: 'Cualquier Época', min: 1950, max: new Date().getFullYear() },
  { label: '1950s', min: 1950, max: 1959 },
  { label: '1960s', min: 1960, max: 1969 },
  { label: '1970s', min: 1970, max: 1979 },
  { label: '1980s', min: 1980, max: 1989 },
  { label: '1990s', min: 1990, max: 1999 },
  { label: '2000s', min: 2000, max: 2009 },
  { label: '2010s', min: 2010, max: 2019 },
  { label: '2020s', min: 2020, max: new Date().getFullYear() },
];

/**
 * Widget para elegir el rango de años de las pistas.
 * @param {function} onUpdatePreferences Función para notificar al componente padre.
 */
export default function DecadeWidget({ onUpdatePreferences }) {
  const [selectedRange, setSelectedRange] = useState(DECADES[0]);

  useEffect(() => {
    // Parámetros enviados: min_year y max_year para el filtrado
    onUpdatePreferences({ 
      min_year: selectedRange.min, 
      max_year: selectedRange.max 
    });
  }, [selectedRange, onUpdatePreferences]);
  
  // Función para manejar el cambio de selección
  const handleChange = (e) => {
    const selected = DECADES.find(d => d.label === e.target.value);
    if (selected) {
      setSelectedRange(selected);
    }
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-green-400">Widget de Década</h3>
      
      <label htmlFor="decade-select" className="block text-sm font-medium text-gray-300 mb-2">
        Seleccionar Década
      </label>
      <select
        id="decade-select"
        value={selectedRange.label}
        onChange={handleChange}
        className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-green-500 focus:border-green-500"
      >
        {DECADES.map(decade => (
          <option key={decade.label} value={decade.label}>
            {decade.label} ({decade.min} - {decade.max})
          </option>
        ))}
      </select>
      
      <p className="text-xs text-gray-500 mt-2">
        Actualmente buscando pistas entre {selectedRange.min} y {selectedRange.max}.
      </p>
    </div>
  );
}