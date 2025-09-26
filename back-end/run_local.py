"""
Local development server runner without Docker.
This avoids Docker Hub rate limiting issues.
"""
import uvicorn
import os
import sys
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from main import app

if __name__ == "__main__":
    print("🚀 Starting Agentic Pharma Backend Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔌 WebSocket support enabled")
    print("=" * 50)
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        log_level="info",
        reload=True  # Auto-reload on code changes
    )
