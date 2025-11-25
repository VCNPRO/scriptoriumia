import { NextRequest, NextResponse } from 'next/server';

// Definimos un tipo estricto para los documentos para evitar 'any'
interface Document {
  id: string;
  filename: string;
  status: 'processed' | 'processing' | 'failed' | string;
  uploadedAt: string;
  processedAt: string | null;
  size: number;
  type: string;
  metadata: {
    documentType: string;
    historicalPeriod: string;
    pages: number;
    confidence: number | null;
    language: string | null;
  };
  billing: {
    cost: number | null;
    processingTime: number | null;
  };
}

// Base de datos simulada en memoria (en producción sería PostgreSQL/MongoDB)
// Usamos 'const' porque la variable no se reasigna, y el tipo 'Document[]'
const documentsDatabase: Document[] = [
  {
    id: 'doc_1732206123456_abc123',
    filename: 'privilegio_real_madrid_1354.pdf',
    status: 'processed',
    uploadedAt: '2024-09-21T10:30:00Z',
    processedAt: '2024-09-21T10:32:15Z',
    size: 2450000,
    type: 'application/pdf',
    metadata: {
      documentType: 'Real Privilegio',
      historicalPeriod: 'Siglo XIV',
      pages: 1,
      confidence: 0.897,
      language: 'es-medieval'
    },
    billing: {
      cost: 0.045,
      processingTime: 2.3
    }
  },
  {
    id: 'doc_1732206223789_def456',
    filename: 'protocolo_notarial_sevilla_1598.tiff',
    status: 'processed',
    uploadedAt: '2024-09-21T09:15:00Z',
    processedAt: '2024-09-21T09:18:45Z',
    size: 15600000,
    type: 'image/tiff',
    metadata: {
      documentType: 'Protocolo Notarial',
      historicalPeriod: 'Siglo XVI',
      pages: 3,
      confidence: 0.923,
      language: 'es-clasico'
    },
    billing: {
      cost: 0.135, // 3 páginas
      processingTime: 7.8
    }
  },
  {
    id: 'doc_1732206323012_ghi789',
    filename: 'expediente_cabildo_toledo_1687.jpg',
    status: 'processing',
    uploadedAt: '2024-09-21T14:45:00Z',
    processedAt: null,
    size: 8900000,
    type: 'image/jpeg',
    metadata: {
      documentType: 'Expediente Administrativo',
      historicalPeriod: 'Siglo XVII',
      pages: 2,
      confidence: null,
      language: null
    },
    billing: {
      cost: null,
      processingTime: null
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const period = searchParams.get('period');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredDocs = [...documentsDatabase];

    // Filtros
    if (status) {
      filteredDocs = filteredDocs.filter(doc => doc.status === status);
    }

    if (period) {
      filteredDocs = filteredDocs.filter(doc =>
        doc.metadata.historicalPeriod?.toLowerCase().includes(period.toLowerCase())
      );
    }

    // Paginación
    const total = filteredDocs.length;
    const documents = filteredDocs.slice(offset, offset + limit);

    // Estadísticas
    const stats = {
      totalDocuments: documentsDatabase.length,
      processed: documentsDatabase.filter(d => d.status === 'processed').length,
      processing: documentsDatabase.filter(d => d.status === 'processing').length,
      failed: documentsDatabase.filter(d => d.status === 'failed').length,
      totalCost: documentsDatabase
        .filter(d => d.billing.cost)
        .reduce((sum, d) => sum + (d.billing.cost ?? 0), 0),
      averageConfidence: documentsDatabase
        .filter(d => d.metadata.confidence)
        .reduce((sum, d, _, arr) => sum + (d.metadata.confidence ?? 0) / arr.length, 0)
    };

    return NextResponse.json({
      documents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      stats,
      filters: {
        status: status || 'all',
        period: period || 'all'
      }
    });

  } catch (error) {
    console.error('Error al obtener documentos:', error);
    return NextResponse.json(
      { error: 'Error al obtener documentos' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    const docIndex = documentsDatabase.findIndex(doc => doc.id === documentId);

    if (docIndex === -1) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar documento
    const deletedDoc = documentsDatabase.splice(docIndex, 1)[0];

    return NextResponse.json({
      message: 'Documento eliminado correctamente',
      document: deletedDoc
    });

  } catch (error) {
    console.error('Error al eliminar documento:', error);
    return NextResponse.json(
      { error: 'Error al eliminar documento' },
      { status: 500 }
    );
  }
}