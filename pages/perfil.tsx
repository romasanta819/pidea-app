
import { useState, useEffect } from 'react';

interface Accion {
  accion: string;
  fecha: string;
}

export default function Perfil() {
  const [historial, setHistorial] = useState<Accion[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('historialPIDIA') || '[]');
    setHistorial(data);
  }, []);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">👤 Mi Perfil</h1>
      <div className="flex items-center mb-6">
        <img
          src="/avatar.png"
          alt="Mi avatar"
          className="w-16 h-16 rounded-full mr-4"
        />
        <div>
          <p className="font-semibold">Leonardo Amilcar Romasanta</p>
          <p className="text-gray-600">Miembro de PIDIA</p>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Historial de Simulaciones</h2>
      {historial.length === 0 ? (
        <p className="text-gray-500">No hay simulaciones aún.</p>
      ) : (
        <ul className="list-disc pl-6 space-y-2">
          {historial.map((item, idx) => (
            <li key={idx}>
              <span className="font-medium">{item.fecha}:</span> {item.accion}
            </li>
          ))}
        </ul>
      )}
    </main>
);
}

