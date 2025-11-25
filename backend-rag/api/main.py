"""
Backend RAG - FastAPI Main
Scriptorium AI - Biblioteca Digital
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from openai import AsyncOpenAI
import uuid

from .config import get_settings, Settings
from .embeddings import get_embedding_service, EmbeddingService
from .vectordb import get_vector_db, VectorDBInterface
from .prompts import build_full_prompt

# App
app = FastAPI(
    title="Scriptorium AI - RAG Backend",
    description="Backend RAG para consulta de bibliotecas digitales",
    version="1.0.0"
)

# CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ MODELS ============

class QueryRequest(BaseModel):
    """Request para endpoint /query"""
    query: str = Field(..., description="Pregunta en lenguaje natural")
    scope: Optional[Dict[str, Any]] = Field(
        None,
        description="Filtros de alcance: {'collection': 'medieval', 'book_ids': [...]}"
    )
    top_k: int = Field(10, ge=1, le=50, description="Número de resultados a retornar")


class Evidence(BaseModel):
    """Evidencia de un chunk encontrado"""
    chunk_id: str
    document_id: str
    title: str
    page_number: int
    chunk_text: str
    score: float
    ocr_confidence: Optional[float] = None
    source_url: Optional[str] = None  # URL al visor PDF


class QueryResponse(BaseModel):
    """Response del endpoint /query"""
    query_id: str
    query: str
    answer: str
    evidence: List[Evidence]
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata adicional (latencia, tokens, coste estimado)"
    )


class IngestRequest(BaseModel):
    """Request para endpoint /ingest"""
    document_id: str
    chunks: List[Dict[str, Any]] = Field(
        ...,
        description="Lista de chunks con texto, metadata y embeddings pre-generados"
    )


class IngestResponse(BaseModel):
    """Response del endpoint /ingest"""
    success: bool
    document_id: str
    chunks_ingested: int
    message: str


class HealthResponse(BaseModel):
    """Response del health check"""
    status: str
    version: str
    vector_db: str
    embeddings: str


# ============ DEPENDENCIES ============

def get_openai_client() -> AsyncOpenAI:
    """Dependency: OpenAI client"""
    return AsyncOpenAI(api_key=settings.openai_api_key)


def get_embedding_service_dep() -> EmbeddingService:
    """Dependency: Embedding service"""
    return get_embedding_service()


def get_vector_db_dep() -> VectorDBInterface:
    """Dependency: Vector DB"""
    # Por defecto usar in-memory para desarrollo
    # En producción cambiar a: get_vector_db(use_in_memory=False)
    return get_vector_db(use_in_memory=True)


# ============ ENDPOINTS ============

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check"""
    return HealthResponse(
        status="operational",
        version="1.0.0",
        vector_db="in-memory (dev)",  # Cambiar en producción
        embeddings="OpenAI text-embedding-3-large"
    )


