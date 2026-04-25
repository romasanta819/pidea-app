import React, { useState } from 'react';

interface LaboratorioIntermedioProps {
  onNavigate?: (version: 'simple' | 'intermedio' | 'completo') => void;
}

const LaboratorioIntermedio: React.FC<LaboratorioIntermedioProps> = ({ onNavigate }) => {
    console.log('🚀 Iniciando Laboratorio Intermedio...');
    
    const [ipc, setIpc] = useState(33.6);
    const [desempleo, setDesempleo] = useState(7.6);
    const [inversion, setInversion] = useState(16.5);
    const [pobreza, setPobreza] = useState(38.8);
    
    const handleIpcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newIpc = parseFloat(e.target.value);
        setIpc(newIpc);
        
        // Propagación automática: ajustar desempleo e inversión
        const nuevoDesempleo = 7.6 + (newIpc - 33.6) * 0.05;
        const nuevaInversion = 16.5 - (newIpc - 33.6) * 0.1;
        
        setDesempleo(Math.max(5, Math.min(25, nuevoDesempleo)));
        setInversion(Math.max(10, Math.min(40, nuevaInversion)));
        
        // Cálculo de pobreza con todas las variables
        const nuevaPobreza = 38.8 + (newIpc - 33.6) * 0.1 + (nuevoDesempleo - 7.6) * 0.5 - (nuevaInversion - 16.5) * 0.3;
        setPobreza(Math.max(20, Math.min(60, nuevaPobreza)));
        
        console.log('📊 IPC cambiado:', newIpc, 'Desempleo ajustado:', nuevoDesempleo, 'Inversión ajustada:', nuevaInversion, 'Pobreza calculada:', nuevaPobreza);
    };
    
    const handleDesempleoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDesempleo = parseFloat(e.target.value);
        setDesempleo(newDesempleo);
        
        // Propagación automática: ajustar IPC e inversión
        const nuevoIpc = 33.6 + (newDesempleo - 7.6) * 2;
        const nuevaInversion = 16.5 - (newDesempleo - 7.6) * 0.5;
        
        setIpc(Math.max(5, Math.min(250, nuevoIpc)));
        setInversion(Math.max(10, Math.min(40, nuevaInversion)));
        
        // Cálculo de pobreza
        const nuevaPobreza = 38.8 + (newDesempleo - 7.6) * 0.5 + (nuevoIpc - 33.6) * 0.1 - (nuevaInversion - 16.5) * 0.3;
        setPobreza(Math.max(20, Math.min(60, nuevaPobreza)));
        
        console.log('📊 Desempleo cambiado:', newDesempleo, 'IPC ajustado:', nuevoIpc, 'Inversión ajustada:', nuevaInversion, 'Pobreza calculada:', nuevaPobreza);
    };
    
    const handleInversionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newInversion = parseFloat(e.target.value);
        setInversion(newInversion);
        
        // Propagación automática: ajustar IPC y desempleo
        const nuevoIpc = 33.6 - (newInversion - 16.5) * 0.5;
        const nuevoDesempleo = 7.6 - (newInversion - 16.5) * 0.2;
        
        setIpc(Math.max(5, Math.min(250, nuevoIpc)));
        setDesempleo(Math.max(5, Math.min(25, nuevoDesempleo)));
        
        // Cálculo de pobreza
        const nuevaPobreza = 38.8 + (nuevoIpc - 33.6) * 0.1 + (nuevoDesempleo - 7.6) * 0.5 - (newInversion - 16.5) * 0.3;
        setPobreza(Math.max(20, Math.min(60, nuevaPobreza)));
        
        console.log('📊 Inversión cambiada:', newInversion, 'IPC ajustado:', nuevoIpc, 'Desempleo ajustado:', nuevoDesempleo, 'Pobreza calculada:', nuevaPobreza);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header con navegación */}
            {onNavigate && (
                <div className="mb-6 flex justify-center gap-4">
                    <button
                        onClick={() => onNavigate('simple')}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500"
                    >
                        Simple
                    </button>
                    <button
                        onClick={() => onNavigate('intermedio')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
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
                🧪 Laboratorio Intermedio - Simulación con Propagación
            </h1>
            
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Controles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    
                    {/* Inversión Slider */}
                    <div className="p-4 bg-white rounded-lg shadow">
                        <label className="block text-blue-700 font-bold mb-2">
                            🏭 Inversión Bruta (%)
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="40"
                            step="0.1"
                            value={inversion}
                            onChange={handleInversionChange}
                            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-2xl font-bold text-blue-600 mt-2">
                            {inversion.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Gráfico de Barras */}
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                        📊 Gráfico de Variables
                    </h2>
                    <div className="h-64 flex items-end justify-center space-x-8">
                        <div className="flex flex-col items-center">
                            <div 
                                className="bg-red-500 w-16 rounded-t transition-all duration-300"
                                style={{ height: `${(ipc / 250) * 200}px` }}
                            ></div>
                            <div className="text-sm mt-2 text-gray-600 font-medium">IPC</div>
                            <div className="text-xs text-gray-500">{ipc.toFixed(1)}%</div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <div 
                                className="bg-green-500 w-16 rounded-t transition-all duration-300"
                                style={{ height: `${(desempleo / 25) * 200}px` }}
                            ></div>
                            <div className="text-sm mt-2 text-gray-600 font-medium">Desempleo</div>
                            <div className="text-xs text-gray-500">{desempleo.toFixed(1)}%</div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <div 
                                className="bg-blue-500 w-16 rounded-t transition-all duration-300"
                                style={{ height: `${(inversion / 40) * 200}px` }}
                            ></div>
                            <div className="text-sm mt-2 text-gray-600 font-medium">Inversión</div>
                            <div className="text-xs text-gray-500">{inversion.toFixed(1)}%</div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div 
                                className="bg-purple-500 w-16 rounded-t transition-all duration-300"
                                style={{ height: `${(pobreza / 60) * 200}px` }}
                            ></div>
                            <div className="text-sm mt-2 text-gray-600 font-medium">Pobreza</div>
                            <div className="text-xs text-gray-500">{pobreza.toFixed(1)}%</div>
                        </div>
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
                        Se calcula automáticamente basado en IPC, Desempleo e Inversión
                    </p>
                </div>
                
                {/* Información */}
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-2">💡 Versión Intermedia</h3>
                    <p className="text-sm text-blue-700 mb-2">
                        Esta versión incluye propagación automática entre variables. Al cambiar una variable, 
                        las demás se ajustan automáticamente para simular relaciones económicas reales.
                    </p>
                    <p className="text-sm text-blue-700">
                        <strong>Variables:</strong> IPC, Desempleo, Inversión Bruta → Pobreza
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LaboratorioIntermedio;

