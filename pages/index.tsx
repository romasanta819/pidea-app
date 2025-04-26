// pages/index.tsx
import Link from 'next/link';
import { ReactElement } from 'react';

interface NavItem {
  label: string;
  href: string;
  description: string;
}

const items: NavItem[] = [
  { label: 'Simulador',      href: '/simulador',    description: 'Proyecta curvas según decisiones' },
  { label: 'Ranking',        href: '/ranking',      description: 'Ordena medidas por impacto'   },
  { label: 'Perfil',         href: '/perfil',       description: 'Tu historial y avatar'          },
  { label: 'Noticias IA',    href: '/noticias',     description: 'Verifica hechos con IA'         },
  { label: 'Laboratorio',    href: '/laboratorio',  description: 'Crea y guarda experimentos'     },
  { label: 'Comparador',     href: '/comparador',   description: 'Compara dos propuestas'         },
];

export default function Home(): ReactElement {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">🌐 Bienvenido a PIDIA</h1>
      <p className="text-center text-gray-600 mb-12">
        Elige una sección para explorar las herramientas de inteligencia cívica.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-semibold mb-2">{item.label}</h2>
            <p className="text-gray-500">{item.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