@app.post("/query", response_model=QueryResponse)
async def query_documents(
    request: QueryRequest,
    embedding_service: EmbeddingService = Depends(get_embedding_service_dep),
    vector_db: VectorDBInterface = Depends(get_vector_db_dep),
    openai_client: AsyncOpenAI = Depends(get_openai_client)
):
    """
    Endpoint principal de consulta RAG

    Flujo:
    1. Embed query
    2. Vector search con filtros
    3. Build prompt con contexto
    4. LLM completion
    5. Retornar respuesta + evidencias
    """
    import time
    start_time = time.time()

    try:
        # 1. Generar embedding de la query
        query_vector = await embedding_service.embed_query(request.query)

        # 2. Buscar chunks similares en Vector DB
        results = await vector_db.search(
            query_vector=query_vector,
            top_k=request.top_k,
            filter_metadata=request.scope
        )

        if not results:
            return QueryResponse(
                query_id=str(uuid.uuid4()),
                query=request.query,
                answer="No aparece en los documentos proporcionados.",
                evidence=[],
                metadata={
                    "latency_ms": int((time.time() - start_time) * 1000),
                    "results_found": 0
                }
            )

        # 3. Construir prompt
        system_prompt, user_prompt = build_full_prompt(request.query, results)

        # 4. Llamar a LLM
        completion = await openai_client.chat.completions.create(
            model=settings.openai_llm_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )

        answer = completion.choices[0].message.content

        # 5. Construir evidencias
        evidence = [
            Evidence(
                chunk_id=r.get("chunk_id", ""),
                document_id=r.get("document_id", ""),
                title=r.get("title", "Documento sin título"),
                page_number=r.get("page_number", 0),
                chunk_text=r.get("chunk_text", ""),
                score=r.get("score", 0.0),
                ocr_confidence=r.get("ocr_confidence"),
                source_url=f"/viewer/{r.get('document_id')}?page={r.get('page_number')}"
            )
            for r in results
        ]

        # Metadata
        latency_ms = int((time.time() - start_time) * 1000)
        tokens_used = completion.usage.total_tokens

        return QueryResponse(
            query_id=str(uuid.uuid4()),
            query=request.query,
            answer=answer,
            evidence=evidence,
            metadata={
                "latency_ms": latency_ms,
                "results_found": len(results),
                "tokens_used": tokens_used,
                "estimated_cost_usd": tokens_used * 0.00001  # Estimación rough
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@app.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    request: IngestRequest,
    vector_db: VectorDBInterface = Depends(get_vector_db_dep)
):
    """
    Endpoint para ingestar documentos pre-procesados

    Esperado:
    - Chunks ya con embeddings generados
    - Metadata completa (title, page, collection, etc)

    El worker de ingesta debe llamar a este endpoint después de:
    1. OCR del documento
    2. Chunking del texto
    3. Generación de embeddings
    """
    try:
        # Validar que chunks tengan estructura correcta
        required_fields = ["chunk_id", "embedding", "chunk_text", "page_number"]
        for chunk in request.chunks:
            for field in required_fields:
                if field not in chunk:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Missing required field '{field}' in chunk"
                    )

        # Insertar en Vector DB
        success = await vector_db.upsert(request.chunks)

        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to insert chunks into vector DB"
            )

        return IngestResponse(
            success=True,
            document_id=request.document_id,
            chunks_ingested=len(request.chunks),
            message=f"Successfully ingested {len(request.chunks)} chunks"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ingesting document: {str(e)}")


@app.get("/collections")
async def list_collections():
    """
    Listar colecciones disponibles

    En producción esto vendría de metadata store (Firestore/SQL)
    """
    # Mock data para desarrollo
    return {
        "collections": [
            {
                "id": "all",
                "name": "Toda la biblioteca",
                "document_count": 100,
                "description": "Corpus completo de documentos digitalizados"
            },
            {
                "id": "medieval",
                "name": "Manuscritos Medievales",
                "document_count": 15,
                "description": "Manuscritos de los siglos XIII-XV"
            },
            {
                "id": "notarial",
                "name": "Protocolos Notariales",
                "document_count": 45,
                "description": "Protocolos notariales siglos XVI-XIX"
            },
            {
                "id": "parroquial",
                "name": "Registros Parroquiales",
                "document_count": 40,
                "description": "Libros de bautismos, matrimonios y defunciones"
            }
        ]
    }


@app.get("/stats")
async def get_stats(vector_db: VectorDBInterface = Depends(get_vector_db_dep)):
    """
    Estadísticas del sistema

    En producción esto vendría de observabilidad real
    """
    # Mock stats para desarrollo
    return {
        "total_documents": 100,
        "total_chunks": 30000,
        "total_pages": 30000,
        "avg_chunk_size": 700,
        "collections": 4,
        "last_update": "2024-01-15T10:30:00Z",
        "index_health": "healthy"
    }


# ============ STARTUP ============

@app.on_event("startup")
async def startup_event():
    """Inicialización al arrancar"""
    print("=" * 60)
    print("🚀 Scriptorium AI - RAG Backend")
    print("=" * 60)
    print(f"Vector DB: In-Memory (Development)")
    print(f"Embeddings: OpenAI {settings.openai_embedding_model}")
    print(f"LLM: OpenAI {settings.openai_llm_model}")
    print(f"CORS Origins: {settings.cors_origins}")
    print("=" * 60)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )
