import React from 'react';
import { useRiesgoPais } from '../hooks/useRiesgoPais';
import type { RiesgoPaisDataPoint } from '../services/riesgoPaisService';

interface RiesgoPaisLoaderProps {
  mostrarPanel?: boolean;
  onDatosCargados?: (datos: RiesgoPaisDataPoint[]) => void;
}

/**
 * Componente para cargar y mostrar estado de datos de riesgo país
 */
const RiesgoPaisLoader: React.FC<RiesgoPaisLoaderProps> = ({ 
  mostrarPanel = true,
  onDatosCargados 
}) => {
  const { datos, ultimoValor, cargando, error, actualizar, ultimaActualizacion } = useRiesgoPais(false);

  React.useEffect(() => {
    if (datos.length > 0 && onDatosCargados) {
      onDatosCargados(datos);
    }
  }, [datos, onDatosCargados]);

  if (!mostrarPanel) {
    return null;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border-2 border-blue-200">
      <h3 className="text-lg font-bold text-blue-800 mb-3">
        📊 Carga de Datos de Riesgo País
      </h3>
      
      {cargando && (
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Cargando datos de riesgo país...</span>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 mb-2">
          <strong>⚠️ Error:</strong> {error}
          <p className="text-sm mt-1">
            Usando datos históricos locales como fallback.
          </p>
        </div>
      )}
      
      {!error && !cargando && datos.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-700">
            <strong>✅ Datos cargados:</strong> {datos.length} puntos
          </div>
          
          {ultimoValor !== null && (
            <div className="text-lg font-bold text-blue-700">
              Último valor: <span className="text-2xl">{ultimoValor.toLocaleString()}</span> puntos básicos
            </div>
          )}
          
          {ultimaActualizacion && (
            <div className="text-xs text-gray-500">
              Última actualización: {ultimaActualizacion.toLocaleString()}
            </div>
          )}
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={actualizar}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              🔄 Actualizar Datos
            </button>
          </div>
        </div>
      )}
      
      {!cargando && !error && datos.length === 0 && (
        <div className="text-sm text-gray-600">
          <p>No hay datos cargados. Haz clic en "Actualizar Datos" para cargar.</p>
          <button
            onClick={actualizar}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            📥 Cargar Datos
          </button>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <p><strong>Nota:</strong> Para cargar datos desde FRED API, configura la variable de entorno VITE_FRED_API_KEY</p>
        <p className="mt-1">Obtén tu API key gratuita en: <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">fred.stlouisfed.org</a></p>
      </div>
    </div>
  );
};

export default RiesgoPaisLoader;

