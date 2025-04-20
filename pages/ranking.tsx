import { useState, useEffect } from 'react';

type Medida = { nombre: string; votos: number; };

const medidasIniciales: Medida[] = [
  { nombre: 'Gasto público', votos: 10 },
  { nombre: 'Tasa de interés', votos: 8 },
  { nombre: 'Importaciones', votos: 5 },
  { nombre: 'Exportaciones', votos: 12 },
  { nombre: 'Impuestos', votos: 7 },
];

export default function Ranking() {
  const [medidas, setMedidas] = useState<Medida[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('rankingPIDIA') || 'null');
    setMedidas(stored ?? medidasIniciales);
  }, []);

  const sorted = [...medidas].sort((a, b) => b.votos - a.votos);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🏆 Ranking de Medidas</h1>
      <ul className="space-y-2">
        {sorted.map((m, i) => (
          <li
            key={i}
            className="flex justify-between p-4 bg-white rounded shadow"
          >
            <span>{m.nombre}</span>
            <span className="font-bold">{m.votos} votos</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
