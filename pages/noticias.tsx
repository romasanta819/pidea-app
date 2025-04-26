// pages/noticias.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Noticia {
  id: number;
  titulo: string;
  resumen: string;
  fecha: string;       // ISO date string
  verificado: boolean; // true si la IA confirmó la veracidad
  enlace: string;      // URL al artículo original
}

const noticiasIniciales: Noticia[] = [
  {
    id: 1,
    titulo: 'Nueva reforma laboral aprobada',
    resumen: 'La cámara de diputados sancionó hoy una reforma histórica que…',
    fecha: '2025-04-10',
    verificado: true,
    enlace: 'https://fuenteoficial.gob.ar/reforma-laboral'
  },
  {
    id: 2,
    titulo: 'Protestas en la capital por incremento de tarifas',
    resumen: 'Miles de personas se movilizaron para reclamar una revisión…',
    fecha: '2025-04-09',
    verificado: false,
    enlace: 'https://diariosindical.com/protestas-tarifas'
  },
  {
    id: 3,
    titulo: 'Descubrimiento científico mejora expectativa de vida',
    resumen: 'Un estudio internacional revela un tratamiento que…',
    fecha: '2025-04-08',
    verificado: true,
    enlace: 'https://revistacientifica.org/vida-mejorada'
  },
];

export default function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);

  useEffect(() => {
    // Simulamos carga desde un API o localStorage
    setNoticias(noticiasIniciales);
  }, []);

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📰 Noticias Verificadas por IA</h1>
      {noticias.map((n) => (
        <article key={n.id} className="mb-6 p-6 bg-white rounded-lg shadow-md">
          <header className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold">{n.titulo}</h2>
            {n.verificado ? (
              <span className="flex items-center text-green-600 font-medium">
                ✅ Verificado
              </span>
            ) : (
              <span className="flex items-center text-red-600 font-medium">
                ❌ No verificado
              </span>
            )}
          </header>
          <p className="text-gray-700 mb-4">{n.resumen}</p>
          <footer className="flex items-center justify-between text-sm text-gray-500">
            <time dateTime={n.fecha}>
              {new Date(n.fecha).toLocaleDateString()}
            </time>
            <a
              href={n.enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              Leer más
            </a>
          </footer>
        </article>
      ))}
    </main>
);
}
