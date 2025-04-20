import { useState } from 'react';

const programas = [
  {
    nombre: 'Programa A',
    medidas: ['Aumento del gasto en salud', 'Reducción de impuestos a pymes', 'Impulso a exportaciones']
  },
  {
    nombre: 'Programa B',
    medidas: ['Ajuste fiscal', 'Reducción de subsidios', 'Incremento de la tasa de interés']
  },
  {
    nombre: 'Programa C',
    medidas: ['Expansión de infraestructura', 'Créditos a cooperativas', 'Estímulo a la inversión extranjera']
  }
];

export default function Comparador() {
  const [seleccionado, setSeleccionado] = useState('');

  const programa = programas.find((p) => p.nombre === seleccionado);

  const registrarComparacion = (nombre: string) => {
    const nuevaAccion = {
      accion: `Comparación: análisis del ${nombre}`,
      fecha: new Date().toISOString().split('T')[0]
    };
    const historial = JSON.parse(localStorage.getItem('historialPIDIA') || '[]');
    historial.unshift(nuevaAccion);
    localStorage.setItem('historialPIDIA', JSON.stringify(historial.slice(0, 10)));
    alert('Comparación registrada en tu perfil ✅');
  };

  return (
    <main className="p-8 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">🔀 Comparador político</h1>
      <p className="mb-4">Seleccioná un programa de gobierno para ver sus medidas clave.</p>

      <select
        value={seleccionado}
        onChange={(e) => setSeleccionado(e.target.value)}
        className="w-full p-2 mb-6 border rounded"
      >
        <option value="">-- Elegí un programa --</option>
        {programas.map((p) => (
          <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
        ))}
      </select>

      {programa && (
        <div className="text-left bg-gray-50 p-4 border rounded">
          <h2 className="font-semibold mb-2">Medidas de {programa.nombre}:</h2>
          <ul className="list-disc list-inside mb-4">
            {programa.medidas.map((m, index) => (
              <li key={index}>{m}</li>
            ))}
          </ul>
          <button
            onClick={() => registrarComparacion(programa.nombre)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Registrar comparación
          </button>
        </div>
      )}
    </main>
  );
}
