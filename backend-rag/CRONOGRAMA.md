# Scriptorium AI - Piloto RAG
## Cronograma de 4 Semanas y KPIs

---

## 📅 CRONOGRAMA DETALLADO

### **Semana 0: Preparación y Accesos** (2-3 días)

#### Objetivos:
- Configurar entornos de desarrollo y cloud
- Obtener credenciales y permisos
- Validar acceso a servicios

#### Tareas:
- [ ] Crear proyecto GCP y habilitar APIs necesarias
  - Document AI API
  - Vertex AI API
  - Cloud Storage
  - Cloud Run
- [ ] Obtener API keys:
  - OpenAI (embeddings + GPT-4)
  - Vertex AI (o Pinecone si se usa)
- [ ] Configurar buckets GCS:
  - `scriptorium-documents` (documentos fuente)
  - `scriptorium-processed` (resultados OCR)
- [ ] Configurar IAM y service accounts
  - Service account para Cloud Run
  - Permisos de lectura/escritura GCS
  - Permisos Document AI
- [ ] Clonar repositorio y configurar entorno local
- [ ] Validar connectivity con `curl` a APIs

#### Entregables:
✅ GCP proyecto configurado
✅ `.env` con todas las credenciales
✅ Backend corriendo en `localhost:8000`
✅ Frontend conectando con backend local

---

### **Semana 1: Ingesta y OCR** (5-7 días)

#### Objetivos:
- Procesar 100 libros con OCR
- Validar calidad de transcripción
- Poblar storage con PDFs procesados

#### Tareas:
- [ ] Subir 100 PDFs a GCS bucket
- [ ] Ejecutar pipeline de ingesta:
  ```bash
  for file in books/*.pdf; do
    python -m workers.ingest \
      --file $file \
      --doc-id $(basename $file .pdf) \
      --title "..." \
      --collection "..."
  done
  ```
- [ ] Monitorear métricas de OCR:
  - CER (Character Error Rate)
  - WER (Word Error Rate)
  - Páginas con confianza < 85%
- [ ] Revisar manualmente sample de 10-15 documentos
- [ ] Identificar problemas comunes (manchas, escritura ilegible, etc.)
- [ ] Ajustar parámetros de Document AI si es necesario

#### Métricas objetivo:
- **100 libros procesados** (~30,000 páginas)
- **CER promedio < 5%** (meta: documentos limpios)
- **Confianza OCR promedio > 90%**
- **< 10% páginas rechazadas por baja calidad**

#### Entregables:
✅ 100 libros en GCS
✅ Reporte de calidad OCR
✅ Identificación de documentos problemáticos
✅ Logs de procesamiento

---

### **Semana 2: Chunking, Embeddings y Vector DB** (5-7 días)

#### Objetivos:
- Chunkar texto extraído
- Generar embeddings para todos los chunks
- Poblar Vertex AI Vector Search

#### Tareas:
- [ ] Ejecutar chunking sobre texto OCR
  - Configurar: `CHUNK_SIZE=700`, `OVERLAP=100`
  - Validar que chunks sean semánticos (no corten a mitad de palabra)
- [ ] Generar embeddings batch:
  - Usar OpenAI `text-embedding-3-large`
  - Procesar ~60,000 chunks (2 chunks/página promedio)
  - Monitorear coste (embeddings ~$0.13 per 1M tokens)
- [ ] Crear índice en Vertex AI Vector Search:
  - Dimensión: 3072 (text-embedding-3-large)
  - Distancia: cosine similarity
  - Metadata filters por: `collection`, `document_id`
- [ ] Insertar vectores + metadata en Vector DB
- [ ] Ejecutar búsquedas de test para validar funcionamiento

#### Métricas objetivo:
- **~60,000 chunks creados**
- **Tamaño promedio chunk: 600-800 tokens**
- **Embeddings generados en < 2 horas** (batch)
- **Latencia búsqueda < 200ms** (p95)

#### Entregables:
✅ Todos los chunks con embeddings
✅ Vector DB poblado y operativo
✅ Test queries funcionando
✅ Reporte de costes embeddings

---

### **Semana 3: Endpoint `/query` y Ajustes** (5-7 días)

#### Objetivos:
- Implementar endpoint `/query` completo
- Ajustar prompts para máxima precisión
- Optimizar retrieval y reranking

#### Tareas:
- [ ] Implementar flujo completo:
  1. Embed query
  2. Vector search (top_k=20)
  3. (Opcional) Rerank con modelo especializado
  4. Build prompt con top_k=5-10 chunks
  5. LLM completion (GPT-4)
  6. Parse y retornar respuesta + evidencias
