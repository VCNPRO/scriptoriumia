
import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Configuración de Clientes (se inicializan una vez) ---
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
const generativeModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: NextRequest) {
  // Validar que las claves de API están presentes
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX || !process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Variables de entorno del servidor no configuradas correctamente.' },
      { status: 500 }
    );
  }
  
  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Parámetro "query" (pregunta del usuario) es requerido.' },
        { status: 400 }
      );
    }

    // 1. Vectorizar la pregunta del usuario
    console.log('Vectorizando la pregunta del usuario...');
    const embedQueryResult = await embeddingModel.embedContent(query);
    const queryEmbedding = embedQueryResult.embedding.values;

    // 2. Buscar en Pinecone
    console.log('Buscando documentos relevantes en Pinecone...');
    const index = pinecone.index(process.env.PINECONE_INDEX!)
    const pineconeQueryResult = await index.query({
      vector: queryEmbedding,
      topK: 5, // Aumentamos a 5 para más contexto
      includeMetadata: true,
    });

    // 3. Construir el contexto para Gemini
    let context = '';
    if (pineconeQueryResult.matches && pineconeQueryResult.matches.length > 0) {
      context = pineconeQueryResult.matches
        .map(match => (match.metadata as { text: string }).text)
        .join('\n\n---\n\n'); // Separador más claro
    }

    if (!context) {
      console.warn('No se encontró contexto relevante en Pinecone.');
      const result = await generativeModel.generateContent(`Responde brevemente a esta pregunta: "${query}". Si no tienes información sobre ello, indica que no has encontrado datos en los documentos.`);
      const textResponse = result.response.text();
      return NextResponse.json({ answer: textResponse, source: 'Respuesta generada sin contexto específico.' });
    }

    // 4. Generar la respuesta con Gemini (RAG)
    console.log('Generando respuesta con Gemini usando el contexto recuperado...');
    const prompt = `Basándote ÚNICAMENTE en el siguiente contexto extraído de una biblioteca de documentos, responde de forma concisa a la pregunta del usuario. Si la respuesta no está en el contexto, indica claramente que la información no se encuentra en los documentos consultados.

Contexto:
${context}

Pregunta: "${query}"

Respuesta Concisa:`

    const result = await generativeModel.generateContent(prompt);
    const textResponse = result.response.text();

    return NextResponse.json({ answer: textResponse, source: 'Respuesta basada en documentos de la biblioteca.' });

  } catch (error: unknown) {
    console.error('Error en la ruta /api/ask:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar tu solicitud.', details: errorMessage },
      { status: 500 }
    );
  }
}
