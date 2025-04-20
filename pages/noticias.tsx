const noticiasEjemplo = [
  {
    id: 1,
    titulo: 'Informe de inflación publicado por el INDEC',
    fuente: 'INDEC',
    verificada: true
  },
  {
    id: 2,
    titulo: 'Proyecto de ley de reforma tributaria presentado',
    fuente: 'Congreso de la Nación',
    verificada: true
  },
  {
    id: 3,
    titulo: 'Rumores de default según un blog sin verificar',
    fuente: 'Blog anónimo',
    verificada: false
  }
];

export default function Noticias() {
  return (
    <main className="p-8 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">📰 Noticias verificadas por IA</h1>
      <p className="mb-4">Accedé a contenido político validado por fuentes oficiales y chequeado por inteligencia artificial.</p>

      <ul className="text-left">
        {noticiasEjemplo.map((n) => (
          <li
            key={n.id}
            className={`mb-3 p-4 border rounded shadow-sm ${
              n.verificada ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <p className="font-medium">{n.titulo}</p>
            <p className="text-sm text-gray-600">Fuente: {n.fuente}</p>
            <p className={`text-xs font-semibold ${
              n.verificada ? 'text-green-700' : 'text-red-700'
            }`}>
              {n.verificada ? '✔ Verificada' : '✖ No verificada'}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
