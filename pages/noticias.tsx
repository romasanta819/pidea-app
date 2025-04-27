// pages/noticias.tsx
import { useState, useEffect } from 'react';

interface Noticia {
  id: number;
  titulo: string;
  resumen: string;
  verificada: boolean;
}

export default function NoticiasVerificadas() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);

  useEffect(() => {
    // Datos simulados; más adelante podríamos cargar de una API
    const datosIniciales: Noticia[] = [
      {
        id: 1,
        titulo: 'Reforma tributaria en debate',
        resumen:
          'El Congreso está discutiendo una reforma que modifica las tasas de impuestos a las pymes.',
        verificada: true
      },
      {
        id: 2,
        titulo: 'Aumento del salario mínimo',
        resumen:
          'El poder ejecutivo anunció un posible aumento del salario mínimo para el próximo trimestre.',
        verificada: false
      },
      {
        id: 3,
        titulo: 'Inversión extranjera crece un 5%',
        resumen:
          'Según datos oficiales, la inversión extranjera directa aumentó un 5% respecto al año anterior.',
        verificada: true
      }
    ];
    setNoticias(datosIniciales);
  }, []);

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📰 Noticias Verificadas por IA</h1>

      <ul className="space-y-4">
        {noticias.map(({ id, titulo, resumen, verificada }) => (
          <li
            key={id}
            className="p-4 border rounded hover:shadow transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">{titulo}</h2>
              <span
                className={
                  verificada
                    ? 'px-2 py-1 text-xs font-bold text-green-800 bg-green-100 rounded'
                    : 'px-2 py-1 text-xs font-bold text-red-800 bg-red-100 rounded'
                }
              >
                {verificada ? 'Verificada' : 'No verificada'}
              </span>
            </div>
            <p className="text-gray-700">{resumen}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}