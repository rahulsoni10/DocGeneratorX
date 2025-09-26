"""
Template processing routes.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session
from pydantic import BaseModel
from typing import Optional
import os
import uuid
import asyncio
from utils.database import get_session
from services.template_filler import TemplateFiller, extract_placeholders, retrieve_placeholder_content
from services.llm_service import LLMService
from utils.config import INPUT_FOLDER, GENERATED_FOLDER
from docx import Document
from api.websocket import broadcast_progress_update

router = APIRouter(prefix="/api/template", tags=["template"])


class TemplateRequest(BaseModel):
    folder_name: str
    user_prompt: Optional[str] = ""
    process_flow: Optional[str] = ""


class TemplateResponse(BaseModel):
    task_id: str
    message: str


# Store for tracking template processing tasks
template_tasks = {}


@router.post("/fill", response_model=TemplateResponse)
def start_template_filling(
    request: TemplateRequest, 
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """Start template filling process and return task ID."""
    folder_name = request.folder_name
    folder_path = os.path.join(INPUT_FOLDER, folder_name)

    if not os.path.exists(folder_path) or not os.path.isdir(folder_path):
        raise HTTPException(status_code=404, detail=f"Folder '{folder_name}' not found in inputs")

    # Generate unique task ID
    task_id = str(uuid.uuid4())
    
    # Initialize task tracking
    template_tasks[task_id] = {
        "status": "processing",
        "files_done": 0,
        "files_total": 0,
        "generated_files": []
    }

    # Start background processing
    background_tasks.add_task(
        process_templates_background,
        task_id,
        folder_path,
        request.user_prompt,
        request.process_flow,
        session
    )

    return TemplateResponse(
        task_id=task_id,
        message="Template processing started"
    )


async def process_templates_background(
    task_id: str,
    folder_path: str,
    user_prompt: str,
    process_flow: str,
    session: Session
):
    """Background task to process templates."""
    try:
        # Generate process flow description if provided
        process_flow_description = None
        if process_flow:
            llm_service = LLMService()
            process_flow_description = llm_service.generate_process_flow_description(process_flow)

        # Get all .docx files in folder
        docx_files = [f for f in os.listdir(folder_path) if f.endswith(".docx")]
        template_tasks[task_id]["files_total"] = len(docx_files)

        # Process each template
        for file_name in docx_files:
            try:
                file_path = os.path.join(folder_path, file_name)
                doc = Document(file_path)
                placeholders = extract_placeholders(doc)
                filler = TemplateFiller()

                # Create retrieve function with context
                def retrieve_fn(ph, context_type):
                    return retrieve_placeholder_content(
                        ph,
                        context_type,
                        session,
                        user_prompt=user_prompt,
                        process_flow=process_flow_description
                    )

                # Fill placeholders
                filled_doc = filler.fill_placeholders(doc, placeholders, retrieve_fn)

                # Save filled document
                output_filename = f"filled_{file_name}"
                output_path = os.path.join(GENERATED_FOLDER, output_filename)
                filled_doc.save(output_path)

                # Update task progress
                template_tasks[task_id]["files_done"] += 1
                template_tasks[task_id]["generated_files"].append({
                    "fileName": output_filename,
                    "status": "done",
                    "downloadUrl": f"/api/template/download/{output_filename}"
                })
                
                # Send WebSocket progress update
                progress_update = {
                    "fileName": output_filename,
                    "status": "done",
                    "downloadUrl": f"/api/template/download/{output_filename}",
                    "filesDone": template_tasks[task_id]["files_done"],
                    "filesTotal": template_tasks[task_id]["files_total"]
                }
                await broadcast_progress_update(task_id, progress_update)

            except Exception as e:
                print(f"Error processing {file_name}: {e}")
                template_tasks[task_id]["generated_files"].append({
                    "fileName": file_name,
                    "status": "error",
                    "downloadUrl": None
                })

        # Mark task as completed
        template_tasks[task_id]["status"] = "completed"

    except Exception as e:
        template_tasks[task_id]["status"] = "error"
        print(f"Background task error: {e}")


@router.get("/progress/{task_id}")
def get_template_progress(task_id: str):
    """Get progress of template processing task."""
    if task_id not in template_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = template_tasks[task_id]
    return {
        "task_id": task_id,
        "status": task["status"],
        "files_done": task["files_done"],
        "files_total": task["files_total"],
        "generated_files": task["generated_files"]
    }


@router.get("/download/{filename}")
def download_generated_file(filename: str):
    """Download a generated template file."""
    file_path = os.path.join(GENERATED_FOLDER, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
