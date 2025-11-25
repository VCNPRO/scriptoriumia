
'use client'; // Necesario para componentes con interactividad en Next.js App Router

import React, { useState } from 'react';

// --- Estilos del componente ---
const styles = {
  container: {
    maxWidth: '700px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#1f2937', // gray-800
    borderRadius: '8px',
    border: '1px solid #374151', // gray-700
  },
  title: {
    textAlign: 'center' as const,
    color: '#d1d5db', // gray-300
    fontSize: '24px',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#111827', // gray-900
    border: '1px solid #374151', // gray-700
    borderRadius: '4px',
    color: '#f3f4f6', // gray-100
    fontSize: '16px',
    marginBottom: '10px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3b82f6', // blue-500
    color: '#f3f4f6', // gray-100
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#4b5563', // gray-600
    cursor: 'not-allowed',
  },
  responseContainer: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#111827', // gray-900
    borderRadius: '4px',
    border: '1px solid #374151', // gray-700
  },
  responseText: {
    color: '#f3f4f6', // gray-100
    whiteSpace: 'pre-wrap' as const, // Para respetar saltos de línea y formato
  },
  errorText: {
    color: '#f87171', // red-400
  },
};

const RAGSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query || isLoading) return;

    setIsLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ocurrió un error en la respuesta del servidor.');
      }

      const data = await response.json();
      setAnswer(data.answer);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Búsqueda en la Biblioteca</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Pregúntale cualquier cosa a los documentos de la biblioteca..."
        style={styles.input}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button
        onClick={handleSearch}
        disabled={isLoading || !query}
        style={{ ...styles.button, ...(isLoading || !query ? styles.buttonDisabled : {}) }}
      >
        {isLoading ? 'Buscando...' : 'Buscar'}
      </button>

      {error && (
        <div style={styles.responseContainer}>
          <p style={{ ...styles.responseText, ...styles.errorText }}>Error: {error}</p>
        </div>
      )}

      {answer && (
        <div style={styles.responseContainer}>
          <p style={styles.responseText}>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default RAGSearch;
