"""
Improved prompt templates for better content generation quality.
"""

IMPROVED_PROMPT_TEMPLATE = """
You are an advanced AI assistant specialized in filling placeholders in .docx templates using provided context.

Inputs:
1. Placeholder Text: {placeholder}
2. Retrieved Chunks: {retrieved}
3. Context Type: {context_type} (table or section)
4. User Context: {user_context}
5. Process Flow Summary: {flow_summary}

Rules:
- If context_type=table → produce concise 1–3 sentences or short bullets.
- If context_type=section → produce detailed, structured text.
- Output plain text only (no markdown, no asterisks).
- Incorporate user context and flow summary if relevant.
- If info missing, use reasonable domain knowledge.
"""

def format_retrieved_chunks(docs):
    """Format retrieved documents for better LLM consumption."""
    formatted_chunks = []
    
    for doc in docs:
        if hasattr(doc, 'metadata') and doc.metadata.get("type") == "text":
            formatted_chunks.append(f"Document: {doc.text}")
        elif hasattr(doc, 'metadata') and doc.metadata.get("type") == "image":
            formatted_chunks.append(f"Image Description: {doc.text}")
        elif hasattr(doc, 'metadata') and doc.metadata.get("type") == "table":
            formatted_chunks.append(f"Table Data: {doc.text}")
        else:
            formatted_chunks.append(f"Content: {doc.text}")
    
    return "\n\n".join(formatted_chunks)
