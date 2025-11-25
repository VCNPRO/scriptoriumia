"""
OCR con Google Document AI
"""
from google.cloud import documentai_v1 as documentai
from google.cloud import storage
from typing import List, Dict, Any, Optional
import os


class OCRService:
    """Servicio de OCR con Google Document AI"""

    def __init__(
        self,
        project_id: str,
        processor_id: str,
        location: str = "us"
    ):
        """
        Args:
            project_id: GCP Project ID
            processor_id: Document AI Processor ID
            location: Región del processor
        """
        self.project_id = project_id
        self.processor_id = processor_id
        self.location = location

        # Cliente Document AI
        self.client = documentai.DocumentProcessorServiceClient()

        # Nombre completo del processor
        self.processor_name = self.client.processor_path(
            project_id, location, processor_id
        )

    def process_document(
        self,
        file_path: str = None,
        file_content: bytes = None,
        mime_type: str = "application/pdf"
    ) -> List[Dict[str, Any]]:
        """
        Procesar documento con OCR

        Args:
            file_path: Ruta al archivo local
            file_content: Contenido del archivo en bytes
            mime_type: Tipo MIME del documento

        Returns:
            Lista de páginas con texto extraído:
            [
                {
                    "page_number": 1,
                    "text": "contenido...",
                    "confidence": 0.95,
                    "width": 612,
                    "height": 792
                },
                ...
            ]
        """
        # Leer contenido si se provee path
        if file_path and not file_content:
            with open(file_path, "rb") as f:
                file_content = f.read()

        if not file_content:
            raise ValueError("Must provide either file_path or file_content")

        # Crear request
        raw_document = documentai.RawDocument(
            content=file_content,
            mime_type=mime_type
        )

        request = documentai.ProcessRequest(
            name=self.processor_name,
            raw_document=raw_document
        )

        # Procesar
        result = self.client.process_document(request=request)
        document = result.document

        # Extraer texto por página
        pages = []

        for page_idx, page in enumerate(document.pages):
            # Extraer texto de la página
            page_text = self._extract_page_text(page, document.text)

            # Calcular confianza promedio
            confidence = self._calculate_page_confidence(page)

            pages.append({
                "page_number": page_idx + 1,
                "text": page_text,
                "confidence": confidence,
                "width": page.dimension.width,
                "height": page.dimension.height
            })

        return pages

    def _extract_page_text(self, page, full_text: str) -> str:
        """Extraer texto de una página específica"""
        page_text_parts = []

        # Iterar sobre bloques/párrafos/líneas
        for block in page.blocks:
            for paragraph in block.paragraphs:
                # Extraer texto del layout
                para_text = self._get_text_from_layout(paragraph.layout, full_text)
                page_text_parts.append(para_text)

        return "\n".join(page_text_parts)

    def _get_text_from_layout(self, layout, full_text: str) -> str:
        """Obtener texto desde un layout segment"""
        text_parts = []
        for segment in layout.text_anchor.text_segments:
            start_idx = int(segment.start_index) if segment.start_index else 0
            end_idx = int(segment.end_index) if segment.end_index else len(full_text)
            text_parts.append(full_text[start_idx:end_idx])
        return "".join(text_parts)

    def _calculate_page_confidence(self, page) -> float:
        """Calcular confianza promedio de OCR en la página"""
        confidences = []

        for block in page.blocks:
            if hasattr(block, 'confidence'):
                confidences.append(block.confidence)

        if not confidences:
            return 0.0

        return sum(confidences) / len(confidences)

    def process_from_gcs(
        self,
        gcs_uri: str,
        mime_type: str = "application/pdf"
    ) -> List[Dict[str, Any]]:
        """
        Procesar documento desde Google Cloud Storage

        Args:
            gcs_uri: URI de GCS (gs://bucket/path/to/file.pdf)
            mime_type: Tipo MIME

        Returns:
            Lista de páginas procesadas
        """
        # Para batch processing, usar batch_process_documents
        # Por simplicidad, aquí descargar y procesar
        storage_client = storage.Client(project=self.project_id)

        # Parsear GCS URI
        if not gcs_uri.startswith("gs://"):
            raise ValueError("GCS URI must start with gs://")

        path = gcs_uri[5:]  # Remove gs://
        bucket_name, blob_path = path.split("/", 1)

        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_path)

        # Descargar contenido
        file_content = blob.download_as_bytes()

        # Procesar
        return self.process_document(file_content=file_content, mime_type=mime_type)


class SimplePyPDFOCR:
    """
    Alternativa simple con PyPDF para PDFs con texto extraíble
    (no es OCR real, solo extracción de texto)
    """

    def process_document(self, file_path: str) -> List[Dict[str, Any]]:
        """Extraer texto de PDF usando PyPDF"""
        from pypdf import PdfReader

        reader = PdfReader(file_path)
        pages = []

        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text()

            pages.append({
                "page_number": page_idx + 1,
                "text": text,
                "confidence": 1.0,  # No es OCR, es extracción directa
                "width": float(page.mediabox.width),
                "height": float(page.mediabox.height)
            })

        return pages


def create_ocr_service(
    project_id: str = None,
    processor_id: str = None,
    use_simple: bool = False
) -> OCRService | SimplePyPDFOCR:
    """
    Factory para crear servicio de OCR

    Args:
        project_id: GCP Project ID
        processor_id: Document AI Processor ID
        use_simple: Si True, usa PyPDF simple en lugar de Document AI
    """
    if use_simple:
        return SimplePyPDFOCR()
    else:
        if not project_id or not processor_id:
            raise ValueError("Must provide project_id and processor_id for Document AI")
        return OCRService(project_id, processor_id)
