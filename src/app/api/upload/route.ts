import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('document') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún documento' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no soportado. Formatos permitidos: PDF, JPEG, PNG, TIFF, DOC, DOCX' },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Tamaño máximo: 50MB' },
        { status: 400 }
      );
    }

    // En este punto, se podría subir el buffer a un almacenamiento en la nube.
    // Por ahora, solo simulamos el registro del documento.

    // Generar ID único para el documento
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Simular almacenamiento (aquí se integraría con cloud storage)
    const documentInfo = {
      id: documentId,
      filename: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
      processedText: null,
      metadata: {
        pages: null,
        language: null,
        confidence: null
      }
    };

    // En producción, aquí guardaríamos en base de datos
    // await saveDocumentToDatabase(documentInfo);

    return NextResponse.json({
      message: 'Documento subido correctamente',
      document: documentInfo
    });

  } catch (error) {
    console.error('Error al subir documento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de subida de documentos de Scriptorium AI',
    supportedFormats: ['PDF', 'JPEG', 'PNG', 'TIFF', 'DOC', 'DOCX'],
    maxFileSize: '50MB',
    endpoint: 'POST /api/upload'
  });
}