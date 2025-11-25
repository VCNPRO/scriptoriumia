"""
Configuración centralizada para el backend RAG
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Configuración de la aplicación"""

    # OpenAI
    openai_api_key: str
    openai_embedding_model: str = "text-embedding-3-large"
    openai_llm_model: str = "gpt-4-turbo-preview"

    # Google Cloud
    google_cloud_project: str
    gcs_bucket_name: str
    document_ai_processor_id: str | None = None
    vertex_ai_index_id: str | None = None
    vertex_ai_endpoint_id: str | None = None

    # Vector DB alternativas
    pinecone_api_key: str | None = None
    pinecone_environment: str | None = None
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str | None = None

    # API Config
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_workers: int = 4
    cors_origins: str = "http://localhost:3000"

    # RAG Config
    chunk_size: int = 700
    chunk_overlap: int = 100
    top_k_results: int = 10
    rerank_top_k: int = 5
    min_ocr_confidence: float = 0.85

    # Límites
    max_documents_per_batch: int = 100
    max_query_tokens: int = 2000

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Obtener configuración singleton"""
    return Settings()
