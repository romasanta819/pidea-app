import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ipcHistoricalData, IpcDataPoint } from '../data/ipcData';

// Función que convierte el número de serie de la hoja de cálculo a una fecha de JavaScript.
// La fórmula es (NumeroDeSerie - 25569) * 86400 * 1000 para obtener el timestamp de Unix.
const convertSerialToTimestamp = (serial: any): number | null => {
  const serialNumber = typeof serial === 'string' ? parseInt(serial, 10) : serial;
  if (isNaN(serialNumber) || serialNumber === null) return null;
  // Esta es la conversión matemática correcta
  return Math.round((serialNumber - 25569) * 86400 * 1000);
};

// Formateadores para el gráfico
const formatTooltipValue = (value: number | null) => {
  if (value === null) return "No disponible";
  if (value < 1 && value > 0) return value.toExponential(4);
  return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatXAxis = (timestamp: number) => new Date(timestamp).getFullYear().toString();

export default function LaboratorioPidia() {
  // 1. Convertimos la "fecha" (que es un número de serie) a un timestamp que Recharts entiende.
  // 2. Filtramos cualquier dato que no se haya podido convertir.
  const processedData = useMemo(() =>
    ipcHistoricalData
      .map(d => ({
        ...d,
        timestamp: convertSerialToTimestamp(d.fecha), // Usamos la función de conversión
      }))
      .filter(d => d.timestamp !== null && typeof d.valor === 'number'),
    []
  );

  // Genera las marcas para cada década en el eje X
  const yearlyTicks = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    const ticks: number[] = [];
    const displayedYears = new Set<number>();

    processedData.forEach(d => {
        if(d.timestamp){
            const year = new Date(d.timestamp).getFullYear();
            if (year % 10 === 0 && !displayedYears.has(year)) {
                ticks.push(d.timestamp);
                displayedYears.add(year);
            }
        }
    });

    if(processedData.length > 0 && processedData[processedData.length-1].timestamp){
        const lastTick = processedData[processedData.length - 1].timestamp;
        if(!ticks.includes(lastTick)){
            ticks.push(lastTick);
        }
    }

    return ticks.sort((a, b) => a - b);
  }, [processedData]);

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">🔬 Laboratorio PIDIA</h1>
      <section className="mt-8 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Serie Histórica del IPC de Argentina (1943 - Presente)
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Índice empalmado (Base Dic 2016 = 100). Eje Y en escala logarítmica.
        </p>
        <div style={{ width: '100%', height: 500 }}>
          <ResponsiveContainer>
            <LineChart
              data={processedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                ticks={yearlyTicks}
                tickFormatter={formatXAxis}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                scale="log"
                domain={[1e-12, 'auto']}
                allowDataOverflow={true}
                width={80}
              />
              <Tooltip
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', timeZone: 'UTC' })}
                formatter={(value: number, name: string) => [formatTooltipValue(value), name]}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line
                type="monotone"
                dataKey="valor"
                name="Valor del Índice IPC"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}