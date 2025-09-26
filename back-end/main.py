"""
Main FastAPI application with refactored structure.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.database import init_db
from api.pdf_routes import router as pdf_router
from api.template_routes import router as template_router
from api.websocket import router as websocket_router

# Create FastAPI app
app = FastAPI(
    title="Agentic Pharma API",
    description="AI-powered document processing and template filling",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Include routers
app.include_router(pdf_router)
app.include_router(template_router)
app.include_router(websocket_router)

# Health check endpoint
@app.get("/")
def root():
    return {"message": "Agentic Pharma API is running", "status": "healthy"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}