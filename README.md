# Agentic Pharma - AI-Powered Document Processing

A full-stack application for AI-powered document processing and template filling using RAG (Retrieval-Augmented Generation) with pgvector, FastAPI, and React.

## 🚀 Features

- **PDF Upload & Processing**: Upload PDFs and automatically extract text, images, and tables using LlamaParse
- **Vector Database**: Store and retrieve document embeddings using pgvector
- **Template Filling**: Fill .docx templates with AI-generated content based on uploaded documents
- **Real-time Progress**: WebSocket-based real-time progress updates during template processing
- **Modern UI**: React frontend with Material-UI and real-time notifications
- **Improved LLM Prompts**: Enhanced prompt templates for better content generation quality

## 📁 Project Structure

```
/backend
  main.py                    # FastAPI application
  /api
    pdf_routes.py           # PDF upload and management endpoints
    template_routes.py      # Template processing endpoints
    websocket.py            # WebSocket endpoints for real-time updates
  /services
    embeddings_service.py   # MyGenAssist embeddings service
    retrieval_service.py    # Document retrieval from pgvector
    llm_service.py         # LLM interactions with MyGenAssist
    template_filler.py     # Template filling logic
  /parsers
    pdf_parser.py          # PDF parsing using LlamaParse
    docx_parser.py         # DOCX parsing utilities
  /utils
    config.py              # Configuration management
    prompt_templates.py    # Improved LLM prompt templates
    database.py            # Database connection
    models.py              # SQLModel database models
    chunker.py             # Document chunking logic
  /generated               # Output folder for generated files

/frontend
  /src
    /components
      FileUpload.js        # File upload component
      FileProgressList.js  # Progress tracking component
      ResponseDisplay.js   # Response display component
      DropDown.js          # Template selection dropdown
    App.js                 # Main application component
    main.tsx               # Application entry point
  tailwind.config.js       # Tailwind CSS configuration
```

## 🛠️ Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL with pgvector extension
- MyGenAssist API key
- LlamaParse API key

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd back-end
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `back-end` directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/your_database
   PGVECTOR_HOST=postgresql://username:password@localhost:5432/your_database
   MYGENASSIST_API_KEY=your_mygenassist_api_key
   LLAMAPARSE_API_KEY=your_llamaparse_api_key
   ```

3. **Start the backend server:**
   ```bash
   cd back-end
   python test_server.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   cd front-end
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## 🔧 API Endpoints

### PDF Management
- `POST /api/pdf/upload` - Upload PDFs for processing
- `GET /api/pdf/list` - List all uploaded PDFs
- `DELETE /api/pdf/{pdf_uuid}` - Delete a specific PDF
- `DELETE /api/pdf/` - Delete all PDFs

### Template Processing
- `POST /api/template/fill` - Start template filling process
- `GET /api/template/progress/{task_id}` - Get processing progress
- `GET /api/template/download/{filename}` - Download generated file

### WebSocket
- `WS /api/ws/progress/{task_id}` - Real-time progress updates

## 🎯 Usage

1. **Upload Content Files**: Upload PDF documents that will be used as knowledge base
2. **Select Template Package**: Choose from available template folders
3. **Upload Process/Workflow**: Optionally upload process flow images
4. **Add Additional Content**: Provide any additional instructions
5. **Generate Documents**: Click "Generate GXP Compliant Documents" to start processing
6. **Monitor Progress**: Watch real-time progress updates and download files as they're generated

## 🔄 Real-time Features

- **Progress Tracking**: Real-time progress updates via WebSocket
- **Toast Notifications**: Instant notifications when files are generated
- **Individual Downloads**: Download files immediately as they're completed
- **Batch Download**: Download all files at once when processing is complete

## 🧠 AI Features

- **Improved Prompts**: Enhanced prompt templates for better content generation
- **Context-Aware Filling**: Different handling for table vs section contexts
- **Multimodal Processing**: Support for images in process flows
- **RAG Integration**: Retrieval-augmented generation using document embeddings

## 🚀 Demo Ready

The application is now refactored and ready for demonstration with:

- ✅ Clean, modular backend architecture
- ✅ Real-time WebSocket progress updates
- ✅ Improved LLM prompt templates
- ✅ Modern React frontend with progress tracking
- ✅ Toast notifications for user feedback
- ✅ Individual and batch file downloads
- ✅ Error handling and user feedback

## 🔧 Configuration

The application uses the following environment variables:

- `DATABASE_URL`: PostgreSQL database connection string
- `PGVECTOR_HOST`: pgvector database connection
- `MYGENASSIST_API_KEY`: MyGenAssist API key for LLM and embeddings
- `LLAMAPARSE_API_KEY`: LlamaParse API key for PDF processing

## 📝 Notes

- The application maintains the existing pgvector setup
- All existing functionality is preserved but refactored for better structure
- WebSocket support provides real-time updates during template processing
- Improved prompt templates enhance content generation quality
- The frontend now includes progress tracking and real-time notifications