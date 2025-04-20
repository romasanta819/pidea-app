import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-8 font-sans text-center">
      <h1 className="text-4xl font-bold mb-4">PIDEA está viva 🧠🚀</h1>
      <p className="text-lg mb-8">La plataforma de simulación política basada en datos reales.</p>

      <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        <Link href="/simulador" className="block bg-blue-100 p-4 rounded-xl shadow hover:bg-blue-200">
          🧪 Simulador
        </Link>
        <Link href="/laboratorio" className="block bg-green-100 p-4 rounded-xl shadow hover:bg-green-200">
          🧬 Laboratorio PIDIA
        </Link>
        <Link href="/ranking" className="block bg-yellow-100 p-4 rounded-xl shadow hover:bg-yellow-200">
          📊 Ranking de medidas
        </Link>
        <Link href="/comparador" className="block bg-purple-100 p-4 rounded-xl shadow hover:bg-purple-200">
          🔀 Comparador político
        </Link>
        <Link href="/perfil" className="block bg-pink-100 p-4 rounded-xl shadow hover:bg-pink-200">
          👤 Perfil del usuario
        </Link>
        <Link href="/noticias" className="block bg-gray-100 p-4 rounded-xl shadow hover:bg-gray-200">
          📰 Noticias verificadas
        </Link>
      </nav>
    </main>
  );
}
