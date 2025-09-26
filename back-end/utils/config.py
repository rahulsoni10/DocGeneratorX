import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.environ.get("DATABASE_URL")

# API Configuration
MYGENASSIST_API_KEY = os.getenv("MYGENASSIST_API_KEY")
MYGENASSIST_API_URL = "https://chat.int.bayer.com/api/v2/chat/completions"
MYGENASSIST_EMBEDDINGS_URL = "https://chat.int.bayer.com/api/v2/embeddings"

# LlamaParse Configuration
LLAMAPARSE_API_KEY = os.getenv("LLAMAPARSE_API_KEY")

# PgVector Configuration
PGVECTOR_HOST = os.getenv('PGVECTOR_HOST')

# File paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_FOLDER = os.path.join(BASE_DIR, "inputs")
GENERATED_FOLDER = os.path.join(BASE_DIR, "generated")

# Ensure generated folder exists
os.makedirs(GENERATED_FOLDER, exist_ok=True)
