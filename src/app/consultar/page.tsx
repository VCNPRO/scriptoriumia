'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Evidence {
  chunk_id: string;
  document_id: string;
  title: string;
  page_number: number;
  chunk_text: string;
  score: number;
  ocr_confidence?: number;
  source_url?: string;
}

interface QueryResult {
  query_id: string;
  query: string;
  answer: string;
  evidence: Evidence[];
  metadata: {
    latency_ms: number;
    results_found: number;
    tokens_used?: number;
    estimated_cost_usd?: number;
  };
}

function ConsultarContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const collection = searchParams.get('collection') || 'all';

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  useEffect(() => {
    if (query) {
      performQuery();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, collection]);

  const performQuery = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          scope: collection !== 'all' ? { collection } : null,
          top_k: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      console.error('Error performing query:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
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
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Nueva consulta
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Query Display */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Su consulta</p>
              <p className="text-xl text-gray-100 font-medium">&ldquo;{query}&rdquo;</p>
              {collection !== 'all' && (
                <p className="text-sm text-gray-400 mt-2">
                  Buscando en: {collection}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="institutional-card p-12 rounded-lg text-center">
            <div className="inline-block w-12 h-12 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Buscando en documentos históricos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="institutional-card p-8 rounded-lg bg-red-500/10 border-red-500/50">
            <h3 className="text-lg font-medium text-red-400 mb-2">Error</h3>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={performQuery}
              className="mt-4 institutional-button-secondary"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && result && (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Main Answer */}
            <div className="lg:col-span-2 space-y-6">

              {/* Answer Card */}
              <div className="institutional-card p-8 rounded-lg">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-medium text-gray-100 mb-4">Respuesta</h2>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.answer}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-6 border-t border-gray-700/50">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Fuentes</p>
                      <p className="text-gray-200 font-medium">{result.evidence.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Latencia</p>
                      <p className="text-gray-200 font-medium">{result.metadata.latency_ms}ms</p>
                    </div>
                    {result.metadata.tokens_used && (
                      <div>
                        <p className="text-gray-500 mb-1">Tokens</p>
                        <p className="text-gray-200 font-medium">{result.metadata.tokens_used}</p>
                      </div>
                    )}
                    {result.metadata.estimated_cost_usd && (
                      <div>
                        <p className="text-gray-500 mb-1">Coste est.</p>
                        <p className="text-gray-200 font-medium">${result.metadata.estimated_cost_usd.toFixed(4)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Evidence List */}
              <div>
                <h3 className="text-xl font-medium text-gray-100 mb-4">
                  Evidencias ({result.evidence.length})
                </h3>

                <div className="space-y-3">
                  {result.evidence.map((evidence, idx) => (
                    <div
                      key={evidence.chunk_id}
                      className="institutional-card p-6 rounded-lg hover:border-gray-600 transition-colors cursor-pointer"
                      onClick={() => setSelectedEvidence(evidence)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded">
                              #{idx + 1}
                            </span>
                            <h4 className="text-sm font-medium text-gray-200">
                              {evidence.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                              p. {evidence.page_number}
                            </span>
                            <span className="text-xs text-emerald-500">
                              {(evidence.score * 100).toFixed(1)}% relevancia
                            </span>
                          </div>

                          <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                            {evidence.chunk_text}
                          </p>

                          {evidence.ocr_confidence && evidence.ocr_confidence < 0.9 && (
                            <div className="mt-2 text-xs text-yellow-500/80">
                              ⚠ OCR confianza: {(evidence.ocr_confidence * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>

                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="institutional-card p-6 rounded-lg sticky top-8">
                <h3 className="text-lg font-medium text-gray-100 mb-4">
                  Acerca de esta consulta
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Documentos analizados</p>
                    <p className="text-gray-200">{result.metadata.results_found} fragmentos</p>
                  </div>

                  <div>
                    <p className="text-gray-500 mb-1">Colecciones</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.from(new Set(result.evidence.map(e => e.title))).map((title, idx) => (
                        <span key={idx} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          {title.substring(0, 20)}...
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700/50">
                    <p className="text-gray-500 mb-2">Páginas referenciadas</p>
                    <div className="flex flex-wrap gap-2">
                      {result.evidence.slice(0, 8).map((e, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedEvidence(e)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded transition-colors"
                        >
                          p. {e.page_number}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700/50">
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="w-full institutional-button-secondary text-center"
                    >
                      Nueva consulta
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* PDF Viewer Modal */}
        {selectedEvidence && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="institutional-card rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">

              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div>
                  <h3 className="text-lg font-medium text-gray-100">{selectedEvidence.title}</h3>
                  <p className="text-sm text-gray-400">Página {selectedEvidence.page_number}</p>
                </div>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Fragmento relevante</h4>
                  <div className="bg-gray-800 p-4 rounded border border-gray-700">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {selectedEvidence.chunk_text}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Relevancia: {(selectedEvidence.score * 100).toFixed(1)}%</span>
                    {selectedEvidence.ocr_confidence && (
                      <span>OCR: {(selectedEvidence.ocr_confidence * 100).toFixed(1)}%</span>
                    )}
                  </div>
                </div>

                {/* PDF Viewer Placeholder */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 mb-2">Visor PDF</p>
                  <p className="text-sm text-gray-500">
                    En producción: aquí se mostrará el PDF en la página {selectedEvidence.page_number}
                  </p>
                  <p className="text-xs text-gray-600 mt-4">
                    Documento ID: {selectedEvidence.document_id}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ConsultarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Cargando...</div>
      </div>
    }>
      <ConsultarContent />
    </Suspense>
  );
}
