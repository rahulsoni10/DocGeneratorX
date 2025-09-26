"""
PDF upload and management routes.
"""
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import tempfile
import shutil
import uuid
import os
from starlette.concurrency import run_in_threadpool
from utils.database import get_session
from utils.models import PDFS
from services.retrieval_service import RetrievalService
from parsers.pdf_parser import PDFParser
from utils.chunker import text_n_images

router = APIRouter(prefix="/api/pdf", tags=["pdf"])


@router.post("/upload")
async def upload_pdfs(
    files: List[UploadFile] = File(...), 
    session: Session = Depends(get_session)
):
    """Upload PDFs, parse and store embeddings."""
    response = []
    
    for file in files:
        # Check if PDF already exists
        existing_pdf = session.exec(select(PDFS).where(PDFS.pdf_file_name == file.filename)).first()
        if existing_pdf:
            raise HTTPException(
                status_code=400,
                detail="A PDF with the same file name already exists. Please either delete the existing PDF or rename the current one before uploading."
            )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_file_path = tmp.name

        try:
            tmp_id = "".join(str(uuid.uuid4()).split("-"))
            
            # Parse PDF content
            pdf_parser = PDFParser()
            data, num_images, num_tables = await pdf_parser.extract_pdf_content(temp_file_path)
            
            # Process and chunk content
            docs = text_n_images(data, tmp_id, session)
            
            # Store in vector database using the original working method
            from utils.retriver import Retriver
            retriever = Retriver(document_id=tmp_id, path=temp_file_path)
            await retriever.upsert(session)

            # Save PDF record
            pdf = PDFS(pdf_file_name=file.filename, pdf_uuid=tmp_id)
            await run_in_threadpool(session.add, pdf)
            await run_in_threadpool(session.commit)

            response.append({"filename": file.filename, "file_uuid": tmp_id})

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing {file.filename}: {str(e)}")

        finally:
            await run_in_threadpool(os.remove, temp_file_path)

    return response


@router.get("/list")
def get_all_pdfs(session: Session = Depends(get_session)):
    """Get all uploaded PDFs."""
    all_pdfs = session.exec(select(PDFS)).all()
    return [{"pdf_file_name": pdf.pdf_file_name, "pdf_uuid": pdf.pdf_uuid} for pdf in all_pdfs]


@router.delete("/{pdf_uuid}")
def delete_pdf(pdf_uuid: str, session: Session = Depends(get_session)):
    """Delete a specific PDF and its embeddings."""
    pdf_to_delete = session.exec(select(PDFS).where(PDFS.pdf_uuid == pdf_uuid)).first()
    if pdf_to_delete:
        retrieval_service = RetrievalService(document_id=pdf_uuid)
        retrieval_service.delete_collection()
        session.delete(pdf_to_delete)
        session.commit()
        return {"message": f"PDF '{pdf_uuid}' and its embeddings deleted successfully."}
    raise HTTPException(status_code=404, detail=f"No PDF found with UUID '{pdf_uuid}'.")


@router.delete("/")
def delete_all_pdfs(session: Session = Depends(get_session)):
    """Delete all PDFs and their embeddings."""
    all_pdfs = session.exec(select(PDFS)).all()
    for pdf in all_pdfs:
        retrieval_service = RetrievalService(document_id=pdf.pdf_uuid)
        retrieval_service.delete_collection()
        session.delete(pdf)
    session.commit()
    return {"message": "All PDFs and their embeddings deleted successfully."}
