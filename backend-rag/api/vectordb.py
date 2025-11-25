"""
Interfaz abstracta para Vector DB con implementaciones múltiples
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from google.cloud import aiplatform
from .config import get_settings


class VectorDBInterface(ABC):
    """Interfaz abstracta para diferentes Vector DBs"""

    @abstractmethod
    async def upsert(self, chunks: List[Dict[str, Any]]) -> bool:
        """Insertar o actualizar chunks con embeddings"""
        pass

    @abstractmethod
    async def search(
        self,
        query_vector: List[float],
        top_k: int = 10,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Buscar chunks similares"""
        pass

    @abstractmethod
    async def delete(self, chunk_ids: List[str]) -> bool:
        """Eliminar chunks por IDs"""
        pass


class VertexAIVectorSearch(VectorDBInterface):
    """Implementación con Vertex AI Vector Search (GCP)"""

    def __init__(self):
        self.settings = get_settings()
        aiplatform.init(project=self.settings.google_cloud_project)
        self.index_id = self.settings.vertex_ai_index_id
        self.endpoint_id = self.settings.vertex_ai_endpoint_id

    async def upsert(self, chunks: List[Dict[str, Any]]) -> bool:
        """
        Insertar chunks en Vertex AI Vector Search

        Args:
            chunks: Lista de chunks con estructura:
                {
                    "chunk_id": str,
                    "embedding": List[float],
                    "chunk_text": str,
                    "document_id": str,
                    "title": str,
                    "page_number": int,
                    "collection": str,
                    ...metadata...
                }
        """
        try:
            index = aiplatform.MatchingEngineIndex(self.index_id)

            # Preparar datos para Vertex AI
            datapoints = []
            for chunk in chunks:
                datapoint = aiplatform.matching_engine.matching_engine_index_config.IndexDatapoint(
                    datapoint_id=chunk["chunk_id"],
                    feature_vector=chunk["embedding"],
                    restricts=[
                        {"namespace": "document_id", "allow_list": [chunk["document_id"]]},
                        {"namespace": "collection", "allow_list": [chunk.get("collection", "general")]},
                    ]
                )
                datapoints.append(datapoint)

            # Upsert batch
            index.upsert_datapoints(datapoints=datapoints)

            # Guardar metadata separadamente (Vector Search solo guarda vectores)
            # Aquí deberías guardar metadata en Firestore o Cloud SQL
            # Por simplicidad, asumimos que se hace en otro servicio

            return True

        except Exception as e:
            print(f"Error upserting to Vertex AI: {e}")
            return False

    async def search(
        self,
        query_vector: List[float],
        top_k: int = 10,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Buscar chunks similares en Vertex AI

        Args:
            query_vector: Vector de la query
            top_k: Número de resultados
            filter_metadata: Filtros (ej: {"collection": "medieval", "book_ids": [...]})

        Returns:
            Lista de chunks con metadata y score
        """
        try:
            endpoint = aiplatform.MatchingEngineIndexEndpoint(self.endpoint_id)

            # Construir filtros
            restricts = []
            if filter_metadata:
                if "collection" in filter_metadata:
                    restricts.append({
                        "namespace": "collection",
                        "allow_list": [filter_metadata["collection"]]
                    })
                if "book_ids" in filter_metadata:
                    restricts.append({
                        "namespace": "document_id",
                        "allow_list": filter_metadata["book_ids"]
                    })

            # Query
            response = endpoint.find_neighbors(
                deployed_index_id=self.endpoint_id,
                queries=[query_vector],
                num_neighbors=top_k,
                filter=restricts if restricts else None
            )

            # Extraer resultados
            results = []
            for neighbor in response[0]:
                # Aquí deberías recuperar metadata desde Firestore/SQL
                # Por ahora retornamos estructura básica
                results.append({
                    "chunk_id": neighbor.id,
                    "score": neighbor.distance,
                    # Metadata se recuperaría de BD separada
                    "chunk_text": "[recuperar de metadata store]",
                    "document_id": "[recuperar]",
                    "title": "[recuperar]",
                    "page_number": 0,
                })

            return results

        except Exception as e:
            print(f"Error searching Vertex AI: {e}")
            return []

    async def delete(self, chunk_ids: List[str]) -> bool:
        """Eliminar chunks por IDs"""
        try:
            index = aiplatform.MatchingEngineIndex(self.index_id)
            index.remove_datapoints(datapoint_ids=chunk_ids)
            return True
        except Exception as e:
            print(f"Error deleting from Vertex AI: {e}")
            return False


class SimpleInMemoryVectorDB(VectorDBInterface):
    """
    Implementación simple en memoria para desarrollo/testing
    NO USAR EN PRODUCCIÓN
    """

    def __init__(self):
        self.chunks: Dict[str, Dict[str, Any]] = {}

    async def upsert(self, chunks: List[Dict[str, Any]]) -> bool:
        """Guardar chunks en memoria"""
        for chunk in chunks:
            self.chunks[chunk["chunk_id"]] = chunk
        return True

    async def search(
        self,
        query_vector: List[float],
        top_k: int = 10,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Buscar usando similaridad de coseno simple"""
        import numpy as np

        results = []

        for chunk_id, chunk in self.chunks.items():
            # Filtrar por metadata si se especifica
            if filter_metadata:
                if "collection" in filter_metadata:
                    if chunk.get("collection") != filter_metadata["collection"]:
                        continue
                if "book_ids" in filter_metadata:
                    if chunk.get("document_id") not in filter_metadata["book_ids"]:
                        continue

            # Calcular similaridad de coseno
            embedding = chunk["embedding"]
            similarity = np.dot(query_vector, embedding) / (
                np.linalg.norm(query_vector) * np.linalg.norm(embedding)
            )

            results.append({
                **chunk,
                "score": float(similarity)
            })

        # Ordenar por score descendente
        results.sort(key=lambda x: x["score"], reverse=True)

        return results[:top_k]

    async def delete(self, chunk_ids: List[str]) -> bool:
        """Eliminar chunks de memoria"""
        for chunk_id in chunk_ids:
            self.chunks.pop(chunk_id, None)
        return True


# Factory
def get_vector_db(use_in_memory: bool = False) -> VectorDBInterface:
    """
    Obtener instancia de Vector DB

    Args:
        use_in_memory: Si True, usa implementación en memoria para testing
    """
    if use_in_memory:
        return SimpleInMemoryVectorDB()
    else:
        # Por defecto usar Vertex AI
        return VertexAIVectorSearch()
