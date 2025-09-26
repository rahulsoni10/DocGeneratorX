from llama_index.core import Document
from llama_index.core.node_parser.text.token import TokenTextSplitter
from .models import Image
import uuid
from sqlmodel import Session
from services.llm_service import LLMService


def text_n_images(data, document_id, session: Session):
    documents = []
    splitter = TokenTextSplitter(chunk_size=256, chunk_overlap=50)

    # Process text chunks
    for component in data:
        text = data[component]['text']
        chunks = splitter.split_text(text)
        for chunk in chunks:
            doc = Document(text=chunk, metadata={'page_label': component, "type": "text"})
            documents.append(doc)

    # Process images with multimodal MyGenAssist
    img_docs = []
    llm_service = LLMService()
    
    for component in data:
        images = data[component]['images']
        for img in images:
            image_prompt = "Please describe this image in at most 200 words, focusing on key details and semantic meaning."
            desc = llm_service.query_multimodal(img["base64"], image_prompt)
            if not desc:
                desc = "[Description unavailable due to API error]"

            image_uuid = str(uuid.uuid4())
            doc = Document(text=desc, metadata={'page_label': component, "type": "image", "image_uuid": image_uuid})
            img_docs.append(doc)

            # Save image locally in database
            img_record = Image(document_id=document_id, image_id=image_uuid, image_b64=img["base64"])
            session.add(img_record)
    documents.extend(img_docs)
    session.commit()

    # Process tables
    table_docs = []
    for component in data:
        table_base64 = data[component]['tables']
        if table_base64:
            for table in table_base64:
                md_str = table["md"]
                table_docs.append(Document(text=str(md_str), metadata={'page_label': component, "type": "table"}))
    documents.extend(table_docs)

    return documents
