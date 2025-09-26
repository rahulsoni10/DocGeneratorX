import requests
from llama_index.core import PromptTemplate
from dotenv import load_dotenv
import os
import base64
from io import BytesIO
from PIL import Image

load_dotenv()

MYGENASSIST_API_URL = "https://chat.int.bayer.com/api/v2/chat/completions"
API_KEY = os.getenv("MYGENASSIST_API_KEY")

PROMPT = """
You are an advanced AI assistant specialized in filling placeholders in a .docx template using the provided context.  

You will be given:
1. Placeholder text
2. Retrieved context via RAG
3. Information about whether the placeholder is inside a table or a section
4. User Prompt: additional user-provided input that may help fill the placeholder
5. Process Flow: user-provided input (as image, already summarized into text) that may also help

Your task is to generate plain text that directly replaces the placeholder. Do not add Markdown, symbols, or extra formatting.  

**Inputs:**  
1. Placeholder Text: {user_query}  
2. Retrieved Nodes: {relevant_docs}  
3. Chat History: {chat_history}  
4. Context Type: {context_type}  # either "table" or "section"  
5. User Prompt: {user_prompt}  
6. Process Flow: {flow}  

---

**Rules by Context Type:**  
- If Context Type = "table": keep the response concise (1–3 sentences or short bullet points).  
- If Context Type = "section": provide a detailed, structured, and exhaustive response.  

---

**Response Guidelines:**  
- Output only the replacement text (no headers, no references, no formatting).  
- Incorporate User Prompt and Process Flow if they provide relevant context.  
- If information is missing, use reasonable domain knowledge to complete the response.  

---

**Final Checklist:**  
✅ Output plain text only  
✅ Match detail level to context type  
✅ Do not use Markdown, asterisks, or symbols  
"""

def query_mygenassist(prompt, image_b64: str = None):
    """
    Queries MyGenAssist LLM.
    If image_b64 is provided, sends a multimodal request with image + prompt.
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    message_content = {"role": "user", "content": prompt}

    data = {
        "model": "gpt-4o",
        "messages": [            
            {
                "role": "user",
                "content": prompt,
                "image": image_b64  # send base64 image
            }],
        "max_tokens": 10000,
        "temperature": 0
    }

    response = requests.post(MYGENASSIST_API_URL, headers=headers, json=data)
    if response.status_code == 200:
        return response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None


def generate_response(docs, query, chat_history, context_type, user_prompt, flow):
    relevant_docs = []
    for doc in docs:
        if doc.metadata["type"] == "text":
            relevant_docs.append(f"document_id : {doc.node_id} \n\n {doc.text}")
        elif doc.metadata["type"] == "image":
            relevant_docs.append(f"image_id : {doc.metadata['image_uuid']} \n\n {doc.text}")
        else:
            relevant_docs.append(f"table_id: {doc.node_id} \n\n {doc.text}")

    print("\n[Relevant Docs]:", relevant_docs)

    prompt_template = PromptTemplate(PROMPT)
    qa_prompt = prompt_template.format(
        relevant_docs=relevant_docs,
        user_query=query,
        chat_history=chat_history,
        context_type=context_type,
        user_prompt=user_prompt,
        flow=flow
    )

    print("\n[Final Prompt Sent to LLM]:\n", qa_prompt)

    # If the flow includes an image, pass the base64
    image_base64 = None
    if flow and flow.startswith("data:image/"):  # basic check
        image_base64 = flow.split(",")[1]

    resp = query_mygenassist(qa_prompt, image_base64)
    if resp:
        resp = str(resp).removeprefix("```json").removesuffix('```')
    return resp


def generate_process_flow_description(process_flow_base64: str) -> str:
    """
    Converts Base64 string back to image and generates description via LLM.
    """
    # Convert Base64 to bytes
    process_flow_bytes = base64.b64decode(process_flow_base64)
    image = Image.open(BytesIO(process_flow_bytes))

    # Optional: Convert back to base64 for multimodal LLM
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    # Construct prompt
    prompt = "Describe the following process flow image in detail."

    # Call LLM with image
    description = query_mygenassist(prompt, img_base64)
    return description