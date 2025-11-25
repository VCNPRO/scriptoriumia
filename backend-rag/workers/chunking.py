"""
Chunking de texto con overlap
"""
import tiktoken
from typing import List, Dict, Any
import uuid


class TextChunker:
    """Chunker de texto con overlap usando tiktoken"""

    def __init__(self, chunk_size: int = 700, chunk_overlap: int = 100):
        """
        Args:
            chunk_size: Tamaño máximo del chunk en tokens
            chunk_overlap: Overlap entre chunks en tokens
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.encoding = tiktoken.get_encoding("cl100k_base")  # Para OpenAI

    def chunk_text(
        self,
        text: str,
        document_id: str,
        page_number: int,
        metadata: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Dividir texto en chunks con overlap

        Args:
            text: Texto a dividir
            document_id: ID del documento
            page_number: Número de página
            metadata: Metadata adicional del documento

        Returns:
            Lista de chunks con metadata
        """
        if not text or not text.strip():
            return []

        # Tokenizar texto completo
        tokens = self.encoding.encode(text)

        chunks = []
        start_idx = 0

        while start_idx < len(tokens):
            # Extraer chunk
            end_idx = start_idx + self.chunk_size
            chunk_tokens = tokens[start_idx:end_idx]

            # Decodificar a texto
            chunk_text = self.encoding.decode(chunk_tokens)

            # Crear chunk con metadata
            chunk = {
                "chunk_id": str(uuid.uuid4()),
                "document_id": document_id,
                "page_number": page_number,
                "chunk_text": chunk_text.strip(),
                "token_count": len(chunk_tokens),
                "start_token": start_idx,
                "end_token": end_idx,
                **(metadata or {})
            }

            chunks.append(chunk)

            # Avanzar con overlap
            start_idx += self.chunk_size - self.chunk_overlap

        return chunks

    def chunk_document(
        self,
        pages: List[Dict[str, Any]],
        document_id: str,
        metadata: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Chunkar documento completo (múltiples páginas)

        Args:
            pages: Lista de páginas con estructura:
                [
                    {"page_number": 1, "text": "contenido..."},
                    {"page_number": 2, "text": "contenido..."},
                ]
            document_id: ID del documento
            metadata: Metadata del documento (title, author, collection, etc)

        Returns:
            Lista de todos los chunks del documento
        """
        all_chunks = []

        for page in pages:
            page_number = page.get("page_number", 0)
            text = page.get("text", "")

            chunks = self.chunk_text(
                text=text,
                document_id=document_id,
                page_number=page_number,
                metadata=metadata
            )

            all_chunks.extend(chunks)

        return all_chunks


def create_chunker(chunk_size: int = 700, chunk_overlap: int = 100) -> TextChunker:
    """Factory para crear chunker con configuración"""
    return TextChunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
