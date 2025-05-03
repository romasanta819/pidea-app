import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  getAvailableVariables,
  VARIABLES_HISTORICAS_NOMBRES
} from '../data/mockHistoricalData'; // Ajusta la ruta si es necesario

interface PuntoSim {
  nombre: string;
  pobreza: number;
  empleo: number;
  reservas: number;
}

const acciones = ['Aumentar', 'Disminuir'];

// --- NUEVA Función Helper para describir tendencias ---
const getTrend = (startValue: number, endValue: number): string => {
  // Evitar división por cero si el valor inicial es 0
  if (startValue === 0 && endValue === 0) return "sin cambios (0)";
  if (startValue === 0) return endValue > 0 ? "un aumento desde cero" : "una disminución desde cero";

  const diff = endValue - startValue;
  const percentageChange = (diff / Math.abs(startValue)) * 100;

  // Definimos un umbral pequeño para considerar "estable"
  if (Math.abs(percentageChange) < 0.5) {
    return "una relativa estabilidad";
  } else if (diff > 0) {
    return `un aumento del ${percentageChange.toFixed(1)}%`;
  } else {
    return `una disminución del ${Math.abs(percentageChange).toFixed(1)}%`;
  }
};
// --- Fin Función Helper ---

export default function Simulador() {
  const availableVariables = getAvailableVariables();
  const [variable, setVariable] = useState<string>('');
  const [accion, setAccion] = useState<string>('');
  const [resultado, setResultado] = useState<string>('');
  const [datos, setDatos] = useState<PuntoSim[]>([]);
  // --- NUEVO Estado para el texto del resumen ---
  const [summaryText, setSummaryText] = useState<string>('');

  const simular = () => {
    // Limpiar resultados y resumen anteriores al inicio
    setResultado('');
    setSummaryText('');
    setDatos([]);

    if (!variable || !accion) {
      setResultado('Por favor seleccioná una variable y una acción.');
      return;
    }

    const variableNombre = VARIABLES_HISTORICAS_NOMBRES[variable] || variable;
    const mensaje = `Simulación: ${accion.toLowerCase()} ${variableNombre.toLowerCase()}`;
    setResultado(`${mensaje}. (Resultados simulados simplificados)`);

    // --- Lógica de Simulación Mock (igual que antes) ---
    const base = [100, 102, 105, 107, 110, 112, 115];
    const multiplicador = accion === 'Aumentar' ? 1.1 : 0.9;
    const curva: PuntoSim[] = base.map((valor, i) => ({
      nombre: `Mes ${i + 1}`,
      pobreza: +(valor / multiplicador).toFixed(2),
      empleo: +(valor * multiplicador).toFixed(2),
      reservas: +(valor * (2 - multiplicador)).toFixed(2)
    }));
    // --- Fin Lógica Mock ---

    setDatos(curva);

    // --- NUEVA Lógica para generar el Resumen ---
    if (curva.length > 0) {
      const startPoint = curva[0];
      const endPoint = curva[curva.length - 1];
      const trendPobreza = getTrend(startPoint.pobreza, endPoint.pobreza);
      const trendEmpleo = getTrend(startPoint.empleo, endPoint.empleo);
      const trendReservas = getTrend(startPoint.reservas, endPoint.reservas);

      // Usamos \n para saltos de línea que respetará 'whitespace-pre-line'
      const generatedSummary = `La acción simulada (${accion.toLowerCase()} ${variableNombre.toLowerCase()}) sugiere, basado en este modelo simplificado para los próximos ${curva.length} meses:
        \n- Pobreza: ${trendPobreza}.
        \n- Empleo: ${trendEmpleo}.
        \n- Reservas: ${trendReservas}.`;
      setSummaryText(generatedSummary); // Guardamos el resumen en el nuevo estado
    }
    // --- Fin Lógica Resumen ---

  };

  return (
    <main className="p-8 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">🧪 Simulador de Decisiones</h1>

      {/* Selectores y Botón (sin cambios) */}
      <div className="mb-4">
         <label htmlFor="sim-variable" className="block mb-1 font-semibold">Seleccioná una variable</label>
         <select id="sim-variable" value={variable} onChange={e => setVariable(e.target.value)} className="w-full p-2 border rounded bg-white shadow-sm">
           <option value="">-- Elegir Variable --</option>
           {availableVariables.map(v => (<option key={v.id} value={v.id}>{v.nombre}</option>))}
         </select>
       </div>
      <div className="mb-4">
         <label htmlFor="sim-accion" className="block mb-1 font-semibold">Seleccioná una acción</label>
         <select id="sim-accion" value={accion} onChange={e => setAccion(e.target.value)} className="w-full p-2 border rounded bg-white shadow-sm">
           <option value="">-- Elegir Acción --</option>
           {acciones.map(a => <option key={a} value={a}>{a}</option>)}
         </select>
       </div>
       <button onClick={simular} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6">
         Simular
       </button>

      {/* Mensaje de Resultado */}
      {resultado && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-left">
          <p className="font-semibold">{resultado}</p>
        </div>
      )}

      {/* Área del Gráfico (sin cambios) */}
      {datos.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">📈 Curva proyectada</h2>
          <ResponsiveContainer width="100%" height={300}>
             <LineChart data={datos}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="nombre" />
               <YAxis />
               <Tooltip />
               <Legend />
               <Line type="monotone" dataKey="pobreza" stroke="#e11d48" name="Pobreza" dot={false}/>
               <Line type="monotone" dataKey="empleo" stroke="#2563eb" name="Empleo" dot={false}/>
               <Line type="monotone" dataKey="reservas" stroke="#16a34a" name="Reservas" dot={false}/>
             </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* --- NUEVA Área para mostrar el Resumen --- */}
      {summaryText && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded text-left">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Resumen de la Simulación:</h3>
          {/* Usamos whitespace-pre-line para que respete los saltos de línea (\n) */}
          <p className="text-gray-700 whitespace-pre-line">{summaryText}</p>
        </div>
      )}
       {/* --- Fin Área Resumen --- */}

    </main>
  );
}