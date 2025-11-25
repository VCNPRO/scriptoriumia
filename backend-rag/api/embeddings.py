"""
Servicio de embeddings con OpenAI
"""
from openai import AsyncOpenAI
from typing import List
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential
from .config import get_settings


class EmbeddingService:
    """Servicio para generar embeddings con OpenAI"""

    def __init__(self):
        self.settings = get_settings()
        self.client = AsyncOpenAI(api_key=self.settings.openai_api_key)
        self.model = self.settings.openai_embedding_model

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def embed_text(self, text: str) -> List[float]:
        """
        Generar embedding para un texto

        Args:
            text: Texto a embeder

        Returns:
            Vector de embeddings
        """
        response = await self.client.embeddings.create(
            model=self.model,
            input=text
        )
        return response.data[0].embedding

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def embed_batch(self, texts: List[str], batch_size: int = 100) -> List[List[float]]:
        """
        Generar embeddings para múltiples textos en batch

        Args:
            texts: Lista de textos
            batch_size: Tamaño del batch para la API

        Returns:
            Lista de vectores de embeddings
        """
        all_embeddings = []

        # Procesar en batches para no exceder límites de API
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]

            response = await self.client.embeddings.create(
                model=self.model,
                input=batch
            )

            # Extraer embeddings en el orden correcto
            batch_embeddings = [item.embedding for item in response.data]
            all_embeddings.extend(batch_embeddings)

            # Small delay para evitar rate limits
            if i + batch_size < len(texts):
                await asyncio.sleep(0.1)

        return all_embeddings

    async def embed_query(self, query: str) -> List[float]:
        """
        Generar embedding optimizado para queries

        Args:
            query: Query del usuario

        Returns:
            Vector de embeddings
        """
        # Para text-embedding-3, no hay diferencia entre query/document
        # pero mantenemos el método separado por si cambiamos modelo
        return await self.embed_text(query)


# Singleton
_embedding_service = None


def get_embedding_service() -> EmbeddingService:
    """Obtener instancia singleton del servicio de embeddings"""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
