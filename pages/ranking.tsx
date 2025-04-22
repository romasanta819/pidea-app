import { useEffect, useState } from 'react';

type Medida = {
  nombre: string;
  impacto: number; // valor de 0 a 100
};

export default function Ranking() {
  const [medidas, setMedidas] = useState<Medida[]>([]);

  // Simulamos la carga de datos (puede venir de una API)
  useEffect(() => {
    const datosIniciales: Medida[] = [
      { nombre: 'Aumentar gasto público', impacto: 70 },
      { nombre: 'Reducir impuestos', impacto: 55 },
      { nombre: 'Subir tasa de interés', impacto: 40 },
      { nombre: 'Incentivar exportaciones', impacto: 65 },
      { nombre: 'Control de importaciones', impacto: 50 },
    ];
    setMedidas(datosIniciales);
  }, []);

  // Ordena de mayor a menor
  const ranking = [...medidas].sort((a, b) => b.impacto - a.impacto);

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🏅 Ranking de Medidas</h1>
      <ol className="list-decimal list-inside space-y-2">
        {ranking.map((m, i) => (
          <li key={i} className="flex justify-between p-4 border rounded">
            <span>{m.nombre}</span>
            <span className="font-semibold">{m.impacto}%</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
