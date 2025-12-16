// src/components/widgets/DecadeWidget.jsx
'use client';

import { useState, useEffect } from 'react';

const DECADES = [
    { label: '1950s', min: 1950, max: 1959 },
    { label: '1960s', min: 1960, max: 1969 },
    { label: '1970s', min: 1970, max: 1979 },
    { label: '1980s', min: 1980, max: 1989 },
    { label: '1990s', min: 1990, max: 1999 },
    { label: '2000s', min: 2000, max: 2009 },
    { label: '2010s', min: 2010, max: 2019 },
    { label: '2020s', min: 2020, max: new Date().getFullYear() },
];

export default function DecadeWidget({ onSelect, selectedItems }) {
    // selectedItems es un objeto con { min_year, max_year }
    const initialMin = selectedItems.min_year || 1980;
    const initialMax = selectedItems.max_year || new Date().getFullYear();

    const [minYear, setMinYear] = useState(initialMin);
    const [maxYear, setMaxYear] = useState(initialMax);
    const [selectedDecades, setSelectedDecades] = useState([]); // Array de strings de décadas seleccionadas

    // 1. Efecto para notificar al padre sobre los cambios de rango
    useEffect(() => {
        // Aseguramos que el mínimo no exceda el máximo
        const newMin = Math.min(minYear, maxYear);
        const newMax = Math.max(minYear, maxYear);
        
        onSelect({ min_year: newMin, max_year: newMax });

        // Identificar si el rango actual coincide con una o más décadas
        const matchedDecades = DECADES.filter(d => 
            d.min >= newMin && d.max <= newMax
        ).map(d => d.label);
        
        // Esta lógica es simple y puede no cubrir todos los casos, pero sirve para sincronizar
        if (matchedDecades.length > 0 && 
            Math.min(...matchedDecades.map(label => DECADES.find(d => d.label === label).min)) === newMin &&
            Math.max(...matchedDecades.map(label => DECADES.find(d => d.label === label).max)) === newMax
        ) {
            setSelectedDecades(matchedDecades);
        } else {
            setSelectedDecades([]);
        }

    }, [minYear, maxYear, onSelect]);

    // 2. Manejar la selección de décadas predefinidas
    const handleDecadeToggle = (decade) => {
        let newSelected;
        
        if (selectedDecades.includes(decade.label)) {
            // Deseleccionar
            newSelected = selectedDecades.filter(d => d !== decade.label);
        } else {
            // Seleccionar
            newSelected = [...selectedDecades, decade.label];
        }

        setSelectedDecades(newSelected);

        if (newSelected.length === 0) {
            // Si no hay nada seleccionado, usar un rango amplio por defecto (o el que se considere inicial)
            setMinYear(1950);
            setMaxYear(new Date().getFullYear());
        } else {
            // Calcular el rango total basado en las décadas seleccionadas
            const selectedDecadeObjects = DECADES.filter(d => newSelected.includes(d.label));
            const minOfSelection = Math.min(...selectedDecadeObjects.map(d => d.min));
            const maxOfSelection = Math.max(...selectedDecadeObjects.map(d => d.max));
            
            setMinYear(minOfSelection);
            setMaxYear(maxOfSelection);
        }
    };
    
    // 3. Manejar el cambio a rango personalizado (limpia la selección de décadas visualmente)
    const handleCustomRangeChange = (setter, value) => {
        setter(Number(value));
    };


    return (
        <div>
            <h4 className="text-lg font-medium mb-3">Seleccionar Década/Rango de Años</h4>

            {/* Selector de Décadas */}
            <div className="flex flex-wrap gap-2 mb-4">
                {DECADES.map((decade) => {
                    const isSelected = selectedDecades.includes(decade.label);
                    return (
                        <button
                            key={decade.label}
                            onClick={() => handleDecadeToggle(decade)}
                            className={`py-1 px-3 rounded-full text-sm font-medium transition-colors border
                                ${isSelected
                                    ? 'bg-green-600 text-white border-green-400'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'}`}
                        >
                            {decade.label}
                        </button>
                    );
                })}
            </div>
            
            {/* Rango Personalizado */}
            <h4 className="text-lg font-medium mt-4 mb-2 border-t border-gray-700 pt-3">
                Rango Actual: **{minYear} - {maxYear}**
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
                {/* Selector de Año Mínimo */}
                <div>
                    <label htmlFor="minYear" className="block text-sm font-medium text-gray-300 mb-1">
                        Desde (Año Mínimo)
                    </label>
                    <input
                        id="minYear"
                        type="number"
                        min={1900}
                        max={new Date().getFullYear()}
                        value={minYear}
                        onChange={(e) => handleCustomRangeChange(setMinYear, e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 outline-none"
                    />
                </div>

                {/* Selector de Año Máximo */}
                <div>
                    <label htmlFor="maxYear" className="block text-sm font-medium text-gray-300 mb-1">
                        Hasta (Año Máximo)
                    </label>
                    <input
                        id="maxYear"
                        type="number"
                        min={1900}
                        max={new Date().getFullYear()}
                        value={maxYear}
                        onChange={(e) => handleCustomRangeChange(setMaxYear, e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );
}