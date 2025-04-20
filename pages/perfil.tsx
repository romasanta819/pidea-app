import { useEffect, useState } from 'react';

export default function Perfil() {
  const [usuario] = useState('romasanta');
  const [historial, setHistorial] = useState<{ accion: string; fecha: string }[]>([]);

  useEffect(() => {
    const guardado = localStorage.getItem('historialPIDIA');
    if (guardado) {
      setHistorial(JSON.parse(guardado));
    }
  }, []);

  const borrarHistorial = () => {
    localStorage.removeItem('historialPIDIA');
    setHistorial([]);
  };

  return (
    <main className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">👤 Perfil del usuario</h1>
      <p className="mb-4">Bienvenido, <strong>{usuario}</strong>. Este es tu historial de actividad:</p>

      {historial.length === 0 ? (
        <p className="text-gray-600 mb-4">No hay actividad registrada todavía.</p>
      ) : (
        <>
          <ul className="text-left mb-4">
            {historial.map((item, index) => (
              <li key={index} className="mb-3 p-3 border rounded bg-white shadow-sm">
                <p className="font-medium">{item.accion}</p>
                <p className="text-sm text-gray-600">{item.fecha}</p>
              </li>
            ))}
          </ul>
          <button
            onClick={borrarHistorial}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Borrar historial
          </button>
        </>
      )}
    </main>
  );
}

