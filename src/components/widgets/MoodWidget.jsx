// src/components/widgets/MoodWidget.jsx
'use client';

import { useState, useEffect } from 'react';

// Los parámetros de audio van de 0 a 100 en el UI, que se mapean a 0.0 a 1.0 en la API.
const MIN_VALUE = 0;
const MAX_VALUE = 100;

// Estados predefinidos para selección rápida
const MOOD_OPTIONS = [
    { label: 'Feliz', energy: 75, valence: 85, description: 'Positiva, alta bailabilidad' },
    { label: 'Triste', energy: 30, valence: 15, description: 'Baja energía, melancólica' },
    { label: 'Enérgico', energy: 90, valence: 60, description: 'Ritmo rápido, motivadora' },
    { label: 'Tranquilo', energy: 20, valence: 50, description: 'Baja energía, relajante' },
];

export default function MoodWidget({ onSelect, selectedItems }) {
    // selectedItems es un objeto con { target_energy, target_valence }
    // Multiplicamos por 100 para trabajar con el rango 0-100 en el UI
    const initialEnergy = selectedItems.target_energy || 50; 
    const initialValence = selectedItems.target_valence || 50;

    const [energy, setEnergy] = useState(initialEnergy);
    const [valence, setValence] = useState(initialValence);
    const [selectedMood, setSelectedMood] = useState(null);

    // Notificar al padre cuando cambian los valores de los deslizadores
    useEffect(() => {
        // La API de Spotify usa 0.0 a 1.0. Dividimos por 100.
        onSelect({
            target_energy: energy / 100,
            target_valence: valence / 100,
        });
        // Si los valores coinciden con un modo predefinido, lo marcamos
        const currentMood = MOOD_OPTIONS.find(m => m.energy === energy && m.valence === valence);
        setSelectedMood(currentMood ? currentMood.label : null);
    }, [energy, valence, onSelect]);

    // Aplicar los valores de un estado de ánimo predefinido
    const handleMoodSelect = (mood) => {
        setEnergy(mood.energy);
        setValence(mood.valence);
    };

    // Función auxiliar para obtener la etiqueta de valor
    const getLabel = (value) => (value > 75 ? 'Alto' : value < 25 ? 'Bajo' : 'Medio');

    return (
        <div>
            <div className="mb-4">
                <h4 className="text-lg font-medium mb-2">Selección Rápida de Estado de Ánimo</h4>
                <div className="flex flex-wrap gap-2">
                    {MOOD_OPTIONS.map((mood) => (
                        <button
                            key={mood.label}
                            onClick={() => handleMoodSelect(mood)}
                            className={`py-1 px-3 rounded-full text-sm font-medium transition-colors
                                ${selectedMood === mood.label
                                    ? 'bg-blue-600 text-white border-blue-400'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'}
                                border`}
                        >
                            {mood.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Control Deslizante de Energía */}
            <h4 className="text-lg font-medium mt-4 mb-2">Energía/Arousal ({energy})</h4>
            <p className="text-sm text-gray-400 mb-2">Nivel: **{getLabel(energy)}** (Bajo=Acústico/Tranquilo, Alto=Bailabilidad/Ritmo)</p>
            <input
                type="range"
                min={MIN_VALUE}
                max={MAX_VALUE}
                step={1}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-blue mt-1"
            />

            {/* Control Deslizante de Valencia */}
            <h4 className="text-lg font-medium mt-4 mb-2">Valencia/Positividad ({valence})</h4>
            <p className="text-sm text-gray-400 mb-2">Nivel: **{getLabel(valence)}** (Bajo=Triste/Serio, Alto=Feliz/Positivo)</p>
            <input
                type="range"
                min={MIN_VALUE}
                max={MAX_VALUE}
                step={1}
                value={valence}
                onChange={(e) => setValence(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-pink mt-1"
            />
        </div>
    );
}