import { useEffect, useState } from 'react';

interface Medida {
  id: string;
  titulo: string;
  votos: number;
}

export default function RankingMedidas() {
  const [medidas, setMedidas] = useState<Medida[]>([]);

  useEffect(() => {
    // Cargar ranking desde localStorage o API
    const almacen = JSON.parse(localStorage.getItem('rankingPIDIA') || '[]');
    const inicial: Medida[] = almacen.length ? almacen : [
      { id: '1', titulo: 'Aumentar gasto público', votos: 12 },
      { id: '2', titulo: 'Reducir impuestos', votos: 9 },
      { id: '3', titulo: 'Cerrar importaciones', votos: 7 },
      { id: '4', titulo: 'Fomentar exportaciones', votos: 5 }
    ];
    // Ordenar descendente por votos
    const ordenado = inicial.sort((a, b) => b.votos - a.votos);
    setMedidas(ordenado);
  }, []);

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🏅 Ranking de Medidas</h1>
      <ul className="space-y-4">
        {medidas.map((m, idx) => (
          <li
            key={m.id}
            className="flex justify-between items-center p-4 border rounded hover:bg-gray-50"
          >
            <span className="font-medium">{idx + 1}. {m.titulo}</span>
            <span className="text-blue-600 font-bold">{m.votos} votos</span>
          </li>
        ))}
      </ul>
    </main>
  );
}