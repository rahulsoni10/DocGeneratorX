"""
Simple test script to verify the backend can start.
"""
import uvicorn
from main import app

if __name__ == "__main__":
    print("Starting test server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
