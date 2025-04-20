import { useState } from 'react';

const variablesLab = [
  'Gasto público',
  'Exportaciones',
  'Pobreza',
  'Deuda externa'
];

export default function Laboratorio() {
  const [selecciones, setSelecciones] = useState<string[]>([]);

  const toggleVariable = (variable: string) => {
    setSelecciones((prev) =>
      prev.includes(variable) ? prev.filter((v) => v !== variable) : [...prev, variable]
    );
  };

  return (
    <main className="p-8 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">🧬 Laboratorio PIDIA</h1>
      <p className="mb-6">
        Seleccioná múltiples variables para analizar su interacción. Próximamente se mostrarán gráficas combinadas.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {variablesLab.map((v) => (
          <button
            key={v}
            onClick={() => toggleVariable(v)}
            className={`p-3 rounded border ${
              selecciones.includes(v) ? 'bg-green-400 text-white' : 'bg-gray-100'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {selecciones.length > 0 && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
          <h2 className="font-semibold mb-2">Variables seleccionadas:</h2>
          <ul className="list-disc list-inside">
            {selecciones.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

