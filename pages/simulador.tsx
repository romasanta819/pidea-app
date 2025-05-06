// pages/simulador.tsx COMPLETO Y CORREGIDO
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
  VARIABLES_HISTORICAS_NOMBRES,
  VARIABLES_HISTORICAS_IDS // Importamos los IDs también
} from '../data/mockHistoricalData'; // Ajusta la ruta si es necesario

interface PuntoSim {
  nombre: string;
  pobreza: number;
  empleo: number;
  reservas: number;
}

const acciones = ['Aumentar', 'Disminuir'];

const variableImpactMatrix = {
  [VARIABLES_HISTORICAS_IDS.GASTO_PUBLICO]: { pobreza: 0.8, empleo: 1.3, reservas: 0.6 },
  [VARIABLES_HISTORICAS_IDS.TASA_DESEMPLEO]: { pobreza: 1.4, empleo: 1.0, reservas: 1.05 },
  [VARIABLES_HISTORICAS_IDS.TASA_POBREZA]: { pobreza: 1.0, empleo: 0.85, reservas: 1.0 },
  [VARIABLES_HISTORICAS_IDS.RESERVAS_USD]: { pobreza: 0.7, empleo: 1.2, reservas: 1.0 },
  [VARIABLES_HISTORICAS_IDS.INFLACION_ANUAL]:{ pobreza: 1.2, empleo: 0.8, reservas: 0.9 },
  DEFAULT: { pobreza: 1, empleo: 1, reservas: 1 }
};

const getTrend = (startValue: number, endValue: number): string => {
  if (startValue === 0 && endValue === 0) return "sin cambios (0)";
  if (startValue === 0) return endValue > 0 ? "un aumento desde cero" : "una disminución desde cero";
  const diff = endValue - startValue;
  const percentageChange = startValue !== 0 ? (diff / Math.abs(startValue)) * 100 : (diff > 0 ? Infinity : -Infinity);
  if (Math.abs(percentageChange) < 0.5) return "una relativa estabilidad";
  if (diff > 0) return `un aumento del ${percentageChange.toFixed(1)}%`;
  return `una disminución del ${Math.abs(percentageChange).toFixed(1)}%`;
};

export default function Simulador() {
  const availableVariables = getAvailableVariables();
  const [variable, setVariable] = useState<string>('');
  const [accion, setAccion] = useState<string>('');
  const [resultado, setResultado] = useState<string>('');
  const [datos, setDatos] = useState<PuntoSim[]>([]);
  const [summaryText, setSummaryText] = useState<string>('');

  const simular = () => {
    setResultado('');
    setSummaryText('');
    setDatos([]);

    if (!variable || !accion) {
      setResultado('Por favor seleccioná una variable y una acción.');
      return;
    }

    const variableNombre = VARIABLES_HISTORICAS_NOMBRES[variable] || variable;
    const mensaje = `Simulación: ${accion.toLowerCase()} ${variableNombre.toLowerCase()}`;
    setResultado(`${mensaje}. (Resultados simulados con efectos diferenciados)`);

    const base = [100, 102, 105, 107, 110, 112, 115];
    const cambioBaseRelativo = accion === 'Aumentar' ? 0.10 : -0.10;
    const factors = variableImpactMatrix[variable as keyof typeof variableImpactMatrix] || variableImpactMatrix.DEFAULT;

    const curva: PuntoSim[] = base.map((valor, i) => {
      const cambioPobreza = - (cambioBaseRelativo * factors.pobreza);
      const cambioEmpleo =   (cambioBaseRelativo * factors.empleo);
      const cambioReservas = - (cambioBaseRelativo * factors.reservas);
      const finalPobreza = valor * (1 + cambioPobreza);
      const finalEmpleo = valor * (1 + cambioEmpleo);
      const finalReservas = valor * (1 + cambioReservas);
      return {
        nombre: `Mes ${i + 1}`,
        pobreza:  +(finalPobreza).toFixed(2),
        empleo:   +(finalEmpleo).toFixed(2),
        reservas: +(finalReservas).toFixed(2)
      };
    });
    setDatos(curva);

    if (curva.length > 0) {
      const startPoint = curva[0];
      const endPoint = curva[curva.length - 1];
      const trendPobreza = getTrend(startPoint.pobreza, endPoint.pobreza);
      const trendEmpleo = getTrend(startPoint.empleo, endPoint.empleo);
      const trendReservas = getTrend(startPoint.reservas, endPoint.reservas);
      const generatedSummary = `La acción simulada (${accion.toLowerCase()} ${variableNombre.toLowerCase()}) sugiere, basado en este modelo simplificado para los próximos ${curva.length} meses:
        \n- Pobreza: ${trendPobreza}.
        \n- Empleo: ${trendEmpleo}.
        \n- Reservas: ${trendReservas}.`;
      setSummaryText(generatedSummary);
    }
  };

  return (
     <main className="p-8 max-w-4xl mx-auto text-center">
       <h1 className="text-3xl font-bold mb-6">🧪 Simulador de Decisiones</h1>
       {/* Selectores y Botón */}
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
       {/* Área del Gráfico */}
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
       {/* Área para mostrar el Resumen */}
       {summaryText && (
         <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded text-left">
           <h3 className="text-lg font-semibold mb-2 text-gray-800">Resumen de la Simulación:</h3>
           <p className="text-gray-700 whitespace-pre-line">{summaryText}</p>
         </div>
       )}
     </main>
  );
}