// pages/laboratorio.tsx
import { useState, useEffect } from 'react';

interface Experimento {
  id: number;
  title: string;
  description: string;
  createdAt: string; // ISO date string
}

const inicial: Experimento[] = [];

export default function Laboratorio() {
  const [experimentos, setExperimentos] = useState<Experimento[]>([]);

  // Al montar, cargamos del localStorage o usamos el array inicial
  useEffect(() => {
    const raw = localStorage.getItem('labPIDIA');
    setExperimentos(raw ? (JSON.parse(raw) as Experimento[]) : inicial);
  }, []);

  // Crea un nuevo experimento vía prompt() y lo guarda
  const crearExperimento = () => {
    const title = prompt('Nombre del experimento:');
    if (!title) return;
    const description = prompt('Descripción del experimento:') || '';
    const nuevo: Experimento = {
      id: Date.now(),
      title,
      description,
      createdAt: new Date().toISOString(),
    };
    const updated = [nuevo, ...experimentos];
    setExperimentos(updated);
    localStorage.setItem('labPIDIA', JSON.stringify(updated));
  };

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Laboratorio PIDIA</h1>

      <button
        onClick={crearExperimento}
        className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Nuevo Experimento
      </button>

      {experimentos.length === 0 ? (
        <p className="text-gray-500">No hay experimentos aún.</p>
      ) : (
        <ul className="space-y-4">
          {experimentos.map((exp) => (
            <li
              key={exp.id}
              className="p-4 border rounded shadow-sm bg-white"
            >
              <h2 className="text-xl font-semibold mb-2">{exp.title}</h2>
              <p className="text-gray-700 mb-2">{exp.description}</p>
              <time className="text-sm text-gray-500">
                {new Date(exp.createdAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
