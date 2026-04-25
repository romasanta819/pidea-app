// Página de inicio pública de POLIA

import React, { useEffect, useRef, useState } from 'react';
import LaboratorioCompleto from '../components/LaboratorioCompleto';
import ErrorBoundary from '../components/ErrorBoundary';
import ReactMarkdown from 'react-markdown';

const DOCUMENTS = [
  {
    id: 'principios',
    title: 'Declaración de Principios',
    description: 'Principios fundamentales, valores éticos y base ideológica de POLIA.',
    file: '/DECLARACION_DE_PRINCIPIOS_POLIA.md',
    icon: '📜',
    primaryGradient: 'from-blue-500 to-indigo-500',
    secondaryGradient: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'bases',
    title: 'Bases de Acción Política',
    description: 'Lineamientos programáticos, objetivos estratégicos y metodología de trabajo.',
    file: '/BASES_DE_ACCION_POLITICA_POLIA.md',
    icon: '🎯',
    primaryGradient: 'from-purple-500 to-pink-500',
    secondaryGradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 'carta',
    title: 'Carta Orgánica',
    description: 'Estructura organizativa, órganos de gobierno y normas de funcionamiento interno.',
    file: '/CARTA_ORGANICA_POLIA.md',
    icon: '⚖️',
    primaryGradient: 'from-green-500 to-emerald-500',
    secondaryGradient: 'from-green-600 to-emerald-600',
  },
] as const;

const markdownComponents = {
  h1: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold text-slate-900 mt-6 mb-4">{children}</h1>
  ),
  h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold text-slate-900 mt-6 mb-3">{children}</h2>
  ),
  h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold text-slate-900 mt-5 mb-3">{children}</h3>
  ),
  p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-slate-700 leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-700">{children}</ul>
  ),
  ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 space-y-2 mb-4 text-slate-700">{children}</ol>
  ),
  li: ({ children }: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed">{children}</li>
  ),
  a: ({ children, href }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline decoration-blue-300 hover:text-blue-700 transition"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-blue-200 pl-4 text-slate-600 italic my-4">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-slate-200" />,
};

const LandingPage: React.FC = () => {
  const [showApp, setShowApp] = useState(false);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [docContent, setDocContent] = useState('');
  const [docError, setDocError] = useState<string | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const docCache = useRef<Record<string, string>>({});
  const activeDoc = DOCUMENTS.find((doc) => doc.id === activeDocId) ?? null;

  useEffect(() => {
    if (!activeDoc) {
      setDocContent('');
      setDocError(null);
      setIsLoadingDoc(false);
      return;
    }

    const cached = docCache.current[activeDoc.id];
    if (cached) {
      setDocContent(cached);
      setDocError(null);
      setIsLoadingDoc(false);
      return;
    }

    let isMounted = true;
    setIsLoadingDoc(true);
    setDocError(null);
    setDocContent('');

    fetch(activeDoc.file)
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudo cargar el documento.');
        }
        return response.text();
      })
      .then((text) => {
        if (!isMounted) return;
        docCache.current[activeDoc.id] = text;
        setDocContent(text);
      })
      .catch(() => {
        if (!isMounted) return;
        setDocError('No se pudo cargar el documento. Intentá nuevamente más tarde.');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingDoc(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeDoc]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Banner de Maqueta/Beta */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white py-2 px-4 text-center text-sm font-semibold sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="animate-pulse">⚠️</span>
          <span>MAQUETA EN DESARROLLO - Esta es una versión preliminar. Diseño y contenido sujetos a cambios.</span>
          <span className="animate-pulse">⚠️</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-105 transition">
              <span className="text-white font-bold text-xl">PI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">POLIA</h1>
              <p className="text-xs text-slate-500">Política + Inteligencia Artificial</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#concepto" className="text-slate-700 hover:text-blue-600 transition">Concepto</a>
            <a href="#app" className="text-slate-700 hover:text-blue-600 transition">Laboratorio</a>
            <a href="#propuesta" className="text-slate-700 hover:text-blue-600 transition">Propuesta</a>
            <a href="#plataforma" className="text-slate-700 hover:text-blue-600 transition">Plataforma</a>
            <a href="#transparencia" className="text-slate-700 hover:text-blue-600 transition">Transparencia</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Política Basada en
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Evidencia Científica
            </span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Un espacio político donde cada propuesta se evalúa con metodología científica antes de aplicarse.
            Herramientas abiertas de simulación económica y social, basadas en datos oficiales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                document.getElementById('app')?.scrollIntoView({ behavior: 'smooth' });
                setShowApp(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg transform hover:scale-105"
            >
              🧪 Probar el Laboratorio
            </button>
            <a
              href="#concepto"
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transition shadow-md hover:shadow-lg"
            >
              Conocer la propuesta
            </a>
          </div>
        </div>
      </section>

      {/* PLATAFORMA - EL CORAZÓN */}
      <section id="plataforma" className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-24 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Título Principal */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-6xl mb-4 block">💎</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              Nuestra Plataforma
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              El núcleo del proyecto. Principios que guían cada decisión, cada propuesta y cada acción:
              evidencia científica, transparencia radical y democracia directa.
            </p>
          </div>

          {/* Los 7 Principios Fundamentales */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Principio 1 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all transform hover:scale-105 hover:shadow-2xl">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-bold mb-3 text-white">1. Ciencia como Base</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Toda propuesta política se evalúa mediante simulaciones y análisis científicos antes de implementarse,
                utilizando datos oficiales y metodologías verificables.
              </p>
            </div>

            {/* Principio 2 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all transform hover:scale-105 hover:shadow-2xl">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-xl font-bold mb-3 text-white">2. Transparencia Total</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Toda información gubernamental es de acceso público en tiempo real. Sin secretos,
                sin opacidad, sin discrecionalidad corrupta.
              </p>
            </div>

            {/* Principio 3 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all transform hover:scale-105 hover:shadow-2xl">
              <div className="text-4xl mb-4">🗳️</div>
              <h3 className="text-xl font-bold mb-3 text-white">3. Democracia Directa</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Mecanismos de participación ciudadana directa en decisiones importantes del estado,
                aprovechando la alta conectividad actual.
              </p>
            </div>

            {/* Principio 4 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all transform hover:scale-105 hover:shadow-2xl">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-white">4. Modernización Tecnológica</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                El estado utiliza tecnologías avanzadas para optimizar funcionamiento, eliminar burocracia
                innecesaria y garantizar eficiencia.
              </p>
            </div>

            {/* Principio 5 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all transform hover:scale-105 hover:shadow-2xl">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-3 text-white">5. Veracidad y Honestidad</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Compromiso absoluto con la verdad, rechazando el engaño, la manipulación mediática
                y la desinformación.
              </p>
            </div>

            {/* Principio 6 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all transform hover:scale-105 hover:shadow-2xl">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold mb-3 text-white">6. Acceso Libre</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Todas las herramientas de simulación, análisis y evaluación son de código abierto
                y acceso público para verificación ciudadana.
              </p>
            </div>

            {/* Principio 7 - Destacado */}
            <div className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/30 hover:border-white/50 transition-all transform hover:scale-105 hover:shadow-2xl">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-white">7. Eficiencia del Estado</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Cada acción gubernamental se evalúa científicamente para lograr la máxima eficiencia
                en el uso de recursos públicos.
              </p>
            </div>
          </div>

          {/* Compromisos Específicos */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-12">
            <h3 className="text-3xl font-bold text-center mb-8 text-white">
              Nuestros Compromisos Específicos
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Transparencia Financiera</h4>
                  <p className="text-sm text-blue-100">Publicación mensual de todos los gastos del partido</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Decisión Basada en Datos</h4>
                  <p className="text-sm text-blue-100">Ninguna medida sin evaluación científica previa</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔓</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Acceso Libre</h4>
                  <p className="text-sm text-blue-100">Todas las herramientas de código abierto</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Rendición de Cuentas</h4>
                  <p className="text-sm text-blue-100">Evaluación pública periódica con métricas objetivas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Modernización Continua</h4>
                  <p className="text-sm text-blue-100">Actualización constante de sistemas tecnológicos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Verificación Pública</h4>
                  <p className="text-sm text-blue-100">Cualquier ciudadano puede verificar nuestras propuestas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documentos Oficiales - Los 3 Requeridos Legalmente */}
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-center mb-4 text-white">
              Documentos Fundacionales Requeridos
            </h3>
            <p className="text-blue-100 text-center mb-8 max-w-2xl mx-auto">
              Los tres documentos legales necesarios para la fundación del partido según la Ley 23.298 de Partidos Políticos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
            {DOCUMENTS.map((doc, index) => (
              <div
                key={doc.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all transform hover:scale-105"
              >
                <div className="text-4xl mb-4 text-center">{doc.icon}</div>
                <h4 className="text-xl font-bold mb-3 text-center text-white">
                  {index + 1}. {doc.title}
                </h4>
                <p className="text-blue-100 mb-6 text-center text-xs leading-relaxed">{doc.description}</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveDocId(doc.id)}
                    className={`w-full bg-gradient-to-r ${doc.primaryGradient} text-white px-4 py-3 rounded-full font-semibold hover:opacity-90 transition text-center shadow-lg text-sm`}
                  >
                    👁️ Leer en la web
                  </button>
                  <a
                    href={doc.file}
                    download
                    className={`w-full bg-gradient-to-r ${doc.secondaryGradient} text-white px-4 py-3 rounded-full font-semibold hover:opacity-90 transition text-center shadow-lg text-sm`}
                  >
                    📄 Descargar
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Documentos Adicionales */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-3 text-center">📋</div>
              <h4 className="text-lg font-bold mb-2 text-center text-white">Declaración Oficial de Existencia</h4>
              <p className="text-blue-100 mb-4 text-center text-xs">
                Documento legal formal para presentar ante autoridades competentes
              </p>
              <a
                href="/DECLARACION_OFICIAL.md"
                download
                className="block w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 rounded-full font-semibold hover:from-slate-700 hover:to-slate-800 transition text-center shadow-lg text-sm"
              >
                📋 Descargar
              </a>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-3 text-center">💎</div>
              <h4 className="text-lg font-bold mb-2 text-center text-white">Plataforma Fundacional Completa</h4>
              <p className="text-blue-100 mb-4 text-center text-xs">
                Documento integrador con todos los principios, objetivos y compromisos
              </p>
              <a
                href="/PLATAFORMA_PARTIDO_CIENTIFICO.md"
                download
                className="block w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 rounded-full font-semibold hover:from-slate-700 hover:to-slate-800 transition text-center shadow-lg text-sm"
              >
                📄 Descargar
              </a>
            </div>
          </div>

          {/* Mensaje Final */}
          <div className="mt-12 text-center">
            <p className="text-xl text-blue-100 italic max-w-3xl mx-auto">
              "La política basada en evidencia científica es el futuro. La transparencia total es la base de la democracia.
              La tecnología al servicio del ciudadano es la modernización que necesitamos."
            </p>
          </div>
        </div>
      </section>

      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6">
          <div className="bg-white max-w-5xl w-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Documento fundacional</p>
                <h4 className="text-xl font-semibold text-slate-900">{activeDoc.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveDocId(null)}
                className="text-slate-500 hover:text-slate-800 transition"
              >
                ✕ Cerrar
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto">
              {isLoadingDoc && (
                <p className="text-slate-500">Cargando documento…</p>
              )}
              {!isLoadingDoc && docError && (
                <p className="text-red-600">{docError}</p>
              )}
              {!isLoadingDoc && !docError && (
                <ReactMarkdown components={markdownComponents}>{docContent}</ReactMarkdown>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <a
                href={activeDoc.file}
                download
                className="text-blue-600 font-semibold hover:text-blue-700 transition"
              >
                Descargar documento
              </a>
              <button
                type="button"
                onClick={() => setActiveDocId(null)}
                className="px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Concepto */}
      <section id="concepto" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-slate-900 mb-12">
            ¿Qué es POLIA?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="text-5xl mb-4">📊</div>
              <h4 className="text-xl font-semibold mb-3 text-slate-900">Decisión Basada en Datos</h4>
              <p className="text-slate-600 leading-relaxed">
                Cada propuesta se evalúa mediante simulaciones económicas y sociales antes de implementarse.
                Menos intuición, más evidencia verificable.
              </p>
            </div>
            <div className="p-6 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="text-5xl mb-4">🔬</div>
              <h4 className="text-xl font-semibold mb-3 text-slate-900">Metodología Científica</h4>
              <p className="text-slate-600 leading-relaxed">
                Datos oficiales (INDEC, BCRA y otras fuentes públicas) para modelar impactos reales
                y comparar alternativas de forma transparente.
              </p>
            </div>
            <div className="p-6 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="text-5xl mb-4">🌐</div>
              <h4 className="text-xl font-semibold mb-3 text-slate-900">Acceso Libre y Transparente</h4>
              <p className="text-slate-600 leading-relaxed">
                Herramientas públicas y abiertas. Cualquier ciudadano puede verificar propuestas
                y construir sus propios escenarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Section */}
      <section id="app" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">
              Laboratorio de Simulación Económica
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Probá la herramienta de simulación. Ajustá variables macro y observá cómo se propagan
              los efectos en el sistema completo, con correlaciones históricas verificables.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-full shadow-sm">
              <span className="text-yellow-800 font-semibold animate-pulse">🔧</span>
              <span className="text-yellow-800 font-semibold">Maqueta en Desarrollo</span>
              <span className="text-yellow-700 text-sm">• Versión preliminar • Estética y contenido en mejora continua</span>
            </div>
          </div>
          
          {showApp ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <ErrorBoundary>
                <LaboratorioCompleto />
              </ErrorBoundary>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-20 text-center">
              <div className="text-6xl mb-6">🧪</div>
              <h4 className="text-2xl font-semibold mb-4 text-slate-900">Laboratorio de Simulación</h4>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                Ingresá desde el botón "Probar el Laboratorio". Vas a poder ajustar variables como inflación,
                desempleo o inversión y ver cómo afectan al resto del sistema.
              </p>
              <button
                onClick={() => setShowApp(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition"
              >
                Abrir Laboratorio
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Propuesta */}
      <section id="propuesta" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-slate-900 mb-12">
            Nuestra Propuesta: Estado Online y Democracia Directa
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 rounded-xl border-l-4 border-blue-600 bg-blue-50">
                <h4 className="text-xl font-semibold mb-3 text-slate-900">📱 Estado Online</h4>
                <p className="text-slate-600">
                  Indicadores económicos, información administrativa y avance de obras públicas disponibles
                  en tiempo real. Transparencia en cada estamento gubernamental.
                </p>
              </div>
              <div className="p-6 rounded-xl border-l-4 border-green-600 bg-green-50">
                <h4 className="text-xl font-semibold mb-3 text-slate-900">🗳️ Democracia Directa</h4>
                <p className="text-slate-600">
                  Con la conectividad actual, proponemos mecanismos de participación directa
                  para decisiones clave del estado.
                </p>
              </div>
              <div className="p-6 rounded-xl border-l-4 border-purple-600 bg-purple-50">
                <h4 className="text-xl font-semibold mb-3 text-slate-900">🏗️ Obras Públicas en Vivo</h4>
                <p className="text-slate-600">
                  Seguimiento público del progreso, gastos y contratos en tiempo real.
                  Sin opacidad, sin discrecionalidad.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 rounded-xl border-l-4 border-red-600 bg-red-50">
                <h4 className="text-xl font-semibold mb-3 text-slate-900">⚖️ Modernización de la Justicia</h4>
                <p className="text-slate-600">
                  Modernización integral con procesos digitales transparentes
                  y reducción de discrecionalidad.
                </p>
              </div>
              <div className="p-6 rounded-xl border-l-4 border-yellow-600 bg-yellow-50">
                <h4 className="text-xl font-semibold mb-3 text-slate-900">📰 Independencia de los Medios</h4>
                <p className="text-slate-600">
                  Transparencia en la financiación de medios
                  y acceso libre a datos verificables para todos.
                </p>
              </div>
              <div className="p-6 rounded-xl border-l-4 border-indigo-600 bg-indigo-50">
                <h4 className="text-xl font-semibold mb-3 text-slate-900">🎯 Eficiencia del Estado</h4>
                <p className="text-slate-600">
                  Evaluación científica previa de cada acción gubernamental para optimizar recursos
                  y maximizar impacto social.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Transparencia */}
      <section id="transparencia" className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12">
            Transparencia Total
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h4 className="text-xl font-semibold mb-3">Todo Visible</h4>
              <p className="text-slate-300">
                Gastos, decisiones y contratos públicos disponibles online
                para auditoría ciudadana.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📈</div>
              <h4 className="text-xl font-semibold mb-3">Datos en Tiempo Real</h4>
              <p className="text-slate-300">
                Indicadores económicos, sociales y administrativos en tiempo real.
                Sin retrasos, sin ocultamiento.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h4 className="text-xl font-semibold mb-3">Verificación Científica</h4>
              <p className="text-slate-300">
                Propuestas verificables mediante herramientas abiertas.
                Sin secretos, sin cajas negras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-6">
            ¿Te sumas al cambio?
          </h3>
          <p className="text-xl mb-8 text-blue-100">
            La política basada en evidencia es el futuro. Sé parte del cambio ahora.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                document.getElementById('app')?.scrollIntoView({ behavior: 'smooth' });
                setShowApp(true);
              }}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition shadow-lg"
            >
              Probar el Laboratorio
            </button>
            <a
              href="mailto:contacto@partidocientifico.ar"
              className="bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-800 transition border-2 border-blue-500"
            >
              Contactarnos
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">POLIA</h4>
              <p className="text-sm">
                Política basada en evidencia.
                Transparencia total. Democracia directa.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#concepto" className="hover:text-white transition">Concepto</a></li>
                <li><a href="#app" className="hover:text-white transition">Laboratorio</a></li>
                <li><a href="#propuesta" className="hover:text-white transition">Propuesta</a></li>
                <li><a href="#transparencia" className="hover:text-white transition">Transparencia</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <p className="text-sm">
                Email: contacto@partidocientifico.ar
              </p>
              <p className="text-sm mt-2">
                Todas nuestras herramientas son de código abierto y acceso libre.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} POLIA. Todos los derechos reservados.</p>
            <p className="mt-2">Código abierto • Transparencia total • Democracia directa</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