- [ ] Ajustar prompt template:
  - Forzar citación de fuentes
  - Prohibir hallucinations
  - Responder "No aparece..." si no hay evidencia
- [ ] Probar con 50 queries de validación:
  - Queries simples (ej: "¿Quién fue X?")
  - Queries complejas (ej: "Comparar protocolos de 1580 y 1590")
  - Queries con filtros (ej: "solo en colección medieval")
- [ ] Medir métricas:
  - Precision@5: ¿están las respuestas correctas en top 5?
  - MRR (Mean Reciprocal Rank)
  - Latencia p50/p95/p99
  - Tasa de "No aparece..." (detectar cobertura)

#### Métricas objetivo:
- **Precision@5 > 80%** (respuesta correcta en top 5 resultados)
- **MRR > 0.7**
- **Latencia p95 < 3s** (query completa)
- **Tasa hallucination < 5%**

#### Entregables:
✅ Endpoint `/query` funcional
✅ Prompts optimizados
✅ 50 queries de test ejecutadas
✅ Reporte de métricas de retrieval

---

### **Semana 4: Frontend, Bench y Entrega** (5-7 días)

#### Objetivos:
- Integrar frontend con backend
- Ejecutar bench de 200 queries
- Documentar y entregar

#### Tareas:
- [ ] Desplegar backend en Cloud Run:
  ```bash
  gcloud run deploy scriptorium-rag \
    --image gcr.io/PROJECT/scriptorium-rag \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 2Gi
  ```
- [ ] Actualizar URLs del frontend en Vercel
- [ ] Probar flujo completo end-to-end:
  - Usuario entra a `/dashboard`
  - Hace query
  - Ve resultados en `/consultar`
  - Abre visor PDF
- [ ] Ejecutar bench de 200 queries:
  ```bash
  python scripts/benchmark.py --queries test_queries.json
  ```
- [ ] Generar reporte final con:
  - Precision@5, MRR
  - Latencia (p50/p95/p99)
  - Coste por consulta
  - CER/WER promedio OCR
  - Documentos procesados exitosamente
- [ ] Documentación:
  - README con instrucciones deployment
  - Guía de uso para usuarios finales
  - Troubleshooting común

#### Métricas objetivo (bench 200 queries):
- **Precision@5 > 75%**
- **MRR > 0.65**
- **Latencia p95 < 5s**
- **Coste promedio < $0.05/query**
- **Uptime 99.9%**

#### Entregables:
✅ Backend deployado en Cloud Run
✅ Frontend actualizado en Vercel
✅ Bench de 200 queries ejecutado
✅ Reporte final con KPIs
✅ README completo
✅ Demo funcional lista

---

## 📊 KPIs DEL PILOTO

### KPIs Primarios:

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Documentos procesados** | 100 libros (~30k páginas) | Count |
| **Precision@5** | > 75% | Respuesta correcta en top 5 |
| **MRR** | > 0.65 | Mean Reciprocal Rank |
| **Latencia p95** | < 5s | Query completa end-to-end |
| **CER OCR** | < 5% | Character Error Rate |
| **Uptime** | 99.9% | Disponibilidad del servicio |

### KPIs Secundarios:

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Coste/query** | < $0.05 | Embeddings + LLM + infra |
| **Confianza OCR promedio** | > 90% | Promedio de páginas |
| **Chunks indexados** | ~60,000 | Total en Vector DB |
| **Tasa hallucination** | < 5% | Respuestas sin evidencia |
| **Tiempo ingesta/doc** | < 5 min | OCR → chunks → embeddings |

---

## 💰 ESTIMACIÓN DE COSTES

### Costes de Setup (una vez):

| Item | Cantidad | Coste unitario | Total |
|------|----------|----------------|-------|
| **OCR (Document AI)** | 30,000 páginas | $1.50/1k páginas | ~$45 |
| **Embeddings (OpenAI)** | 60k chunks × 700 tokens = 42M tokens | $0.13/1M tokens | ~$5.50 |
| **Vector DB (Vertex AI)** | Setup + indexación | Variable | ~$20 |
| **GCS Storage** | 100 libros (~5GB) | $0.02/GB/mes | ~$0.10/mes |
| **Cloud Run (testing)** | 40 horas × 2 CPU | $0.06/vCPU-hr | ~$5 |
| **TOTAL SETUP** | | | **~$75-80** |

### Costes Operacionales (por mes):

| Item | Cantidad | Coste unitario | Total |
|------|----------|----------------|-------|
| **LLM (GPT-4 queries)** | 1,000 queries/mes × 2k tokens | $0.01/1k tokens | ~$20 |
| **Vector search** | 1,000 queries/mes | Variable | ~$5 |
| **Cloud Run** | 720 hrs × 1 CPU idle | $0.03/vCPU-hr | ~$20 |
| **GCS** | 5GB | $0.02/GB | ~$0.10 |
| **TOTAL MENSUAL** | | | **~$45-50/mes** |

