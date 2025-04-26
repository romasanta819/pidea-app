// pages/comparador.tsx
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface PuntoSim {
  nombre: string;
  pobreza: number;
  empleo: number;
  reservas: number;
}

const variables = [
  'Gasto público',
  'Tasa de interés',
  'Importaciones',
  'Exportaciones',
  'Impuestos'
];
const acciones = ['Aumentar', 'Disminuir'];

export default function Comparador() {
  const [var1, setVar1] = useState('');
  const [accion1, setAccion1] = useState('');
  const [datos1, setDatos1] = useState<PuntoSim[]>([]);

  const [var2, setVar2] = useState('');
  const [accion2, setAccion2] = useState('');
  const [datos2, setDatos2] = useState<PuntoSim[]>([]);

  const [error, setError] = useState('');

  // Función genérica para generar la curva
  const generarCurva = (accion: string, variable: string): PuntoSim[] => {
    const base = [100, 102, 105, 107, 110, 112, 115];
    const mult = accion === 'Aumentar' ? 1.1 : 0.9;
    return base.map((v, i) => ({
      nombre: `Mes ${i + 1}`,
      pobreza: +(v / mult).toFixed(2),
      empleo: +(v * mult).toFixed(2),
      reservas: +(v * (2 - mult)).toFixed(2)
    }));
  };

  const comparar = () => {
    if (!var1 || !accion1 || !var2 || !accion2) {
      setError('Por favor completá ambas variables y sus acciones.');
      return;
    }
    setError('');
    setDatos1(generarCurva(accion1, var1));
    setDatos2(generarCurva(accion2, var2));
  };

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">⚖️ Comparador de Propuestas</h1>

      {error && (
        <div className="mb-4 text-red-600 font-medium">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block mb-1 font-semibold">Propuesta 1 – Variable</label>
          <select
            value={var1}
            onChange={e => setVar1(e.target.value)}
            className="w-full p-2 border rounded mb-3"
          >
            <option value="">-- Elegir variable --</option>
            {variables.map(v => <option key={v} value={v}>{v}</option>)}
          </select>

          <label className="block mb-1 font-semibold">Propuesta 1 – Acción</label>
          <select
            value={accion1}
            onChange={e => setAccion1(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Elegir acción --</option>
            {acciones.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Propuesta 2 – Variable</label>
          <select
            value={var2}
            onChange={e => setVar2(e.target.value)}
            className="w-full p-2 border rounded mb-3"
          >
            <option value="">-- Elegir variable --</option>
            {variables.map(v => <option key={v} value={v}>{v}</option>)}
          </select>

          <label className="block mb-1 font-semibold">Propuesta 2 – Acción</label>
          <select
            value={accion2}
            onChange={e => setAccion2(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Elegir acción --</option>
            {acciones.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={comparar}
        className="mb-6 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Comparar
      </button>

      {(datos1.length > 0 || datos2.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Propuesta 1: {accion1} {var1}</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={datos1}>
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
          <div>
            <h2 className="text-xl font-semibold mb-2">Propuesta 2: {accion2} {var2}</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={datos2}>
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
        </div>
      )}
    </main>
);
}
