import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const variables = [
  'Gasto público',
  'Tasa de interés',
  'Importaciones',
  'Exportaciones',
  'Impuestos'
];
const acciones = ['Aumentar', 'Disminuir'];

export default function Simulador() {
  const [variable, setVariable]   = useState('');
  const [accion, setAccion]       = useState('');
  const [resultado, setResultado] = useState('');
  const [datos, setDatos]         = useState<any[]>([]);

  const simular = () => {
    if (!variable || !accion) {
      setResultado('Por favor seleccioná una variable y una acción.');
      return;
    }
    const mensaje = `${accion} ${variable}`;
    setResultado(`${mensaje}. (Simulación en desarrollo)`);

    // ejemplo de datos simulados
    const base = [100, 102, 105, 107, 110, 112, 115];
    const mult = accion === 'Aumentar' ? 1.1 : 0.9;
    const curva = base.map((v, i) => ({
      nombre: `Mes ${i + 1}`,
      pobreza: +(v / mult).toFixed(2),
      empleo:   +(v * mult).toFixed(2),
      reservas: +(v * (2 - mult)).toFixed(2)
    }));
    setDatos(curva);
  };

  return (
    <main className="p-8 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">🧪 Simulador de Decisiones</h1>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Variable:</label>
        <select
          className="w-full p-2 border rounded"
          value={variable}
          onChange={e => setVariable(e.target.value)}
        >
          <option value="">-- Elegir --</option>
          {variables.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Acción:</label>
        <select
          className="w-full p-2 border rounded"
          value={accion}
          onChange={e => setAccion(e.target.value)}
        >
          <option value="">-- Elegir --</option>
          {acciones.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <button
        onClick={simular}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Simular
      </button>

      {resultado && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p>{resultado}</p>
        </div>
      )}

      {datos.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">📈 Curva proyectada</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pobreza" stroke="#e11d48" name="Pobreza" />
              <Line type="monotone" dataKey="empleo" stroke="#2563eb" name="Empleo" />
              <Line type="monotone" dataKey="reservas" stroke="#16a34a" name="Reservas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
);
}