### Coste por Query (estimado):
- **Embedding query**: ~$0.000001 (700 tokens × $0.13/1M)
- **Vector search**: ~$0.001
- **LLM (GPT-4)**: ~$0.02 (2k tokens context + response)
- **Infra (Cloud Run)**: ~$0.001
- **TOTAL**: **~$0.022/query** ✅ (objetivo: < $0.05)

---

## 🎯 CRITERIOS DE ÉXITO

### ✅ Éxito Total:
- Todos los KPIs primarios cumplidos
- Demo funcional
- Usuarios pueden hacer queries y obtener respuestas correctas
- Coste < presupuesto

### ⚠️ Éxito Parcial:
- 80% de KPIs cumplidos
- Algunos documentos problemáticos identificados
- Necesita ajustes en prompts

### ❌ Fallo:
- < 60% de KPIs cumplidos
- OCR deficiente (CER > 10%)
- Latencia inaceptable (> 10s)
- Costes exceden 2× presupuesto

---

## 🚨 RIESGOS Y MITIGACIONES

### Riesgo 1: OCR de baja calidad
**Probabilidad**: Media
**Impacto**: Alto
**Mitigación**:
- Validar sample antes de procesar batch completo
- Usar Document AI en lugar de Tesseract
- Invertir en pre-procesamiento de imágenes (denoising)
- Revisión humana de páginas críticas

### Riesgo 2: Costes exceden presupuesto
**Probabilidad**: Media
**Impacto**: Medio
**Mitigación**:
- Usar GPT-3.5 en lugar de GPT-4 para queries simples
- Cache de respuestas frecuentes
- Limitar top_k a 5-10 en lugar de 20
- Usar embeddings más económicos (text-embedding-ada-002)

### Riesgo 3: Latencia alta
**Probabilidad**: Baja
**Impacto**: Alto
**Mitigación**:
- Optimizar vector search (usar approximate NN)
- Reducir tamaño de chunks (600 tokens en lugar de 800)
- Usar streaming de respuestas LLM
- Scale up Cloud Run (2+ CPUs)

### Riesgo 4: Hallucinations del LLM
**Probabilidad**: Media
**Impacto**: Alto
**Mitigación**:
- Prompt engineering estricto ("solo usa contexto")
- Agregar post-processing para detectar hallucinations
- Mostrar siempre evidencias al usuario
- Implementar feedback loop para reportar errores

---

## 📈 MÉTRICAS DE SEGUIMIENTO (Dashboards)

### Dashboard 1: Ingesta
- Documentos procesados (count)
- CER/WER promedio
- Páginas con baja confianza
- Tiempo de procesamiento por doc

### Dashboard 2: Retrieval
- Queries ejecutadas
- Latencia (p50/p95/p99)
- Precision@5 / MRR
- Distribución de scores

### Dashboard 3: Costes
- Coste por query
- Desglose: embeddings, LLM, infra
- Coste mensual proyectado

### Dashboard 4: Errores
- Rate de "No aparece..."
- Queries fallidas (500 errors)
- Timeout rate
- Páginas con OCR rechazado

---

## 🔄 SIGUIENTES PASOS POST-PILOTO

Si el piloto es exitoso:

1. **Escalar a 1,000 libros**
   - Validar costes a escala
   - Optimizar pipeline de ingesta

2. **Agregar funcionalidades avanzadas**
   - Búsqueda multimodal (texto + imágenes)
   - Análisis temporal ("cambios entre 1580 y 1600")
   - Extracción de entidades (personas, lugares, fechas)

3. **Mejorar UX**
   - Visor PDF integrado real
   - Highlighting de fragmentos relevantes
   - Exportar resultados (PDF, CSV)

4. **Monitoreo y observabilidad**
   - Prometheus + Grafana
   - Alertas de latencia/errores
   - User analytics

5. **Multitenancy**
   - Permitir múltiples bibliotecas/instituciones
   - Aislamiento de datos
   - Facturación por uso

---

## 📞 CONTACTOS Y SOPORTE

**Equipo técnico:**
- Backend: [email]
- Frontend: [email]
- DevOps: [email]

**Stakeholders:**
- Product Owner: [email]
- Bibliotecarios/usuarios: [email]

**Escalación:**
- Issues críticos: Slack #scriptorium-rag-urgent
- Bug tracking: GitHub Issues
- Docs: Notion workspace

---

**Última actualización**: 2024-01-15
**Versión**: 1.0
**Estado**: 🟢 En progreso (Semana 0 completada)
