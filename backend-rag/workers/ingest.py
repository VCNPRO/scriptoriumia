"""
Worker de ingesta completo
Orquesta: OCR → Chunking → Embeddings → Vector DB
"""
import asyncio
import sys
import os
from pathlib import Path
from typing import List, Dict, Any
import httpx
from dotenv import load_dotenv

# Agregar api al path
sys.path.append(str(Path(__file__).parent.parent))

from api.embeddings import get_embedding_service
from api.config import get_settings
from workers.ocr import create_ocr_service
from workers.chunking import create_chunker

load_dotenv()


class IngestPipeline:
    """Pipeline completo de ingesta"""

    def __init__(
        self,
        api_url: str = "http://localhost:8000",
        use_simple_ocr: bool = True
    ):
        """
        Args:
            api_url: URL del backend API
            use_simple_ocr: Si True, usa PyPDF; si False, usa Document AI
        """
        self.api_url = api_url
        self.settings = get_settings()

        # Servicios
        self.ocr_service = create_ocr_service(
            project_id=self.settings.google_cloud_project if not use_simple_ocr else None,
            processor_id=self.settings.document_ai_processor_id if not use_simple_ocr else None,
            use_simple=use_simple_ocr
        )

        self.chunker = create_chunker(
            chunk_size=self.settings.chunk_size,
            chunk_overlap=self.settings.chunk_overlap
        )

        self.embedding_service = get_embedding_service()

    async def ingest_document(
        self,
        file_path: str,
        document_id: str,
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Ingestar un documento completo

        Args:
            file_path: Ruta al PDF/documento
            document_id: ID único del documento
            metadata: {
                "title": str,
                "author": str,
                "collection": str,
                "language": str,
                ...
            }

        Returns:
            Resultado de la ingesta con estadísticas
        """
        print(f"\n{'='*60}")
        print(f"📄 Ingesta: {metadata.get('title', document_id)}")
        print(f"{'='*60}")

        # 1. OCR
        print("🔍 Paso 1: OCR...")
        pages = self.ocr_service.process_document(file_path)
        print(f"   ✓ {len(pages)} páginas procesadas")

        # Validar confianza mínima de OCR
        low_confidence_pages = [
            p for p in pages
            if p.get("confidence", 0) < self.settings.min_ocr_confidence
        ]
        if low_confidence_pages:
            print(f"   ⚠ {len(low_confidence_pages)} páginas con confianza baja")

        # 2. Chunking
        print("✂️  Paso 2: Chunking...")
        chunks = self.chunker.chunk_document(
            pages=pages,
            document_id=document_id,
            metadata=metadata
        )
        print(f"   ✓ {len(chunks)} chunks creados")

        # 3. Embeddings
        print("🧮 Paso 3: Generando embeddings...")
        chunk_texts = [c["chunk_text"] for c in chunks]
        embeddings = await self.embedding_service.embed_batch(chunk_texts)
        print(f"   ✓ {len(embeddings)} embeddings generados")

        # Agregar embeddings a chunks
        for chunk, embedding in zip(chunks, embeddings):
            chunk["embedding"] = embedding

        # Agregar confianza OCR por página
        page_confidences = {p["page_number"]: p["confidence"] for p in pages}
        for chunk in chunks:
            chunk["ocr_confidence"] = page_confidences.get(chunk["page_number"], 0.0)

        # 4. Enviar a API para insertar en Vector DB
        print("📤 Paso 4: Insertando en Vector DB...")
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.api_url}/ingest",
                json={
                    "document_id": document_id,
                    "chunks": chunks
                }
            )

            if response.status_code != 200:
                raise Exception(f"API error: {response.text}")

            result = response.json()
            print(f"   ✓ {result['chunks_ingested']} chunks insertados")

        # Estadísticas
        stats = {
            "document_id": document_id,
            "success": True,
            "pages_processed": len(pages),
            "chunks_created": len(chunks),
            "avg_ocr_confidence": sum(p["confidence"] for p in pages) / len(pages),
            "low_confidence_pages": len(low_confidence_pages),
            "total_tokens": sum(c["token_count"] for c in chunks)
        }

        print(f"\n✅ Ingesta completada")
        print(f"   • Páginas: {stats['pages_processed']}")
        print(f"   • Chunks: {stats['chunks_created']}")
        print(f"   • Confianza OCR: {stats['avg_ocr_confidence']:.1%}")
        print(f"{'='*60}\n")

        return stats

    async def ingest_batch(
        self,
        documents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Ingestar múltiples documentos en batch

        Args:
            documents: Lista de documentos:
                [
                    {
                        "file_path": "path/to/doc.pdf",
                        "document_id": "doc_001",
                        "metadata": {...}
                    },
                    ...
                ]

        Returns:
            Lista de resultados
        """
        print(f"\n🚀 Ingesta batch: {len(documents)} documentos\n")

        results = []
        for idx, doc in enumerate(documents, 1):
            print(f"[{idx}/{len(documents)}] ", end="")

            try:
                result = await self.ingest_document(
                    file_path=doc["file_path"],
                    document_id=doc["document_id"],
                    metadata=doc["metadata"]
                )
                results.append(result)
            except Exception as e:
                print(f"❌ Error: {e}")
                results.append({
                    "document_id": doc["document_id"],
                    "success": False,
                    "error": str(e)
                })

        # Resumen
        successful = sum(1 for r in results if r.get("success"))
        print(f"\n📊 RESUMEN BATCH")
        print(f"{'='*60}")
        print(f"Total documentos: {len(documents)}")
        print(f"Exitosos: {successful}")
        print(f"Fallidos: {len(documents) - successful}")
        print(f"{'='*60}\n")

        return results


# ============ CLI ============

async def main():
    """CLI para ingest"""
    import argparse

    parser = argparse.ArgumentParser(description="Ingest de documentos para Scriptorium RAG")
    parser.add_argument("--file", type=str, help="Ruta al archivo PDF")
    parser.add_argument("--doc-id", type=str, help="ID del documento")
    parser.add_argument("--title", type=str, help="Título del documento")
    parser.add_argument("--collection", type=str, default="general", help="Colección")
    parser.add_argument("--api-url", type=str, default="http://localhost:8000", help="URL del API")
    parser.add_argument("--simple-ocr", action="store_true", help="Usar PyPDF en lugar de Document AI")

    args = parser.parse_args()

    if not args.file or not args.doc_id or not args.title:
        print("❌ Error: Debes proporcionar --file, --doc-id y --title")
        parser.print_help()
        return

    # Verificar que el archivo existe
    if not os.path.exists(args.file):
        print(f"❌ Error: Archivo no encontrado: {args.file}")
        return

    # Crear pipeline
    pipeline = IngestPipeline(
        api_url=args.api_url,
        use_simple_ocr=args.simple_ocr
    )

    # Metadata
    metadata = {
        "title": args.title,
        "collection": args.collection,
        "language": "es"
    }

    # Ingestar
    try:
        result = await pipeline.ingest_document(
            file_path=args.file,
            document_id=args.doc_id,
            metadata=metadata
        )

        if result["success"]:
            print("✅ Ingesta exitosa!")
        else:
            print("❌ Ingesta falló")
            sys.exit(1)

    except Exception as e:
        print(f"❌ Error fatal: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
