"""
Prompts en español para el LLM con citación obligatoria
"""

SYSTEM_PROMPT = """Eres un asistente experto en documentos históricos y manuscritos de bibliotecas y archivos.

REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE usando la información de los fragmentos de contexto proporcionados
2. Si la respuesta NO está en los fragmentos, responde exactamente: "No aparece en los documentos proporcionados."
3. SIEMPRE cita las fuentes al final de cada afirmación usando el formato: [Fuente: {título} — p. {página}]
4. Responde en español, de forma concisa y académica (máximo 250 palabras)
5. Si hay información contradictoria entre fuentes, indícalo explícitamente
6. NO inventes, especules ni agregues conocimiento externo

FORMATO DE RESPUESTA:
- Respuesta directa a la pregunta
- Citas entre el texto cuando corresponda
- Sección final "Fuentes consultadas:" con lista de documentos citados

EJEMPLO:
Usuario: "¿Quién fue el escribano en 1582?"
Respuesta: "El escribano municipal de Sevilla en 1582 fue Juan de Medina [Fuente: Protocolo Notarial Vol. 23 — p. 47]. Este cargo lo ejerció desde abril de ese año, según consta en el registro de oficios públicos [Fuente: Registro Municipal — folio 152v].

Fuentes consultadas:
• Protocolo Notarial Vol. 23 — p. 47
• Registro Municipal — folio 152v"
"""


USER_PROMPT_TEMPLATE = """Usuario pregunta: {query}

Contexto de documentos:

{context}

Instrucciones: Responde en español, máximo 250 palabras. Cita TODAS las fuentes usando el formato [Fuente: título — p. página]. Si no hay información suficiente, responde "No aparece en los documentos proporcionados."
"""


def build_context_string(results: list[dict]) -> str:
    """
    Construir string de contexto desde resultados de vector search

    Args:
        results: Lista de chunks con metadata

    Returns:
        String formateado con contexto y fuentes
    """
    context_parts = []

    for idx, result in enumerate(results, 1):
        chunk_text = result.get("chunk_text", "")
        title = result.get("title", "Documento sin título")
        page = result.get("page_number", "?")
        confidence = result.get("ocr_confidence", 0)

        # Agregar indicador de confianza si es bajo
        confidence_note = ""
        if confidence < 0.9:
            confidence_note = f" [OCR: {confidence:.1%}]"

        context_parts.append(
            f"[{idx}] '{chunk_text}'\n"
            f"    Fuente: {title} — p. {page}{confidence_note}\n"
        )

    return "\n".join(context_parts)


def build_user_prompt(query: str, results: list[dict]) -> str:
    """
    Construir prompt completo para el usuario

    Args:
        query: Pregunta del usuario
        results: Lista de chunks relevantes

    Returns:
        Prompt formateado
    """
    context = build_context_string(results)
    return USER_PROMPT_TEMPLATE.format(query=query, context=context)


def build_full_prompt(query: str, results: list[dict]) -> tuple[str, str]:
    """
    Construir sistema + usuario prompt

    Returns:
        (system_prompt, user_prompt)
    """
    user_prompt = build_user_prompt(query, results)
    return (SYSTEM_PROMPT, user_prompt)
