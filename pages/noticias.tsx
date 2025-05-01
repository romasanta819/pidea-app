// pages/noticias.tsx
import { useState, useEffect } from 'react';

interface Noticia {
  id: number;
  titulo: string;
  resumen: string;
  fecha: string;      // ISO, e.g. "2025-04-27"
  verificado: boolean;
}

const noticiasIniciales: Noticia[] = [
  {
    id: 1,
    titulo: 'El IPC sube un 3,2% en el último trimestre',
    resumen: 'El índice de precios al consumidor mostró una aceleración debido al aumento de los precios de la energía y los alimentos.',
    fecha: '2025-04-10',
    verificado: true,
  },
  {
    id: 2,
    titulo: 'Gobierno anuncia nuevo plan de infraestructura',
    resumen: 'Se destinarán 50.000 millones de pesos a obras públicas en rutas, puentes y hospitales.',
    fecha: '2025-04-15',
    verificado: false,
  },
  {
    id: 3,
    titulo: 'Exportaciones crecen un 12% interanual',
    resumen: 'Las ventas al exterior de bienes primarios y manufacturados impulsaron el crecimiento de las exportaciones.',
    fecha: '2025-04-20',
    verificado: true,
  },
];

export default function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);

  useEffect(() => {
    // Cargamos las noticias iniciales (simula una llamada a API)
    setNoticias(noticiasIniciales);
  }, []);

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📰 Noticias Verificadas</h1>
      <ul className="space-y-6">
        {noticias.map((n) => (
          <li key={n.id} className="p-4 border rounded shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{n.titulo}</h2>
              <span
                className={
                  n.verificado
                    ? 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded'
                    : 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded'
                }
              >
                {n.verificado ? 'Verificado' : 'No verificado'}
              </span>
            </div>
            <p className="text-gray-700 mb-1">{n.resumen}</p>
            <p className="text-gray-500 text-sm">Fecha: {n.fecha}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
