// src/components/Spinner.jsx

export default function Spinner({ text = 'Cargando...' }) {
    return (
        <div className="flex items-center justify-center p-4 text-gray-400">
            {/* Simple icono de carga (podría ser un SVG o un div animado con CSS) */}
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500 mr-3"></div>
            <p>{text}</p>
        </div>
    );
}