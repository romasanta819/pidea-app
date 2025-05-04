import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend // Añadimos Legend para mostrar nombres de líneas
} from 'recharts';
import {
  mockHistoricalData,
  getAvailableVariables,
  VARIABLES_HISTORICAS_NOMBRES, // Para obtener nombres amigables
  type TimePoint // Importamos el tipo si lo exportaste, o lo definimos aquí si no
} from '../data/mockHistoricalData'; // Ajusta la ruta si tu carpeta data no está en la raíz

// Interfaz para la estructura de datos que usará el gráfico
// Cada punto tendrá el periodo y un valor por cada variable seleccionada
interface ChartDataPoint {
  periodo: string;
  [variableId: string]: number | string | null; // Claves dinámicas para valores de variables, permitimos null
}

export default function Laboratorio() {
  // Estado para los IDs de las dos variables seleccionadas
  const [selectedVar1, setSelectedVar1] = useState<string>('');
  const [selectedVar2, setSelectedVar2] = useState<string>('');

  // Estado para guardar los datos formateados para Recharts
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Obtenemos la lista de variables disponibles para los selectores
  const availableVariables = getAvailableVariables();

  // --- Hook useEffect para procesar datos cuando cambian las selecciones ---
  useEffect(() => {
    // Solo proceder si dos variables DIFERENTES están seleccionadas
    if (selectedVar1 && selectedVar2 && selectedVar1 !== selectedVar2) {
      const data1 = mockHistoricalData[selectedVar1];
      const data2 = mockHistoricalData[selectedVar2];

      // Comprobación básica si los datos existen
      if (!data1 || !data2) {
        console.error("Datos históricos no encontrados para:", selectedVar1, selectedVar2);
        setChartData([]);
        return;
      }

      // Asumiendo que los periodos se alinean perfectamente en nuestros datos mock.
      // En un caso real, necesitaríamos una lógica de fusión más robusta.
      const formattedData: ChartDataPoint[] = data1.map((point1, index) => {
        const point2 = data2[index]; // Asumimos mismo índice = mismo periodo
        return {
          periodo: point1.periodo,
          // Usamos los IDs de las variables seleccionadas como claves dinámicas
          [selectedVar1]: point1.valor,
          [selectedVar2]: point2 ? point2.valor : null, // Usamos null si no hay punto correspondiente
        };
      });

      setChartData(formattedData);
    } else {
      // Si no hay dos variables diferentes seleccionadas, limpiar los datos del gráfico
      setChartData([]);
    }
  }, [selectedVar1, selectedVar2]); // Dependencias: el efecto se re-ejecuta si cambia alguna selección

  // Definimos algunos colores para las líneas del gráfico
  const lineColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#387908"];
  // Podríamos asignar colores de forma más inteligente si tuviéramos más líneas

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🔬 Laboratorio PIDIA - Comparador Histórico (Simulado)
      </h1>

      {/* --- Controles de Selección (Sin cambios respecto al anterior) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded shadow">
        <div>
          <label htmlFor="variable1" className="block mb-1 font-semibold text-gray-700">
            Seleccioná la primera variable:
          </label>
          <select
            id="variable1"
            value={selectedVar1}
            onChange={(e) => setSelectedVar1(e.target.value)} // Simplificado, el useEffect se encarga
            className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Elegir Variable 1 --</option>
            {availableVariables.map(v => (
              <option key={v.id} value={v.id}>
                {v.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="variable2" className="block mb-1 font-semibold text-gray-700">
            Seleccioná la segunda variable:
          </label>
          <select
            id="variable2"
            value={selectedVar2}
            onChange={(e) => setSelectedVar2(e.target.value)} // Simplificado
            className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Elegir Variable 2 --</option>
            {availableVariables.map(v => (
              <option key={v.id} value={v.id} disabled={v.id === selectedVar1}>
                {v.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Área del Gráfico --- */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Comparación Histórica</h2>
        {(selectedVar1 && selectedVar2) ? (
          <ResponsiveContainer width="100%" height={400}>
            {/* --- AHORA SÍ: El componente LineChart --- */}
            <LineChart
              data={chartData} // Usamos los datos procesados por useEffect
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* Linea para la primera variable seleccionada (si existe) */}
              {selectedVar1 && (
                <Line
                  type="monotone"
                  dataKey={selectedVar1} // El ID de la variable es la clave de los datos
                  stroke={lineColors[0]}   // Primer color
                  name={VARIABLES_HISTORICAS_NOMBRES[selectedVar1]} // Nombre para la leyenda
                  dot={false}
                  connectNulls={true} // Conectar línea aunque haya datos null
                />
              )}
              {/* Linea para la segunda variable seleccionada (si existe) */}
              {selectedVar2 && (
                <Line
                  type="monotone"
                  dataKey={selectedVar2} // El ID de la variable es la clave de los datos
                  stroke={lineColors[1]}   // Segundo color
                  name={VARIABLES_HISTORICAS_NOMBRES[selectedVar2]} // Nombre para la leyenda
                  dot={false}
                  connectNulls={true}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-16">
            Por favor, seleccioná dos variables diferentes para comparar sus series históricas simuladas.
          </p>
        )}
      </div>
    </main>
  );
}