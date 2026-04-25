import React, { useState } from 'react';

interface LaboratorioSimpleProps {
  onNavigate?: (version: 'simple' | 'intermedio' | 'completo') => void;
}

const LaboratorioSimple: React.FC<LaboratorioSimpleProps> = ({ onNavigate }) => {
    console.log('🚀 Iniciando Laboratorio Simple...');
    
    const [ipc, setIpc] = useState(33.6);
    const [desempleo, setDesempleo] = useState(7.6);
    const [pobreza, setPobreza] = useState(38.8);
    
    const handleIpcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newIpc = parseFloat(e.target.value);
        setIpc(newIpc);
        
        // Cálculo simple de pobreza basado en IPC y desempleo
        const nuevaPobreza = 38.8 + (newIpc - 33.6) * 0.1 + (desempleo - 7.6) * 0.5;
        setPobreza(Math.max(20, Math.min(60, nuevaPobreza)));
        
        console.log('📊 IPC cambiado:', newIpc, 'Pobreza calculada:', nuevaPobreza);
    };
    
    const handleDesempleoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDesempleo = parseFloat(e.target.value);
        setDesempleo(newDesempleo);
        
        // Cálculo simple de pobreza
        const nuevaPobreza = 38.8 + (ipc - 33.6) * 0.1 + (newDesempleo - 7.6) * 0.5;
        setPobreza(Math.max(20, Math.min(60, nuevaPobreza)));
        
        console.log('📊 Desempleo cambiado:', newDesempleo, 'Pobreza calculada:', nuevaPobreza);
    };
    
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header con navegación */}
            {onNavigate && (
                <div className="mb-6 flex justify-center gap-4">
                    <button
                        onClick={() => onNavigate('simple')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                        Simple
                    </button>
                    <button
                        onClick={() => onNavigate('intermedio')}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500"
                    >
                        Intermedio
                    </button>
                    <button
                        onClick={() => onNavigate('completo')}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500"
                    >
                        Completo
                    </button>
                </div>
            )}
            
            <h1 className="text-3xl font-bold mb-8 text-center text-indigo-700">
                🧪 Laboratorio Simple - Simulación Básica
            </h1>
            
            <div className="max-w-2xl mx-auto space-y-6">
                {/* IPC Slider */}
                <div className="p-4 bg-white rounded-lg shadow">
                    <label className="block text-red-700 font-bold mb-2">
                        📈 Inflación (IPC %)
                    </label>
                    <input
                        type="range"
                        min="5"
                        max="250"
                        step="1"
                        value={ipc}
                        onChange={handleIpcChange}
                        className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-2xl font-bold text-red-600 mt-2">
                        {ipc.toFixed(1)}%
                    </div>
                </div>
                
                {/* Desempleo Slider */}
                <div className="p-4 bg-white rounded-lg shadow">
                    <label className="block text-green-700 font-bold mb-2">
                        👥 Tasa de Desempleo (%)
                    </label>
                    <input
                        type="range"
                        min="5"
                        max="25"
                        step="0.1"
                        value={desempleo}
                        onChange={handleDesempleoChange}
                        className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-2xl font-bold text-green-600 mt-2">
                        {desempleo.toFixed(1)}%
                    </div>
                </div>
                
                {/* Resultado Pobreza */}
                <div className="p-6 bg-indigo-100 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-indigo-800 mb-2">
                        📉 Pobreza Calculada
                    </h2>
                    <div className="text-4xl font-extrabold text-indigo-800">
                        {pobreza.toFixed(2)}%
                    </div>
                    <p className="text-sm text-indigo-600 mt-2">
                        Se calcula automáticamente basado en IPC y Desempleo
                    </p>
                </div>
                
                {/* Información */}
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-2">💡 Versión Simple</h3>
                    <p className="text-sm text-blue-700">
                        Esta versión incluye las variables más básicas: Inflación (IPC) y Desempleo. 
                        La pobreza se calcula automáticamente basándose en estas dos variables.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LaboratorioSimple;

