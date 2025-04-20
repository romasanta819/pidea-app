import { useState } from 'react';

const medidasEjemplo = [
  { id: 1, descripcion: 'Reducir impuestos al sector PYME', votos: 124 },
  { id: 2, descripcion: 'Aumentar inversión en salud pública', votos: 312 },
  { id: 3, descripcion: 'Eliminar subsidios a combustibles fósiles', votos: 201 }
];

export default function Ranking() {
  const [orden, setOrden] = useState<'asc' | 'desc'>('desc');

  const medidasOrdenadas = [...medidasEjemplo].sort((a, b) =>
    orden === 'desc' ? b.votos - a.votos : a.votos - b.votos
  );

  const votar = (descripcion: string) => {
    const nuevaAccion = {
      accion: `Votación: apoyo a "${descripcion}"`,
      fecha: new Date().toISOString().split('T')[0]
    };
    const historial = JSON.parse(localStorage.getItem('historialPIDIA') || '[]');
    historial.unshift(nuevaAccion);
    localStorage.setItem('historialPIDIA', JSON.stringify(historial.slice(0, 10)));
    alert('Tu voto fue registrado en el perfil ✅');
  };

  return (
    <main className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">📊 Ranking de medidas</h1>
      <p className="mb-4">Explorá las propuestas más votadas por la comunidad.</p>

      <div className="mb-4">
        <label className="font-semibold mr-2">Ordenar por votos:</label>
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as 'asc' | 'desc')}
          className="p-2 border rounded"
        >
          <option value="desc">Mayor a menor</option>
          <option value="asc">Menor a mayor</option>
        </select>
      </div>

      <ul className="text-left">
        {medidasOrdenadas.map((medida) => (
          <li
            key={medida.id}
            className="mb-3 p-3 border rounded bg-white shadow-sm"
          >
            <p className="font-medium">{medida.descripcion}</p>
            <p className="text-sm text-gray-600 mb-2">Votos: {medida.votos}</p>
            <button
              onClick={() => votar(medida.descripcion)}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Votar
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}


