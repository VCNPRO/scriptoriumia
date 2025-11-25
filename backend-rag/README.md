# Scriptorium AI - Backend RAG

Backend RAG (Retrieval-Augmented Generation) para consulta de bibliotecas digitales.

## 🎯 Características

- **Ingesta de documentos**: OCR → Chunking → Embeddings → Vector DB
- **Consulta semántica**: Búsqueda en lenguaje natural con LLM
- **Prompts en español**: Con citación obligatoria de fuentes
- **Múltiples Vector DBs**: Soporta Vertex AI, Pinecone, Qdrant
- **Escalable**: Ready para Cloud Run / Lambda

## 🏗️ Arquitectura

```
┌─────────────┐
│  Frontend   │ (Next.js)
│  (Vercel)   │
└──────┬──────┘
       │ HTTP
       ↓
┌─────────────┐
│  FastAPI    │ endpoints: /query, /ingest
│ (Cloud Run) │
└──────┬──────┘
       │
       ├─→ OpenAI (embeddings + LLM)
       ├─→ Vector DB (Vertex AI / Pinecone)
       └─→ GCS (documentos)
```

## 🚀 Quick Start

### 1. Configuración

```bash
# Copiar .env
cp .env.example .env

# Editar con tus credenciales
nano .env
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Ejecutar API local

```bash
# Modo desarrollo
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# Con workers
uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 4. Ingestar documentos

```bash
# Ingestar un documento
python -m workers.ingest \
  --file ./docs/ejemplo.pdf \
  --doc-id doc_001 \
  --title "Protocolo Notarial 1582" \
  --collection notarial \
  --simple-ocr

# Con Document AI (GCP)
python -m workers.ingest \
  --file ./docs/ejemplo.pdf \
  --doc-id doc_001 \
  --title "Protocolo Notarial 1582" \
  --collection notarial
```

### 5. Probar consulta

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "¿Quién fue el escribano en 1582?",
    "scope": {"collection": "notarial"},
    "top_k": 10
  }'
```

## 📦 Deployment

### Docker local

```bash
# Build
docker build -t scriptorium-rag .

# Run
docker run -p 8000:8000 \
  --env-file .env \
  scriptorium-rag
```

### Cloud Run (GCP)

```bash
# Configurar proyecto
gcloud config set project YOUR_PROJECT_ID

# Build y push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/scriptorium-rag

# Deploy
gcloud run deploy scriptorium-rag \
  --image gcr.io/YOUR_PROJECT_ID/scriptorium-rag \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=sk-... \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300
```

### Vercel (solo frontend)

El frontend ya está en Vercel. Actualizar la URL del backend en:
- `src/app/dashboard/page.tsx`
- `src/app/consultar/page.tsx`

Cambiar `http://localhost:8000` por la URL de Cloud Run.

## 🧪 Testing

```bash
# Tests unitarios
pytest tests/

# Test de ingesta
python -m workers.ingest \
  --file ./tests/fixtures/sample.pdf \
  --doc-id test_001 \
  --title "Test Document" \
  --api-url http://localhost:8000 \
  --simple-ocr

# Test de query
python scripts/test_queries.py
```

## 📊 API Endpoints

### `GET /`
Health check

### `POST /query`
Consulta RAG

**Request:**
```json
{
  "query": "¿Quién fue el escribano en 1582?",
  "scope": {
    "collection": "notarial",
    "book_ids": ["doc_001", "doc_002"]
  },
  "top_k": 10
}
```

**Response:**
```json
{
  "query_id": "uuid",
  "query": "...",
  "answer": "El escribano fue...",
  "evidence": [
    {
      "chunk_id": "uuid",
      "document_id": "doc_001",
      "title": "Protocolo Notarial...",
      "page_number": 47,
      "chunk_text": "...",
      "score": 0.95,
      "ocr_confidence": 0.98
    }
  ],
  "metadata": {
    "latency_ms": 1234,
    "results_found": 10,
    "tokens_used": 1500
  }
}
```

### `POST /ingest`
Ingestar documento pre-procesado

**Request:**
```json
{
  "document_id": "doc_001",
  "chunks": [
    {
      "chunk_id": "uuid",
      "embedding": [0.1, 0.2, ...],
      "chunk_text": "...",
      "page_number": 1,
      "title": "...",
      "collection": "notarial"
    }
  ]
}
```

### `GET /collections`
Listar colecciones disponibles

### `GET /stats`
Estadísticas del sistema

## 📁 Estructura del proyecto

```
backend-rag/
├── api/
│   ├── main.py           # FastAPI app
│   ├── config.py         # Configuración
│   ├── embeddings.py     # OpenAI embeddings
│   ├── vectordb.py       # Vector DB interface
│   └── prompts.py        # Prompts en español
├── workers/
│   ├── ingest.py         # Pipeline de ingesta
│   ├── ocr.py            # Document AI / PyPDF
│   └── chunking.py       # Text chunking
├── scripts/
│   └── test_queries.py   # Testing de consultas
├── tests/
│   └── ...               # Unit tests
├── config/
│   └── gcp-credentials.json  # (no commiteado)
├── Dockerfile
├── requirements.txt
└── README.md
```

## 🔧 Configuración avanzada

### Cambiar Vector DB

En `.env`:
```bash
# Usar Pinecone
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...

# Usar Qdrant
QDRANT_URL=http://localhost:6333
```

En `api/vectordb.py`, modificar el factory `get_vector_db()`.

### Ajustar chunking

En `.env`:
```bash
CHUNK_SIZE=700        # Tokens por chunk
CHUNK_OVERLAP=100     # Overlap entre chunks
```

### Cambiar LLM

En `.env`:
```bash
# Usar GPT-4 Turbo
OPENAI_LLM_MODEL=gpt-4-turbo-preview

# Usar GPT-3.5 (más barato)
OPENAI_LLM_MODEL=gpt-3.5-turbo
```

## 📈 Métricas y KPIs

Ver `docs/CRONOGRAMA.md` para:
- Precision@5
- MRR (Mean Reciprocal Rank)
- Latencia p50/p95/p99
- Coste por consulta
- CER/WER OCR

## 🤝 Contribuir

Este es un proyecto interno de Scriptorium AI.

## 📄 Licencia

Propietario - Scriptorium AI Enterprise
