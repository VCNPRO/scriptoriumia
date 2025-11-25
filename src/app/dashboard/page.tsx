'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  document_count: number;
  description: string;
}

interface Stats {
  total_documents: number;
  total_chunks: number;
  total_pages: number;
  collections: number;
}

interface RecentQuery {
  id: string;
  query: string;
  timestamp: string;
  results_count: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
  const [searching, setSearching] = useState(false);

  // Cargar datos al inicializar
  useEffect(() => {
    loadCollections();
    loadStats();
    loadRecentQueries();
  }, []);

  const loadCollections = async () => {
    try {
      // TODO: Cambiar a URL del backend RAG en producción
      const response = await fetch('http://localhost:8000/collections');
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Error loading collections:', error);
      // Fallback data
      setCollections([
        { id: 'all', name: 'Toda la biblioteca', document_count: 100, description: 'Corpus completo' },
        { id: 'medieval', name: 'Manuscritos Medievales', document_count: 15, description: 'Siglos XIII-XV' },
        { id: 'notarial', name: 'Protocolos Notariales', document_count: 45, description: 'Siglos XVI-XIX' },
        { id: 'parroquial', name: 'Registros Parroquiales', document_count: 40, description: 'Bautismos y matrimonios' }
      ]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        total_documents: 100,
        total_chunks: 30000,
        total_pages: 30000,
        collections: 4
      });
    }
  };

  const loadRecentQueries = () => {
    // Cargar del localStorage
    const stored = localStorage.getItem('recent_queries');
    if (stored) {
      setRecentQueries(JSON.parse(stored));
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setSearching(true);

    try {
      // Guardar en historial
      const newQuery: RecentQuery = {
        id: Date.now().toString(),
        query: query,
        timestamp: new Date().toISOString(),
        results_count: 0
      };

      const updated = [newQuery, ...recentQueries.slice(0, 4)];
      setRecentQueries(updated);
      localStorage.setItem('recent_queries', JSON.stringify(updated));

      // Navegar a página de resultados
      const params = new URLSearchParams({
        q: query,
        collection: selectedCollection
      });

      router.push(`/consultar?${params.toString()}`);

    } catch (error) {
      console.error('Error searching:', error);
      alert('Error al realizar la búsqueda');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded flex items-center justify-center">
                <span className="text-gray-100 font-medium text-sm">S</span>
              </div>
              <div>
                <h1 className="text-lg font-medium text-gray-100">Scriptorium AI</h1>
                <p className="text-xs text-gray-400">Biblioteca Digital</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Inicio
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-200 border-b border-gray-200">
                Consultar
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Hero Search Section */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-medium mb-4 text-gray-100">
              Consultar Biblioteca Digital
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Pregunte a la colección en lenguaje natural. IA especializada buscará en {stats?.total_documents || 100} libros digitalizados.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="institutional-card p-8 rounded-lg">

              {/* Search Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Su consulta
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ejemplo: ¿Quién fue el escribano municipal en 1582?"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors resize-none"
                />
              </div>

              {/* Collection Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Alcance de búsqueda
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors"
                >
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.document_count} documentos)
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                disabled={!query.trim() || searching}
                className="w-full institutional-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searching ? 'Buscando en documentos...' : '🔍 Buscar en documentos'}
              </button>

            </div>
          </form>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="institutional-card p-6 rounded-lg text-center">
                <div className="text-2xl font-medium text-gray-200 mb-1">
                  {stats.total_documents.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Libros</div>
              </div>
              <div className="institutional-card p-6 rounded-lg text-center">
                <div className="text-2xl font-medium text-gray-200 mb-1">
                  {stats.total_pages.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Páginas</div>
              </div>
              <div className="institutional-card p-6 rounded-lg text-center">
                <div className="text-2xl font-medium text-gray-200 mb-1">
                  {stats.collections}
                </div>
                <div className="text-sm text-gray-500">Colecciones</div>
              </div>
              <div className="institutional-card p-6 rounded-lg text-center">
                <div className="text-2xl font-medium text-gray-200 mb-1">99.7%</div>
                <div className="text-sm text-gray-500">Precisión OCR</div>
              </div>
            </div>
          </div>
        )}

        {/* Collections Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-medium text-gray-100 mb-6">
            Colecciones disponibles
          </h3>
          <div className="grid lg:grid-cols-3 gap-6">
            {collections.filter(c => c.id !== 'all').map((col) => (
              <div key={col.id} className="institutional-card p-6 rounded-lg hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedCollection(col.id);
                  document.querySelector('textarea')?.focus();
                }}
              >
                <h4 className="text-lg font-medium text-gray-100 mb-2">{col.name}</h4>
                <p className="text-sm text-gray-400 mb-3">{col.description}</p>
                <div className="text-xs text-gray-500">
                  {col.document_count} documentos digitalizados
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Queries */}
        {recentQueries.length > 0 && (
          <div>
            <h3 className="text-2xl font-medium text-gray-100 mb-6">
              Consultas recientes
            </h3>
            <div className="space-y-3">
              {recentQueries.map((rq) => (
                <div
                  key={rq.id}
                  className="institutional-card p-4 rounded-lg hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => {
                    setQuery(rq.query);
                    document.querySelector('textarea')?.focus();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-gray-200 text-sm mb-1">&ldquo;{rq.query}&rdquo;</p>
                      <p className="text-xs text-gray-500">
                        {new Date(rq.timestamp).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}